-- name: ListExploreGenres :many
SELECT id, COALESCE(name_esp, name_eng)::varchar AS name, slug 
FROM genres 
ORDER BY name ASC;
