-- ==========================================================
-- LIFE RPG — PHASE 1 DATABASE SCHEMA
-- PostgreSQL
-- ==========================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==========================================================
-- ENUMS
-- ==========================================================

DO $$ BEGIN
    CREATE TYPE quest_type AS ENUM ('MAIN', 'SIDE', 'MINI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE quest_category AS ENUM (
        'HEALTH',
        'STRENGTH',
        'INTELLIGENCE',
        'WISDOM',
        'AGILITY'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


-- ==========================================================
-- 1. USERS
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,

    username VARCHAR(30) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username
    ON users(username);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);


-- ==========================================================
-- 2. PROFILES
-- ==========================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    username VARCHAR(30) UNIQUE NOT NULL,

    avatar_url TEXT DEFAULT 'hero-default',

    title VARCHAR(100) DEFAULT 'Novice Adventurer',

    -- RPG progression
    level INTEGER NOT NULL DEFAULT 1
        CHECK (level >= 1),

    current_xp INTEGER NOT NULL DEFAULT 0
        CHECK (current_xp >= 0),

    -- Starting coins
    coins INTEGER NOT NULL DEFAULT 50
        CHECK (coins >= 0),

    -- Starting attributes
    health INTEGER NOT NULL DEFAULT 10
        CHECK (health >= 0),

    strength INTEGER NOT NULL DEFAULT 10
        CHECK (strength >= 0),

    intelligence INTEGER NOT NULL DEFAULT 10
        CHECK (intelligence >= 0),

    wisdom INTEGER NOT NULL DEFAULT 10
        CHECK (wisdom >= 0),

    agility INTEGER NOT NULL DEFAULT 10
        CHECK (agility >= 0),

    total_quests_completed INTEGER NOT NULL DEFAULT 0
        CHECK (total_quests_completed >= 0),

    equipped_frame VARCHAR(64) NOT NULL DEFAULT 'frame-wood',

    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id
    ON profiles(user_id);


-- ==========================================================
-- 3. STREAKS
-- ==========================================================

CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    current_streak INTEGER NOT NULL DEFAULT 0
        CHECK (current_streak >= 0),

    longest_streak INTEGER NOT NULL DEFAULT 0
        CHECK (longest_streak >= 0),

    last_completion_date DATE NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id
    ON streaks(user_id);


-- ==========================================================
-- 4. QUESTS
-- ==========================================================

CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(120) NOT NULL,

    description TEXT DEFAULT '',

    type quest_type NOT NULL,

    category quest_category NOT NULL,

    -- Server-authoritative reward values
    base_xp INTEGER NOT NULL
        CHECK (base_xp > 0),

    base_coins INTEGER NOT NULL
        CHECK (base_coins >= 0),

    attribute_points INTEGER NOT NULL
        CHECK (attribute_points >= 0),

    map_index INTEGER DEFAULT 1
        CHECK (map_index BETWEEN 1 AND 10),

    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,

    is_archived BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_user_active
    ON quests(user_id)
    WHERE is_archived = FALSE;


-- ==========================================================
-- 5. QUEST COMPLETIONS
-- Immutable audit ledger for completed quests
-- ==========================================================

CREATE TABLE IF NOT EXISTS quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quest_id UUID NOT NULL
        REFERENCES quests(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completion_date DATE NOT NULL,

    xp_awarded INTEGER NOT NULL
        CHECK (xp_awarded >= 0),

    coins_awarded INTEGER NOT NULL
        CHECK (coins_awarded >= 0),

    attribute_points_awarded INTEGER NOT NULL
        CHECK (attribute_points_awarded >= 0),

    attribute_category quest_category NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_quest_daily_completion
        UNIQUE (quest_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user_completed
    ON quest_completions(user_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_quest_completions_quest_id
    ON quest_completions(quest_id);


-- ==========================================================
-- 6. SHOP ITEMS
-- ==========================================================

CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    description TEXT DEFAULT '',

    price_coins INTEGER NOT NULL
        CHECK (price_coins >= 0),

    item_type VARCHAR(30) NOT NULL
        CHECK (
            item_type IN (
                'AVATAR',
                'TITLE',
                'THEME',
                'COSMETIC',
                'FRAME'
            )
        ),

    asset_key VARCHAR(150) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==========================================================
-- 7. INVENTORY
-- ==========================================================

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    shop_item_id UUID NOT NULL
        REFERENCES shop_items(id)
        ON DELETE CASCADE,

    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_inventory_user_item
        UNIQUE(user_id, shop_item_id)
);