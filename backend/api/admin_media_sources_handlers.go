package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	db "proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type MediaSourcePayload struct {
	EpisodeID     *int64  `json:"episode_id"`
	MovieID       *int64  `json:"movie_id"`
	Label         string  `json:"label"`
	Type          string  `json:"type"`
	Quality       string  `json:"quality"`
	Link          string  `json:"link"`
	LinkHash      string  `json:"link_hash"`
	SizeBytes     *int64  `json:"size_bytes"`
	DurationSec   *int32  `json:"duration_sec"`
	VideoCodec    string  `json:"video_codec"`
	AudioChannels string  `json:"audio_channels"`
	DynamicRange  string  `json:"dynamic_range"`
	BitDepth      *int16  `json:"bit_depth"`
	RecapStart    *int32  `json:"recap_start"`
	RecapEnd      *int32  `json:"recap_end"`
	OpeningStart  *int32  `json:"opening_start"`
	OpeningEnd    *int32  `json:"opening_end"`
	EndingStart   *int32  `json:"ending_start"`
	EndingEnd     *int32  `json:"ending_end"`
}

type AudioTrackPayload struct {
	MediaSourceID int64  `json:"media_source_id"`
	TrackNo       int16  `json:"track_no"`
	Lang          string `json:"lang"`
	Codec         string `json:"codec"`
	ChannelLayout string `json:"channel_layout"`
	BitrateKbps   *int16 `json:"bitrate_kbps"`
	SampleRateHz  *int32 `json:"sample_rate_hz"`
	IsDefault     bool   `json:"is_default"`
	Title         string `json:"title"`
}

type SubtitleTrackPayload struct {
	MediaSourceID int64  `json:"media_source_id"`
	TrackNo       int16  `json:"track_no"`
	Lang          string `json:"lang"`
	Type          string `json:"type"`
	Embedded      bool   `json:"embedded"`
	Link          string `json:"link"`
	LinkHash      string `json:"link_hash"`
	Forced        bool   `json:"forced"`
	IsDefault     bool   `json:"is_default"`
	Title         string `json:"title"`
}

