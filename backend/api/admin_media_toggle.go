package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"proyecto-go/db/sqlc"
)

// handleToggleMediaAttr
func (s *Server) handleToggleMediaAttr(w http.ResponseWriter, r *http.Request) {
	var mediaType string
	if strings.Contains(r.URL.Path, "/movies/") {
		mediaType = "movies"
	} else if strings.Contains(r.URL.Path, "/series/") {
		mediaType = "series"
	}

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	getBool := func(key string) pgtype.Bool {
		if val, ok := req[key]; ok {
			if b, isBool := val.(bool); isBool {
				return pgtype.Bool{Bool: b, Valid: true}
			}
		}
		return pgtype.Bool{Valid: false}
	}

	var premium = getBool("premium")
	var premiere = getBool("premiere")
	var upcoming = getBool("upcoming")
	var active = getBool("active")

	// status maps to active
	if val, ok := req["status"]; ok {
		if s, isStr := val.(string); isStr {
			active = pgtype.Bool{Bool: s == "Publicado", Valid: true}
		}
	}

	switch mediaType {
	case "movies", "movie":
		err = s.db.ToggleMovieAttribute(r.Context(), db.ToggleMovieAttributeParams{
			ID:       id,
			Premium:  premium,
			Premiere: premiere,
			Upcoming: upcoming,
			Active:   active,
		})
	case "series", "serie":
		err = s.db.ToggleSerieAttribute(r.Context(), db.ToggleSerieAttributeParams{
			ID:       id,
			Premium:  premium,
			Premiere: premiere,
			Upcoming: upcoming,
			Active:   active,
		})
	default:
		http.Error(w, "Invalid media type", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, "Error toggling attribute", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
