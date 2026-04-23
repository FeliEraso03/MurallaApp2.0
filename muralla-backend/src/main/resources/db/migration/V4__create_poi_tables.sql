-- ============================================================
-- V4: Create points_of_interest table
-- ============================================================

CREATE TABLE IF NOT EXISTS points_of_interest (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(100),
    lat                 DOUBLE PRECISION NOT NULL,
    lng                 DOUBLE PRECISION NOT NULL,
    coordinates         geometry(Point, 4326),
    profile_picture_url TEXT,
    website_url         TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

-- Index for spatial searches
CREATE INDEX IF NOT EXISTS idx_poi_coords ON points_of_interest USING GIST (coordinates);

-- Update trigger for updated_at
CREATE TRIGGER trg_poi_updated_at
    BEFORE UPDATE ON points_of_interest
    FOR EACH ROW EXECUTE FUNCTION update_graphs_updated_at();
