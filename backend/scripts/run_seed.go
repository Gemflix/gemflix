package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	databaseURL := "postgres://postgres:postgres@localhost:5432/gemflix_db?sslmode=disable"
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("Error conectando a la BD: %v", err)
	}
	defer pool.Close()

	sqlBytes, err := os.ReadFile("scripts/seed.sql")
	if err != nil {
		log.Fatalf("Error leyendo seed.sql: %v", err)
	}

	fmt.Println("Corriendo seed.sql...")
	_, err = pool.Exec(ctx, string(sqlBytes))
	if err != nil {
		log.Fatalf("Error ejecutando seed.sql: %v", err)
	}

	fmt.Println("✅ Base de datos sembrada con éxito.")
}
