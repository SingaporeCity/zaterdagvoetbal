-- ============================================
-- 003: Fix RLS policies for multiplayer match flow
-- Run this in the Supabase SQL Editor after 001 + 002
-- ============================================

-- Standings: league host mag INSERT (bij startLeague)
CREATE POLICY "standings_insert" ON standings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM leagues l WHERE l.id = standings.league_id AND l.created_by = auth.uid()
    )
);

-- Standings: league members mogen UPDATE (na wedstrijd)
CREATE POLICY "standings_update" ON standings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = standings.league_id AND c.owner_id = auth.uid()
    )
);

-- Schedule: league host mag INSERT (bij startLeague)
CREATE POLICY "schedule_insert" ON schedule FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM leagues l WHERE l.id = schedule.league_id AND l.created_by = auth.uid()
    )
);

-- Schedule: league members mogen UPDATE (played = true markeren)
CREATE POLICY "schedule_update" ON schedule FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = schedule.league_id AND c.owner_id = auth.uid()
    )
);

-- Match results: league members mogen INSERT (wedstrijd resultaten opslaan)
CREATE POLICY "results_insert" ON match_results FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = match_results.league_id AND c.owner_id = auth.uid()
    )
);

-- Players: league host mag ook spelers voor AI-clubs aanmaken
-- Drop de bestaande policy en maak een bredere versie
DROP POLICY IF EXISTS "players_insert" ON players;
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (
    club_id IS NULL
    OR EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = players.club_id AND c.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM clubs c
        JOIN leagues l ON l.id = c.league_id
        WHERE c.id = players.club_id AND l.created_by = auth.uid()
    )
);
