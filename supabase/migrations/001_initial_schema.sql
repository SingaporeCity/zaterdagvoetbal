-- ============================================
-- ZATERDAGVOETBAL MULTIPLAYER SCHEMA
-- Migration 001: Initial tables + RLS + triggers
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES — extends auth.users
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Manager',
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
-- Users can update their own profile
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Users can insert their own profile (via trigger, but also allow manual)
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Manager'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. LEAGUES — lobby system
-- ============================================
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'finished')),
    match_time TIME NOT NULL DEFAULT '20:00',
    week INT NOT NULL DEFAULT 0,
    season INT NOT NULL DEFAULT 1,
    division INT NOT NULL DEFAULT 8,
    max_players INT NOT NULL DEFAULT 8,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Lobby leagues visible to everyone; active/finished visible to members
CREATE POLICY "leagues_select" ON leagues FOR SELECT USING (
    status = 'lobby'
    OR EXISTS (
        SELECT 1 FROM clubs WHERE clubs.league_id = leagues.id AND clubs.owner_id = auth.uid()
    )
);
-- Only creator can update their league
CREATE POLICY "leagues_update" ON leagues FOR UPDATE USING (created_by = auth.uid());
-- Authenticated users can create leagues
CREATE POLICY "leagues_insert" ON leagues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 3. CLUBS — 1 per player per league
-- ============================================
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id),  -- NULL = AI team
    name TEXT NOT NULL,
    is_ai BOOLEAN NOT NULL DEFAULT false,
    division INT NOT NULL DEFAULT 8,
    budget NUMERIC NOT NULL DEFAULT 5000,
    reputation INT NOT NULL DEFAULT 10,
    -- Complex state as JSONB
    stadium JSONB NOT NULL DEFAULT '{}',
    staff JSONB NOT NULL DEFAULT '{}',
    training JSONB NOT NULL DEFAULT '{}',
    tactics JSONB NOT NULL DEFAULT '{"mentaliteit":"normaal","offensief":"gebalanceerd","speltempo":"normaal","veldbreedte":"gebalanceerd","dekking":"zone"}',
    formation TEXT NOT NULL DEFAULT '4-4-2',
    sponsor JSONB,
    finances JSONB NOT NULL DEFAULT '{"history":[]}',
    achievements JSONB NOT NULL DEFAULT '{}',
    season_history JSONB NOT NULL DEFAULT '[]',
    event_history JSONB NOT NULL DEFAULT '{"events":[],"lastEventTime":null}',
    manager JSONB NOT NULL DEFAULT '{"xp":0,"level":1}',
    stats JSONB NOT NULL DEFAULT '{"wins":0,"draws":0,"losses":0,"cleanSheets":0,"comebacks":0,"hatTricks":0,"highestScoreMatch":0,"currentUnbeaten":0,"currentWinStreak":0,"promotions":0,"relegationEscapes":0,"youthGraduates":0,"highestSale":0,"sellouts":0,"homeWins":0,"saturdayMatches":0,"bestWinStreak":0,"bestUnbeaten":0}',
    specialists JSONB NOT NULL DEFAULT '{"cornerTaker":null,"penaltyTaker":null,"freekickTaker":null,"captain":null}',
    trainers JSONB NOT NULL DEFAULT '{"attack":1,"midfield":1,"defense":1,"goalkeeper":1,"fitness":1}',
    assistant_trainers JSONB NOT NULL DEFAULT '{"attacking":null,"defensive":null,"technical":null,"physical":null}',
    colors JSONB NOT NULL DEFAULT '{"primary":"#1b5e20","secondary":"#f5f0e1","accent":"#ff9800"}',
    daily_rewards JSONB NOT NULL DEFAULT '{"lastLogin":null,"lastClaimDate":null,"streak":0}',
    daily_checklist JSONB NOT NULL DEFAULT '{}',
    scouting_network TEXT NOT NULL DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(league_id, owner_id)
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Visible to league members
CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = clubs.league_id AND c.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM leagues l WHERE l.id = clubs.league_id AND l.status = 'lobby'
    )
);
-- Only owner can update own club
CREATE POLICY "clubs_update" ON clubs FOR UPDATE USING (owner_id = auth.uid());
-- Insert via server functions (service role) or own club
CREATE POLICY "clubs_insert" ON clubs FOR INSERT WITH CHECK (
    owner_id = auth.uid() OR owner_id IS NULL
);

