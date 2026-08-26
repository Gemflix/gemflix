package api

import (
	"encoding/json"
	"net/http"
	db "proyecto-go/db/sqlc"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func parseDate(d string) pgtype.Date {
	if t, err := time.Parse("2006-01-02", d); err == nil {
		return pgtype.Date{Time: t, Valid: true}
	}
	return pgtype.Date{}
}

func (s *Server) handleGetCollectionsList(w http.ResponseWriter, r *http.Request) {
	collections, err := s.db.GetCollections(r.Context())
	if err != nil {
		http.Error(w, "Error fetching collections", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collections)
}

func (s *Server) handleGetNetworksList(w http.ResponseWriter, r *http.Request) {
	networks, err := s.db.GetNetworks(r.Context())
	if err != nil {
		http.Error(w, "Error fetching networks", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(networks)
}

func (s *Server) handleGetGenresList(w http.ResponseWriter, r *http.Request) {
	genres, err := s.db.GetGenres(r.Context())
	if err != nil {
		http.Error(w, "Error fetching genres", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(genres)
}

func (s *Server) handleGetCastsList(w http.ResponseWriter, r *http.Request) {
	// For casts, we will paginate
	pageStr := r.URL.Query().Get("page")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 100
	offset := (page - 1) * limit

	casts, err := s.db.GetCastsPaginated(r.Context(), db.GetCastsPaginatedParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, "Error fetching casts", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(casts)
}

// Genre CRUD
func (s *Server) handleCreateGenre(w http.ResponseWriter, r *http.Request) {
	var req struct {
		NameEng   string `json:"name_eng"`
		NameEsp   string `json:"name_esp"`
		ImagePath string `json:"image_path"`
		Slug      string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	genre, err := s.db.CreateGenre(r.Context(), db.CreateGenreParams{NameEng: req.NameEng, NameEsp: pgtype.Text{String: req.NameEsp, Valid: req.NameEsp != ""}, ImagePath: pgtype.Text{String: req.ImagePath, Valid: req.ImagePath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(genre)
}

func (s *Server) handleUpdateGenre(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var req struct {
		NameEng   string `json:"name_eng"`
		NameEsp   string `json:"name_esp"`
		ImagePath string `json:"image_path"`
		Slug      string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	genre, err := s.db.UpdateGenre(r.Context(), db.UpdateGenreParams{ID: id, NameEng: req.NameEng, NameEsp: pgtype.Text{String: req.NameEsp, Valid: req.NameEsp != ""}, ImagePath: pgtype.Text{String: req.ImagePath, Valid: req.ImagePath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(genre)
}

func (s *Server) handleDeleteGenre(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.db.DeleteGenre(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Network CRUD
func (s *Server) handleCreateNetwork(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string `json:"name"`
		PosterPath   string `json:"poster_path"`
		BackdropPath string `json:"backdrop_path"`
		Slug         string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	network, err := s.db.CreateNetwork(r.Context(), db.CreateNetworkParams{Name: req.Name, PosterPath: pgtype.Text{String: req.PosterPath, Valid: req.PosterPath != ""}, BackdropPath: pgtype.Text{String: req.BackdropPath, Valid: req.BackdropPath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(network)
}

func (s *Server) handleUpdateNetwork(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var req struct {
		Name         string `json:"name"`
		PosterPath   string `json:"poster_path"`
		BackdropPath string `json:"backdrop_path"`
		Slug         string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	network, err := s.db.UpdateNetwork(r.Context(), db.UpdateNetworkParams{ID: id, Name: req.Name, PosterPath: pgtype.Text{String: req.PosterPath, Valid: req.PosterPath != ""}, BackdropPath: pgtype.Text{String: req.BackdropPath, Valid: req.BackdropPath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(network)
}

func (s *Server) handleDeleteNetwork(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.db.DeleteNetwork(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Cast CRUD
func (s *Server) handleCreateCast(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name               string `json:"name"`
		OriginalName       string `json:"original_name"`
		Gender             int16  `json:"gender"`
		PlaceOfBirth       string `json:"place_of_birth"`
		ProfilePath        string `json:"profile_path"`
		ImdbId             string `json:"imdb_id"`
		KnownForDepartment string `json:"known_for_department"`
		Biography          string `json:"biography"`
		Adult              bool   `json:"adult"`
		Birthday           string `json:"birthday"`
		Deathday           string `json:"deathday"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	cast, err := s.db.CreateCast(r.Context(), db.CreateCastParams{Name: req.Name, OriginalName: pgtype.Text{String: req.OriginalName, Valid: req.OriginalName != ""}, Gender: pgtype.Int2{Int16: req.Gender, Valid: req.Gender > 0}, PlaceOfBirth: pgtype.Text{String: req.PlaceOfBirth, Valid: req.PlaceOfBirth != ""}, ProfilePath: pgtype.Text{String: req.ProfilePath, Valid: req.ProfilePath != ""}, ImdbID: pgtype.Text{String: req.ImdbId, Valid: req.ImdbId != ""}, KnownForDepartment: pgtype.Text{String: req.KnownForDepartment, Valid: req.KnownForDepartment != ""}, Biography: pgtype.Text{String: req.Biography, Valid: req.Biography != ""}, Adult: req.Adult, Birthday: parseDate(req.Birthday), Deathday: parseDate(req.Deathday)})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(cast)
}

func (s *Server) handleUpdateCast(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var req struct {
		Name               string `json:"name"`
		OriginalName       string `json:"original_name"`
		Gender             int16  `json:"gender"`
		PlaceOfBirth       string `json:"place_of_birth"`
		ProfilePath        string `json:"profile_path"`
		ImdbId             string `json:"imdb_id"`
		KnownForDepartment string `json:"known_for_department"`
		Biography          string `json:"biography"`
		Adult              bool   `json:"adult"`
		Birthday           string `json:"birthday"`
		Deathday           string `json:"deathday"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	cast, err := s.db.UpdateCast(r.Context(), db.UpdateCastParams{ID: id, Name: req.Name, OriginalName: pgtype.Text{String: req.OriginalName, Valid: req.OriginalName != ""}, Gender: pgtype.Int2{Int16: req.Gender, Valid: req.Gender > 0}, PlaceOfBirth: pgtype.Text{String: req.PlaceOfBirth, Valid: req.PlaceOfBirth != ""}, ProfilePath: pgtype.Text{String: req.ProfilePath, Valid: req.ProfilePath != ""}, ImdbID: pgtype.Text{String: req.ImdbId, Valid: req.ImdbId != ""}, KnownForDepartment: pgtype.Text{String: req.KnownForDepartment, Valid: req.KnownForDepartment != ""}, Biography: pgtype.Text{String: req.Biography, Valid: req.Biography != ""}, Adult: req.Adult, Birthday: parseDate(req.Birthday), Deathday: parseDate(req.Deathday)})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(cast)
}

func (s *Server) handleDeleteCast(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.db.DeleteCast(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Collection CRUD
func (s *Server) handleCreateCollection(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OriginalName string `json:"original_name"`
		NameLat      string `json:"name_lat"`
		NameEsp      string `json:"name_esp"`
		NameEng      string `json:"name_eng"`
		Overview     string `json:"overview"`
		PosterPath   string `json:"poster_path"`
		BackdropPath string `json:"backdrop_path"`
		Slug         string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	col, err := s.db.CreateCollection(r.Context(), db.CreateCollectionParams{OriginalName: req.OriginalName, NameLat: pgtype.Text{String: req.NameLat, Valid: req.NameLat != ""}, NameEsp: pgtype.Text{String: req.NameEsp, Valid: req.NameEsp != ""}, NameEng: pgtype.Text{String: req.NameEng, Valid: req.NameEng != ""}, Overview: pgtype.Text{String: req.Overview, Valid: req.Overview != ""}, PosterPath: pgtype.Text{String: req.PosterPath, Valid: req.PosterPath != ""}, BackdropPath: pgtype.Text{String: req.BackdropPath, Valid: req.BackdropPath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(col)
}

func (s *Server) handleUpdateCollection(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var req struct {
		OriginalName string `json:"original_name"`
		NameLat      string `json:"name_lat"`
		NameEsp      string `json:"name_esp"`
		NameEng      string `json:"name_eng"`
		Overview     string `json:"overview"`
		PosterPath   string `json:"poster_path"`
		BackdropPath string `json:"backdrop_path"`
		Slug         string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	col, err := s.db.UpdateCollection(r.Context(), db.UpdateCollectionParams{ID: id, OriginalName: req.OriginalName, NameLat: pgtype.Text{String: req.NameLat, Valid: req.NameLat != ""}, NameEsp: pgtype.Text{String: req.NameEsp, Valid: req.NameEsp != ""}, NameEng: pgtype.Text{String: req.NameEng, Valid: req.NameEng != ""}, Overview: pgtype.Text{String: req.Overview, Valid: req.Overview != ""}, PosterPath: pgtype.Text{String: req.PosterPath, Valid: req.PosterPath != ""}, BackdropPath: pgtype.Text{String: req.BackdropPath, Valid: req.BackdropPath != ""}, Slug: req.Slug})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(col)
}

func (s *Server) handleDeleteCollection(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.db.DeleteCollection(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Country CRUD
func (s *Server) handleCreateCountry(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		EnglishName string `json:"english_name"`
		Iso31661    string `json:"iso_3166_1"`
		LogoPath    string `json:"logo_path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	country, err := s.db.CreateCountry(r.Context(), db.CreateCountryParams{Name: req.Name, EnglishName: pgtype.Text{String: req.EnglishName, Valid: req.EnglishName != ""}, Iso31661: req.Iso31661, LogoPath: pgtype.Text{String: req.LogoPath, Valid: req.LogoPath != ""}})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(country)
}

func (s *Server) handleUpdateCountry(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var req struct {
		Name        string `json:"name"`
		EnglishName string `json:"english_name"`
		Iso31661    string `json:"iso_3166_1"`
		LogoPath    string `json:"logo_path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	country, err := s.db.UpdateCountry(r.Context(), db.UpdateCountryParams{ID: id, Name: req.Name, EnglishName: pgtype.Text{String: req.EnglishName, Valid: req.EnglishName != ""}, Iso31661: req.Iso31661, LogoPath: pgtype.Text{String: req.LogoPath, Valid: req.LogoPath != ""}})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(country)
}

func (s *Server) handleDeleteCountry(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.db.DeleteCountry(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
