-- Migración Fase 7: Ecosistema Jellyfin

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
    
    -- El usuario de GEMFLIX (Single Sign-On)
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    jellyfin_server_id BIGINT NOT NULL REFERENCES jellyfin.servers(id) ON DELETE CASCADE,
    
    jellyfin_internal_id UUID, -- UUID del usuario dentro de la BD de Jellyfin
    jellyfin_username VARCHAR(255),
    
    sync_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, synced, error
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_jellyfin_user_server UNIQUE (user_id, jellyfin_server_id),
    CONSTRAINT chk_jellyfin_sync_status CHECK (sync_status IN ('pending', 'synced', 'error'))
);
CREATE INDEX idx_jellyfin_user_internal ON jellyfin.users(jellyfin_internal_id);

-- ==============================================
-- 3. REGLAS DE PLANES (Cross-Schema: billing.plans)
-- ==============================================
CREATE TABLE jellyfin.plan_rules (
    id BIGSERIAL PRIMARY KEY,
    
    -- El plan de facturación de GEMFLIX
    plan_id BIGINT NOT NULL REFERENCES billing.plans(id) ON DELETE CASCADE,
    
    jellyfin_server_id BIGINT NOT NULL REFERENCES jellyfin.servers(id) ON DELETE CASCADE,
    
    libraries JSONB, -- Librerías (Series, Películas) a las que tiene acceso este plan
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_jellyfin_plan_server UNIQUE (plan_id, jellyfin_server_id)
);
