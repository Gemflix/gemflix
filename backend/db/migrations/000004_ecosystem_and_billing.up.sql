-- Migración Fase 5: Esquemas del Ecosistema y Facturación Centralizada

-- ==============================================
-- 1. CREACIÓN DE ESQUEMAS LÓGICOS (Microservicios en Monolito)
-- ==============================================
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS drive;
CREATE SCHEMA IF NOT EXISTS jellyfin;

-- ==============================================
-- 2. TABLAS DE FACTURACIÓN (Esquema: billing)
-- ==============================================

-- 2.1 Planes
CREATE TABLE billing.plans (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'streaming',
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT 'primary',
    priority SMALLINT NOT NULL DEFAULT 0,
    badge VARCHAR(50),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    max_profiles SMALLINT NOT NULL DEFAULT 1,
    max_devices SMALLINT NOT NULL DEFAULT 1,
    max_pending_requests SMALLINT NOT NULL DEFAULT 1,
    parental_control BOOLEAN NOT NULL DEFAULT TRUE,
    features JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft Delete

    CONSTRAINT chk_plans_limits CHECK (
        max_profiles >= 1 AND 
        max_devices >= 1 AND 
        max_pending_requests >= 0
    )
);
CREATE INDEX idx_plans_category ON billing.plans(category);
CREATE INDEX idx_plans_priority ON billing.plans(priority);
CREATE INDEX idx_plans_active ON billing.plans(is_active);

-- 2.2 Precios por Plan (Multi-moneda)
CREATE TABLE billing.plan_prices (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES billing.plans(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL, -- USD, EUR, PEN, MXN
    price_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_plan_currency UNIQUE (plan_id, currency),
    CONSTRAINT chk_plan_prices_currency CHECK (currency ~ '^[A-Z]{3}$')
);

-- 2.3 Suscripciones (Conectado al Usuario del Esquema Público)
CREATE TABLE billing.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Key inter-esquema (AQUÍ ESTÁ LA MAGIA DEL SINGLE SIGN-ON)
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    
    plan_id BIGINT NOT NULL REFERENCES billing.plans(id) ON DELETE RESTRICT,

    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    starts_at TIMESTAMPTZ,
    renews_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,

    -- Snapshot Inmutable (Copia de seguridad del plan al momento del pago)
    plan_key_snapshot VARCHAR(50),
    plan_name_snapshot VARCHAR(100),
    currency_paid CHAR(3),
    price_paid_cents INTEGER,
    
    meta JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_subscriptions_status CHECK (status IN ('active', 'paused', 'canceled', 'expired')),
    CONSTRAINT chk_subscriptions_plan_snapshot CHECK (
        (plan_key_snapshot IS NULL AND plan_name_snapshot IS NULL) OR 
        (plan_key_snapshot IS NOT NULL AND plan_name_snapshot IS NOT NULL)
    ),
    CONSTRAINT chk_subscriptions_payment_snapshot CHECK (
        (currency_paid IS NULL AND (price_paid_cents IS NULL OR price_paid_cents = 0)) OR 
        (currency_paid IS NOT NULL AND price_paid_cents IS NOT NULL AND currency_paid ~ '^[A-Z]{3}$')
    ),
    CONSTRAINT chk_subscriptions_timeline CHECK (
        (starts_at IS NULL OR renews_at IS NULL OR starts_at <= renews_at) AND 
        (starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at) AND 
        (starts_at IS NULL OR canceled_at IS NULL OR starts_at <= canceled_at) AND 
        (canceled_at IS NULL OR ends_at IS NULL OR canceled_at <= ends_at)
    )
);

CREATE INDEX idx_subscriptions_user_status_ends ON billing.subscriptions(user_id, status, ends_at);
CREATE INDEX idx_subscriptions_plan_status_ends ON billing.subscriptions(plan_id, status, ends_at);
