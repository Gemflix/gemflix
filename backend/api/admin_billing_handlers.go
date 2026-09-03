package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// handleCreatePlan
func (s *Server) handleCreatePlan(w http.ResponseWriter, r *http.Request) {
	// PricePayload para recibir precios del frontend
	type PricePayload struct {
		Currency   string `json:"currency"`
		PriceCents int64  `json:"price_cents"`
		Interval   string `json:"interval"`
	}

	var req struct {
		Key                string         `json:"key"`
		Category           string         `json:"category"`
		Name               string         `json:"name"`
		Description        string         `json:"description"`
		Color              string         `json:"color"`
		Priority           int16          `json:"priority"`
		Badge              string         `json:"badge"`
		IsFeatured         bool           `json:"is_featured"`
		MaxProfiles        int16          `json:"max_profiles"`
		MaxDevices         int16          `json:"max_devices"`
		MaxPendingRequests int16          `json:"max_pending_requests"`
		ParentalControl    bool           `json:"parental_control"`
		Features           []string       `json:"features"`
		IsActive           bool           `json:"is_active"`
		SortOrder          int16          `json:"sort_order"`
		Prices             []PricePayload `json:"prices"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	featuresJSON, _ := json.Marshal(req.Features)
	if len(req.Features) == 0 {
		featuresJSON = []byte("[]")
	}

	plan, err := s.db.CreatePlan(r.Context(), db.CreatePlanParams{
		Key:                req.Key,
		Category:           pgtype.Text{String: req.Category, Valid: req.Category != ""},
		Name:               req.Name,
		Description:        pgtype.Text{String: req.Description, Valid: req.Description != ""},
		Color:              pgtype.Text{String: req.Color, Valid: req.Color != ""},
		Priority:           req.Priority,
		Badge:              pgtype.Text{String: req.Badge, Valid: req.Badge != ""},
		IsFeatured:         req.IsFeatured,
		MaxProfiles:        req.MaxProfiles,
		MaxDevices:         req.MaxDevices,
		MaxPendingRequests: req.MaxPendingRequests,
		ParentalControl:    req.ParentalControl,
		Features:           featuresJSON,
		IsActive:           req.IsActive,
		SortOrder:          req.SortOrder,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, p := range req.Prices {
		s.db.CreatePlanPrice(r.Context(), db.CreatePlanPriceParams{
			PlanID:     plan.ID,
			Currency:   p.Currency,
			PriceCents: p.PriceCents,
			Interval:   p.Interval,
		})
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plan)
}

// handleGetPlans
func (s *Server) handleGetPlans(w http.ResponseWriter, r *http.Request) {
	plans, err := s.db.ListPlans(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch prices for each plan
	type PlanWithPrices struct {
		db.Plan
		Prices []db.PlanPrice `json:"prices"`
	}
	var result []PlanWithPrices

	for _, p := range plans {
		prices, _ := s.db.GetPlanPrices(r.Context(), p.ID)
		result = append(result, PlanWithPrices{
			Plan:   p,
			Prices: prices,
		})
	}

	response := map[string]interface{}{
		"data": result,
	}
	json.NewEncoder(w).Encode(response)
}

// handleUpdatePlan
func (s *Server) handleUpdatePlan(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	type PricePayload struct {
		Currency   string `json:"currency"`
		PriceCents int64  `json:"price_cents"`
		Interval   string `json:"interval"`
	}

	var req struct {
		Key                *string         `json:"key"`
		Category           *string         `json:"category"`
		Name               *string         `json:"name"`
		Description        *string         `json:"description"`
		Color              *string         `json:"color"`
		Priority           *int16          `json:"priority"`
		Badge              *string         `json:"badge"`
		IsFeatured         *bool           `json:"is_featured"`
		MaxProfiles        *int16          `json:"max_profiles"`
		MaxDevices         *int16          `json:"max_devices"`
		MaxPendingRequests *int16          `json:"max_pending_requests"`
		ParentalControl    *bool           `json:"parental_control"`
		Features           *[]string       `json:"features"`
		IsActive           *bool           `json:"is_active"`
		SortOrder          *int16          `json:"sort_order"`
		Prices             *[]PricePayload `json:"prices"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	params := db.UpdatePlanParams{
		ID: id,
	}

	if req.Key != nil {
		params.Key = pgtype.Text{String: *req.Key, Valid: true}
	}
	if req.Category != nil {
		params.Category = pgtype.Text{String: *req.Category, Valid: true}
	}
	if req.Name != nil {
		params.Name = pgtype.Text{String: *req.Name, Valid: true}
	}
	if req.Description != nil {
		params.Description = pgtype.Text{String: *req.Description, Valid: true}
	}
	if req.Color != nil {
		params.Color = pgtype.Text{String: *req.Color, Valid: true}
	}
	if req.Priority != nil {
		params.Priority = pgtype.Int2{Int16: *req.Priority, Valid: true}
	}
	if req.Badge != nil {
		params.Badge = pgtype.Text{String: *req.Badge, Valid: true}
	}
	if req.IsFeatured != nil {
		params.IsFeatured = pgtype.Bool{Bool: *req.IsFeatured, Valid: true}
	}
	if req.MaxProfiles != nil {
		params.MaxProfiles = pgtype.Int2{Int16: *req.MaxProfiles, Valid: true}
	}
	if req.MaxDevices != nil {
		params.MaxDevices = pgtype.Int2{Int16: *req.MaxDevices, Valid: true}
	}
	if req.MaxPendingRequests != nil {
		params.MaxPendingRequests = pgtype.Int2{Int16: *req.MaxPendingRequests, Valid: true}
	}
	if req.ParentalControl != nil {
		params.ParentalControl = pgtype.Bool{Bool: *req.ParentalControl, Valid: true}
	}
	if req.Features != nil {
		featuresJSON, _ := json.Marshal(*req.Features)
		params.Features = featuresJSON
	}
	if req.IsActive != nil {
		params.IsActive = pgtype.Bool{Bool: *req.IsActive, Valid: true}
	}
	if req.SortOrder != nil {
		params.SortOrder = pgtype.Int2{Int16: *req.SortOrder, Valid: true}
	}

	plan, err := s.db.UpdatePlan(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if req.Prices != nil {
		s.db.DeletePlanPrices(r.Context(), plan.ID)
		for _, p := range *req.Prices {
			s.db.CreatePlanPrice(r.Context(), db.CreatePlanPriceParams{
				PlanID:     plan.ID,
				Currency:   p.Currency,
				PriceCents: p.PriceCents,
				Interval:   p.Interval,
			})
		}
	}

	json.NewEncoder(w).Encode(plan)
}

// handleDeletePlan
func (s *Server) handleDeletePlan(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = s.db.DeletePlan(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
