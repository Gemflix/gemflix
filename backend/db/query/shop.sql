-- name: CreateShopItem :one
INSERT INTO shop_items (
    name, description, type, collection, price, media_id, meta, preview_css, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;

-- name: ListShopItems :many
SELECT * FROM shop_items
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountShopItems :one
SELECT COUNT(*) FROM shop_items;

-- name: GetShopItem :one
SELECT * FROM shop_items WHERE id = $1;

-- name: UpdateShopItem :one
UPDATE shop_items
SET 
    name = coalesce(sqlc.narg('name'), name),
    description = coalesce(sqlc.narg('description'), description),
    type = coalesce(sqlc.narg('type'), type),
    collection = coalesce(sqlc.narg('collection'), collection),
    price = coalesce(sqlc.narg('price'), price),
    media_id = coalesce(sqlc.narg('media_id'), media_id),
    meta = coalesce(sqlc.narg('meta'), meta),
    preview_css = coalesce(sqlc.narg('preview_css'), preview_css),
    is_active = coalesce(sqlc.narg('is_active'), is_active),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteShopItem :exec
DELETE FROM shop_items WHERE id = $1;

-- name: CreateUserInventoryItem :one
INSERT INTO user_inventory (
    user_id, shop_item_id, purchased_at
) VALUES (
    $1, $2, NOW()
) RETURNING *;

-- name: GetUserInventory :many
SELECT ui.*, si.name, si.type, si.meta, si.preview_css
FROM user_inventory ui
JOIN shop_items si ON ui.shop_item_id = si.id
WHERE ui.user_id = $1;

-- name: EquipShopItemToProfile :exec
UPDATE user_inventory
SET equipped_by_profile_id = $1
WHERE user_id = $2 AND id = $3;

-- name: UnequipShopItemTypeFromProfile :exec
UPDATE user_inventory ui
SET equipped_by_profile_id = NULL
FROM shop_items si
WHERE ui.shop_item_id = si.id 
  AND ui.user_id = $1 
  AND ui.equipped_by_profile_id = $2
  AND si.type = $3;
