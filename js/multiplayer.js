/**
 * ZATERDAGVOETBAL - Multiplayer Module
 * League lobby: create, join, start, state management
 */

import { supabase, isSupabaseAvailable } from './supabase.js';
import { getSession, getUser, signIn, signUp, signOut, onAuthStateChange, getProfile } from './auth.js';
import { setStorageMode } from './storage.js';
import { gameState, replaceGameState } from './state.js';

// AI team name pools per division
const AI_TEAM_NAMES = [
    'Vv De Meeuwen', 'SC Concordia', 'FC Voorwaarts', 'SV Oranje',
    'VV Eendracht', 'SC Victoria', 'FC De Toekomst', 'SV Sparta',
    'VV Olympia', 'SC Hercules', 'FC Amicitia', 'SV Fortuna',
    'VV De Adelaars', 'SC Minerva', 'FC Ons Dorp', 'SV De Sterren'
];

/**
 * Initialize multiplayer UI event listeners
 */
export function initMultiplayerUI(onStartGame) {
    // Auth form toggles
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('auth-login-form').style.display = 'none';
        document.getElementById('auth-signup-form').style.display = 'block';
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('auth-signup-form').style.display = 'none';
        document.getElementById('auth-login-form').style.display = 'block';
    });

    // Login
    document.getElementById('login-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        if (!email || !password) {
            errorEl.textContent = 'Vul alle velden in.';
            return;
        }

        try {
            await signIn(email, password);
            showModeScreen();
        } catch (err) {
            errorEl.textContent = err.message === 'Invalid login credentials'
                ? 'Onjuist e-mail of wachtwoord.'
                : err.message;
        }
    });

    // Signup
    document.getElementById('signup-btn')?.addEventListener('click', async () => {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');
        errorEl.textContent = '';

        if (!name || !email || !password) {
            errorEl.textContent = 'Vul alle velden in.';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Wachtwoord moet minimaal 6 tekens zijn.';
            return;
        }

        try {
            await signUp(email, password, name);
            showModeScreen();
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    // Mode selection
    document.getElementById('mode-singleplayer')?.addEventListener('click', () => {
        hideAllOverlays();
        setStorageMode('local');
        onStartGame('local');
    });

    document.getElementById('mode-multiplayer')?.addEventListener('click', () => {
        showLobbyScreen();
    });

    document.getElementById('mode-logout')?.addEventListener('click', async () => {
        await signOut();
        showAuthScreen();
    });

    // Lobby
    document.getElementById('lobby-back')?.addEventListener('click', () => {
        showModeScreen();
    });

    document.getElementById('lobby-create-btn')?.addEventListener('click', async () => {
        await createLeague();
    });

    document.getElementById('lobby-join-btn')?.addEventListener('click', async () => {
        const code = document.getElementById('lobby-join-code').value.trim().toUpperCase();
        if (code.length !== 6) {
            document.getElementById('lobby-error').textContent = 'Voer een geldige 6-teken code in.';
            return;
        }
        await joinLeague(code);
    });

    // Waiting room
    document.getElementById('waiting-back')?.addEventListener('click', () => {
        showLobbyScreen();
    });

    document.getElementById('waiting-copy-code')?.addEventListener('click', () => {
        const code = document.getElementById('waiting-invite-code').textContent;
        navigator.clipboard.writeText(code);
    });

    document.getElementById('waiting-start-btn')?.addEventListener('click', async () => {
        await startLeague(onStartGame);
    });

    // Enter key on login/signup forms
    document.getElementById('login-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('login-btn')?.click();
    });
    document.getElementById('signup-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('signup-btn')?.click();
    });
    document.getElementById('lobby-join-code')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('lobby-join-btn')?.click();
    });
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function hideAllOverlays() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('mode-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'none';
}

function showAuthScreen() {
    hideAllOverlays();
    document.getElementById('auth-screen').style.display = 'flex';
}

async function showModeScreen() {
    hideAllOverlays();
    const user = await getUser();
    if (!user) {
        showAuthScreen();
        return;
    }

    const profile = await getProfile(user.id);
    const name = profile?.display_name || user.user_metadata?.display_name || 'Manager';
    document.getElementById('mode-welcome-msg').textContent = `Welkom, ${name}!`;
    document.getElementById('mode-screen').style.display = 'flex';
}

async function showLobbyScreen() {
    hideAllOverlays();
    document.getElementById('lobby-screen').style.display = 'flex';
    document.getElementById('lobby-error').textContent = '';

    // Load user's existing leagues
    await loadMyLeagues();
}

