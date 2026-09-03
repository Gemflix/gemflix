-- name: CreatePlan :one
INSERT INTO plans (
    key, category, name, description, color, priority, badge, is_featured,
    max_profiles, max_devices, max_pending_requests, parental_control,
    features, is_active, sort_order
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
) RETURNING *;

-- name: ListPlans :many
SELECT * FROM plans
ORDER BY sort_order ASC, priority DESC;

-- name: GetPlan :one
SELECT * FROM plans WHERE id = $1;

-- name: ListActivePlans :many
SELECT * FROM plans
WHERE is_active = TRUE
ORDER BY priority DESC;

-- name: UpdatePlan :one
UPDATE plans
SET 
    key = coalesce(sqlc.narg('key'), key),
    category = coalesce(sqlc.narg('category'), category),
    name = coalesce(sqlc.narg('name'), name),
    description = coalesce(sqlc.narg('description'), description),
    color = coalesce(sqlc.narg('color'), color),
    priority = coalesce(sqlc.narg('priority'), priority),
    badge = coalesce(sqlc.narg('badge'), badge),
    is_featured = coalesce(sqlc.narg('is_featured'), is_featured),
    max_profiles = coalesce(sqlc.narg('max_profiles'), max_profiles),
    max_devices = coalesce(sqlc.narg('max_devices'), max_devices),
    max_pending_requests = coalesce(sqlc.narg('max_pending_requests'), max_pending_requests),
    parental_control = coalesce(sqlc.narg('parental_control'), parental_control),
    features = coalesce(sqlc.narg('features'), features),
    is_active = coalesce(sqlc.narg('is_active'), is_active),
    sort_order = coalesce(sqlc.narg('sort_order'), sort_order),
    updated_at = NOW()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeletePlan :exec
DELETE FROM plans WHERE id = $1;


-- name: CreatePlanPrice :one
INSERT INTO plan_prices (
    plan_id, currency, price_cents, interval
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetPlanPrices :many
SELECT * FROM plan_prices
WHERE plan_id = $1;

-- name: GetPlanPrice :one
SELECT * FROM plan_prices
WHERE id = $1;

-- name: DeletePlanPrices :exec
DELETE FROM plan_prices WHERE plan_id = $1;

-- name: CreateSubscription :one
INSERT INTO subscriptions (
    user_id, plan_id, status, starts_at, renews_at, ends_at, 
    plan_key_snapshot, plan_name_snapshot, currency_paid, price_paid_cents
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: GetActiveUserSubscriptions :many
SELECT s.*, p.name as plan_name, p.category 
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.user_id = $1 
  AND s.status = 'active'
  AND (s.ends_at IS NULL OR s.ends_at > NOW())
ORDER BY s.ends_at DESC;

-- name: CancelSubscription :exec
UPDATE subscriptions
SET status = 'canceled', canceled_at = NOW()
WHERE id = $1 AND user_id = $2;
