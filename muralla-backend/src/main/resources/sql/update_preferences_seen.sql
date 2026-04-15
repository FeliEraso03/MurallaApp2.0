-- Update existing users who have completed preferences
-- Set preferences_seen to true for users who have touristType and ageRange populated
UPDATE user_preferences
SET preferences_seen = true
WHERE tourist_type IS NOT NULL
  AND age_range IS NOT NULL;
