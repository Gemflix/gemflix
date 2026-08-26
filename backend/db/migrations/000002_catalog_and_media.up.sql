-- Migración Fase 2: Catálogo y Media con TSVECTOR

-- Extensión nativa de Postgres (generalmente instalada) para generar UUIDs aleatorios si los necesitamos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. TABLAS BASE (METADATA)
-- ==============================================

CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    english_name VARCHAR(255),
    iso_3166_1 CHAR(2) UNIQUE NOT NULL,
    logo_path VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_countries_name ON countries(name);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE genres (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    name_eng VARCHAR(255) UNIQUE NOT NULL,
    name_esp VARCHAR(255),
    slug VARCHAR(120) UNIQUE NOT NULL,
    image_path VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE networks (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    sort_order SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    original_name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    name_lat VARCHAR(255),
    name_esp VARCHAR(255),
    name_eng VARCHAR(255),
    overview TEXT,
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    
    -- TSVECTOR para Fulltext Search nativo
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(original_name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(name_lat, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(overview, '')), 'C')
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX collections_search_idx ON collections USING GIN(search_vector);
CREATE INDEX collections_original_name_idx ON collections(original_name);

CREATE TABLE casts (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    gender SMALLINT,
    place_of_birth VARCHAR(255),
    profile_path VARCHAR(255),
    imdb_id VARCHAR(16) UNIQUE,
    known_for_department VARCHAR(255),
    biography TEXT,
    adult BOOLEAN NOT NULL DEFAULT FALSE,
    birthday DATE,
    deathday DATE,
    views BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(original_name, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(biography, '')), 'C')
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_casts_gender_domain CHECK (gender IS NULL OR gender IN (0,1,2,3)),
    CONSTRAINT chk_casts_views_nonneg CHECK (views >= 0),
    CONSTRAINT chk_casts_dates_order CHECK (deathday IS NULL OR birthday IS NULL OR birthday <= deathday)
);
CREATE INDEX casts_search_idx ON casts USING GIN(search_vector);
CREATE INDEX casts_name_idx ON casts(name);


-- ==============================================
-- 2. TABLAS PRINCIPALES (PELÍCULAS Y SERIES)
-- ==============================================

CREATE TABLE movies (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,

    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    imdb_id VARCHAR(16) UNIQUE,

    is_type VARCHAR(16) NOT NULL DEFAULT 'movie',
    
    original_name VARCHAR(255) NOT NULL,
    title_lat VARCHAR(255),
    title_esp VARCHAR(255),
    title_eng VARCHAR(255),

    overview TEXT,
    trailer_key VARCHAR(2048),

    release_date DATE,
    runtime SMALLINT,

    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),

    certification VARCHAR(16),

    vote_average NUMERIC(3, 1),
    vote_count BIGINT NOT NULL DEFAULT 0,
    vote_gf BIGINT NOT NULL DEFAULT 0,
    views BIGINT NOT NULL DEFAULT 0,

    premiere BOOLEAN NOT NULL DEFAULT FALSE,
    upcoming BOOLEAN NOT NULL DEFAULT FALSE,
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    enable_stream BOOLEAN NOT NULL DEFAULT TRUE,
    enable_download BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ads_unlock BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- TSVECTOR para el Buscador de Películas (El motor de Fulltext nativo)
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(original_name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(title_lat, coalesce(title_esp, ''))), 'A') ||
        setweight(to_tsvector('spanish', coalesce(overview, '')), 'C')
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_movies_vote_avg CHECK (vote_average IS NULL OR (vote_average >= 0.0 AND vote_average <= 10.0)),
    CONSTRAINT chk_movies_runtime_nonneg CHECK (runtime IS NULL OR runtime >= 0),
    CONSTRAINT chk_movies_counters_nonneg CHECK (vote_count >= 0 AND vote_gf >= 0 AND views >= 0),
    CONSTRAINT chk_movies_is_type_domain CHECK (is_type IN ('movie','anime', 'donghua', 'live')),
    CONSTRAINT chk_movies_cert_domain CHECK (certification IS NULL OR certification IN ('G','PG','PG-13','R','NC-17','NR'))
);

-- Índices GIN y combinados para la API
CREATE INDEX movies_search_idx ON movies USING GIN(search_vector);
CREATE INDEX movies_catalog_idx ON movies(active, is_type, release_date);

