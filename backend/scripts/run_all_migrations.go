//go:build ignore

package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"github.com/jackc/pgx/v5"
)

func main() {
	conn, err := pgx.Connect(context.Background(), "postgres://postgres:postgres@localhost:5432/gemflix_db?sslmode=disable")
	if err != nil { panic(err) }
	defer conn.Close(context.Background())

	files, err := filepath.Glob("db/migrations/*.up.sql")
	if err != nil { panic(err) }
	
	sort.Strings(files)

	for _, file := range files {
		fmt.Println("Running", file)
		b, err := os.ReadFile(file)
		if err != nil { panic(err) }
		_, err = conn.Exec(context.Background(), string(b))
		if err != nil { 
			fmt.Println("Error in", file, ":", err)
			panic(err)
		}
	}
	fmt.Println("All migrations applied successfully!")
}

