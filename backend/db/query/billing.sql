-- name: CreatePlan :one
INSERT INTO billing.plans (
    key, category, name, color, priority, badge, is_featured, 
    max_profiles, max_devices, max_pending_requests, parental_control, features
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
RETURNING *;

-- name: ListActivePlans :many
SELECT * FROM billing.plans
WHERE is_active = TRUE AND deleted_at IS NULL
ORDER BY priority DESC;

-- name: CreatePlanPrice :one
INSERT INTO billing.plan_prices (
    plan_id, currency, price_cents
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetPlanPrices :many
SELECT * FROM billing.plan_prices
WHERE plan_id = $1;

-- name: CreateSubscription :one
INSERT INTO billing.subscriptions (
    user_id, plan_id, status, starts_at, renews_at, ends_at, 
    plan_key_snapshot, plan_name_snapshot, currency_paid, price_paid_cents
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: GetActiveUserSubscriptions :many
SELECT s.*, p.name as plan_name, p.category 
FROM billing.subscriptions s
JOIN billing.plans p ON s.plan_id = p.id
WHERE s.user_id = $1 
  AND s.status = 'active'
  AND (s.ends_at IS NULL OR s.ends_at > NOW())
ORDER BY s.ends_at DESC;

-- name: CancelSubscription :exec
UPDATE billing.subscriptions
SET status = 'canceled', canceled_at = NOW()
WHERE id = $1 AND user_id = $2;