CREATE TABLE series (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,

    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    imdb_id VARCHAR(16) UNIQUE,

    is_type VARCHAR(16) NOT NULL DEFAULT 'serie',

    original_name VARCHAR(255) NOT NULL,
    title_lat VARCHAR(255),
    title_esp VARCHAR(255),
    title_eng VARCHAR(255),

    overview TEXT,
    trailer_key VARCHAR(2048),

    first_air_date DATE,
    episode_run_time SMALLINT,

    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),

    certification VARCHAR(16),

    vote_average NUMERIC(3, 1),
    vote_count BIGINT NOT NULL DEFAULT 0,
    vote_gf BIGINT NOT NULL DEFAULT 0,
    views BIGINT NOT NULL DEFAULT 0,

    premiere BOOLEAN NOT NULL DEFAULT FALSE,
    upcoming BOOLEAN NOT NULL DEFAULT FALSE,
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(original_name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(title_lat, coalesce(title_esp, ''))), 'A') ||
        setweight(to_tsvector('spanish', coalesce(overview, '')), 'C')
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_series_vote_avg CHECK (vote_average IS NULL OR (vote_average >= 0.0 AND vote_average <= 10.0)),
    CONSTRAINT chk_series_counters_nonneg CHECK (vote_count >= 0 AND vote_gf >= 0 AND views >= 0),
    CONSTRAINT chk_series_runtime_nonneg CHECK (episode_run_time IS NULL OR episode_run_time >= 0),
    CONSTRAINT chk_series_is_type_domain CHECK (is_type IN ('serie','anime','novela', 'donghua', 'dorama', 'live')),
    CONSTRAINT chk_series_cert_domain CHECK (certification IS NULL OR certification IN ('TV-Y','TV-Y7','TV-G','TV-PG','TV-14','TV-MA','NR'))
);

CREATE INDEX series_search_idx ON series USING GIN(search_vector);
CREATE INDEX series_catalog_idx ON series(active, is_type, first_air_date);

CREATE TABLE serie_seasons (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    serie_id BIGINT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    season_number SMALLINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    overview TEXT,
    poster_path VARCHAR(255),
    air_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_serie_season UNIQUE (serie_id, season_number)
);

CREATE TABLE serie_episodes (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE,
    tvdb_id BIGINT UNIQUE,
    season_id BIGINT NOT NULL REFERENCES serie_seasons(id) ON DELETE CASCADE,
    episode_number SMALLINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    overview TEXT,
    still_path VARCHAR(255),
    still_path_tv VARCHAR(255),
    vote_average NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    vote_count BIGINT NOT NULL DEFAULT 0,
    views BIGINT NOT NULL DEFAULT 0,
    air_date DATE,
    enable_stream BOOLEAN NOT NULL DEFAULT TRUE,
    enable_download BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ads_unlock BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_season_episode UNIQUE (season_id, episode_number),
    CONSTRAINT chk_ep_vote_avg CHECK (vote_average >= 0.0 AND vote_average <= 10.0),
    CONSTRAINT chk_ep_counts_nonneg CHECK (vote_count >= 0 AND views >= 0)
);
CREATE INDEX idx_episodes_air_date ON serie_episodes(air_date);

-- Tablas Pivote básicas (Many-to-Many)
CREATE TABLE movie_genres (
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    genre_id BIGINT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_countries (
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    country_id BIGINT REFERENCES countries(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, country_id)
);

CREATE TABLE movie_casts (
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    cast_id BIGINT REFERENCES casts(id) ON DELETE CASCADE,
    character_name VARCHAR(255),
    job VARCHAR(100),
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (movie_id, cast_id)
);

CREATE TABLE movie_collections (
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, collection_id)
);

CREATE TABLE movie_networks (
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    network_id BIGINT REFERENCES networks(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, network_id)
);

CREATE TABLE serie_casts (
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    cast_id BIGINT REFERENCES casts(id) ON DELETE CASCADE,
    character_name VARCHAR(255),
    job VARCHAR(100),
    sort_order SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (serie_id, cast_id)
);

CREATE TABLE serie_genres (
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    genre_id BIGINT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (serie_id, genre_id)
);

CREATE TABLE serie_countries (
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    country_id BIGINT REFERENCES countries(id) ON DELETE CASCADE,
    PRIMARY KEY (serie_id, country_id)
);

CREATE TABLE serie_networks (
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    network_id BIGINT REFERENCES networks(id) ON DELETE CASCADE,
    PRIMARY KEY (serie_id, network_id)
);

CREATE TABLE media_images (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    serie_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
    season_id BIGINT REFERENCES serie_seasons(id) ON DELETE CASCADE,
    episode_id BIGINT REFERENCES serie_episodes(id) ON DELETE CASCADE,
    collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    source VARCHAR(32) NOT NULL,
    language_iso CHAR(2),
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_images_single_owner CHECK (
        (movie_id IS NOT NULL)::integer + 
        (serie_id IS NOT NULL)::integer + 
        (season_id IS NOT NULL)::integer + 
        (episode_id IS NOT NULL)::integer + 
        (collection_id IS NOT NULL)::integer = 1
    )
);
