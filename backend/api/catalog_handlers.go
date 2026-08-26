package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	db "proyecto-go/db/sqlc"
)

// HandleCatalogMovies procesa los filtros para películas
func (server *Server) HandleCatalogMovies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// 1. Leer paginación
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

	// 2. Leer parámetros de filtro
	arg := db.CatalogFilterMoviesParams{
		Limit:  limit,
		Offset: offset,
	}

	if cat := r.URL.Query().Get("cat"); cat != "" {
		arg.IsType = pgtype.Text{String: cat, Valid: true}
	}
	if yearStr := r.URL.Query().Get("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			arg.Year = pgtype.Int4{Int32: int32(y), Valid: true}
		}
	}
	if q := r.URL.Query().Get("q"); q != "" {
		arg.SearchQuery = pgtype.Text{String: q, Valid: true}
	}
	if genreStr := r.URL.Query().Get("genre"); genreStr != "" {
		if g, err := strconv.ParseInt(genreStr, 10, 64); err == nil {
			arg.GenreID = pgtype.Int8{Int64: g, Valid: true}
		}
	}
	if networkStr := r.URL.Query().Get("network"); networkStr != "" {
		if n, err := strconv.ParseInt(networkStr, 10, 64); err == nil {
			arg.NetworkID = pgtype.Int8{Int64: n, Valid: true}
		}
	}
	if countryStr := r.URL.Query().Get("country"); countryStr != "" {
		if c, err := strconv.ParseInt(countryStr, 10, 64); err == nil {
			arg.CountryID = pgtype.Int8{Int64: c, Valid: true}
		}
	}
	if sort := r.URL.Query().Get("sort"); sort != "" {
		arg.SortBy = pgtype.Text{String: sort, Valid: true}
	}

	// 3. Consultar DB
	movies, err := server.db.CatalogFilterMovies(ctx, arg)
	if err != nil {
		http.Error(w, "Failed to fetch movies", http.StatusInternalServerError)
		return
	}

	if movies == nil {
		movies = []db.CatalogFilterMoviesRow{}
	}

	// 4. Formatear URLs de imágenes
	for i := range movies {
		movies[i].PosterPath = pgtype.Text{String: tmdbImage(movies[i].PosterPath.String, "w500"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movies)
}

// HandleCatalogSeries procesa los filtros para series
func (server *Server) HandleCatalogSeries(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// 1. Leer paginación
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

	// 2. Leer parámetros de filtro
	arg := db.CatalogFilterSeriesParams{
		Limit:  limit,
		Offset: offset,
	}

	if cat := r.URL.Query().Get("cat"); cat != "" {
		arg.IsType = pgtype.Text{String: cat, Valid: true}
	}
	if yearStr := r.URL.Query().Get("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			arg.Year = pgtype.Int4{Int32: int32(y), Valid: true}
		}
	}
	if q := r.URL.Query().Get("q"); q != "" {
		arg.SearchQuery = pgtype.Text{String: q, Valid: true}
	}
	if genreStr := r.URL.Query().Get("genre"); genreStr != "" {
		if g, err := strconv.ParseInt(genreStr, 10, 64); err == nil {
			arg.GenreID = pgtype.Int8{Int64: g, Valid: true}
		}
	}
	if networkStr := r.URL.Query().Get("network"); networkStr != "" {
		if n, err := strconv.ParseInt(networkStr, 10, 64); err == nil {
			arg.NetworkID = pgtype.Int8{Int64: n, Valid: true}
		}
	}
	if countryStr := r.URL.Query().Get("country"); countryStr != "" {
		if c, err := strconv.ParseInt(countryStr, 10, 64); err == nil {
			arg.CountryID = pgtype.Int8{Int64: c, Valid: true}
		}
	}
	if sort := r.URL.Query().Get("sort"); sort != "" {
		arg.SortBy = pgtype.Text{String: sort, Valid: true}
	}

	// 3. Consultar DB
	series, err := server.db.CatalogFilterSeries(ctx, arg)
	if err != nil {
		http.Error(w, "Failed to fetch series", http.StatusInternalServerError)
		return
	}

	if series == nil {
		series = []db.CatalogFilterSeriesRow{}
	}

	// 4. Formatear URLs de imágenes
	for i := range series {
		series[i].PosterPath = pgtype.Text{String: tmdbImage(series[i].PosterPath.String, "w500"), Valid: true}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(series)
}
