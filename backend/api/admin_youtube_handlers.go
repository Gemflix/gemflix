package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
)

func (s *Server) handleYouTubeSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query is required", http.StatusBadRequest)
		return
	}

	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		http.Error(w, "YOUTUBE_API_KEY no configurado en .env", http.StatusInternalServerError)
		return
	}

	// Make request to YouTube API
	searchURL := fmt.Sprintf("https://www.googleapis.com/youtube/v3/search?part=snippet&q=%s&type=video&key=%s&maxResults=5", url.QueryEscape(query), apiKey)

	resp, err := http.Get(searchURL)
	if err != nil {
		http.Error(w, "Error contactando a YouTube", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Error en la respuesta de YouTube", resp.StatusCode)
		return
	}

	var ytResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&ytResp); err != nil {
		http.Error(w, "Error decodificando respuesta", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ytResp)
}
