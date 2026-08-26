-- name: CreateJellyfinServer :one
INSERT INTO jellyfin.servers (
    name, url, api_key, auto_provision, active
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: ListActiveJellyfinServers :many
SELECT * FROM jellyfin.servers
WHERE active = TRUE
ORDER BY name ASC;

-- name: CreateJellyfinUser :one
INSERT INTO jellyfin.users (
    user_id, jellyfin_server_id, jellyfin_internal_id, jellyfin_username, sync_status
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetJellyfinUsersForServer :many
SELECT * FROM jellyfin.users
WHERE jellyfin_server_id = $1
ORDER BY created_at DESC;

-- name: CreateJellyfinPlanRule :one
INSERT INTO jellyfin.plan_rules (
    plan_id, jellyfin_server_id, libraries
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetPlanRulesForServer :many
SELECT * FROM jellyfin.plan_rules
WHERE jellyfin_server_id = $1;
