-- Module 4: Billing, Store & Finance

-- ==============================================
-- 1. WALLET
-- ==============================================
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0)
);

CREATE TABLE wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'deposit', 'withdrawal', 'purchase', 'reward'
    description TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_wallet_txn_amount_nonzero CHECK (amount != 0)
);
CREATE INDEX wallet_transactions_wallet_id_idx ON wallet_transactions(wallet_id);

-- ==============================================
-- 2. PLANS & SUBSCRIPTIONS
-- ==============================================
CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(120) UNIQUE NOT NULL,
    category VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(32),
    priority SMALLINT NOT NULL DEFAULT 1,
    badge VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    max_profiles SMALLINT NOT NULL DEFAULT 1,
    max_devices SMALLINT NOT NULL DEFAULT 1,
    max_pending_requests SMALLINT NOT NULL DEFAULT 0,
    parental_control BOOLEAN NOT NULL DEFAULT FALSE,
    features JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plan_prices (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    price_cents BIGINT NOT NULL,
    interval VARCHAR(32) NOT NULL, -- 'monthly', 'yearly', 'lifetime'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_plan_currency_interval UNIQUE (plan_id, currency, interval)
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES plans(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL, -- 'active', 'canceled', 'expired', 'past_due'
    
    plan_key_snapshot VARCHAR(120),
    plan_name_snapshot VARCHAR(255),
    currency_paid CHAR(3),
    price_paid_cents BIGINT,
    
    starts_at TIMESTAMPTZ NOT NULL,
    renews_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    payment_method VARCHAR(32), -- 'stripe', 'paypal', 'crypto', 'wallet', 'manual'
    reference_id VARCHAR(255),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subscriptions_user_status_idx ON subscriptions(user_id, status);

-- ==============================================
-- 3. SHOP & INVENTORY
-- ==============================================
CREATE TABLE shop_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- 'avatar','frame','background','badge'
    collection VARCHAR(255),
    price BIGINT NOT NULL DEFAULT 0,
    media_id BIGINT,
    meta JSONB,
    preview_css TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shop_items_name_type UNIQUE(name, type)
);
CREATE INDEX shop_items_catalog_idx ON shop_items(type, is_active, price);

CREATE TABLE user_inventory (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_item_id BIGINT NOT NULL REFERENCES shop_items(id) ON DELETE RESTRICT,
    equipped_by_profile_id BIGINT REFERENCES profiles(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_inventory_item UNIQUE(user_id, shop_item_id)
);
CREATE INDEX user_inventory_equipped_idx ON user_inventory(equipped_by_profile_id, shop_item_id);

-- ==============================================
-- 4. FINANCE (ADMIN)
-- ==============================================
CREATE TABLE transaction_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'income', 'expense'
    color VARCHAR(32),
    icon VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE finance_transactions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    type VARCHAR(32) NOT NULL, -- 'income', 'expense'
    category_id BIGINT REFERENCES transaction_categories(id) ON DELETE SET NULL,
    plan_id BIGINT REFERENCES plans(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    description TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 7. PROMOS AND REFERRALS
-- ==============================================
CREATE TABLE promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'percentage', 'fixed', 'free_days'
    value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    uses INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE promo_redemptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    promo_code_id BIGINT NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_promo_user UNIQUE (user_id, promo_code_id)
);

CREATE TABLE referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    device_id BIGINT REFERENCES public.devices(id) ON DELETE SET NULL,
    attribution_hash CHAR(64) UNIQUE,
    referee_user_id BIGINT UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
    promo_code_id BIGINT REFERENCES promo_codes(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending','converted','rewarded','invalid'
    converted_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX referrals_referrer_status_idx ON referrals(referrer_user_id, status);

-- ==============================================
-- 8. ADS SYSTEM
-- ==============================================
CREATE TABLE ads (
    id BIGSERIAL PRIMARY KEY,
    company VARCHAR(255),
    type VARCHAR(32) NOT NULL, -- 'smartlink', 'shortener', 'banner', 'interstitial', 'native', 'vast'
    content TEXT NOT NULL,
    is_rewarded BOOLEAN NOT NULL DEFAULT FALSE,
    reward_tokens INTEGER NOT NULL DEFAULT 0,
    daily_limit SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ads_active_type_idx ON ads(is_active, type);

CREATE TABLE user_ad_views (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    views_today INTEGER NOT NULL DEFAULT 0,
    last_view_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_ad_view UNIQUE (user_id, ad_id)
);
