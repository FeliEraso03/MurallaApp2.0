-- ============================================================
-- V5: Fix POI column names and add missing ones
-- ============================================================

ALTER TABLE points_of_interest 
    RENAME COLUMN lat TO latitude;

ALTER TABLE points_of_interest 
    RENAME COLUMN lng TO longitude;

ALTER TABLE points_of_interest 
    ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS relevance_score           INTEGER DEFAULT 5;
