-- 012_atomic_week_simulation.sql
-- Fixes multiplayer concurrency: atomic week simulation via RPC + UNIQUE constraint

-- 1. UNIQUE constraint on match_results (prevents duplicate results)
ALTER TABLE match_results
ADD CONSTRAINT match_results_unique_match
UNIQUE (league_id, season, week, home_club_id, away_club_id);

-- 2. Add leagues to realtime publication (for week sync)
ALTER PUBLICATION supabase_realtime ADD TABLE leagues;

-- 3. Atomic week simulation RPC
-- Uses FOR UPDATE lock on league row to serialize concurrent calls.
-- SECURITY DEFINER: bypasses RLS so non-host players can update league week.
CREATE OR REPLACE FUNCTION process_week_results(
    p_league_id UUID,
    p_season INT,
    p_week INT,
    p_results JSONB  -- [{home_club_id, away_club_id, home_score, away_score, schedule_id, match_data}]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_league RECORD;
    v_result JSONB;
    v_item JSONB;
    v_inserted INT := 0;
    v_home_score INT;
    v_away_score INT;
    v_home_won BOOLEAN;
    v_away_won BOOLEAN;
    v_drawn BOOLEAN;
BEGIN
    -- Lock league row — second concurrent call blocks here
    SELECT * INTO v_league
    FROM leagues
    WHERE id = p_league_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'league_not_found');
    END IF;

    -- Check if week already advanced past this week
    IF v_league.week > p_week THEN
        RETURN jsonb_build_object('success', true, 'already_exists', true, 'inserted', 0);
    END IF;

    -- Check if results already exist for this week
    IF EXISTS (
        SELECT 1 FROM match_results
        WHERE league_id = p_league_id AND season = p_season AND week = p_week
        LIMIT 1
    ) THEN
        RETURN jsonb_build_object('success', true, 'already_exists', true, 'inserted', 0);
    END IF;

    -- Process each result
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_results)
    LOOP
        v_home_score := (v_item->>'home_score')::INT;
        v_away_score := (v_item->>'away_score')::INT;
        v_home_won := v_home_score > v_away_score;
        v_away_won := v_away_score > v_home_score;
        v_drawn := v_home_score = v_away_score;

        -- Insert match result (ON CONFLICT = skip if duplicate)
        INSERT INTO match_results (league_id, schedule_id, season, week, home_club_id, away_club_id, home_score, away_score, match_data)
        VALUES (
            p_league_id,
            (v_item->>'schedule_id')::UUID,
            p_season,
            p_week,
            (v_item->>'home_club_id')::UUID,
            (v_item->>'away_club_id')::UUID,
            v_home_score,
            v_away_score,
            COALESCE(v_item->'match_data', '{}'::JSONB)
        )
        ON CONFLICT (league_id, season, week, home_club_id, away_club_id) DO NOTHING;

        IF FOUND THEN
            v_inserted := v_inserted + 1;
        END IF;

        -- Mark schedule entry as played
        UPDATE schedule SET played = true
        WHERE id = (v_item->>'schedule_id')::UUID;

        -- Update home team standings (atomic increment, no read-modify-write)
        UPDATE standings SET
            played = played + 1,
            won = won + CASE WHEN v_home_won THEN 1 ELSE 0 END,
            drawn = drawn + CASE WHEN v_drawn THEN 1 ELSE 0 END,
            lost = lost + CASE WHEN NOT v_home_won AND NOT v_drawn THEN 1 ELSE 0 END,
            goals_for = goals_for + v_home_score,
            goals_against = goals_against + v_away_score,
            points = points + CASE WHEN v_home_won THEN 3 WHEN v_drawn THEN 1 ELSE 0 END
        WHERE league_id = p_league_id
          AND season = p_season
          AND club_id = (v_item->>'home_club_id')::UUID;

        -- Update away team standings (atomic increment)
        UPDATE standings SET
            played = played + 1,
            won = won + CASE WHEN v_away_won THEN 1 ELSE 0 END,
            drawn = drawn + CASE WHEN v_drawn THEN 1 ELSE 0 END,
            lost = lost + CASE WHEN NOT v_away_won AND NOT v_drawn THEN 1 ELSE 0 END,
            goals_for = goals_for + v_away_score,
            goals_against = goals_against + v_home_score,
            points = points + CASE WHEN v_away_won THEN 3 WHEN v_drawn THEN 1 ELSE 0 END
        WHERE league_id = p_league_id
          AND season = p_season
          AND club_id = (v_item->>'away_club_id')::UUID;
    END LOOP;

    -- Advance league week
    UPDATE leagues SET week = p_week + 1
    WHERE id = p_league_id;

    RETURN jsonb_build_object('success', true, 'already_exists', false, 'inserted', v_inserted);
END;
$$;
