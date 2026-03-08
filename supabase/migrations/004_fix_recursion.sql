-- ============================================
-- 004: Fix infinite recursion in clubs RLS policy
-- The clubs_select policy references clubs itself → infinite loop
-- Fix: SECURITY DEFINER function bypasses RLS for membership check
-- ============================================

-- Helper function: check league membership without triggering RLS
CREATE OR REPLACE FUNCTION is_league_member(p_league_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM clubs WHERE league_id = p_league_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix clubs_select: use function instead of self-referencing subquery
DROP POLICY IF EXISTS "clubs_select" ON clubs;
CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (
    is_league_member(league_id)
    OR EXISTS (SELECT 1 FROM leagues l WHERE l.id = league_id AND l.status = 'lobby')
);

-- Fix leagues_select: also references clubs, use function
DROP POLICY IF EXISTS "leagues_select" ON leagues;
CREATE POLICY "leagues_select" ON leagues FOR SELECT USING (
    status = 'lobby'
    OR is_league_member(id)
);

-- Fix all other policies that SELECT from clubs
DROP POLICY IF EXISTS "players_select" ON players;
CREATE POLICY "players_select" ON players FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "standings_select" ON standings;
CREATE POLICY "standings_select" ON standings FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "schedule_select" ON schedule;
CREATE POLICY "schedule_select" ON schedule FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "results_select" ON match_results;
CREATE POLICY "results_select" ON match_results FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "transfer_select" ON transfer_market;
CREATE POLICY "transfer_select" ON transfer_market FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "feed_select" ON league_feed;
CREATE POLICY "feed_select" ON league_feed FOR SELECT USING (
    is_league_member(league_id)
);

DROP POLICY IF EXISTS "feed_insert" ON league_feed;
CREATE POLICY "feed_insert" ON league_feed FOR INSERT WITH CHECK (
    is_league_member(league_id)
);
