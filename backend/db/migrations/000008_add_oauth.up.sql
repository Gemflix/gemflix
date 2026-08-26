-- Permitir que el password sea nulo para usuarios registrados exclusivamente con OAuth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Tabla para rastrear los proveedores de autenticación externos
CREATE TABLE oauth_providers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'apple', 'facebook'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_oauth_provider_user UNIQUE(provider, provider_user_id)
);

CREATE INDEX oauth_providers_user_id_idx ON oauth_providers(user_id);
