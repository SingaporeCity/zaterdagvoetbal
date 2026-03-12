/**
 * ZATERDAGVOETBAL - Storage Module
 * Dual-mode: localStorage (singleplayer) or Supabase (multiplayer)
 */

import { supabase, isSupabaseAvailable } from './supabase.js';
import { getGameState } from './state.js';
import { NATIONALITIES } from './constants.js';

const SAVE_KEY = 'zaterdagvoetbal_save';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
let autoSaveTimer = null;
let savingInProgress = false;
let pendingSave = false; // Re-save after current save completes
let beforeUnloadRegistered = false;

// Current storage mode
let storageMode = 'local'; // 'local' | 'multiplayer'
let currentLeagueId = null;
let currentClubId = null;

/**
 * Set storage mode
 */
export function setStorageMode(mode, leagueId = null, clubId = null) {
    // Stop existing auto-save before switching to prevent writes to wrong club
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
    pendingSave = false; // Discard queued save for the old club
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
        client_state: {
            hiredStaff: gameState.hiredStaff || { trainers: [], medisch: [] },
            staffHiredAt: gameState.staffHiredAt || {},
            myPlayer: gameState.myPlayer || null,
            matchHistory: gameState.matchHistory || [],
            lastMatch: gameState.lastMatch || null,
            scoutTips: gameState.scoutTips || [],
            scoutHistory: gameState.scoutHistory || [],
            scoutTipClaimed: gameState.scoutTipClaimed || false,
            scoutMission: gameState.scoutMission || null,
            sponsorSlots: gameState.sponsorSlots || { bord: null },
            stadiumSponsor: gameState.stadiumSponsor || null,
            youthPlayers: gameState.youthPlayers || [],
            formationDrives: gameState.formationDrives || {},
            nextMatchBonus: gameState.nextMatchBonus || 0,
            fans: gameState.club?.fans || 50,
            activeEvent: gameState.activeEvent || null,
            sponsorMarket: gameState.sponsorMarket || { offers: [], generatedForWeek: 0 },
            clubStats: gameState.club?.stats || { founded: 1, titles: 0, highestDivision: 8, totalGoals: 0, totalMatches: 0 },
            extraSponsors: gameState.extraSponsors || [],
            myPlayerLineupPos: gameState.lineup
                ? gameState.lineup.findIndex(p => p && (p.id === 'myplayer' || p.isMyPlayer))
                : -1,
        },
        updated_at: new Date().toISOString()
    };
}

/**
 * Transform Supabase club record + players to gameState
 */
