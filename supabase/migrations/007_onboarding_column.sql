-- Add onboarding_completed column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
