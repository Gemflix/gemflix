-- name: CreateServiceAccount :one
INSERT INTO drive.service_accounts (
    name, email, provider, credentials_json, quota_limit_bytes
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetActiveServiceAccounts :many
SELECT * FROM drive.service_accounts
WHERE is_active = TRUE AND status = 'healthy'
ORDER BY quota_used_bytes ASC;

-- name: CreateDriveSource :one
INSERT INTO drive.sources (
    service_account_id, name, folder_id, provider, sync_interval_minutes
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: SyncDriveItem :one
INSERT INTO drive.items (
    source_id, remote_id, name, mime_type, size_bytes, 
    md5_checksum, video_codec, width, height, duration_sec
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
ON CONFLICT (source_id, remote_id) DO UPDATE SET
    name = EXCLUDED.name,
    size_bytes = EXCLUDED.size_bytes,
    status = 'available',
    updated_at = NOW()
RETURNING *;

-- name: StartSyncRun :one
INSERT INTO drive.sync_runs (
    source_id, sync_session, status, started_at
) VALUES (
    $1, $2, 'running', NOW()
)
RETURNING *;

-- name: CompleteSyncRun :exec
UPDATE drive.sync_runs
SET status = $2, finished_at = NOW(),
    files_found = $3, items_created = $4, items_updated = $5,
    error_message = $6
WHERE id = $1;
