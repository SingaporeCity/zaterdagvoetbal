/**
 * ZATERDAGVOETBAL - Storage Module
 * Dual-mode: localStorage (singleplayer) or Supabase (multiplayer)
 */

import { supabase, isSupabaseAvailable } from './supabase.js';

const SAVE_KEY = 'zaterdagvoetbal_save';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const SYNC_DEBOUNCE = 2000; // 2 seconds debounce for multiplayer sync

let autoSaveTimer = null;
let syncDebounceTimer = null;

// Current storage mode
let storageMode = 'local'; // 'local' | 'multiplayer'
let currentLeagueId = null;
let currentClubId = null;

/**
 * Set storage mode
 */
export function setStorageMode(mode, leagueId = null, clubId = null) {
    storageMode = mode;
    currentLeagueId = leagueId;
    currentClubId = clubId;
    console.log(`Storage mode: ${mode}`, leagueId ? `league=${leagueId}` : '');
}

/**
 * Get current storage mode
 */
export function getStorageMode() {
    return storageMode;
}

/**
 * Check if currently in multiplayer mode
 */
export function isMultiplayer() {
    return storageMode === 'multiplayer';
}

// ============================================
// LOCAL STORAGE FUNCTIONS (unchanged)
// ============================================

function saveLocal(gameState) {
    try {
        const saveData = {
            version: '2.0',
            timestamp: Date.now(),
            state: gameState
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

function loadLocal() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return null;

        const parsed = JSON.parse(saveData);
        console.log('Game loaded from', new Date(parsed.timestamp).toLocaleString('nl-NL'));
        return parsed.state;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

// ============================================
// SUPABASE STORAGE FUNCTIONS (multiplayer)
// ============================================

/**
 * Transform gameState to Supabase club record
 */
function gameStateToClubRecord(gameState) {
    return {
        name: gameState.club.name,
        division: gameState.club.division,
        budget: gameState.club.budget,
        reputation: gameState.club.reputation,
        stadium: gameState.stadium || {},
        staff: gameState.staff || {},
        training: gameState.training || {},
        tactics: gameState.tactics || {},
        formation: gameState.formation || '4-4-2',
        sponsor: gameState.sponsor,
        finances: gameState.finances || { history: [] },
        achievements: gameState.achievements || {},
        season_history: gameState.seasonHistory || [],
        event_history: gameState.eventHistory || { events: [], lastEventTime: null },
        manager: gameState.manager || { xp: 0, level: 1 },
        stats: gameState.stats || {},
        specialists: gameState.specialists || {},
        trainers: gameState.trainers || {},
        assistant_trainers: gameState.assistantTrainers || {},
        colors: gameState.club.colors || {},
        daily_rewards: gameState.dailyRewards || {},
        daily_checklist: gameState.dailyChecklist || {},
        scouting_network: gameState.scoutingNetwork || 'none',
        onboarding_completed: gameState.onboardingCompleted || false,
        updated_at: new Date().toISOString()
    };
}

/**
 * Transform Supabase club record + players to gameState
 */
function clubRecordToGameState(club, players, standings, leagueData) {
    return {
        club: {
            name: club.name,
            division: club.division,
            budget: Number(club.budget),
            reputation: club.reputation,
            position: 3,
            colors: club.colors || { primary: '#1b5e20', secondary: '#f5f0e1', accent: '#ff9800' },
            settingsChangedThisSeason: false,
            stats: club.stats?.founded ? club.stats : {
                founded: 1, titles: 0, highestDivision: club.division,
                totalGoals: 0, totalMatches: 0, ...club.stats
            }
        },
        manager: club.manager || { xp: 0, level: 1 },
        dailyRewards: club.daily_rewards || { lastLogin: null, lastClaimDate: null, streak: 0 },
        achievements: club.achievements || {},
        eventHistory: club.event_history || { events: [], lastEventTime: null },
        stats: club.stats || {},
        seasonHistory: club.season_history || [],
        activeEvent: null,
        lastMatch: null,
        matchHistory: [],
        stadium: club.stadium || {},
        players: players.map(supabasePlayerToLocal),
        youthPlayers: [], // loaded separately
        lineup: buildLineupFromPlayers(players),
        formation: club.formation || '4-4-2',
        tactics: club.tactics || { mentaliteit: 'normaal', offensief: 'gebalanceerd', speltempo: 'normaal', veldbreedte: 'gebalanceerd', dekking: 'zone' },
        specialists: club.specialists || { cornerTaker: null, penaltyTaker: null, freekickTaker: null, captain: null },
        transferMarket: { players: [], lastRefresh: null }, // loaded from shared market
        trainers: club.trainers || { attack: 1, midfield: 1, defense: 1, goalkeeper: 1, fitness: 1 },
        training: club.training || {},
        season: leagueData?.season || 1,
        week: leagueData?.week || 1,
        nextMatch: { opponent: 'TBD', time: Date.now() },
        standings: standings || [],
        scoutSearch: { minAge: 16, maxAge: 35, position: 'all', results: [] },
        scoutMission: { active: false, startTime: null, duration: 3600000, pendingPlayer: null, lastScoutDate: null },
        finances: club.finances || { history: [] },
        staff: club.staff || { fysio: null, scout: null, dokter: null },
        assistantTrainers: club.assistant_trainers || {},
        sponsor: club.sponsor,
        stadiumSponsor: null,
        sponsorSlots: { bord: null },
        sponsorMarket: { offers: [], generatedForWeek: 0 },
        scoutingNetwork: club.scouting_network || 'none',
        dailyChecklist: club.daily_checklist || {},
        onboardingCompleted: club.onboarding_completed || false,
        multiplayer: {
            enabled: true,
            leagueId: currentLeagueId,
            clubId: currentClubId,
            userId: null,
            isHost: false,
            leagueName: leagueData?.name || '',
            inviteCode: leagueData?.invite_code || ''
        }
    };
}

/**
 * Convert Supabase player record to local format
 */
function supabasePlayerToLocal(p) {
    return {
        id: p.id,
        name: p.name,
        age: p.age,
        position: p.position,
        nationality: p.nationality,
        overall: p.overall,
        potential: p.potential,
        attributes: p.attributes || {},
        personality: p.personality,
        tag: p.tag,
        salary: Number(p.salary),
        contractWeeks: p.contract_weeks,
        goals: p.goals,
        assists: p.assists,
        morale: p.morale,
        fitness: p.fitness,
        energy: p.energy,
        matchesTogether: p.matches_together,
        listedForSale: p.listed_for_sale,
        xp: p.xp || 0
    };
}

/**
 * Build lineup array from players with lineup_position set
 */
function buildLineupFromPlayers(players) {
    const lineup = new Array(11).fill(null);
    players.forEach(p => {
        if (p.lineup_position !== null && p.lineup_position >= 0 && p.lineup_position < 11) {
            lineup[p.lineup_position] = supabasePlayerToLocal(p);
        }
    });
    return lineup;
}

/**
 * Save to Supabase (debounced)
 */
async function saveMultiplayer(gameState) {
    if (!isSupabaseAvailable() || !currentClubId) return false;

    try {
        const clubData = gameStateToClubRecord(gameState);
        const { error } = await supabase
            .from('clubs')
            .update(clubData)
            .eq('id', currentClubId);

        if (error) throw error;

        // Also sync player lineup positions
        if (gameState.lineup) {
            for (let i = 0; i < gameState.lineup.length; i++) {
                const player = gameState.lineup[i];
                if (player?.id) {
                    await supabase
                        .from('players')
                        .update({ lineup_position: i })
                        .eq('id', player.id);
                }
            }
            // Clear lineup_position for benched players
            const lineupIds = gameState.lineup.filter(p => p).map(p => p.id);
            if (lineupIds.length > 0) {
                await supabase
                    .from('players')
                    .update({ lineup_position: null })
                    .eq('club_id', currentClubId)
                    .not('id', 'in', `(${lineupIds.join(',')})`);
            }
        }

        return true;
    } catch (error) {
        console.error('Failed to save to Supabase:', error);
        return false;
    }
}

/**
 * Load from Supabase
 */
async function loadMultiplayer() {
    if (!isSupabaseAvailable() || !currentLeagueId || !currentClubId) return null;

    try {
        // Load club, players, standings, league in parallel
        const [clubRes, playersRes, standingsRes, leagueRes] = await Promise.all([
            supabase.from('clubs').select('*').eq('id', currentClubId).single(),
            supabase.from('players').select('*').eq('club_id', currentClubId),
            supabase.from('standings').select('*, clubs(name, is_ai, owner_id)').eq('league_id', currentLeagueId).order('points', { ascending: false }),
            supabase.from('leagues').select('*').eq('id', currentLeagueId).single()
        ]);

        if (clubRes.error) throw clubRes.error;

        const club = clubRes.data;
        const players = playersRes.data || [];
        const rawStandings = standingsRes.data || [];
        const league = leagueRes.data;

        // Transform standings to local format
        const standings = rawStandings.map((s, idx) => ({
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
            isPlayer: s.club_id === currentClubId,
            isAI: s.clubs?.is_ai || false
        }));

        return clubRecordToGameState(club, players, standings, league);
    } catch (error) {
        console.error('Failed to load from Supabase:', error);
        return null;
    }
}

// ============================================
// PUBLIC API (dual-mode)
// ============================================

/**
 * Save game state (routes to localStorage or Supabase)
 */
export function saveGame(gameState) {
    if (storageMode === 'multiplayer') {
        // Debounced save to Supabase
        if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
        syncDebounceTimer = setTimeout(() => {
            saveMultiplayer(gameState);
        }, SYNC_DEBOUNCE);
        // Also save locally as backup
        saveLocal(gameState);
        return true;
    }
    return saveLocal(gameState);
}

/**
 * Load game state (routes to localStorage or Supabase)
 */
export async function loadGame() {
    if (storageMode === 'multiplayer') {
        return await loadMultiplayer();
    }
    return loadLocal();
}

/**
 * Synchronous load for singleplayer (backwards compatible)
 */
export function loadGameSync() {
    return loadLocal();
}

/**
 * Check if a save file exists
 */
export function hasSaveFile() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete the save file
 */
export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}

/**
 * Get save file info without loading full state
 */
export function getSaveInfo() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return null;

        const parsed = JSON.parse(saveData);
        return {
            version: parsed.version,
            timestamp: parsed.timestamp,
            clubName: parsed.state?.club?.name || 'Onbekend',
            division: parsed.state?.club?.division || 8,
            season: parsed.state?.season || 1,
            week: parsed.state?.week || 1
        };
    } catch (error) {
        return null;
    }
}

