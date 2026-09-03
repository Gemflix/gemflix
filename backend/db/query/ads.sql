-- name: CreateAd :one
INSERT INTO ads (
    company, type, content, is_rewarded, reward_tokens, daily_limit, is_active, priority
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: ListAdminAds :many
SELECT * FROM ads
ORDER BY priority DESC, created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdateAd :one
UPDATE ads
SET 
    company = coalesce(sqlc.narg('company'), company),
    type = coalesce(sqlc.narg('type'), type),
    content = coalesce(sqlc.narg('content'), content),
    is_rewarded = coalesce(sqlc.narg('is_rewarded'), is_rewarded),
    reward_tokens = coalesce(sqlc.narg('reward_tokens'), reward_tokens),
    daily_limit = coalesce(sqlc.narg('daily_limit'), daily_limit),
    is_active = coalesce(sqlc.narg('is_active'), is_active),
    priority = coalesce(sqlc.narg('priority'), priority),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteAd :exec
DELETE FROM ads WHERE id = $1;

-- name: GetAdByID :one
SELECT * FROM ads WHERE id = $1;

-- name: GetAdsWaterfall :many
-- Returns all active ads ordered by priority.
-- We LEFT JOIN user_ad_views to check if the user has exceeded their daily limit.
SELECT a.*, 
       COALESCE(uav.views_today, 0)::INT as user_views_today
FROM ads a
LEFT JOIN user_ad_views uav 
       ON a.id = uav.ad_id 
      AND uav.user_id = $1 
      AND uav.last_view_date = CURRENT_DATE
WHERE a.is_active = TRUE
  AND (a.daily_limit = 0 OR COALESCE(uav.views_today, 0) < a.daily_limit)
ORDER BY a.priority DESC, a.id ASC;

-- name: GetAdView :one
SELECT * FROM user_ad_views
WHERE user_id = $1 AND ad_id = $2;

-- name: UpsertAdView :one
INSERT INTO user_ad_views (
    user_id, ad_id, views_today, last_view_date
) VALUES (
    $1, $2, 1, CURRENT_DATE
)
ON CONFLICT (user_id, ad_id) DO UPDATE 
SET 
    views_today = CASE 
        WHEN user_ad_views.last_view_date = CURRENT_DATE THEN user_ad_views.views_today + 1
        ELSE 1 
    END,
    last_view_date = CURRENT_DATE,
    updated_at = NOW()
RETURNING *;
