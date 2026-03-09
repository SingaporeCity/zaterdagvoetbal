-- ============================================
-- 011: Add client_state JSONB column to clubs
-- Stores all client-side game state that doesn't
-- have its own column (staff, myPlayer, match history,
-- scouting, sponsors, youth, etc.)
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS client_state JSONB NOT NULL DEFAULT '{}';
