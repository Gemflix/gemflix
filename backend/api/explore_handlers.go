package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	db "proyecto-go/db/sqlc"
)

func (server *Server) HandleGetExploreCollections(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	limit, offset := parsePagination(r)

	items, err := server.db.ListExploreCollections(ctx, db.ListExploreCollectionsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to fetch collections", http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []db.ListExploreCollectionsRow{}
	}

	for i := range items {
		items[i].PosterPath = pgtype.Text{String: tmdbImage(items[i].PosterPath.String, "w500"), Valid: true}
		items[i].BackdropPath = pgtype.Text{String: tmdbImage(items[i].BackdropPath.String, "w1280"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (server *Server) HandleGetExploreNetworks(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	limit, offset := parsePagination(r)

	items, err := server.db.ListExploreNetworks(ctx, db.ListExploreNetworksParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to fetch networks", http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []db.ListExploreNetworksRow{}
	}

	for i := range items {
		items[i].PosterPath = pgtype.Text{String: tmdbImage(items[i].PosterPath.String, "w500"), Valid: true}
		items[i].BackdropPath = pgtype.Text{String: tmdbImage(items[i].BackdropPath.String, "w1280"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (server *Server) HandleGetExploreCountries(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	limit, offset := parsePagination(r)

	items, err := server.db.ListExploreCountries(ctx, db.ListExploreCountriesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to fetch countries", http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []db.ListExploreCountriesRow{}
	}

	for i := range items {
		items[i].LogoPath = pgtype.Text{String: tmdbImage(items[i].LogoPath.String, "w300"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (server *Server) HandleGetExploreCasts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	limit, offset := parsePagination(r)

	items, err := server.db.ListExploreCasts(ctx, db.ListExploreCastsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		http.Error(w, "Failed to fetch casts", http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []db.ListExploreCastsRow{}
	}

	for i := range items {
		items[i].ProfilePath = pgtype.Text{String: tmdbImage(items[i].ProfilePath.String, "w500"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (server *Server) HandleGetExploreGenres(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	items, err := server.db.ListExploreGenres(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch genres", http.StatusInternalServerError)
		return
	}

	if items == nil {
		items = []db.ListExploreGenresRow{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func parsePagination(r *http.Request) (int32, int32) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	limit := int32(24)
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = int32(l)
	}
	offset := int32(0)
	if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
		offset = int32(o)
	}
	return limit, offset
}
