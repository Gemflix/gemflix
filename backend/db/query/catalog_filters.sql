-- name: CatalogFilterMovies :many
SELECT 
    m.id, 
    m.slug, 
    COALESCE(m.title_lat, m.original_name) AS title, 
    m.overview, 
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = m.id AND type = 'poster' AND is_main = true LIMIT 1), m.poster_path) AS poster_path,
    m.release_date,
    m.vote_average,
    COALESCE(m.views, 0)::bigint AS views
FROM movies m
WHERE m.active = true
  AND (sqlc.narg('is_type')::varchar IS NULL OR m.is_type = sqlc.narg('is_type'))
  AND (sqlc.narg('year')::int IS NULL OR EXTRACT(YEAR FROM m.release_date) = sqlc.narg('year'))
  AND (sqlc.narg('search_query')::varchar IS NULL OR m.search_vector @@ plainto_tsquery('spanish', sqlc.narg('search_query')))
  AND (sqlc.narg('genre_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = m.id AND mg.genre_id = sqlc.narg('genre_id')))
  AND (sqlc.narg('network_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM movie_networks mn WHERE mn.movie_id = m.id AND mn.network_id = sqlc.narg('network_id')))
  AND (sqlc.narg('country_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM movie_countries mc WHERE mc.movie_id = m.id AND mc.country_id = sqlc.narg('country_id')))
ORDER BY 
  CASE WHEN sqlc.narg('sort_by')::varchar = 'recent' THEN m.release_date END DESC,
  CASE WHEN sqlc.narg('sort_by')::varchar = 'popular' THEN m.views END DESC,
  CASE WHEN sqlc.narg('sort_by')::varchar = 'rating' THEN m.vote_average END DESC,
  m.id DESC
LIMIT $1 OFFSET $2;

-- name: CatalogFilterSeries :many
SELECT 
    s.id, 
    s.slug, 
    COALESCE(s.title_lat, s.original_name) AS title, 
    s.overview, 
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = s.id AND type = 'poster' AND is_main = true LIMIT 1), s.poster_path) AS poster_path,
    s.first_air_date,
    s.vote_average,
    COALESCE(s.views, 0)::bigint AS views
FROM series s
WHERE s.active = true
  AND (sqlc.narg('is_type')::varchar IS NULL OR s.is_type = sqlc.narg('is_type'))
  AND (sqlc.narg('year')::int IS NULL OR EXTRACT(YEAR FROM s.first_air_date) = sqlc.narg('year'))
  AND (sqlc.narg('search_query')::varchar IS NULL OR s.search_vector @@ plainto_tsquery('spanish', sqlc.narg('search_query')))
  AND (sqlc.narg('genre_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM serie_genres sg WHERE sg.serie_id = s.id AND sg.genre_id = sqlc.narg('genre_id')))
  AND (sqlc.narg('network_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM serie_networks sn WHERE sn.serie_id = s.id AND sn.network_id = sqlc.narg('network_id')))
  AND (sqlc.narg('country_id')::bigint IS NULL OR EXISTS (SELECT 1 FROM serie_countries sc WHERE sc.serie_id = s.id AND sc.country_id = sqlc.narg('country_id')))
ORDER BY 
  CASE WHEN sqlc.narg('sort_by')::varchar = 'recent' THEN s.first_air_date END DESC,
  CASE WHEN sqlc.narg('sort_by')::varchar = 'popular' THEN s.views END DESC,
  CASE WHEN sqlc.narg('sort_by')::varchar = 'rating' THEN s.vote_average END DESC,
  s.id DESC
LIMIT $1 OFFSET $2;
