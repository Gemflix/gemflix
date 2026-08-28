-- name: CreateReplica :one
INSERT INTO drive.replicas (
    service_account_id,
    name,
    shared_drive_id,
    streaming_folder_id,
    gemdrive_folder_id,
    recovery_folder_id,
    space_limit_gib,
    priority,
    health_status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- name: ListReplicas :many
SELECT 
    r.*,
    sa.email as service_account_email
FROM drive.replicas r
LEFT JOIN drive.service_accounts sa ON r.service_account_id = sa.id
ORDER BY r.priority DESC, r.created_at ASC;

-- name: UpdateReplicaStatus :exec
UPDATE drive.replicas
SET health_status = $1, updated_at = NOW()
WHERE id = $2;

-- name: DeleteReplica :exec
DELETE FROM drive.replicas
WHERE id = $1;
