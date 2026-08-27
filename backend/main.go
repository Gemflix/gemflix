package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	
	"proyecto-go/api"
	"proyecto-go/db/sqlc"
	"proyecto-go/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: No se encontró archivo .env, usando variables del entorno del sistema")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/gemflix_db?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fmt.Println("Conectando a PostgreSQL...")
	dbPool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("No se pudo crear el pool de conexiones: %v", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("Error al hacer ping a la base de datos: %v", err)
	}
	fmt.Println("✅ ¡Conectado exitosamente a PostgreSQL (GEMFLIX)!")

	// 1. Ejecutar migraciones automáticas
	runDBMigration(databaseURL)

	// 2. Aprovisionar Super Admin si es necesario
	provisionSuperAdmin(ctx, dbPool)

	// Inicializar los queries de sqlc
	queries := db.New(dbPool)

	// Inicializar Redis
	fmt.Println("Conectando a Redis...")
	redisClient := utils.NewRedisClient()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("No se pudo conectar a Redis: %v", err)
	}
	fmt.Println("✅ ¡Conectado exitosamente a Redis!")

	// Inicializar nuestro Servidor API con sus rutas
	server := api.NewServer(queries, redisClient)

	if err := server.SyncPermissions(context.Background()); err != nil {
		log.Printf("Advertencia: No se pudieron sincronizar los permisos: %v", err)
	}

	port := ":8080"
	fmt.Printf("🚀 Servidor corriendo en el puerto %s...\n", port)
	fmt.Printf("👉 Visita el Panel Admin en: http://localhost%s/admin/\n", port)
	
	srv := &http.Server{
		Addr:         port,
		Handler:      server, // Inyectamos nuestro server.go
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
