-- ============================================
-- 014: Tighten RLS policies — anti-cheat
-- Standings UPDATE: only own club (via club ownership)
-- Schedule UPDATE: blocked entirely (only via SECURITY DEFINER RPCs)
-- INSERT policies: unchanged (league members, needed for client-side operations)
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- Standings: restrict UPDATE to own club only
-- (prevents players from doing standings.update({points: 999}) for other clubs)
-- Note: RPCs like process_week_results use SECURITY DEFINER → bypass RLS
DROP POLICY IF EXISTS "standings_update" ON standings;
CREATE POLICY "standings_update" ON standings FOR UPDATE USING (
    club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())
);

-- Schedule: block all direct UPDATEs
-- All schedule mutations go through process_week_results RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "schedule_update" ON schedule;
CREATE POLICY "schedule_update" ON schedule FOR UPDATE USING (false);