-- ============================================
-- 4. PLAYERS — separate table for transfers/queries
-- ============================================
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL,
    position TEXT NOT NULL,
    nationality TEXT NOT NULL DEFAULT 'nl',
    overall INT NOT NULL DEFAULT 50,
    potential INT NOT NULL DEFAULT 60,
    attributes JSONB NOT NULL DEFAULT '{}',
    personality TEXT,
    tag TEXT,
    salary NUMERIC NOT NULL DEFAULT 0,
    contract_weeks INT NOT NULL DEFAULT 52,
    goals INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    morale INT NOT NULL DEFAULT 70,
    fitness INT NOT NULL DEFAULT 90,
    energy INT NOT NULL DEFAULT 80,
    matches_together INT NOT NULL DEFAULT 0,
    lineup_position INT,  -- NULL = bench, 0-10 = lineup slot
    listed_for_sale BOOLEAN NOT NULL DEFAULT false,
    xp INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_players_club ON players(club_id);
CREATE INDEX idx_players_league ON players(league_id);
CREATE INDEX idx_players_goals ON players(league_id, goals DESC);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Visible to league members
CREATE POLICY "players_select" ON players FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = players.league_id AND c.owner_id = auth.uid()
    )
);
-- Owner of the club can update their players
CREATE POLICY "players_update" ON players FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = players.club_id AND c.owner_id = auth.uid()
    )
);
-- Insert via service role or club owner
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (
    club_id IS NULL
    OR EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = players.club_id AND c.owner_id = auth.uid()
    )
);

-- ============================================
-- 5. YOUTH_PLAYERS — per club
-- ============================================
CREATE TABLE youth_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL,
    position TEXT NOT NULL,
    nationality TEXT NOT NULL DEFAULT 'nl',
    overall INT NOT NULL DEFAULT 30,
    potential INT NOT NULL DEFAULT 60,
    potential_stars NUMERIC NOT NULL DEFAULT 2.0,
    attributes JSONB NOT NULL DEFAULT '{}',
    personality TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "youth_select" ON youth_players FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = youth_players.club_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY "youth_update" ON youth_players FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = youth_players.club_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY "youth_insert" ON youth_players FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = youth_players.club_id AND c.owner_id = auth.uid()
    )
);
CREATE POLICY "youth_delete" ON youth_players FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = youth_players.club_id AND c.owner_id = auth.uid()
    )
);

-- ============================================
-- 6. STANDINGS — per league/season/club
-- ============================================
CREATE TABLE standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    season INT NOT NULL DEFAULT 1,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_diff INT GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points INT NOT NULL DEFAULT 0,
    position INT NOT NULL DEFAULT 0,
    UNIQUE(league_id, season, club_id)
);

CREATE INDEX idx_standings_league_season ON standings(league_id, season);

ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- Visible to league members
CREATE POLICY "standings_select" ON standings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = standings.league_id AND c.owner_id = auth.uid()
    )
);
-- Only server (service role) writes standings — no user policy for insert/update

-- ============================================
-- 7. SCHEDULE — pre-generated round-robin
-- ============================================
CREATE TABLE schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    season INT NOT NULL DEFAULT 1,
    week INT NOT NULL,
    home_club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    away_club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    played BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(league_id, season, week, home_club_id, away_club_id)
);

CREATE INDEX idx_schedule_league_week ON schedule(league_id, season, week);

ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_select" ON schedule FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = schedule.league_id AND c.owner_id = auth.uid()
    )
);

-- ============================================
-- 8. MATCH_RESULTS — wedstrijduitslagen
-- ============================================
CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedule(id),
    season INT NOT NULL,
    week INT NOT NULL,
    home_club_id UUID NOT NULL REFERENCES clubs(id),
    away_club_id UUID NOT NULL REFERENCES clubs(id),
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    match_data JSONB NOT NULL DEFAULT '{}',  -- events, ratings, man of the match
    played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_results_league_season ON match_results(league_id, season);

ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "results_select" ON match_results FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = match_results.league_id AND c.owner_id = auth.uid()
    )
);

-- ============================================
-- 9. TRANSFER_MARKET — shared per league
-- ============================================
CREATE TABLE transfer_market (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_data JSONB NOT NULL,  -- full player attributes
    listed_by_club_id UUID REFERENCES clubs(id),  -- NULL = AI/server generated
    price NUMERIC NOT NULL DEFAULT 0,
    signing_bonus NUMERIC NOT NULL DEFAULT 0,
    salary NUMERIC NOT NULL DEFAULT 0,
    min_division INT NOT NULL DEFAULT 8,
    is_free_agent BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'withdrawn')),
    bought_by_club_id UUID REFERENCES clubs(id),
    listed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sold_at TIMESTAMPTZ
);

