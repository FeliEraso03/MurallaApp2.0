-- Add preferences_seen column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_preferences' AND column_name = 'preferences_seen'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN preferences_seen BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing users who have completed preferences
-- Set preferences_seen to true for users who have any preference populated
UPDATE user_preferences
SET preferences_seen = true
WHERE (tourist_type IS NOT NULL
   OR age_range IS NOT NULL
   OR gender IS NOT NULL
   OR mobility_type IS NOT NULL
   OR group_type IS NOT NULL
   OR interest_culture IS NOT NULL
   OR interest_religion IS NOT NULL
   OR interest_gastronomy IS NOT NULL
   OR interest_nature IS NOT NULL
   OR interest_arts IS NOT NULL
   OR interest_adventure IS NOT NULL
   OR budget IS NOT NULL
   OR language IS NOT NULL);
