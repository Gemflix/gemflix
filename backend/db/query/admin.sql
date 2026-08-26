-- name: GetAdminUsersList :many
SELECT 
    u.id, u.name, u.email, u.is_shadowbanned, u.created_at,
    COALESCE(
        (SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id LIMIT 1), 
        'Customer'
    )::text AS primary_role
FROM users u
WHERE u.id NOT IN (
    SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name IN ('superadmin', 'admin', 'moderator', 'staff')
)
ORDER BY u.id DESC LIMIT 50;

-- name: GetAdminStaffList :many
SELECT 
    u.id, u.name, u.email, u.is_shadowbanned, u.created_at,
    r.name::text AS primary_role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('superadmin', 'admin', 'moderator', 'staff')
ORDER BY u.id DESC LIMIT 50;

-- name: GetAdminMoviesList :many
SELECT 
  id, COALESCE(title_lat, original_name) AS title, release_date, views, active, premium, premiere, upcoming,
  COALESCE((SELECT file_path FROM media_images WHERE movie_id = movies.id AND type = 'poster' AND is_main = true LIMIT 1), '') AS poster_path
FROM movies
ORDER BY views DESC LIMIT 50;

-- name: ToggleMovieAttribute :exec
UPDATE movies SET 
  premium = COALESCE(sqlc.narg('premium'), premium),
  premiere = COALESCE(sqlc.narg('premiere'), premiere),
  upcoming = COALESCE(sqlc.narg('upcoming'), upcoming),
  active = COALESCE(sqlc.narg('active'), active)
WHERE id = sqlc.arg('id');

-- name: ToggleSerieAttribute :exec
UPDATE series SET 
  premium = COALESCE(sqlc.narg('premium'), premium),
  premiere = COALESCE(sqlc.narg('premiere'), premiere),
  upcoming = COALESCE(sqlc.narg('upcoming'), upcoming),
  active = COALESCE(sqlc.narg('active'), active)
WHERE id = sqlc.arg('id');

-- name: GetAdminDevicesList :many
SELECT 
    d.id, d.user_id, u.name as user_name, d.platform, d.device_brand, d.device_model, 
    d.os_version, d.last_ip, d.last_login_at, d.active
FROM devices d
JOIN users u ON d.user_id = u.id
ORDER BY d.last_login_at DESC NULLS LAST
LIMIT 100;

-- name: GetAdminRoles :many
SELECT id, name, description, is_system, created_at 
FROM roles 
ORDER BY id ASC;

-- name: CreateAdminRole :one
INSERT INTO roles (name, description, is_system) 
VALUES (sqlc.arg('name'), sqlc.arg('description'), false)
RETURNING id, name, description, is_system, created_at;

-- name: CreateAdminStaff :one
INSERT INTO users (name, email, password_hash)
VALUES (sqlc.arg('name'), sqlc.arg('email'), sqlc.arg('password_hash'))
RETURNING id, name, email;

-- name: GetAllPermissions :many
SELECT id, name, group_name, description, created_at, updated_at
FROM permissions
ORDER BY group_name ASC, name ASC;

-- name: UpsertPermission :exec
INSERT INTO permissions (name, group_name, description)
VALUES (sqlc.arg('name'), sqlc.arg('group_name'), sqlc.arg('description'))
ON CONFLICT (name) DO UPDATE SET 
  group_name = excluded.group_name,
  description = excluded.description,
  updated_at = NOW();

-- name: ClearRolePermissions :exec
DELETE FROM role_permissions WHERE role_id = sqlc.arg('role_id');

-- name: GetAdminStats :one
SELECT 
  (SELECT count(*) FROM users) as total_users,
  (SELECT count(*) FROM movies) as total_movies,
  (SELECT count(*) FROM devices WHERE active = true) as active_devices;

-- name: GetAdminSeriesList :many
SELECT 
  id, COALESCE(title_lat, original_name) AS title, first_air_date, views, active, premium, premiere, upcoming,
  COALESCE((SELECT file_path FROM media_images WHERE serie_id = series.id AND type = 'poster' AND is_main = true LIMIT 1), '') AS poster_path
FROM series
ORDER BY views DESC LIMIT 50;

-- name: ToggleEpisodeAttribute :exec
UPDATE serie_episodes SET 
  enable_stream = COALESCE(sqlc.narg('enable_stream'), enable_stream),
  enable_download = COALESCE(sqlc.narg('enable_download'), enable_download)
WHERE id = sqlc.arg('id');

-- name: UpdateEpisodeMetadata :one
UPDATE serie_episodes SET 
  name = $2,
  overview = $3,
  air_date = $4,
  still_path = $5
WHERE id = $1 RETURNING *;

-- name: CreateMediaSource :one
INSERT INTO media_sources (
  episode_id, movie_id, label, quality, type, link, link_hash, size_bytes, duration_sec, video_codec, audio_channels, dynamic_range, bit_depth,
  recap_start, recap_end, opening_start, opening_end, ending_start, ending_end
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
) RETURNING *;

-- name: DeleteMediaSource :exec
DELETE FROM media_sources WHERE id = $1;

-- name: CreateMediaAudioTrack :one
INSERT INTO media_audio_tracks (
  media_source_id, track_no, lang, codec, channel_layout, bitrate_kbps, sample_rate_hz, is_default, title
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;

-- name: DeleteMediaAudioTrack :exec
DELETE FROM media_audio_tracks WHERE id = $1;

-- name: CreateMediaSubtitleTrack :one
INSERT INTO media_subtitle_tracks (
  media_source_id, track_no, lang, type, embedded, link, link_hash, forced, is_default, title
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: DeleteMediaSubtitleTrack :exec
DELETE FROM media_subtitle_tracks WHERE id = $1;