func (s *Server) handleGetEpisodeMediaSources(w http.ResponseWriter, r *http.Request) {
	episodeIDStr := chi.URLParam(r, "episodeId")
	episodeID, err := strconv.ParseInt(episodeIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid episode ID", http.StatusBadRequest)
		return
	}

	sources, err := s.db.GetEpisodeMediaSources(r.Context(), pgtype.Int8{Int64: episodeID, Valid: true})
	if err != nil {
		http.Error(w, "Error fetching media sources", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sources)
}

func (s *Server) handleGetMovieMediaSources(w http.ResponseWriter, r *http.Request) {
	movieIDStr := chi.URLParam(r, "movieId")
	movieID, err := strconv.ParseInt(movieIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid movie ID", http.StatusBadRequest)
		return
	}

	sources, err := s.db.GetMovieMediaSources(r.Context(), pgtype.Int8{Int64: movieID, Valid: true})
	if err != nil {
		http.Error(w, "Error fetching media sources", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sources)
}

func (s *Server) handleCreateMediaSource(w http.ResponseWriter, r *http.Request) {
	var req MediaSourcePayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var episodeID pgtype.Int8
	if req.EpisodeID != nil {
		episodeID = pgtype.Int8{Int64: *req.EpisodeID, Valid: true}
	}

	var movieID pgtype.Int8
	if req.MovieID != nil {
		movieID = pgtype.Int8{Int64: *req.MovieID, Valid: true}
	}

	var label, quality, linkHash, videoCodec, audioChannels, dynamicRange pgtype.Text
	if req.Label != "" { label = pgtype.Text{String: req.Label, Valid: true} }
	if req.Quality != "" { quality = pgtype.Text{String: req.Quality, Valid: true} }
	if req.LinkHash != "" { linkHash = pgtype.Text{String: req.LinkHash, Valid: true} }
	if req.VideoCodec != "" { videoCodec = pgtype.Text{String: req.VideoCodec, Valid: true} }
	if req.AudioChannels != "" { audioChannels = pgtype.Text{String: req.AudioChannels, Valid: true} }
	if req.DynamicRange != "" { dynamicRange = pgtype.Text{String: req.DynamicRange, Valid: true} }

	var sizeBytes pgtype.Int8
	if req.SizeBytes != nil { sizeBytes = pgtype.Int8{Int64: *req.SizeBytes, Valid: true} }

	var durationSec pgtype.Int4
	if req.DurationSec != nil { durationSec = pgtype.Int4{Int32: *req.DurationSec, Valid: true} }

	var bitDepth pgtype.Int2
	if req.BitDepth != nil { bitDepth = pgtype.Int2{Int16: *req.BitDepth, Valid: true} }

	var recapStart, recapEnd, openingStart, openingEnd, endingStart, endingEnd int32
	if req.RecapStart != nil { recapStart = *req.RecapStart }
	if req.RecapEnd != nil { recapEnd = *req.RecapEnd }
	if req.OpeningStart != nil { openingStart = *req.OpeningStart }
	if req.OpeningEnd != nil { openingEnd = *req.OpeningEnd }
	if req.EndingStart != nil { endingStart = *req.EndingStart }
	if req.EndingEnd != nil { endingEnd = *req.EndingEnd }

	mediaType := "directo"
	if req.Type != "" { mediaType = req.Type }

	source, err := s.db.CreateMediaSource(r.Context(), db.CreateMediaSourceParams{
		EpisodeID:     episodeID,
		MovieID:       movieID,
		Label:         label,
		Quality:       quality,
		Type:          mediaType,
		Link:          req.Link,
		LinkHash:      linkHash,
		SizeBytes:     sizeBytes,
		DurationSec:   durationSec,
		VideoCodec:    videoCodec,
		AudioChannels: audioChannels,
		DynamicRange:  dynamicRange,
		BitDepth:      bitDepth,
		RecapStart:    recapStart,
		RecapEnd:      recapEnd,
		OpeningStart:  openingStart,
		OpeningEnd:    openingEnd,
		EndingStart:   endingStart,
		EndingEnd:     endingEnd,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(source)
}

func (s *Server) handleDeleteMediaSource(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = s.db.DeleteMediaSource(r.Context(), id)
	if err != nil {
		http.Error(w, "Error deleting source", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleGetMediaAudioTracks(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	tracks, err := s.db.GetMediaAudioTracks(r.Context(), id)
	if err != nil { http.Error(w, "Error fetching audios", http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tracks)
}

func (s *Server) handleGetMediaSubtitleTracks(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	tracks, err := s.db.GetMediaSubtitleTracks(r.Context(), id)
	if err != nil { http.Error(w, "Error fetching subtitles", http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tracks)
}

func (s *Server) handleCreateMediaAudioTrack(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	var req AudioTrackPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var lang, codec, channelLayout, title pgtype.Text
	if req.Lang != "" { lang = pgtype.Text{String: req.Lang, Valid: true} }
	if req.Codec != "" { codec = pgtype.Text{String: req.Codec, Valid: true} }
	if req.ChannelLayout != "" { channelLayout = pgtype.Text{String: req.ChannelLayout, Valid: true} }
	if req.Title != "" { title = pgtype.Text{String: req.Title, Valid: true} }

	var bitrate pgtype.Int2
	if req.BitrateKbps != nil { bitrate = pgtype.Int2{Int16: *req.BitrateKbps, Valid: true} }
	
	var sampleRate pgtype.Int4
	if req.SampleRateHz != nil { sampleRate = pgtype.Int4{Int32: *req.SampleRateHz, Valid: true} }

	track, err := s.db.CreateMediaAudioTrack(r.Context(), db.CreateMediaAudioTrackParams{
		MediaSourceID: id,
		TrackNo:       req.TrackNo,
		Lang:          lang,
		Codec:         codec,
		ChannelLayout: channelLayout,
		BitrateKbps:   bitrate,
		SampleRateHz:  sampleRate,
		IsDefault:     req.IsDefault,
		Title:         title,
	})
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(track)
}

func (s *Server) handleCreateMediaSubtitleTrack(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	var req SubtitleTrackPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var lang, typ, link, linkHash, title pgtype.Text
	if req.Lang != "" { lang = pgtype.Text{String: req.Lang, Valid: true} }
	if req.Type != "" { typ = pgtype.Text{String: req.Type, Valid: true} }
	if req.Link != "" { link = pgtype.Text{String: req.Link, Valid: true} }
	if req.LinkHash != "" { linkHash = pgtype.Text{String: req.LinkHash, Valid: true} }
	if req.Title != "" { title = pgtype.Text{String: req.Title, Valid: true} }

	track, err := s.db.CreateMediaSubtitleTrack(r.Context(), db.CreateMediaSubtitleTrackParams{
		MediaSourceID: id,
		TrackNo:       req.TrackNo,
		Lang:          lang,
		Type:          typ,
		Embedded:      req.Embedded,
		Link:          link,
		LinkHash:      linkHash,
		Forced:        req.Forced,
		IsDefault:     req.IsDefault,
		Title:         title,
	})
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(track)
}

func (s *Server) handleDeleteMediaAudioTrack(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	err = s.db.DeleteMediaAudioTrack(r.Context(), id)
	if err != nil { http.Error(w, "Error deleting", http.StatusInternalServerError); return }
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleDeleteMediaSubtitleTrack(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil { http.Error(w, "Invalid ID", http.StatusBadRequest); return }

	err = s.db.DeleteMediaSubtitleTrack(r.Context(), id)
	if err != nil { http.Error(w, "Error deleting", http.StatusInternalServerError); return }
	w.WriteHeader(http.StatusOK)
}
