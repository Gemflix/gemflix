-- name: ListExploreCollections :many
SELECT 
    c.id, 
    c.slug, 
    COALESCE(c.name_lat, c.original_name) AS title, 
    c.overview, 
    COALESCE((SELECT file_path FROM media_images WHERE collection_id = c.id AND type = 'poster' AND is_main = true LIMIT 1), c.poster_path) AS poster_path,
    COALESCE((SELECT file_path FROM media_images WHERE collection_id = c.id AND type = 'backdrop' AND is_main = true LIMIT 1), c.backdrop_path) AS backdrop_path
FROM collections c
ORDER BY c.original_name ASC
LIMIT $1 OFFSET $2;

-- name: ListExploreNetworks :many
SELECT 
    n.id, 
    n.slug, 
    n.name, 
    n.poster_path, 
    n.backdrop_path
FROM networks n
ORDER BY n.sort_order ASC, n.name ASC
LIMIT $1 OFFSET $2;

-- name: ListExploreCountries :many
SELECT 
    c.id, 
    c.name, 
    c.iso_3166_1, 
    c.logo_path
FROM countries c
ORDER BY c.name ASC
LIMIT $1 OFFSET $2;

-- name: ListExploreCasts :many
SELECT 
    c.id, 
    c.name, 
    c.original_name,
    c.profile_path,
    c.known_for_department,
    COALESCE(c.views, 0)::bigint AS views
FROM casts c
WHERE c.active = true
ORDER BY c.views DESC, c.name ASC
LIMIT $1 OFFSET $2;
