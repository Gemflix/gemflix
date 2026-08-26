package api

import (
	"encoding/json"
	"net/http"
)

func (s *Server) handleGetProfiles(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extraer UserID del contexto inyectado por el AuthMiddleware
	userID := getUserID(ctx)

	// Traer los perfiles de la DB
	profiles, err := s.db.ListUserProfiles(ctx, userID)
	if err != nil {
		http.Error(w, "Error fetching profiles", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profiles)
}
