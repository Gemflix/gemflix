package api

import (
	"encoding/json"
	"net/http"
)

// handleRewriteOverview uses the modular CallGroqAPI to improve a movie or serie overview
func (s *Server) handleRewriteOverview(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Overview string `json:"overview"`
		Title    string `json:"title"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	systemPrompt := "Eres un redactor experto para una plataforma de streaming premium."
	userPrompt := "Eres un experto en cine. Reescribe y mejora la siguiente sinopsis para que sea más atractiva, misteriosa y profesional, sin revelar spoilers. La película/serie es: " + req.Title + ". Sinopsis original: " + req.Overview

	// Using the modular CallGroqAPI with a more powerful model for rewriting
	result, err := CallGroqAPI(r.Context(), systemPrompt, userPrompt, "llama3-70b-8192")
	if err != nil {
		http.Error(w, "Error calling Groq API: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"overview": result,
	})
}
