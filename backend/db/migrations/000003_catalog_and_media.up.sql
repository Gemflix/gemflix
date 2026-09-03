-- MigraciÃ³n Fase 2: CatÃ¡logo y Media con TSVECTOR

-- ExtensiÃ³n nativa de Postgres (generalmente instalada) para generar UUIDs aleatorios si los necesitamos
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
-- 2. TABLAS PRINCIPALES (PELÃCULAS Y SERIES)
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
    poster_path_tv VARCHAR(255),
    backdrop_path VARCHAR(255),
    logo_path VARCHAR(255),

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
    
    -- TSVECTOR para el Buscador de PelÃ­culas (El motor de Fulltext nativo)
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

-- Ãndices GIN y combinados para la API
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
    poster_path_tv VARCHAR(255),
    backdrop_path VARCHAR(255),
    logo_path VARCHAR(255),

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
    poster_path_tv VARCHAR(255),
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

-- Tablas Pivote bÃ¡sicas (Many-to-Many)
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
-- MigraciÃ³n Fase 4: Media System y Pistas de ReproducciÃ³n

-- ==============================================
-- 1. PROVEEDORES DE VIDEO
-- ==============================================
CREATE TABLE providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    type VARCHAR(32) NOT NULL, -- Ej: 'drive', 'hls', 'mp4', 'sharepoint'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 2. FUENTES DE MEDIOS (ENLACES DE VIDEO)
-- ==============================================
-- Nota: Polimorfismo. Puede pertenecer a una PelÃ­cula (movie_id) o Episodio (episode_id)
CREATE TABLE media_sources (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    
    -- Relaciones PolimÃ³rficas Exclusivas (Solo uno de los dos debe ser NOT NULL)
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    episode_id BIGINT REFERENCES serie_episodes(id) ON DELETE CASCADE,
    
    label VARCHAR(64), -- "Latino 1080p", "4K HDR"
    quality VARCHAR(16), -- 2160p, 1080p, 720p
    
    link VARCHAR(2048) NOT NULL,
    link_hash CHAR(64) UNIQUE, -- Para evitar enlaces duplicados
    
    -- Propiedades tÃ©cnicas
    size_bytes BIGINT,
    duration_sec INTEGER,
    video_codec VARCHAR(16),
    audio_channels VARCHAR(8),
    dynamic_range VARCHAR(32), -- sdr, hdr10, dolby_vision
    bit_depth SMALLINT,
    
    -- Marcadores de salto (Intro/Outro)
    recap_start INTEGER NOT NULL DEFAULT 0,
    recap_end INTEGER NOT NULL DEFAULT 0,
    opening_start INTEGER NOT NULL DEFAULT 0,
    opening_end INTEGER NOT NULL DEFAULT 0,
    ending_start INTEGER NOT NULL DEFAULT 0,
    ending_end INTEGER NOT NULL DEFAULT 0,
    
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_media_sources_polymorphic CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR 
        (movie_id IS NULL AND episode_id IS NOT NULL)
    ),
    CONSTRAINT chk_media_sources_size CHECK (size_bytes IS NULL OR size_bytes >= 0),
    CONSTRAINT chk_media_sources_markers CHECK (
        ((recap_start = 0 AND recap_end = 0) OR recap_start < recap_end) AND 
        ((opening_start = 0 AND opening_end = 0) OR opening_start < opening_end) AND 
        ((ending_start = 0 AND ending_end = 0) OR ending_start < ending_end)
    ),
    CONSTRAINT chk_media_sources_dynamic_range CHECK (dynamic_range IS NULL OR dynamic_range IN ('sdr','hdr10','hdr10_plus','dolby_vision','hlg')),
    CONSTRAINT chk_media_sources_bit_depth CHECK (bit_depth IS NULL OR bit_depth IN (8,10,12))
);

-- ==============================================
-- 3. PISTAS DE AUDIO
-- ==============================================
CREATE TABLE media_audio_tracks (
    id BIGSERIAL PRIMARY KEY,
    media_source_id BIGINT NOT NULL REFERENCES media_sources(id) ON DELETE CASCADE,
    
    track_no SMALLINT NOT NULL DEFAULT 1,
    lang VARCHAR(32), -- es, en, pt-BR
    codec VARCHAR(16),
    channel_layout VARCHAR(8),
    bitrate_kbps SMALLINT,
    sample_rate_hz INTEGER,
    
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR(64),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_audio_track_order UNIQUE (media_source_id, track_no),
    CONSTRAINT chk_audio_track_values CHECK (
        track_no >= 1 AND 
        (bitrate_kbps IS NULL OR bitrate_kbps >= 1) AND 
        (sample_rate_hz IS NULL OR sample_rate_hz >= 1)
    )
);

-- MAGIA DE POSTGRESQL: Ãndice Parcial Ãšnico para garantizar un solo audio por defecto por Source
CREATE UNIQUE INDEX uq_media_audio_default ON media_audio_tracks (media_source_id) WHERE is_default = true;
CREATE INDEX idx_media_audio_lang ON media_audio_tracks (media_source_id, lang);


