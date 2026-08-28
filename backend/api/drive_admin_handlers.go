package api

import (
	"encoding/json"
	"net/http"
	"proyecto-go/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

// Listar cuentas de servicio
func (s *Server) handleGetDriveAccounts(w http.ResponseWriter, r *http.Request) {
	accounts, err := s.db.GetActiveServiceAccounts(r.Context())
	if err != nil {
		http.Error(w, "Error fetching accounts", http.StatusInternalServerError)
		return
	}

	if accounts == nil {
		accounts = make([]db.DriveServiceAccount, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(accounts)
}

type CreateDriveAccountRequest struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	Provider        string `json:"provider"` // google_drive
	CredentialsJson string `json:"credentials_json"`
	QuotaLimitBytes int64  `json:"quota_limit_bytes"`
}

// Crear cuenta de servicio
func (s *Server) handleCreateDriveAccount(w http.ResponseWriter, r *http.Request) {
	var req CreateDriveAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	account, err := s.db.CreateServiceAccount(r.Context(), db.CreateServiceAccountParams{
		Name:            req.Name,
		Email:           req.Email,
		Provider:        req.Provider,
		CredentialsJson: req.CredentialsJson,
		QuotaLimitBytes: pgtype.Int8{Int64: req.QuotaLimitBytes, Valid: true},
	})

	if err != nil {
		http.Error(w, "Error creating account", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(account)
}

// Listar fuentes
func (s *Server) handleGetDriveSources(w http.ResponseWriter, r *http.Request) {
	// TODO: Create a sqlc query for GetDriveSources if it doesn't exist
	// Mock implementation
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(make([]interface{}, 0))
}

type CreateDriveSourceRequest struct {
	ServiceAccountID    int64  `json:"service_account_id"`
	Name                string `json:"name"`
	FolderID            string `json:"folder_id"`
	Provider            string `json:"provider"`
	SyncIntervalMinutes int32  `json:"sync_interval_minutes"`
}

// Crear fuente
func (s *Server) handleCreateDriveSource(w http.ResponseWriter, r *http.Request) {
	var req CreateDriveSourceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	source, err := s.db.CreateDriveSource(r.Context(), db.CreateDriveSourceParams{
		ServiceAccountID:    pgtype.Int8{Int64: req.ServiceAccountID, Valid: true},
		Name:                req.Name,
		FolderID:            req.FolderID,
		Provider:            req.Provider,
		SyncIntervalMinutes: pgtype.Int4{Int32: req.SyncIntervalMinutes, Valid: true},
	})

	if err != nil {
		http.Error(w, "Error creating source", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(source)
}

// Monitor
func (s *Server) handleGetDriveMonitorStats(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{
		"active_sources":  0,
		"running_syncs":   0,
		"completed_syncs": 0,
		"failed_syncs":    0,
		"last_files":      0,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// Listar replicas
func (s *Server) handleGetDriveReplicas(w http.ResponseWriter, r *http.Request) {
	replicas, err := s.db.ListReplicas(r.Context())
	if err != nil {
		http.Error(w, "Error fetching replicas", http.StatusInternalServerError)
		return
	}

	if replicas == nil {
		replicas = make([]db.ListReplicasRow, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(replicas)
}

type CreateDriveReplicaRequest struct {
	ServiceAccountID  int64  `json:"service_account_id"`
	Name              string `json:"name"`
	SharedDriveID     string `json:"shared_drive_id"`
	StreamingFolderID string `json:"streaming_folder_id"`
	GemdriveFolderID  string `json:"gemdrive_folder_id"`
	RecoveryFolderID  string `json:"recovery_folder_id"`
	SpaceLimitGib     int32  `json:"space_limit_gib"`
	Priority          int32  `json:"priority"`
}

// Crear replica
func (s *Server) handleCreateDriveReplica(w http.ResponseWriter, r *http.Request) {
	var req CreateDriveReplicaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	replica, err := s.db.CreateReplica(r.Context(), db.CreateReplicaParams{
		ServiceAccountID:  pgtype.Int8{Int64: req.ServiceAccountID, Valid: true},
		Name:              req.Name,
		SharedDriveID:     req.SharedDriveID,
		StreamingFolderID: pgtype.Text{String: req.StreamingFolderID, Valid: req.StreamingFolderID != ""},
		GemdriveFolderID:  pgtype.Text{String: req.GemdriveFolderID, Valid: req.GemdriveFolderID != ""},
		RecoveryFolderID:  pgtype.Text{String: req.RecoveryFolderID, Valid: req.RecoveryFolderID != ""},
		SpaceLimitGib:     pgtype.Int4{Int32: req.SpaceLimitGib, Valid: req.SpaceLimitGib > 0},
		Priority:          pgtype.Int4{Int32: req.Priority, Valid: true},
		HealthStatus:      pgtype.Text{String: "healthy", Valid: true},
	})

	if err != nil {
		http.Error(w, "Error creating replica", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(replica)
}
