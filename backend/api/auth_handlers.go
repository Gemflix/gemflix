package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/netip"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/mssola/user_agent"
	"golang.org/x/crypto/bcrypt"
	"proyecto-go/db/sqlc"
	"proyecto-go/utils"
)

type LoginRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	Fingerprint string `json:"fingerprint"` // Provided by frontend or mobile app
	Platform    string `json:"platform"`    // web, android_mobile, etc.
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	
	// 1. Validar Usuario
	user, err := s.db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		fmt.Println("Login Error - GetUserByEmail failed:", err, "for email:", req.Email)
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	if user.PasswordHash.String == "" {
		http.Error(w, "Esta cuenta requiere inicio de sesión con Google/OAuth", http.StatusForbidden)
		return
	}

	// 2. Validar Contraseña (Protección fuerza bruta básica con bcrypt)
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(req.Password))
	if err != nil {
		fmt.Println("Login Error - Password mismatch for:", req.Email)
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	// 3. Analizar el User Agent
	ua := r.Header.Get("User-Agent")
	parsedUA := user_agent.New(ua)
	osName := parsedUA.OS()
	browserName, browserVersion := parsedUA.Browser()
	
	clientIP := r.Header.Get("X-Forwarded-For")
	if clientIP == "" {
		clientIP = r.RemoteAddr
	}

	// Limpiar IP de puertos si es necesario (ej: 127.0.0.1:54321)
	if strings.Contains(clientIP, ":") && !strings.Contains(clientIP, "[") {
		parts := strings.Split(clientIP, ":")
		clientIP = parts[0]
	}

	var clientIPAddr *netip.Addr
	if parsedIP, err := netip.ParseAddr(clientIP); err == nil {
		clientIPAddr = &parsedIP
	}

	// 4. Registrar Dispositivo
	if req.Platform == "" {
		req.Platform = "web"
	}
	if req.Fingerprint == "" {
		// Fallback seguro: Si no envía fingerprint, generamos un hash SHA-256 del User-Agent (64 caracteres exactos)
		// O generamos un token random corto si preferimos no trackear el UA directamente.
		req.Fingerprint = "fallback_" + generateRandomToken(32)
	}

	device, err := s.db.RegisterDevice(ctx, db.RegisterDeviceParams{
		UserID:         user.ID,
		Platform:       req.Platform,
		Fingerprint:    req.Fingerprint,
		DeviceBrand:    pgtype.Text{String: browserName, Valid: true},
		DeviceModel:    pgtype.Text{String: browserVersion, Valid: true},
		OsVersion:      pgtype.Text{String: osName, Valid: true},
		LastIp:         clientIPAddr,
		SessionID:      pgtype.Text{String: generateRandomToken(32), Valid: true},
		LastUserAgent:  pgtype.Text{String: ua, Valid: true},
	})
	if err != nil {
		fmt.Printf("ERROR RegisterDevice: %v\n", err)
		http.Error(w, "Error registrando dispositivo", http.StatusInternalServerError)
		return
	}

	// 5. Generar Tokens JWT (BFF Pattern)
	roles, _ := s.db.GetUserRoles(ctx, user.ID)
	roleNames := make([]string, 0)
	for _, r := range roles {
		roleNames = append(roleNames, r.Name)
	}

	accessToken, refreshToken, err := utils.GenerateTokens(user.ID, roleNames)
	if err != nil {
		http.Error(w, "Error generando tokens", http.StatusInternalServerError)
		return
	}

	// 6. Guardar Refresh Token en Redis (7 días)
	err = s.redisClient.Set(ctx, "refresh_token:"+refreshToken, user.ID, 7*24*time.Hour).Err()
	if err != nil {
		fmt.Printf("ERROR Guardando en Redis: %v\n", err)
		http.Error(w, "Error de servidor (Redis)", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Login Success: UserID=%d, Email=%s, Roles=%v\n", user.ID, user.Email, roleNames)
	
	// 7. Respuesta Exitosa JSON (Sin setear cookies, el BFF lo hará)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"roles": roleNames,
		},
		"device_id": device.ID,
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	// Intentar obtener el token de Authorization Header o el body
	var refreshToken string
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err == nil {
		refreshToken = req.RefreshToken
	}

	if refreshToken != "" {
		// Revocar el token en Redis
		s.redisClient.Del(r.Context(), "refresh_token:"+refreshToken)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Logged out successfully"}`))
}

func (s *Server) handleAuthMe(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// El token debe venir validado por el middleware y los claims inyectados en el contexto
	claims, ok := ctx.Value(userClaimsKey).(*utils.CustomClaims)
	if !ok {
		http.Error(w, "No autorizado", http.StatusUnauthorized)
		return
	}

	user, err := s.db.GetUser(ctx, claims.UserID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Active profile
	var activeProfile map[string]interface{}
	profileData, err := s.db.GetFirstActiveProfile(ctx, user.ID)
	if err == nil {
		activeProfile = map[string]interface{}{
			"id":   profileData.ID,
			"name": profileData.Name,
		}
	}

	roles, _ := s.db.GetUserRoles(ctx, user.ID)
	var roleNames []string
	for _, r := range roles {
		roleNames = append(roleNames, r.Name)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"roles": roleNames,
		},
		"activeProfile": activeProfile,
	})
}

// generateRandomToken crea un token criptográficamente seguro
func generateRandomToken(length int) string {
	b := make([]byte, length/2)
	rand.Read(b)
	return hex.EncodeToString(b)
}
