package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// handleCreateCategory
func (s *Server) handleCreateCategory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	category, err := s.db.CreateCategory(r.Context(), db.CreateCategoryParams{
		Name: req.Name,
		Slug: req.Slug,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

// handleGetCategories
func (s *Server) handleGetCategories(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := int32((page - 1) * limit)

	categories, err := s.db.ListCategories(r.Context(), db.ListCategoriesParams{
		Limit:  int32(limit),
		Offset: offset,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	total, _ := s.db.CountCategories(r.Context())

	response := map[string]interface{}{
		"data":  categories,
		"total": total,
		"page":  page,
		"limit": limit,
	}

	json.NewEncoder(w).Encode(response)
}

// handleUpdateCategory
func (s *Server) handleUpdateCategory(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name string `json:"name"`
		Slug string `json:"slug"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	params := db.UpdateCategoryParams{
		ID: id,
	}
	if req.Name != "" {
		params.Name = pgtype.Text{String: req.Name, Valid: true}
	}
	if req.Slug != "" {
		params.Slug = pgtype.Text{String: req.Slug, Valid: true}
	}

	category, err := s.db.UpdateCategory(r.Context(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(category)
}

// handleDeleteCategory
func (s *Server) handleDeleteCategory(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = s.db.DeleteCategory(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
