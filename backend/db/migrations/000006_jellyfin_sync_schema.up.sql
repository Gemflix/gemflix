-- Module 6: Jellyfin Ecosystem

CREATE SCHEMA IF NOT EXISTS jellyfin;

-- ==============================================
-- 1. SERVIDORES JELLYFIN
-- ==============================================
CREATE TABLE jellyfin.servers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    url VARCHAR(2048) NOT NULL,
    api_key TEXT NOT NULL,
    
    auto_provision BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 2. USUARIOS DE JELLYFIN (Cross-Schema: public.users)
-- ==============================================
CREATE TABLE jellyfin.users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    jellyfin_server_id BIGINT NOT NULL REFERENCES jellyfin.servers(id) ON DELETE CASCADE,
    jellyfin_internal_id UUID, 
    jellyfin_username VARCHAR(255),
    sync_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_jellyfin_user_server UNIQUE (user_id, jellyfin_server_id),
    CONSTRAINT chk_jellyfin_sync_status CHECK (sync_status IN ('pending', 'synced', 'error'))
);
CREATE INDEX idx_jellyfin_user_internal ON jellyfin.users(jellyfin_internal_id);

-- ==============================================
-- 3. REGLAS DE PLANES (Cross-Schema: public.plans)
-- ==============================================
CREATE TABLE jellyfin.plan_rules (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    jellyfin_server_id BIGINT NOT NULL REFERENCES jellyfin.servers(id) ON DELETE CASCADE,
    libraries JSONB, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_jellyfin_plan_server UNIQUE (plan_id, jellyfin_server_id)
);
