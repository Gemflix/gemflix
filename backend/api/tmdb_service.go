package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"

	db "proyecto-go/db/sqlc"
	"proyecto-go/utils"

	"github.com/jackc/pgx/v5/pgtype"
)

func normalizeProviderName(name string) string {
	switch name {
	case "Disney Plus":
		return "Disney+"
	case "Amazon Prime Video":
		return "Prime Video"
	case "Paramount Plus":
		return "Paramount+"
	default:
		return name
	}
}

func shouldSkipProvider(name string) bool {
	n := strings.ToLower(name)
	skipKeywords := []string{
		"amazon channel",
		"apple tv channel",
		"with ads",
		"con anuncios",
		"plus premium",
	}
	for _, kw := range skipKeywords {
		if strings.Contains(n, kw) {
			return true
		}
	}
	return false
}

type TMDBCredits struct {
	Cast []struct {
		Id                 int64   `json:"id"`
		Name               string  `json:"name"`
		OriginalName       string  `json:"original_name"`
		Gender             int16   `json:"gender"`
		ProfilePath        string  `json:"profile_path"`
		KnownForDepartment string  `json:"known_for_department"`
		Popularity         float64 `json:"popularity"`
		Character          string  `json:"character"`
		Order              int16   `json:"order"`
	} `json:"cast"`
	Crew []struct {
		Id                 int64   `json:"id"`
		Name               string  `json:"name"`
		OriginalName       string  `json:"original_name"`
		Gender             int16   `json:"gender"`
		ProfilePath        string  `json:"profile_path"`
		KnownForDepartment string  `json:"known_for_department"`
		Popularity         float64 `json:"popularity"`
		Job                string  `json:"job"`
	} `json:"crew"`
}

type TMDBWatchProviders struct {
	Results map[string]struct {
		Flatrate []struct {
			ProviderId   int64  `json:"provider_id"`
			ProviderName string `json:"provider_name"`
			LogoPath     string `json:"logo_path"`
		} `json:"flatrate"`
	} `json:"results"`
}

type TMDBGenre struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type TMDBCollection struct {
	Id           int64  `json:"id"`
	Name         string `json:"name"`
	PosterPath   string `json:"poster_path"`
	BackdropPath string `json:"backdrop_path"`
}

type TMDBCountry struct {
	Iso3166_1 string `json:"iso_3166_1"`
	Name      string `json:"name"`
}

type TMDBSeasonInfo struct {
	Id           int64  `json:"id"`
	SeasonNumber int16  `json:"season_number"`
	Name         string `json:"name"`
	EpisodeCount int    `json:"episode_count"`
	PosterPath   string `json:"poster_path"`
	Overview     string `json:"overview"`
	AirDate      string `json:"air_date"`
}

