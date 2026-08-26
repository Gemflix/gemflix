CREATE SCHEMA IF NOT EXISTS drive;

CREATE TABLE drive.service_accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    credentials_json TEXT NOT NULL,
    quota_limit_bytes BIGINT,
    quota_used_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drive.sources (
    id BIGSERIAL PRIMARY KEY,
    service_account_id BIGINT REFERENCES drive.service_accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    folder_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    sync_interval_minutes INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drive.items (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT REFERENCES drive.sources(id) ON DELETE CASCADE,
    remote_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    md5_checksum VARCHAR(255),
    video_codec VARCHAR(50),
    width INT,
    height INT,
    duration_sec INT,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, remote_id)
);

CREATE TABLE drive.sync_runs (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT REFERENCES drive.sources(id) ON DELETE CASCADE,
    sync_session VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    files_found INT DEFAULT 0,
    items_created INT DEFAULT 0,
    items_updated INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);
