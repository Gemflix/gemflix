-- Migración 11: Favoritos y Progreso de Visualización

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_favorites_polymorphic CHECK (
        (movie_id IS NOT NULL AND serie_id IS NULL) OR 
        (movie_id IS NULL AND serie_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uq_favorites_profile_movie ON favorites (profile_id, movie_id) WHERE movie_id IS NOT NULL;
CREATE UNIQUE INDEX uq_favorites_profile_serie ON favorites (profile_id, serie_id) WHERE serie_id IS NOT NULL;


CREATE TABLE watch_progress (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    episode_id BIGINT REFERENCES serie_episodes(id) ON DELETE CASCADE,
    progress_seconds INTEGER NOT NULL DEFAULT 0,
    total_seconds INTEGER NOT NULL DEFAULT 1,
    percentage SMALLINT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_watch_progress_polymorphic CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR 
        (movie_id IS NULL AND episode_id IS NOT NULL)
    ),
    CONSTRAINT chk_watch_progress_percent CHECK (percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_watch_progress_duration CHECK (total_seconds >= 1 AND progress_seconds <= total_seconds)
);

CREATE UNIQUE INDEX uq_watch_progress_movie ON watch_progress (profile_id, movie_id) WHERE movie_id IS NOT NULL;
CREATE UNIQUE INDEX uq_watch_progress_episode ON watch_progress (profile_id, episode_id) WHERE episode_id IS NOT NULL;
CREATE INDEX idx_watch_progress_continue ON watch_progress (profile_id, completed, last_watched_at DESC);
