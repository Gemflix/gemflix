package api

import (
	"context"
	"log"
	"net/http"
	"strings"

	"proyecto-go/db/sqlc"
	"proyecto-go/utils"
)

type contextKey string

const (
	userClaimsKey contextKey = "user_claims"
	userIDKey     contextKey = "user_id"
	deviceIDKey   contextKey = "device_id"
)

// AuthMiddlewareChi es un middleware estándar compatible con Chi (y net/http)
func (s *Server) AuthMiddlewareChi(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Obtener cabecera Authorization o cookie
		var tokenString string
		authHeader := r.Header.Get("Authorization")
		
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		} else {
			cookie, err := r.Cookie("gemflix_session")
			if err == nil && cookie.Value != "" {
				tokenString = cookie.Value
			}
		}

		if tokenString == "" {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "No token provided"}`))
			return
		}

		// 3. Verificar el JWT
		claims, err := utils.ValidateAccessToken(tokenString)
		if err != nil {
			log.Printf("Token JWT inválido o expirado: %v", err)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Invalid or expired token"}`))
			return
		}

		// 4. Inyectar claims y userID en el contexto
		ctx := r.Context()
		ctx = context.WithValue(ctx, userClaimsKey, claims)
		ctx = context.WithValue(ctx, userIDKey, claims.UserID)

		// Opcional: Podríamos seguir inyectando el DeviceID si el JWT lo incluyera,
		// pero en esta versión stateless usaremos los datos esenciales.

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AuthMiddleware es la versión de envoltura directa (func(HandlerFunc) HandlerFunc)
func (s *Server) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s.AuthMiddlewareChi(next).ServeHTTP(w, r)
	}
}

// Helper functions for handlers
func getUserID(ctx context.Context) int64 {
	id, _ := ctx.Value(userIDKey).(int64)
	return id
}

func getDeviceID(ctx context.Context) int64 {
	id, _ := ctx.Value(deviceIDKey).(int64)
	return id
}

// RequirePermissionChi devuelve un middleware de Chi que chequea permisos
func (s *Server) RequirePermissionChi(permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := getUserID(r.Context())

			if userID == 0 {
				http.Error(w, `{"error": "No autenticado"}`, http.StatusUnauthorized)
				return
			}

			// SUPERADMIN BYPASS: El usuario 1 tiene permisos absolutos
			if userID == 1 {
				next.ServeHTTP(w, r)
				return
			}

			hasPermission, err := s.db.CheckUserPermission(r.Context(), db.CheckUserPermissionParams{
				UserID: userID,
				Name:   permission,
			})

			if err != nil {
				log.Printf("Error chequeando permisos para UserID %d: %v", userID, err)
				http.Error(w, `{"error": "Error interno del servidor"}`, http.StatusInternalServerError)
				return
			}

			if !hasPermission {
				log.Printf("Acceso denegado: UserID %d intentó acceder sin el permiso '%s'", userID, permission)
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error": "No tienes los permisos necesarios para realizar esta acción"}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequirePermission es la versión wrapper directa
func (s *Server) RequirePermission(permission string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			s.RequirePermissionChi(permission)(next).ServeHTTP(w, r)
		}
	}
}