function clubRecordToGameState(club, players, standings, leagueData) {
    const cs = club.client_state || {};
    return {
        club: {
            name: club.name,
            division: club.division,
            budget: Number(club.budget),
            reputation: club.reputation,
            position: 3,
            fans: cs.fans || 50,
            colors: club.colors || { primary: '#1b5e20', secondary: '#f5f0e1', accent: '#ff9800' },
            settingsChangedThisSeason: false,
            stats: cs.clubStats || (club.stats?.founded ? club.stats : {
                founded: 1, titles: 0, highestDivision: club.division,
                totalGoals: 0, totalMatches: 0
            })
        },
        manager: club.manager || { xp: 0, level: 1 },
        dailyRewards: club.daily_rewards || { lastLogin: null, lastClaimDate: null, streak: 0 },
        achievements: club.achievements || {},
        eventHistory: club.event_history || { events: [], lastEventTime: null },
        stats: club.stats || {},
        seasonHistory: club.season_history || [],
        activeEvent: cs.activeEvent || null,
        lastMatch: cs.lastMatch || null,
        matchHistory: cs.matchHistory || [],
        stadium: club.stadium || {},
        players: players.map(supabasePlayerToLocal),
        youthPlayers: cs.youthPlayers || [],
        lineup: restoreMyPlayerInLineup(buildLineupFromPlayers(players), cs),
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
        scoutMission: cs.scoutMission || { active: false, startTime: null, duration: 3600000, pendingPlayer: null, lastScoutDate: null },
        scoutTips: cs.scoutTips || [],
        scoutHistory: cs.scoutHistory || [],
        scoutTipClaimed: cs.scoutTipClaimed || false,
        finances: club.finances || { history: [] },
        staff: club.staff || { fysio: null, scout: null, dokter: null },
        hiredStaff: cs.hiredStaff || { trainers: [], medisch: [] },
        staffHiredAt: cs.staffHiredAt || {},
        assistantTrainers: club.assistant_trainers || {},
        sponsor: club.sponsor,
        stadiumSponsor: cs.stadiumSponsor || null,
        sponsorSlots: cs.sponsorSlots || { bord: null },
        sponsorMarket: cs.sponsorMarket || { offers: [], generatedForWeek: 0 },
        formationDrives: cs.formationDrives || {},
        nextMatchBonus: cs.nextMatchBonus || 0,
        myPlayer: cs.myPlayer || null,
        scoutingNetwork: club.scouting_network || 'none',
        dailyChecklist: club.daily_checklist || {},
        extraSponsors: cs.extraSponsors || [],
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
export function supabasePlayerToLocal(p) {
    // Convert nationality string to object if needed
    let nat = p.nationality;
    if (typeof nat === 'string') {
        const code = nat.toUpperCase();
        const found = NATIONALITIES.find(n => n.code === code);
        nat = found || { code, flag: '🏳️', name: code };
    }

    return {
        id: p.id,
        name: p.name,
        age: p.age,
        position: p.position,
        nationality: nat,
        overall: p.overall,
        potential: p.potential,
        stars: p.stars ?? p.attributes?._stars ?? 0,
        attributes: p.attributes || {},
        personality: p.personality,
        tag: p.tag,
        salary: Number(p.salary),
        contractWeeks: p.contract_weeks,
        goals: p.goals || 0,
        assists: p.assists || 0,
        morale: p.morale,
        condition: p.condition ?? p.fitness ?? 80,
        energy: p.energy,
        matchesTogether: p.matches_together,
        listedForSale: p.listed_for_sale,
        xp: p.xp || 0,
        fixedMarketValue: 0,
        injuredUntil: p.injured_until || null,
        suspendedUntil: p.suspended_until || null,
        yellowCards: p.yellow_cards || 0,
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
 * Restore myPlayer into lineup from client_state saved position
 */
function restoreMyPlayerInLineup(lineup, cs) {
    const pos = cs.myPlayerLineupPos;
    if (pos >= 0 && pos < 11 && cs.myPlayer && !lineup[pos]) {
        const mp = cs.myPlayer;
        lineup[pos] = {
            id: 'myplayer',
            name: mp.name,
            age: mp.age,
            position: mp.position,
            nationality: mp.nationality,
            overall: mp.overall,
            potential: mp.potential,
            stars: mp.stars || 0,
            attributes: mp.attributes || {},
            personality: mp.personality,
            salary: mp.salary || 0,
            contractWeeks: mp.contractWeeks,
            goals: mp.goals || 0,
            assists: mp.assists || 0,
            morale: mp.morale || 80,
            condition: mp.condition || 80,
            energy: mp.energy || 100,
            xp: mp.xp || 0,
            isMyPlayer: true,
        };
    }
    return lineup;
}

/**
 * Save to Supabase (debounced)
 */
async function saveMultiplayer(gameState) {
    // Capture clubId at start — prevents race if setStorageMode() changes it mid-save
    const clubId = currentClubId;
    if (!isSupabaseAvailable() || !clubId) return false;

    try {
        const clubData = gameStateToClubRecord(gameState);
        let { error } = await supabase
            .from('clubs')
            .update(clubData)
            .eq('id', clubId);

        // If client_state column doesn't exist yet, retry without it
        if (error && error.message?.includes('client_state')) {
            delete clubData.client_state;
            const retry = await supabase
                .from('clubs')
                .update(clubData)
                .eq('id', clubId);
            error = retry.error;
        }

        if (error) throw error;

        // Helper: check if ID is a valid UUID (skip numeric IDs from singleplayer)
        const isUUID = (id) => typeof id === 'string' && id.includes('-');

        // Sync player lineup positions
        if (gameState.lineup) {
            for (let i = 0; i < gameState.lineup.length; i++) {
                const player = gameState.lineup[i];
                if (player?.id && isUUID(player.id)) {
                    await supabase
                        .from('players')
                        .update({ lineup_position: i })
                        .eq('id', player.id);
                }
            }
            // Clear lineup_position for benched players
            const lineupIds = gameState.lineup.filter(p => p && isUUID(p.id)).map(p => p.id);
            if (lineupIds.length > 0) {
                await supabase
                    .from('players')
                    .update({ lineup_position: null })
                    .eq('club_id', clubId)
                    .not('id', 'in', `(${lineupIds.join(',')})`);
            }
        }

        // Sync player stats back to DB
        if (gameState.players?.length > 0) {
            for (const p of gameState.players) {
                if (!p?.id || !isUUID(p.id)) continue;
                await supabase
                    .from('players')
                    .update({
                        morale: p.morale,
                        energy: p.energy,
                        fitness: p.condition ?? p.fitness ?? 80,
                        goals: p.goals || 0,
                        assists: p.assists || 0,
                        salary: p.salary,
                        contract_weeks: p.contractWeeks,
                        xp: p.xp || 0,
                        overall: p.overall,
                        listed_for_sale: p.listedForSale || false,
                        matches_together: p.matchesTogether || 0,
                        attributes: p.attributes || {},
                        stars: p.stars ?? 0,
                        age: p.age,
                        injured_until: p.injuredUntil || null,
                        suspended_until: p.suspendedUntil || null,
                        yellow_cards: p.yellowCards || 0,
                    })
                    .eq('id', p.id);
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
            isAI: s.clubs?.is_ai || false,
            clubId: s.club_id
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
export function saveGame(gs) {
    const gameState = gs || getGameState();
    if (storageMode === 'multiplayer') {
        // Save to localStorage immediately as backup
        saveLocal(gameState);
        // Save to Supabase (with lock; re-queue if save already in progress)
        if (!savingInProgress) {
            savingInProgress = true;
            pendingSave = false;
            saveMultiplayer(gameState).finally(() => {
                savingInProgress = false;
                // If a save was requested while we were saving, do it now
                if (pendingSave) {
                    pendingSave = false;
                    saveGame();
                }
            });
        } else {
            pendingSave = true; // Will re-save after current save completes
        }
        return true;
    }
    return saveLocal(gameState);
}

/**
 * Load game state (routes to localStorage or Supabase)
 */
export async function loadGame() {
    if (storageMode === 'multiplayer') {
        const mpState = await loadMultiplayer();
        if (!mpState) return null;

        // Merge localStorage backup for fields that may not have synced to Supabase.
        // Only merge "safe" fields — ones that are locally generated and never
        // intentionally cleared. For everything else, Supabase is the source of truth.
        // This prevents deleted data (e.g. myPlayer removal) from being resurrected.
        const localBackup = loadLocal();
        if (localBackup?.multiplayer?.clubId === currentClubId) {
            // Stadium: only merge construction status (not entire stadium object)
            if (localBackup.stadium?.construction && !mpState.stadium?.construction) {
                mpState.stadium.construction = localBackup.stadium.construction;
            }
            // Lineup from localStorage if Supabase has none
            const hasLineup = mpState.lineup?.some(p => p !== null);
            const localHasLineup = localBackup.lineup?.some(p => p !== null);
            if (!hasLineup && localHasLineup) {
                mpState.lineup = localBackup.lineup;
            }
            // Only merge these safe fields (locally generated, never intentionally cleared)
            // youthPlayers excluded: can be intentionally cleared when demolishing academy
            const mergeableFields = ['formationDrives', 'scoutTips', 'scoutHistory', 'sponsorMarket'];
            for (const field of mergeableFields) {
                const mpVal = mpState[field];
                const localVal = localBackup[field];
                const mpEmpty = mpVal === null || mpVal === undefined ||
                    (Array.isArray(mpVal) && mpVal.length === 0) ||
                    (typeof mpVal === 'object' && !Array.isArray(mpVal) && mpVal !== null && Object.keys(mpVal).length === 0);
                const localHasData = localVal !== null && localVal !== undefined &&
                    !(Array.isArray(localVal) && localVal.length === 0) &&
                    !(typeof localVal === 'object' && !Array.isArray(localVal) && localVal !== null && Object.keys(localVal).length === 0);
                if (mpEmpty && localHasData) {
                    mpState[field] = localVal;
                }
            }
            // Fans
            if ((!mpState.club?.fans || mpState.club.fans === 50) && localBackup.club?.fans > 50) {
                mpState.club.fans = localBackup.club.fans;
            }
        }

        return mpState;
    }
    return loadLocal();
}

/**
 * Check if a save file exists
 */
export function hasSaveFile() {
    return localStorage.getItem(SAVE_KEY) !== null;
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
export function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    // Use getGameState() to always save the current state (not a stale closure)
    autoSaveTimer = setInterval(() => {
        saveGame();
    }, AUTO_SAVE_INTERVAL);

    // Save on page close (register only once)
    if (!beforeUnloadRegistered) {
        beforeUnloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            const gs = getGameState();
            saveLocal(gs);
            // Note: async saveMultiplayer won't reliably complete in beforeunload
        });
    }

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
 * Force sync to Supabase (marks pending save so it runs after current save completes)
 */
export function forceSyncToSupabase() {
    if (storageMode !== 'multiplayer') return;
    // Route through the same lock as saveGame to prevent concurrent saves
    if (!savingInProgress) {
        savingInProgress = true;
        pendingSave = false;
        saveMultiplayer(getGameState()).finally(() => {
            savingInProgress = false;
            if (pendingSave) {
                pendingSave = false;
                saveGame();
            }
        });
    } else {
        pendingSave = true;
    }
}
