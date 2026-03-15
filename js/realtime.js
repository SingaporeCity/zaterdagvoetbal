/**
 * ZATERDAGVOETBAL - Realtime Module
 * Supabase Realtime subscriptions for match results, standings, transfers, feed
 */

import { supabase, isSupabaseAvailable } from './supabase.js';
import { gameState } from './state.js';

let channels = {};

/**
 * Subscribe to all realtime channels for a league
 */
export function subscribeToLeague(leagueId, callbacks = {}) {
    if (!isSupabaseAvailable() || !leagueId) return;

    unsubscribeAll();

    // Standings changes
    channels.standings = supabase
        .channel(`standings:${leagueId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'standings',
            filter: `league_id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onStandingsChange) {
                callbacks.onStandingsChange(payload);
            }
        })
        .subscribe();

    // Match results
    channels.results = supabase
        .channel(`results:${leagueId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'match_results',
            filter: `league_id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onMatchResult) {
                callbacks.onMatchResult(payload.new);
            }
        })
        .subscribe();

    // Transfer market changes
    channels.transfers = supabase
        .channel(`transfers:${leagueId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'transfer_market',
            filter: `league_id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onTransferChange) {
                callbacks.onTransferChange(payload);
            }
        })
        .subscribe();

    // League feed
    channels.feed = supabase
        .channel(`feed:${leagueId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'league_feed',
            filter: `league_id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onFeedItem) {
                callbacks.onFeedItem(payload.new);
            }
        })
        .subscribe();

    // League status changes (week advancement, season end)
    channels.league = supabase
        .channel(`league:${leagueId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'leagues',
            filter: `id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onLeagueUpdate) {
                callbacks.onLeagueUpdate(payload.new);
            }
        })
        .subscribe();

    // Club changes in the league (for seeing other club updates)
    channels.clubs = supabase
        .channel(`clubs:${leagueId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'clubs',
            filter: `league_id=eq.${leagueId}`
        }, (payload) => {
            if (callbacks.onClubUpdate) {
                callbacks.onClubUpdate(payload.new);
            }
        })
        .subscribe();

    console.log(`Realtime subscribed to league ${leagueId}`);
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll() {
    Object.values(channels).forEach(channel => {
        if (channel) supabase.removeChannel(channel);
    });
    channels = {};
}

/**
 * Fetch current standings from Supabase
 */
export async function fetchStandings(leagueId, season) {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('standings')
        .select('*, clubs(name, is_ai, owner_id)')
        .eq('league_id', leagueId)
        .eq('season', season || gameState.season || 1)
        .order('points', { ascending: false })
        .order('goal_diff', { ascending: false })
        .order('goals_for', { ascending: false });

    if (error) {
        console.error('Failed to fetch standings:', error);
        return [];
    }

    return (data || []).map((s, idx) => ({
        name: s.clubs?.name || 'Onbekend',
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        goalDiff: s.goal_diff,
        points: s.points,
        position: idx + 1,
        isPlayer: s.club_id === gameState.multiplayer?.clubId,
        isAI: s.clubs?.is_ai || false,
        clubId: s.club_id
    }));
}

/**
 * Fetch match results for current week
 */
export async function fetchWeekResults(leagueId, season, week) {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('match_results')
        .select('*, home_club:clubs!match_results_home_club_id_fkey(name), away_club:clubs!match_results_away_club_id_fkey(name)')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week);

    if (error) return [];
    return data || [];
}

/**
 * Fetch the league feed (latest 50 items)
 */
export async function fetchLeagueFeed(leagueId, limit = 50) {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('league_feed')
        .select('*, clubs(name)')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data || [];
}

/**
 * Fetch shared transfer market for league
 */
export async function fetchTransferMarket(leagueId) {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('transfer_market')
        .select('*')
        .eq('league_id', leagueId)
        .eq('status', 'available')
        .order('listed_at', { ascending: false });

    if (error) return [];
    return data || [];
}

/**
 * Get countdown to next match time
 */
export function getMatchCountdown(matchTime = '08:30') {
    const now = new Date();
    const [hours, minutes] = matchTime.split(':').map(Number);

    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If past today's match time, target tomorrow
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return {
        hours: h,
        minutes: m,
        seconds: s,
        formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        totalMs: diff
    };
}

/**
 * Update countdown display
 */
let countdownTimer = null;

export function startCountdown(matchTime = '08:30') {
    if (countdownTimer) clearInterval(countdownTimer);

    const updateDisplay = () => {
        const countdown = getMatchCountdown(matchTime);
        // Update dashboard timer segments
        const hoursEl = document.getElementById('timer-hours');
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        if (hoursEl && minutesEl && secondsEl) {
            hoursEl.textContent = String(countdown.hours).padStart(2, '0');
            minutesEl.textContent = String(countdown.minutes).padStart(2, '0');
            secondsEl.textContent = String(countdown.seconds).padStart(2, '0');
        }
    };

    updateDisplay();
    countdownTimer = setInterval(updateDisplay, 1000);
}

export function stopCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}
