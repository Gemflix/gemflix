-- name: CreateMovie :one
INSERT INTO movies (
    tmdb_id, imdb_id, original_name, title_lat, title_esp, title_eng, 
    overview, release_date, runtime,
    vote_average, vote_count, is_type, active, slug, certification
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
)
RETURNING *;

-- name: GetMovie :one
SELECT * FROM movies
WHERE id = $1 LIMIT 1;

-- name: SearchMovies :many
SELECT * FROM movies
WHERE active = TRUE
  AND search_vector @@ plainto_tsquery('spanish', $1)
ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', $1)) DESC
LIMIT $2 OFFSET $3;

-- name: CreateSerie :one
INSERT INTO series (
    tmdb_id, imdb_id, original_name, title_lat, title_esp, title_eng, 
    overview, first_air_date, episode_run_time,
    vote_average, vote_count, is_type, active, slug, certification
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
)
RETURNING *;

-- name: SearchSeries :many
SELECT * FROM series
WHERE active = TRUE
  AND search_vector @@ plainto_tsquery('spanish', $1)
ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', $1)) DESC
LIMIT $2 OFFSET $3;

-- name: ListTrendingMovies :many
SELECT * FROM movies
WHERE active = TRUE
ORDER BY views DESC NULLS LAST
LIMIT $1 OFFSET $2;

-- name: DeleteMovie :exec
DELETE FROM movies WHERE id = $1;

-- name: DeleteSerie :exec
DELETE FROM series WHERE id = $1;

-- name: UpdateMovieBasic :exec
UPDATE movies 
SET 
  original_name = $2,
  slug = $3,
  title_lat = $4, 
  title_esp = $5,
  title_eng = $6,
  overview = $7, 
  trailer_key = $8,
  release_date = $9,
  runtime = $10,
  vote_average = $11,
  vote_count = $12,
  active = $13,
  premium = $14,
  premiere = $15,
  upcoming = $16,
  enable_stream = $17,
  enable_download = $18,
  certification = COALESCE($19, certification),
  updated_at = NOW()
WHERE id = $1;

-- name: UpdateSerieBasic :exec
UPDATE series 
SET 
  original_name = $2,
  slug = $3,
  title_lat = $4, 
  title_esp = $5,
  title_eng = $6,
  overview = $7, 
  trailer_key = $8,
  first_air_date = $9,
  episode_run_time = $10,
  vote_average = $11,
  vote_count = $12,
  active = $13,
  premium = $14,
  premiere = $15,
  upcoming = $16,
  certification = COALESCE($17, certification),
  updated_at = NOW()
WHERE id = $1;

-- name: DeleteMediaImage :exec
DELETE FROM media_images WHERE id = $1;

-- name: DeleteMovieCast :exec
DELETE FROM movie_casts WHERE movie_id = $1 AND cast_id = $2;

-- name: DeleteMovieGenre :exec
DELETE FROM movie_genres WHERE movie_id = $1 AND genre_id = $2;

-- name: DeleteMovieNetwork :exec
DELETE FROM movie_networks WHERE movie_id = $1 AND network_id = $2;

-- name: DeleteMovieCollection :exec
DELETE FROM movie_collections WHERE movie_id = $1 AND collection_id = $2;

-- name: DeleteSerieCast :exec
DELETE FROM serie_casts WHERE serie_id = $1 AND cast_id = $2;

-- name: DeleteSerieGenre :exec
DELETE FROM serie_genres WHERE serie_id = $1 AND genre_id = $2;

-- name: DeleteSerieNetwork :exec
DELETE FROM serie_networks WHERE serie_id = $1 AND network_id = $2;

-- name: SearchGenres :many
SELECT * FROM genres WHERE name_eng ILIKE '%' || $1 || '%' OR name_esp ILIKE '%' || $1 || '%' LIMIT 10;

-- name: SearchNetworks :many
SELECT * FROM networks WHERE name ILIKE '%' || $1 || '%' LIMIT 10;

-- name: SearchCasts :many
SELECT * FROM casts WHERE name ILIKE '%' || $1 || '%' LIMIT 10;

-- name: SearchCollections :many
SELECT * FROM collections WHERE original_name ILIKE '%' || $1 || '%' OR name_lat ILIKE '%' || $1 || '%' LIMIT 10;

