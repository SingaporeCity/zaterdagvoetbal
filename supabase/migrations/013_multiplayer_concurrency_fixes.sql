-- 013_multiplayer_concurrency_fixes.sql
-- Fixes: startLeague race, joinLeague overflow, season transition

-- 1. Atomic start_league RPC
-- Locks league row, checks status=lobby, creates AI teams + standings + schedule atomically.
-- Prevents double-start race condition.
CREATE OR REPLACE FUNCTION start_league(
    p_league_id UUID,
    p_user_id UUID,
    p_ai_teams JSONB  -- [{name: "VV Eendracht"}, ...]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_league RECORD;
    v_ai_club RECORD;
    v_ai_item JSONB;
    v_human_clubs JSONB;
    v_human_count INT;
    v_all_club_ids UUID[];
    v_club_id UUID;
BEGIN
    -- Lock league row
    SELECT * INTO v_league
    FROM leagues
    WHERE id = p_league_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'league_not_found');
    END IF;

    -- Only lobby leagues can be started
    IF v_league.status != 'lobby' THEN
        RETURN jsonb_build_object('success', true, 'already_started', true);
    END IF;

    -- Verify caller is league creator
    IF v_league.created_by != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_creator');
    END IF;

    -- Get existing human clubs
    SELECT array_agg(id) INTO v_all_club_ids
    FROM clubs
    WHERE league_id = p_league_id AND is_ai = false;

    v_human_count := COALESCE(array_length(v_all_club_ids, 1), 0);

    -- Create AI teams
    FOR v_ai_item IN SELECT * FROM jsonb_array_elements(p_ai_teams)
    LOOP
        INSERT INTO clubs (league_id, owner_id, name, is_ai, division)
        VALUES (p_league_id, NULL, v_ai_item->>'name', true, v_league.division)
        RETURNING id INTO v_club_id;

        v_all_club_ids := array_append(v_all_club_ids, v_club_id);
    END LOOP;

    -- Create standings for ALL clubs
    FOR i IN 1..array_length(v_all_club_ids, 1)
    LOOP
        INSERT INTO standings (league_id, season, club_id, position)
        VALUES (p_league_id, 1, v_all_club_ids[i], i)
        ON CONFLICT (league_id, season, club_id) DO NOTHING;
    END LOOP;

    -- Set league to active
    UPDATE leagues
    SET status = 'active',
        week = CASE WHEN v_human_count >= 2 THEN 1 ELSE 0 END,
        season = 1
    WHERE id = p_league_id;

    RETURN jsonb_build_object(
        'success', true,
        'already_started', false,
        'ai_club_ids', to_jsonb(v_all_club_ids[v_human_count+1:]),
        'all_club_ids', to_jsonb(v_all_club_ids),
        'human_count', v_human_count
    );
END;
$$;

-- 2. Atomic join_league RPC
-- Prevents concurrent joins from exceeding max_players.
CREATE OR REPLACE FUNCTION join_league(
    p_league_id UUID,
    p_user_id UUID,
    p_club_name TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_league RECORD;
    v_count INT;
    v_club_id UUID;
    v_existing_club_id UUID;
BEGIN
    -- Lock league row
    SELECT * INTO v_league
    FROM leagues
    WHERE id = p_league_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'league_not_found');
    END IF;

    IF v_league.status != 'lobby' THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_lobby');
    END IF;

    -- Check if already joined
    SELECT id INTO v_existing_club_id
    FROM clubs
    WHERE league_id = p_league_id AND owner_id = p_user_id
    LIMIT 1;

    IF v_existing_club_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'already_joined', true, 'club_id', v_existing_club_id);
    END IF;

    -- Count current human players (under lock — no race)
    SELECT COUNT(*) INTO v_count
    FROM clubs
    WHERE league_id = p_league_id AND is_ai = false;

    IF v_count >= v_league.max_players THEN
        RETURN jsonb_build_object('success', false, 'error', 'league_full');
    END IF;

    -- Insert club
    INSERT INTO clubs (league_id, owner_id, name, is_ai, division)
    VALUES (p_league_id, p_user_id, p_club_name, false, v_league.division)
    RETURNING id INTO v_club_id;

    RETURN jsonb_build_object('success', true, 'already_joined', false, 'club_id', v_club_id);
END;
$$;

-- 3. Atomic process_season_end RPC
-- Resets standings and advances season for the entire league.
-- Only runs once per season (idempotent via season check).
CREATE OR REPLACE FUNCTION process_season_end(
    p_league_id UUID,
    p_season INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_league RECORD;
    v_club_id UUID;
    v_position INT := 0;
BEGIN
    -- Lock league row
    SELECT * INTO v_league
    FROM leagues
    WHERE id = p_league_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'league_not_found');
    END IF;

    -- Already advanced past this season
    IF v_league.season > p_season THEN
        RETURN jsonb_build_object('success', true, 'already_processed', true);
    END IF;

    -- Create fresh standings for the new season
    FOR v_club_id IN
        SELECT club_id FROM standings
        WHERE league_id = p_league_id AND season = p_season
        ORDER BY points DESC, goals_for - goals_against DESC, goals_for DESC
    LOOP
        v_position := v_position + 1;

        -- Update final position in current season standings
        UPDATE standings SET position = v_position
        WHERE league_id = p_league_id AND season = p_season AND club_id = v_club_id;

        -- Insert new season standings
        INSERT INTO standings (league_id, season, club_id, position)
        VALUES (p_league_id, p_season + 1, v_club_id, v_position)
        ON CONFLICT (league_id, season, club_id) DO NOTHING;
    END LOOP;

    -- Advance league
    UPDATE leagues
    SET season = p_season + 1,
        week = 1
    WHERE id = p_league_id;

    -- Reset player goals/assists for the new season
    UPDATE players
    SET goals = 0, assists = 0, yellow_cards = 0
    WHERE league_id = p_league_id;

    RETURN jsonb_build_object(
        'success', true,
        'already_processed', false,
        'new_season', p_season + 1
    );
END;
$$;
