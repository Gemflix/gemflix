-- name: CreateMediaRequest :one
INSERT INTO media_requests (
    user_id, tmdb_id, title, media_type, notes
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListUserMediaRequests :many
SELECT * FROM media_requests
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CreateMediaReport :one
INSERT INTO media_reports (
    user_id, media_type, media_id, reason, details
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListUserMediaReports :many
SELECT * FROM media_reports
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
