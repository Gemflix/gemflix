package api

import (
	"context"
	"fmt"
	"log"
	"proyecto-go/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type PermissionDef struct {
	Name        string
	Group       string
	Description string
}

// SystemPermissions contiene todos los permisos disponibles en el sistema.
// Añade nuevos permisos aquí y se sincronizarán automáticamente con la base de datos al arrancar.
var SystemPermissions = []PermissionDef{
	// Panel Global
	{Name: "manage_users", Group: "Panel Global", Description: "Gestionar usuarios y staff"},
	{Name: "manage_roles", Group: "Panel Global", Description: "Crear y editar roles de staff"},
	{Name: "manage_settings", Group: "Panel Global", Description: "Modificar configuración global"},

	// Gemflix
	{Name: "manage_movies", Group: "Gemflix", Description: "Añadir, editar y borrar películas"},
	{Name: "manage_series", Group: "Gemflix", Description: "Añadir, editar y borrar series"},
	{Name: "manage_collections", Group: "Gemflix", Description: "Gestionar colecciones de medios"},
	{Name: "manage_genres", Group: "Gemflix", Description: "Gestionar géneros"},
	{Name: "manage_networks", Group: "Gemflix", Description: "Gestionar redes (networks)"},
	{Name: "manage_casts", Group: "Gemflix", Description: "Gestionar reparto (actores/directores)"},

	// GemDrive
	{Name: "manage_files", Group: "GemDrive", Description: "Gestionar archivos de usuarios"},
	
	// Jellyfin
	{Name: "manage_jellyfin", Group: "Jellyfin", Description: "Gestionar nodos y sincronización de Jellyfin"},

	// Dispositivos
	{Name: "manage_devices", Group: "Panel Global", Description: "Ver y revocar sesiones de dispositivos"},
}

// SyncPermissions inserta o actualiza los permisos en la base de datos.
func (s *Server) SyncPermissions(ctx context.Context) error {
	log.Println("Sincronizando registro de permisos...")
	for _, p := range SystemPermissions {
		err := s.db.UpsertPermission(ctx, db.UpsertPermissionParams{
			Name:        p.Name,
			GroupName:   p.Group,
			Description: pgtype.Text{String: p.Description, Valid: p.Description != ""},
		})
		if err != nil {
			return fmt.Errorf("error sincronizando permiso %s: %w", p.Name, err)
		}
	}
	log.Println("✅ Registro de permisos sincronizado.")
	return nil
}
