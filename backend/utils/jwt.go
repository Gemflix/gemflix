package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID int64    `json:"user_id"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

var jwtSecretKey = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "fallback_secret_for_development_only_please_change"
	}
	return secret
}

// GenerateTokens creates both an access token and a refresh token
func GenerateTokens(userID int64, roles []string) (string, string, error) {
	// Access Token: Short-lived (15 minutes)
	accessClaims := CustomClaims{
		UserID: userID,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "gemflix-api",
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, err := accessToken.SignedString(jwtSecretKey)
	if err != nil {
		return "", "", err
	}

	// Refresh Token: Long-lived (7 days), fewer claims as it's meant to be opaque to the client and checked against Redis
	refreshClaims := jwt.RegisteredClaims{
		Subject:   string(userID), // En JWT estándar se puede usar Subject como string
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "gemflix-api",
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, err := refreshToken.SignedString(jwtSecretKey)
	if err != nil {
		return "", "", err
	}

	return accessString, refreshString, nil
}

// ValidateAccessToken parses and validates a JWT access token
func ValidateAccessToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
