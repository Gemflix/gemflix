package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) handleListPromoCodes(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	promos, err := s.db.ListPromoCodes(r.Context(), db.ListPromoCodesParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, "Failed to list promos", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(promos)
}

func (s *Server) handleCreatePromoCode(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code       string `json:"code"`
		Type       string `json:"type"` // 'percentage', 'fixed', 'free_days'
		Value      string `json:"value"` // Using string to parse into Decimal
		MaxUses    *int32 `json:"max_uses"`
		ValidFrom  *time.Time `json:"valid_from"`
		ValidUntil *time.Time `json:"valid_until"`
		IsActive   bool   `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	var numericValue pgtype.Numeric
	numericValue.Scan(req.Value)

	var maxUses pgtype.Int4
	if req.MaxUses != nil {
		maxUses = pgtype.Int4{Int32: *req.MaxUses, Valid: true}
	}

	var validFrom, validUntil pgtype.Timestamptz
	if req.ValidFrom != nil {
		validFrom = pgtype.Timestamptz{Time: *req.ValidFrom, Valid: true}
	}
	if req.ValidUntil != nil {
		validUntil = pgtype.Timestamptz{Time: *req.ValidUntil, Valid: true}
	}

	promo, err := s.db.CreatePromoCode(r.Context(), db.CreatePromoCodeParams{
		Code:       req.Code,
		Type:       req.Type,
		Value:      numericValue,
		MaxUses:    maxUses,
		ValidFrom:  validFrom,
		ValidUntil: validUntil,
		IsActive:   req.IsActive,
	})
	if err != nil {
		http.Error(w, "Error creating promo code: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(promo)
}

func (s *Server) handleDeletePromoCode(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := s.db.DeletePromoCode(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete promo", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
