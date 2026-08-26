-- name: GetPlayTrendingMovies :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = movies.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = movies.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    COALESCE(views, 0)::bigint AS views
FROM movies
WHERE active = true
ORDER BY views DESC, vote_average DESC LIMIT 10;

-- name: GetPlayRecentMovies :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = movies.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = movies.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    release_date
FROM movies
WHERE active = true
ORDER BY release_date DESC LIMIT 10;

-- name: GetPlayTrendingSeries :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    COALESCE(views, 0)::bigint AS views
FROM series
WHERE active = true AND is_type = 'serie'
ORDER BY views DESC, vote_average DESC LIMIT 10;

-- name: GetPlayRecentSeries :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    first_air_date
FROM series
WHERE active = true AND is_type = 'serie'
ORDER BY first_air_date DESC LIMIT 10;

-- name: GetPlayTrendingAnimes :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    COALESCE(views, 0)::bigint AS views
FROM series
WHERE active = true AND is_type = 'anime'
ORDER BY views DESC, vote_average DESC LIMIT 10;

-- name: GetPlayRecentAnimes :many
SELECT id, slug, COALESCE(title_lat, original_name) AS title, overview, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'poster' AND is_main = true LIMIT 1), poster_path) AS poster_path, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'backdrop' AND is_main = true LIMIT 1), backdrop_path) AS backdrop_path, 
    first_air_date
FROM series
WHERE active = true AND is_type = 'anime'
ORDER BY first_air_date DESC LIMIT 10;

-- name: GetContinueWatching :many
SELECT 
    wp.id, wp.profile_id, wp.movie_id, wp.episode_id, wp.percentage, wp.completed,
    COALESCE(m.slug, s.slug) AS slug,
    COALESCE(m.title_lat, m.original_name, s.title_lat, s.original_name) AS title,
    COALESCE(m.backdrop_path, s.backdrop_path) AS backdrop_path,
    COALESCE(m.poster_path, s.poster_path) AS poster_path
FROM watch_progress wp
LEFT JOIN movies m ON wp.movie_id = m.id
LEFT JOIN serie_episodes ep ON wp.episode_id = ep.id
LEFT JOIN series s ON ep.serie_id = s.id
WHERE wp.profile_id = $1 AND wp.completed = false
ORDER BY wp.last_watched_at DESC LIMIT 20;

-- name: GetMyListMovies :many
SELECT m.id, m.slug, COALESCE(m.title_lat, m.original_name) AS title, m.overview, m.poster_path, m.backdrop_path
FROM favorites f
JOIN movies m ON f.movie_id = m.id
WHERE f.profile_id = $1
ORDER BY f.created_at DESC LIMIT 20;

-- name: GetMyListSeries :many
SELECT s.id, s.slug, COALESCE(s.title_lat, s.original_name) AS title, s.overview, s.poster_path, s.backdrop_path
FROM favorites f
JOIN series s ON f.serie_id = s.id
WHERE f.profile_id = $1
ORDER BY f.created_at DESC LIMIT 20;

-- name: GetPlayActiveNetworks :many
SELECT id, name, slug, poster_path, backdrop_path 
FROM networks 
ORDER BY sort_order ASC, name ASC LIMIT 20;
