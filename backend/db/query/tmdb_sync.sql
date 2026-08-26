-- ==========================================
-- CASTS
-- ==========================================

-- name: UpsertCast :one
INSERT INTO casts (
    tmdb_id, name, original_name, gender, profile_path, place_of_birth, imdb_id, known_for_department, biography, adult, birthday, deathday
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
ON CONFLICT (tmdb_id) DO UPDATE SET
    name = EXCLUDED.name,
    original_name = EXCLUDED.original_name,
    gender = EXCLUDED.gender,
    profile_path = EXCLUDED.profile_path,
    place_of_birth = EXCLUDED.place_of_birth,
    imdb_id = EXCLUDED.imdb_id,
    known_for_department = EXCLUDED.known_for_department,
    biography = EXCLUDED.biography,
    adult = EXCLUDED.adult,
    birthday = EXCLUDED.birthday,
    deathday = EXCLUDED.deathday
RETURNING id;

-- name: InsertMovieCast :exec
INSERT INTO movie_casts (movie_id, cast_id, character_name, job, sort_order)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (movie_id, cast_id) DO NOTHING;

-- name: InsertSerieCast :exec
INSERT INTO serie_casts (serie_id, cast_id, character_name, job, sort_order)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (serie_id, cast_id) DO NOTHING;

-- ==========================================
-- GENRES
-- ==========================================

-- name: UpsertGenre :one
INSERT INTO genres (tmdb_id, name_eng, name_esp, slug, image_path)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (tmdb_id) DO UPDATE SET
    name_eng = EXCLUDED.name_eng,
    name_esp = EXCLUDED.name_esp,
    slug = EXCLUDED.slug,
    image_path = EXCLUDED.image_path
RETURNING id;

-- name: InsertMovieGenre :exec
INSERT INTO movie_genres (movie_id, genre_id)
VALUES ($1, $2)
ON CONFLICT (movie_id, genre_id) DO NOTHING;

-- name: InsertSerieGenre :exec
INSERT INTO serie_genres (serie_id, genre_id)
VALUES ($1, $2)
ON CONFLICT (serie_id, genre_id) DO NOTHING;

-- ==========================================
-- NETWORKS / PLATFORMS
-- ==========================================

-- name: UpsertNetwork :one
INSERT INTO networks (tmdb_id, name, slug, poster_path, backdrop_path)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (tmdb_id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    poster_path = EXCLUDED.poster_path,
    backdrop_path = EXCLUDED.backdrop_path
RETURNING id;

-- name: InsertMovieNetwork :exec
INSERT INTO movie_networks (movie_id, network_id)
VALUES ($1, $2)
ON CONFLICT (movie_id, network_id) DO NOTHING;

-- name: InsertSerieNetwork :exec
INSERT INTO serie_networks (serie_id, network_id)
VALUES ($1, $2)
ON CONFLICT (serie_id, network_id) DO NOTHING;

-- ==========================================
-- COLLECTIONS
-- ==========================================

-- name: UpsertCollection :one
INSERT INTO collections (tmdb_id, original_name, name_lat, name_esp, name_eng, overview, poster_path, backdrop_path, slug)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (tmdb_id) DO UPDATE SET
    original_name = EXCLUDED.original_name,
    name_lat = EXCLUDED.name_lat,
    name_esp = EXCLUDED.name_esp,
    name_eng = EXCLUDED.name_eng,
    overview = EXCLUDED.overview,
    poster_path = EXCLUDED.poster_path,
    backdrop_path = EXCLUDED.backdrop_path,
    slug = EXCLUDED.slug
RETURNING id;

-- name: InsertMovieCollection :exec
INSERT INTO movie_collections (movie_id, collection_id)
VALUES ($1, $2)
ON CONFLICT (movie_id, collection_id) DO NOTHING;

-- ==========================================
-- GET DETAILS WITH RELATIONS (For Editing)
-- ==========================================

-- name: GetMovieFullDetails :one
SELECT 
    m.*,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name_eng))
         FROM movie_genres mg JOIN genres g ON mg.genre_id = g.id
         WHERE mg.movie_id = m.id), '[]'::jsonb
    ) AS genres,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id, 'name', c.name, 'profile_path', c.profile_path, 
            'character_name', mc.character_name, 'job', mc.job
         ) ORDER BY mc.sort_order)
         FROM movie_casts mc JOIN casts c ON mc.cast_id = c.id
         WHERE mc.movie_id = m.id), '[]'::jsonb
    ) AS casts_data,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', n.id, 'name', n.name, 'logo_path', n.poster_path))
         FROM movie_networks mn JOIN networks n ON mn.network_id = n.id
         WHERE mn.movie_id = m.id), '[]'::jsonb
    ) AS networks,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'iso_3166_1', c.iso_3166_1))
         FROM movie_countries mc JOIN countries c ON mc.country_id = c.id
         WHERE mc.movie_id = m.id), '[]'::jsonb
    ) AS countries,
    COALESCE(
        (SELECT to_jsonb(col)
         FROM movie_collections mcol JOIN collections col ON mcol.collection_id = col.id
         WHERE mcol.movie_id = m.id LIMIT 1
        ), 'null'::jsonb
    ) AS collection,
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = m.id AND type = 'poster' AND is_main = true LIMIT 1), '') AS main_poster,
    COALESCE((SELECT file_path FROM media_images WHERE movie_id = m.id AND type IN ('backdrop', 'tvthumb') AND is_main = true LIMIT 1), '') AS main_backdrop,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', id, 'file_path', file_path, 'type', type, 'source', source, 'is_main', is_main))
         FROM media_images
         WHERE movie_id = m.id), '[]'::jsonb
    ) AS images
