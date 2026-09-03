package main

import (
	"context"
	"fmt"
	"log"

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

	_, err = pool.Exec(ctx, "INSERT INTO app_settings (key, value) VALUES ('public_catalog', 'true') ON CONFLICT (key) DO UPDATE SET value = 'true'")
	if err != nil {
		log.Fatalf("Error setting public_catalog: %v", err)
	}

	fmt.Println("public_catalog set to true")
}
