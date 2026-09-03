-- Module 5: Drive Ecosystem & Security (GemDrive & SharePoint)

-- ==============================================
-- 1. GEMDRIVE ECOSYSTEM
-- ==============================================
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

CREATE TABLE drive.replicas (
    id BIGSERIAL PRIMARY KEY,
    service_account_id BIGINT REFERENCES drive.service_accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'GemReplicas',
    shared_drive_id VARCHAR(255) NOT NULL,
    streaming_folder_id VARCHAR(255),
    gemdrive_folder_id VARCHAR(255),
    recovery_folder_id VARCHAR(255),
    space_limit_gib INT DEFAULT 2000,
    priority INT DEFAULT 1,
    health_status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 2. STORAGE SECURITY (ANTI-HOTLINKING)
-- ==============================================
CREATE TABLE drive.storage_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash CHAR(64) UNIQUE NOT NULL,
    drive_item_id BIGINT NOT NULL REFERENCES drive.items(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    device_id BIGINT REFERENCES public.devices(id) ON DELETE SET NULL,
    access_type VARCHAR(40) NOT NULL,
    ip INET,
    user_agent VARCHAR(500),
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    bytes_served BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX storage_tokens_expires_idx ON drive.storage_access_tokens(access_type, expires_at);

CREATE TABLE drive.security_blocks (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    value VARCHAR(500) NOT NULL,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_security_blocks_val UNIQUE(type, value)
);

-- ==============================================
-- 3. MICROSOFT SHAREPOINT ECOSYSTEM
-- ==============================================
CREATE SCHEMA IF NOT EXISTS sharepoint;

CREATE TABLE sharepoint.microsoft_tokens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    account_email VARCHAR(255),
    tenant_id VARCHAR(191),
    access_token TEXT,
    refresh_token TEXT,
    scopes JSONB,
    expires_at TIMESTAMPTZ,
    last_refreshed_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sharepoint.drives (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(191) UNIQUE NOT NULL,
    site_id VARCHAR(191),
    name VARCHAR(255) NOT NULL,
    virtual_folder VARCHAR(100),
    delta_link TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sharepoint.items (
    id BIGSERIAL PRIMARY KEY,
    drive_id BIGINT NOT NULL REFERENCES sharepoint.drives(id) ON DELETE CASCADE,
    external_id VARCHAR(191) NOT NULL,
    parent_external_id VARCHAR(191),
    name TEXT NOT NULL,
    mime_type VARCHAR(255),
    is_folder BOOLEAN NOT NULL DEFAULT FALSE,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    web_url VARCHAR(2048),
    last_modified_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    sync_session UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sharepoint_item UNIQUE(drive_id, external_id)
);

CREATE TABLE sharepoint.sync_runs (
    id BIGSERIAL PRIMARY KEY,
    drive_id BIGINT NOT NULL REFERENCES sharepoint.drives(id) ON DELETE RESTRICT,
    sync_session UUID UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    files_found BIGINT NOT NULL DEFAULT 0,
    folders_found BIGINT NOT NULL DEFAULT 0,
    items_created BIGINT NOT NULL DEFAULT 0,
    items_updated BIGINT NOT NULL DEFAULT 0,
    items_deactivated BIGINT NOT NULL DEFAULT 0,
    pages_processed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sharepoint.transfer_logs (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES sharepoint.items(id) ON DELETE SET NULL,
    request_id UUID,
    bytes_sent BIGINT NOT NULL DEFAULT 0,
    origin_bytes BIGINT NOT NULL DEFAULT 0,
    cache_bytes BIGINT NOT NULL DEFAULT 0,
    action VARCHAR(40) NOT NULL,
    cache_status VARCHAR(32),
    ip INET,
    country VARCHAR(10),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sharepoint.settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    group_name VARCHAR(64) NOT NULL DEFAULT 'general',
    value TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