// SyncMovieRelations sincroniza géneros, cast, networks, colecciones y paises
func SyncMovieRelations(ctx context.Context, queries *db.Queries, movieId int64, tmdbId int64, genres []TMDBGenre, credits TMDBCredits, providers TMDBWatchProviders, collection *TMDBCollection, countries []TMDBCountry) {
	// 1. Genres
	for _, g := range genres {
		nameEng := g.Name
		nameEsp := g.Name
		
		translated := TranslateNameWithAI(ctx, g.Name, "English")
		if translated != "" && translated != g.Name {
			nameEng = translated
		} else {
			translatedEsp := TranslateNameWithAI(ctx, g.Name, "Spanish")
			if translatedEsp != "" && translatedEsp != g.Name {
				nameEsp = translatedEsp
			}
		}

		gid, err := queries.UpsertGenre(ctx, db.UpsertGenreParams{
			TmdbID:  pgtype.Int8{Int64: g.Id, Valid: true},
			NameEng: nameEng,
			NameEsp: pgtype.Text{String: nameEsp, Valid: nameEsp != ""},
			Slug:    utils.Slugify(nameEng),
		})
		if err == nil {
			queries.InsertMovieGenre(ctx, db.InsertMovieGenreParams{MovieID: movieId, GenreID: gid})
		}
	}

	// 1.5 Countries
	for _, c := range countries {
		if c.Iso3166_1 != "" {
			countryId, err := queries.UpsertCountry(ctx, db.UpsertCountryParams{
				Name:        c.Name,
				EnglishName: pgtype.Text{String: c.Name, Valid: true},
				Iso31661:    c.Iso3166_1,
			})
			if err == nil {
				queries.InsertMovieCountry(ctx, db.InsertMovieCountryParams{
					MovieID:   movieId,
					CountryID: countryId,
				})
			}
		}
	}

	// 2. Cast (Top 15) Actores)
	sort.Slice(credits.Cast, func(i, j int) bool {
		return credits.Cast[i].Order < credits.Cast[j].Order
	})
	limit := 15
	if len(credits.Cast) < 15 {
		limit = len(credits.Cast)
	}

	for i := 0; i < limit; i++ {
		c := credits.Cast[i]
		cid, err := queries.UpsertCast(ctx, db.UpsertCastParams{
			TmdbID:             pgtype.Int8{Int64: c.Id, Valid: true},
			Name:               c.Name,
			OriginalName:       pgtype.Text{String: c.OriginalName, Valid: c.OriginalName != ""},
			Gender:             pgtype.Int2{Int16: c.Gender, Valid: true},
			ProfilePath:        pgtype.Text{String: c.ProfilePath, Valid: c.ProfilePath != ""},
			KnownForDepartment: pgtype.Text{String: c.KnownForDepartment, Valid: c.KnownForDepartment != ""},
		})
		if err == nil {
			queries.InsertMovieCast(ctx, db.InsertMovieCastParams{
				MovieID:       movieId,
				CastID:        cid,
				CharacterName: pgtype.Text{String: c.Character, Valid: c.Character != ""},
				Job:           pgtype.Text{String: "Actor", Valid: true},
				SortOrder:     int16(i),
			})
			go fetchAndSaveCastDetails(context.Background(), queries, c.Id)
		}
	}

	// 3. Crew (Top 5 Directores/Productores)
	crewCount := 0
	for _, c := range credits.Crew {
		if c.Job == "Director" || c.Job == "Producer" || c.Job == "Writer" {
			cid, err := queries.UpsertCast(ctx, db.UpsertCastParams{
				TmdbID:             pgtype.Int8{Int64: c.Id, Valid: true},
				Name:               c.Name,
				OriginalName:       pgtype.Text{String: c.OriginalName, Valid: c.OriginalName != ""},
				Gender:             pgtype.Int2{Int16: c.Gender, Valid: true},
				ProfilePath:        pgtype.Text{String: c.ProfilePath, Valid: c.ProfilePath != ""},
				KnownForDepartment: pgtype.Text{String: c.KnownForDepartment, Valid: c.KnownForDepartment != ""},
			})
			if err == nil {
				queries.InsertMovieCast(ctx, db.InsertMovieCastParams{
					MovieID:       movieId,
					CastID:        cid,
					CharacterName: pgtype.Text{String: "", Valid: false},
					Job:           pgtype.Text{String: c.Job, Valid: true},
					SortOrder:     int16(crewCount + 100), // Crew goes after actors
				})
				go fetchAndSaveCastDetails(context.Background(), queries, c.Id)
			}
			crewCount++
			if crewCount >= 5 {
				break
			}
		}
	}

	// 4. Networks (Providers Flatrate MX o US)
	mxProviders, ok := providers.Results["MX"]
	if !ok {
		mxProviders, _ = providers.Results["US"]
	}

	for _, p := range mxProviders.Flatrate {
		if shouldSkipProvider(p.ProviderName) {
			continue
		}
		providerName := normalizeProviderName(p.ProviderName)

		nid, err := queries.UpsertNetwork(ctx, db.UpsertNetworkParams{
			TmdbID:     pgtype.Int8{Int64: p.ProviderId, Valid: true},
			Name:       providerName,
			Slug:       utils.Slugify(providerName),
			PosterPath: pgtype.Text{String: p.LogoPath, Valid: p.LogoPath != ""},
		})
		if err == nil {
			queries.InsertMovieNetwork(ctx, db.InsertMovieNetworkParams{MovieID: movieId, NetworkID: nid})
		}
	}

	// 5. Collection
	if collection != nil && collection.Id > 0 {
		nameEng, nameLat, nameEsp, overview, backdrop := FetchCollectionDetailsSync(collection.Id)

		slugBase := nameEng
		if slugBase == "" { slugBase = nameLat }
		if slugBase == "" { slugBase = nameEsp }
		if slugBase == "" { slugBase = collection.Name }

		colid, err := queries.UpsertCollection(ctx, db.UpsertCollectionParams{
			TmdbID:       pgtype.Int8{Int64: collection.Id, Valid: true},
			OriginalName: collection.Name,
			NameEng:      pgtype.Text{String: nameEng, Valid: nameEng != ""},
			NameLat:      pgtype.Text{String: nameLat, Valid: nameLat != ""},
			NameEsp:      pgtype.Text{String: nameEsp, Valid: nameEsp != ""},
			Overview:     pgtype.Text{String: overview, Valid: overview != ""},
			PosterPath:   pgtype.Text{String: collection.PosterPath, Valid: collection.PosterPath != ""},
			BackdropPath: pgtype.Text{String: backdrop, Valid: backdrop != ""},
			Slug:         utils.Slugify(slugBase),
		})
		if err == nil {
			queries.InsertMovieCollection(ctx, db.InsertMovieCollectionParams{MovieID: movieId, CollectionID: colid})
		}
	}
}

