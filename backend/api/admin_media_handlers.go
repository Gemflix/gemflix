package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	db "proyecto-go/db/sqlc"
	"proyecto-go/utils"

	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) handleGetAdminSeriesList(w http.ResponseWriter, r *http.Request) {
	series, err := s.db.GetAdminSeriesList(r.Context())
	if err != nil {
		http.Error(w, "Error fetching series", http.StatusInternalServerError)
		return
	}

	if series == nil {
		series = make([]db.GetAdminSeriesListRow, 0)
	}

	response := make([]map[string]interface{}, 0)
	for _, s := range series {
		firstAirDateStr := ""
		if s.FirstAirDate.Valid {
			firstAirDateStr = s.FirstAirDate.Time.Format("2006-01-02")
		}
		response = append(response, map[string]interface{}{
			"id":             s.ID,
			"title":          s.Title,
			"first_air_date": firstAirDateStr,
			"views":          s.Views,
			"active":         s.Active,
			"premium":        s.Premium,
			"premiere":       s.Premiere,
			"upcoming":       s.Upcoming,
			"poster_path":    s.PosterPath,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Nueva estructura que recibe solo el TMDB ID desde el panel
type CreateFromTMDBReq struct {
	TmdbID int64  `json:"tmdb_id"`
	Type   string `json:"type"`   // "movie" o "serie"
	Status string `json:"status"` // "Publicado" o "Borrador"
}

func (s *Server) handleCreateMovie(w http.ResponseWriter, r *http.Request) {
	var req CreateFromTMDBReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		http.Error(w, "TMDB API Key missing on server", http.StatusInternalServerError)
		return
	}

	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/movie/%d?api_key=%s&language=es-MX&append_to_response=credits,watch/providers,translations,release_dates", req.TmdbID, tmdbAPIKey)
	resp, err := http.Get(tmdbURL)
	if err != nil || resp.StatusCode != 200 {
		http.Error(w, "Error fetching from TMDB", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var tmdbData struct {
		Id            int64   `json:"id"`
		ImdbId        string  `json:"imdb_id"`
		OriginalTitle string  `json:"original_title"`
		Title         string  `json:"title"`
		Overview      string  `json:"overview"`
		ReleaseDate   string  `json:"release_date"`
		Runtime       int16   `json:"runtime"`
		PosterPath    string  `json:"poster_path"`
		BackdropPath  string  `json:"backdrop_path"`
		Popularity    float64 `json:"popularity"`
		VoteAverage   float64 `json:"vote_average"`
		VoteCount     int64   `json:"vote_count"`

		// Relaciones
		Genres              []TMDBGenre        `json:"genres"`
		Credits             TMDBCredits        `json:"credits"`
		WatchProviders      TMDBWatchProviders `json:"watch/providers"`
		Collection          *TMDBCollection    `json:"belongs_to_collection"`
		Translations        TMDBTranslations   `json:"translations"`
		ReleaseDates        TMDBReleaseDates   `json:"release_dates"`
		ProductionCountries []TMDBCountry      `json:"production_countries"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tmdbData); err != nil {
		http.Error(w, "Error decoding TMDB response", http.StatusInternalServerError)
		return
	}

	// Map data to DB params
	var releaseDate pgtype.Date
	if tmdbData.ReleaseDate != "" {
		releaseDate.Scan(tmdbData.ReleaseDate)
	}

	// Extract titles
	latTitle, espTitle, engTitle := extractMovieTitles(tmdbData.Translations)
	if latTitle == "" {
		latTitle = tmdbData.Title
	}
	if espTitle == "" {
		espTitle = tmdbData.Title
	}
	if engTitle == "" {
		engTitle = tmdbData.OriginalTitle
	}

	// Create slug from english title ideally, then fallback
	slugBase := engTitle
	if slugBase == "" {
		slugBase = latTitle
	}
	if slugBase == "" {
		slugBase = espTitle
	}
	if slugBase == "" {
		slugBase = tmdbData.OriginalTitle
	}

	slug := utils.Slugify(slugBase)
	year := ""
	if tmdbData.ReleaseDate != "" && len(tmdbData.ReleaseDate) >= 4 {
		year = tmdbData.ReleaseDate[:4]
	}
	if year != "" {
		slug = slug + "-" + year
	}
	if slug == "" {
		slug = "movie"
	}

	baseSlug := slug
	counter := 2
	for {
		exists, err := s.db.CheckMovieSlugExists(r.Context(), slug)
		if err != nil || !exists {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	certification := extractMovieCertification(tmdbData.ReleaseDates)

	var pop, voteAvg pgtype.Numeric
	pop.Scan(fmt.Sprintf("%f", tmdbData.Popularity))
	voteAvg.Scan(fmt.Sprintf("%f", tmdbData.VoteAverage))

	params := db.CreateMovieParams{
		TmdbID:       pgtype.Int8{Int64: tmdbData.Id, Valid: true},
		ImdbID:       pgtype.Text{String: tmdbData.ImdbId, Valid: tmdbData.ImdbId != ""},
		OriginalName: tmdbData.OriginalTitle,
		TitleLat:     pgtype.Text{String: latTitle, Valid: latTitle != ""},
		TitleEsp:     pgtype.Text{String: espTitle, Valid: espTitle != ""},
		TitleEng:     pgtype.Text{String: engTitle, Valid: engTitle != ""},
		Overview:     pgtype.Text{String: tmdbData.Overview, Valid: tmdbData.Overview != ""},
		ReleaseDate:  releaseDate,
		Runtime:      pgtype.Int2{Int16: tmdbData.Runtime, Valid: tmdbData.Runtime > 0},

		VoteAverage:   voteAvg,
		VoteCount:     tmdbData.VoteCount,
		IsType:        "movie",
		Active:        req.Status == "Publicado",
		Slug:          slug,
		Certification: pgtype.Text{String: certification, Valid: certification != ""},
	}

	movie, err := s.db.CreateMovie(r.Context(), params)
	if err != nil {
		http.Error(w, "Error saving movie to DB: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Lanzar sincronizaciÃ³n de relaciones en segundo plano
	go func() {
		SyncMovieRelations(context.Background(), s.db, movie.ID, movie.TmdbID.Int64, tmdbData.Genres, tmdbData.Credits, tmdbData.WatchProviders, tmdbData.Collection, tmdbData.ProductionCountries)
		SyncMediaImages(context.Background(), s.db, movie.TmdbID.Int64, movie.ID, "movie", tmdbData.PosterPath, tmdbData.BackdropPath)
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movie)
}

func (s *Server) handleCreateSerie(w http.ResponseWriter, r *http.Request) {
	var req CreateFromTMDBReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		http.Error(w, "TMDB API Key missing", http.StatusInternalServerError)
		return
	}

	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/tv/%d?api_key=%s&language=es-MX&append_to_response=credits,watch/providers,translations,content_ratings", req.TmdbID, tmdbAPIKey)
	resp, err := http.Get(tmdbURL)
	if err != nil || resp.StatusCode != 200 {
		http.Error(w, "Error fetching from TMDB", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var tmdbData struct {
		Id             int64   `json:"id"`
		OriginalName   string  `json:"original_name"`
		Name           string  `json:"name"`
		Overview       string  `json:"overview"`
		FirstAirDate   string  `json:"first_air_date"`
		EpisodeRunTime []int16 `json:"episode_run_time"`
		PosterPath     string  `json:"poster_path"`
		BackdropPath   string  `json:"backdrop_path"`
		Popularity     float64 `json:"popularity"`
		VoteAverage    float64 `json:"vote_average"`
		VoteCount      int64   `json:"vote_count"`

		Genres              []TMDBGenre        `json:"genres"`
		Credits             TMDBCredits        `json:"credits"`
		WatchProviders      TMDBWatchProviders `json:"watch/providers"`
		Translations        TMDBTranslations   `json:"translations"`
		ContentRatings      TMDBContentRatings `json:"content_ratings"`
		ProductionCountries []TMDBCountry      `json:"production_countries"`
		Seasons             []TMDBSeasonInfo   `json:"seasons"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tmdbData); err != nil {
		http.Error(w, "Error decoding TMDB response", http.StatusInternalServerError)
		return
	}

	var firstAirDate pgtype.Date
	if tmdbData.FirstAirDate != "" {
		firstAirDate.Scan(tmdbData.FirstAirDate)
	}

	var runtime int16 = 0
	if len(tmdbData.EpisodeRunTime) > 0 {
		runtime = tmdbData.EpisodeRunTime[0]
	}

	// Extract titles
	latTitle, espTitle, engTitle := extractSerieTitles(tmdbData.Translations)
	if latTitle == "" {
		latTitle = tmdbData.Name
	}
	if espTitle == "" {
		espTitle = tmdbData.Name
	}
	if engTitle == "" {
		engTitle = tmdbData.OriginalName
	}

	// Create slug from english title ideally, then fallback
	slugBase := engTitle
	if slugBase == "" {
		slugBase = latTitle
	}
	if slugBase == "" {
		slugBase = espTitle
	}
	if slugBase == "" {
		slugBase = tmdbData.OriginalName
	}

	slug := utils.Slugify(slugBase)
	year := ""
	if tmdbData.FirstAirDate != "" && len(tmdbData.FirstAirDate) >= 4 {
		year = tmdbData.FirstAirDate[:4]
	}
	if year != "" {
		slug = slug + "-" + year
	}
	if slug == "" {
		slug = "movie"
	}

	baseSlug := slug
	counter := 2
	for {
		exists, err := s.db.CheckSerieSlugExists(r.Context(), slug)
		if err != nil || !exists {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	certification := extractSerieCertification(tmdbData.ContentRatings)

	var pop, voteAvg pgtype.Numeric
	pop.Scan(fmt.Sprintf("%f", tmdbData.Popularity))
	voteAvg.Scan(fmt.Sprintf("%f", tmdbData.VoteAverage))

	params := db.CreateSerieParams{
		TmdbID:         pgtype.Int8{Int64: tmdbData.Id, Valid: true},
		OriginalName:   tmdbData.OriginalName,
		TitleLat:       pgtype.Text{String: latTitle, Valid: latTitle != ""},
		TitleEsp:       pgtype.Text{String: espTitle, Valid: espTitle != ""},
		TitleEng:       pgtype.Text{String: engTitle, Valid: engTitle != ""},
		Overview:       pgtype.Text{String: tmdbData.Overview, Valid: tmdbData.Overview != ""},
		FirstAirDate:   firstAirDate,
		EpisodeRunTime: pgtype.Int2{Int16: runtime, Valid: runtime > 0},

		VoteAverage:   voteAvg,
		VoteCount:     tmdbData.VoteCount,
		IsType:        "serie",
		Active:        req.Status == "Publicado",
		Slug:          slug,
		Certification: pgtype.Text{String: certification, Valid: certification != ""},
	}

	serie, err := s.db.CreateSerie(r.Context(), params)
	if err != nil {
		http.Error(w, "Error saving serie to DB: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Lanzar sincronizaciÃ³n de relaciones en segundo plano
	go func() {
		SyncSerieRelations(context.Background(), s.db, serie.ID, serie.TmdbID.Int64, tmdbData.Genres, tmdbData.Credits, tmdbData.WatchProviders, tmdbData.ProductionCountries)
		SyncMediaImages(context.Background(), s.db, serie.TmdbID.Int64, serie.ID, "serie", tmdbData.PosterPath, tmdbData.BackdropPath)
		SyncSerieSeasons(context.Background(), s.db, serie.ID, serie.TmdbID.Int64, tmdbData.Seasons)
	}()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serie)
}

func (s *Server) handleTMDBSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	searchType := r.URL.Query().Get("type") // "movie" o "tv"

	if query == "" || (searchType != "movie" && searchType != "tv") {
		http.Error(w, "Query and type (movie/tv) are required", http.StatusBadRequest)
		return
	}

	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		http.Error(w, "TMDB API Key missing on server", http.StatusInternalServerError)
		return
	}

	url := fmt.Sprintf("https://api.themoviedb.org/3/search/%s?api_key=%s&query=%s&language=es-MX&page=1", searchType, tmdbAPIKey, url.QueryEscape(query))
	resp, err := http.Get(url)
	if err != nil || resp.StatusCode != 200 {
		http.Error(w, "Error calling TMDB", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (s *Server) handleTMDBSearchImages(w http.ResponseWriter, r *http.Request) {
	searchType := r.URL.Query().Get("type") // "movie" o "tv"
	id := r.URL.Query().Get("id")

	if id == "" || (searchType != "movie" && searchType != "tv") {
		http.Error(w, "ID and type are required", http.StatusBadRequest)
		return
	}

	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	fanartAPIKey := os.Getenv("FANART_API_KEY")

	var results []map[string]interface{}

	// 1. Fetch TMDB Images
	if tmdbAPIKey != "" {
		tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/%s/%s/images?api_key=%s", searchType, id, tmdbAPIKey)
		resp, err := http.Get(tmdbURL)
		if err == nil && resp.StatusCode == 200 {
			var tmdbData struct {
				Backdrops []struct {
					FilePath string `json:"file_path"`
					Iso639_1 string `json:"iso_639_1"`
				} `json:"backdrops"`
				Logos []struct {
					FilePath string `json:"file_path"`
					Iso639_1 string `json:"iso_639_1"`
				} `json:"logos"`
				Posters []struct {
					FilePath string `json:"file_path"`
					Iso639_1 string `json:"iso_639_1"`
				} `json:"posters"`
			}
			json.NewDecoder(resp.Body).Decode(&tmdbData)
			resp.Body.Close()

			for _, b := range tmdbData.Backdrops {
				results = append(results, map[string]interface{}{
					"FilePath":    "https://image.tmdb.org/t/p/original" + b.FilePath,
					"Type":        "backdrop",
					"Source":      "tmdb",
					"LanguageISO": b.Iso639_1,
				})
			}
			for _, l := range tmdbData.Logos {
				results = append(results, map[string]interface{}{
					"FilePath":    "https://image.tmdb.org/t/p/original" + l.FilePath,
					"Type":        "logo",
					"Source":      "tmdb",
					"LanguageISO": l.Iso639_1,
				})
			}
			for _, p := range tmdbData.Posters {
				results = append(results, map[string]interface{}{
					"FilePath":    "https://image.tmdb.org/t/p/original" + p.FilePath,
					"Type":        "poster",
					"Source":      "tmdb",
					"LanguageISO": p.Iso639_1,
				})
			}
		}
	}

	// 2. Fetch Fanart.tv Images
	if fanartAPIKey != "" {
		// Fanart TV uses tmdb_id for movies, and tvdb_id for tv (but sometimes tmdb_id works or it has a different endpoint)
		fanartType := "movies"
		if searchType == "tv" {
			fanartType = "tv"
		}
		fanartURL := fmt.Sprintf("https://webservice.fanart.tv/v3/%s/%s?api_key=%s", fanartType, id, fanartAPIKey)
		resp, err := http.Get(fanartURL)
		if err == nil && resp.StatusCode == 200 {
			var fanartData map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&fanartData)
			resp.Body.Close()

			// Extract clearart, logos, etc.
			// Movies: hdmovieclearart, moviebackground, movielogo, movieposter, hdmovielogo
			// TV: hdclearart, showbackground, hdtvlogo, tvposter, clearlogo

			mappings := map[string]string{
				"hdmovieclearart": "clearart",
				"hdclearart":      "clearart",
				"clearart":        "clearart",
				"movielogo":       "logo",
				"hdmovielogo":     "logo",
				"clearlogo":       "logo",
				"hdtvlogo":        "logo",
				"moviebackground": "backdrop",
				"showbackground":  "backdrop",
				"movieposter":     "poster",
				"tvposter":        "poster",
			}

			for key, val := range fanartData {
				if arr, ok := val.([]interface{}); ok {
					if imgType, mapped := mappings[key]; mapped {
						for _, item := range arr {
							if obj, ok := item.(map[string]interface{}); ok {
								imgUrl, _ := obj["url"].(string)
								lang, _ := obj["lang"].(string)
								if imgUrl != "" {
									results = append(results, map[string]interface{}{
										"FilePath":    imgUrl,
										"Type":        imgType,
										"Source":      "fanart",
										"LanguageISO": lang,
									})
								}
							}
						}
					}
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
