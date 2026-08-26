-- name: CreateUser :one
INSERT INTO users (
  name, email, password_hash
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: UpdateUserLogin :exec
UPDATE users
SET last_login_at = NOW()
WHERE id = $1;

-- name: CreateProfile :one
INSERT INTO profiles (
  user_id, name, pin_enabled, pin_hash
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: ListUserProfiles :many
SELECT * FROM profiles
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at;

-- name: RegisterDevice :one
INSERT INTO devices (
  user_id, platform, fingerprint, device_brand, device_model, os_version, last_ip, session_id, last_user_agent
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
ON CONFLICT (user_id, fingerprint) 
DO UPDATE SET 
    session_id = EXCLUDED.session_id,
    device_brand = EXCLUDED.device_brand,
    device_model = EXCLUDED.device_model,
    os_version = EXCLUDED.os_version,
    last_ip = EXCLUDED.last_ip,
    last_user_agent = EXCLUDED.last_user_agent,
    last_login_at = NOW(),
    active = TRUE
RETURNING *;

-- name: CreatePersonalAccessToken :one
INSERT INTO personal_access_tokens (
    tokenable_type, tokenable_id, name, client, device_id, token, expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: CheckTokenWithDevice :one
SELECT 
    t.id AS token_id,
    t.tokenable_type,
    t.tokenable_id,
    t.expires_at,
    d.id AS device_id,
    d.active AS device_active,
    u.id AS user_id,
    u.is_shadowbanned
FROM personal_access_tokens t
JOIN devices d ON t.device_id = d.id
JOIN users u ON t.tokenable_id = u.id
WHERE t.token = $1 AND t.tokenable_type = 'user'
LIMIT 1;

-- name: UpdateDeviceIP :exec
UPDATE devices 
SET last_ip = $2, last_login_at = NOW() 
WHERE id = $1;

-- name: RevokeToken :exec
DELETE FROM personal_access_tokens WHERE token = $1;

-- name: GetFirstActiveProfile :one
SELECT id, name, active FROM profiles WHERE user_id = $1 AND active = true AND deleted_at IS NULL ORDER BY id ASC LIMIT 1;

