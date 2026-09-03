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

	fmt.Println("Dropping schemas...")
	_, err = pool.Exec(ctx, "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; DROP SCHEMA IF EXISTS drive CASCADE; DROP SCHEMA IF EXISTS sharepoint CASCADE; DROP SCHEMA IF EXISTS jellyfin CASCADE;")
	if err != nil {
		log.Fatalf("Error borrando el esquema: %v", err)
	}

	fmt.Println("Esquemas reseteados con éxito.")
}
