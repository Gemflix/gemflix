package api

import (
	"encoding/json"
	"net/http"

	"proyecto-go/db/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

// handleGetStats obtiene las estadísticas generales (conteo)
func (s *Server) handleGetStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	stats, err := s.db.GetAdminStats(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_users":    stats.TotalUsers,
		"total_movies":   stats.TotalMovies,
		"active_devices": stats.ActiveDevices,
		"total_revenue":  "$45,231", // Dato hardcodeado (ejemplo) hasta integrar payments
	})
}

// handleGetUsers obtiene los usuarios reales de la base de datos
func (s *Server) handleGetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	users, err := s.db.GetAdminUsersList(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Mapear los datos para el Frontend
	response := make([]map[string]interface{}, 0)
	for _, u := range users {
		status := "Activo"
		if u.IsShadowbanned {
			status = "Shadowbanned"
		}
		response = append(response, map[string]interface{}{
			"id":     u.ID,
			"name":   u.Name,
			"email":  u.Email,
			"role":   u.PrimaryRole,
			"status": status,
		})
	}

	json.NewEncoder(w).Encode(response)
}

// handleGetStaff obtiene los usuarios con rol de staff
func (s *Server) handleGetStaff(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	staff, err := s.db.GetAdminStaffList(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := make([]map[string]interface{}, 0)
	for _, u := range staff {
		status := "Activo"
		if u.IsShadowbanned {
			status = "Shadowbanned"
		}
		response = append(response, map[string]interface{}{
			"id":     u.ID,
			"name":   u.Name,
			"email":  u.Email,
			"role":   u.PrimaryRole,
			"status": status,
		})
	}

	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleGetRoles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	roles, err := s.db.GetAdminRoles(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(roles)
}

func (s *Server) handleGetPermissions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	permissions, err := s.db.GetAllPermissions(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(permissions)
}

func (s *Server) handleCreateRole(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		PermissionIDs []int64 `json:"permission_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	role, err := s.db.CreateAdminRole(r.Context(), db.CreateAdminRoleParams{
		Name:        req.Name,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, pid := range req.PermissionIDs {
		_ = s.db.AssignPermissionToRole(r.Context(), db.AssignPermissionToRoleParams{
			RoleID:       role.ID,
			PermissionID: pid,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(role)
}

func (s *Server) handleCreateStaff(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		RoleID   int64  `json:"role_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Simplificado para el ejemplo (usar bcrypt real en prod)
	passwordHash := "$2a$10$wI8aP5fI.O.p1y.p8T0Q5uXl.L/4G.t9Q.h.p3h/gP.n.u.p.x/eG" 

	staff, err := s.db.CreateAdminStaff(r.Context(), db.CreateAdminStaffParams{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: pgtype.Text{String: passwordHash, Valid: true}, // Hardcoded hash for simplicity
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = s.db.AssignRoleToUser(r.Context(), db.AssignRoleToUserParams{
		UserID: staff.ID,
		RoleID: req.RoleID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staff)
}

// handleGetMovies obtiene las películas reales del catálogo
func (s *Server) handleGetMovies(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	movies, err := s.db.GetAdminMoviesList(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := make([]map[string]interface{}, 0)
	for _, m := range movies {
		status := "Oculto"
		if m.Active {
			status = "Publicado"
		}
		
		releaseDateStr := ""
		if m.ReleaseDate.Valid {
			releaseDateStr = m.ReleaseDate.Time.Format("2006-01-02")
		}

		response = append(response, map[string]interface{}{
			"id":           m.ID,
			"title":        m.Title,
			"release_date": releaseDateStr,
			"views":        m.Views,
			"status":       status,
			"active":       m.Active,
			"premium":      m.Premium,
			"premiere":     m.Premiere,
			"upcoming":     m.Upcoming,
			"poster_path":  m.PosterPath,
		})
	}

	json.NewEncoder(w).Encode(response)
}

// handleGetDevices obtiene la lista de dispositivos (sesiones)
func (s *Server) handleGetDevices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	devices, err := s.db.GetAdminDevicesList(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := make([]map[string]interface{}, 0)
	for _, d := range devices {
		status := "Inactivo"
		if d.Active {
			status = "Activo"
		}
		
		ip := "Desconocida"
		if d.LastIp != nil {
			ip = d.LastIp.String()
		}

		response = append(response, map[string]interface{}{
			"id":           d.ID,
			"user_name":    d.UserName,
			"platform":     d.Platform,
			"device_brand": d.DeviceBrand.String,
			"os_version":   d.OsVersion.String,
			"last_ip":      ip,
			"status":       status,
		})
	}

	json.NewEncoder(w).Encode(response)
}

// handleUpdateSettings permite al administrador actualizar la imagen de fondo y logos
func (s *Server) handleUpdateSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Cuerpo de solicitud inválido", http.StatusBadRequest)
		return
	}

	err := s.db.UpdateAppSetting(r.Context(), db.UpdateAppSettingParams{
		Key:   req.Key,
		Value: req.Value,
	})

	if err != nil {
		http.Error(w, "Error actualizando configuración", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success"}`))
}

// handleGetCountriesList
func (s *Server) handleGetCountriesList(w http.ResponseWriter, r *http.Request) {
	countries, err := s.db.GetCountriesPaginated(r.Context(), db.GetCountriesPaginatedParams{Limit: 100, Offset: 0})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if countries == nil {
		countries = make([]db.Country, 0)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(countries)
}