function showWaitingScreen(league) {
    hideAllOverlays();
    document.getElementById('waiting-screen').style.display = 'flex';
    document.getElementById('waiting-league-name').textContent = league.name;
    document.getElementById('waiting-invite-code').textContent = league.invite_code;
}

// ============================================
// LEAGUE OPERATIONS
// ============================================

/**
 * Create a new league
 */
async function createLeague() {
    const errorEl = document.getElementById('lobby-error');
    errorEl.textContent = '';

    try {
        const user = await getUser();
        if (!user) throw new Error('Niet ingelogd');

        // Generate invite code via RPC
        const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
        if (codeError) throw codeError;

        // Create league
        const { data: league, error: leagueError } = await supabase
            .from('leagues')
            .insert({
                name: `Competitie ${inviteCode}`,
                invite_code: inviteCode,
                created_by: user.id,
                status: 'lobby'
            })
            .select()
            .single();

        if (leagueError) throw leagueError;

        // Create club for the creator
        const { data: club, error: clubError } = await supabase
            .from('clubs')
            .insert({
                league_id: league.id,
                owner_id: user.id,
                name: 'FC Nieuw Team',
                is_ai: false,
                division: league.division
            })
            .select()
            .single();

        if (clubError) throw clubError;

        // Show waiting room
        showWaitingScreen(league);
        await refreshWaitingRoom(league.id, user.id);

        // Subscribe to lobby changes
        subscribeToLobby(league.id, user.id);

    } catch (err) {
        errorEl.textContent = err.message;
    }
}

/**
 * Join an existing league by invite code
 */
async function joinLeague(code) {
    const errorEl = document.getElementById('lobby-error');
    errorEl.textContent = '';

    try {
        const user = await getUser();
        if (!user) throw new Error('Niet ingelogd');

        // Find league by code
        const { data: league, error: findError } = await supabase
            .from('leagues')
            .select('*')
            .eq('invite_code', code)
            .eq('status', 'lobby')
            .single();

        if (findError || !league) {
            errorEl.textContent = 'Competitie niet gevonden of al gestart.';
            return;
        }

        // Check if already joined
        const { data: existingClub } = await supabase
            .from('clubs')
            .select('id')
            .eq('league_id', league.id)
            .eq('owner_id', user.id)
            .single();

        if (existingClub) {
            // Already in this league, go to waiting room
            showWaitingScreen(league);
            await refreshWaitingRoom(league.id, user.id);
            subscribeToLobby(league.id, user.id);
            return;
        }

        // Check player count
        const { count } = await supabase
            .from('clubs')
            .select('id', { count: 'exact', head: true })
            .eq('league_id', league.id)
            .eq('is_ai', false);

        if (count >= league.max_players) {
            errorEl.textContent = 'Deze competitie zit vol.';
            return;
        }

        // Create club
        const { error: clubError } = await supabase
            .from('clubs')
            .insert({
                league_id: league.id,
                owner_id: user.id,
                name: 'FC Nieuw Team',
                is_ai: false,
                division: league.division
            });

        if (clubError) throw clubError;

        // Add to feed
        await supabase.from('league_feed').insert({
            league_id: league.id,
            type: 'join',
            data: { user_name: user.user_metadata?.display_name || 'Manager' }
        });

        showWaitingScreen(league);
        await refreshWaitingRoom(league.id, user.id);
        subscribeToLobby(league.id, user.id);

    } catch (err) {
        errorEl.textContent = err.message;
    }
}

/**
 * Load user's leagues for the lobby list
 */
async function loadMyLeagues() {
    const listEl = document.getElementById('lobby-leagues-list');
    if (!listEl) return;

    const user = await getUser();
    if (!user) return;

    const { data: clubs } = await supabase
        .from('clubs')
        .select('id, name, league_id, leagues(id, name, invite_code, status, week, season)')
        .eq('owner_id', user.id)
        .eq('is_ai', false);

    if (!clubs || clubs.length === 0) {
        listEl.innerHTML = '<p class="mp-empty">Nog geen competities</p>';
        return;
    }

    listEl.innerHTML = clubs.map(c => {
        const league = c.leagues;
        if (!league) return '';
        const statusLabel = league.status === 'lobby' ? 'Lobby' : league.status === 'active' ? `Seizoen ${league.season} • Week ${league.week}` : 'Afgelopen';
        return `
            <div class="mp-league-item" data-league-id="${league.id}" data-club-id="${c.id}">
                <div class="mp-league-item-info">
                    <strong>${league.name}</strong>
                    <span class="mp-league-status mp-status-${league.status}">${statusLabel}</span>
                </div>
                <button class="mp-btn mp-btn-small mp-league-enter">
                    ${league.status === 'lobby' ? 'Lobby' : league.status === 'active' ? 'Spelen' : 'Bekijken'}
                </button>
            </div>
        `;
    }).join('');

    // Click handlers
    listEl.querySelectorAll('.mp-league-enter').forEach(btn => {
        btn.addEventListener('click', async () => {
            const item = btn.closest('.mp-league-item');
            const leagueId = item.dataset.leagueId;
            const clubId = item.dataset.clubId;
            await enterLeague(leagueId, clubId);
        });
    });
}