-- name: GetCollections :many
SELECT * FROM collections ORDER BY id DESC;

-- name: GetNetworks :many
SELECT * FROM networks ORDER BY id DESC;

-- name: GetGenres :many
SELECT * FROM genres ORDER BY name_eng ASC;

-- name: GetCastsPaginated :many
SELECT * FROM casts ORDER BY views DESC NULLS LAST LIMIT $1 OFFSET $2;

-- name: CreateGenre :one
INSERT INTO genres (name_eng, name_esp, image_path, slug) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: UpdateGenre :one
UPDATE genres SET name_eng = $2, name_esp = $3, image_path = $4, slug = $5 WHERE id = $1 RETURNING *;

-- name: DeleteGenre :exec
DELETE FROM genres WHERE id = $1;

-- name: CreateNetwork :one
INSERT INTO networks (name, poster_path, backdrop_path, slug) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: UpdateNetwork :one
UPDATE networks SET name = $2, poster_path = $3, backdrop_path = $4, slug = $5 WHERE id = $1 RETURNING *;

-- name: DeleteNetwork :exec
DELETE FROM networks WHERE id = $1;

-- name: CreateCast :one
INSERT INTO casts (name, original_name, gender, place_of_birth, profile_path, imdb_id, known_for_department, biography, adult, birthday, deathday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;

-- name: UpdateCast :one
UPDATE casts SET name = $2, original_name = $3, gender = $4, place_of_birth = $5, profile_path = $6, imdb_id = $7, known_for_department = $8, biography = $9, adult = $10, birthday = $11, deathday = $12 WHERE id = $1 RETURNING *;

-- name: DeleteCast :exec
DELETE FROM casts WHERE id = $1;

-- name: CreateCollection :one
INSERT INTO collections (original_name, name_lat, name_esp, name_eng, overview, poster_path, backdrop_path, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;

-- name: UpdateCollection :one
UPDATE collections SET original_name = $2, name_lat = $3, name_esp = $4, name_eng = $5, overview = $6, poster_path = $7, backdrop_path = $8, slug = $9 WHERE id = $1 RETURNING *;

-- name: DeleteCollection :exec
DELETE FROM collections WHERE id = $1;

-- name: CheckMovieSlugExists :one
SELECT EXISTS(SELECT 1 FROM movies WHERE slug = $1);

-- name: CheckSerieSlugExists :one
SELECT EXISTS(SELECT 1 FROM series WHERE slug = $1);

-- name: CreateCountry :one
INSERT INTO countries (name, english_name, iso_3166_1, logo_path) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: UpdateCountry :one
UPDATE countries SET name = $2, english_name = $3, iso_3166_1 = $4, logo_path = $5 WHERE id = $1 RETURNING *;

-- name: DeleteCountry :exec
DELETE FROM countries WHERE id = $1;

-- name: GetCountriesPaginated :many
SELECT * FROM countries ORDER BY name ASC LIMIT $1 OFFSET $2;

-- name: SearchCountries :many
SELECT * FROM countries 
WHERE name ILIKE '%' || $1 || '%' OR english_name ILIKE '%' || $1 || '%' OR iso_3166_1 ILIKE '%' || $1 || '%' 
ORDER BY name ASC LIMIT 10;

-- name: GetSerieSeasons :many
SELECT id, season_number, name, overview, poster_path, air_date
FROM serie_seasons
WHERE serie_id = $1
ORDER BY season_number ASC;

-- name: GetSeasonEpisodes :many
SELECT id, episode_number, name, overview, still_path, air_date, enable_stream, enable_download
FROM serie_episodes
WHERE season_id = $1
ORDER BY episode_number ASC;

-- name: GetEpisodeMediaSources :many
SELECT * FROM media_sources WHERE episode_id = $1 ORDER BY id ASC;

-- name: GetMovieMediaSources :many
SELECT * FROM media_sources WHERE movie_id = $1 ORDER BY id ASC;

-- name: GetMediaAudioTracks :many
SELECT * FROM media_audio_tracks WHERE media_source_id = $1 ORDER BY track_no ASC;

-- name: GetMediaSubtitleTracks :many
SELECT * FROM media_subtitle_tracks WHERE media_source_id = $1 ORDER BY track_no ASC;
