//go:build ignore

package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()
	dsn := "postgres://postgres:postgres@localhost:5432/gemflix_db?sslmode=disable"
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	sqlBytes, err := os.ReadFile("db/migrations/000011_lists_and_progress.up.sql")
	if err != nil {
		log.Fatalf("Error reading sql file: %v", err)
	}

	_, err = pool.Exec(ctx, string(sqlBytes))
	if err != nil {
		log.Fatalf("Error running migration: %v", err)
	}

	log.Println("Migration ran successfully")
}
