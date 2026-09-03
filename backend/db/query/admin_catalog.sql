-- name: CreateCategory :one
INSERT INTO categories (
    name, slug
) VALUES (
    $1, $2
) RETURNING *;

-- name: ListCategories :many
SELECT * FROM categories
ORDER BY name ASC
LIMIT $1 OFFSET $2;

-- name: CountCategories :one
SELECT COUNT(*) FROM categories;

-- name: GetCategory :one
SELECT * FROM categories
WHERE id = $1 LIMIT 1;

-- name: UpdateCategory :one
UPDATE categories
SET 
    name = coalesce(sqlc.narg('name'), name),
    slug = coalesce(sqlc.narg('slug'), slug),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteCategory :exec
DELETE FROM categories
WHERE id = $1;
