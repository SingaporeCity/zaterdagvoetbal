-- ============================================
-- 010: Fix schedule_insert RLS policy
-- Allow any league member to insert schedule records
-- (not just the league creator)
-- This fixes the bug where Player 2 joins an active league
-- and tries to generate the schedule, but gets blocked by RLS.
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

DROP POLICY IF EXISTS "schedule_insert" ON schedule;
CREATE POLICY "schedule_insert" ON schedule FOR INSERT WITH CHECK (
    is_league_member(league_id)
);

-- Also fix standings_insert for the same reason
DROP POLICY IF EXISTS "standings_insert" ON standings;
CREATE POLICY "standings_insert" ON standings FOR INSERT WITH CHECK (
    is_league_member(league_id)
);
