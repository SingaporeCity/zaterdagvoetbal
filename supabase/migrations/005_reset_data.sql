-- Reset all game data (keep tables and policies intact)
-- Run this in SQL Editor to start fresh
TRUNCATE match_results CASCADE;
TRUNCATE schedule CASCADE;
TRUNCATE standings CASCADE;
TRUNCATE league_feed CASCADE;
TRUNCATE transfer_market CASCADE;
TRUNCATE youth_players CASCADE;
TRUNCATE players CASCADE;
TRUNCATE clubs CASCADE;
TRUNCATE leagues CASCADE;
-- Don't truncate profiles — keeps user accounts
