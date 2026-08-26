-- Migración Fase 4: Media System y Pistas de Reproducción

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
-- Nota: Polimorfismo. Puede pertenecer a una Película (movie_id) o Episodio (episode_id)
CREATE TABLE media_sources (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    
    -- Relaciones Polimórficas Exclusivas (Solo uno de los dos debe ser NOT NULL)
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    episode_id BIGINT REFERENCES serie_episodes(id) ON DELETE CASCADE,
    
    label VARCHAR(64), -- "Latino 1080p", "4K HDR"
    quality VARCHAR(16), -- 2160p, 1080p, 720p
    
    link VARCHAR(2048) NOT NULL,
    link_hash CHAR(64) UNIQUE, -- Para evitar enlaces duplicados
    
    -- Propiedades técnicas
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

-- MAGIA DE POSTGRESQL: Índice Parcial Único para garantizar un solo audio por defecto por Source
CREATE UNIQUE INDEX uq_media_audio_default ON media_audio_tracks (media_source_id) WHERE is_default = true;
CREATE INDEX idx_media_audio_lang ON media_audio_tracks (media_source_id, lang);


-- ==============================================
-- 4. PISTAS DE SUBTÍTULOS
-- ==============================================
CREATE TABLE media_subtitle_tracks (
    id BIGSERIAL PRIMARY KEY,
    media_source_id BIGINT NOT NULL REFERENCES media_sources(id) ON DELETE CASCADE,
    
    track_no SMALLINT NOT NULL DEFAULT 1,
    lang VARCHAR(32),
    type VARCHAR(8), -- vtt, srt, ass
    
    embedded BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Para subtítulos externos (embedded = false)
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

-- Índice Parcial Único para garantizar un solo subtítulo por defecto
CREATE UNIQUE INDEX uq_media_subtitle_default ON media_subtitle_tracks (media_source_id) WHERE is_default = true;
CREATE INDEX idx_media_subtitle_lang ON media_subtitle_tracks (media_source_id, lang);
CREATE INDEX idx_media_subtitle_lookup ON media_subtitle_tracks (media_source_id, embedded, status);


-- ==============================================
-- 5. SESIONES DE REPRODUCCIÓN (PLAYBACK)
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
