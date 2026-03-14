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
export function initMultiplayerUI() {
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
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');
        errorEl.textContent = '';

        if (!email || !password) {
            errorEl.textContent = 'Vul alle velden in.';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Wachtwoord moet minimaal 6 tekens zijn.';
            return;
        }

        try {
            await signUp(email, password, email.split('@')[0]);
            showModeScreen();
        } catch (err) {
            errorEl.textContent = err.message;
        }
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
        console.log('[lobby] Join clicked, code:', JSON.stringify(code), 'length:', code.length);
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

    document.getElementById('waiting-copy-code')?.addEventListener('click', async () => {
        const code = document.getElementById('waiting-invite-code').textContent;
        const btn = document.getElementById('waiting-copy-code');
        try {
            await navigator.clipboard.writeText(code);
            btn.textContent = 'Gekopieerd!';
        } catch {
            // Fallback: select the code text
            const range = document.createRange();
            range.selectNode(document.getElementById('waiting-invite-code'));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            btn.textContent = 'Gekopieerd!';
        }
        setTimeout(() => { btn.textContent = 'Kopieer'; }, 2000);
    });

    document.getElementById('waiting-start-btn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = 'Starten...';
        try {
            await startLeague();
        } finally {
            btn.disabled = false;
            btn.textContent = 'Start competitie';
        }
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

    // Toggle create/join section when user has leagues
    document.getElementById('lobby-new-toggle')?.addEventListener('click', () => {
        const choiceEl = document.getElementById('lobby-choice');
        if (choiceEl) choiceEl.classList.toggle('expanded');
    });
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function hideAllOverlays() {
    document.getElementById('auth-screen').style.display = 'none';
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
    enterLeagueInProgress = false;
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
        if (codeError) {
            console.error('[createLeague] RPC error:', codeError);
            throw codeError;
        }
        console.log('[createLeague] Generated invite code:', inviteCode);

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

        console.log('[joinLeague] Looking for league with code:', code);

        // Use RPC to bypass RLS for invite code lookup
        let league = null;
        const { data: rpcLeagues, error: rpcError } = await supabase
            .rpc('find_league_by_invite_code', { p_code: code });

        if (!rpcError && rpcLeagues?.length > 0) {
            league = rpcLeagues[0];
            console.log('[joinLeague] Found via RPC:', league.id, league.status);
        } else {
            // Fallback: direct query (if RPC not available or RLS fixed)
            if (rpcError) console.warn('[joinLeague] RPC unavailable:', rpcError.message);
            const { data: directLeagues } = await supabase
                .from('leagues')
                .select('*')
                .eq('invite_code', code);
            league = directLeagues?.find(l => l.status === 'lobby' || l.status === 'active') || null;
            if (league) console.log('[joinLeague] Found via direct query:', league.id, league.status);
        }

        if (!league) {
            errorEl.textContent = 'Competitie niet gevonden. Controleer de code.';
            return;
        }

        console.log('[joinLeague] Found league:', league.id, league.name, league.status);

        console.log('[joinLeague] Found league:', league.id, league.name, league.status);

        // Check if already joined
        const { data: existingClub } = await supabase
            .from('clubs')
            .select('id')
            .eq('league_id', league.id)
            .eq('owner_id', user.id)
            .maybeSingle();

        if (existingClub) {
            console.log('[joinLeague] Already joined, entering league');
            if (league.status === 'lobby') {
                showWaitingScreen(league);
                await refreshWaitingRoom(league.id, user.id);
                subscribeToLobby(league.id, user.id);
            } else {
                await enterLeague(league.id, existingClub.id);
            }
            return;
        }

        if (league.status === 'active') {
            // Join an active league: replace an AI team via RPC
            await joinActiveLeague(league, user);
            return;
        }

        // Atomic join via RPC (prevents max_players overflow from concurrent joins)
        {
            console.log('[joinLeague] Attempting atomic join for user', user.id);
            const { data: joinResult, error: joinError } = await supabase.rpc('join_league', {
                p_league_id: league.id,
                p_user_id: user.id,
                p_club_name: 'FC Nieuw Team'
            });

            if (joinError) {
                console.error('[joinLeague] RPC error:', joinError);
                throw joinError;
            }

            if (!joinResult?.success) {
                if (joinResult?.error === 'league_full') {
                    errorEl.textContent = 'Deze competitie zit vol.';
                } else {
                    errorEl.textContent = joinResult?.error || 'Kon niet joinen.';
                }
                return;
            }

            if (joinResult.already_joined) {
                console.log('[joinLeague] Already joined via RPC, entering');
                showWaitingScreen(league);
                await refreshWaitingRoom(league.id, user.id);
                subscribeToLobby(league.id, user.id);
                return;
            }

            // Feed insert — non-critical
            supabase.from('league_feed').insert({
                league_id: league.id,
                type: 'join',
                data: { user_name: user.user_metadata?.display_name || 'Manager' }
            }).then(({ error }) => {
                if (error) console.warn('[joinLeague] Feed insert failed (non-critical):', error);
            });

            console.log('[joinLeague] Success, showing waiting screen');
            showWaitingScreen(league);
            await refreshWaitingRoom(league.id, user.id);
            subscribeToLobby(league.id, user.id);
        }

    } catch (err) {
        console.error('[joinLeague] Error:', err);
        errorEl.textContent = err.message || 'Er ging iets mis bij het deelnemen.';
    }
}

/**
 * Join an active league: replace an AI team, generate players, regenerate schedule
 */
async function joinActiveLeague(league, user) {
    const leagueId = league.id;

    // Replace an AI club via RPC (bypasses RLS, atomic with row lock)
    const { data: replacedClubId, error: rpcError } = await supabase
        .rpc('replace_ai_club', {
            p_league_id: leagueId,
            p_user_id: user.id,
            p_club_name: 'FC Nieuw Team'
        });

    if (rpcError) {
        console.error('[joinActiveLeague] RPC error:', rpcError);
        document.getElementById('lobby-error').textContent = 'Er ging iets mis bij het deelnemen.';
        return;
    }

    if (!replacedClubId) {
        document.getElementById('lobby-error').textContent = 'Geen plek meer in deze competitie.';
        return;
    }

    const aiClubId = replacedClubId;

    // Clear lineup positions so the new player starts with an empty lineup
    await supabase
        .from('players')
        .update({ lineup_position: null })
        .eq('club_id', aiClubId);

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
            const success = await generateSchedule(leagueId, 1, allClubs.map(c => c.id), humanClubIds);

            if (success) {
                // Set week to 1 — competition starts!
                await supabase
                    .from('leagues')
                    .update({ week: 1 })
                    .eq('id', leagueId);
            } else {
                console.error('[joinActiveLeague] Schedule generation failed');
            }
        }
    }

    // Enter the game directly
    await enterLeague(leagueId, aiClubId);
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
            .maybeSingle();

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

    const myLeaguesEl = document.getElementById('lobby-my-leagues');
    const choiceEl = document.getElementById('lobby-choice');

    if (!clubs || clubs.length === 0) {
        if (myLeaguesEl) myLeaguesEl.style.display = 'none';
        if (choiceEl) choiceEl.classList.remove('has-leagues');
        listEl.innerHTML = '';
        return;
    }

    // User has leagues — show "Mijn competities" prominently
    if (myLeaguesEl) myLeaguesEl.style.display = 'block';
    if (choiceEl) choiceEl.classList.add('has-leagues');

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
let enterLeagueInProgress = false;
async function enterLeague(leagueId, clubId) {
    if (enterLeagueInProgress) return;
    enterLeagueInProgress = true;
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
        // Clean up lobby subscription to prevent re-entry on future league updates
        if (lobbySubscription) {
            supabase.removeChannel(lobbySubscription);
            lobbySubscription = null;
        }

        // Enter the game in multiplayer mode
        setStorageMode('multiplayer', leagueId, clubId);
        hideAllOverlays();

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
async function startLeague() {
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

    // Build AI team names
    const shuffledNames = [...AI_TEAM_NAMES].sort(() => Math.random() - 0.5);
    const usedNames = humanClubs.map(c => c.name);
    const aiNames = shuffledNames.filter(n => !usedNames.includes(n)).slice(0, aiNeeded);

    // Atomic RPC: locks league, checks status=lobby, creates AI clubs + standings, sets active
    const { data: rpcResult, error: rpcError } = await supabase.rpc('start_league', {
        p_league_id: leagueId,
        p_user_id: user.id,
        p_ai_teams: aiNames.map(name => ({ name }))
    });

    if (rpcError) {
        console.error('[startLeague] RPC error:', rpcError.message);
        return;
    }

    if (rpcResult?.already_started) {
        // Another player was faster — just enter
        await enterLeague(leagueId, null);
        return;
    }

    if (!rpcResult?.success) {
        console.error('[startLeague] RPC failed:', rpcResult?.error);
        return;
    }

    // Generate players for human clubs (default 'player' tier, guard skips if already exists)
    const allClubIds = rpcResult.all_club_ids || [];
    const aiClubIds = rpcResult.ai_club_ids || [];
    for (const clubId of allClubIds) {
        if (aiClubIds.includes(clubId)) continue;
        await generatePlayersForClub(clubId, leagueId, 8);
    }

    // Generate players for AI clubs with varied difficulty tiers
    const tiers = assignAiTiers(aiClubIds.length);
    for (let i = 0; i < aiClubIds.length; i++) {
        await generatePlayersForClub(aiClubIds[i], leagueId, 8, tiers[i]);
    }

    // Generate schedule if 2+ human players
    const humanCount = rpcResult.human_count || humanClubs.length;
    if (humanCount >= 2) {
        const humanClubIds = humanClubs.map(c => c.id);
        await generateSchedule(leagueId, 1, allClubIds, humanClubIds);
    }

    // Feed entry (non-critical)
    supabase.from('league_feed').insert({
        league_id: leagueId,
        type: 'season_start',
        data: { season: 1, teams: allClubIds.length }
    }).then(({ error }) => {
        if (error) console.warn('[startLeague] Feed insert failed:', error.message);
    });

    // Clean up lobby subscription before entering (prevents double enterLeague from realtime callback)
    if (lobbySubscription) {
        supabase.removeChannel(lobbySubscription);
        lobbySubscription = null;
    }

    // Enter the game
    const myClubId = humanClubs.find(c => c.owner_id === user.id)?.id;
    await enterLeague(leagueId, myClubId);
}

/**
 * Assign difficulty tiers to AI teams for a varied league experience.
 * ~30% weak, ~40% average, ~30% strong (always at least 1 of each).
 */
function assignAiTiers(count) {
    if (count === 0) return [];
    const weakCount = Math.max(1, Math.round(count * 0.3));
    const strongCount = Math.max(1, Math.round(count * 0.3));
    const avgCount = Math.max(0, count - weakCount - strongCount);
    const tiers = [
        ...Array(weakCount).fill('weak'),
        ...Array(avgCount).fill('average'),
        ...Array(strongCount).fill('strong')
    ];
    // Fisher-Yates shuffle
    for (let i = tiers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
    }
    return tiers;
}

/**
 * Generate initial players for a club
 */
async function generatePlayersForClub(clubId, leagueId, division, tier = 'player') {
    // Guard: don't generate if club already has players
    const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('club_id', clubId)
        .limit(1);
    if (existing && existing.length > 0) {
        console.log(`Club ${clubId} already has players, skipping generation`);
        return;
    }

    // Squad composition depends on tier
    // Human players: 16 (excl myPlayer) = 1 keeper, 5 def, 5 mid, 4 att + myPlayer = 17 total
    // AI: 17 players as before
    const positions = tier === 'player' ? [
        'keeper',
        'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback', 'centraleVerdediger',
        'centraleMid', 'centraleMid', 'centraleMid', 'linksbuiten', 'rechtsbuiten',
        'spits', 'spits', 'linksbuiten', 'rechtsbuiten'
    ] : [
        'keeper', 'keeper',
        'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback', 'centraleVerdediger',
        'centraleMid', 'centraleMid', 'centraleMid', 'centraleMid',
        'linksbuiten', 'linksbuiten', 'rechtsbuiten', 'rechtsbuiten',
        'spits', 'spits'
    ];

    const dutchFirstNames = ['Jan', 'Kees', 'Pieter', 'Henk', 'Willem', 'Jaap', 'Sander', 'Erik', 'Bas', 'Tom', 'Mark', 'Joost', 'Frank', 'Daan', 'Lars', 'Bram'];
    const dutchLastNames = ['de Jong', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Janssen', 'van den Berg', 'Vermeer'];

    // Foreign player name pools per nationality code
    const foreignNames = {
        BE: { first: ['Kevin', 'Jelle', 'Bram', 'Thibaut', 'Dries', 'Axel'], last: ['Peeters', 'Janssens', 'Claes', 'Mertens', 'Willems', 'Wouters'] },
        DE: { first: ['Max', 'Lukas', 'Felix', 'Jonas', 'Leon', 'Tim'], last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner'] },
        BR: { first: ['Lucas', 'Gabriel', 'Rafael', 'Matheus', 'Bruno', 'Felipe'], last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira'] },
        ES: { first: ['Carlos', 'Pablo', 'Sergio', 'Alejandro', 'Diego', 'Adrián'], last: ['García', 'Martínez', 'López', 'Sánchez', 'Rodríguez', 'Fernández'] },
        GB: { first: ['James', 'Harry', 'Charlie', 'George', 'Oliver', 'Jack'], last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson'] },
        FR: { first: ['Antoine', 'Hugo', 'Raphaël', 'Lucas', 'Théo', 'Louis'], last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit'] },
        GH: { first: ['Kwame', 'Kofi', 'Yaw', 'Kwesi', 'Ebo', 'Nana'], last: ['Mensah', 'Owusu', 'Boateng', 'Asante', 'Osei', 'Agyei'] },
        MA: { first: ['Youssef', 'Amine', 'Mehdi', 'Hamza', 'Zakaria', 'Bilal'], last: ['El Amrani', 'Bouzid', 'Idrissi', 'Saidi', 'Benjelloun', 'Tahiri'] },
        TR: { first: ['Emre', 'Burak', 'Cem', 'Oğuz', 'Barış', 'Kaan'], last: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Aydın', 'Öztürk'] },
        PL: { first: ['Jakub', 'Mateusz', 'Kacper', 'Dawid', 'Szymon', 'Tomasz'], last: ['Kowalski', 'Wiśniewski', 'Wójcik', 'Kamiński', 'Lewandowski', 'Zieliński'] },
    };
    const foreignNats = Object.keys(foreignNames);

    // Pick foreign players: exactly 3 for human, 3-5 for AI
    const foreignCount = tier === 'player' ? 3 : 3 + Math.floor(Math.random() * 3);
    const allNonKeeperIdx = positions.map((p, i) => p !== 'keeper' ? i : -1).filter(i => i >= 0);
    const shuffledIdx = allNonKeeperIdx.sort(() => Math.random() - 0.5);
    const foreignIndices = new Set(shuffledIdx.slice(0, foreignCount));
    // Assign a nationality to each foreign player
    const foreignNatMap = {};
    for (const fi of foreignIndices) {
        foreignNatMap[fi] = foreignNats[Math.floor(Math.random() * foreignNats.length)];
    }

    // Overall ranges per tier
    const tierRanges = {
        player:  { oldMin: 3, oldMax: 7, youngMin: 2, youngMax: 3 },
        weak:    { oldMin: 2, oldMax: 4, youngMin: 1, youngMax: 2 },
        average: { oldMin: 3, oldMax: 6, youngMin: 2, youngMax: 3 },
        strong:  { oldMin: 5, oldMax: 8, youngMin: 3, youngMax: 4 },
    };
    const range = tierRanges[tier] || tierRanges.player;

    // Pick exactly 2 random non-keeper indices to be young players with 0.5 POT
    const youngCount = 2;
    const nonKeeperIndices = positions.map((p, i) => p !== 'keeper' ? i : -1).filter(i => i >= 0);
    const youngIndices = new Set();
    while (youngIndices.size < youngCount && nonKeeperIndices.length > 0) {
        const pick = nonKeeperIndices.splice(Math.floor(Math.random() * nonKeeperIndices.length), 1)[0];
        youngIndices.add(pick);
    }

    const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

    const players = positions.map((pos, idx) => {
        const isYoung = youngIndices.has(idx);
        const isForeign = foreignIndices.has(idx);
        // Foreign players for human teams are slightly above average
        const foreignBonus = (tier === 'player' && isForeign) ? 1 : 0;
        const overall = isYoung ? rnd(range.youngMin, range.youngMax) : rnd(range.oldMin, range.oldMax) + foreignBonus;
        const age = isYoung ? rnd(18, 23) : rnd(40, 55);
        const stars = isYoung ? 0.5 : 0;
        const natCode = isForeign ? foreignNatMap[idx] : 'NL';
        let firstName, lastName;
        if (isForeign && foreignNames[natCode]) {
            const pool = foreignNames[natCode];
            firstName = pool.first[Math.floor(Math.random() * pool.first.length)];
            lastName = pool.last[Math.floor(Math.random() * pool.last.length)];
        } else {
            firstName = dutchFirstNames[Math.floor(Math.random() * dutchFirstNames.length)];
            lastName = dutchLastNames[Math.floor(Math.random() * dutchLastNames.length)];
        }

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
            nationality: natCode.toLowerCase(),
            overall,
            potential: overall,
            stars,
            attributes: { ...attributes, _stars: stars },
            morale: rnd(60, 90),
            fitness: 100,
            energy: 100,
            salary: Math.round(5 + (overall / 10) + stars * 3 + rnd(0, 3)),
            lineup_position: null
        };
    });

    // Auto-assign lineup positions only for AI clubs (human players choose their own)
    if (tier !== 'player') {
        const formationRoles = [
            'keeper', 'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback',
            'linksbuiten', 'centraleMid', 'centraleMid', 'rechtsbuiten',
            'spits', 'spits'
        ];
        const assigned = new Set();
        formationRoles.forEach((role, slotIdx) => {
            const playerIdx = players.findIndex((p, i) => !assigned.has(i) && p.position === role);
            if (playerIdx !== -1) {
                players[playerIdx].lineup_position = slotIdx;
                assigned.add(playerIdx);
            }
        });
    }

    const { error } = await supabase.from('players').insert(players);
    if (error) console.error('Failed to insert players for club', clubId, error);
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
export async function generateSchedule(leagueId, season, clubIds, humanClubIds = []) {
    const n = clubIds.length;
    const rounds = (n - 1) * 2; // Home + away

    console.log(`[generateSchedule] ${n} clubs, ${humanClubIds.length} human, season ${season}`);

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

    // Prioritize human-vs-human matches early in the season
    // Sort rounds within each half so rounds with more human matches come first
    if (humanClubIds.length >= 2) {
        const humanSet = new Set(humanClubIds);
        const halfSize = n - 1; // rounds per half (7 for 8 teams)

        function countHumanMatches(round) {
            return round.filter(m => humanSet.has(m.home) && humanSet.has(m.away)).length;
        }

        // Sort first half (indices 0..halfSize-1): most human matches first
        const firstHalf = roundMatches.slice(0, halfSize);
        const secondHalf = roundMatches.slice(halfSize);

        // Create paired indices so we can keep first/second half rounds linked
        const paired = firstHalf.map((round, i) => ({ first: round, second: secondHalf[i], humanCount: countHumanMatches(round) }));
        paired.sort((a, b) => b.humanCount - a.humanCount);

        // Write back sorted order
        for (let i = 0; i < paired.length; i++) {
            roundMatches[i] = paired[i].first;
            roundMatches[i + halfSize] = paired[i].second;
        }

        const totalHumanFirst = paired.reduce((s, p) => s + p.humanCount, 0);
        console.log(`[generateSchedule] ${humanClubIds.length} humans, ${totalHumanFirst} human-vs-human matches in first half, reordered`);
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
    let insertFailed = false;
    const batchSize = 50;
    for (let i = 0; i < matches.length; i += batchSize) {
        const { error } = await supabase.from('schedule').insert(matches.slice(i, i + batchSize));
        if (error) {
            if (error.code === '23505') {
                // UNIQUE violation — another player already generated the schedule
                console.log('[generateSchedule] Schedule already exists (race condition resolved)');
                return true;
            }
            console.error('[generateSchedule] Insert failed:', error.message);
            insertFailed = true;
        }
    }

    if (insertFailed) {
        console.error('[generateSchedule] Schedule insert failed — check RLS policies');
        return false;
    }

    console.log(`[generateSchedule] Inserted ${matches.length} matches for ${rounds} rounds`);
    return true;
}

/**
 * Check if user is logged in and return to appropriate screen
 */
export async function checkAuthAndRoute() {
    try {
        const session = await getSession();
        if (session) {
            showModeScreen();
        } else {
            showAuthScreen();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
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
 * Get the full season schedule with club names
 * Returns array of rounds, each containing match objects with home/away names
 */
export async function getFullSchedule(leagueId, season) {
    // Fetch schedule with club names via foreign key joins
    const { data } = await supabase
        .from('schedule')
        .select('week, home_club_id, away_club_id, played, clubs_home:clubs!schedule_home_club_id_fkey(name), clubs_away:clubs!schedule_away_club_id_fkey(name)')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('week', { ascending: true });

    if (!data || data.length === 0) return [];

    // Fetch match results for played matches
    const { data: results } = await supabase
        .from('match_results')
        .select('week, home_club_id, away_club_id, home_score, away_score')
        .eq('league_id', leagueId)
        .eq('season', season);

    // Index results by week+home+away for quick lookup
    const resultMap = {};
    (results || []).forEach(r => {
        resultMap[`${r.week}_${r.home_club_id}_${r.away_club_id}`] = r;
    });

    // Group by week
    const byWeek = {};
    data.forEach(m => {
        if (!byWeek[m.week]) byWeek[m.week] = [];
        const result = resultMap[`${m.week}_${m.home_club_id}_${m.away_club_id}`];
        byWeek[m.week].push({
            home: m.clubs_home?.name || '?',
            away: m.clubs_away?.name || '?',
            homeScore: result?.home_score,
            awayScore: result?.away_score,
            played: m.played || !!result
        });
    });

    // Convert to ordered array of rounds
    const maxWeek = Math.max(...Object.keys(byWeek).map(Number));
    const rounds = [];
    for (let w = 1; w <= maxWeek; w++) {
        rounds.push(byWeek[w] || []);
    }
    return rounds;
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
 * Insert a single player into the Supabase players table
 * Used when contracting a scouted player in multiplayer
 */
export async function insertPlayerToSupabase(player, clubId, leagueId) {
    const natCode = typeof player.nationality === 'object'
        ? (player.nationality.code || 'nl').toLowerCase()
        : (player.nationality || 'nl');

    const record = {
        club_id: clubId,
        league_id: leagueId,
        name: player.name,
        age: player.age,
        position: player.position,
        nationality: natCode,
        overall: player.overall,
        potential: player.potential || player.overall,
        attributes: player.attributes || {},
        personality: player.personality || null,
        tag: player.tag || null,
        salary: player.salary || 0,
        stars: player.stars || 0,
        goals: player.goals || 0,
        assists: player.assists || 0,
        morale: player.morale || 70,
        fitness: player.condition || 90,
        energy: player.energy || 80,
        lineup_position: null
    };

    const { data, error } = await supabase
        .from('players')
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error('Failed to insert player:', error);
        return null;
    }
    return data;
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

    // Fallback: if no lineup set (AI teams from before auto-lineup fix), auto-assign by position
    if (lineup.every(p => p === null) && players.length > 0) {
        const fallbackRoles = [
            'keeper', 'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback',
            'linksbuiten', 'centraleMid', 'centraleMid', 'rechtsbuiten',
            'spits', 'spits'
        ];
        const assigned = new Set();
        fallbackRoles.forEach((role, slotIdx) => {
            const playerIdx = players.findIndex((p, i) => !assigned.has(i) && p.position === role);
            if (playerIdx !== -1) {
                lineup[slotIdx] = players[playerIdx];
                assigned.add(playerIdx);
            }
        });
        // Fill any remaining empty slots with unassigned players
        for (let i = 0; i < 11; i++) {
            if (lineup[i] === null) {
                const idx = players.findIndex((p, pi) => !assigned.has(pi));
                if (idx !== -1) {
                    lineup[i] = players[idx];
                    assigned.add(idx);
                }
            }
        }
    }

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
        roster: filledPlayers.map(p => ({ name: p.name, id: p.id })),
        lineup,
        tactics
    };
}

/**
 * Simulate all matches for a week, save results atomically via RPC, advance week
 * Returns the match results array
 */
export async function simulateWeek(leagueId, season, week, simulateMatchFn, calculateStrengthFn) {
    // Get all matches for this week
    const weekSchedule = await getWeekSchedule(leagueId, season, week);
    if (!weekSchedule || weekSchedule.length === 0) return [];

    // Check if already simulated (any result exists)
    const { data: existingResults } = await supabase
        .from('match_results')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week);

    if (existingResults && existingResults.length > 0) {
        return existingResults;
    }

    // Simulate all matches locally, then persist atomically
    const rpcResults = [];

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

        // Initialise away team playerRatings (fix: away players now have real IDs)
        awayTeam.lineup.filter(p => p).forEach(player => {
            if (!result.playerRatings[player.id]) {
                const quality = Math.min(1, Math.max(0, (player.overall || 50) / 100));
                const perf = (Math.random() + Math.random()) / 2;
                result.playerRatings[player.id] = {
                    player: { name: player.name, id: player.id, position: player.position },
                    rating: 3.5 + quality * 1.5 + perf * 2.5,
                    goals: 0, assists: 0, yellowCards: 0, redCards: 0
                };
            }
        });
        // Process away events for correct ratings
        result.events.filter(e => e.team === 'away').forEach(ev => {
            const pr = result.playerRatings[ev.playerId];
            if (!pr) return;
            if (ev.type === 'goal') { pr.goals++; pr.rating += 1.5; }
            if (ev.type === 'yellow_card') { pr.yellowCards++; pr.rating -= 0.5; }
            if (ev.type === 'red_card') { pr.redCards++; pr.rating -= 2.0; }
            if (ev.assistId) {
                const ar = result.playerRatings[ev.assistId];
                if (ar) { ar.assists++; ar.rating += 1.0; }
            }
        });
        // Clamp away ratings to 2-9 integers (home team was clamped by matchEngine)
        awayTeam.lineup.filter(p => p).forEach(player => {
            const pr = result.playerRatings[player.id];
            if (pr) pr.rating = Math.max(2, Math.min(9, Math.round(pr.rating)));
        });

        rpcResults.push({
            home_club_id: match.home_club_id,
            away_club_id: match.away_club_id,
            home_score: result.homeScore,
            away_score: result.awayScore,
            schedule_id: match.id,
            match_data: {
                events: result.events,
                possession: result.possession,
                shots: result.shots,
                shotsOnTarget: result.shotsOnTarget,
                fouls: result.fouls,
                cards: result.cards,
                xG: result.xG,
                manOfTheMatch: result.manOfTheMatch,
                playerRatings: result.playerRatings
            }
        });
    }

    // Single atomic RPC call — locks league row, inserts all results, updates standings, advances week
    const { data: rpcResponse, error: rpcError } = await supabase.rpc('process_week_results', {
        p_league_id: leagueId,
        p_season: season,
        p_week: week,
        p_results: rpcResults
    });

    if (rpcError) {
        console.error('[simulateWeek] RPC error:', rpcError.message);
    }

    if (rpcError || (rpcResponse && rpcResponse.already_exists)) {
        console.log('[simulateWeek] Results already existed or RPC conflict — fetching canonical results');
    }

    // Always fetch canonical results from DB (ensures both players see the same data)
    const { data: canonicalResults } = await supabase
        .from('match_results')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('week', week);

    return canonicalResults || [];
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
