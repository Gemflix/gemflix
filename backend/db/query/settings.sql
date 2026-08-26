-- name: GetAppSetting :one
SELECT value FROM app_settings WHERE key = $1 LIMIT 1;

-- name: ListAppSettings :many
SELECT key, value FROM app_settings;

-- name: UpdateAppSetting :exec
INSERT INTO app_settings (key, value, updated_at) 
VALUES ($1, $2, NOW()) 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
