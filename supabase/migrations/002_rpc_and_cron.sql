-- ============================================
-- Migration 002: Additional RPCs and pg_cron setup
-- ============================================

-- RPC: Age all players in a league (called at season end)
CREATE OR REPLACE FUNCTION age_league_players(p_league_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE players
    SET age = age + 1,
        goals = 0,
        assists = 0
    WHERE league_id = p_league_id;

    UPDATE youth_players
    SET age = age + 1
    WHERE league_id = p_league_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron schedule for daily match simulation at 18:00 UTC (20:00 CET)
-- NOTE: pg_cron must be enabled in Supabase dashboard first
-- Then run this manually via SQL editor:
--
-- SELECT cron.schedule(
--     'daily-match-simulation',
--     '0 18 * * *',
--     $$
--     SELECT net.http_post(
--         url := current_setting('app.settings.supabase_url') || '/functions/v1/simulate-matches',
--         headers := jsonb_build_object(
--             'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--             'Content-Type', 'application/json'
--         ),
--         body := '{}'::jsonb
--     );
--     $$
-- );
--
-- Alternative: Use Supabase Dashboard > Database > Extensions > pg_cron
-- Or set up a separate cron job via Supabase Edge Function Schedules

-- Grant service role access to standings (needed for match simulation)
-- These policies allow service_role to write standings and results
-- (service_role bypasses RLS by default, but documenting intent)

-- RPC: Get league info with club count
CREATE OR REPLACE FUNCTION get_league_info(p_invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_league leagues%ROWTYPE;
    v_club_count INT;
    v_human_count INT;
BEGIN
    SELECT * INTO v_league FROM leagues WHERE invite_code = upper(p_invite_code);
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Niet gevonden');
    END IF;

    SELECT count(*) INTO v_club_count FROM clubs WHERE league_id = v_league.id;
    SELECT count(*) INTO v_human_count FROM clubs WHERE league_id = v_league.id AND is_ai = false;

    RETURN jsonb_build_object(
        'id', v_league.id,
        'name', v_league.name,
        'status', v_league.status,
        'invite_code', v_league.invite_code,
        'total_clubs', v_club_count,
        'human_players', v_human_count,
        'max_players', v_league.max_players,
        'season', v_league.season,
        'week', v_league.week
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
