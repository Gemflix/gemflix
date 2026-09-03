-- name: CreateReferral :one
INSERT INTO referrals (
    referrer_user_id, device_id, attribution_hash, referee_user_id, status
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetReferralByReferee :one
SELECT * FROM referrals
WHERE referee_user_id = $1;

-- name: GetReferralByHash :one
SELECT * FROM referrals
WHERE attribution_hash = $1;

-- name: CountReferralsByDevice :one
SELECT COUNT(*) FROM referrals
WHERE device_id = $1;

-- name: UpdateReferralStatus :one
UPDATE referrals
SET 
    status = $2,
    converted_at = CASE WHEN $2 = 'converted' THEN NOW() ELSE converted_at END,
    rewarded_at = CASE WHEN $2 = 'rewarded' THEN NOW() ELSE rewarded_at END,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListUserReferrals :many
SELECT r.*, u.name as referee_name, u.email as referee_email
FROM referrals r
LEFT JOIN users u ON r.referee_user_id = u.id
WHERE r.referrer_user_id = $1
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3;
