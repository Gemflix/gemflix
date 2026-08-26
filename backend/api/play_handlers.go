package api

import (
	"encoding/json"
	"net/http"
	"reflect"
	"strings"
)

// tmdbImage builds the full URL for TMDB paths
func tmdbImage(path string, size string) string {
	if path == "" {
		return ""
	}
	if strings.HasPrefix(path, "http") {
		return path
	}
	if size == "" {
		size = "original"
	}
	return "https://image.tmdb.org/t/p/" + size + path
}

func (s *Server) handleGetVODHome(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

	viewMode := r.URL.Query().Get("viewMode")
	if viewMode == "" {
		viewMode = "movies"
	}

	setting, err := s.db.GetAppSetting(ctx, "public_catalog")
	isPublic := (err == nil && setting == "true")

	var activeProfileID int64
	if !isPublic {
		cookie, err := r.Cookie("gemflix_session")
		if err != nil || cookie.Value == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		
		tokenData, err := s.db.CheckTokenWithDevice(ctx, cookie.Value)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		profile, err := s.db.GetFirstActiveProfile(ctx, tokenData.UserID)
		if err == nil {
			activeProfileID = profile.ID
		}
	} else {
		// Even if public, try to get user for Continue Watching if session exists
		cookie, err := r.Cookie("gemflix_session")
		if err == nil && cookie.Value != "" {
			if tokenData, err := s.db.CheckTokenWithDevice(ctx, cookie.Value); err == nil {
				if profile, err := s.db.GetFirstActiveProfile(ctx, tokenData.UserID); err == nil {
					activeProfileID = profile.ID
				}
			}
		}
	}

	defaultPoster := ""

	mapItems := func(items interface{}) []map[string]interface{} {
		var mapped []map[string]interface{}
		v := reflect.ValueOf(items)
		if v.Kind() != reflect.Slice {
			return mapped
		}
		for i := 0; i < v.Len(); i++ {
			item := v.Index(i).Interface()
			
			id := reflect.ValueOf(item).FieldByName("ID").Int()
			title := reflect.ValueOf(item).FieldByName("Title").String()
			slug := reflect.ValueOf(item).FieldByName("Slug").String()
			
			posterField := reflect.ValueOf(item).FieldByName("PosterPath")
			poster := defaultPoster
			if posterField.IsValid() && posterField.FieldByName("Valid").Bool() && posterField.FieldByName("String").String() != "" {
				val := posterField.FieldByName("String").String()
				if !strings.HasPrefix(val, "http") {
					poster = "https://image.tmdb.org/t/p/w500" + val
				} else {
					poster = val
				}
			}
			
			mapped = append(mapped, map[string]interface{}{
				"id":     id,
				"title":  title,
				"slug":   slug,
				"poster": poster,
			})
		}
		return mapped
	}

	var hero map[string]interface{}
	var rows []map[string]interface{}

	switch viewMode {
	case "series":
		trending, _ := s.db.GetPlayTrendingSeries(ctx)
		recent, _ := s.db.GetPlayRecentSeries(ctx)
		
		if len(trending) > 0 {
			hero = map[string]interface{}{
				"title":    trending[0].Title,
				"overview": trending[0].Overview.String,
				"backdrop": tmdbImage(trending[0].BackdropPath.String, "original"),
				"poster":   tmdbImage(trending[0].PosterPath.String, "w500"),
			}
		}

		if activeProfileID > 0 {
			cw, _ := s.db.GetContinueWatching(ctx, activeProfileID)
			if len(cw) > 0 {
				rows = append(rows, map[string]interface{}{
					"title": "🎬 Continuar Viendo",
					"items": mapItems(cw),
					"row_type": "continue",
				})
			}
		}

		rows = append(rows, map[string]interface{}{"title": "🔥 Series en Tendencia", "items": mapItems(trending)})
		rows = append(rows, map[string]interface{}{"title": "🆕 Nuevos Episodios", "items": mapItems(recent), "row_type": "episodes"})

	case "animes":
		trending, _ := s.db.GetPlayTrendingAnimes(ctx)
		recent, _ := s.db.GetPlayRecentAnimes(ctx)
		
		if len(trending) > 0 {
			hero = map[string]interface{}{
				"title":    trending[0].Title,
				"overview": trending[0].Overview.String,
				"backdrop": tmdbImage(trending[0].BackdropPath.String, "original"),
				"poster":   tmdbImage(trending[0].PosterPath.String, "w500"),
			}
		}
		rows = append(rows, map[string]interface{}{"title": "🔥 Animes en Tendencia", "items": mapItems(trending)})
		rows = append(rows, map[string]interface{}{"title": "🆕 Animes Recientes", "items": mapItems(recent)})

	default: // movies
		trending, _ := s.db.GetPlayTrendingMovies(ctx)
		recent, _ := s.db.GetPlayRecentMovies(ctx)
		
		if len(trending) > 0 {
			hero = map[string]interface{}{
				"title":    trending[0].Title,
				"overview": trending[0].Overview.String,
				"backdrop": tmdbImage(trending[0].BackdropPath.String, "original"),
				"poster":   tmdbImage(trending[0].PosterPath.String, "w500"),
			}
		} else {
			hero = map[string]interface{}{
				"title": "Catálogo vacío",
				"overview": "Aún no hay contenido en esta sección.",
				"backdrop": "",
			}
		}

		if activeProfileID > 0 {
			cw, _ := s.db.GetContinueWatching(ctx, activeProfileID)
			if len(cw) > 0 {
				rows = append(rows, map[string]interface{}{
					"title": "🎬 Continuar Viendo",
					"items": mapItems(cw),
					"row_type": "continue",
				})
			}
			ml, _ := s.db.GetMyListMovies(ctx, activeProfileID)
			if len(ml) > 0 {
				rows = append(rows, map[string]interface{}{
					"title": "⭐ Mi Lista",
					"items": mapItems(ml),
				})
			}
		}

		rows = append(rows, map[string]interface{}{"title": "🔥 Tendencias Reales (PostgreSQL)", "items": mapItems(trending)})
		rows = append(rows, map[string]interface{}{"title": "🆕 Agregadas Recientemente", "items": mapItems(recent)})
	}

	response := map[string]interface{}{
		"hero": hero,
		"rows": rows,
		"tabs": []map[string]string{
			{"id": "movies", "label": "Películas"},
			{"id": "series", "label": "Series"},
			{"id": "animes", "label": "Animes"},
			{"id": "novelas", "label": "Novelas"},
			{"id": "donghuas", "label": "Donghua"},
			{"id": "doramas", "label": "Doramas"},
			{"id": "series-lives", "label": "Live Action"},
		},
	}

	json.NewEncoder(w).Encode(response)
}