/**
 * Start auto-save timer
 */
export function startAutoSave(gameState) {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
        saveGame(gameState);
    }, AUTO_SAVE_INTERVAL);

    // Save on page close
    window.addEventListener('beforeunload', () => {
        // Force immediate save (no debounce) on page close
        if (storageMode === 'multiplayer') {
            saveMultiplayer(gameState);
        }
        saveLocal(gameState);
    });

    console.log('Auto-save enabled (every 30 seconds)');
}

/**
 * Stop auto-save timer
 */
export function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

/**
 * Calculate offline progress
 */
export function calculateOfflineProgress(gameState) {
    const lastSave = getSaveInfo();
    if (!lastSave) return null;

    const now = Date.now();
    const elapsed = now - lastSave.timestamp;
    const hoursAway = Math.floor(elapsed / (1000 * 60 * 60));

    if (hoursAway < 1) return null;

    const progress = {
        hoursAway,
        trainingSessions: 0,
        scoutMissionsCompleted: 0,
        injuriesHealed: [],
        energyRecovered: 0,
        matchesReady: false
    };

    // Check if training completed
    if (gameState.training?.slots) {
        const trainingDuration = gameState.training.sessionDuration || (6 * 60 * 60 * 1000);
        for (const [slot, data] of Object.entries(gameState.training.slots)) {
            if (data.playerId && data.startTime) {
                const trainingElapsed = now - data.startTime;
                if (trainingElapsed >= trainingDuration) {
                    progress.trainingSessions++;
                }
            }
        }
    }

    // Check if scout mission completed
    if (gameState.scoutMission?.active && gameState.scoutMission?.startTime) {
        const scoutElapsed = now - gameState.scoutMission.startTime;
        if (scoutElapsed >= gameState.scoutMission.duration) {
            progress.scoutMissionsCompleted = 1;
        }
    }

    // Energy recovery
    progress.energyRecovered = Math.min(hoursAway * 5, 30);

    // Check if match is ready
    if (gameState.nextMatch?.time && now >= gameState.nextMatch.time) {
        progress.matchesReady = true;
    }

    return progress;
}

/**
 * Apply offline progress to game state
 */
export function applyOfflineProgress(gameState, progress) {
    if (!progress) return;

    if (progress.energyRecovered > 0) {
        gameState.players.forEach(player => {
            player.energy = Math.min(100, (player.energy || 70) + progress.energyRecovered);
            player.fitness = Math.min(100, (player.fitness || 80) + Math.floor(progress.energyRecovered / 2));
        });
    }
}

/**
 * Export save as downloadable file
 */
export function exportSave(gameState) {
    const saveData = {
        version: '2.0',
        timestamp: Date.now(),
        state: gameState
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `zaterdagvoetbal_${gameState.club.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Import save from file
 */
export function importSave(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                if (saveData.state && saveData.version) {
                    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
                    resolve(saveData.state);
                } else {
                    reject(new Error('Invalid save file format'));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Force sync to Supabase (immediate, no debounce)
 */
export async function forceSyncToSupabase(gameState) {
    if (storageMode !== 'multiplayer') return;
    return await saveMultiplayer(gameState);
}
