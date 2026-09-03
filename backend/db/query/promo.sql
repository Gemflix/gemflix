-- name: CreatePromoCode :one
INSERT INTO promo_codes (
    code, type, value, max_uses, valid_from, valid_until, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: ListPromoCodes :many
SELECT * FROM promo_codes
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetPromoCodeByCode :one
SELECT * FROM promo_codes
WHERE code = $1;

-- name: GetPromoCodeByID :one
SELECT * FROM promo_codes
WHERE id = $1;

-- name: UpdatePromoCode :one
UPDATE promo_codes
SET 
    code = coalesce(sqlc.narg('code'), code),
    type = coalesce(sqlc.narg('type'), type),
    value = coalesce(sqlc.narg('value'), value),
    max_uses = coalesce(sqlc.narg('max_uses'), max_uses),
    valid_from = coalesce(sqlc.narg('valid_from'), valid_from),
    valid_until = coalesce(sqlc.narg('valid_until'), valid_until),
    is_active = coalesce(sqlc.narg('is_active'), is_active),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeletePromoCode :exec
DELETE FROM promo_codes WHERE id = $1;

-- name: IncrementPromoUses :exec
UPDATE promo_codes
SET uses = uses + 1
WHERE id = $1;

-- name: RecordPromoRedemption :one
INSERT INTO promo_redemptions (
    user_id, promo_code_id
) VALUES (
    $1, $2
) RETURNING *;

-- name: CheckPromoRedemption :one
SELECT * FROM promo_redemptions
WHERE user_id = $1 AND promo_code_id = $2;
