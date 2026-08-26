-- Migración Inicial: Core Auth (PostgreSQL)

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    password_hash VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    last_vip_win_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    reactivated_at TIMESTAMPTZ,
    reactivation_count INTEGER NOT NULL DEFAULT 0,
    
    -- Gamificación F1
    xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    is_shadowbanned BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    pin_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    pin_hash VARCHAR(255),
    pin_failed_attempts SMALLINT NOT NULL DEFAULT 0,
    pin_locked_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraint: Si el pin está activado, debe haber un pin_hash
    CONSTRAINT chk_profiles_pin_contract CHECK (pin_enabled = FALSE OR pin_hash IS NOT NULL)
);

-- Índice único para que no haya dos perfiles activos con el mismo nombre en un usuario
CREATE UNIQUE INDEX profiles_user_active_name_unique 
ON profiles (user_id, LOWER(TRIM(name))) 
WHERE deleted_at IS NULL;

CREATE TABLE profile_parental_controls (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    max_movie_rating_code VARCHAR(16),
    max_tv_rating_code VARCHAR(16),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_ppc_movie_rating CHECK (max_movie_rating_code IS NULL OR max_movie_rating_code IN ('G','PG','PG-13','R','NC-17','NR')),
    CONSTRAINT chk_ppc_tv_rating CHECK (max_tv_rating_code IS NULL OR max_tv_rating_code IN ('TV-Y','TV-Y7','TV-G','TV-PG','TV-14','TV-MA','NR'))
);

CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_profile_id BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    name VARCHAR(255),
    platform VARCHAR(32) NOT NULL,
    fingerprint CHAR(64) NOT NULL,
    app_version VARCHAR(32),
    device_brand VARCHAR(50),
    device_model VARCHAR(50),
    os_version VARCHAR(32),
    last_ip INET,
    last_user_agent TEXT,
    first_login_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_user_fingerprint UNIQUE(user_id, fingerprint),
    CONSTRAINT chk_devices_platform CHECK (platform IN ('web','android_mobile','android_tv','ios','windows','macos','linux','smart_tv','unknown'))
);

CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(32),
    device_id BIGINT REFERENCES devices(id) ON DELETE SET NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_pat_client CHECK (client IS NULL OR client IN ('mobile','tv','web'))
);
CREATE INDEX pat_tokenable_idx ON personal_access_tokens(tokenable_type, tokenable_id);
CREATE INDEX pat_device_client_idx ON personal_access_tokens(device_id, client);

CREATE TABLE login_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(8) UNIQUE NOT NULL,
    pair_token_hash CHAR(64) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES devices(id) ON DELETE SET NULL,
    approved_by_device_id BIGINT REFERENCES devices(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