-- ==============================================
-- 4. PISTAS DE SUBTÃTULOS
-- ==============================================
CREATE TABLE media_subtitle_tracks (
    id BIGSERIAL PRIMARY KEY,
    media_source_id BIGINT NOT NULL REFERENCES media_sources(id) ON DELETE CASCADE,
    
    track_no SMALLINT NOT NULL DEFAULT 1,
    lang VARCHAR(32),
    type VARCHAR(8), -- vtt, srt, ass
    
    embedded BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Para subtÃ­tulos externos (embedded = false)
    link VARCHAR(2048),
    link_hash CHAR(64),
    zip BOOLEAN NOT NULL DEFAULT FALSE,
    
    forced BOOLEAN NOT NULL DEFAULT FALSE,
    cc BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR(64),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_subtitle_track_order UNIQUE (media_source_id, track_no),
    CONSTRAINT uq_subtitle_link_hash UNIQUE (media_source_id, link_hash),
    CONSTRAINT chk_subtitle_link_rule CHECK (
        (embedded = true AND link IS NULL AND link_hash IS NULL AND zip = false) OR 
        (embedded = false AND link IS NOT NULL AND link_hash IS NOT NULL)
    ),
    CONSTRAINT chk_subtitle_track_no CHECK (track_no >= 1)
);

-- Ãndice Parcial Ãšnico para garantizar un solo subtÃ­tulo por defecto
CREATE UNIQUE INDEX uq_media_subtitle_default ON media_subtitle_tracks (media_source_id) WHERE is_default = true;
CREATE INDEX idx_media_subtitle_lang ON media_subtitle_tracks (media_source_id, lang);
CREATE INDEX idx_media_subtitle_lookup ON media_subtitle_tracks (media_source_id, embedded, status);


-- ==============================================
-- 5. SESIONES DE REPRODUCCIÃ“N (PLAYBACK)
-- ==============================================
CREATE TABLE media_playback_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_source_id BIGINT NOT NULL REFERENCES media_sources(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES devices(id) ON DELETE SET NULL,
    
    ip_address INET,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_playback_user_active ON media_playback_sessions (user_id, is_active);
ALTER TABLE media_sources ADD COLUMN type VARCHAR(32) NOT NULL DEFAULT 'directo';

-- ==============================================
-- 6. LIVE TV E IPTV
-- ==============================================
CREATE TABLE livetvs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    overview TEXT,
    poster_path VARCHAR(2048),
    backdrop_path VARCHAR(2048),
    backdrop_path_tv VARCHAR(2048),
    
    epg_channel_id VARCHAR(255),
    channel_number INTEGER,
    
    tv_archive BOOLEAN NOT NULL DEFAULT FALSE,
    tv_archive_duration SMALLINT,
    
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX livetvs_name_idx ON livetvs(name);
CREATE INDEX livetvs_feat_act_created_idx ON livetvs(featured, active, created_at);
CREATE INDEX livetvs_prem_act_created_idx ON livetvs(premium, active, created_at);

CREATE TABLE livetv_videos (
    id BIGSERIAL PRIMARY KEY,
    livetv_id BIGINT NOT NULL REFERENCES livetvs(id) ON DELETE CASCADE,
    server VARCHAR(255),
    stream_id VARCHAR(255),
    link VARCHAR(2048) NOT NULL,
    link_hash CHAR(64) NOT NULL,
    headers TEXT,
    useragent VARCHAR(255),
    lang VARCHAR(32),
    embed BOOLEAN NOT NULL DEFAULT FALSE,
    hls BOOLEAN NOT NULL DEFAULT FALSE,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    fail_count SMALLINT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT livetv_videos_unique_link UNIQUE(livetv_id, link_hash)
);
CREATE INDEX livetv_videos_ltv_status_hls_idx ON livetv_videos(livetv_id, status, hls);
CREATE INDEX livetv_videos_ltv_lang_idx ON livetv_videos(livetv_id, lang);

CREATE TABLE livetv_categories (
    livetv_id BIGINT NOT NULL REFERENCES livetvs(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY(livetv_id, category_id)
);

CREATE TABLE iptv_playlists (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(2048) NOT NULL,
    username VARCHAR(191) NOT NULL,
    password TEXT NOT NULL,
    server_key VARCHAR(191),
    is_online BOOLEAN,
    last_checked_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    auto_delete BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT iptv_playlists_url_user_unique UNIQUE(url, username)
);

-- ==============================================
-- 9. EVENT PROVIDERS
-- ==============================================
CREATE TABLE event_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    group_key VARCHAR(255) NOT NULL,
    append_timestamp BOOLEAN NOT NULL DEFAULT TRUE,
    cache_ttl SMALLINT NOT NULL DEFAULT 2,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX event_providers_group_active_sort_idx ON event_providers(group_key, is_active, sort_order);
