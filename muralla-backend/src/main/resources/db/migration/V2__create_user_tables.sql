-- ============================================================
-- V2: Create _user and user_preferences tables
-- ============================================================

CREATE TABLE IF NOT EXISTS _user (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(255),
    profile_picture_url TEXT,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id                           SERIAL PRIMARY KEY,
    user_id                      INTEGER REFERENCES _user(id) ON DELETE CASCADE,
    default_time_available_hours INTEGER,
    mobility_type                VARCHAR(50),
    group_type                   VARCHAR(50),
    tourist_type                 VARCHAR(50),
    age_range                    VARCHAR(50),
    gender                       VARCHAR(50),
    interest_culture             INTEGER,
    interest_religion            INTEGER,
    interest_gastronomy          INTEGER,
    interest_nature              INTEGER,
    interest_arts                INTEGER,
    interest_adventure           INTEGER,
    budget                       DECIMAL(19, 2),
    currency                     VARCHAR(10),
    language                     VARCHAR(10),
    preferences_seen             BOOLEAN DEFAULT FALSE
);
