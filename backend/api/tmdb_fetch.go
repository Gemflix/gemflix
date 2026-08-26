package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	db "proyecto-go/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseDateStr(d string) pgtype.Date {
	var date pgtype.Date
	if d != "" {
		if err := date.Scan(d); err == nil {
			return date
		}
	}
	return date
}

func fetchAndSaveCastDetails(ctx context.Context, queries *db.Queries, tmdbId int64) {
	apiKey := os.Getenv("TMDB_API_KEY")
	if apiKey == "" {
		return
	}

	// Translations for es-MX, then es-ES, then en-US
	url := fmt.Sprintf("https://api.themoviedb.org/3/person/%d?api_key=%s&language=es-MX&append_to_response=translations", tmdbId, apiKey)
	resp, err := http.Get(url)
	if err != nil || resp.StatusCode != 200 {
		return
	}
	defer resp.Body.Close()

	var data struct {
		PlaceOfBirth string `json:"place_of_birth"`
		ImdbId       string `json:"imdb_id"`
		Biography    string `json:"biography"`
		Adult        bool   `json:"adult"`
		Birthday     string `json:"birthday"`
		Deathday     string `json:"deathday"`
		Translations struct {
			Translations []struct {
				Iso3166_1 string `json:"iso_3166_1"`
				Iso639_1  string `json:"iso_639_1"`
				Data      struct {
					Biography string `json:"biography"`
				} `json:"data"`
			} `json:"translations"`
		} `json:"translations"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return
	}

	// Use translations if main biography is empty
	if data.Biography == "" {
		for _, t := range data.Translations.Translations {
			if t.Iso639_1 == "es" && t.Iso3166_1 == "MX" && t.Data.Biography != "" {
				data.Biography = t.Data.Biography
				break
			}
		}
		if data.Biography == "" {
			for _, t := range data.Translations.Translations {
				if t.Iso639_1 == "es" && t.Iso3166_1 == "ES" && t.Data.Biography != "" {
					data.Biography = t.Data.Biography
					break
				}
			}
		}
		if data.Biography == "" {
			for _, t := range data.Translations.Translations {
				if t.Iso639_1 == "en" && t.Iso3166_1 == "US" && t.Data.Biography != "" {
					data.Biography = t.Data.Biography
					break
				}
			}
		}
	}

	if data.Biography == "" {
		if aiBio, err := GenerateMissingTextWithAI(context.Background(), fmt.Sprintf("Escribe una breve biografÃƒÂ­a en espaÃƒÂ±ol para el actor/actriz con TMDB ID %d", tmdbId)); err == nil {
			data.Biography = aiBio
		}
	}

	queries.UpdateCastDetails(ctx, db.UpdateCastDetailsParams{
		TmdbID:       pgtype.Int8{Int64: tmdbId, Valid: true},
		PlaceOfBirth: pgtype.Text{String: data.PlaceOfBirth, Valid: data.PlaceOfBirth != ""},
		ImdbID:       pgtype.Text{String: data.ImdbId, Valid: data.ImdbId != ""},
		Biography:    pgtype.Text{String: data.Biography, Valid: data.Biography != ""},
		Adult:        data.Adult,
		Birthday:     parseDateStr(data.Birthday),
		Deathday:     parseDateStr(data.Deathday),
	})
}

// FetchCollectionDetailsSync gets translations for a collection
func FetchCollectionDetailsSync(tmdbId int64) (nameEng, nameLat, nameEsp, overview, backdrop string) {
	apiKey := os.Getenv("TMDB_API_KEY")
	if apiKey == "" {
		return
	}

	url := fmt.Sprintf("https://api.themoviedb.org/3/collection/%d?api_key=%s&language=es-MX", tmdbId, apiKey)
	resp, err := http.Get(url)
	if err != nil || resp.StatusCode != 200 {
		return
	}
	defer resp.Body.Close()

	var data struct {
		Name         string `json:"name"`
		Overview     string `json:"overview"`
		BackdropPath string `json:"backdrop_path"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return
	}

	urlEs := fmt.Sprintf("https://api.themoviedb.org/3/collection/%d?api_key=%s&language=es-ES", tmdbId, apiKey)
	respEs, _ := http.Get(urlEs)
	var dataEs struct {
		Name     string `json:"name"`
		Overview string `json:"overview"`
	}
	if respEs != nil && respEs.StatusCode == 200 {
		json.NewDecoder(respEs.Body).Decode(&dataEs)
		respEs.Body.Close()
	}

	urlEn := fmt.Sprintf("https://api.themoviedb.org/3/collection/%d?api_key=%s&language=en-US", tmdbId, apiKey)
	respEn, _ := http.Get(urlEn)
	var dataEn struct {
		Name     string `json:"name"`
		Overview string `json:"overview"`
	}
	if respEn != nil && respEn.StatusCode == 200 {
		json.NewDecoder(respEn.Body).Decode(&dataEn)
		respEn.Body.Close()
	}

	nameEsp = dataEs.Name
	if data.Name != "" {
		nameEsp = data.Name
	}
	overview = data.Overview
	if overview == "" {
		overview = dataEs.Overview
	}
	if overview == "" {
		overview = dataEn.Overview
	}

	if overview == "" {
		if aiOver, err := GenerateMissingTextWithAI(context.Background(), fmt.Sprintf("Escribe una breve sinopsis en espaÃƒÂ±ol para la colecciÃƒÂ³n de pelÃƒÂ­culas %s", dataEn.Name)); err == nil {
			overview = aiOver
		}
	}

	nameLat = data.Name
	nameEng = dataEn.Name
	backdrop = data.BackdropPath

	return
}
