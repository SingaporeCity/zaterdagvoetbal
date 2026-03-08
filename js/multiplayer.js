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

    // Lobby logout
    document.getElementById('lobby-back')?.addEventListener('click', async () => {
        await signOut();
        showAuthScreen();
    });

    document.getElementById('lobby-random-btn')?.addEventListener('click', async () => {
        await joinRandomLeague();
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
    // Skip mode selection — always multiplayer, go straight to lobby
    hideAllOverlays();
    const user = await getUser();
    if (!user) {
        showAuthScreen();
        return;
    }
    showLobbyScreen();
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
                name: 'Kelderklasse',
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

        // Find league by code (lobby OR active)
        const { data: league, error: findError } = await supabase
            .from('leagues')
            .select('*')
            .eq('invite_code', code)
            .in('status', ['lobby', 'active'])
            .single();

        if (findError || !league) {
            errorEl.textContent = 'Competitie niet gevonden of al afgelopen.';
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
            if (league.status === 'lobby') {
                showWaitingScreen(league);
                await refreshWaitingRoom(league.id, user.id);
                subscribeToLobby(league.id, user.id);
            } else {
                await enterLeague(league.id, existingClub.id);
            }
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

        if (league.status === 'active') {
            // Join an active league: replace an AI team
            await joinActiveLeague(league, user);
        } else {
            // Join lobby as normal
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

            await supabase.from('league_feed').insert({
                league_id: league.id,
                type: 'join',
                data: { user_name: user.user_metadata?.display_name || 'Manager' }
            });

            showWaitingScreen(league);
            await refreshWaitingRoom(league.id, user.id);
            subscribeToLobby(league.id, user.id);
        }

    } catch (err) {
        errorEl.textContent = err.message;
    }
}

/**
 * Join an active league: replace an AI team, generate players, regenerate schedule
 */
async function joinActiveLeague(league, user) {
    const leagueId = league.id;

    // Find an AI club to replace
    const { data: aiClub } = await supabase
        .from('clubs')
        .select('id')
        .eq('league_id', leagueId)
        .eq('is_ai', true)
        .limit(1)
        .single();

    if (!aiClub) {
        document.getElementById('lobby-error').textContent = 'Geen plek meer in deze competitie.';
        return;
    }

    // Take over the AI club: set owner, mark as human, rename
    await supabase
        .from('clubs')
        .update({
            owner_id: user.id,
            is_ai: false,
            name: 'FC Nieuw Team'
        })
        .eq('id', aiClub.id);

    // Add to feed
    await supabase.from('league_feed').insert({
        league_id: leagueId,
        type: 'join',
        data: { user_name: user.user_metadata?.display_name || 'Manager' }
    });

    // Get all human clubs now (including the new one)
    const { data: humanClubs } = await supabase
        .from('clubs')
        .select('id')
        .eq('league_id', leagueId)
        .eq('is_ai', false);

    // If this is the second human player and no schedule exists yet, generate it
    if (humanClubs && humanClubs.length >= 2) {
        const { data: existingSchedule } = await supabase
            .from('schedule')
            .select('id')
            .eq('league_id', leagueId)
            .limit(1);

        if (!existingSchedule || existingSchedule.length === 0) {
            // Get all clubs (human + AI) for schedule
            const { data: allClubs } = await supabase
                .from('clubs')
                .select('id')
                .eq('league_id', leagueId);

            const humanClubIds = humanClubs.map(c => c.id);
            await generateSchedule(leagueId, 1, allClubs.map(c => c.id), humanClubIds);

            // Set week to 1 — competition starts!
            await supabase
                .from('leagues')
                .update({ week: 1 })
                .eq('id', leagueId);
        }
    }

    // Enter the game directly
    await enterLeague(leagueId, aiClub.id);
}

/**
 * Join a random open league, or create one if none available
 */
async function joinRandomLeague() {
    const errorEl = document.getElementById('lobby-error');
    errorEl.textContent = '';

    try {
        const user = await getUser();
        if (!user) throw new Error('Niet ingelogd');

        // First check if user is already in a league
        const { data: existingClub } = await supabase
            .from('clubs')
            .select('id, league_id, leagues(id, name, invite_code, status)')
            .eq('owner_id', user.id)
            .eq('is_ai', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existingClub && existingClub.leagues) {
            const league = existingClub.leagues;
            if (league.status === 'active') {
                await enterLeague(league.id, existingClub.id);
                return;
            } else if (league.status === 'lobby') {
                showWaitingScreen(league);
                await refreshWaitingRoom(league.id, user.id);
                subscribeToLobby(league.id, user.id);
                return;
            }
        }

        // Find an open lobby league with space
        const { data: openLeagues } = await supabase
            .from('leagues')
            .select('id, invite_code')
            .eq('status', 'lobby')
            .order('created_at', { ascending: false })
            .limit(5);

        if (openLeagues && openLeagues.length > 0) {
            // Try to join the first open league
            for (const league of openLeagues) {
                const { count } = await supabase
                    .from('clubs')
                    .select('id', { count: 'exact', head: true })
                    .eq('league_id', league.id)
                    .eq('is_ai', false);

                if (count < 8) {
                    await joinLeague(league.invite_code);
                    return;
                }
            }
        }

        // Also check active leagues with AI slots
        const { data: activeLeagues } = await supabase
            .from('leagues')
            .select('id, invite_code')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

        if (activeLeagues && activeLeagues.length > 0) {
            for (const league of activeLeagues) {
                const { count } = await supabase
                    .from('clubs')
                    .select('id', { count: 'exact', head: true })
                    .eq('league_id', league.id)
                    .eq('is_ai', true);

                if (count > 0) {
                    await joinLeague(league.invite_code);
                    return;
                }
            }
        }

        // No open leagues found — create a new one and start it solo
        await createLeague();

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

    // Show start button for host (min 1 player)
    const isHost = league?.created_by === userId;
    if (startBtn && startInfo) {
        if (isHost && clubs && clubs.length >= 1) {
            startBtn.style.display = 'block';
            startInfo.textContent = clubs.length < 2 ? 'Je kunt alvast beginnen — wedstrijden starten als er meer spelers joinen.' : '';
            startInfo.style.display = clubs.length < 2 ? 'block' : 'none';
        } else if (!isHost) {
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

    if (!humanClubs || humanClubs.length < 1) return;

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

    // Generate players for all clubs
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

    // Only generate schedule if 2+ human players; otherwise wait for more to join
    if (humanClubs.length >= 2) {
        const humanClubIds = humanClubs.map(c => c.id);
        await generateSchedule(leagueId, 1, allClubs.map(c => c.id), humanClubIds);
    }

    // Update league status to active (week 0 = no matches yet if solo)
    await supabase
        .from('leagues')
        .update({ status: 'active', week: humanClubs.length >= 2 ? 1 : 0, season: 1 })
        .eq('id', leagueId);

    // Feed entry
    await supabase.from('league_feed').insert({
        league_id: leagueId,
        type: 'season_start',
        data: { season: 1, teams: allClubs.length }
    });

    // Enter the game
    const myClubId = humanClubs.find(c => c.owner_id === user.id)?.id;
    await enterLeague(leagueId, myClubId);
}

/**
 * Generate initial players for a club
 */
async function generatePlayersForClub(clubId, leagueId, division) {
    // Kelderklasse: old-timers squad (40-55yr, ALG 3-7) with 3 young guys (20-27yr, ALG 2-3)
    const positions = [
        'keeper', 'keeper',
        'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback', 'centraleVerdediger',
        'centraleMid', 'centraleMid', 'centraleMid', 'centraleMid',
        'linksbuiten', 'linksbuiten', 'rechtsbuiten', 'rechtsbuiten',
        'spits', 'spits'
    ];

    const firstNames = ['Jan', 'Kees', 'Pieter', 'Henk', 'Willem', 'Jaap', 'Sander', 'Erik', 'Bas', 'Tom', 'Mark', 'Joost', 'Frank', 'Daan', 'Lars', 'Bram'];
    const lastNames = ['de Jong', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Janssen', 'van den Berg', 'Vermeer'];

    // Pick 3 random non-keeper indices to be young players
    const nonKeeperIndices = positions.map((p, i) => p !== 'keeper' ? i : -1).filter(i => i >= 0);
    const youngIndices = new Set();
    while (youngIndices.size < 3 && nonKeeperIndices.length > 0) {
        const pick = nonKeeperIndices.splice(Math.floor(Math.random() * nonKeeperIndices.length), 1)[0];
        youngIndices.add(pick);
    }

    const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

    const players = positions.map((pos, idx) => {
        const isYoung = youngIndices.has(idx);
        const overall = isYoung ? rnd(2, 3) : rnd(3, 7);
        const age = isYoung ? rnd(20, 27) : rnd(40, 55);
        const stars = isYoung ? 0.5 : 0;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        const isKeeper = pos === 'keeper';
        const attrNames = isKeeper ? ['REF', 'BAL', 'SNE', 'FYS'] : ['AAN', 'VER', 'SNE', 'FYS'];
        const attributes = {};
        const spread = isYoung ? 2 : 3;
        attrNames.forEach(attr => {
            attributes[attr] = Math.max(1, Math.min(10, overall + rnd(-spread, spread)));
        });

        return {
            club_id: clubId,
            league_id: leagueId,
            name: `${firstName} ${lastName}`,
            age,
            position: pos,
            nationality: 'nl',
            overall,
            potential: overall,
            stars,
            attributes,
            morale: rnd(60, 90),
            fitness: rnd(70, 100),
            energy: rnd(60, 100),
            salary: Math.round(5 + (overall / 10) + stars * 3 + rnd(0, 3)),
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
async function generateSchedule(leagueId, season, clubIds, humanClubIds = []) {
    const n = clubIds.length;
    const rounds = (n - 1) * 2; // Home + away

    // Build rounds as arrays of match objects
    const roundMatches = [];
    for (let round = 0; round < rounds; round++) {
        const roundArr = [];
        for (let i = 0; i < Math.floor(n / 2); i++) {
            let home = (round + i) % (n - 1);
            let away = (n - 1 - i + round) % (n - 1);
            if (i === 0) away = n - 1;

            // Swap for second half
            if (round >= n - 1) {
                roundArr.push({ home: clubIds[away], away: clubIds[home] });
            } else {
                roundArr.push({ home: clubIds[home], away: clubIds[away] });
            }
        }
        roundMatches.push(roundArr);
    }

    // If exactly 2 human players, ensure they face each other in week 1 and 2
    if (humanClubIds.length === 2) {
        const [h1, h2] = humanClubIds;
        const halfSize = n - 1; // rounds per half (7 for 8 teams)

        // Find round in first half where h1 vs h2
        const firstHalfIdx = roundMatches.findIndex((round, idx) =>
            idx < halfSize && round.some(m =>
                (m.home === h1 && m.away === h2) || (m.home === h2 && m.away === h1)
            )
        );
        // Find round in second half (reverse fixture)
        const secondHalfIdx = roundMatches.findIndex((round, idx) =>
            idx >= halfSize && round.some(m =>
                (m.home === h1 && m.away === h2) || (m.home === h2 && m.away === h1)
            )
        );

        // Swap first-half round to position 0 (week 1)
        if (firstHalfIdx > 0) {
            [roundMatches[0], roundMatches[firstHalfIdx]] = [roundMatches[firstHalfIdx], roundMatches[0]];
        }
        // Swap second-half round to position 1 (week 2)
        if (secondHalfIdx > 1 && secondHalfIdx !== -1) {
            [roundMatches[1], roundMatches[secondHalfIdx]] = [roundMatches[secondHalfIdx], roundMatches[1]];
        }
    }

    // Flatten to match records with correct week numbers
    const matches = [];
    roundMatches.forEach((round, roundIdx) => {
        const week = roundIdx + 1;
        round.forEach(m => {
            matches.push({
                league_id: leagueId,
                season,
                week,
                home_club_id: m.home,
                away_club_id: m.away
            });
        });
    });

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

// ============================================
// MULTIPLAYER MATCH HELPERS
// ============================================

/**
 * Get my scheduled match for this week
 */
export async function getMyMatch(leagueId, season, week, myClubId) {
    const { data } = await supabase
        .from('schedule')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week)
        .or(`home_club_id.eq.${myClubId},away_club_id.eq.${myClubId}`)
        .single();
    return data;
}

/**
 * Check if a match result already exists for this week
 */
export async function getMatchResult(leagueId, season, week, myClubId) {
    const { data } = await supabase
        .from('match_results')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week)
        .or(`home_club_id.eq.${myClubId},away_club_id.eq.${myClubId}`)
        .single();
    return data;
}

/**
 * Get all schedule entries for a week
 */
export async function getWeekSchedule(leagueId, season, week) {
    const { data } = await supabase
        .from('schedule')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week);
    return data || [];
}

/**
 * Get club data (name, tactics, etc) by ID
 */
export async function getClubData(clubId) {
    const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();
    return data;
}

/**
 * Get players for a club
 */
export async function getClubPlayers(clubId) {
    const { data } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', clubId)
        .order('lineup_position', { ascending: true, nullsFirst: false });
    return data || [];
}

/**
 * Build a team object (name + strength) from club data and players
 * Used for simulateMatch() input
 */
function buildTeamFromClub(club, players) {
    // Build lineup array (11 positions, null for empty slots)
    const lineup = new Array(11).fill(null);
    players.forEach(p => {
        if (p.lineup_position !== null && p.lineup_position >= 0 && p.lineup_position < 11) {
            lineup[p.lineup_position] = p;
        }
    });

    const formation = club.tactics?.formation || '4-4-2';
    const tactics = club.tactics || { offensief: 'gebalanceerd', speltempo: 'normaal', veldbreedte: 'normaal', dekking: 'normaal', mentaliteit: 'normaal' };

    // We import calculateTeamStrength dynamically to avoid circular deps
    // Instead, calculate a simple strength estimate from player overalls
    const filledPlayers = lineup.filter(p => p !== null);
    const avgOverall = filledPlayers.length > 0
        ? filledPlayers.reduce((sum, p) => sum + (p.overall || 30), 0) / filledPlayers.length
        : 25;

    // Split by rough position groups for attack/defense/midfield
    const defenders = filledPlayers.filter(p => ['keeper', 'linksback', 'centraleVerdediger', 'rechtsback'].includes(p.position));
    const midfielders = filledPlayers.filter(p => ['linksMid', 'centraleMid', 'rechtsMid'].includes(p.position));
    const attackers = filledPlayers.filter(p => ['linksbuiten', 'rechtsbuiten', 'spits'].includes(p.position));

    const avgOf = (arr) => arr.length > 0 ? arr.reduce((s, p) => s + (p.overall || 30), 0) / arr.length : avgOverall;

    return {
        name: club.name,
        strength: {
            attack: Math.round(avgOf(attackers)),
            defense: Math.round(avgOf(defenders)),
            midfield: Math.round(avgOf(midfielders)),
            overall: Math.round(avgOverall)
        },
        roster: filledPlayers.map((p, i) => ({ name: p.name, id: `opp_${i}` })),
        lineup,
        tactics
    };
}

/**
 * Simulate all matches for a week, save results, update standings, advance week
 * Returns the match results array
 */
export async function simulateWeek(leagueId, season, week, simulateMatchFn, calculateStrengthFn) {
    // Get all matches for this week
    const weekSchedule = await getWeekSchedule(leagueId, season, week);
    if (!weekSchedule || weekSchedule.length === 0) return [];

    // Check if already simulated (any result exists)
    const { data: existingResults } = await supabase
        .from('match_results')
        .select('id')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week)
        .limit(1);

    if (existingResults && existingResults.length > 0) {
        // Already simulated, fetch all results
        const { data: allResults } = await supabase
            .from('match_results')
            .select('*')
            .eq('league_id', leagueId)
            .eq('season', season)
            .eq('week', week);
        return allResults || [];
    }

    const results = [];

    for (const match of weekSchedule) {
        // Load both clubs and their players
        const [homeClub, awayClub, homePlayers, awayPlayers] = await Promise.all([
            getClubData(match.home_club_id),
            getClubData(match.away_club_id),
            getClubPlayers(match.home_club_id),
            getClubPlayers(match.away_club_id)
        ]);

        const homeTeam = buildTeamFromClub(homeClub, homePlayers);
        const awayTeam = buildTeamFromClub(awayClub, awayPlayers);

        // Build home lineup for match engine
        const homeLineup = homeTeam.lineup;
        const formation = homeClub.tactics?.formation || '4-4-2';
        const tactics = homeClub.tactics || {};

        // If calculateStrengthFn is provided, use it for more accurate strength
        if (calculateStrengthFn) {
            homeTeam.strength = calculateStrengthFn(homeLineup, formation, tactics, homeLineup, {});
            const awayLineup = awayTeam.lineup;
            const awayFormation = awayClub.tactics?.formation || '4-4-2';
            const awayTactics = awayClub.tactics || {};
            awayTeam.strength = calculateStrengthFn(awayLineup, awayFormation, awayTactics, awayLineup, {});
        }

        // Simulate the match (from home perspective)
        const result = simulateMatchFn(
            homeTeam,
            awayTeam,
            homeLineup,
            formation,
            tactics,
            true, // isHomeGame
            { grassLevel: homeClub.stadium?.grass || 0 }
        );

        // Store result in database
        const matchResultRecord = {
            league_id: leagueId,
            schedule_id: match.id,
            season,
            week,
            home_club_id: match.home_club_id,
            away_club_id: match.away_club_id,
            home_score: result.homeScore,
            away_score: result.awayScore,
            match_data: {
                events: result.events,
                possession: result.possession,
                shots: result.shots,
                shotsOnTarget: result.shotsOnTarget,
                fouls: result.fouls,
                cards: result.cards,
                xG: result.xG,
                manOfTheMatch: result.manOfTheMatch
            }
        };

        const { data: savedResult } = await supabase
            .from('match_results')
            .insert(matchResultRecord)
            .select()
            .single();

        results.push(savedResult || matchResultRecord);

        // Update standings for both teams
        await updateMultiplayerStandings(leagueId, season, match.home_club_id, result.homeScore, result.awayScore);
        await updateMultiplayerStandings(leagueId, season, match.away_club_id, result.awayScore, result.homeScore);

        // Mark schedule entry as played
        await supabase
            .from('schedule')
            .update({ played: true })
            .eq('id', match.id);
    }

    // Advance league week
    await supabase
        .from('leagues')
        .update({ week: week + 1 })
        .eq('id', leagueId);

    return results;
}

/**
 * Update standings for a single club after a match
 */
async function updateMultiplayerStandings(leagueId, season, clubId, goalsFor, goalsAgainst) {
    // Fetch current standings
    const { data: standing } = await supabase
        .from('standings')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('club_id', clubId)
        .single();

    if (!standing) return;

    const won = goalsFor > goalsAgainst;
    const drawn = goalsFor === goalsAgainst;

    const update = {
        played: (standing.played || 0) + 1,
        won: (standing.won || 0) + (won ? 1 : 0),
        drawn: (standing.drawn || 0) + (drawn ? 1 : 0),
        lost: (standing.lost || 0) + (!won && !drawn ? 1 : 0),
        goals_for: (standing.goals_for || 0) + goalsFor,
        goals_against: (standing.goals_against || 0) + goalsAgainst,
        points: (standing.points || 0) + (won ? 3 : drawn ? 1 : 0)
    };

    await supabase
        .from('standings')
        .update(update)
        .eq('id', standing.id);
}

/**
 * Get the scheduled opponent's club name for the dashboard
 */
export async function getScheduledOpponent(leagueId, season, week, myClubId) {
    const match = await getMyMatch(leagueId, season, week, myClubId);
    if (!match) return null;

    const opponentClubId = match.home_club_id === myClubId ? match.away_club_id : match.home_club_id;
    const isHome = match.home_club_id === myClubId;

    const { data: opponentClub } = await supabase
        .from('clubs')
        .select('id, name, is_ai')
        .eq('id', opponentClubId)
        .single();

    return opponentClub ? { ...opponentClub, isHome } : null;
}

/**
 * Hide all multiplayer overlays (for transitioning to game)
 */
export { hideAllOverlays };
