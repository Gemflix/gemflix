package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

//go:embed db/migrations/*.sql
var fs embed.FS

// runDBMigration ejecuta las migraciones de la base de datos automáticamente al arrancar
func runDBMigration(dbURL string) {
	fmt.Println("Ejecutando migraciones de base de datos...")

	d, err := iofs.New(fs, "db/migrations")
	if err != nil {
		log.Fatalf("No se pudo crear el source driver desde embed.FS: %v", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", d, dbURL)
	if err != nil {
		log.Fatalf("No se pudo crear la instancia de migrate: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Error ejecutando migraciones (Up): %v", err)
	}

	if err == migrate.ErrNoChange {
		fmt.Println("Migraciones al día. No hay cambios.")
	} else {
		fmt.Println("✅ ¡Migraciones ejecutadas exitosamente!")
	}
}

// provisionSuperAdmin crea un Super Admin si se proporcionan las variables de entorno correspondientes
func provisionSuperAdmin(ctx context.Context, dbPool *pgxpool.Pool) {
	adminEmail := os.Getenv("SUPERADMIN_EMAIL")
	adminPass := os.Getenv("SUPERADMIN_PASSWORD")

	if adminEmail == "" || adminPass == "" {
		fmt.Println("Aviso: SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no están definidos. Omitiendo creación de Admin.")
		return
	}

	// 1. Verificar si el usuario ya existe
	var userID int64
	err := dbPool.QueryRow(ctx, "SELECT id FROM users WHERE email = $1", adminEmail).Scan(&userID)
	if err == nil {
		fmt.Printf("El Super Admin (%s) ya existe. Omitiendo creación.\n", adminEmail)
		return // Ya existe
	}

	// 2. Hashear la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPass), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Error hasheando contraseña del Super Admin: %v", err)
	}

	// 3. Insertar el usuario
	err = dbPool.QueryRow(ctx, 
		"INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		"Super Admin (GitOps)", adminEmail, string(hashedPassword),
	).Scan(&userID)
	
	if err != nil {
		log.Fatalf("Error creando el Super Admin: %v", err)
	}

	// 4. Asignar el rol de Super Admin (Asumimos que el ID del rol es 1 por la migración 000007)
	_, err = dbPool.Exec(ctx, "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", userID, 1)
	if err != nil {
		log.Fatalf("Error asignando el rol de Super Admin: %v", err)
	}

	fmt.Printf("✅ ¡Super Admin (%s) creado y aprovisionado exitosamente!\n", adminEmail)
}