// SyncSerieRelations
func SyncSerieRelations(ctx context.Context, queries *db.Queries, serieId int64, tmdbId int64, genres []TMDBGenre, credits TMDBCredits, providers TMDBWatchProviders, countries []TMDBCountry) {
	// Igual que pelÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­culas pero para series (serie_genres, serie_casts, serie_networks)
	for _, g := range genres {
		nameEng := g.Name
		nameEsp := g.Name
		
		translated := TranslateNameWithAI(ctx, g.Name, "English")
		if translated != "" && translated != g.Name {
			nameEng = translated
		} else {
			translatedEsp := TranslateNameWithAI(ctx, g.Name, "Spanish")
			if translatedEsp != "" && translatedEsp != g.Name {
				nameEsp = translatedEsp
			}
		}

		gid, err := queries.UpsertGenre(ctx, db.UpsertGenreParams{
			TmdbID:  pgtype.Int8{Int64: g.Id, Valid: true},
			NameEng: nameEng,
			NameEsp: pgtype.Text{String: nameEsp, Valid: nameEsp != ""},
			Slug:    utils.Slugify(nameEng),
		})
		if err == nil {
			queries.InsertSerieGenre(ctx, db.InsertSerieGenreParams{SerieID: serieId, GenreID: gid})
		}
	}

	// 1.5 Countries
	for _, c := range countries {
		if c.Iso3166_1 != "" {
			countryId, err := queries.UpsertCountry(ctx, db.UpsertCountryParams{
				Name:        c.Name,
				EnglishName: pgtype.Text{String: c.Name, Valid: true},
				Iso31661:    c.Iso3166_1,
			})
			if err == nil {
				queries.InsertSerieCountry(ctx, db.InsertSerieCountryParams{
					SerieID:   serieId,
					CountryID: countryId,
				})
			}
		}
	}

	// Casts
	sort.Slice(credits.Cast, func(i, j int) bool {
		return credits.Cast[i].Order < credits.Cast[j].Order
	})
	limit := 15
	if len(credits.Cast) < 15 {
		limit = len(credits.Cast)
	}

	for i := 0; i < limit; i++ {
		c := credits.Cast[i]
		cid, err := queries.UpsertCast(ctx, db.UpsertCastParams{
			TmdbID:             pgtype.Int8{Int64: c.Id, Valid: true},
			Name:               c.Name,
			OriginalName:       pgtype.Text{String: c.OriginalName, Valid: c.OriginalName != ""},
			Gender:             pgtype.Int2{Int16: c.Gender, Valid: true},
			ProfilePath:        pgtype.Text{String: c.ProfilePath, Valid: c.ProfilePath != ""},
			KnownForDepartment: pgtype.Text{String: c.KnownForDepartment, Valid: c.KnownForDepartment != ""},
		})
		if err == nil {
			queries.InsertSerieCast(ctx, db.InsertSerieCastParams{
				SerieID:       serieId,
				CastID:        cid,
				CharacterName: pgtype.Text{String: c.Character, Valid: c.Character != ""},
				Job:           pgtype.Text{String: "Actor", Valid: true},
				SortOrder:     int16(i),
			})
			go fetchAndSaveCastDetails(context.Background(), queries, c.Id)
		}
	}

	// Crew (Top 5)
	crewCount := 0
	for _, c := range credits.Crew {
		if c.Job == "Executive Producer" || c.Job == "Producer" || c.Job == "Writer" {
			cid, err := queries.UpsertCast(ctx, db.UpsertCastParams{
				TmdbID:             pgtype.Int8{Int64: c.Id, Valid: true},
				Name:               c.Name,
				OriginalName:       pgtype.Text{String: c.OriginalName, Valid: c.OriginalName != ""},
				Gender:             pgtype.Int2{Int16: c.Gender, Valid: true},
				ProfilePath:        pgtype.Text{String: c.ProfilePath, Valid: c.ProfilePath != ""},
				KnownForDepartment: pgtype.Text{String: c.KnownForDepartment, Valid: c.KnownForDepartment != ""},
			})
			if err == nil {
				queries.InsertSerieCast(ctx, db.InsertSerieCastParams{
					SerieID:   serieId,
					CastID:    cid,
					Job:       pgtype.Text{String: c.Job, Valid: true},
					SortOrder: int16(crewCount + 100),
				})
				go fetchAndSaveCastDetails(context.Background(), queries, c.Id)
			}
			crewCount++
			if crewCount >= 5 {
				break
			}
		}
	}

	// Networks
	mxProviders, ok := providers.Results["MX"]
	if !ok {
		mxProviders, _ = providers.Results["US"]
	}

	for _, p := range mxProviders.Flatrate {
		if shouldSkipProvider(p.ProviderName) {
			continue
		}
		providerName := normalizeProviderName(p.ProviderName)

		nid, err := queries.UpsertNetwork(ctx, db.UpsertNetworkParams{
			TmdbID:     pgtype.Int8{Int64: p.ProviderId, Valid: true},
			Name:       providerName,
			Slug:       utils.Slugify(providerName),
			PosterPath: pgtype.Text{String: p.LogoPath, Valid: p.LogoPath != ""},
		})
		if err == nil {
			queries.InsertSerieNetwork(ctx, db.InsertSerieNetworkParams{SerieID: serieId, NetworkID: nid})
		}
	}
}

