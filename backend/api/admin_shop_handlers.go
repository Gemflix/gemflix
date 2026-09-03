package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// handleCreateShopItem
func (s *Server) handleCreateShopItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Type        string `json:"type"`
		Collection  string `json:"collection"`
		Price       int64  `json:"price"`
		MediaID     int64  `json:"media_id"`
		PreviewCSS  string `json:"preview_css"`
		IsActive    bool   `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	params := db.CreateShopItemParams{
		Name:        req.Name,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
		Type:        req.Type,
		Collection:  pgtype.Text{String: req.Collection, Valid: req.Collection != ""},
		Price:       req.Price,
		PreviewCss:  pgtype.Text{String: req.PreviewCSS, Valid: req.PreviewCSS != ""},
		IsActive:    req.IsActive,
	}

	if req.MediaID > 0 {
		params.MediaID = pgtype.Int8{Int64: req.MediaID, Valid: true}
	}

	item, err := s.db.CreateShopItem(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// handleGetShopItems
func (s *Server) handleGetShopItems(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := int32((page - 1) * limit)

	items, err := s.db.ListShopItems(r.Context(), db.ListShopItemsParams{
		Limit:  int32(limit),
		Offset: offset,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	total, _ := s.db.CountShopItems(r.Context())

	response := map[string]interface{}{
		"data":  items,
		"total": total,
		"page":  page,
		"limit": limit,
	}

	json.NewEncoder(w).Encode(response)
}

// handleUpdateShopItem
func (s *Server) handleUpdateShopItem(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Type        *string `json:"type"`
		Collection  *string `json:"collection"`
		Price       *int64  `json:"price"`
		MediaID     *int64  `json:"media_id"`
		PreviewCSS  *string `json:"preview_css"`
		IsActive    *bool   `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	params := db.UpdateShopItemParams{
		ID: id,
	}

	if req.Name != nil {
		params.Name = pgtype.Text{String: *req.Name, Valid: true}
	}
	if req.Description != nil {
		params.Description = pgtype.Text{String: *req.Description, Valid: true}
	}
	if req.Type != nil {
		params.Type = pgtype.Text{String: *req.Type, Valid: true}
	}
	if req.Collection != nil {
		params.Collection = pgtype.Text{String: *req.Collection, Valid: true}
	}
	if req.Price != nil {
		params.Price = pgtype.Int8{Int64: *req.Price, Valid: true}
	}
	if req.MediaID != nil {
		params.MediaID = pgtype.Int8{Int64: *req.MediaID, Valid: true}
	}
	if req.PreviewCSS != nil {
		params.PreviewCss = pgtype.Text{String: *req.PreviewCSS, Valid: true}
	}
	if req.IsActive != nil {
		params.IsActive = pgtype.Bool{Bool: *req.IsActive, Valid: true}
	}

	item, err := s.db.UpdateShopItem(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(item)
}

// handleDeleteShopItem
func (s *Server) handleDeleteShopItem(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = s.db.DeleteShopItem(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
