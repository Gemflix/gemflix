package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"proyecto-go/db/sqlc"
	"proyecto-go/utils"
)

// handleGetMovieDetails
func (s *Server) handleGetMovieDetails(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	movie, err := s.db.GetMovieFullDetails(r.Context(), id)
	if err != nil {
		fmt.Println("GetMovieFullDetails error:", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movie)
}

// handleGetSerieDetails
func (s *Server) handleGetSerieDetails(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	serie, err := s.db.GetSerieFullDetails(r.Context(), id)
	if err != nil {
		http.Error(w, "Serie no encontrada", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serie)
}

// handleDeleteMovie
func (s *Server) handleDeleteMovie(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	err = s.db.DeleteMovie(r.Context(), id)
	if err != nil {
		http.Error(w, "Error eliminando pelÃƒÆ’Ã‚Â­cula", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// handleDeleteSerie
func (s *Server) handleDeleteSerie(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	err = s.db.DeleteSerie(r.Context(), id)
	if err != nil {
		http.Error(w, "Error eliminando serie", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// handleUpdateMovie
func (s *Server) handleUpdateMovie(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	var req struct {
		OriginalName   string  `json:"original_name"`
		Slug           string  `json:"slug"`
		TitleLat       string  `json:"title_lat"`
		TitleEsp       string  `json:"title_esp"`
		TitleEng       string  `json:"title_eng"`
		Overview       string  `json:"overview"`
		TrailerKey     string  `json:"trailer_key"`
		ReleaseDate    string  `json:"release_date"`
		Runtime        int32   `json:"runtime"`
		Popularity     float64 `json:"popularity"`
		VoteAverage    float64 `json:"vote_average"`
		VoteCount      int32   `json:"vote_count"`
		Status         string  `json:"status"`
		Premium        bool    `json:"premium"`
		Premiere       bool    `json:"premiere"`
		Upcoming       bool    `json:"upcoming"`
		EnableStream   bool    `json:"enable_stream"`
		EnableDownload bool    `json:"enable_download"`
		Certification  string  `json:"certification"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var releaseDate pgtype.Date
	if req.ReleaseDate != "" { releaseDate.Scan(req.ReleaseDate) }
	
	var pop, voteAvg pgtype.Numeric
	pop.Scan(fmt.Sprintf("%f", req.Popularity))
	voteAvg.Scan(fmt.Sprintf("%f", req.VoteAverage))

	slug := req.Slug
	if slug == "" {
		if req.TitleEng != "" {
			slug = utils.Slugify(req.TitleEng)
		} else if req.TitleLat != "" {
			slug = utils.Slugify(req.TitleLat)
		} else if req.TitleEsp != "" {
			slug = utils.Slugify(req.TitleEsp)
		} else {
			slug = utils.Slugify(req.OriginalName)
		}
	}

	err = s.db.UpdateMovieBasic(r.Context(), db.UpdateMovieBasicParams{
		ID:             id,
		OriginalName:   req.OriginalName,
		Slug:           slug,
		TitleLat:       pgtype.Text{String: req.TitleLat, Valid: req.TitleLat != ""},
		TitleEsp:       pgtype.Text{String: req.TitleEsp, Valid: req.TitleEsp != ""},
		TitleEng:       pgtype.Text{String: req.TitleEng, Valid: req.TitleEng != ""},
		Overview:       pgtype.Text{String: req.Overview, Valid: req.Overview != ""},
		TrailerKey:     pgtype.Text{String: req.TrailerKey, Valid: req.TrailerKey != ""},
		ReleaseDate:    releaseDate,
		Runtime:        pgtype.Int2{Int16: int16(req.Runtime), Valid: true},

		VoteAverage:    voteAvg,
		VoteCount:      int64(req.VoteCount),
		Active:         req.Status == "Publicado",
		Premium:        req.Premium,
		Premiere:       req.Premiere,
		Upcoming:       req.Upcoming,
		EnableStream:   req.EnableStream,
		EnableDownload: req.EnableDownload,
		Certification:  pgtype.Text{String: req.Certification, Valid: req.Certification != ""},
	})
	if err != nil {
		http.Error(w, "Error updating movie", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// handleUpdateSerie
func (s *Server) handleUpdateSerie(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃƒÆ’Ã‚Â¡lido", http.StatusBadRequest)
		return
	}

	var req struct {
		OriginalName   string  `json:"original_name"`
		Slug           string  `json:"slug"`
		TitleLat       string  `json:"title_lat"`
		TitleEsp       string  `json:"title_esp"`
		TitleEng       string  `json:"title_eng"`
		Overview       string  `json:"overview"`
		TrailerKey     string  `json:"trailer_key"`
		FirstAirDate   string  `json:"first_air_date"`
		EpisodeRunTime int32   `json:"episode_run_time"`
		Popularity     float64 `json:"popularity"`
		VoteAverage    float64 `json:"vote_average"`
		VoteCount      int32   `json:"vote_count"`
		Status         string  `json:"status"`
		Premium        bool    `json:"premium"`
		Premiere       bool    `json:"premiere"`
		Upcoming       bool    `json:"upcoming"`
		Certification  string  `json:"certification"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var firstAirDate pgtype.Date
	if req.FirstAirDate != "" { firstAirDate.Scan(req.FirstAirDate) }
	
	var pop, voteAvg pgtype.Numeric
	pop.Scan(fmt.Sprintf("%f", req.Popularity))
	voteAvg.Scan(fmt.Sprintf("%f", req.VoteAverage))

	slug := req.Slug
	if slug == "" {
		if req.TitleEng != "" {
			slug = utils.Slugify(req.TitleEng)
		} else if req.TitleLat != "" {
			slug = utils.Slugify(req.TitleLat)
		} else if req.TitleEsp != "" {
			slug = utils.Slugify(req.TitleEsp)
		} else {
			slug = utils.Slugify(req.OriginalName)
		}
	}

	err = s.db.UpdateSerieBasic(r.Context(), db.UpdateSerieBasicParams{
		ID:             id,
		OriginalName:   req.OriginalName,
		Slug:           slug,
		TitleLat:       pgtype.Text{String: req.TitleLat, Valid: req.TitleLat != ""},
		TitleEsp:       pgtype.Text{String: req.TitleEsp, Valid: req.TitleEsp != ""},
		TitleEng:       pgtype.Text{String: req.TitleEng, Valid: req.TitleEng != ""},
		Overview:       pgtype.Text{String: req.Overview, Valid: req.Overview != ""},
		TrailerKey:     pgtype.Text{String: req.TrailerKey, Valid: req.TrailerKey != ""},
		FirstAirDate:   firstAirDate,
		EpisodeRunTime: pgtype.Int2{Int16: int16(req.EpisodeRunTime), Valid: true},

		VoteAverage:    voteAvg,
		VoteCount:      int64(req.VoteCount),
		Active:         req.Status == "Publicado",
		Premium:        req.Premium,
		Premiere:       req.Premiere,
		Upcoming:       req.Upcoming,
		Certification:  pgtype.Text{String: req.Certification, Valid: req.Certification != ""},
	})
	if err != nil {
		http.Error(w, "Error updating serie", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// handleSetMainMediaImage
func (s *Server) handleSetMainMediaImage(w http.ResponseWriter, r *http.Request) {
  var req struct {
    ImageID int64  `json:"image_id"`
    Type    string `json:"type"`
    MovieID *int64 `json:"movie_id"`
    SerieID *int64 `json:"serie_id"`
  }
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "Invalid request", http.StatusBadRequest)
    return
  }

  params := db.UnsetMainMediaImagesParams{
    Type: req.Type,
  }
  if req.MovieID != nil {
    params.MovieID = pgtype.Int8{Int64: *req.MovieID, Valid: true}
  }
  if req.SerieID != nil {
    params.SerieID = pgtype.Int8{Int64: *req.SerieID, Valid: true}
  }

  err := s.db.UnsetMainMediaImages(r.Context(), params)
  if err != nil {
    http.Error(w, "Error unsetting images", http.StatusInternalServerError)
    return
  }

  err = s.db.SetMainMediaImage(r.Context(), req.ImageID)
  if err != nil {
    http.Error(w, "Error setting image", http.StatusInternalServerError)
    return
  }

  w.WriteHeader(http.StatusOK)
}


func (s *Server) handleSearchMediaImages(w http.ResponseWriter, r *http.Request) {
  tmdbIdStr := r.URL.Query().Get("tmdb_id")
  mediaType := r.URL.Query().Get("type")
  tmdbId, err := strconv.ParseInt(tmdbIdStr, 10, 64)
  if err != nil {
    http.Error(w, "ID invÃƒÂ¡lido", http.StatusBadRequest)
    return
  }

  fp := NewFanartProvider()
  images, err := fp.GetExtraImages(tmdbId, mediaType)
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }

  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(images)
}

func (s *Server) handleAddMediaImage(w http.ResponseWriter, r *http.Request) {
  var req struct {
    FilePath    string `json:"file_path"`
    Type        string `json:"type"`
    Source      string `json:"source"`
    LanguageIso string `json:"language_iso"`
    MovieID     *int64 `json:"movie_id"`
    SerieID     *int64 `json:"serie_id"`
  }
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "Invalid request", http.StatusBadRequest)
    return
  }

  params := db.InsertMediaImageParams{
    FilePath: req.FilePath,
    Type: req.Type,
    Source: req.Source,
    LanguageIso: pgtype.Text{String: req.LanguageIso, Valid: req.LanguageIso != ""},
    IsMain: false,
  }
  if req.MovieID != nil {
    params.MovieID = pgtype.Int8{Int64: *req.MovieID, Valid: true}
  } else if req.SerieID != nil {
    params.SerieID = pgtype.Int8{Int64: *req.SerieID, Valid: true}
  }

	_, err := s.db.InsertMediaImage(r.Context(), params)
	if err != nil && err != pgx.ErrNoRows {
		http.Error(w, "Error insertando imagen", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) handleDeleteMediaImage(w http.ResponseWriter, r *http.Request) {
  idStr := chi.URLParam(r, "imageId")
  id, err := strconv.ParseInt(idStr, 10, 64)
  if err != nil {
    http.Error(w, "ID invÃƒÂ¡lido", http.StatusBadRequest)
    return
  }

  err = s.db.DeleteMediaImage(r.Context(), id)
  if err != nil {
    http.Error(w, "Error eliminando imagen", http.StatusInternalServerError)
    return
  }

  w.WriteHeader(http.StatusNoContent)
}


func (s *Server) handleDeleteRelation(w http.ResponseWriter, r *http.Request) {
	mediaType := chi.URLParam(r, "mediaType")
	mediaIDStr := chi.URLParam(r, "mediaId")
	relationType := chi.URLParam(r, "relationType")
	relationIDStr := chi.URLParam(r, "relationId")

	mediaID, err1 := strconv.ParseInt(mediaIDStr, 10, 64)
	relationID, err2 := strconv.ParseInt(relationIDStr, 10, 64)

	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid IDs", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	var err error

	switch mediaType {
	case "movies":
		switch relationType {
		case "casts":
			err = s.db.DeleteMovieCast(ctx, db.DeleteMovieCastParams{MovieID: mediaID, CastID: relationID})
		case "genres":
			err = s.db.DeleteMovieGenre(ctx, db.DeleteMovieGenreParams{MovieID: mediaID, GenreID: relationID})
		case "networks":
			err = s.db.DeleteMovieNetwork(ctx, db.DeleteMovieNetworkParams{MovieID: mediaID, NetworkID: relationID})
		case "collections":
			err = s.db.DeleteMovieCollection(ctx, db.DeleteMovieCollectionParams{MovieID: mediaID, CollectionID: relationID})
		}
	case "series":
		switch relationType {
		case "casts":
			err = s.db.DeleteSerieCast(ctx, db.DeleteSerieCastParams{SerieID: mediaID, CastID: relationID})
		case "genres":
			err = s.db.DeleteSerieGenre(ctx, db.DeleteSerieGenreParams{SerieID: mediaID, GenreID: relationID})
		case "networks":
			err = s.db.DeleteSerieNetwork(ctx, db.DeleteSerieNetworkParams{SerieID: mediaID, NetworkID: relationID})
		}
	}

	if err != nil {
		http.Error(w, "Error eliminando relacion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// handleSearchRelation
func (s *Server) handleSearchRelation(w http.ResponseWriter, r *http.Request) {
	relType := chi.URLParam(r, "type")
	query := r.URL.Query().Get("q")
	
	w.Header().Set("Content-Type", "application/json")
	
	switch relType {
	case "genres":
		res, err := s.db.SearchGenres(r.Context(), pgtype.Text{String: query, Valid: query != ""})
		if err != nil { json.NewEncoder(w).Encode([]interface{}{}) ; return }
		json.NewEncoder(w).Encode(res)
	case "networks":
		res, err := s.db.SearchNetworks(r.Context(), pgtype.Text{String: query, Valid: query != ""})
		if err != nil { json.NewEncoder(w).Encode([]interface{}{}) ; return }
		json.NewEncoder(w).Encode(res)
	case "casts":
		res, err := s.db.SearchCasts(r.Context(), pgtype.Text{String: query, Valid: query != ""})
		if err != nil { json.NewEncoder(w).Encode([]interface{}{}) ; return }
		json.NewEncoder(w).Encode(res)
	case "collections":
		res, err := s.db.SearchCollections(r.Context(), pgtype.Text{String: query, Valid: query != ""})
		if err != nil { json.NewEncoder(w).Encode([]interface{}{}) ; return }
		json.NewEncoder(w).Encode(res)
	case "countries":
		res, err := s.db.SearchCountries(r.Context(), pgtype.Text{String: query, Valid: query != ""})
		if err != nil { json.NewEncoder(w).Encode([]interface{}{}) ; return }
		json.NewEncoder(w).Encode(res)
	default:
		http.Error(w, "Invalid type", http.StatusBadRequest)
	}
}

// handleAddRelation
func (s *Server) handleAddRelation(w http.ResponseWriter, r *http.Request) {
	mediaType := chi.URLParam(r, "mediaType")
	idStr := chi.URLParam(r, "id")
	mediaID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID invÃ¡lido", http.StatusBadRequest)
		return
	}
	relType := chi.URLParam(r, "relationType")
	
	var req struct {
		RelationID int64 `json:"relation_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	switch mediaType {
	case "movies":
		switch relType {
		case "casts":
			err = s.db.InsertMovieCast(r.Context(), db.InsertMovieCastParams{MovieID: mediaID, CastID: req.RelationID, SortOrder: 999})
		case "genres":
			err = s.db.InsertMovieGenre(r.Context(), db.InsertMovieGenreParams{MovieID: mediaID, GenreID: req.RelationID})
		case "networks":
			err = s.db.InsertMovieNetwork(r.Context(), db.InsertMovieNetworkParams{MovieID: mediaID, NetworkID: req.RelationID})
		case "collections":
			err = s.db.InsertMovieCollection(r.Context(), db.InsertMovieCollectionParams{MovieID: mediaID, CollectionID: req.RelationID})
		case "countries":
			err = s.db.InsertMovieCountry(r.Context(), db.InsertMovieCountryParams{MovieID: mediaID, CountryID: req.RelationID})
		}
	case "series":
		switch relType {
		case "casts":
			err = s.db.InsertSerieCast(r.Context(), db.InsertSerieCastParams{SerieID: mediaID, CastID: req.RelationID, SortOrder: 999})
		case "genres":
			err = s.db.InsertSerieGenre(r.Context(), db.InsertSerieGenreParams{SerieID: mediaID, GenreID: req.RelationID})
		case "networks":
			err = s.db.InsertSerieNetwork(r.Context(), db.InsertSerieNetworkParams{SerieID: mediaID, NetworkID: req.RelationID})
		case "countries":
			err = s.db.InsertSerieCountry(r.Context(), db.InsertSerieCountryParams{SerieID: mediaID, CountryID: req.RelationID})
		}
	}

	if err != nil {
		http.Error(w, "Error vinculando", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

