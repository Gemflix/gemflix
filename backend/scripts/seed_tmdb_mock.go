package main

import (
	"context"
	"fmt"
	"log"
	"time"

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

	fmt.Println("Seeding TMDB mock data...")

	// 1. Inserción de Películas
	movies := []struct {
		tmdb_id   int32
		title     string
		slug      string
		overview  string
		poster    string
		backdrop  string
	}{
		{533535, "Deadpool & Wolverine", "deadpool-wolverine", "Wolverine se recupera de sus heridas cuando se cruza con Deadpool, que ha viajado en el tiempo para curarlo...", "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", "https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16ZSlW05mHj8.jpg"},
		{519182, "Despicable Me 4", "despicable-me-4", "Gru y Lucy y sus hijas dan la bienvenida a un nuevo miembro de la familia, Gru Jr., que se empeña en atormentar a su padre.", "https://image.tmdb.org/t/p/w500/wWba3TaojhK7NglUNMacY5vhbgT.jpg", "https://image.tmdb.org/t/p/original/lgkPzcOSnTvjeMnuFzozRO5HHw1.jpg"},
		{1022789, "Inside Out 2", "inside-out-2", "Alegría, Tristeza, Ira, Miedo y Asco no saben cómo sentirse cuando aparece Ansiedad. Y parece que no está sola.", "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", "https://image.tmdb.org/t/p/original/stKGOm8UyhuLPR9sZLjs5Akmnc2.jpg"},
		{1151634, "Furiosa: A Mad Max Saga", "furiosa", "Mientras el mundo cae, la joven Furiosa es arrebatada del Lugar Verde de las Muchas Madres y cae en manos de una gran Horda...", "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg", "https://image.tmdb.org/t/p/original/wNAhuOZ3Zf84jCIlrcI6JhgmY5q.jpg"},
		{748783, "The Garfield Movie", "garfield", "Garfield, el gato casero mundialmente famoso que odia los lunes, está a punto de tener una aventura salvaje al aire libre...", "https://image.tmdb.org/t/p/w500/p6AbOJvMQhBmffd0PIv0u8ghWeY.jpg", "https://image.tmdb.org/t/p/original/vWzGlCGVsGLVru6eA3OUMMNyEBp.jpg"},
	}

	for _, m := range movies {
		// Insert Movie
		var movieID int64
		err = pool.QueryRow(ctx, `
			INSERT INTO movies (
				tmdb_id, original_name, title_lat, title_esp, title_eng, 
				overview, release_date, active, slug, premium, upcoming
			) VALUES (
				$1, $2, $2, $2, $2, $3, $4, true, $5, false, false
			)
			ON CONFLICT (tmdb_id) DO UPDATE SET active = true
			RETURNING id;
		`, m.tmdb_id, m.title, m.overview, time.Now(), m.slug).Scan(&movieID)
		
		if err != nil {
			log.Printf("Failed to insert movie %s: %v", m.title, err)
			continue
		}

		// Insert Poster
		_, _ = pool.Exec(ctx, `
			INSERT INTO media_images (movie_id, file_path, type, source, is_main)
			VALUES ($1, $2, 'poster', 'tmdb', true)
		`, movieID, m.poster)

		// Insert Backdrop
		_, _ = pool.Exec(ctx, `
			INSERT INTO media_images (movie_id, file_path, type, source, is_main)
			VALUES ($1, $2, 'backdrop', 'tmdb', true)
		`, movieID, m.backdrop)
	}

	// 2. Inserción de Series
	series := []struct {
		tmdb_id   int32
		title     string
		slug      string
		overview  string
		poster    string
		backdrop  string
	}{
		{94997, "House of the Dragon", "house-of-the-dragon", "La historia de la casa Targaryen, ambientada 200 años antes de los eventos de Game of Thrones.", "https://image.tmdb.org/t/p/w500/7QVsGidHO414fRxtE0mSM5aH7l6.jpg", "https://image.tmdb.org/t/p/original/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg"},
		{108978, "Reacher", "reacher", "Jack Reacher es arrestado por un asesinato que no cometió, viéndose envuelto en una conspiración mortal...", "https://image.tmdb.org/t/p/w500/jBjwpc7w0Z4XlU420H5H1GfV7C8.jpg", "https://image.tmdb.org/t/p/original/4u2fIuNtvjP2a4U8mU6yPjA3ZfE.jpg"},
		{76479, "The Boys", "the-boys", "Cuando los superhéroes abusan de sus superpoderes, un grupo de justicieros llamados 'The Boys' decide hacer algo al respecto...", "https://image.tmdb.org/t/p/w500/n3144G6dEDrT7Tz4c4R2Lz0CgQ4.jpg", "https://image.tmdb.org/t/p/original/7gDkH9U2q4W72V4Uj1G8X2fU4jW.jpg"},
	}

	for _, s := range series {
		// Insert Serie
		var serieID int64
		err = pool.QueryRow(ctx, `
			INSERT INTO series (
				tmdb_id, original_name, title_lat, title_esp, title_eng, 
				overview, first_air_date, active, slug, premium, upcoming
			) VALUES (
				$1, $2, $2, $2, $2, $3, $4, true, $5, false, false
			)
			ON CONFLICT (tmdb_id) DO UPDATE SET active = true
			RETURNING id;
		`, s.tmdb_id, s.title, s.overview, time.Now(), s.slug).Scan(&serieID)
		
		if err != nil {
			log.Printf("Failed to insert serie %s: %v", s.title, err)
			continue
		}

		// Insert Poster
		_, _ = pool.Exec(ctx, `
			INSERT INTO media_images (serie_id, file_path, type, source, is_main)
			VALUES ($1, $2, 'poster', 'tmdb', true)
		`, serieID, s.poster)

		// Insert Backdrop
		_, _ = pool.Exec(ctx, `
			INSERT INTO media_images (serie_id, file_path, type, source, is_main)
			VALUES ($1, $2, 'backdrop', 'tmdb', true)
		`, serieID, s.backdrop)
	}

	fmt.Println("Mock TMDB data seeded successfully!")
}
