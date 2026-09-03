package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) handleListAdminAds(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	ads, err := s.db.ListAdminAds(r.Context(), db.ListAdminAdsParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, "Failed to fetch ads", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(ads)
}

func (s *Server) handleCreateAd(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Company      string `json:"company"`
		Type         string `json:"type"`
		Content      string `json:"content"`
		IsRewarded   bool   `json:"is_rewarded"`
		RewardTokens int32  `json:"reward_tokens"`
		DailyLimit   int16  `json:"daily_limit"`
		IsActive     bool   `json:"is_active"`
		Priority     int32  `json:"priority"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	var company pgtype.Text
	if req.Company != "" {
		company = pgtype.Text{String: req.Company, Valid: true}
	}

	ad, err := s.db.CreateAd(r.Context(), db.CreateAdParams{
		Company:      company,
		Type:         req.Type,
		Content:      req.Content,
		IsRewarded:   req.IsRewarded,
		RewardTokens: req.RewardTokens,
		DailyLimit:   req.DailyLimit,
		IsActive:     req.IsActive,
		Priority:     req.Priority,
	})

	if err != nil {
		http.Error(w, "Error creating ad: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(ad)
}

func (s *Server) handleUpdateAd(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Company      *string `json:"company"`
		Type         *string `json:"type"`
		Content      *string `json:"content"`
		IsRewarded   *bool   `json:"is_rewarded"`
		RewardTokens *int32  `json:"reward_tokens"`
		DailyLimit   *int16  `json:"daily_limit"`
		IsActive     *bool   `json:"is_active"`
		Priority     *int32  `json:"priority"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	arg := db.UpdateAdParams{
		ID: id,
	}

	if req.Company != nil {
		arg.Company = pgtype.Text{String: *req.Company, Valid: true}
	}
	if req.Type != nil {
		arg.Type = pgtype.Text{String: *req.Type, Valid: true}
	}
	if req.Content != nil {
		arg.Content = pgtype.Text{String: *req.Content, Valid: true}
	}
	if req.IsRewarded != nil {
		arg.IsRewarded = pgtype.Bool{Bool: *req.IsRewarded, Valid: true}
	}
	if req.RewardTokens != nil {
		arg.RewardTokens = pgtype.Int4{Int32: *req.RewardTokens, Valid: true}
	}
	if req.DailyLimit != nil {
		arg.DailyLimit = pgtype.Int2{Int16: *req.DailyLimit, Valid: true}
	}
	if req.IsActive != nil {
		arg.IsActive = pgtype.Bool{Bool: *req.IsActive, Valid: true}
	}
	if req.Priority != nil {
		arg.Priority = pgtype.Int4{Int32: *req.Priority, Valid: true}
	}

	ad, err := s.db.UpdateAd(r.Context(), arg)
	if err != nil {
		http.Error(w, "Error updating ad: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(ad)
}

func (s *Server) handleDeleteAd(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := s.db.DeleteAd(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete ad", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