func SyncMediaImages(ctx context.Context, queries *db.Queries, tmdbID int64, entityID int64, mediaType string, tmdbPoster string, tmdbBackdrop string) {
	insertImg := func(imgPath, imgType, src, lang string, main bool) {
		params := db.InsertMediaImageParams{
			FilePath:    imgPath,
			Type:        imgType,
			Source:      src,
			LanguageIso: pgtype.Text{String: lang, Valid: lang != ""},
			IsMain:      main,
		}
		switch mediaType {
		case "movie":
			params.MovieID = pgtype.Int8{Int64: entityID, Valid: true}
		case "serie":
			params.SerieID = pgtype.Int8{Int64: entityID, Valid: true}
		}
		queries.InsertMediaImage(ctx, params)
	}

	if tmdbPoster != "" {
		insertImg(tmdbPoster, "poster", "tmdb", "", true)
	}
	if tmdbBackdrop != "" {
		insertImg(tmdbBackdrop, "backdrop", "tmdb", "", true)
	}
}

// SyncSerieSeasons sincroniza las temporadas y episodios de una serie desde TMDB
func SyncSerieSeasons(ctx context.Context, queries *db.Queries, serieId int64, tmdbId int64, seasons []TMDBSeasonInfo) {
	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		return
	}

	for _, s := range seasons {
		var airDate pgtype.Date
		if s.AirDate != "" {
			airDate.Scan(s.AirDate)
		}

		seasonID, err := queries.UpsertSerieSeason(ctx, db.UpsertSerieSeasonParams{
			TmdbID:       pgtype.Int8{Int64: s.Id, Valid: true},
			SerieID:      serieId,
			SeasonNumber: s.SeasonNumber,
			Name:         s.Name,
			Overview:     pgtype.Text{String: s.Overview, Valid: s.Overview != ""},
			PosterPath:   pgtype.Text{String: s.PosterPath, Valid: s.PosterPath != ""},
			AirDate:      airDate,
		})
		if err != nil {
			continue
		}

		// fetch episodes
		seasonURL := fmt.Sprintf("https://api.themoviedb.org/3/tv/%d/season/%d?api_key=%s&language=es-MX", tmdbId, s.SeasonNumber, tmdbAPIKey)
		resp, err := http.Get(seasonURL)
		if err != nil || resp.StatusCode != 200 {
			if resp != nil {
				resp.Body.Close()
			}
			continue
		}

		var seasonData struct {
			Episodes []struct {
				Id            int64   `json:"id"`
				EpisodeNumber int16   `json:"episode_number"`
				Name          string  `json:"name"`
				Overview      string  `json:"overview"`
				StillPath     string  `json:"still_path"`
				VoteAverage   float64 `json:"vote_average"`
				VoteCount     int64   `json:"vote_count"`
				AirDate       string  `json:"air_date"`
			} `json:"episodes"`
		}
		json.NewDecoder(resp.Body).Decode(&seasonData)
		resp.Body.Close()

		for _, ep := range seasonData.Episodes {
			var epAirDate pgtype.Date
			if ep.AirDate != "" {
				epAirDate.Scan(ep.AirDate)
			}

			var voteAvg pgtype.Numeric
			voteAvg.Scan(fmt.Sprintf("%f", ep.VoteAverage))

			queries.UpsertSerieEpisode(ctx, db.UpsertSerieEpisodeParams{
				TmdbID:        pgtype.Int8{Int64: ep.Id, Valid: true},
				SeasonID:      seasonID,
				EpisodeNumber: ep.EpisodeNumber,
				Name:          ep.Name,
				Overview:      pgtype.Text{String: ep.Overview, Valid: ep.Overview != ""},
				StillPath:     pgtype.Text{String: ep.StillPath, Valid: ep.StillPath != ""},
				VoteAverage:   voteAvg,
				VoteCount:     ep.VoteCount,
				AirDate:       epAirDate,
			})
		}
	}
}
