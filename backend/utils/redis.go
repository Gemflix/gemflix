package utils

import (
	"os"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: "", // sin contraseña por defecto
		DB:       0,  // DB por defecto
	})

	return client
}
