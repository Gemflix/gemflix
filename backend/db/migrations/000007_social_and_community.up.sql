-- Module 7: Social, Community & Arcade

-- ==============================================
-- 1. SOCIAL (USER PROGRESS & LISTS)
-- ==============================================
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL, -- 'movie', 'serie', 'livetv'
    content_id BIGINT NOT NULL,
    tmdb_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorites_profile_content UNIQUE (profile_id, content_type, content_id)
);

CREATE TABLE watch_later (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    tmdb_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_watch_later_profile_content UNIQUE (profile_id, content_type, content_id)
);

CREATE TABLE watch_progress (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    progress_sec INTEGER NOT NULL DEFAULT 0,
    duration_sec INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_watch_progress_profile_content UNIQUE (profile_id, content_type, content_id)
);

CREATE TABLE profile_views (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_profile_views_content UNIQUE (profile_id, content_type, content_id)
);
CREATE INDEX idx_profile_views ON profile_views(profile_id, viewed_at);

-- ==============================================
-- 2. COMMUNITY (REQUESTS, REPORTS, VOTES)
-- ==============================================
CREATE TABLE content_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tmdb_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'fulfilled', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- 'open', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'up', 'down'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_votes_user_content UNIQUE (user_id, content_type, content_id)
);

-- ==============================================
-- 3. ARCADE (GAMIFICATION)
-- ==============================================
CREATE TABLE arcade_game_settings (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    play_cost_tokens INTEGER NOT NULL DEFAULT 0,
    daily_free_plays SMALLINT NOT NULL DEFAULT 0,
    max_ad_plays SMALLINT NOT NULL DEFAULT 0,
    win_probability_percent SMALLINT NOT NULL DEFAULT 0,
    happy_hour_start TIME,
    happy_hour_end TIME,
    happy_hour_multiplier SMALLINT NOT NULL DEFAULT 1,
    double_reward_days JSONB,
    prizes_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arcade_user_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    xp_points BIGINT NOT NULL DEFAULT 0,
    rp_cups_weekly INTEGER NOT NULL DEFAULT 0,
    rp_cups_monthly INTEGER NOT NULL DEFAULT 0,
    total_games_played INTEGER NOT NULL DEFAULT 0,
    device_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    required_xp INTEGER NOT NULL DEFAULT 0,
    reward_tokens INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_achievements UNIQUE (user_id, achievement_id)
);

CREATE TABLE daily_missions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type VARCHAR(255) NOT NULL,
    required_count INTEGER NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trivia_questions (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    wrong_answers JSONB NOT NULL,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trivia_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'started',
    rewarded_prize VARCHAR(255),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 4. UTILS (DOWNLOADS, TUTORIALS)
-- ==============================================
CREATE TABLE downloads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tutorials (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    video_url VARCHAR(2048),
    sort_order SMALLINT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 5. NOTIFICATIONS
-- ==============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX notifications_user_idx ON notifications(user_id);