/**
 * Enter an existing league
 */
async function enterLeague(leagueId, clubId) {
    const { data: league } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

    if (!league) return;

    const user = await getUser();
    if (!user) return;

    if (league.status === 'lobby') {
        showWaitingScreen(league);
        await refreshWaitingRoom(leagueId, user.id);
        subscribeToLobby(leagueId, user.id);
    } else if (league.status === 'active') {
        // Enter the game in multiplayer mode
        setStorageMode('multiplayer', leagueId, clubId);
        hideAllOverlays();

        // The onStartGame callback in app.js will handle loading
        gameState.multiplayer.enabled = true;
        gameState.multiplayer.leagueId = leagueId;
        gameState.multiplayer.clubId = clubId;
        gameState.multiplayer.userId = user.id;
        gameState.multiplayer.leagueName = league.name;
        gameState.multiplayer.inviteCode = league.invite_code;
        gameState.multiplayer.isHost = league.created_by === user.id;

        // Dispatch custom event for app.js to handle
        window.dispatchEvent(new CustomEvent('multiplayer-start', {
            detail: { leagueId, clubId, userId: user.id, league }
        }));
    }
}

/**
 * Refresh the waiting room with current players
 */
async function refreshWaitingRoom(leagueId, userId) {
    const { data: clubs } = await supabase
        .from('clubs')
        .select('id, name, owner_id, is_ai, profiles(display_name)')
        .eq('league_id', leagueId)
        .eq('is_ai', false)
        .order('created_at');

    const { data: league } = await supabase
        .from('leagues')
        .select('created_by')
        .eq('id', leagueId)
        .single();

    const playersEl = document.getElementById('waiting-players');
    const countEl = document.getElementById('waiting-count');
    const startBtn = document.getElementById('waiting-start-btn');
    const startInfo = document.getElementById('waiting-start-info');
    const clubNameInput = document.getElementById('waiting-club-name');

    if (clubs) {
        countEl.textContent = clubs.length;
        playersEl.innerHTML = clubs.map(c => {
            const name = c.profiles?.display_name || 'Manager';
            const isHost = c.owner_id === league?.created_by;
            const isYou = c.owner_id === userId;
            return `
                <div class="mp-player-slot ${isYou ? 'mp-you' : ''}">
                    <span class="mp-player-name">${name}${isHost ? ' (Host)' : ''}${isYou ? ' (Jij)' : ''}</span>
                    <span class="mp-club-name">${c.name}</span>
                </div>
            `;
        }).join('');

        // Fill remaining slots with empty
        for (let i = clubs.length; i < 8; i++) {
            playersEl.innerHTML += `
                <div class="mp-player-slot mp-empty-slot">
                    <span class="mp-player-name">Open plek</span>
                    <span class="mp-club-name">AI-team</span>
                </div>
            `;
        }

        // Set club name input to current value
        const myClub = clubs.find(c => c.owner_id === userId);
        if (myClub && clubNameInput) {
            clubNameInput.value = myClub.name;
            // Debounced rename
            clubNameInput.onchange = async () => {
                const newName = clubNameInput.value.trim();
                if (newName && newName !== myClub.name) {
                    await supabase.from('clubs').update({ name: newName }).eq('id', myClub.id);
                }
            };
        }
    }

    // Show start button only for host and if >= 2 human players
    const isHost = league?.created_by === userId;
    if (startBtn && startInfo) {
        if (isHost && clubs && clubs.length >= 2) {
            startBtn.style.display = 'block';
            startInfo.style.display = 'none';
        } else if (isHost) {
            startBtn.style.display = 'none';
            startInfo.textContent = 'Wacht op meer spelers (min. 2)...';
            startInfo.style.display = 'block';
        } else {
            startBtn.style.display = 'none';
            startInfo.textContent = 'Wacht tot de host de competitie start...';
            startInfo.style.display = 'block';
        }
    }
}

/**
 * Subscribe to lobby changes (realtime)
 */
let lobbySubscription = null;

