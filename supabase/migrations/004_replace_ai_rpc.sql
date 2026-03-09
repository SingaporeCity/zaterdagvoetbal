-- ============================================
-- 004: RPC to replace an AI club with a human player
-- Run this in the Supabase SQL Editor after 001 + 002 + 003
-- ============================================

-- Atomic function to replace an AI club with a human player.
-- Uses SECURITY DEFINER to bypass RLS (new player doesn't own a club yet).
-- Returns the replaced club's ID, or NULL if no AI club available.
CREATE OR REPLACE FUNCTION replace_ai_club(
    p_league_id UUID,
    p_user_id UUID,
    p_club_name TEXT DEFAULT 'FC Nieuw Team'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ai_club_id UUID;
BEGIN
    -- Lock and pick one AI club (prevents race condition with concurrent joins)
    SELECT id INTO v_ai_club_id
    FROM clubs
    WHERE league_id = p_league_id AND is_ai = true
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_ai_club_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Replace AI club with the human player
    UPDATE clubs
    SET owner_id = p_user_id,
        is_ai = false,
        name = p_club_name
    WHERE id = v_ai_club_id;

    RETURN v_ai_club_id;
END;
$$;
