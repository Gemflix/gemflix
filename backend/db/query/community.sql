-- name: CreateMediaRequest :one
INSERT INTO content_requests (
    user_id, tmdb_id, title, notes
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: ListUserMediaRequests :many
SELECT * FROM content_requests
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CreateMediaReport :one
INSERT INTO reports (
    user_id, content_type, content_id, reason, details
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListUserMediaReports :many
SELECT * FROM reports
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

