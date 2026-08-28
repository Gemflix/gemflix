package api

import (
	"encoding/json"
	"net/http"
	db "proyecto-go/db/sqlc"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type EpisodeResponse struct {
	ID             int64  `json:"id"`
	EpisodeNumber  int16  `json:"episode_number"`
	Name           string `json:"name"`
	Overview       string `json:"overview"`
	StillPath      string `json:"still_path"`
	AirDate        string `json:"air_date"`
	EnableStream   bool   `json:"enable_stream"`
	EnableDownload bool   `json:"enable_download"`
}

type SeasonResponse struct {
	ID           int64             `json:"id"`
	SeasonNumber int16             `json:"season_number"`
	Name         string            `json:"name"`
	Overview     string            `json:"overview"`
	PosterPath   string            `json:"poster_path"`
	AirDate      string            `json:"air_date"`
	Episodes     []EpisodeResponse `json:"episodes"`
}

func (s *Server) handleGetSerieSeasons(w http.ResponseWriter, r *http.Request) {
	serieIDStr := chi.URLParam(r, "id")
	serieID, err := strconv.ParseInt(serieIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid serie ID", http.StatusBadRequest)
		return
	}

	seasons, err := s.db.GetSerieSeasons(r.Context(), serieID)
	if err != nil {
		http.Error(w, "Error fetching seasons", http.StatusInternalServerError)
		return
	}

	var response []SeasonResponse
	if len(seasons) == 0 {
		response = make([]SeasonResponse, 0)
	}

	for _, season := range seasons {
		var airDateStr string
		if season.AirDate.Valid {
			airDateStr = season.AirDate.Time.Format("2006-01-02")
		}

		episodesData, err := s.db.GetSeasonEpisodes(r.Context(), season.ID)
		if err != nil {
			http.Error(w, "Error fetching episodes", http.StatusInternalServerError)
			return
		}

		var episodes []EpisodeResponse
		if len(episodesData) == 0 {
			episodes = make([]EpisodeResponse, 0)
		}

		for _, ep := range episodesData {
			var epAirDateStr string
			if ep.AirDate.Valid {
				epAirDateStr = ep.AirDate.Time.Format("2006-01-02")
			}

			still := ""
			if ep.StillPath.Valid {
				still = ep.StillPath.String
			}

			overview := ""
			if ep.Overview.Valid {
				overview = ep.Overview.String
			}

			episodes = append(episodes, EpisodeResponse{
				ID:             ep.ID,
				EpisodeNumber:  ep.EpisodeNumber,
				Name:           ep.Name,
				Overview:       overview,
				StillPath:      still,
				AirDate:        epAirDateStr,
				EnableStream:   ep.EnableStream,
				EnableDownload: ep.EnableDownload,
			})
		}

		overview := ""
		if season.Overview.Valid {
			overview = season.Overview.String
		}

		poster := ""
		if season.PosterPath.Valid {
			poster = season.PosterPath.String
		}

		response = append(response, SeasonResponse{
			ID:           season.ID,
			SeasonNumber: season.SeasonNumber,
			Name:         season.Name,
			Overview:     overview,
			PosterPath:   poster,
			AirDate:      airDateStr,
			Episodes:     episodes,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleToggleEpisodeAttribute(w http.ResponseWriter, r *http.Request) {
	episodeIDStr := chi.URLParam(r, "id")
	episodeID, err := strconv.ParseInt(episodeIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid episode ID", http.StatusBadRequest)
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var enableStream, enableDownload pgtype.Bool

	if val, ok := req["enable_stream"]; ok {
		if b, isBool := val.(bool); isBool {
			enableStream = pgtype.Bool{Bool: b, Valid: true}
		}
	}

	if val, ok := req["enable_download"]; ok {
		if b, isBool := val.(bool); isBool {
			enableDownload = pgtype.Bool{Bool: b, Valid: true}
		}
	}

	err = s.db.ToggleEpisodeAttribute(r.Context(), db.ToggleEpisodeAttributeParams{
		ID:             episodeID,
		EnableStream:   enableStream,
		EnableDownload: enableDownload,
	})

	if err != nil {
		http.Error(w, "Error toggling attribute", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleUpdateEpisode(w http.ResponseWriter, r *http.Request) {
	episodeIDStr := chi.URLParam(r, "id")
	episodeID, err := strconv.ParseInt(episodeIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid episode ID", http.StatusBadRequest)
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var name string
	var overview, stillPath pgtype.Text
	if val, ok := req["name"].(string); ok {
		name = val
	}
	if val, ok := req["overview"].(string); ok {
		overview = pgtype.Text{String: val, Valid: true}
	}
	if val, ok := req["still_path"].(string); ok {
		stillPath = pgtype.Text{String: val, Valid: true}
	}

	var airDate pgtype.Date
	if val, ok := req["air_date"].(string); ok && val != "" {
		// Attempt to parse YYYY-MM-DD
		if parsed, err := time.Parse("2006-01-02", val); err == nil {
			airDate = pgtype.Date{Time: parsed, Valid: true}
		}
	}

	ep, err := s.db.UpdateEpisodeMetadata(r.Context(), db.UpdateEpisodeMetadataParams{
		ID:        episodeID,
		Name:      name,
		Overview:  overview,
		AirDate:   airDate,
		StillPath: stillPath,
	})

	if err != nil {
		http.Error(w, "Error updating episode", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ep)
}
