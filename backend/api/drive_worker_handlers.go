package api

import (
	"encoding/json"
	"net/http"
	"os"
)

// WorkerSecretMiddleware protege las rutas del Worker de Cloudflare
func (s *Server) WorkerSecretMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secret := r.Header.Get("X-Worker-Secret")
		expectedSecret := os.Getenv("DRIVE_WORKER_SECRET")

		if expectedSecret == "" || secret != expectedSecret {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}

		next.ServeHTTP(w, r)
	})
}

type ValidateTicketRequest struct {
	Ticket string `json:"ticket"`
}

func (s *Server) handleWorkerValidateTicket(w http.ResponseWriter, r *http.Request) {
	var req ValidateTicketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Fetch real ticket from DB or Redis using req.Ticket
	// For now, we mock the response to satisfy the worker format

	// The worker expects a JSON like:
	// { "valid": true, "data": { "expires_at": 123456789, "access_type": "premium_stream", "google_file_id": "...", "size_bytes": 1000 } }

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid": false,
		"error": "not_implemented_yet",
	})
}

type OriginCredentialsRequest struct {
	Ticket string `json:"ticket"`
}

func (s *Server) handleWorkerOriginCredentials(w http.ResponseWriter, r *http.Request) {
	var req OriginCredentialsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Fetch Google Drive OAuth token for the source associated with the ticket
	// Mock response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid": false,
		"error": "not_implemented_yet",
	})
}

func (s *Server) handleWorkerSecurityEvent(w http.ResponseWriter, r *http.Request) {
	// Solo registrar el evento en logs o DB
	// Fire and forget response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "logged",
	})
}
