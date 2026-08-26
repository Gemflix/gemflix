-- name: InsertMediaImage :one
INSERT INTO media_images (
  movie_id, serie_id, season_id, episode_id, collection_id,
  file_path, type, source, language_iso, is_main
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING id;

-- name: GetMediaImages :many
SELECT * FROM media_images
WHERE 
  (movie_id = $1 OR $1 IS NULL) AND
  (serie_id = $2 OR $2 IS NULL) AND
  (season_id = $3 OR $3 IS NULL) AND
  (episode_id = $4 OR $4 IS NULL) AND
  (collection_id = $5 OR $5 IS NULL);

-- name: UnsetMainMediaImages :exec
UPDATE media_images SET is_main = false WHERE type = $1 AND (
  (movie_id = $2 AND $2 IS NOT NULL) OR
  (serie_id = $3 AND $3 IS NOT NULL) OR
  (season_id = $4 AND $4 IS NOT NULL) OR
  (episode_id = $5 AND $5 IS NOT NULL)
);

-- name: SetMainMediaImage :exec
UPDATE media_images SET is_main = true WHERE id = $1;
