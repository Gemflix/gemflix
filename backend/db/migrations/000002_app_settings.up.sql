-- Module 2: App Settings, Activity Log, and Curator

CREATE TABLE app_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatie-like Activity Log
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    log_name VARCHAR(255),
    description TEXT NOT NULL,
    
    target_table VARCHAR(255),
    target_id BIGINT,
    
    event VARCHAR(255),
    
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    attribute_changes JSONB,
    properties JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX activity_log_log_name_idx ON activity_log(log_name);
CREATE INDEX activity_log_target_idx ON activity_log(target_table, target_id);
CREATE INDEX activity_log_user_idx ON activity_log(user_id);

-- Filament Curator (Media Management)
CREATE TABLE curator_media (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    type VARCHAR(255) NOT NULL,
    ext VARCHAR(50) NOT NULL,
    alt VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    caption TEXT,
    pretty_name TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX curator_media_path_idx ON curator_media(path);

-- ==============================================
-- 4. SCRAPER PLATFORM
-- ==============================================
CREATE TABLE scraper_sources (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    driver VARCHAR(100) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    base_url VARCHAR(2048),
    endpoint_template VARCHAR(2048),
    pagination_template VARCHAR(2048),
    http_method VARCHAR(10) NOT NULL DEFAULT 'GET',
    request_headers JSONB,
    request_body_template TEXT,
    credentials TEXT,
    output_server VARCHAR(255),
    cursor_type VARCHAR(64) NOT NULL DEFAULT 'page',
    default_cursor_start VARCHAR(512),
    default_cursor_end VARCHAR(512),
    last_detected_cursor VARCHAR(512),
    schedule_cron VARCHAR(100),
    schedule_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    rate_limit_per_minute INTEGER,
    timeout_seconds INTEGER NOT NULL DEFAULT 60,
    max_attempts SMALLINT NOT NULL DEFAULT 3,
    concurrency SMALLINT NOT NULL DEFAULT 1,
    force_replace_wish BOOLEAN NOT NULL DEFAULT FALSE,
    language_mode VARCHAR(64),
    insert_stream BOOLEAN NOT NULL DEFAULT TRUE,
    insert_download BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB,
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX scraper_sources_driver_type_idx ON scraper_sources(driver, content_type);

CREATE TABLE scraper_runs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    scraper_source_id BIGINT NOT NULL REFERENCES scraper_sources(id) ON DELETE RESTRICT,
    trigger_type VARCHAR(32) NOT NULL DEFAULT 'manual',
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    queue VARCHAR(64),
    job_id VARCHAR(191),
    batch_id VARCHAR(191),
    cursor_start VARCHAR(512),
    cursor_current VARCHAR(512),
    cursor_end VARCHAR(512),
    items_detected BIGINT NOT NULL DEFAULT 0,
    items_processed BIGINT NOT NULL DEFAULT 0,
    items_created BIGINT NOT NULL DEFAULT 0,
    items_updated BIGINT NOT NULL DEFAULT 0,
    items_skipped BIGINT NOT NULL DEFAULT 0,
    items_failed BIGINT NOT NULL DEFAULT 0,
    queued_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    heartbeat_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    message TEXT,
    error_message TEXT,
    source_snapshot JSONB,
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX scraper_runs_source_created_idx ON scraper_runs(scraper_source_id, created_at);
CREATE INDEX scraper_runs_status_heartbeat_idx ON scraper_runs(status, heartbeat_at);

CREATE TABLE scraper_run_failures (
    id BIGSERIAL PRIMARY KEY,
    scraper_run_id BIGINT REFERENCES scraper_runs(id) ON DELETE CASCADE,
    external_key VARCHAR(512),
    source_url VARCHAR(2048),
    error_code VARCHAR(100),
    message TEXT NOT NULL,
    retryable BOOLEAN NOT NULL DEFAULT TRUE,
    attempt SMALLINT NOT NULL DEFAULT 1,
    context JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX scraper_run_failures_run_retryable_idx ON scraper_run_failures(scraper_run_id, retryable);