function subscribeToLobby(leagueId, userId) {
    if (lobbySubscription) {
        supabase.removeChannel(lobbySubscription);
    }

    lobbySubscription = supabase
        .channel(`lobby:${leagueId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'clubs',
            filter: `league_id=eq.${leagueId}`
        }, () => {
            refreshWaitingRoom(leagueId, userId);
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'leagues',
            filter: `id=eq.${leagueId}`
        }, async (payload) => {
            // If league started, transition to game
            if (payload.new.status === 'active') {
                const { data: myClub } = await supabase
                    .from('clubs')
                    .select('id')
                    .eq('league_id', leagueId)
                    .eq('owner_id', userId)
                    .single();

                if (myClub) {
                    await enterLeague(leagueId, myClub.id);
                }
            }
        })
        .subscribe();
}

/**
 * Start the league (host only)
 * Generates AI teams, players, schedule, standings
 */
async function startLeague(onStartGame) {
    const user = await getUser();
    if (!user) return;

    // Find the league the user is hosting
    const { data: myClub } = await supabase
        .from('clubs')
        .select('league_id')
        .eq('owner_id', user.id)
        .eq('is_ai', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!myClub) return;

    const leagueId = myClub.league_id;

    // Get all human clubs
    const { data: humanClubs } = await supabase
        .from('clubs')
        .select('id, name, owner_id')
        .eq('league_id', leagueId)
        .eq('is_ai', false);

    if (!humanClubs || humanClubs.length < 2) return;

    const aiNeeded = 8 - humanClubs.length;

    // Create AI teams
    const shuffledNames = [...AI_TEAM_NAMES].sort(() => Math.random() - 0.5);
    const usedNames = humanClubs.map(c => c.name);
    const aiNames = shuffledNames.filter(n => !usedNames.includes(n)).slice(0, aiNeeded);

    const aiClubs = [];
    for (const name of aiNames) {
        const { data: aiClub } = await supabase
            .from('clubs')
            .insert({
                league_id: leagueId,
                owner_id: null,
                name,
                is_ai: true,
                division: 8
            })
            .select()
            .single();

        if (aiClub) aiClubs.push(aiClub);
    }

    const allClubs = [...humanClubs, ...aiClubs];

    // Generate players for all clubs (AI gets full squads, humans get initial squads)
    for (const club of allClubs) {
        await generatePlayersForClub(club.id, leagueId, 8);
    }

    // Create standings for all clubs
    for (const club of allClubs) {
        await supabase.from('standings').insert({
            league_id: leagueId,
            season: 1,
            club_id: club.id,
            position: allClubs.indexOf(club) + 1
        });
    }

    // Generate round-robin schedule
    await generateSchedule(leagueId, 1, allClubs.map(c => c.id));

    // Update league status to active
    await supabase
        .from('leagues')
        .update({ status: 'active', week: 1, season: 1 })
        .eq('id', leagueId);

    // Feed entry
    await supabase.from('league_feed').insert({
        league_id: leagueId,
        type: 'season_start',
        data: { season: 1, teams: allClubs.length }
    });

    // Enter the game
    await enterLeague(leagueId, myClub.league_id ? (await supabase.from('clubs').select('id').eq('league_id', leagueId).eq('owner_id', user.id).single()).data?.id : null);
}

/**
 * Generate initial players for a club
 */
async function generatePlayersForClub(clubId, leagueId, division) {
    const positions = [
        'keeper', 'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback',
        'linksMid', 'centraleMid', 'rechtsMid',
        'linksbuiten', 'spits', 'rechtsbuiten',
        // Bench
        'keeper', 'centraleVerdediger', 'centraleMid', 'spits', 'linksMid'
    ];

    const firstNames = ['Jan', 'Kees', 'Pieter', 'Henk', 'Willem', 'Jaap', 'Sander', 'Erik', 'Bas', 'Tom', 'Mark', 'Joost', 'Frank', 'Daan', 'Lars', 'Bram'];
    const lastNames = ['de Jong', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Janssen', 'van den Berg', 'Vermeer'];

    const divStrength = {
        8: { min: 20, max: 40 }, 7: { min: 30, max: 50 }, 6: { min: 40, max: 58 },
        5: { min: 48, max: 65 }, 4: { min: 55, max: 72 }, 3: { min: 63, max: 78 },
        2: { min: 70, max: 85 }, 1: { min: 78, max: 90 }, 0: { min: 85, max: 95 }
    };

    const str = divStrength[division] || divStrength[8];

    const players = positions.map((pos, idx) => {
        const overall = str.min + Math.floor(Math.random() * (str.max - str.min));
        const age = 17 + Math.floor(Math.random() * 18);
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return {
            club_id: clubId,
            league_id: leagueId,
            name: `${firstName} ${lastName}`,
            age,
            position: pos,
            nationality: 'nl',
            overall,
            potential: Math.min(99, overall + Math.floor(Math.random() * 20)),
            attributes: generateAttributes(overall, pos),
            morale: 60 + Math.floor(Math.random() * 30),
            fitness: 70 + Math.floor(Math.random() * 25),
            energy: 70 + Math.floor(Math.random() * 25),
            salary: division >= 7 ? 0 : Math.round(overall * (10 + Math.random() * 20)),
            lineup_position: idx < 11 ? idx : null
        };
    });

    await supabase.from('players').insert(players);
}

/**
 * Generate player attributes based on overall and position
 */
function generateAttributes(overall, position) {
    const variance = 8;
    const attrs = {};
    const keys = ['AAN', 'VER', 'TEC', 'SNE', 'FYS'];

    // Position weights
    const weights = {
        keeper: { AAN: 0.3, VER: 0.8, TEC: 0.5, SNE: 0.4, FYS: 0.7 },
        linksback: { AAN: 0.5, VER: 0.8, TEC: 0.5, SNE: 0.7, FYS: 0.7 },
        centraleVerdediger: { AAN: 0.3, VER: 0.9, TEC: 0.4, SNE: 0.4, FYS: 0.8 },
        rechtsback: { AAN: 0.5, VER: 0.8, TEC: 0.5, SNE: 0.7, FYS: 0.7 },
        linksMid: { AAN: 0.6, VER: 0.5, TEC: 0.8, SNE: 0.7, FYS: 0.6 },
        centraleMid: { AAN: 0.5, VER: 0.6, TEC: 0.8, SNE: 0.5, FYS: 0.7 },
        rechtsMid: { AAN: 0.6, VER: 0.5, TEC: 0.8, SNE: 0.7, FYS: 0.6 },
        linksbuiten: { AAN: 0.8, VER: 0.3, TEC: 0.7, SNE: 0.9, FYS: 0.5 },
        rechtsbuiten: { AAN: 0.8, VER: 0.3, TEC: 0.7, SNE: 0.9, FYS: 0.5 },
        spits: { AAN: 0.9, VER: 0.2, TEC: 0.6, SNE: 0.7, FYS: 0.6 }
    };

    const w = weights[position] || { AAN: 0.5, VER: 0.5, TEC: 0.5, SNE: 0.5, FYS: 0.5 };

    keys.forEach(key => {
        const base = Math.round(overall * w[key]);
        const v = Math.floor(Math.random() * variance * 2) - variance;
        attrs[key] = Math.max(1, Math.min(99, base + v));
    });

    return attrs;
}

/**
 * Generate round-robin schedule for a league
 */
async function generateSchedule(leagueId, season, clubIds) {
    const n = clubIds.length;
    const rounds = (n - 1) * 2; // Home + away
    const matches = [];

    for (let round = 0; round < rounds; round++) {
        const week = round + 1;
        for (let i = 0; i < Math.floor(n / 2); i++) {
            let home = (round + i) % (n - 1);
            let away = (n - 1 - i + round) % (n - 1);
            if (i === 0) away = n - 1;

            // Swap for second half
            if (round >= n - 1) {
                matches.push({
                    league_id: leagueId,
                    season,
                    week,
                    home_club_id: clubIds[away],
                    away_club_id: clubIds[home]
                });
            } else {
                matches.push({
                    league_id: leagueId,
                    season,
                    week,
                    home_club_id: clubIds[home],
                    away_club_id: clubIds[away]
                });
            }
        }
    }

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < matches.length; i += batchSize) {
        await supabase.from('schedule').insert(matches.slice(i, i + batchSize));
    }
}

/**
 * Check if user is logged in and return to appropriate screen
 */
export async function checkAuthAndRoute(onStartGame) {
    if (!isSupabaseAvailable()) {
        // No Supabase configured, go straight to singleplayer
        onStartGame('local');
        return;
    }

    const session = await getSession();
    if (session) {
        showModeScreen();
    } else {
        showAuthScreen();
    }
}

/**
 * Show the league overlay bar during gameplay
 */
export function showLeagueOverlay(leagueName) {
    const overlay = document.getElementById('league-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        document.getElementById('league-bar-name').textContent = leagueName;
    }
}

/**
 * Hide all multiplayer overlays (for transitioning to game)
 */
export { hideAllOverlays };
