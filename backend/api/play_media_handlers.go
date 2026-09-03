package api

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"database/sql"
	"time"
)

// handleGetMediaDetails fetches a movie or serie by slug or uuid.
func (s *Server) handleGetMediaDetails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idParam := chi.URLParam(r, "slug")

	// Determine if idParam is UUID or Slug
	isUUID := false
	if _, err := uuid.Parse(idParam); err == nil {
		isUUID = true
	}

	w.Header().Set("Content-Type", "application/json")

	// First try to find it in movies
	var movieQuery string
	if isUUID {
		movieQuery = `SELECT id, original_name, title_lat, overview, release_date, runtime, poster_path, backdrop_path, vote_average, is_type FROM movies WHERE uuid = $1 AND active = TRUE LIMIT 1`
	} else {
		movieQuery = `SELECT id, original_name, title_lat, overview, release_date, runtime, poster_path, backdrop_path, vote_average, is_type FROM movies WHERE slug = $1 AND active = TRUE LIMIT 1`
	}

	var mID int64
	var mOriginalName, mTitleLat, mOverview, mPoster, mBackdrop, mIsType sql.NullString
	var mReleaseDate sql.NullTime
	var mRuntime sql.NullInt16
	var mVoteAvg sql.NullFloat64

	err := s.dbPool.QueryRow(ctx, movieQuery, idParam).Scan(
		&mID, &mOriginalName, &mTitleLat, &mOverview, &mReleaseDate, &mRuntime, &mPoster, &mBackdrop, &mVoteAvg, &mIsType,
	)

	if err == nil {
		pStr := mPoster.String
		bStr := mBackdrop.String
		if pStr != "" {
			pStr = tmdbImage(pStr, "w500")
		}
		if bStr != "" {
			bStr = tmdbImage(bStr, "original")
		}
		
		relDate := ""
		if mReleaseDate.Valid {
		    relDate = mReleaseDate.Time.Format(time.DateOnly)
		}

		response := map[string]interface{}{
			"id":            mID,
			"original_name": mOriginalName.String,
			"title":         mTitleLat.String,
			"overview":      mOverview.String,
			"release_date":  relDate,
			"runtime":       mRuntime.Int16,
			"poster":        pStr,
			"backdrop":      bStr,
			"vote_average":  mVoteAvg.Float64,
			"type":          mIsType.String,
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Try Series
	var serieQuery string
	if isUUID {
		serieQuery = `SELECT id, original_name, title_lat, overview, first_air_date, poster_path, backdrop_path, vote_average, is_type FROM series WHERE uuid = $1 AND active = TRUE LIMIT 1`
	} else {
		serieQuery = `SELECT id, original_name, title_lat, overview, first_air_date, poster_path, backdrop_path, vote_average, is_type FROM series WHERE slug = $1 AND active = TRUE LIMIT 1`
	}

	var sID int64
	var sOriginalName, sTitleLat, sOverview, sPoster, sBackdrop, sIsType sql.NullString
	var sFirstAir sql.NullTime
	var sVoteAvg sql.NullFloat64

	err = s.dbPool.QueryRow(ctx, serieQuery, idParam).Scan(
		&sID, &sOriginalName, &sTitleLat, &sOverview, &sFirstAir, &sPoster, &sBackdrop, &sVoteAvg, &sIsType,
	)

	if err == nil {
		pStr := sPoster.String
		bStr := sBackdrop.String
		if pStr != "" {
			pStr = tmdbImage(pStr, "w500")
		}
		if bStr != "" {
			bStr = tmdbImage(bStr, "original")
		}
		
		relDate := ""
		if sFirstAir.Valid {
		    relDate = sFirstAir.Time.Format(time.DateOnly)
		}

		response := map[string]interface{}{
			"id":            sID,
			"original_name": sOriginalName.String,
			"title":         sTitleLat.String,
			"overview":      sOverview.String,
			"release_date":  relDate,
			"poster":        pStr,
			"backdrop":      bStr,
			"vote_average":  sVoteAvg.Float64,
			"type":          sIsType.String,
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	http.Error(w, "Media not found", http.StatusNotFound)
}