CREATE INDEX idx_transfer_league ON transfer_market(league_id, status);

ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;

-- Visible to league members
CREATE POLICY "transfer_select" ON transfer_market FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = transfer_market.league_id AND c.owner_id = auth.uid()
    )
);
-- Players can list their own players
CREATE POLICY "transfer_insert" ON transfer_market FOR INSERT WITH CHECK (
    listed_by_club_id IS NULL
    OR EXISTS (
        SELECT 1 FROM clubs c WHERE c.id = transfer_market.listed_by_club_id AND c.owner_id = auth.uid()
    )
);
-- Buy is handled via RPC function (service role)

-- ============================================
-- 10. LEAGUE_FEED — activity feed
-- ============================================
CREATE TABLE league_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- 'transfer', 'result', 'promotion', 'chat', 'join', 'season_end'
    club_id UUID REFERENCES clubs(id),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feed_league ON league_feed(league_id, created_at DESC);

ALTER TABLE league_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_select" ON league_feed FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = league_feed.league_id AND c.owner_id = auth.uid()
    )
);
-- Insert allowed for league members (for chat) or service role
CREATE POLICY "feed_insert" ON league_feed FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM clubs c WHERE c.league_id = league_feed.league_id AND c.owner_id = auth.uid()
    )
);

-- ============================================
-- HELPER: updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RPC: execute_transfer (atomic buy)
-- ============================================
CREATE OR REPLACE FUNCTION execute_transfer(
    p_listing_id UUID,
    p_buyer_club_id UUID,
    p_buyer_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_listing transfer_market%ROWTYPE;
    v_club clubs%ROWTYPE;
    v_total_cost NUMERIC;
    v_new_player_id UUID;
BEGIN
    -- Lock the listing row
    SELECT * INTO v_listing
    FROM transfer_market
    WHERE id = p_listing_id AND status = 'available'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Speler is al verkocht of niet beschikbaar');
    END IF;

    -- Check buyer club ownership
    SELECT * INTO v_club
    FROM clubs
    WHERE id = p_buyer_club_id AND owner_id = p_buyer_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Club niet gevonden');
    END IF;

    -- Calculate total cost
    v_total_cost := v_listing.price + v_listing.signing_bonus;

    -- Check budget
    IF v_club.budget < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Niet genoeg budget');
    END IF;

    -- Deduct budget
    UPDATE clubs SET budget = budget - v_total_cost WHERE id = p_buyer_club_id;

    -- If listed by another club, credit their budget
    IF v_listing.listed_by_club_id IS NOT NULL THEN
        UPDATE clubs SET budget = budget + v_listing.price WHERE id = v_listing.listed_by_club_id;
    END IF;

    -- Create player record for buyer
    INSERT INTO players (
        club_id, league_id, name, age, position, nationality, overall, potential,
        attributes, personality, tag, salary
    )
    SELECT
        p_buyer_club_id,
        v_listing.league_id,
        v_listing.player_name,
        (v_listing.player_data->>'age')::INT,
        v_listing.player_data->>'position',
        COALESCE(v_listing.player_data->>'nationality', 'nl'),
        (v_listing.player_data->>'overall')::INT,
        (v_listing.player_data->>'potential')::INT,
        COALESCE(v_listing.player_data->'attributes', '{}'),
        v_listing.player_data->>'personality',
        v_listing.player_data->>'tag',
        v_listing.salary
    RETURNING id INTO v_new_player_id;

    -- Mark listing as sold
    UPDATE transfer_market
    SET status = 'sold', bought_by_club_id = p_buyer_club_id, sold_at = now()
    WHERE id = p_listing_id;

    -- Add to league feed
    INSERT INTO league_feed (league_id, type, club_id, data)
    VALUES (
        v_listing.league_id,
        'transfer',
        p_buyer_club_id,
        jsonb_build_object(
            'player_name', v_listing.player_name,
            'price', v_total_cost,
            'from_club_id', v_listing.listed_by_club_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'player_id', v_new_player_id,
        'total_cost', v_total_cost
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: generate_invite_code
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := upper(substr(md5(random()::text), 1, 6));
        SELECT EXISTS(SELECT 1 FROM leagues WHERE invite_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Enable realtime for key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE standings;
ALTER PUBLICATION supabase_realtime ADD TABLE match_results;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_market;
ALTER PUBLICATION supabase_realtime ADD TABLE league_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE clubs;
