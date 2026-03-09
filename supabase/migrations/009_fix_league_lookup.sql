-- ============================================
-- 009: Fix league lookup + RLS recursion fix
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. Helper function to check league membership (bypasses RLS on clubs)
CREATE OR REPLACE FUNCTION is_league_member(p_league_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM clubs WHERE league_id = p_league_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Fix clubs_select: prevent infinite recursion
DROP POLICY IF EXISTS "clubs_select" ON clubs;
CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (
    is_league_member(league_id)
    OR EXISTS (SELECT 1 FROM leagues l WHERE l.id = league_id AND l.status = 'lobby')
);

-- 3. Fix leagues_select: use helper function
DROP POLICY IF EXISTS "leagues_select" ON leagues;
CREATE POLICY "leagues_select" ON leagues FOR SELECT USING (
    status = 'lobby'
    OR is_league_member(id)
);

-- 4. Fix other policies that reference clubs
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

-- 5. RPC for invite code lookup (bypasses RLS entirely)
CREATE OR REPLACE FUNCTION find_league_by_invite_code(p_code TEXT)
RETURNS SETOF leagues AS $$
    SELECT * FROM leagues WHERE invite_code = p_code AND status IN ('lobby', 'active') LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
