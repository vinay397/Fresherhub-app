-- Fix credits_reset_at to allow null values for ChatGPT-like behavior
-- Credits reset timer only starts when all credits are exhausted

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add last_login column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add profile_completed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add subscription_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_type TEXT DEFAULT 'free';
  END IF;
END $$;

-- Allow credits_reset_at to be null (no timer until credits exhausted)
ALTER TABLE user_profiles ALTER COLUMN credits_reset_at DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN credits_reset_at DROP DEFAULT;

-- Update existing users to have null reset time if they have credits
UPDATE user_profiles 
SET credits_reset_at = NULL 
WHERE credits > 0;