package api

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	db "proyecto-go/db/sqlc"
)

type CreateRequestInput struct {
	TmdbID    int    `json:"tmdb_id"`
	Title     string `json:"title"`
	MediaType string `json:"media_type"`
	Notes     string `json:"notes"`
}

func (server *Server) HandleCreateMediaRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserID(ctx)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input CreateRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	tmdbID := pgtype.Int4{}
	if input.TmdbID > 0 {
		tmdbID = pgtype.Int4{Int32: int32(input.TmdbID), Valid: true}
	}
	notes := pgtype.Text{}
	if input.Notes != "" {
		notes = pgtype.Text{String: input.Notes, Valid: true}
	}

	req, err := server.db.CreateMediaRequest(ctx, db.CreateMediaRequestParams{
		UserID:    userID,
		TmdbID:    tmdbID,
		Title:     input.Title,
		MediaType: input.MediaType,
		Notes:     notes,
	})
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (server *Server) HandleListMediaRequests(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserID(ctx)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	limit, offset := parsePagination(r)

	reqs, err := server.db.ListUserMediaRequests(ctx, db.ListUserMediaRequestsParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to list requests", http.StatusInternalServerError)
		return
	}

	if reqs == nil {
		reqs = []db.MediaRequest{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reqs)
}

type CreateReportInput struct {
	MediaType string `json:"media_type"`
	MediaID   int64  `json:"media_id"`
	Reason    string `json:"reason"`
	Details   string `json:"details"`
}

func (server *Server) HandleCreateMediaReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserID(ctx)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input CreateReportInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	details := pgtype.Text{}
	if input.Details != "" {
		details = pgtype.Text{String: input.Details, Valid: true}
	}

	rep, err := server.db.CreateMediaReport(ctx, db.CreateMediaReportParams{
		UserID:    userID,
		MediaType: input.MediaType,
		MediaID:   input.MediaID,
		Reason:    input.Reason,
		Details:   details,
	})
	if err != nil {
		http.Error(w, "Failed to create report", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rep)
}

func (server *Server) HandleListMediaReports(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserID(ctx)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	limit, offset := parsePagination(r)

	reps, err := server.db.ListUserMediaReports(ctx, db.ListUserMediaReportsParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to list reports", http.StatusInternalServerError)
		return
	}

	if reps == nil {
		reps = []db.MediaReport{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reps)
}
