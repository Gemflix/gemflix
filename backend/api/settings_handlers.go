package api

import (
	"encoding/json"
	"net/http"
)

func (s *Server) handleGetSettings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	settingsList, err := s.db.ListAppSettings(ctx)
	if err != nil {
		http.Error(w, "Error fetching settings", http.StatusInternalServerError)
		return
	}

	// Convertir la lista de (key, value) en un mapa JSON
	settingsMap := make(map[string]string)
	for _, setting := range settingsList {
		settingsMap[setting.Key] = setting.Value
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settingsMap)
}
