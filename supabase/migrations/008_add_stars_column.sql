-- Add stars column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS stars NUMERIC NOT NULL DEFAULT 0;