FROM movies m
WHERE m.id = $1;

-- name: GetSerieFullDetails :one
SELECT 
    s.*,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name_eng))
         FROM serie_genres sg JOIN genres g ON sg.genre_id = g.id
         WHERE sg.serie_id = s.id), '[]'::jsonb
    ) AS genres,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id, 'name', c.name, 'profile_path', c.profile_path, 
            'character_name', sc.character_name, 'job', sc.job
         ) ORDER BY sc.sort_order)
         FROM serie_casts sc JOIN casts c ON sc.cast_id = c.id
         WHERE sc.serie_id = s.id), '[]'::jsonb
    ) AS casts_data,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', n.id, 'name', n.name, 'logo_path', n.poster_path))
         FROM serie_networks sn JOIN networks n ON sn.network_id = n.id
         WHERE sn.serie_id = s.id), '[]'::jsonb
    ) AS networks,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'iso_3166_1', c.iso_3166_1))
         FROM serie_countries sc JOIN countries c ON sc.country_id = c.id
         WHERE sc.serie_id = s.id), '[]'::jsonb
    ) AS countries,
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = s.id AND type = 'poster' AND is_main = true LIMIT 1), '') AS main_poster,
    COALESCE((SELECT file_path FROM media_images WHERE serie_id = s.id AND type IN ('backdrop', 'tvthumb') AND is_main = true LIMIT 1), '') AS main_backdrop,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', id, 'file_path', file_path, 'type', type, 'source', source, 'is_main', is_main))
         FROM media_images
         WHERE serie_id = s.id), '[]'::jsonb
    ) AS images
FROM series s
WHERE s.id = $1;


-- name: UpdateCastDetails :exec
UPDATE casts SET
    place_of_birth = COALESCE($2, place_of_birth),
    imdb_id = COALESCE($3, imdb_id),
    biography = COALESCE($4, biography),
    adult = COALESCE($5, adult),
    birthday = COALESCE($6, birthday),
    deathday = COALESCE($7, deathday)
WHERE tmdb_id = $1;

-- name: UpdateCollectionDetails :exec
UPDATE collections SET
    name_lat = COALESCE($2, name_lat),
    name_esp = COALESCE($3, name_esp),
    name_eng = COALESCE($4, name_eng),
    overview = COALESCE($5, overview),
    backdrop_path = COALESCE($6, backdrop_path),
    slug = COALESCE($7, slug)
WHERE tmdb_id = $1;

-- ==========================================
-- COUNTRIES
-- ==========================================

-- name: UpsertCountry :one
INSERT INTO countries (
    name, english_name, iso_3166_1
) VALUES (
    $1, $2, $3
)
ON CONFLICT (iso_3166_1) DO UPDATE SET
    name = EXCLUDED.name,
    english_name = EXCLUDED.english_name
RETURNING id;

-- name: InsertMovieCountry :exec
INSERT INTO movie_countries (movie_id, country_id) 
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: InsertSerieCountry :exec
INSERT INTO serie_countries (serie_id, country_id) 
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SEASONS & EPISODES
-- ==========================================

-- name: UpsertSerieSeason :one
INSERT INTO serie_seasons (
    tmdb_id, serie_id, season_number, name, overview, poster_path, air_date
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
ON CONFLICT (serie_id, season_number) DO UPDATE SET
    tmdb_id = EXCLUDED.tmdb_id,
    name = EXCLUDED.name,
    overview = EXCLUDED.overview,
    poster_path = EXCLUDED.poster_path,
    air_date = EXCLUDED.air_date
RETURNING id;

-- name: UpsertSerieEpisode :one
INSERT INTO serie_episodes (
    tmdb_id, season_id, episode_number, name, overview, still_path, vote_average, vote_count, air_date
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
ON CONFLICT (season_id, episode_number) DO UPDATE SET
    tmdb_id = EXCLUDED.tmdb_id,
    name = EXCLUDED.name,
    overview = EXCLUDED.overview,
    still_path = EXCLUDED.still_path,
    vote_average = EXCLUDED.vote_average,
    vote_count = EXCLUDED.vote_count,
    air_date = EXCLUDED.air_date
RETURNING id;

