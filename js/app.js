/**
 * ZATERDAGVOETBAL - Game Logic v2.0
 * Full featured Dutch amateur football manager
 */

// Import modules
import {
    DIVISIONS,
    NATIONALITIES,
    POSITIONS,
    PLAYER_TAGS,
    PERSONALITIES,
    DUTCH_FIRST_NAMES,
    DUTCH_LAST_NAMES,
    TACTICS,
    STAFF_TYPES,
    ASSISTANT_TRAINERS,
    FORMATIONS,
    STADIUM_UPGRADES,
    TRAINING_TYPES,
    getPositionGroup
} from './constants.js';

import {
    random,
    randomFromArray,
    formatCurrency,
    getInitials,
    getDivision,
    getNextMidnight,
    formatTimeRemaining,
    getPotentialStars
} from './utils.js';

import {
    gameState,
    dragState,
    resetDragState,
    setDragState,
    replaceGameState,
    getGameState
} from './state.js';

// Import new game systems
import {
    saveGame,
    loadGame,
    loadGameSync,
    hasSaveFile,
    getSaveInfo,
    startAutoSave,
    calculateOfflineProgress,
    applyOfflineProgress,
    exportSave,
    importSave,
    setStorageMode,
    isMultiplayer,
    forceSyncToSupabase
} from './storage.js';

// Import multiplayer systems
import { initMultiplayerUI, checkAuthAndRoute, showLeagueOverlay, hideAllOverlays } from './multiplayer.js';
import { subscribeToLeague, unsubscribeAll, fetchStandings, startCountdown, stopCountdown } from './realtime.js';
import { supabase, isSupabaseAvailable } from './supabase.js';

import {
    simulateMatch,
    generateOpponent,
    calculateTeamStrength,
    getMatchResultType,
    getMatchPoints,
    applyMatchResults,
    formatMatchResult
} from './matchEngine.js';

import {
    generateStandings as generateNewStandings,
    updateStandings,
    simulateAIMatches,
    isSeasonComplete,
    calculateSeasonResults,
    startNewSeason,
    checkDailyReward,
    getManagerLevel,
    awardXP,
    getPlayerLevel,
    awardPlayerXP,
    getNextOpponent,
    getZoneInfo,
    getSeasonSchedule,
    MANAGER_LEVELS,
    XP_REWARDS,
    PLAYER_LEVELS,
    PLAYER_XP_REWARDS
} from './progression.js';

import {
    checkAchievements,
    getAllAchievements,
    getAchievementsByCategory,
    getAchievementStats,
    getRecentAchievements,
    initAchievements,
    CATEGORIES
} from './achievements.js';

import {
    getRandomEvent,
    getWeeklyEvents,
    applyEventChoice,
    addEventToHistory,
    canTriggerEvent
} from './events.js';

// Constants, state, and utils are now imported from modules
// NOTE: The following duplicate declarations have been removed and are now imported from modules:
// - DIVISIONS, NATIONALITIES, POSITIONS, PLAYER_TAGS, PERSONALITIES
// - DUTCH_FIRST_NAMES, DUTCH_LAST_NAMES, TACTICS, STAFF_TYPES
// - ASSISTANT_TRAINERS, FORMATIONS, STADIUM_UPGRADES, TRAINING_TYPES, getPositionGroup
// - gameState, dragState (now from state.js)
// - random, randomFromArray, formatCurrency, getInitials, getDivision
// - calculatePotential, getNextMidnight, formatTimeRemaining (now from utils.js)

// ================================================
// NOTIFICATION SYSTEM
// ================================================

function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.game-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `game-notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIconSimple(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('notification-fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

function getNotificationIconSimple(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        case 'achievement': return '🏆';
        default: return 'ℹ';
    }
}

// Make showNotification available globally for onclick handlers
window.showNotification = showNotification;

// ================================================
// UTILITY FUNCTIONS (most are now imported from utils.js)
// ================================================

// The following functions are now imported from utils.js:
// random, randomFromArray, formatCurrency, getInitials, getDivision,
// calculatePotential, getNextMidnight, formatTimeRemaining

// These functions remain here because they depend on gameState:

function canTrain() {
    if (!gameState.training.lastSession) return true;
    const elapsed = Date.now() - gameState.training.lastSession;
    return elapsed >= gameState.training.cooldown;
}

function getTrainingTimeRemaining() {
    if (!gameState.training.lastSession) return 0;
    const elapsed = Date.now() - gameState.training.lastSession;
    return Math.max(0, gameState.training.cooldown - elapsed);
}

// ================================================
// PLAYER GENERATION
// ================================================

function generatePlayerName() {
    return `${randomFromArray(DUTCH_FIRST_NAMES)} ${randomFromArray(DUTCH_LAST_NAMES)}`;
}

function generateNationality() {
    // Weighted towards Dutch
    const weights = [40, 8, 8, 5, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3, 1, 1, 2];
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;

    for (let i = 0; i < NATIONALITIES.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return NATIONALITIES[i];
    }
    return NATIONALITIES[0];
}

function generatePlayerAttributes(division, position) {
    const div = getDivision(division);
    const attrs = {};

    // Keepers have different attributes: REF (Reflexen), BAL (Balvastheid)
    const isKeeper = position === 'keeper';
    const attrNames = isKeeper
        ? ['REF', 'BAL', 'SNE', 'FYS']
        : ['AAN', 'VER', 'SNE', 'FYS'];

    attrNames.forEach(attr => {
        attrs[attr] = random(div.minAttr, div.maxAttr);
    });

    // Boost primary attribute based on position (capped to division max)
    const posData = POSITIONS[position];
    const primaryAttr = Object.entries(posData.weights).sort((a, b) => b[1] - a[1])[0][0];
    attrs[primaryAttr] = Math.min(div.maxAttr, attrs[primaryAttr] + random(2, 5));

    return attrs;
}

function calculateOverall(attributes, position) {
    const weights = POSITIONS[position].weights;
    let overall = 0;

    for (const [attr, weight] of Object.entries(weights)) {
        overall += attributes[attr] * weight;
    }

    return Math.round(overall);
}

function getPlayerTag(attributes, position) {
    const tags = PLAYER_TAGS[position];
    if (!tags) return { name: 'Speler', bonus: {} };

    let highestAttr = 'AAN';
    let highestValue = 0;

    for (const [attr, value] of Object.entries(attributes)) {
        if (value > highestValue) {
            highestValue = value;
            highestAttr = attr;
        }
    }

    return tags[highestAttr] || { name: 'Speler', bonus: {} };
}

function generatePersonality(division, quality) {
    const divIndex = 8 - division;
    const qualityFactor = quality > 0.8 ? 'top' : quality > 0.2 ? 'middle' : 'bottom';

    let goodChance, badChance;

    if (divIndex <= 2) {
        if (qualityFactor === 'top') {
            goodChance = 0.20;
            badChance = 0.60;
        } else if (qualityFactor === 'middle') {
            goodChance = 0.50;
            badChance = 0.30;
        } else {
            goodChance = 0.70;
            badChance = 0.10;
        }
    } else {
        goodChance = 0.50;
        badChance = 0.30;
    }

    const roll = Math.random();
    if (roll < goodChance) {
        return randomFromArray(PERSONALITIES.good);
    } else if (roll < goodChance + badChance) {
        return randomFromArray(PERSONALITIES.bad);
    } else {
        return randomFromArray(PERSONALITIES.neutral);
    }
}

function generatePlayer(division, position = null, minAge = 17, maxAge = 35) {
    if (!position) {
        // Use specific positions with weighted distribution
        const positions = ['keeper', 'linksback', 'centraleVerdediger', 'rechtsback', 'centraleMid', 'linksbuiten', 'rechtsbuiten', 'spits'];
        const weights = [0.08, 0.10, 0.16, 0.10, 0.22, 0.10, 0.10, 0.14]; // More midfielders/CB, less keepers
        const roll = Math.random();
        let cumulative = 0;
        for (let i = 0; i < positions.length; i++) {
            cumulative += weights[i];
            if (roll < cumulative) {
                position = positions[i];
                break;
            }
        }
    }

    const attributes = generatePlayerAttributes(division, position);
    const overall = calculateOverall(attributes, position);
    const div = getDivision(division);
    const qualityPercentile = (overall - div.minAttr) / (div.maxAttr - div.minAttr);
    const nationality = generateNationality();
    const tag = getPlayerTag(attributes, position);
    const playerName = generatePlayerName();
    const playerAge = random(minAge, maxAge);

    return {
        id: Date.now() + Math.random(),
        name: playerName,
        age: playerAge,
        position: position,
        nationality: nationality,
        attributes: attributes,
        overall: overall,
        tag: tag.name,
        tagBonus: tag.bonus,
        personality: generatePersonality(division, qualityPercentile),
        salary: Math.round(div.salary.min + (div.salary.max - div.salary.min) * (overall / 100)),
        goals: random(0, 5),
        assists: random(0, 3),
        morale: random(60, 90),
        fitness: random(80, 100),
        condition: random(70, 100),
        energy: random(60, 100),
        stars: assignPlayerStars(playerAge),
        photo: generatePlayerPhoto(playerName, position)
    };
}

// Generate a unique player photo (color + pattern)
function generatePlayerPhoto(name, position) {
    const skinTones = ['#f5d0c5', '#e8beac', '#d4a574', '#c68642', '#8d5524', '#6b4423'];
    const hairColors = ['#1a1a1a', '#3d2314', '#6b4423', '#8b7355', '#d4a76a', '#c4c4c4'];
    const hairStyles = ['short', 'medium', 'bald', 'curly', 'long'];

    return {
        skinTone: randomFromArray(skinTones),
        hairColor: randomFromArray(hairColors),
        hairStyle: randomFromArray(hairStyles),
        seed: Math.floor(Math.random() * 1000) // For consistent random features
    };
}

function generateSquad(division) {
    const squad = [];

    // Zaterdagvoetbal: recreational old-timers squad
    const positionList = [
        'keeper', 'keeper',
        'linksback', 'centraleVerdediger', 'centraleVerdediger', 'rechtsback', 'centraleVerdediger',
        'centraleMid', 'centraleMid', 'centraleMid', 'centraleMid',
        'linksbuiten', 'linksbuiten', 'rechtsbuiten', 'rechtsbuiten',
        'spits', 'spits'
    ];

    positionList.forEach(position => {
        squad.push(createZaterdagPlayer(position));
    });

    // Make 3 random players young talents with high stars
    const shuffled = squad.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        shuffled[i].age = random(18, 23);
        shuffled[i].stars = randomFromArray([1.5, 2, 2, 2.5, 3]);
    }

    return squad;
}

function assignPlayerStars(age) {
    if (age >= 30) return 0.5;
    if (age >= 27) return randomFromArray([0.5, 0.5, 1]);
    if (age >= 24) return randomFromArray([0.5, 1, 1, 1.5, 1.5, 2]);
    if (age >= 21) return randomFromArray([1, 1.5, 1.5, 2, 2, 2.5, 3]);
    return randomFromArray([1.5, 2, 2, 2.5, 3, 3, 3.5, 4, 4.5]);
}

function createZaterdagPlayer(position) {
    const isKeeper = position === 'keeper';
    const attrNames = isKeeper ? ['REF', 'BAL', 'SNE', 'FYS'] : ['AAN', 'VER', 'SNE', 'FYS'];
    const attributes = {};

    attrNames.forEach(attr => {
        attributes[attr] = random(1, 10);
    });

    const overall = calculateOverall(attributes, position);
    // Zaterdagvoetbal: 90% Nederlands, 10% overig
    const nationality = Math.random() < 0.90 ? NATIONALITIES[0] : generateNationality();
    const tag = getPlayerTag(attributes, position);
    const playerName = generatePlayerName();
    const playerAge = random(40, 55);

    return {
        id: Date.now() + Math.random(),
        name: playerName,
        age: playerAge,
        position: position,
        nationality: nationality,
        attributes: attributes,
        overall: overall,
        tag: tag.name,
        tagBonus: tag.bonus,
        personality: generatePersonality(8, 0.5),
        salary: 0,
        goals: 0,
        assists: 0,
        morale: random(60, 90),
        fitness: random(80, 100),
        condition: random(70, 100),
        energy: random(60, 100),
        stars: 0.5,
        fixedMarketValue: 0,
        photo: generatePlayerPhoto(playerName, position)
    };
}

// ================================================
// TACTICS CALCULATIONS
// ================================================

function calculatePositionFit(player, positionRole) {
    if (!player) return 0;

    let fit = 0;

    // Exact position match
    if (player.position === positionRole) {
        fit += 100;
    } else {
        // Partial fit based on position groups
        const playerGroup = getPositionGroup(player.position);
        const roleGroup = getPositionGroup(positionRole);

        // Same group = good fit
        if (playerGroup === roleGroup) {
            fit += 75;
        } else {
            // Similar positions across groups
            const similarPositions = {
                linksback: ['linksbuiten', 'centraleMid'],
                rechtsback: ['rechtsbuiten', 'centraleMid'],
                centraleVerdediger: ['centraleMid'],
                centraleMid: ['linksbuiten', 'rechtsbuiten', 'centraleVerdediger', 'linksback', 'rechtsback'],
                linksbuiten: ['linksback', 'centraleMid', 'spits'],
                rechtsbuiten: ['rechtsback', 'centraleMid', 'spits'],
                spits: ['linksbuiten', 'rechtsbuiten', 'centraleMid']
            };

            if (similarPositions[positionRole]?.includes(player.position)) {
                fit += 50;
            } else if (positionRole !== 'keeper' && player.position !== 'keeper') {
                fit += 25;
            }
        }
    }

    return fit;
}

function calculateNationalityBonus(lineup, formation) {
    const bonuses = [];
    const positions = FORMATIONS[formation].positions;

    for (let i = 0; i < 11; i++) {
        const player = lineup[i];
        if (!player) continue;

        const pos = positions[i];
        let neighborBonus = 0;

        // Find adjacent positions (within 25% distance)
        for (let j = 0; j < 11; j++) {
            if (i === j || !lineup[j]) continue;

            const otherPos = positions[j];
            const distance = Math.sqrt(
                Math.pow(pos.x - otherPos.x, 2) +
                Math.pow(pos.y - otherPos.y, 2)
            );

            // Adjacent if within 30 units
            if (distance < 30) {
                if (lineup[j].nationality.code === player.nationality.code) {
                    neighborBonus += 1;
                }
            }
        }

        bonuses.push({
            playerId: player.id,
            nationalityBonus: neighborBonus,
            positionFit: calculatePositionFit(player, pos.role)
        });
    }

    return bonuses;
}

function calculateTacticsFit() {
    const formation = FORMATIONS[gameState.formation];
    let totalFit = 0;
    let filledPositions = 0;

    const bonuses = calculateNationalityBonus(gameState.lineup, gameState.formation);

    for (let i = 0; i < 11; i++) {
        const player = gameState.lineup[i];
        if (!player) continue;

        filledPositions++;
        const bonus = bonuses.find(b => b.playerId === player.id);

        let positionScore = bonus?.positionFit || 0;

        // Add nationality bonus
        positionScore += (bonus?.nationalityBonus || 0) * 5;

        // Check if player tag matches formation ideal tags
        if (formation.idealTags?.includes(player.tag)) {
            positionScore += 10;
        }

        totalFit += positionScore;
    }

    return filledPositions > 0 ? Math.round(totalFit / filledPositions) : 0;
}

// ================================================
// SCOUTING SYSTEM
// ================================================

// Calculate scout cost based on how many times player has been scouted
function getScoutCost(scoutCount) {
    const baseCost = 50;
    const costs = [50, 75, 100, 150, 200, 300];
    return costs[Math.min(scoutCount, costs.length - 1)];
}

// Calculate attribute ranges based on scout count
// More scouting = narrower ranges (more certainty)
function calculateScoutRanges(actualValue, scoutCount) {
    // Range starts at ±25, narrows by ~35% each scout
    const baseRange = 25;
    const narrowFactor = Math.pow(0.65, scoutCount - 1); // 1st: 1.0, 2nd: 0.65, 3rd: 0.42, 4th: 0.27
    const range = Math.round(baseRange * narrowFactor);

    // Add slight randomness to range center (not perfectly centered on actual)
    const offset = Math.floor((Math.random() - 0.5) * range * 0.3);

    return {
        min: Math.max(1, actualValue - range + offset),
        max: Math.min(99, actualValue + range + offset),
        range: range
    };
}

function scoutPlayers(position, minAge, maxAge, count = 8) {
    const results = [];
    const division = gameState.club.division;
    const scoutLevel = gameState.stadium.scouting;
    const scout = STADIUM_UPGRADES.scouting.find(s => s.id === scoutLevel);

    // Can scout slightly better players with better scout network
    const scoutNum = parseInt(scoutLevel.split('_')[1]) || 0;
    const divBonus = scoutNum >= 5 ? -1 : 0;
    const targetDiv = Math.max(0, division + divBonus);

    for (let i = 0; i < count; i++) {
        const pos = position === 'all' ? null : position;
        const player = generatePlayer(targetDiv, pos, minAge, maxAge);
        player.price = calculatePlayerValue(player, targetDiv);

        // Initialize scouting data
        player.scoutCount = 1; // First time scouted
        player.totalScoutCost = getScoutCost(0); // Cost of first scout

        // Calculate ranges based on scout count
        player.scoutRanges = {
            overall: calculateScoutRanges(player.overall, player.scoutCount),
            attack: calculateScoutRanges(player.attack, player.scoutCount),
            defense: calculateScoutRanges(player.defense, player.scoutCount),
            speed: calculateScoutRanges(player.speed, player.scoutCount),
            stamina: calculateScoutRanges(player.stamina, player.scoutCount)
        };

        // Hide info based on scout level
        const scoutInfoNum = parseInt(scoutLevel.split('_')[1]) || 0;
        player.scoutInfo = {
            overall: true,
            attributes: scoutInfoNum >= 3,
            personality: scoutInfoNum >= 4,
            stars: scoutInfoNum >= 5
        };

        results.push(player);
    }

    return results.sort((a, b) => b.overall - a.overall);
}

// Re-scout a player to narrow the ranges
function rescoutPlayer(playerId) {
    const player = gameState.scoutSearch.results.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Speler niet gevonden' };

    const cost = getScoutCost(player.scoutCount);

    if (gameState.club.budget < cost) {
        return { success: false, message: `Niet genoeg budget! Je hebt ${formatCurrency(cost)} nodig.` };
    }

    // Deduct cost
    gameState.club.budget -= cost;
    player.scoutCount++;
    player.totalScoutCost += cost;

    // Recalculate ranges (narrower now)
    player.scoutRanges = {
        overall: calculateScoutRanges(player.overall, player.scoutCount),
        attack: calculateScoutRanges(player.attack, player.scoutCount),
        defense: calculateScoutRanges(player.defense, player.scoutCount),
        speed: calculateScoutRanges(player.speed, player.scoutCount),
        stamina: calculateScoutRanges(player.stamina, player.scoutCount)
    };

    updateBudgetDisplays();
    renderScoutPage();

    return { success: true, message: `Scout rapport bijgewerkt! (${player.scoutCount}x gescout)` };
}

// Dismiss a scouted player - they won't appear again, replaced tomorrow
function dismissScoutedPlayer(playerId) {
    const player = gameState.scoutSearch.results.find(p => p.id === playerId);
    if (!player) return;

    // Track dismissed players (so they don't reappear)
    if (!gameState.scoutSearch.dismissed) {
        gameState.scoutSearch.dismissed = [];
    }
    gameState.scoutSearch.dismissed.push(playerId);

    // Remove from current results
    gameState.scoutSearch.results = gameState.scoutSearch.results.filter(p => p.id !== playerId);

    renderScoutPage();
}

function calculatePlayerValue(player, division, forTransfer = true) {
    const div = division || gameState.club?.division || 6;
    const divMultipliers = {
        8: 0.1, 7: 0.2, 6: 0.4, 5: 0.8, 4: 1.5, 3: 3, 2: 8, 1: 25, 0: 75
    };

    const overall = player.overall || 50;
    const stars = player.stars || 0.5;
    const age = player.age || 25;

    // Base value from overall rating
    let baseValue = Math.pow(overall, 2) * (divMultipliers[div] || 0.4) * 100;

    // Stars bonus (higher stars = higher value)
    const starsBonus = 1 + (stars / 10);
    baseValue *= starsBonus;

    // Age factor - young players with potential worth more
    if (age < 19) baseValue *= 1.8;
    else if (age < 22) baseValue *= 1.5;
    else if (age < 26) baseValue *= 1.2;
    else if (age < 29) baseValue *= 1.0;
    else if (age < 32) baseValue *= 0.6;
    else if (age < 35) baseValue *= 0.3;
    else baseValue *= 0.1;

    // Only apply random free transfer for transfer market generation
    if (forTransfer && Math.random() < 0.15) return 0;

    return Math.round(baseValue);
}

// Get market value for display (never random 0)
function getPlayerMarketValue(player) {
    if (player.fixedMarketValue !== undefined) return player.fixedMarketValue;
    return calculatePlayerValue(player, gameState.club?.division, false);
}

// ================================================
// UI RENDERING
// ================================================

function renderStandings() {
    const container = document.getElementById('standings-body');
    if (!container) return;

    // Determine zone classes
    const totalTeams = gameState.standings.length;
    const promotionZone = 2;
    const relegationZone = totalTeams - 2;

    let html = '';
    gameState.standings.forEach((team, index) => {
        const isPlayer = team.isPlayer;
        const position = index + 1;

        // Determine zone class
        let zoneClass = '';
        if (position <= promotionZone) zoneClass = 'promotion-zone';
        else if (position > relegationZone) zoneClass = 'relegation-zone';

        html += `
            <tr class="${isPlayer ? 'is-player' : ''} ${zoneClass}">
                <td>${position}</td>
                <td>${team.name}</td>
                <td>${team.wins || 0}</td>
                <td>${team.draws || 0}</td>
                <td>${team.losses || 0}</td>
                <td><strong>${team.points}</strong></td>
            </tr>
        `;
    });

    container.innerHTML = html;
}

function renderTopScorers() {
    const container = document.getElementById('top-scorers');
    if (!container) return;

    const scorers = [...gameState.players]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3);

    let html = '';
    scorers.forEach((player, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
        html += `
            <div class="performer-item">
                <span class="performer-rank ${rankClass}">${index + 1}</span>
                <div class="performer-info">
                    <span class="performer-name">${player.name}</span>
                    <span class="performer-position">${POSITIONS[player.position].name}</span>
                </div>
                <span class="performer-goals">${player.goals}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderPlayerCards() {
    const container = document.getElementById('player-cards');
    if (!container) return;

    // Group players by position type (attackers first, keepers last)
    const groups = {
        attacker: { name: 'Aanvallers', icon: '⚽', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', players: [] }
    };

    // Add "Mijn Speler" to the squad list
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const myPlayerEntry = {
        id: 'myplayer',
        name: mp.name,
        age: mp.age,
        position: mp.position,
        overall: mpOverall,
        potential: 99,
        isMyPlayer: true,
        nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
        salary: 0,
        energy: mp.energy || 100,
        attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
    };

    const allPlayers = [myPlayerEntry, ...gameState.players];
    allPlayers.forEach(player => {
        const group = getPositionGroup(player.position);
        if (groups[group]) {
            groups[group].players.push(player);
        }
    });

    // Sort players within each group by overall (descending)
    Object.values(groups).forEach(group => {
        group.players.sort((a, b) => b.overall - a.overall);
    });

    let html = '';
    for (const [key, group] of Object.entries(groups)) {
        if (group.players.length > 0) {
            html += `<div class="squad-group">
                <div class="squad-group-header">
                    <span class="squad-group-icon">${group.icon}</span>
                    <span class="squad-group-name">${group.name}</span>
                    <span class="squad-group-count">${group.players.length}</span>
                </div>
                <div class="squad-group-players">
                    ${group.players.map(player => createPlayerCardHTML(player)).join('')}
                </div>
            </div>`;
        }
    }

    container.innerHTML = html;

    // Update squad count
    const squadCount = document.getElementById('squad-count');
    if (squadCount) {
        const count = gameState.players.length;
        squadCount.textContent = count;
        squadCount.classList.toggle('squad-full', count >= 18);
    }

    // Add click handlers
    document.querySelectorAll('#player-cards .player-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.pc-buyout-btn')) return;
            const playerId = parsePlayerId(card.dataset.playerId);
            showPlayerDetail(playerId);
        });
    });

    // Buyout buttons
    document.querySelectorAll('#player-cards .pc-buyout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = parseFloat(btn.dataset.buyoutId);
            buyoutPlayer(playerId);
        });
    });
}

// Get potential display - always as range (xx-xx)
function getPotentialDisplay(potential, age) {
    if (age >= 29) {
        // 29+: minimal range (1 verschil)
        const max = Math.min(99, potential + 1);
        return `${potential}-${max}`;
    } else if (age >= 26) {
        // 26-28: small range (+/- 2)
        const min = Math.max(1, potential - 2);
        const max = Math.min(99, potential + 2);
        return `${min}-${max}`;
    } else if (age >= 23) {
        // 23-25: medium range (+/- 4)
        const min = Math.max(1, potential - 4);
        const max = Math.min(99, potential + 4);
        return `${min}-${max}`;
    } else if (age >= 20) {
        // 20-22: larger range (+/- 6)
        const min = Math.max(1, potential - 6);
        const max = Math.min(99, potential + 6);
        return `${min}-${max}`;
    } else {
        // Under 20: largest range (+/- 10)
        const min = Math.max(1, potential - 10);
        const max = Math.min(99, potential + 10);
        return `${min}-${max}`;
    }
}

// Get bar color based on fill percentage
function getBarColor(percentage) {
    if (percentage <= 25) return '#f44336'; // Red
    if (percentage <= 50) return '#ff9800'; // Orange
    if (percentage <= 75) return '#4caf50'; // Green
    return '#2e7d32'; // Dark green
}

// Convert potential (1-99) to 1-5 whole stars
function potentialToStarsGlobal(potential) {
    const stars = Math.round(potential / 20);
    return Math.min(5, Math.max(1, stars));
}

// Render stars as HTML (whole stars only)
function renderStarsHTML(starCount) {
    let html = '';
    const clamped = Math.min(5, Math.max(0, starCount));
    const full = Math.floor(clamped);
    const hasHalf = (clamped - full) >= 0.25;
    for (let i = 0; i < full; i++) {
        html += '<span class="star full">★</span>';
    }
    if (hasHalf) {
        html += '<span class="star half"><span class="star-half-filled">★</span><span class="star-half-empty">★</span></span>';
    }
    const filled = full + (hasHalf ? 1 : 0);
    for (let i = filled; i < 5; i++) {
        html += '<span class="star empty">☆</span>';
    }
    return html;
}

// Render transfer stars: known (yellow) + uncertain (dark) + empty
function renderTransferStarsHTML(known, uncertain) {
    let html = '';
    for (let i = 0; i < known; i++) {
        html += '<span class="star full">★</span>';
    }
    for (let i = 0; i < uncertain; i++) {
        html += '<span class="star uncertain">★</span>';
    }
    for (let i = known + uncertain; i < 5; i++) {
        html += '<span class="star empty">☆</span>';
    }
    return html;
}

function createPlayerCardHTML(player, mini = false) {
    const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
    const photo = player.photo || generatePlayerPhoto(player.name, player.position);
    const isKeeper = player.position === 'keeper';

    if (mini) {
        return `
            <div class="player-mini-card" data-player-id="${player.id}">
                <span class="mini-overall">${player.overall}</span>
                <span class="mini-flag">${player.nationality.flag}</span>
                <span class="mini-name">${player.name.split(' ')[0]}</span>
                <span class="mini-pos">${posData.abbr}</span>
            </div>
        `;
    }

    const marketValue = player.isMyPlayer ? 1000 : getPlayerMarketValue(player);
    const energy = player.energy || 75;
    const myPlayerClass = player.isMyPlayer ? ' my-player-card' : '';

    // Stars rating (fixed property)
    const potentialStars = player.isMyPlayer ? 5 : (player.stars || 0.5);

    // Compact horizontal card - flat grid layout for equal column alignment
    return `
        <div class="player-card${myPlayerClass}" data-player-id="${player.id}">
            <div class="pc-left">
                <span class="pc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                <div class="pc-age-box">
                    <span class="pc-age-value">${player.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <img class="pc-flag-img" src="https://flagcdn.com/w40/${(player.nationality.code || 'nl').toLowerCase()}.png" alt="${player.nationality.code || 'NL'}" />
            </div>
            <span class="pc-name">${player.name}</span>
            <span class="pc-finance">
                <span class="pc-salary">${formatCurrency(player.salary ?? 50)}/w</span>
                <span class="pc-value">${formatCurrency(marketValue)}</span>
            </span>
            <div class="pc-condition-bars">
                <div class="pc-bar-item">
                    <span class="pc-bar-label">Energie</span>
                    <div class="pc-bar-track">
                        <div class="pc-bar-fill" style="width: ${energy}%; background: ${getBarColor(energy)}"></div>
                    </div>
                    <span class="pc-bar-value">${energy}%</span>
                </div>
            </div>
            <div class="pc-ratings">
                <div class="pc-overall" style="background: ${posData.color}">
                    <span class="pc-overall-value">${player.overall}</span>
                    <span class="pc-overall-label">ALG</span>
                </div>
                <div class="pc-potential-stars">
                    <span class="pc-stars">${renderStarsHTML(potentialStars)}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
            ${!player.isMyPlayer ? `<button class="pc-buyout-btn" data-buyout-id="${player.id}" title="Contract afkopen (${formatCurrency((player.salary || 0) * 10)})">✕</button>` : ''}
        </div>
    `;
}

// ================================================
// MIJN SPELER PAGE
// ================================================

function initMyPlayer() {
    if (!gameState.myPlayer) {
        gameState.myPlayer = {
            name: 'Patrick',
            age: 45,
            position: 'spits',
            number: 10,
            energy: 100,
            attributes: {
                SNE: 12,
                TEC: 12,
                PAS: 12,
                SCH: 12,
                VER: 12,
                FYS: 12
            }
        };
    }
    // Migrate old saves missing new attributes
    const a = gameState.myPlayer.attributes;
    if (a.PAS === undefined) a.PAS = 12;
    if (a.SCH === undefined) a.SCH = 12;
    if (gameState.myPlayer.energy === undefined) gameState.myPlayer.energy = 100;
    // Migrate position to valid POSITIONS key
    if (gameState.myPlayer.position === 'CM') gameState.myPlayer.position = 'spits';
    // Migrate player XP fields
    if (gameState.myPlayer.xp === undefined || gameState.myPlayer.xp < 1100) gameState.myPlayer.xp = 1100;
    if (gameState.myPlayer.spentSkillPoints === undefined) gameState.myPlayer.spentSkillPoints = 0;
    // Migrate old saves: cap initial attributes at 12 (only if no skill points spent yet)
    if (!gameState.myPlayer.spentSkillPoints) {
        const attrKeys = ['SNE', 'TEC', 'PAS', 'SCH', 'VER', 'FYS'];
        attrKeys.forEach(k => { if (a[k] > 12) a[k] = 12; });
    }
    return gameState.myPlayer;
}

function getMyPlayerDerived(mp) {
    const a = mp.attributes;
    const aanval = Math.round((a.SCH * 0.35 + a.TEC * 0.25 + a.PAS * 0.2 + a.SNE * 0.2));
    const verdediging = Math.round((a.VER * 0.4 + a.FYS * 0.3 + a.PAS * 0.15 + a.SNE * 0.15));
    const gemiddeld = Math.round((a.SNE + a.TEC + a.PAS + a.SCH + a.VER + a.FYS) / 6);
    return { aanval, verdediging, gemiddeld };
}

function renderMijnSpelerPage() {
    const container = document.getElementById('mijnspeler-dashboard');
    if (!container) return;

    const mp = initMyPlayer();
    const a = mp.attributes;

    function statBar(label, value, color) {
        return `<div class="mp-stat-row">
            <span class="mp-stat-label">${label}</span>
            <div class="mp-stat-bar-track">
                <div class="mp-stat-bar-fill" style="width: ${value}%; background: ${color}"></div>
            </div>
            <span class="mp-stat-value">${value}</span>
        </div>`;
    }

    function recordItem(value, label) {
        return `<div class="mp-record-item">
            <span class="mp-record-value">${value}</span>
            <span class="mp-record-label">${label}</span>
        </div>`;
    }

    // --- Energie ---
    const energy = mp.energy ?? 100;
    const energyColor = energy > 70 ? '#4caf50' : energy >= 40 ? '#ff9800' : '#ef5350';
    const energyLabel = energy > 70 ? 'Fit' : energy >= 40 ? 'Vermoeid' : 'Uitgeput';

    // --- Seizoensstatistieken ---
    const history = gameState.matchHistory || [];
    const seasonHistory = history.filter(h => h.season === gameState.season);
    const seasonMatches = seasonHistory.length;
    const seasonGoals = seasonHistory.reduce((sum, m) => sum + (m.playerScore || 0), 0);
    const seasonAssists = seasonHistory.reduce((sum, m) => {
        return sum + (m.events || []).filter(e =>
            e.type === 'goal' && e.team === 'home' && e.assistId
        ).length;
    }, 0);
    const seasonCleanSheets = seasonHistory.filter(m => m.opponentScore === 0).length;
    const seasonYellows = seasonHistory.reduce((sum, m) => {
        return sum + (m.events || []).filter(e => e.type === 'yellow_card' && e.team === 'home').length;
    }, 0);
    const seasonReds = seasonHistory.reduce((sum, m) => {
        return sum + (m.events || []).filter(e => e.type === 'red_card' && e.team === 'home').length;
    }, 0);

    // --- Carriere ---
    const clubStats = gameState.club?.stats || {};
    const stats = gameState.stats || {};
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];
    const highestDiv = divisionNames[clubStats.highestDivision || 8] || '6e Klasse';
    const totalSeasons = (gameState.season || 1);

    // --- Vorm (laatste 5 wedstrijden) ---
    const last5 = history.slice(-5);
    const vormCircles = [];
    for (let i = 0; i < 5; i++) {
        if (i < last5.length) {
            const m = last5[i];
            if (m.resultType === 'win') vormCircles.push('<span class="mp-vorm-circle mp-vorm-win">W</span>');
            else if (m.resultType === 'draw') vormCircles.push('<span class="mp-vorm-circle mp-vorm-draw">G</span>');
            else vormCircles.push('<span class="mp-vorm-circle mp-vorm-loss">V</span>');
        } else {
            vormCircles.push('<span class="mp-vorm-circle mp-vorm-empty">-</span>');
        }
    }
    let streakText = '';
    if (stats.currentWinStreak > 1) streakText = `${stats.currentWinStreak} zeges op rij`;
    else if (stats.currentUnbeaten > 1) streakText = `${stats.currentUnbeaten} ongeslagen`;

    container.innerHTML = `
        <div class="mp-layout">
            <div class="mp-top">
                <div class="mp-avatar-card">
                    <div class="mp-avatar">
                        <svg viewBox="0 0 80 100">
                            <ellipse cx="40" cy="28" rx="18" ry="19" fill="#f5d0c5"/>
                            <ellipse cx="40" cy="15" rx="16" ry="9" fill="#4a3728"/>
                            <circle cx="33" cy="26" r="2.5" fill="white"/>
                            <circle cx="47" cy="26" r="2.5" fill="white"/>
                            <circle cx="33.5" cy="26.5" r="1.2" fill="#333"/>
                            <circle cx="47.5" cy="26.5" r="1.2" fill="#333"/>
                            <path d="M36 35 Q40 38 44 35" fill="none" stroke="#a0522d" stroke-width="1.2"/>
                            <path d="M15 95 Q15 65 25 58 L40 62 L55 58 Q65 65 65 95 L65 100 L15 100 Z" fill="var(--accent-green-dim)"/>
                            <text x="40" y="85" text-anchor="middle" fill="white" font-family="var(--font-display)" font-size="16" font-weight="bold">${mp.number}</text>
                            <path d="M32 58 L40 62 L48 58" fill="none" stroke="white" stroke-width="1.5"/>
                            <rect x="22" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                            <rect x="42" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                        </svg>
                    </div>
                    <h3 class="mp-name">${mp.name}</h3>
                    <div class="mp-meta">
                        <span class="mp-position">${mp.position}</span>
                        <span class="mp-age">${mp.age} jaar</span>
                        <span class="mp-number">#${mp.number}</span>
                    </div>
                </div>

                <div class="mp-dual-grid">
                    <div class="mp-stats-section">
                        <h4 class="mp-section-title">Seizoen ${totalSeasons}</h4>
                        <div class="mp-record-grid">
                            ${recordItem(seasonMatches, 'Wedstrijden')}
                            ${recordItem(seasonGoals, 'Doelpunten')}
                            ${recordItem(seasonAssists, 'Assists')}
                            ${recordItem(seasonCleanSheets, 'Clean sheets')}
                            ${recordItem(seasonYellows, 'Geel')}
                            ${recordItem(seasonReds, 'Rood')}
                        </div>
                    </div>
                    <div class="mp-stats-section">
                        <h4 class="mp-section-title">Carriere</h4>
                        <div class="mp-record-grid">
                            ${recordItem(clubStats.totalMatches || 0, 'Wedstrijden')}
                            ${recordItem(stats.wins || 0, 'Zeges')}
                            ${recordItem(stats.draws || 0, 'Gelijk')}
                            ${recordItem(stats.losses || 0, 'Verloren')}
                            ${recordItem(stats.promotions || 0, 'Promoties')}
                            ${recordItem(highestDiv, 'Hoogste divisie')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mp-bottom">
                <div class="mp-dual-grid">
                    <div class="mp-stats-section">
                        <h4 class="mp-section-title">Kwaliteiten</h4>
                        ${statBar('Snelheid', a.SNE, '#ff9800')}
                        ${statBar('Techniek', a.TEC, '#4caf50')}
                        ${statBar('Passen', a.PAS, '#29b6f6')}
                        ${statBar('Schieten', a.SCH, '#ef5350')}
                        ${statBar('Verdedigen', a.VER, '#7e57c2')}
                        ${statBar('Fysiek', a.FYS, '#8d6e63')}
                    </div>

                    <div class="mp-stats-section">
                        <h4 class="mp-section-title">Energie</h4>
                        <div class="mp-energy-bar">
                            <div class="mp-energy-track">
                                <div class="mp-energy-fill" style="width: ${energy}%; background: ${energyColor}"></div>
                            </div>
                            <div class="mp-energy-info">
                                <span class="mp-energy-value" style="color: ${energyColor}">${energy}%</span>
                                <span class="mp-energy-label">${energyLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mp-stats-section">
                    <h4 class="mp-section-title">Vorm</h4>
                    <div class="mp-vorm-row">
                        ${vormCircles.join('')}
                    </div>
                    ${streakText ? `<span class="mp-vorm-streak">${streakText}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ================================================
// MIJN SPELER — TABS & PRESTATIES
// ================================================


function renderAchievementCards(achievements, filterCategories) {
    const filtered = achievements.filter(a => filterCategories.includes(a.category));
    const stats = { total: filtered.length, unlocked: filtered.filter(a => a.unlocked).length };
    const progressPct = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;

    // Category labels
    const catLabels = {
        matches: 'Wedstrijden', goals: 'Doelpunten', season: 'Seizoen',
        club: 'Club', players: 'Spelers', stadium: 'Stadion', special: 'Speciaal'
    };

    const filterBtns = filterCategories.map(cat =>
        `<button class="ach-filter-btn" data-ach-cat="${cat}">${catLabels[cat] || cat}</button>`
    ).join('');

    function renderCards(category) {
        const cards = filtered
            .filter(a => !category || a.category === category)
            .map(a => {
                const isHidden = a.hidden && !a.unlocked;
                const name = isHidden ? '???' : a.name;
                const desc = isHidden ? 'Nog niet ontdekt...' : a.description;
                const icon = isHidden ? '❓' : a.icon;
                const cls = a.unlocked ? 'ach-card unlocked' : (isHidden ? 'ach-card hidden-ach' : 'ach-card');
                const xpBadge = a.reward?.playerXP ? `<span class="ach-xp-badge">+${a.reward.playerXP} XP</span>` :
                                a.reward?.managerXP ? `<span class="ach-xp-badge mgr">+${a.reward.managerXP} XP</span>` : '';
                return `<div class="${cls}">
                    <span class="ach-icon">${icon}</span>
                    <div class="ach-info">
                        <span class="ach-name">${name}${xpBadge}</span>
                        <span class="ach-desc">${desc}</span>
                    </div>
                    ${a.unlocked ? '<span class="ach-check">✓</span>' : ''}
                </div>`;
            }).join('');
        return cards;
    }

    return { progressPct, stats, filterBtns, renderCards, defaultCategory: filterCategories[0] };
}

// ================================================
// VOORTGANG TAB — Speler XP + Manager XP samen
// ================================================

function renderClubDNA(divisionNames) {
    const club = gameState.club;
    const divName = divisionNames[club.division] || '6e Klasse';
    const budget = club.budget.toLocaleString('nl-NL');
    const playerCount = gameState.players?.length || 0;
    const youthCount = gameState.youthPlayers?.length || 0;
    const rep = club.reputation || 0;
    const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rep / 20) ? '\u2605' : '\u2606').join('');
    const clubStats = club.stats || {};
    const totalGoals = clubStats.totalGoals || 0;
    const titles = clubStats.titles || 0;
    const highDiv = divisionNames[clubStats.highestDivision || 8] || '6e Klasse';
    const formation = gameState.formation || '4-4-2';
    const staffCount = Object.values(gameState.staff || {}).filter(s => s !== null).length;
    const capacity = gameState.stadium?.capacity || 200;
    const avgAge = playerCount > 0 ? Math.round(gameState.players.reduce((s, p) => s + (p.age || 0), 0) / playerCount) : 0;
    const colors = club.colors || {};

    return `
        <div class="vg-club-dna">
            <div class="vg-dna-header">
                <span class="vg-dna-title">Club DNA</span>
                <span class="vg-dna-season">Seizoen ${gameState.season} \u00B7 Week ${gameState.week}</span>
            </div>

            <div class="vg-dna-identity">
                <div class="vg-dna-badge" style="background: ${colors.primary || '#1b5e20'}; border-color: ${colors.accent || '#ff9800'}">
                    <span class="vg-dna-badge-letter">${club.name.charAt(0)}</span>
                </div>
                <div>
                    <div class="vg-dna-name">${club.name}</div>
                    <div class="vg-dna-div">${divName}</div>
                    <div class="vg-dna-stars">${stars}</div>
                </div>
            </div>

            <div class="vg-dna-grid">
                <div class="vg-dna-item">
                    <span class="vg-dna-item-val">\u20AC${budget}</span>
                    <span class="vg-dna-item-lbl">Budget</span>
                </div>
                <div class="vg-dna-item">
                    <span class="vg-dna-item-val">${capacity}</span>
                    <span class="vg-dna-item-lbl">Capaciteit</span>
                </div>
                <div class="vg-dna-item">
                    <span class="vg-dna-item-val">${playerCount}</span>
                    <span class="vg-dna-item-lbl">Spelers</span>
                </div>
                <div class="vg-dna-item">
                    <span class="vg-dna-item-val">${youthCount}</span>
                    <span class="vg-dna-item-lbl">Jeugd</span>
                </div>
            </div>

            <div class="vg-dna-details">
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Formatie</span><span class="vg-dna-detail-val">${formation}</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Gem. leeftijd</span><span class="vg-dna-detail-val">${avgAge} jaar</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Stafleden</span><span class="vg-dna-detail-val">${staffCount} / 3</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Totaal goals</span><span class="vg-dna-detail-val">${totalGoals}</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Titels</span><span class="vg-dna-detail-val">${titles}</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Beste divisie</span><span class="vg-dna-detail-val">${highDiv}</span></div>
                <div class="vg-dna-detail"><span class="vg-dna-detail-lbl">Opgericht</span><span class="vg-dna-detail-val">Seizoen ${clubStats.founded || 1}</span></div>
            </div>
        </div>`;
}

function renderSeasonHistory(divisionNames) {
    const history = gameState.seasonHistory || [];

    // Current season live
    const currentMatches = (gameState.matchHistory || []).filter(m => m.season === gameState.season);
    const currentWins = currentMatches.filter(m => m.resultType === 'win').length;
    const currentDraws = currentMatches.filter(m => m.resultType === 'draw').length;
    const currentLosses = currentMatches.filter(m => m.resultType === 'loss').length;
    const currentGF = currentMatches.reduce((s, m) => s + m.playerScore, 0);
    const currentGA = currentMatches.reduce((s, m) => s + m.opponentScore, 0);

    const allSeasons = [
        ...history,
        {
            season: gameState.season,
            division: gameState.club.division,
            position: gameState.club.position,
            wins: currentWins,
            draws: currentDraws,
            losses: currentLosses,
            goalsFor: currentGF,
            goalsAgainst: currentGA,
            result: 'current'
        }
    ];

    const rows = allSeasons.map(s => {
        const divName = divisionNames[s.division] || '?';
        const gd = s.goalsFor - s.goalsAgainst;
        const gdStr = gd >= 0 ? `+${gd}` : `${gd}`;
        const badge = s.result === 'champion' ? '<span class="vg-szn-badge champ">\uD83C\uDFC6</span>'
            : s.result === 'promoted' ? '<span class="vg-szn-badge prom">\u25B2</span>'
            : s.result === 'relegated' ? '<span class="vg-szn-badge rel">\u25BC</span>'
            : s.result === 'current' ? '<span class="vg-szn-badge curr">nu</span>'
            : '';
        return `<div class="vg-szn-row">
            <span class="vg-szn-s">S${s.season}</span>
            <span class="vg-szn-div">${divName}</span>
            <span class="vg-szn-pos">#${s.position}</span>
            <span class="vg-szn-wdl">${s.wins}W ${s.draws}G ${s.losses}V</span>
            <span class="vg-szn-gd">${s.goalsFor}-${s.goalsAgainst} (${gdStr})</span>
            ${badge}
        </div>`;
    }).join('');

    return `
        <div class="vg-seasons">
            <div class="vg-szn-header">
                <span class="vg-szn-title">Seizoensoverzicht</span>
            </div>
            ${rows}
        </div>`;
}

function renderStatsAndRecords(cStats, clubStats, highestDiv) {
    const s = cStats || {};
    const statRows = [
        { label: 'Wedstrijden', value: clubStats.totalMatches || 0 },
        { label: 'Zeges', value: s.wins || 0 },
        { label: 'Gelijk', value: s.draws || 0 },
        { label: 'Verloren', value: s.losses || 0 },
        { label: 'Promoties', value: s.promotions || 0 },
        { label: 'Beste klasse', value: highestDiv }
    ];
    const recRows = [
        { label: 'Grootste zege', value: s.highestScoreMatch ? `${s.highestScoreMatch}-0` : '-' },
        { label: 'Winstreek', value: s.bestWinStreak || 0 },
        { label: 'Clean sheets', value: s.cleanSheets || 0 },
        { label: 'Ongeslagen reeks', value: s.bestUnbeaten || 0 },
        { label: 'Thuiszeges', value: s.homeWins || 0 },
        { label: 'Comebacks', value: s.comebacks || 0 }
    ];

    const statGrid = statRows.map(i => `<div class="vg-mc-stat"><span class="vg-mc-stat-val">${i.value}</span><span class="vg-mc-stat-lbl">${i.label}</span></div>`).join('');
    const recGrid = recRows.map(i => `<div class="vg-mc-stat"><span class="vg-mc-stat-val">${i.value}</span><span class="vg-mc-stat-lbl">${i.label}</span></div>`).join('');

    return `
        <div class="vg-stats-records">
            <div class="vg-sr-section">
                <span class="vg-sr-title">Statistieken</span>
                <div class="vg-mc-stats">${statGrid}</div>
            </div>
            <div class="vg-sr-section">
                <span class="vg-sr-title">Records</span>
                <div class="vg-mc-stats">${recGrid}</div>
            </div>
        </div>`;
}

function renderCompactStandings(divisionNames) {
    const standings = gameState.standings || [];
    if (standings.length === 0) return '';

    const divName = divisionNames[gameState.club.division] || '6e Klasse';
    const totalTeams = standings.length;
    const promoZone = 2;
    const relegZone = totalTeams - 2;

    const rows = standings.map((team, i) => {
        const pos = i + 1;
        let cls = team.isPlayer ? 'vg-stand-player' : '';
        if (pos <= promoZone) cls += ' vg-stand-promo';
        else if (pos > relegZone) cls += ' vg-stand-releg';
        const gf = team.goalsFor || 0;
        const ga = team.goalsAgainst || 0;
        return `<tr class="${cls}">
            <td>${pos}</td>
            <td>${team.name}</td>
            <td>${team.played || 0}</td>
            <td>${team.wins || 0}</td>
            <td>${team.draws || 0}</td>
            <td>${team.losses || 0}</td>
            <td>${gf}-${ga}</td>
            <td><strong>${team.points}</strong></td>
        </tr>`;
    }).join('');

    return `
        <div class="vg-standings-card">
            <div class="vg-stand-header">
                <span class="vg-stand-title">Ranglijst</span>
                <span class="vg-stand-sub">${divName} — Seizoen ${gameState.season}</span>
            </div>
            <table class="vg-stand-table">
                <thead><tr><th>#</th><th>Club</th><th>GW</th><th>W</th><th>G</th><th>V</th><th>DS</th><th>P</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

function renderVoortgang() {
    const container = document.getElementById('voortgang-content');
    if (!container) return;

    // --- Manager XP ---
    const managerXP = gameState.manager?.xp || 0;
    const mLevel = getManagerLevel(managerXP);
    const nextManagerLevel = MANAGER_LEVELS.find(l => l.xpRequired > managerXP);
    const nextCashReward = nextManagerLevel?.cashReward || 0;

    // XP bar calc
    const currentIdx = MANAGER_LEVELS.findIndex((l, i) => i + 1 < MANAGER_LEVELS.length ? managerXP < MANAGER_LEVELS[i + 1].xpRequired : true);
    const currentLvl = MANAGER_LEVELS[currentIdx];
    const next = MANAGER_LEVELS[currentIdx + 1];
    const barStart = currentLvl.xpRequired;
    const barEnd = next ? next.xpRequired : barStart;
    const barRange = barEnd - barStart;
    const fillPct = barRange > 0 ? Math.min(100, ((managerXP - barStart) / barRange) * 100) : 100;

    // --- Carriere stats ---
    const clubStats = gameState.club?.stats || {};
    const cStats = gameState.stats || {};
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];
    const highestDiv = divisionNames[clubStats.highestDivision || 8] || '6e Klasse';

    // Manager XP rewards
    const hideFromXP = ['youthGraduate', 'playerSold', 'stadiumUpgrade', 'achievementUnlocked'];
    const mRewards = Object.entries(XP_REWARDS).filter(([k]) => !hideFromXP.includes(k)).map(([k, v]) => {
        const labels = { matchWin: 'Winst', matchDraw: 'Gelijk', cleanSheet: 'Clean sheet', goalScored: 'Doelpunt', promotion: 'Promotie', title: 'Titel' };
        return `<span class="vg-xp-tag">${labels[k] || k} +${v}</span>`;
    }).join('');

    const nextLevelNum = next ? next.level : mLevel.level;
    const xpText = next ? `${managerXP} / ${next.xpRequired} XP` : `${managerXP} XP — Max!`;
    const rewardText = nextCashReward > 0 ? `+\u20AC${nextCashReward.toLocaleString('nl-NL')}` : '';

    const nextTitle = next ? next.title : 'Max';
    const mp = initMyPlayer();

    container.innerHTML = `
        <div class="vg-manager-compact">
            <div class="vg-mc-hero">
                <div class="vg-mc-avatar">
                    <svg viewBox="0 0 80 100">
                        <ellipse cx="40" cy="28" rx="18" ry="19" fill="#f5d0c5"/>
                        <ellipse cx="40" cy="14" rx="17" ry="10" fill="#2c2c2c"/>
                        <circle cx="33" cy="26" r="2.5" fill="white"/>
                        <circle cx="47" cy="26" r="2.5" fill="white"/>
                        <circle cx="33.5" cy="26.5" r="1.2" fill="#333"/>
                        <circle cx="47.5" cy="26.5" r="1.2" fill="#333"/>
                        <path d="M36 35 Q40 38 44 35" fill="none" stroke="#a0522d" stroke-width="1.2"/>
                        <path d="M15 95 Q15 65 25 58 L40 55 L55 58 Q65 65 65 95 L65 100 L15 100 Z" fill="#2c2c2c"/>
                        <path d="M35 55 L40 55 L45 55 L43 75 L37 75 Z" fill="#333"/>
                        <path d="M37 55 L40 60 L43 55" fill="none" stroke="#ff9800" stroke-width="1.5"/>
                        <rect x="22" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                        <rect x="42" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                    </svg>
                </div>
                <div class="vg-mc-info">
                    <h4 class="vg-mc-title">${mp.name || 'Trainer'}</h4>
                    <div class="vg-mc-level">${mLevel.title}</div>
                </div>
            </div>
        </div>
        <div class="txp-bar-card txp-manager">
            <div class="txp-row">
                <div class="txp-lvl current">
                    <span class="txp-lvl-num">${mLevel.level}</span>
                    <span class="txp-lvl-lbl">${mLevel.title}</span>
                </div>
                <div class="txp-track">
                    <div class="txp-fill" style="width: ${fillPct}%">
                        <div class="txp-shimmer"></div>
                    </div>
                    <span class="txp-text">${xpText}${rewardText ? '  ' + rewardText : ''}</span>
                </div>
                <div class="txp-lvl next">
                    <span class="txp-lvl-num">${nextLevelNum}</span>
                    <span class="txp-lvl-lbl">${nextTitle}</span>
                </div>
            </div>
        </div>
        <div class="vg-mgr-columns">
            <div class="vg-mgr-col-left">
                ${renderClubDNA(divisionNames)}
            </div>
            <div class="vg-mgr-col-right">
                ${renderStatsAndRecords(cStats, clubStats, highestDiv)}
            </div>
        </div>
    `;
}

// Skill point spending
window.spendSkillPoint = function(attr) {
    const mp = initMyPlayer();
    const pLevel = getPlayerLevel(mp.xp || 0);
    const availablePoints = Math.max(0, pLevel.skillPoints - (mp.spentSkillPoints || 0));

    if (availablePoints <= 0) return;
    if ((mp.attributes[attr] || 0) >= 99) return;

    mp.attributes[attr]++;
    mp.spentSkillPoints = (mp.spentSkillPoints || 0) + 1;

    saveGame(gameState);
    renderTrainingPage();
};

// ================================================
// PRESTATIES TAB — Speler + Manager achievements naast elkaar
// ================================================

function renderPrestaties() {
    const container = document.getElementById('prestaties-content');
    if (!container) return;

    const allAch = getAllAchievements(gameState);

    // Manager achievements only
    const mgrCats = [CATEGORIES.CLUB, CATEGORIES.PLAYERS, CATEGORIES.STADIUM];
    const mgrAch = renderAchievementCards(allAch, mgrCats);

    container.innerHTML = `
        <div class="prs-single">
            <h4 class="mp-section-title">Managersprestaties <span class="ach-progress-text">${mgrAch.stats.unlocked} / ${mgrAch.stats.total}</span></h4>
            <div class="ach-progress">
                <div class="ach-progress-bar">
                    <div class="ach-progress-fill" style="width: ${mgrAch.progressPct}%"></div>
                </div>
            </div>
            <div class="ach-filters" id="manager-ach-filters">
                <button class="ach-filter-btn active" data-ach-cat="all">Alles</button>
                ${mgrAch.filterBtns}
            </div>
            <div class="ach-grid" id="manager-ach-grid">
                ${mgrAch.renderCards(null)}
            </div>
        </div>
    `;

    // Manager filter handlers
    container.querySelectorAll('#manager-ach-filters .ach-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('#manager-ach-filters .ach-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.achCat;
            const grid = document.getElementById('manager-ach-grid');
            if (grid) grid.innerHTML = mgrAch.renderCards(cat === 'all' ? null : cat);
        });
    });
}

// ================================================
// TACTICS PAGE RENDERING
// ================================================

function renderTacticsPage() {
    renderFormationDropdown();
    renderLineupPitch();
    renderAvailablePlayers();
    updateLineupFit();
    renderTacticsOptions();
    populateSpecialistSelects();
    renderTeamTraining();
}

function getFormationDrive(key) {
    if (!gameState.formationDrives) gameState.formationDrives = {};
    return Math.min(100, Math.round(gameState.formationDrives[key] || 0));
}

function renderFormationDropdown() {
    const select = document.getElementById('formation-select');
    if (!select) return;

    // Sort formations by bedrevenheid descending, then alphabetically
    const sortedFormations = Object.entries(FORMATIONS).sort((a, b) => {
        const driveA = getFormationDrive(a[0]);
        const driveB = getFormationDrive(b[0]);
        if (driveB !== driveA) return driveB - driveA;
        return a[0].localeCompare(b[0]);
    });

    let html = '';
    for (const [key] of sortedFormations) {
        const selected = gameState.formation === key ? 'selected' : '';
        const drive = getFormationDrive(key);
        const driveLabel = drive > 0 ? `  —  ${drive}%` : '  —  Nieuw';
        html += `<option value="${key}" ${selected}>${key}${driveLabel}</option>`;
    }
    select.innerHTML = html;

    // Add change handler
    select.onchange = (e) => {
        const oldFormation = gameState.formation;
        const newFormation = e.target.value;

        // Preserve players when changing formation
        const oldLineup = [...gameState.lineup];
        const oldPositions = FORMATIONS[oldFormation]?.positions || [];
        const newPositions = FORMATIONS[newFormation]?.positions || [];

        // Create new lineup array
        const newLineup = new Array(11).fill(null);

        // Map old players to new formation positions by role
        const usedPlayers = new Set();

        // First pass: match exact roles
        newPositions.forEach((newPos, newIndex) => {
            // Find a player from old lineup with matching role
            for (let oldIndex = 0; oldIndex < 11; oldIndex++) {
                const player = oldLineup[oldIndex];
                if (!player || usedPlayers.has(player.id)) continue;

                const oldRole = oldPositions[oldIndex]?.role;
                if (oldRole === newPos.role) {
                    newLineup[newIndex] = player;
                    usedPlayers.add(player.id);
                    break;
                }
            }
        });

        // Second pass: fill remaining spots with unplaced players (same position type)
        newPositions.forEach((newPos, newIndex) => {
            if (newLineup[newIndex]) return; // Already filled

            // Find any unplaced player that can play this position
            for (let oldIndex = 0; oldIndex < 11; oldIndex++) {
                const player = oldLineup[oldIndex];
                if (!player || usedPlayers.has(player.id)) continue;

                // Check if player's natural position matches the new role's position type
                const playerPosType = getPositionType(player.position);
                const roleType = getRoleType(newPos.role);

                if (playerPosType === roleType) {
                    newLineup[newIndex] = player;
                    usedPlayers.add(player.id);
                    break;
                }
            }
        });

        gameState.formation = newFormation;
        gameState.lineup = newLineup;
        renderLineupPitch();
        renderAvailablePlayers();
        updateLineupFit();
        updateFormationDrive();
    };

    updateFormationDrive();
}

function updateFormationDrive() {
    const el = document.getElementById('formation-drive');
    if (!el) return;
    const pct = getFormationDrive(gameState.formation);
    const tip = pct < 80 ? ' — Speel meer wedstrijden in deze formatie om beter in te spelen' : '';
    el.innerHTML = `Bedrevenheid: <strong>${pct}%</strong>${tip}`;
    el.style.color = pct >= 80 ? 'var(--accent-green-dim)' : pct > 0 ? 'var(--text-secondary)' : 'var(--text-muted)';
}

// Helper to get position type (keeper, defense, midfield, attack)
function getPositionType(position) {
    if (position === 'keeper') return 'keeper';
    if (['centraleVerdediger', 'linksback', 'rechtsback'].includes(position)) return 'defense';
    if (['centraleMid', 'aanvallendeMid', 'verdedigendeMid', 'linksbuiten', 'rechtsbuiten'].includes(position)) return 'midfield';
    if (['spits', 'schaduwspits'].includes(position)) return 'attack';
    return 'midfield';
}

// Helper to get role type
function getRoleType(role) {
    if (role === 'keeper') return 'keeper';
    if (['centraleVerdediger', 'linksback', 'rechtsback'].includes(role)) return 'defense';
    if (['centraleMid', 'aanvallendeMid', 'verdedigendeMid', 'linksbuiten', 'rechtsbuiten'].includes(role)) return 'midfield';
    if (['spits', 'schaduwspits'].includes(role)) return 'attack';
    return 'midfield';
}

// Calculate chemistry bonuses based on nationality
function calculateChemistryBonuses() {
    const formation = FORMATIONS[gameState.formation];
    if (!formation) return {};

    const bonuses = {};
    const adjacencyThreshold = 30; // Distance threshold for adjacency (in %)

    // For each player in lineup, check if surrounded by same nationality
    formation.positions.forEach((pos, index) => {
        const player = gameState.lineup[index];
        if (!player) return;

        // Find adjacent positions
        const adjacentPlayers = [];
        formation.positions.forEach((otherPos, otherIndex) => {
            if (index === otherIndex) return;
            const otherPlayer = gameState.lineup[otherIndex];
            if (!otherPlayer) return;

            // Calculate distance
            const dx = pos.x - otherPos.x;
            const dy = pos.y - otherPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= adjacencyThreshold) {
                adjacentPlayers.push(otherPlayer);
            }
        });

        // Check if all adjacent players have same nationality
        if (adjacentPlayers.length > 0) {
            const allSameNationality = adjacentPlayers.every(ap => ap.nationality === player.nationality);
            if (allSameNationality) {
                bonuses[player.id] = 1; // +1 overall bonus
            }
        }
    });

    return bonuses;
}

function renderLineupPitch() {
    const container = document.getElementById('lineup-pitch');
    if (!container) return;

    const formation = FORMATIONS[gameState.formation];
    if (!formation) return;

    // Calculate chemistry bonuses
    const chemistryBonuses = calculateChemistryBonuses();

    let html = `
        <div class="pitch-field">
            <div class="pitch-lines">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area-top"></div>
                <div class="penalty-area-bottom"></div>
            </div>
    `;

    formation.positions.forEach((pos, index) => {
        const player = gameState.lineup[index];
        const posData = POSITIONS[pos.role];
        const slotColor = posData?.color || '#666';

        // Get nationality flag and chemistry bonus
        let nationalityFlag = '';
        let chemistryBonus = 0;
        let isWrongPosition = false;
        if (player) {
            const nat = NATIONALITIES.find(n => n.code === player.nationality);
            nationalityFlag = nat?.flag || '🏳️';
            chemistryBonus = chemistryBonuses[player.id] || 0;

            // Check if player is in wrong position
            const playerGroup = getPositionGroup(player.position);
            const slotGroup = getPositionGroup(pos.role);
            isWrongPosition = playerGroup !== slotGroup;
        }

        // Transform coordinates for horizontal/landscape pitch:
        // Original: x = horizontal (0=left, 100=right), y = vertical (0=top/attack, 100=bottom/goal)
        // Landscape: Rotate 90° so goal is on left, attack on right
        const landscapeLeft = 100 - pos.y;
        const landscapeTop = pos.x;

        html += `
            <div class="lineup-slot ${player ? 'filled' : 'empty'}"
                 style="left: ${landscapeLeft}%; top: ${landscapeTop}%;"
                 data-slot-index="${index}"
                 data-role="${pos.role}">
                ${player ? `
                    <div class="lineup-player ${chemistryBonus > 0 ? 'has-chemistry' : ''} ${isWrongPosition ? 'wrong-position' : ''}"
                         draggable="true"
                         data-player-id="${player.id}"
                         style="background: ${POSITIONS[player.position]?.color || slotColor}">
                        <span class="lp-flag">${nationalityFlag}</span>
                        <span class="lp-overall">${player.overall + chemistryBonus}${chemistryBonus > 0 ? '<span class="chemistry-boost">+' + chemistryBonus + '</span>' : ''}</span>
                        <span class="lp-name">${player.name.split(' ')[0]}</span>
                        <span class="lp-position">${POSITIONS[player.position]?.abbr || player.position}</span>
                    </div>
                ` : `
                    <div class="lineup-empty-slot" style="border-color: ${slotColor}">
                        <span class="slot-pos">${posData?.abbr || pos.role}</span>
                    </div>
                `}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Add drag & drop handlers
    initLineupDragDrop();
}

function renderAvailablePlayers() {
    const container = document.getElementById('lineup-available-players');
    if (!container) return;

    const lineupIds = gameState.lineup.filter(p => p).map(p => p.id);
    const available = gameState.players.filter(p => !lineupIds.includes(p.id));

    const groups = {
        attacker: { name: 'Aanvallers', icon: '⚽', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', players: [] }
    };

    available.forEach(player => {
        const group = getPositionGroup(player.position);
        if (groups[group]) groups[group].players.push(player);
    });

    // Sort by overall
    Object.values(groups).forEach(g => g.players.sort((a, b) => b.overall - a.overall));

    let html = '';
    for (const [key, group] of Object.entries(groups)) {
        if (group.players.length === 0) continue;

        html += `
            <div class="player-group">
                <div class="player-group-header">${group.icon} ${group.name}</div>
                <div class="player-group-list">
        `;

        group.players.forEach(player => {
            const posData = POSITIONS[player.position];
            html += `
                <div class="available-player"
                     draggable="true"
                     data-player-id="${player.id}">
                    <span class="ap-overall" style="background: ${posData?.color || '#666'}">${player.overall}</span>
                    <span class="ap-name">${player.name}</span>
                    <span class="ap-age">${player.age}j</span>
                    <span class="ap-pos">${posData?.abbr || '??'}</span>
                </div>
            `;
        });

        html += '</div></div>';
    }

    container.innerHTML = html;

    // Add drag handlers to available players
    document.querySelectorAll('.available-player').forEach(el => {
        el.addEventListener('dragstart', handleAvailablePlayerDragStart);
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
        });
    });
}

function updateLineupFit() {
    // Removed — team samenhang is no longer tracked
}

// Drag & Drop for lineup
let lineupDragData = { player: null, fromSlot: null };

function initLineupDragDrop() {
    // Slots can receive drops
    document.querySelectorAll('.lineup-slot').forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const slotIndex = parseInt(slot.dataset.slotIndex);
            handleLineupDrop(slotIndex);
        });
    });

    // Existing players in lineup can be dragged
    document.querySelectorAll('.lineup-player').forEach(el => {
        el.addEventListener('dragstart', (e) => {
            const playerId = parsePlayerId(el.dataset.playerId);
            const slotIndex = parseInt(el.closest('.lineup-slot').dataset.slotIndex);
            lineupDragData = {
                player: gameState.players.find(p => p.id === playerId),
                fromSlot: slotIndex
            };
            el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
        });
    });

    // Available players panel can receive drops to remove players from lineup
    const availablePanel = document.getElementById('lineup-available-players');
    if (availablePanel) {
        availablePanel.addEventListener('dragover', (e) => {
            e.preventDefault();
            availablePanel.classList.add('drop-remove-zone');
        });

        availablePanel.addEventListener('dragleave', (e) => {
            if (!availablePanel.contains(e.relatedTarget)) {
                availablePanel.classList.remove('drop-remove-zone');
            }
        });

        availablePanel.addEventListener('drop', (e) => {
            e.preventDefault();
            availablePanel.classList.remove('drop-remove-zone');

            // If dropping a lineup player, remove them from lineup
            if (lineupDragData && lineupDragData.fromSlot !== undefined) {
                gameState.lineup[lineupDragData.fromSlot] = null;
                lineupDragData = null;
                renderLineupPitch();
                renderAvailablePlayers();
                updateLineupFit();
            }
        });
    }
}

function parsePlayerId(raw) {
    const num = parseFloat(raw);
    return isNaN(num) ? raw : num;
}

function handleAvailablePlayerDragStart(e) {
    const playerId = parsePlayerId(e.target.dataset.playerId);
    const player = gameState.players.find(p => p.id === playerId);
    lineupDragData = {
        player: player,
        fromSlot: null
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', playerId.toString());
    e.target.classList.add('dragging');
}

function handleLineupDrop(targetSlotIndex) {
    if (!lineupDragData.player) return;

    const existingPlayer = gameState.lineup[targetSlotIndex];

    // Place dragged player in target slot
    gameState.lineup[targetSlotIndex] = lineupDragData.player;

    // If swapping from another slot, put the existing player there
    if (lineupDragData.fromSlot !== null && existingPlayer) {
        gameState.lineup[lineupDragData.fromSlot] = existingPlayer;
    } else if (lineupDragData.fromSlot !== null) {
        gameState.lineup[lineupDragData.fromSlot] = null;
    }

    lineupDragData = { player: null, fromSlot: null };

    renderLineupPitch();
    renderAvailablePlayers();
    updateLineupFit();
}

function renderTacticsOptions() {
    const container = document.getElementById('tactics-options-grid');
    if (!container) return;

    const categoryLabels = {
        mentaliteit: 'Mentaliteit',
        offensief: 'Offensief',
        speltempo: 'Speltempo',
        veldbreedte: 'Veldbreedte',
        dekking: 'Dekking'
    };

    const categoryInfo = {
        mentaliteit: 'Hoe agressief je speelt. Harder = meer kaarten en blessures. Kaarten kosten boetes.',
        offensief: 'Balans aanval/verdediging. Meer aanval = meer kansen, maar kwetsbaarder achterop. Aanvallender spelen levert meer fans op!',
        speltempo: 'Rustig = meer controle, minder stamina-verlies. Snel = meer verrassingen, sneller moe.',
        veldbreedte: 'Smal = sterker door het midden. Breed = meer dreiging over de vleugels.',
        dekking: 'Man-dekking = hoge pressing, maar kwetsbaar voor counters. Zone = stabieler, minder druk.'
    };

    let html = '';
    for (const [category, options] of Object.entries(TACTICS)) {
        html += `<div class="tactic-category-row">`;
        html += `<div class="tactic-label-wrap"><span class="tactic-category-label tactic-label--${category}">${categoryLabels[category] || category}</span>`;
        html += `<button class="tactic-info-btn" data-info-category="${category}">?</button></div>`;
        html += `<div class="tactic-button-group">`;

        options.forEach((option, idx) => {
            const isActive = gameState.tactics[category] === option.id ? 'active' : '';
            html += `<button class="tactic-btn tactic-btn--${category}-${idx} ${isActive}" data-category="${category}" data-option="${option.id}">${option.name}</button>`;
        });

        html += `</div>`;
        html += `<div class="tactic-info-text" id="tactic-info-${category}">${categoryInfo[category] || ''}</div>`;
        html += `</div>`;
    }

    container.innerHTML = html;

    // Add click handlers for tactic buttons
    container.querySelectorAll('.tactic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const option = btn.dataset.option;

            // Remove active from siblings
            btn.closest('.tactic-button-group').querySelectorAll('.tactic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            gameState.tactics[category] = option;
            saveGame();
        });
    });

    // Add click handlers for info buttons
    container.querySelectorAll('.tactic-info-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.infoCategory;
            const infoEl = document.getElementById(`tactic-info-${cat}`);
            if (infoEl) infoEl.classList.toggle('show');
        });
    });
}

function renderPitch() {
    const container = document.getElementById('formation-positions');
    if (!container) return;

    const formation = FORMATIONS[gameState.formation];
    const bonuses = calculateNationalityBonus(gameState.lineup, gameState.formation);

    // Calculate nationality connections for SVG lines
    const nationalityLines = [];
    for (let i = 0; i < 11; i++) {
        const playerA = gameState.lineup[i];
        if (!playerA) continue;

        for (let j = i + 1; j < 11; j++) {
            const playerB = gameState.lineup[j];
            if (!playerB) continue;

            // Check if same nationality
            if (playerA.nationality.code === playerB.nationality.code) {
                const posA = formation.positions[i];
                const posB = formation.positions[j];

                // Check if adjacent (within 30 units)
                const distance = Math.sqrt(
                    Math.pow(posA.x - posB.x, 2) +
                    Math.pow(posA.y - posB.y, 2)
                );

                if (distance < 30) {
                    nationalityLines.push({
                        x1: posA.x,
                        y1: posA.y,
                        x2: posB.x,
                        y2: posB.y,
                        flag: playerA.nationality.flag
                    });
                }
            }
        }
    }

    // Create SVG for nationality lines
    let html = `
        <svg class="nationality-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
                </linearGradient>
            </defs>
    `;

    nationalityLines.forEach(line => {
        html += `
            <line class="nationality-line"
                  x1="${line.x1}" y1="${line.y1}"
                  x2="${line.x2}" y2="${line.y2}"
                  stroke="url(#lineGradient)"
                  stroke-width="0.8"
                  stroke-linecap="round"
                  stroke-dasharray="2,1" />
        `;
    });

    html += '</svg>';

    // Render player slots
    formation.positions.forEach((pos, index) => {
        const player = gameState.lineup[index];
        const bonus = player ? bonuses.find(b => b.playerId === player.id) : null;

        let bonusClass = '';
        let bonusIndicator = '';

        if (player) {
            const posFit = bonus?.positionFit || 0;
            const natBonus = bonus?.nationalityBonus || 0;

            // Show both penalties and bonuses
            if (posFit < 50) {
                bonusClass = 'penalty';
                bonusIndicator = '<span class="position-penalty">-1</span>';
            }

            if (natBonus > 0) {
                bonusClass += ' has-nationality-bonus';
                bonusIndicator += `<span class="position-bonus">+${natBonus}</span>`;
            }
        }

        const filled = player ? 'filled' : '';
        const posColor = POSITIONS[pos.role].color;

        html += `
            <div class="position-slot ${filled} ${bonusClass}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 data-index="${index}"
                 data-role="${pos.role}"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, ${index})">
                <div class="bonus-indicators">${bonusIndicator}</div>
                <div class="position-marker ${player ? 'has-player' : ''}"
                     style="background: ${player ? posColor : 'rgba(255,255,255,0.3)'}"
                     draggable="${player ? 'true' : 'false'}"
                     ondragstart="handleDragStart(event, ${index}, false)">
                    ${player ? `
                        <span class="player-overall-badge">${player.overall}</span>
                        <span class="player-name-field">${player.name.split(' ')[0]}</span>
                    ` : `
                        <span class="position-label">${pos.name}</span>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderTacticsBench() {
    const container = document.getElementById('tactics-bench');
    if (!container) return;

    const lineupIds = gameState.lineup.filter(p => p).map(p => p.id);
    const benchPlayers = gameState.players.filter(p => !lineupIds.includes(p.id));

    // Group by position groups
    const groups = {
        attacker: { name: 'Aanvallers', color: '#9c27b0', players: benchPlayers.filter(p => getPositionGroup(p.position) === 'attacker') },
        midfielder: { name: 'Middenvelders', color: '#4caf50', players: benchPlayers.filter(p => getPositionGroup(p.position) === 'midfielder') },
        defender: { name: 'Verdedigers', color: '#2196f3', players: benchPlayers.filter(p => getPositionGroup(p.position) === 'defender') },
        goalkeeper: { name: 'Keepers', color: '#f9a825', players: benchPlayers.filter(p => getPositionGroup(p.position) === 'goalkeeper') }
    };

    let html = '';

    for (const [groupKey, group] of Object.entries(groups)) {
        if (group.players.length === 0) continue;

        html += `
            <div class="bench-group">
                <h4 style="color: ${group.color}">${group.name}</h4>
                <div class="bench-players-row">
        `;

        group.players.forEach(player => {
            const posData = POSITIONS[player.position];
            html += `
                <div class="bench-player"
                     data-player-id="${player.id}"
                     draggable="true"
                     ondragstart="handleBenchDragStart(event, ${player.id})">
                    <span class="bench-overall" style="background: ${posData.color}">${player.overall}</span>
                    <span class="bench-flag">${player.nationality.flag}</span>
                    <span class="bench-name">${player.name.split(' ')[0]}</span>
                    <span class="bench-pos">${posData.abbr}</span>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;
}

function updateTacticsFitDisplay() {
    const fitScore = calculateTacticsFit();
    const fitFill = document.querySelector('.fit-fill');
    const fitScoreEl = document.querySelector('.fit-score');
    const fitBonusEl = document.querySelector('.fit-bonus');

    if (fitFill) fitFill.style.width = `${fitScore}%`;
    if (fitScoreEl) fitScoreEl.textContent = `${fitScore}%`;

    if (fitBonusEl) {
        if (fitScore >= 90) {
            fitBonusEl.textContent = '+15% Team Prestatie';
            fitBonusEl.className = 'fit-bonus excellent';
        } else if (fitScore >= 80) {
            fitBonusEl.textContent = '+10% Team Prestatie';
            fitBonusEl.className = 'fit-bonus good';
        } else if (fitScore >= 70) {
            fitBonusEl.textContent = '+5% Team Prestatie';
            fitBonusEl.className = 'fit-bonus ok';
        } else if (fitScore >= 60) {
            fitBonusEl.textContent = 'Geen bonus';
            fitBonusEl.className = 'fit-bonus neutral';
        } else {
            fitBonusEl.textContent = `${fitScore >= 50 ? '-5%' : fitScore >= 40 ? '-10%' : '-15%'} Team Prestatie`;
            fitBonusEl.className = 'fit-bonus bad';
        }
    }
}

// Drag and Drop handlers
window.handleDragStart = function(e, index, isFromBench) {
    dragState.sourceIndex = index;
    dragState.isFromBench = isFromBench;
    dragState.player = isFromBench ? null : gameState.lineup[index];
    e.dataTransfer.effectAllowed = 'move';
};

window.handleBenchDragStart = function(e, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    dragState.player = player;
    dragState.isFromBench = true;
    dragState.sourceIndex = null;
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag preview (square card)
    let dragPreview = document.getElementById('drag-preview');
    if (!dragPreview) {
        dragPreview = document.createElement('div');
        dragPreview.id = 'drag-preview';
        dragPreview.className = 'drag-preview';
        document.body.appendChild(dragPreview);
    }

    const posData = POSITIONS[player.position];
    dragPreview.innerHTML = `
        <div class="dp-overall" style="background: ${posData?.color || '#666'}">${player.overall}</div>
        <div class="dp-name">${player.name.split(' ')[0]}</div>
    `;

    // Set as drag image with offset to center it
    e.dataTransfer.setDragImage(dragPreview, 30, 30);
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

window.handleDrop = function(e, targetIndex) {
    e.preventDefault();

    if (dragState.isFromBench && dragState.player) {
        // Moving from bench to pitch
        const existingPlayer = gameState.lineup[targetIndex];

        // Put existing player back on bench (just remove from lineup)
        gameState.lineup[targetIndex] = dragState.player;
    } else if (!dragState.isFromBench && dragState.sourceIndex !== null) {
        // Swapping positions on pitch
        const temp = gameState.lineup[targetIndex];
        gameState.lineup[targetIndex] = gameState.lineup[dragState.sourceIndex];
        gameState.lineup[dragState.sourceIndex] = temp;
    }

    // Reset drag state
    resetDragState();

    // Re-render
    renderPitch();
    renderTacticsBench();
    updateTacticsFitDisplay();
};

// ================================================
// STADIUM PAGE RENDERING
// ================================================

function renderStadiumPage() {
    renderStadiumMap();
}

function renderTierList() {
    const container = document.getElementById('tier-list-container');
    if (!container) return;

    const currentCapacity = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune)?.capacity || 200;

    const tiers = [
        { name: 'Kelderklasse', minCap: 0, maxCap: 500, color: '#8b6914', icon: '⚽', facilities: ['Horeca', 'Parking', 'Training'] },
        { name: 'Amateur', minCap: 500, maxCap: 2000, color: '#4ade80', icon: '🥉', facilities: ['Medical', 'Fanshop', 'Kantine'] },
        { name: 'Semi-Pro', minCap: 2000, maxCap: 10000, color: '#60a5fa', icon: '🥈', facilities: ['VIP', 'Verlichting', 'Jeugd', 'Perszaal'] },
        { name: 'Professioneel', minCap: 10000, maxCap: 35000, color: '#a855f7', icon: '🥇', facilities: ['Sponsoring', 'Hotel', 'Elite Training'] },
        { name: 'Elite', minCap: 35000, maxCap: 999999, color: '#f59e0b', icon: '🏆', facilities: ['Wereldklasse Alles'] }
    ];

    let html = '<h3>🏆 Capaciteit Niveaus</h3><div class="tier-list">';

    tiers.forEach((tier, index) => {
        const isCurrentTier = currentCapacity >= tier.minCap && currentCapacity < tier.maxCap;
        const isUnlocked = currentCapacity >= tier.minCap;
        const progress = isCurrentTier ?
            Math.min(100, ((currentCapacity - tier.minCap) / (tier.maxCap - tier.minCap)) * 100) :
            (isUnlocked ? 100 : 0);

        html += `
            <div class="tier-item ${isCurrentTier ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="tier-header" style="border-left: 4px solid ${tier.color}">
                    <span class="tier-icon">${tier.icon}</span>
                    <div class="tier-info">
                        <span class="tier-name">${tier.name}</span>
                        <span class="tier-range">${tier.minCap.toLocaleString()} - ${tier.maxCap < 999999 ? tier.maxCap.toLocaleString() : '∞'} cap</span>
                    </div>
                    ${isCurrentTier ? '<span class="tier-badge">Huidig</span>' : ''}
                </div>
                <div class="tier-progress-bar">
                    <div class="tier-progress-fill" style="width: ${progress}%; background: ${tier.color}"></div>
                </div>
                <div class="tier-facilities">
                    ${tier.facilities.map(f => `<span class="tier-facility ${isUnlocked ? '' : 'locked'}">${f}</span>`).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function renderStadiumVisual() {
    const capacityEl = document.querySelector('.capacity-number');
    if (capacityEl) {
        const tribune = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune);
        capacityEl.textContent = tribune?.capacity || 200;
    }
}

function renderStadiumBirdseye() {
    const container = document.getElementById('stadium-birdseye');
    if (!container) return;

    const isBuilt = (key) => {
        if (key === 'grass') return gameState.stadium.grass && gameState.stadium.grass !== 'grass_0';
        const val = gameState.stadium[key];
        if (Array.isArray(val)) return val.length > 0;
        const upgrade = STADIUM_UPGRADES[key]?.find(u => u.id === val);
        return upgrade && upgrade.cost > 0;
    };

    const tribune = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune) || { capacity: 200 };

    // Isometric SVG stadium view
    let svg = `
    <svg viewBox="0 0 500 350" class="stadium-svg isometric" preserveAspectRatio="xMidYMid meet">
        <defs>
            <!-- Isometric grass pattern -->
            <pattern id="isoGrass1" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="skewY(-30)">
                <rect width="15" height="30" fill="#3d9e4f"/>
                <rect x="15" width="15" height="30" fill="#35913f"/>
            </pattern>
            <pattern id="isoGrass2" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="#2d7a35"/>
            </pattern>
        </defs>

        <!-- Ground/surrounding area -->
        <rect x="0" y="0" width="500" height="350" fill="#4a5568"/>

        <!-- Isometric football pitch -->
        <g transform="translate(250, 80)">
            <!-- Pitch base (isometric diamond) -->
            <polygon points="0,0 180,90 0,180 -180,90" fill="#3d9e4f" stroke="#2d7a35" stroke-width="2"/>

            <!-- Grass stripes -->
            <g opacity="0.3">
                <polygon points="-150,75 -120,60 -120,120 -150,105" fill="#2d7a35"/>
                <polygon points="-90,45 -60,30 -60,150 -90,135" fill="#2d7a35"/>
                <polygon points="-30,15 0,0 0,180 -30,165" fill="#2d7a35"/>
                <polygon points="30,15 60,30 60,150 30,165" fill="#2d7a35"/>
                <polygon points="90,45 120,60 120,120 90,135" fill="#2d7a35"/>
            </g>

            <!-- Pitch lines -->
            <g fill="none" stroke="white" stroke-width="1.5" opacity="0.9">
                <!-- Outline -->
                <polygon points="0,8 172,85 0,172 -172,85"/>

                <!-- Center line -->
                <line x1="-172,85" x2="172,85" y1="0" y2="0" transform="translate(0,90)"/>
                <line x1="-86" y1="47" x2="86" y2="133"/>

                <!-- Center circle -->
                <ellipse cx="0" cy="90" rx="35" ry="17.5"/>

                <!-- Center spot -->
                <circle cx="0" cy="90" r="2" fill="white"/>

                <!-- Left penalty area -->
                <polygon points="-172,55 -120,30 -120,150 -172,125"/>

                <!-- Right penalty area -->
                <polygon points="172,55 120,30 120,150 172,125"/>

                <!-- Goals (isometric) -->
                <g transform="translate(-178, 90)">
                    <rect x="-8" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
                <g transform="translate(178, 90)">
                    <rect x="0" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
            </g>
        </g>

        <!-- Main tribune (isometric) -->
        ${renderIsometricTribune(tribune.capacity)}

        <!-- Dugouts (isometric benches) -->
        <g transform="translate(200, 255)">
            <!-- Home dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>
        <g transform="translate(270, 255)">
            <!-- Away dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>

        <!-- Facility buildings (isometric) - only show if built -->
        ${renderIsometricFacilities(isBuilt)}
    </svg>`;

    container.innerHTML = svg;

    // Update capacity display
    const capacityEl = document.getElementById('stadium-capacity');
    if (capacityEl) capacityEl.textContent = tribune.capacity || 200;
}

function renderTribuneRows(capacity) {
    // Legacy function - kept for compatibility
    return '';
}

function renderIsometricTribune(capacity) {
    // Scale tribune based on capacity
    const rows = Math.min(6, Math.max(1, Math.ceil(capacity / 400)));
    const width = Math.min(200, Math.max(80, capacity / 25));
    let html = '<g transform="translate(250, 280)">';

    // Tribune base
    const baseWidth = width;
    const baseDepth = 20 + (rows * 8);

    for (let i = 0; i < rows; i++) {
        const rowY = -i * 6;
        const rowWidth = baseWidth - (i * 6);
        const halfW = rowWidth / 2;

        // Seat row (isometric)
        html += `
            <g transform="translate(0, ${rowY})">
                <!-- Top face -->
                <polygon points="${-halfW},0 0,${-halfW/2} ${halfW},0 0,${halfW/2}"
                         fill="${i % 2 === 0 ? '#ef5350' : '#e53935'}"/>
                <!-- Front face -->
                <polygon points="${-halfW},0 ${-halfW},5 0,${halfW/2 + 5} 0,${halfW/2}"
                         fill="#c62828"/>
                <!-- Side face -->
                <polygon points="${halfW},0 ${halfW},5 0,${halfW/2 + 5} 0,${halfW/2}"
                         fill="#b71c1c"/>
            </g>
        `;
    }

    // Roof structure for larger tribunes (capacity > 1000)
    if (capacity > 1000) {
        const roofY = -rows * 6 - 15;
        html += `
            <g transform="translate(0, ${roofY})">
                <!-- Roof supports -->
                <line x1="${-width/2 + 10}" y1="${width/4}" x2="${-width/2 + 10}" y2="${width/4 + 30}" stroke="#424242" stroke-width="3"/>
                <line x1="${width/2 - 10}" y1="${-width/4}" x2="${width/2 - 10}" y2="${-width/4 + 30}" stroke="#424242" stroke-width="3"/>
                <!-- Roof -->
                <polygon points="${-width/2},5 0,${-width/4} ${width/2},5 0,${width/4 + 5}"
                         fill="#546e7a" opacity="0.9"/>
            </g>
        `;
    }

    html += '</g>';
    return html;
}

function renderIsometricFacilities(isBuilt) {
    // Facility definitions with isometric building styles
    const facilities = {
        // Left side of pitch
        training: { x: 50, y: 120, color: '#4caf50', roofColor: '#388e3c', label: '⚽', height: 20 },
        medical: { x: 50, y: 180, color: '#f44336', roofColor: '#d32f2f', label: '🏥', height: 18 },
        academy: { x: 50, y: 240, color: '#2196f3', roofColor: '#1976d2', label: '🎓', height: 25 },

        // Right side of pitch
        scouting: { x: 450, y: 120, color: '#673ab7', roofColor: '#512da8', label: '🔭', height: 18 },
        perszaal: { x: 450, y: 180, color: '#607d8b', roofColor: '#455a64', label: '📺', height: 22 },
        sponsoring: { x: 450, y: 240, color: '#ffc107', roofColor: '#ffa000', label: '💰', height: 20 },

        // Bottom row
        horeca: { x: 120, y: 320, color: '#ff5722', roofColor: '#e64a19', label: '🍟', height: 16, hasAwning: true },
        kantine: { x: 180, y: 320, color: '#795548', roofColor: '#5d4037', label: '🍺', height: 18 },
        fanshop: { x: 240, y: 320, color: '#00bcd4', roofColor: '#0097a7', label: '👕', height: 16 },
        vip: { x: 300, y: 320, color: '#9c27b0', roofColor: '#7b1fa2', label: '⭐', height: 24 },
        lighting: { x: 360, y: 320, color: '#78909c', roofColor: '#546e7a', label: '💡', height: 35, isTower: true },

        // Top corners
        parking: { x: 80, y: 50, color: '#455a64', roofColor: '#37474f', label: '🅿️', height: 8, isFlat: true },
        hotel: { x: 420, y: 50, color: '#8d6e63', roofColor: '#6d4c41', label: '🏨', height: 35 }
    };

    let html = '';

    Object.entries(facilities).forEach(([key, f]) => {
        if (!isBuilt(key)) return;

        const w = 28; // building width
        const d = 14; // building depth (isometric)
        const h = f.height;

        if (f.isTower) {
            // Light tower - tall and thin
            html += `
                <g transform="translate(${f.x}, ${f.y})" class="iso-facility" data-facility="${key}">
                    <!-- Tower base -->
                    <polygon points="0,0 8,4 8,${h + 4} 0,${h}" fill="#546e7a"/>
                    <polygon points="0,0 -8,4 -8,${h + 4} 0,${h}" fill="#78909c"/>
                    <!-- Light top -->
                    <ellipse cx="0" cy="-2" rx="6" ry="3" fill="#ffeb3b"/>
                    <ellipse cx="0" cy="-2" rx="3" ry="1.5" fill="#fff59d"/>
                    <!-- Label -->
                    <text x="0" y="${h + 18}" text-anchor="middle" font-size="10">${f.label}</text>
                </g>
            `;
        } else if (f.isFlat) {
            // Flat parking lot style
            html += `
                <g transform="translate(${f.x}, ${f.y})" class="iso-facility" data-facility="${key}">
                    <!-- Parking surface -->
                    <polygon points="0,0 ${w},${d} 0,${d*2} ${-w},${d}" fill="${f.color}"/>
                    <!-- Parking lines -->
                    <g stroke="white" stroke-width="1" opacity="0.5">
                        <line x1="${-w+8}" y1="${d}" x2="${w-8}" y2="${d}"/>
                        <line x1="${-w/2}" y1="${d/2}" x2="${-w/2}" y2="${d*1.5}"/>
                        <line x1="0" y1="0" x2="0" y2="${d*2}"/>
                        <line x1="${w/2}" y1="${d/2}" x2="${w/2}" y2="${d*1.5}"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${d*2 + 14}" text-anchor="middle" font-size="10">${f.label}</text>
                </g>
            `;
        } else {
            // Standard isometric building
            html += `
                <g transform="translate(${f.x}, ${f.y})" class="iso-facility" data-facility="${key}">
                    <!-- Building right face -->
                    <polygon points="0,0 ${w},${d} ${w},${d + h} 0,${h}" fill="${f.color}"/>
                    <!-- Building left face -->
                    <polygon points="0,0 ${-w},${d} ${-w},${d + h} 0,${h}" fill="${f.roofColor}"/>
                    <!-- Building top/roof -->
                    <polygon points="0,${-d} ${w},0 0,${d} ${-w},0" fill="${f.roofColor}" opacity="0.8"/>
                    ${f.hasAwning ? `
                        <!-- Awning -->
                        <polygon points="${-w-5},${d+h-8} 5,${h-8} 5,${h-5} ${-w-5},${d+h-5}"
                                 fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
                        <polygon points="${-w-5},${d+h-5} 5,${h-5} 5,${h-3} ${-w-5},${d+h-3}"
                                 fill="#ff8a65"/>
                    ` : ''}
                    <!-- Windows (simple) -->
                    <g fill="rgba(255,255,255,0.3)">
                        <rect x="${w/2 - 4}" y="${d + 4}" width="6" height="4" rx="0.5"/>
                        <rect x="${w/2 - 4}" y="${d + h/2}" width="6" height="4" rx="0.5"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${d + h + 14}" text-anchor="middle" font-size="10">${f.label}</text>
                </g>
            `;
        }
    });

    return html;
}

// Isometric facility rendering is now done in renderIsometricFacilities()
function renderFacilityEmojis(positions, isBuilt) {
    return ''; // Replaced by isometric rendering
}

function renderFacilitySVG(positions, isBuilt, isUnderConstruction) {
    return ''; // Replaced by isometric rendering
}

// Stadium category tabs configuration
const STADIUM_TAB_CATEGORIES = {
    veld: {
        name: 'Veld',
        keys: ['grass', 'lighting']
    },
    tribunes: {
        name: 'Tribunes',
        keys: ['tribunes', 'vip']
    },
    horeca: {
        name: 'Horeca',
        keys: ['horeca', 'kantine']
    },
    winkels: {
        name: 'Winkels',
        keys: ['fanshop']
    },
    training: {
        name: 'Training',
        keys: ['training', 'academy']
    },
    medisch: {
        name: 'Medisch',
        keys: ['medical']
    },
    scouting: {
        name: 'Scouting',
        keys: ['scouting']
    },
    commercieel: {
        name: 'Commercieel',
        keys: ['sponsoring', 'perszaal']
    },
    overig: {
        name: 'Overig',
        keys: ['parking', 'hotel']
    }
};

// SVG Icons for upgrades (no emojis)
const UPGRADE_ICONS = {
    tribunes: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b4513" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><rect x="9" y="12" width="6" height="9"/></svg>`,
    grass: `<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M4 20c2-4 4-8 8-8s6 4 8 8"/><path d="M12 4v8"/><path d="M8 8c2 0 4 2 4 4"/><path d="M16 8c-2 0-4 2-4 4"/></svg>`,
    horeca: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff7043" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20h16l-2-8H6l-2 8z"/></svg>`,
    fanshop: `<svg viewBox="0 0 24 24" fill="none" stroke="#00bcd4" stroke-width="2"><path d="M6 4h12l2 5H4l2-5z"/><path d="M4 9v11h16V9"/><path d="M9 9v11M15 9v11"/></svg>`,
    vip: `<svg viewBox="0 0 24 24" fill="none" stroke="#9c27b0" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12l2 4 2-4M15 10v6M17 10l-2 3 2 3"/></svg>`,
    parking: `<svg viewBox="0 0 24 24" fill="none" stroke="#607d8b" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 16V8h4a3 3 0 010 6H9"/></svg>`,
    lighting: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffeb3b" stroke-width="2"><circle cx="12" cy="6" r="4"/><path d="M12 10v10M8 20h8"/></svg>`,
    training: `<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`,
    medical: `<svg viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>`,
    academy: `<svg viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2"><path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"/><path d="M12 12v9M12 12L3 7.5M12 12l9-4.5"/></svg>`,
    scouting: `<svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2"><circle cx="10" cy="10" r="6"/><path d="M14 14l6 6"/></svg>`,
    sponsoring: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2"/></svg>`,
    kantine: `<svg viewBox="0 0 24 24" fill="none" stroke="#8d6e63" stroke-width="2"><path d="M4 11h16M4 11V8a4 4 0 014-4h8a4 4 0 014 4v3M4 11v9h16v-9"/></svg>`,
    perszaal: `<svg viewBox="0 0 24 24" fill="none" stroke="#37474f" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>`,
    hotel: `<svg viewBox="0 0 24 24" fill="none" stroke="#795548" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><rect x="8" y="6" width="3" height="3"/><rect x="13" y="6" width="3" height="3"/><rect x="8" y="11" width="3" height="3"/><rect x="13" y="11" width="3" height="3"/><rect x="10" y="16" width="4" height="5"/></svg>`
};

let activeStadiumTab = 'veld';

function initStadiumTabs() {
    document.querySelectorAll('.upgrade-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeStadiumTab = tab.dataset.category;
            document.querySelectorAll('.upgrade-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderStadiumUpgradesTabs();
        });
    });
}

function renderStadiumUpgradesTabs() {
    const container = document.getElementById('stadium-upgrades-content');
    if (!container) return;

    const currentCapacity = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune)?.capacity || 200;
    const tabConfig = STADIUM_TAB_CATEGORIES[activeStadiumTab];
    if (!tabConfig) return;

    const singularCategories = ['tribunes', 'grass', 'training', 'medical', 'academy', 'scouting', 'lighting', 'sponsoring', 'kantine', 'perszaal', 'hotel'];

    let html = '';

    tabConfig.keys.forEach(key => {
        const upgrades = STADIUM_UPGRADES[key];
        if (!upgrades) return;

        const currentId = key === 'tribunes' ? gameState.stadium.tribune :
                         singularCategories.includes(key) ? gameState.stadium[key] : null;
        const ownedIds = Array.isArray(gameState.stadium[key]) ? gameState.stadium[key] : [];

        upgrades.forEach(upgrade => {
            const isCurrent = currentId === upgrade.id;
            const isOwned = ownedIds.includes(upgrade.id);
            const isLocked = upgrade.required > currentCapacity;
            const canAfford = gameState.club.budget >= upgrade.cost;

            let statusClass = '';
            let actionHtml = '';

            if (isCurrent || isOwned) {
                statusClass = 'owned';
                actionHtml = '<span class="upgrade-status">Gebouwd</span>';
            } else if (isLocked) {
                statusClass = 'locked';
                actionHtml = `<span class="upgrade-price">${upgrade.required}+ cap</span>`;
            } else if (!canAfford) {
                statusClass = '';
                actionHtml = `<span class="upgrade-price">${formatCurrency(upgrade.cost)}</span><button class="btn-build" disabled>Te duur</button>`;
            } else {
                statusClass = '';
                actionHtml = `<span class="upgrade-price">${formatCurrency(upgrade.cost)}</span><button class="btn-build" data-category="${key}" data-upgrade="${upgrade.id}">Bouwen</button>`;
            }

            // Build description
            let desc = '';
            if (upgrade.capacity) desc = `${upgrade.capacity} plaatsen`;
            else if (upgrade.income) desc = `+${formatCurrency(upgrade.income)}/bezoeker`;
            else if (upgrade.dailyIncome) desc = `+${formatCurrency(upgrade.dailyIncome)}/dag`;
            else if (upgrade.multiplier) desc = `${upgrade.multiplier}x groei`;
            else if (upgrade.effect) desc = upgrade.effect;

            html += `
                <div class="stadium-upgrade-item ${statusClass}" data-facility="${key}">
                    <div class="upgrade-icon">${UPGRADE_ICONS[key] || ''}</div>
                    <div class="upgrade-info">
                        <h5>${upgrade.name}</h5>
                        <p>${desc}</p>
                    </div>
                    <div class="upgrade-action">${actionHtml}</div>
                </div>
            `;
        });
    });

    container.innerHTML = html || '<p style="color: var(--text-muted); text-align: center;">Geen upgrades beschikbaar</p>';

    // Add click handlers
    container.querySelectorAll('.btn-build:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            purchaseUpgrade(btn.dataset.category, btn.dataset.upgrade);
        });
    });

    // Add hover preview handlers
    container.querySelectorAll('.stadium-upgrade-item').forEach(item => {
        const facilityKey = item.dataset.facility;
        item.addEventListener('mouseenter', () => highlightFacilityOnMap(facilityKey, true));
        item.addEventListener('mouseleave', () => highlightFacilityOnMap(facilityKey, false));
    });
}

// Highlight facility on the birdseye map when hovering over upgrade
function highlightFacilityOnMap(facilityKey, highlight) {
    // Map category keys to facility element IDs on the SVG
    const facilityMap = {
        'horeca': 'facility-horeca',
        'fanshop': 'facility-fanshop',
        'vip': 'facility-vip',
        'parking': 'facility-parking',
        'training': 'facility-training',
        'medical': 'facility-medical',
        'academy': 'facility-academy',
        'scouting': 'facility-scouting',
        'lighting': 'facility-lighting',
        'sponsoring': 'facility-sponsoring',
        'kantine': 'facility-kantine',
        'perszaal': 'facility-perszaal',
        'hotel': 'facility-hotel',
        'grass': 'facility-grass',
        'tribunes': 'facility-tribune'
    };

    const facilityId = facilityMap[facilityKey];
    if (!facilityId) return;

    const facilityEl = document.getElementById(facilityId);
    if (facilityEl) {
        if (highlight) {
            facilityEl.classList.add('preview-highlight');
        } else {
            facilityEl.classList.remove('preview-highlight');
        }
    }
}

function purchaseUpgrade(category, upgradeId) {
    const upgrades = STADIUM_UPGRADES[category];
    const upgrade = upgrades?.find(u => u.id === upgradeId);

    if (!upgrade || gameState.club.budget < upgrade.cost) return;

    if (confirm(`Wil je ${upgrade.name} bouwen voor ${formatCurrency(upgrade.cost)}?`)) {
        gameState.club.budget -= upgrade.cost;

        const singularCategories = ['tribunes', 'grass', 'training', 'medical', 'academy', 'scouting', 'lighting', 'sponsoring', 'kantine', 'perszaal', 'hotel'];

        if (singularCategories.includes(category)) {
            gameState.stadium[category === 'tribunes' ? 'tribune' : category] = upgradeId;
            if (category === 'tribunes') {
                gameState.stadium.capacity = upgrade.capacity;
            }
        } else {
            if (!Array.isArray(gameState.stadium[category])) {
                gameState.stadium[category] = [];
            }
            gameState.stadium[category].push(upgradeId);
        }

        updateBudgetDisplays();
        renderStadiumPage();
    }
}

// ================================================
// SCOUT PAGE RENDERING
// ================================================

let isScoutingActive = false;

function renderScoutPage() {
    const section = document.getElementById('scout-tip-section');
    if (!section) return;

    // Check if scout mission completed
    checkScoutMission();

    const hasScout = gameState.staff?.scout !== null && gameState.staff?.scout !== undefined;
    const scoutLevel = hasScout ? 1 : 0;
    const hasCentrum = gameState.club.division <= 5;

    // Update header labels
    const levelLabel = document.getElementById('scout-level-label');
    if (levelLabel) {
        levelLabel.textContent = scoutLevel === 0
            ? 'Scout: Lvl 0 · Aanbevelingen van de voorzitter'
            : 'Scout: Lvl 1 · Professionele scout';
    }
    const hintEl = document.getElementById('scout-header-hint');
    if (hintEl) {
        hintEl.textContent = scoutLevel === 0
            ? 'Neem een scout aan voor betere suggesties'
            : 'Je scout zoekt de beste spelers voor jou';
    }

    // Render sidebar: scout card
    const scoutCard = document.getElementById('scouting-scout-card');
    if (scoutCard) {
        const mission = gameState.scoutMission;
        const missionActive = mission.active && mission.startTime;
        const usedToday = !missionActive && mission.lastScoutDate === getTodayString();

        let missionHTML = '';
        if (missionActive) {
            const elapsed = Date.now() - mission.startTime;
            const remaining = Math.max(0, mission.duration - elapsed);
            const pct = ((elapsed / mission.duration) * 100).toFixed(1);
            missionHTML = `
                <div class="scout-mission-status">
                    <div class="scout-mission-label">Scout is onderweg...</div>
                    <div class="scout-mission-progress-track">
                        <div class="scout-mission-progress-fill" id="scout-mission-progress" style="width: ${pct}%"></div>
                    </div>
                    <div class="scout-mission-countdown">Terug over <span id="scout-mission-timer">${formatScoutCountdown(remaining)}</span></div>
                </div>`;
            // Start the live countdown timer
            startScoutMissionTimer();
        } else if (usedToday) {
            clearScoutMissionTimer();
            missionHTML = `
                <div class="scout-mission-status">
                    <div class="scout-mission-cooldown">Morgen weer beschikbaar</div>
                </div>`;
        } else {
            clearScoutMissionTimer();
            missionHTML = `
                <div class="scout-mission-status">
                    <button class="btn btn-primary scout-mission-btn" onclick="startScoutMission()">Scout Versturen</button>
                </div>`;
        }

        scoutCard.innerHTML = `
            <div class="scouting-card-header">
                <span class="scouting-card-icon">🔍</span>
                <span class="scouting-card-title">Jouw Scout</span>
            </div>
            <div class="scouting-card-level">Niveau ${scoutLevel}</div>
            <div class="scouting-card-desc">
                ${scoutLevel === 0
                    ? 'Geen scout — je krijgt af en toe een tip van de voorzitter.'
                    : 'Je scout levert betere speler-suggesties.'}
            </div>
            <div class="scouting-card-info">
                <span>👤 ${scoutLevel === 0 ? '1' : '1'} speler per tip</span>
                ${hasCentrum ? '<span>🏟️ 2 spelers met scoutingscentrum</span>' : ''}
            </div>
            ${missionHTML}
        `;
    }

    // Render sidebar: scoutingscentrum card
    const centrumCard = document.getElementById('scouting-centrum-card');
    if (centrumCard) {
        if (hasCentrum) {
            centrumCard.innerHTML = `
                <div class="scouting-card-header">
                    <span class="scouting-card-icon">🏟️</span>
                    <span class="scouting-card-title">Scoutingscentrum</span>
                </div>
                <div class="scouting-card-level">Actief</div>
                <div class="scouting-card-desc">Je ontvangt 2 speler-suggesties per keer in plaats van 1.</div>
            `;
        } else {
            centrumCard.innerHTML = `
                <div class="scouting-card-header">
                    <span class="scouting-card-icon">🏗️</span>
                    <span class="scouting-card-title">Scoutingscentrum</span>
                </div>
                <div class="scouting-card-level scouting-locked">Vergrendeld</div>
                <div class="scouting-card-desc">Promoveer naar <strong>Divisie 5</strong> om een scoutingscentrum te bouwen en 2 spelers per keer te zien.</div>
                <div class="scouting-card-req">
                    <span>🔒</span> Vereist: Divisie 5
                </div>
            `;
        }
    }

    // Initialize scout tips
    if (!gameState.scoutTips) {
        gameState.scoutTips = [];
    }

    // Generate the chairman's son tip if no tips exist yet
    if (gameState.scoutTips.length === 0 && !gameState.scoutTipClaimed) {
        const chairmanSon = createZaterdagPlayer('centraleMid');
        chairmanSon.name = `${randomFromArray(DUTCH_FIRST_NAMES)} Bakker`;
        chairmanSon.age = 18;
        chairmanSon.overall = 2;
        chairmanSon.stars = 2;
        chairmanSon.salary = 0;
        chairmanSon.fixedMarketValue = 0;
        chairmanSon.nationality = NATIONALITIES[0]; // NL
        const attrNames = ['AAN', 'VER', 'SNE', 'FYS'];
        attrNames.forEach(a => { chairmanSon.attributes[a] = random(1, 4); });
        chairmanSon.overall = calculateOverall(chairmanSon.attributes, chairmanSon.position);
        chairmanSon.tipSource = 'voorzitter';
        gameState.scoutTips.push(chairmanSon);
    }

    if (gameState.scoutTips.length === 0) {
        section.innerHTML = '<p class="scout-no-tips">Geen tips op dit moment. Check later nog eens!</p>';
        return;
    }

    section.innerHTML = gameState.scoutTips.map(player => {
        const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
        const tipLabel = player.tipSource === 'voorzitter'
            ? '💬 <strong>Voorzitter:</strong> "Mijn zoontje kan wel redelijk voetballen, misschien is dat een idee?"'
            : '💬 Tip van een vriend';

        return `
            <div class="scout-tip-card">
                <div class="scout-tip-message">${tipLabel}</div>
                <div class="player-card" data-player-id="${player.id}">
                    <div class="pc-left">
                        <span class="pc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                        <div class="pc-age-box">
                            <span class="pc-age-value">${player.age}</span>
                            <span class="pc-age-label">jr</span>
                        </div>
                        <img class="pc-flag-img" src="https://flagcdn.com/w40/${(player.nationality.code || 'nl').toLowerCase()}.png" alt="${player.nationality.code || 'NL'}" />
                    </div>
                    <span class="pc-name">${player.name}</span>
                    <span class="pc-finance">
                        <span class="pc-salary">${formatCurrency(0)}/w</span>
                        <span class="pc-value">${formatCurrency(0)}</span>
                    </span>
                    <div class="pc-condition-bars">
                        <div class="pc-bar-item">
                            <span class="pc-bar-label">Energie</span>
                            <div class="pc-bar-track">
                                <div class="pc-bar-fill" style="width: 100%; background: ${getBarColor(100)}"></div>
                            </div>
                            <span class="pc-bar-value">100%</span>
                        </div>
                    </div>
                    <div class="pc-ratings">
                        <div class="pc-overall" style="background: ${posData.color}">
                            <span class="pc-overall-value">${player.overall}</span>
                            <span class="pc-overall-label">ALG</span>
                        </div>
                        <div class="pc-potential-stars">
                            <span class="pc-stars">${renderStarsHTML(2)}</span>
                            <span class="pc-potential-label">POT</span>
                        </div>
                    </div>
                </div>
                <div class="scout-tip-actions">
                    <button class="btn btn-primary" onclick="acceptScoutTip('${player.id}')">Aannemen</button>
                    <button class="btn btn-secondary" onclick="declineScoutTip('${player.id}')">Afwijzen</button>
                </div>
            </div>
        `;
    }).join('');
}

function hireScoutedPlayer(playerId) {
    const player = gameState.scoutSearch.results.find(p => p.id === playerId);
    if (!player) return;

    if (player.price > gameState.club.budget) {
        alert('Je hebt niet genoeg budget!');
        return;
    }

    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    // Hire the player
    gameState.club.budget -= player.price;
    gameState.players.push(player);
    gameState.scoutSearch.results = gameState.scoutSearch.results.filter(p => p.id !== playerId);

    updateBudgetDisplays();
    renderScoutPage();
    alert(`${player.name} is toegevoegd aan je selectie!`);
}

// Scout tip system
window.acceptScoutTip = function(playerId) {
    if (!gameState.scoutTips) return;
    const idx = gameState.scoutTips.findIndex(p => String(p.id) === String(playerId));
    if (idx === -1) return;

    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    const player = gameState.scoutTips.splice(idx, 1)[0];
    player.energy = 100;
    player.condition = 100;
    gameState.players.push(player);
    gameState.scoutTipClaimed = true;
    saveGame();
    renderScoutPage();
    renderPlayerCards();
    showNotification(`${player.name} is toegevoegd aan je selectie!`, 'success');
};

window.declineScoutTip = function(playerId) {
    if (!gameState.scoutTips) return;
    gameState.scoutTips = gameState.scoutTips.filter(p => String(p.id) !== String(playerId));
    gameState.scoutTipClaimed = true;
    saveGame();
    renderScoutPage();
    showNotification('Tip afgewezen.', 'info');
};

// Scout daily mission
let scoutMissionInterval = null;

window.startScoutMission = function() {
    const mission = gameState.scoutMission;
    if (mission.active) return;
    if (mission.lastScoutDate === getTodayString()) return;

    // Pick a random position (excluding keeper)
    const positions = Object.keys(POSITIONS).filter(p => p !== 'keeper');
    const pos = randomFromArray(positions);
    const player = createZaterdagPlayer(pos);
    player.tipSource = 'scout';

    mission.active = true;
    mission.startTime = Date.now();
    mission.pendingPlayer = player;
    mission.lastScoutDate = getTodayString();

    saveGame();
    renderScoutPage();
};

function checkScoutMission() {
    const mission = gameState.scoutMission;
    if (!mission.active || !mission.startTime) return;

    if (Date.now() - mission.startTime >= mission.duration) {
        if (!gameState.scoutTips) gameState.scoutTips = [];
        gameState.scoutTips.push(mission.pendingPlayer);
        mission.active = false;
        mission.pendingPlayer = null;
        saveGame();
        showNotification('Je scout heeft een speler gevonden!', 'success');
    }
}

function startScoutMissionTimer() {
    clearScoutMissionTimer();
    scoutMissionInterval = setInterval(() => {
        const mission = gameState.scoutMission;
        if (!mission.active) {
            clearScoutMissionTimer();
            renderScoutPage();
            return;
        }
        const elapsed = Date.now() - mission.startTime;
        const remaining = Math.max(0, mission.duration - elapsed);
        if (remaining <= 0) {
            checkScoutMission();
            clearScoutMissionTimer();
            renderScoutPage();
            return;
        }
        // Update countdown display
        const timerEl = document.getElementById('scout-mission-timer');
        if (timerEl) {
            timerEl.textContent = formatScoutCountdown(remaining);
        }
        const progressEl = document.getElementById('scout-mission-progress');
        if (progressEl) {
            const pct = ((elapsed / mission.duration) * 100).toFixed(1);
            progressEl.style.width = pct + '%';
        }
    }, 1000);
}

function clearScoutMissionTimer() {
    if (scoutMissionInterval) {
        clearInterval(scoutMissionInterval);
        scoutMissionInterval = null;
    }
}

function formatScoutCountdown(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

function startScouting() {
    if (isScoutingActive) return;

    const btn = document.getElementById('scout-search-btn');
    const status = document.getElementById('scout-status');
    const minAgeEl = document.getElementById('scout-min-age');
    const maxAgeEl = document.getElementById('scout-max-age');
    const positionEl = document.getElementById('scout-position');

    // Get filter values
    const minAge = parseInt(minAgeEl?.value) || 16;
    const maxAge = parseInt(maxAgeEl?.value) || 35;
    const position = positionEl?.value || 'all';

    // Update UI to show scouting
    isScoutingActive = true;
    if (btn) {
        btn.classList.add('scouting');
        btn.innerHTML = '<span class="btn-scout-icon">⏳</span><span class="btn-scout-text">Scouten...</span>';
    }
    if (status) {
        status.classList.add('active');
        status.innerHTML = `
            <p class="scout-status-text">Scout is onderweg...</p>
            <div class="scout-progress">
                <div class="scout-progress-fill" id="scout-progress-fill" style="width: 0%"></div>
            </div>
        `;
    }

    // Animate progress bar
    let progress = 0;
    const duration = 2000; // 2 seconds
    const interval = 50;
    const steps = duration / interval;
    const progressInterval = setInterval(() => {
        progress += (100 / steps);
        const fill = document.getElementById('scout-progress-fill');
        if (fill) fill.style.width = `${Math.min(progress, 100)}%`;
    }, interval);

    // After animation, show results
    setTimeout(() => {
        clearInterval(progressInterval);
        isScoutingActive = false;

        // Generate scout results
        gameState.scoutSearch.minAge = minAge;
        gameState.scoutSearch.maxAge = maxAge;
        gameState.scoutSearch.position = position;
        gameState.scoutSearch.results = scoutPlayers(position, minAge, maxAge, 3);

        // Reset button
        if (btn) {
            btn.classList.remove('scouting');
            btn.innerHTML = '<span class="btn-scout-icon">🔍</span><span class="btn-scout-text">Scout Versturen</span>';
        }
        if (status) {
            status.classList.remove('active');
            status.innerHTML = `<p class="scout-status-text">${gameState.scoutSearch.results.length} spelers gevonden!</p>`;
        }

        renderScoutPage();
    }, duration);
}

function initScoutFilters() {
    const searchBtn = document.getElementById('scout-search-btn');
    const minAgeEl = document.getElementById('scout-min-age');
    const maxAgeEl = document.getElementById('scout-max-age');
    const ageDisplay = document.getElementById('age-range-display');

    if (searchBtn) {
        searchBtn.addEventListener('click', startScouting);
    }

    // Update age display when inputs change
    function updateAgeDisplay() {
        if (ageDisplay && minAgeEl && maxAgeEl) {
            const min = minAgeEl.value;
            const max = maxAgeEl.value;
            ageDisplay.textContent = `${min} - ${max}`;
        }
    }

    if (minAgeEl) minAgeEl.addEventListener('input', updateAgeDisplay);
    if (maxAgeEl) maxAgeEl.addEventListener('input', updateAgeDisplay);
}

// ================================================
// NEW TRAINING SYSTEM
// ================================================

const TRAINER_STATS = {
    aan: { name: 'Aanvalstrainer', stat: 'AAN', color: '#c62828' },
    ver: { name: 'Verdedigingstrainer', stat: 'VER', color: '#1565c0' },
    sne: { name: 'Snelheidstrainer', stat: 'SNE', color: '#ef6c00' },
    fys: { name: 'Fitnesstrainer', stat: 'FYS', color: '#7b1fa2' }
};

const POSITION_GROUP_LABELS = {
    goalkeeper: 'Keeper',
    defender: 'Verdediger',
    midfielder: 'Middenvelder',
    attacker: 'Aanvaller'
};

let trainingTimerInterval = null;

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

function hasTrainedToday(mp) {
    return mp.lastTrainingDate === getTodayString();
}

function renderTrainingPage() {
    const mp = initMyPlayer();
    const trainedToday = hasTrainedToday(mp);

    // Cooldown display
    const cooldownEl = document.getElementById('training-cooldown');
    if (cooldownEl) {
        cooldownEl.innerHTML = trainedToday
            ? '<span class="cooldown-badge used">Vandaag getraind</span>'
            : '<span class="cooldown-badge available">1 sessie beschikbaar</span>';
    }

    const container = document.getElementById('training-content');
    if (!container) return;

    // Player XP info
    const playerXP = mp.xp || 0;
    const pLevel = getPlayerLevel(playerXP);
    const availableSkillPoints = Math.max(0, pLevel.skillPoints - (mp.spentSkillPoints || 0));
    const nextLevel = PLAYER_LEVELS.find(l => l.xpRequired > playerXP);
    const xpProgress = pLevel.progress * 100;

    // All 6 attributes as horizontal bars
    const a = mp.attributes;
    const allAttrs = { SNE: 'Snelheid', TEC: 'Techniek', PAS: 'Passen', SCH: 'Schieten', VER: 'Verdedigen', FYS: 'Fysiek' };
    const canUpgrade = availableSkillPoints > 0;

    const skillBars = Object.entries(allAttrs).map(([key, label]) => {
        const val = a[key] || 0;
        const pct = Math.min(100, val);
        const disabled = !canUpgrade || val >= 99 ? 'disabled' : '';
        return `<div class="hbar-row">
            <span class="hbar-label">${label}</span>
            <div class="hbar-track"><div class="hbar-fill" style="width: ${pct}%"><span class="hbar-val">${val}</span></div></div>
            ${canUpgrade ? `<button class="hbar-btn" onclick="window.spendSkillPoint('${key}')" ${disabled}>+1</button>` : ''}
        </div>`;
    }).join('');

    // Player XP rewards
    const pRewards = Object.entries(PLAYER_XP_REWARDS).map(([k, v]) => {
        const labels = { matchWin: 'Winst', matchDraw: 'Gelijk', goalScored: 'Doelpunt', cleanSheet: 'Clean sheet', hatTrick: 'Hattrick', training: 'Training', promotion: 'Promotie', title: 'Titel' };
        return `<span class="vg-xp-tag">${labels[k] || k} +${v}</span>`;
    }).join('');

    // Massage info
    const canMassage = mp.energy < 100 && !trainedToday;
    const canSpy = !trainedToday;
    const canTrain = !trainedToday;
    const opponentName = gameState.nextMatch?.opponent || 'Onbekend';

    const nextLevelNum = nextLevel ? nextLevel.level : pLevel.level;
    const xpText = nextLevel ? `${playerXP} / ${nextLevel.xpRequired} XP` : `${playerXP} XP — Max!`;
    const nextSkillPoints = nextLevel ? nextLevel.level - 1 : pLevel.skillPoints;
    const newPointsAtNext = nextSkillPoints - pLevel.skillPoints;
    const rewardText = nextLevel && newPointsAtNext > 0 ? `+${newPointsAtNext} skill punt` : '';

    const spText = availableSkillPoints > 0
        ? `${availableSkillPoints} skill ${availableSkillPoints === 1 ? 'punt' : 'punten'} te besteden`
        : `Geen skill punten`;
    const derived = getMyPlayerDerived(mp);

    container.innerHTML = `
        <div class="training-page-content">
            <!-- Player + XP card -->
            <div class="training-hero-card">
                <div class="training-hero-top">
                    <div class="training-hero-avatar">
                        <svg viewBox="0 0 80 100">
                            <ellipse cx="40" cy="28" rx="18" ry="19" fill="#f5d0c5"/>
                            <ellipse cx="40" cy="15" rx="16" ry="9" fill="#4a3728"/>
                            <circle cx="33" cy="26" r="2.5" fill="white"/>
                            <circle cx="47" cy="26" r="2.5" fill="white"/>
                            <circle cx="33.5" cy="26.5" r="1.2" fill="#333"/>
                            <circle cx="47.5" cy="26.5" r="1.2" fill="#333"/>
                            <path d="M36 35 Q40 38 44 35" fill="none" stroke="#a0522d" stroke-width="1.2"/>
                            <path d="M15 95 Q15 65 25 58 L40 62 L55 58 Q65 65 65 95 L65 100 L15 100 Z" fill="var(--accent-green-dim)"/>
                            <text x="40" y="85" text-anchor="middle" fill="white" font-family="var(--font-display)" font-size="16" font-weight="bold">${mp.number}</text>
                            <path d="M32 58 L40 62 L48 58" fill="none" stroke="white" stroke-width="1.5"/>
                            <rect x="22" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                            <rect x="42" y="92" width="16" height="8" rx="2" fill="#1a1a1a"/>
                        </svg>
                    </div>
                    <div class="training-hero-info">
                        <div class="training-hero-name">${mp.name}</div>
                    </div>
                    <div class="training-hero-meta">${mp.position} · #${mp.number}</div>
                </div>
                <div class="txp-row">
                    <div class="txp-lvl current">
                        <span class="txp-lvl-num">${pLevel.level}</span>
                    </div>
                    <div class="txp-track">
                        <div class="txp-fill txp-gold" style="width: ${xpProgress}%">
                            <div class="txp-shimmer"></div>
                        </div>
                        <span class="txp-text">${xpText}</span>
                    </div>
                    <div class="txp-lvl next">
                        <span class="txp-lvl-num">${nextLevelNum}</span>
                        ${rewardText ? `<span class="txp-lvl-reward txp-gold-reward">${rewardText}</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- Kenmerken card -->
            <div class="training-attrs-card">
                <div class="training-attrs-header">
                    <span class="training-attrs-title">Kenmerken</span>
                    <span class="training-attrs-sp ${availableSkillPoints > 0 ? 'has-points' : 'no-points'}">${spText}</span>
                </div>
                <div class="training-attrs-body">
                    <div class="training-hbars">
                        ${skillBars}
                    </div>
                    <div class="training-attrs-rating">
                        <span class="training-attrs-rating-num">${derived.gemiddeld}</span>
                        <span class="training-attrs-rating-lbl">ALG</span>
                    </div>
                </div>
            </div>

            <!-- 3 training actions -->
            <div class="training-actions-header">Kies 1 actie per dag</div>
            <div class="training-actions-row">
                <div class="training-action-card">
                    <div class="training-sec-icon">&#127939;</div>
                    <div class="training-sec-title">Trainen</div>
                    <div class="training-sec-desc">Train je speler en verdien <strong>+25 XP</strong>. Eén sessie per dag.</div>
                    <button class="btn btn-sm ${canTrain ? 'btn-primary' : 'btn-secondary'}" onclick="${canTrain ? "trainMyPlayer('vrije_tijd')" : ''}" ${!canTrain ? 'disabled' : ''}>
                        ${canTrain ? 'Trainen' : 'Getraind \u2713'}
                    </button>
                </div>
                <div class="training-action-card">
                    <div class="training-sec-icon">&#128134;</div>
                    <div class="training-sec-title">Massage</div>
                    <div class="training-sec-desc">Herstel <strong>+50% energie</strong> zodat je fitter aan de wedstrijd begint.</div>
                    <div class="training-sec-detail">Energie: ${Math.round(mp.energy)}%</div>
                    <button class="btn btn-sm ${canMassage ? 'btn-primary' : 'btn-secondary'}" onclick="${canMassage ? "trainMyPlayer('massage')" : ''}" ${!canMassage ? 'disabled' : ''}>
                        ${mp.energy >= 100 ? 'Vol' : (trainedToday ? 'Cooldown' : 'Massage')}
                    </button>
                </div>
                <div class="training-action-card">
                    <div class="training-sec-icon">&#128301;</div>
                    <div class="training-sec-title">Bespioneer</div>
                    <div class="training-sec-desc">Bekijk de tegenstander en krijg <strong>+3% bonus</strong> op je volgende wedstrijd.</div>
                    <div class="training-sec-detail">VS ${opponentName}</div>
                    <button class="btn btn-sm ${canSpy ? 'btn-primary' : 'btn-secondary'}" onclick="${canSpy ? "trainMyPlayer('spy')" : ''}" ${!canSpy ? 'disabled' : ''}>
                        ${trainedToday ? 'Cooldown' : 'Spioneer'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render player achievements in training prestaties tab
function renderTrainingPrestaties() {
    const container = document.getElementById('training-prestaties-content');
    if (!container) return;

    const allAch = getAllAchievements(gameState);
    const spelerCats = [CATEGORIES.MATCHES, CATEGORIES.GOALS, CATEGORIES.SEASON, CATEGORIES.SPECIAL];
    const spelerAch = renderAchievementCards(allAch, spelerCats);

    container.innerHTML = `
        <div class="prs-single">
            <h4 class="mp-section-title">Spelersprestaties <span class="ach-progress-text">${spelerAch.stats.unlocked} / ${spelerAch.stats.total}</span></h4>
            <div class="ach-progress">
                <div class="ach-progress-bar">
                    <div class="ach-progress-fill" style="width: ${spelerAch.progressPct}%"></div>
                </div>
            </div>
            <div class="ach-filters" id="training-ach-filters">
                <button class="ach-filter-btn active" data-ach-cat="all">Alles</button>
                ${spelerAch.filterBtns}
            </div>
            <div class="ach-grid" id="training-ach-grid">
                ${spelerAch.renderCards(null)}
            </div>
        </div>
    `;

    // Filter click handlers
    container.querySelectorAll('#training-ach-filters .ach-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('#training-ach-filters .ach-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.achCat;
            const grid = document.getElementById('training-ach-grid');
            if (grid) grid.innerHTML = spelerAch.renderCards(cat === 'all' ? null : cat);
        });
    });
}

// Generic page tabs switching
function initPageTabs(containerId, onSwitch) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const section = container.closest('.page');
    if (!section) return;
    const tabs = container.querySelectorAll('.page-tab');
    const panels = section.querySelectorAll(':scope > .page-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.pageTab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            // Find matching panel by id pattern
            const matchingPanel = section.querySelector(`[id*="${targetTab}-page-panel"]`);
            if (matchingPanel) matchingPanel.classList.add('active');

            if (onSwitch) onSwitch(targetTab);
        });
    });
}

function initTrainingTabs() {
    initPageTabs('training-tabs', (tab) => {
        if (tab === 'prestaties') renderTrainingPrestaties();
    });
}

function initPrestatieTabs() {
    initPageTabs('prestaties-tabs', (tab) => {
        if (tab === 'prestaties') renderPrestaties();
    });
}

// Position Training Cards
const POSITION_TRAINING = [
    { id: 'keeper', name: 'Keeper', icon: '🧤', trainerId: 'tr_keeper', positions: ['keeper'] },
    { id: 'verdediging', name: 'Verdediging', icon: '🛡️', trainerId: 'tr_verdediging', positions: ['cb', 'lb', 'rb'] },
    { id: 'middenveld', name: 'Middenveld', icon: '⚙️', trainerId: 'tr_middenveld', positions: ['cdm', 'cm', 'cam', 'lm', 'rm'] },
    { id: 'aanval', name: 'Aanval', icon: '⚽', trainerId: 'tr_aanval', positions: ['lw', 'rw', 'cf', 'st'] }
];

function renderPositionTraining() {
    const grid = document.getElementById('position-training-grid');
    if (!grid) return;

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };

    let html = '';
    POSITION_TRAINING.forEach(pos => {
        const hasTrainer = gameState.hiredStaff.trainers?.includes(pos.trainerId);
        const trainablePlayers = gameState.players.filter(p =>
            pos.positions.includes(p.position)
        );

        html += `
            <div class="position-train-card ${hasTrainer ? 'has-trainer' : 'locked'}">
                <div class="ptc-icon">${pos.icon}</div>
                <div class="ptc-name">${pos.name}</div>
                <div class="ptc-players">${trainablePlayers.length} spelers</div>
                <div class="ptc-status ${hasTrainer ? 'has-trainer' : 'no-trainer'}">
                    ${hasTrainer ? '✓ Trainer beschikbaar' : '✗ Geen trainer'}
                </div>
                ${hasTrainer ? `
                    <button class="btn btn-sm btn-primary" onclick="openPositionTrainingModal('${pos.id}')">
                        Train
                    </button>
                ` : `
                    <button class="btn btn-sm btn-secondary" onclick="navigateTo('staff')">
                        Neem trainer aan
                    </button>
                `}
            </div>
        `;
    });

    grid.innerHTML = html;

    // Update hint visibility
    const hint = document.querySelector('.training-hint');
    if (hint) {
        const hasAnyTrainer = POSITION_TRAINING.some(pos =>
            gameState.hiredStaff.trainers?.includes(pos.trainerId)
        );
        hint.style.display = hasAnyTrainer ? 'none' : 'block';
    }
}

// Open training modal for a position
window.openPositionTrainingModal = function(positionId) {
    const posData = POSITION_TRAINING.find(p => p.id === positionId);
    if (!posData) return;

    const trainablePlayers = gameState.players.filter(p =>
        posData.positions.includes(p.position)
    );

    if (trainablePlayers.length === 0) {
        showNotification('Geen spelers beschikbaar voor deze positie', 'warning');
        return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'position-training-modal';

    let playersHtml = trainablePlayers.map(p => `
        <div class="training-player-option" onclick="trainPlayer('${p.id}', '${positionId}')">
            <div class="tpo-pos">${p.position.toUpperCase()}</div>
            <div class="tpo-name">${p.name}</div>
            <div class="tpo-overall">${p.overall}</div>
            <div class="tpo-condition" style="color: ${p.condition >= 70 ? 'var(--accent-green)' : 'var(--error)'}">
                ${p.condition}%
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closePositionTrainingModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closePositionTrainingModal()">&times;</button>
            <h3>Train ${posData.name}</h3>
            <p class="modal-subtitle">Selecteer een speler om te trainen</p>
            <div class="training-player-list">
                ${playersHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
};

window.closePositionTrainingModal = function() {
    const modal = document.getElementById('position-training-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    }
};

window.trainPlayer = function(playerId, positionId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // Apply training effect - improve a random stat
    const stats = ['speed', 'physical', 'technique', 'attack', 'defense'];
    const stat = stats[Math.floor(Math.random() * stats.length)];

    const improvement = Math.floor(Math.random() * 3) + 1;
    if (player[stat] !== undefined) {
        player[stat] = Math.min(99, player[stat] + improvement);
        player.overall = Math.floor((player.attack + player.defense + player.speed + player.physical) / 4);
    }

    // Reduce condition
    player.condition = Math.max(0, player.condition - 10);

    closePositionTrainingModal();
    saveGame();
    showNotification(`${player.name} getraind! +${improvement} ${stat}`, 'success');
    renderPositionTraining();
};

// Training Intensity System
const INTENSITY_LEVELS = {
    1: { name: 'Heel Rustig', condition: 2, energy: -1, desc: 'Lichte hersteltraining. Ideaal na zware wedstrijden.' },
    2: { name: 'Rustig', condition: 4, energy: -2, desc: 'Lichte training met focus op herstel en techniek.' },
    3: { name: 'Normaal', condition: 5, energy: -3, desc: 'Gebalanceerde training voor stabiele ontwikkeling.' },
    4: { name: 'Intens', condition: 7, energy: -5, desc: 'Zware training. Verbetert conditie snel maar kost energie.' },
    5: { name: 'Bruut Intens', condition: 10, energy: -8, desc: 'Extreme training! Maximale conditiegroei maar uitputtend.' }
};

function initTrainingIntensity() {
    const slider = document.getElementById('training-intensity');
    if (!slider) return;

    // Set initial value from gameState
    if (!gameState.training.intensity) {
        gameState.training.intensity = 3;
    }
    slider.value = gameState.training.intensity;
    updateIntensityDisplay(gameState.training.intensity);

    slider.addEventListener('input', (e) => {
        const level = parseInt(e.target.value);
        gameState.training.intensity = level;
        updateIntensityDisplay(level);
    });
}

function updateIntensityDisplay(level) {
    const intensityData = INTENSITY_LEVELS[level];
    if (!intensityData) return;

    // Update condition effect
    const conditionEl = document.getElementById('intensity-condition');
    if (conditionEl) {
        conditionEl.textContent = `+${intensityData.condition}%`;
    }

    // Update energy effect
    const energyEl = document.getElementById('intensity-energy');
    if (energyEl) {
        energyEl.textContent = `${intensityData.energy}%`;
    }

    // Update description
    const descEl = document.getElementById('intensity-description');
    if (descEl) {
        descEl.innerHTML = `<strong>${intensityData.name}</strong> - ${intensityData.desc}`;
    }

    // Update step indicators
    document.querySelectorAll('.intensity-step').forEach(step => {
        const stepLevel = parseInt(step.dataset.level);
        step.classList.toggle('active', stepLevel <= level);
    });
}

function renderAssistantTrainers() {
    const grid = document.getElementById('assistant-grid');
    if (!grid) return;

    let html = '';
    Object.entries(ASSISTANT_TRAINERS).forEach(([key, trainer]) => {
        const isHired = gameState.assistantTrainers[key] !== null;
        const canAfford = gameState.club.budget >= trainer.cost;

        if (isHired) {
            html += `
                <div class="assistant-card hired">
                    <div class="assistant-icon">${trainer.icon}</div>
                    <div class="assistant-name">${trainer.name}</div>
                    <div class="assistant-effect">${trainer.effect}</div>
                    <div class="assistant-hired">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Actief
                    </div>
                    <div class="assistant-salary">${formatCurrency(trainer.weeklySalary)}/week</div>
                </div>
            `;
        } else {
            html += `
                <div class="assistant-card ${!canAfford ? 'locked' : ''}" onclick="${canAfford ? `hireAssistant('${key}')` : ''}">
                    <div class="assistant-icon">${trainer.icon}</div>
                    <div class="assistant-name">${trainer.name}</div>
                    <div class="assistant-effect">${trainer.effect}</div>
                    <div class="assistant-cost">${formatCurrency(trainer.cost)}</div>
                    <div class="assistant-salary">+ ${formatCurrency(trainer.weeklySalary)}/week</div>
                </div>
            `;
        }
    });
    grid.innerHTML = html;
}

function hireAssistant(assistantType) {
    const trainer = ASSISTANT_TRAINERS[assistantType];
    if (!trainer) return;

    if (gameState.club.budget < trainer.cost) {
        alert('Niet genoeg budget!');
        return;
    }

    if (gameState.assistantTrainers[assistantType] !== null) {
        alert('Deze assistent is al in dienst!');
        return;
    }

    gameState.club.budget -= trainer.cost;
    gameState.assistantTrainers[assistantType] = {
        hiredAt: Date.now(),
        weeklySalary: trainer.weeklySalary
    };

    updateBudgetDisplays();
    renderAssistantTrainers();

    console.log(`✅ ${trainer.name} ingehuurd!`);
}

function renderStaffPanel() {
    const panel = document.getElementById('staff-panel');
    const grid = document.getElementById('staff-grid');
    const unlockInfo = document.getElementById('staff-unlock-info');

    if (!panel || !grid || !unlockInfo) return;

    const division = gameState.club.division;
    const isUnlocked = division <= 5; // Division 5 is 3e Klasse

    if (!isUnlocked) {
        unlockInfo.textContent = `🔒 Nog te bouwen vanaf 3e Klasse (nog ${5 - division} divisie${5 - division > 1 ? 's' : ''} te gaan)`;
        unlockInfo.classList.add('locked');
        grid.innerHTML = '';

        // Show locked preview
        let html = '';
        Object.entries(STAFF_TYPES).forEach(([key, staff]) => {
            html += `
                <div class="staff-card locked">
                    <div class="staff-icon">${staff.icon}</div>
                    <div class="staff-name">${staff.name}</div>
                    <div class="staff-desc">${staff.description}</div>
                    <div class="staff-effect">${staff.effect}</div>
                </div>
            `;
        });
        grid.innerHTML = html;
        return;
    }

    unlockInfo.textContent = 'Huur stafleden in om je club te verbeteren';
    unlockInfo.classList.remove('locked');

    let html = '';
    Object.entries(STAFF_TYPES).forEach(([key, staff]) => {
        const isHired = gameState.staff[key] !== null;

        if (isHired) {
            html += `
                <div class="staff-card hired">
                    <div class="staff-icon">${staff.icon}</div>
                    <div class="staff-name">${staff.name}</div>
                    <div class="staff-desc">${staff.description}</div>
                    <div class="staff-effect">${staff.effect}</div>
                    <div class="staff-hired-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        In dienst
                    </div>
                    <div class="staff-salary">${formatCurrency(staff.weeklySalary)}/week</div>
                </div>
            `;
        } else {
            const canAfford = gameState.club.budget >= staff.cost;
            html += `
                <div class="staff-card ${!canAfford ? 'locked' : ''}" onclick="${canAfford ? `hireStaff('${key}')` : ''}">
                    <div class="staff-icon">${staff.icon}</div>
                    <div class="staff-name">${staff.name}</div>
                    <div class="staff-desc">${staff.description}</div>
                    <div class="staff-effect">${staff.effect}</div>
                    <div class="staff-cost">${formatCurrency(staff.cost)} eenmalig</div>
                    <div class="staff-salary">+ ${formatCurrency(staff.weeklySalary)}/week</div>
                    <button class="btn btn-primary btn-small" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Inhuren' : 'Te duur'}
                    </button>
                </div>
            `;
        }
    });
    grid.innerHTML = html;
}

function hireStaff(staffType) {
    const staff = STAFF_TYPES[staffType];
    if (!staff) return;

    if (gameState.club.budget < staff.cost) {
        alert('Niet genoeg budget!');
        return;
    }

    if (gameState.staff[staffType] !== null) {
        alert('Deze stafrol is al ingevuld!');
        return;
    }

    gameState.club.budget -= staff.cost;
    gameState.staff[staffType] = {
        hiredAt: Date.now(),
        weeklySalary: staff.weeklySalary
    };

    updateBudgetDisplays();
    renderStaffPanel();

    console.log(`✅ ${staff.name} ingehuurd!`);
}

function renderHorizontalTrainers() {
    Object.keys(TRAINER_STATS).forEach(trainerId => {
        const playerEl = document.getElementById(`train-player-${trainerId}`);
        const timerEl = document.getElementById(`train-timer-${trainerId}`);
        const card = document.querySelector(`.trainer-card[data-trainer="${trainerId}"]`);
        const btn = card?.querySelector('.tc-btn');

        if (!playerEl || !timerEl || !card || !btn) return;

        const trainerData = gameState.training.trainerStatus[trainerId];

        if (trainerData.busy && trainerData.playerId) {
            const player = gameState.players.find(p => p.id === trainerData.playerId);
            const remaining = getTrainerTimeRemaining(trainerId);

            playerEl.textContent = player ? player.name.split(' ')[0] : '-';
            playerEl.classList.add('has-player');
            timerEl.textContent = formatTimeRemaining(remaining);
            timerEl.classList.add('counting');
            card.classList.add('training');
            btn.textContent = 'Annuleren';
            btn.onclick = () => cancelTrainerSession(trainerId);
        } else {
            playerEl.textContent = '-';
            playerEl.classList.remove('has-player');
            timerEl.textContent = '';
            timerEl.classList.remove('counting');
            card.classList.remove('training');
            btn.textContent = 'Speler toewijzen';
            btn.onclick = () => openTrainerPlayerSelect(trainerId);
        }
    });
}

function startLiveTrainingTimer() {
    // Clear existing interval
    if (trainingTimerInterval) {
        clearInterval(trainingTimerInterval);
    }

    // Update every second while on training page
    trainingTimerInterval = setInterval(() => {
        const activePage = document.querySelector('.page.active');
        if (activePage?.id !== 'training') {
            clearInterval(trainingTimerInterval);
            trainingTimerInterval = null;
            return;
        }

        let needsRender = false;

        Object.keys(TRAINER_STATS).forEach(trainerId => {
            const trainerData = gameState.training.trainerStatus[trainerId];
            if (trainerData.busy && trainerData.startTime) {
                const remaining = getTrainerTimeRemaining(trainerId);
                const timerEl = document.getElementById(`train-timer-${trainerId}`);

                if (remaining <= 0) {
                    completeTrainerSession(trainerId);
                    needsRender = true;
                } else if (timerEl) {
                    timerEl.textContent = formatTimeRemaining(remaining);
                }
            }
        });

        if (needsRender) {
            renderHorizontalTrainers();
        }
    }, 1000);
}

function getTrainerTimeRemaining(trainerId) {
    const trainerData = gameState.training.trainerStatus[trainerId];
    if (!trainerData.startTime) return 0;
    const elapsed = Date.now() - trainerData.startTime;
    return Math.max(0, gameState.training.sessionDuration - elapsed);
}

let currentTrainerId = null;

function openTrainerPlayerSelect(trainerId) {
    currentTrainerId = trainerId;
    const trainer = TRAINER_STATS[trainerId];

    // Get all available players not currently training
    const busyPlayerIds = Object.values(gameState.training.trainerStatus)
        .filter(t => t.busy && t.playerId)
        .map(t => t.playerId);

    const availablePlayers = gameState.players.filter(p => !busyPlayerIds.includes(p.id));

    if (availablePlayers.length === 0) {
        alert('Geen spelers beschikbaar voor training.');
        return;
    }

    // Sort by relevant stat
    const stat = trainer.stat;
    availablePlayers.sort((a, b) => (b.attributes[stat] || 0) - (a.attributes[stat] || 0));

    // Update modal content
    const modal = document.getElementById('training-select-modal');
    const title = document.getElementById('training-modal-title');
    const subtitle = document.getElementById('training-modal-subtitle');
    const list = document.getElementById('training-player-list');

    title.textContent = `${stat} Training`;
    subtitle.textContent = `Selecteer een speler om ${trainer.name} te trainen`;

    let html = '';
    availablePlayers.forEach(player => {
        const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
        const photo = player.photo || generatePlayerPhoto(player.name, player.position);
        const statValue = player.attributes[stat] || 0;
        const starsHTML = renderStarsHTML(player.stars || 0.5);

        html += `
            <div class="training-player-card" onclick="selectTrainingPlayer(${player.id})">
                <div class="tpc-ratings">
                    <div class="tpc-overall" style="background: ${posData.color}">
                        <span class="tpc-overall-val">${player.overall}</span>
                        <span class="tpc-overall-lbl">ALG</span>
                    </div>
                    <div class="tpc-stars-row">${starsHTML}</div>
                </div>
                <div class="tpc-info">
                    <span class="tpc-name">${player.name}</span>
                    <div class="tpc-meta">
                        <span class="tpc-flag">${player.nationality.flag}</span>
                        <span class="tpc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                        <span class="tpc-age">${player.age}j</span>
                    </div>
                </div>
                <div class="tpc-stat">
                    <div class="tpc-stat-value">${statValue}</div>
                    <div class="tpc-stat-label">${stat}</div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    modal.classList.add('active');
}

function closeTrainingModal() {
    const modal = document.getElementById('training-select-modal');
    modal.classList.remove('active');
    currentTrainerId = null;
}

function selectTrainingPlayer(playerId) {
    if (currentTrainerId) {
        startTrainerSession(currentTrainerId, playerId);
        closeTrainingModal();
    }
}

function startTrainerSession(trainerId, playerId) {
    gameState.training.trainerStatus[trainerId] = {
        busy: true,
        playerId: playerId,
        startTime: Date.now()
    };
    renderHorizontalTrainers();
}

function cancelTrainerSession(trainerId) {
    gameState.training.trainerStatus[trainerId] = { busy: false };
    renderHorizontalTrainers();
}

function completeTrainerSession(trainerId) {
    const trainerData = gameState.training.trainerStatus[trainerId];
    const player = gameState.players.find(p => p.id === trainerData.playerId);
    const trainer = TRAINER_STATS[trainerId];

    if (player && trainer) {
        // Apply +1 to the stat
        const stat = trainer.stat;
        if (player.attributes[stat] !== undefined) {
            player.attributes[stat] = Math.min(99, player.attributes[stat] + 1);
        }
        player.overall = calculateOverall(player.attributes, player.position);

        // Show notification
        showNotification(`${player.name} heeft ${stat} +1 gekregen!`, 'success');
    }

    // Reset trainer
    gameState.training.trainerStatus[trainerId] = { busy: false };
}

function renderPositionSlots() {
    const slotIdMap = {
        goalkeeper: 'train-slot-keeper',
        defender: 'train-slot-def',
        midfielder: 'train-slot-mid',
        attacker: 'train-slot-att'
    };

    Object.keys(POSITION_GROUP_LABELS).forEach(group => {
        const slot = document.getElementById(slotIdMap[group]);
        if (!slot) return;

        const slotData = gameState.training.slots[group];
        const playerEl = slot.querySelector('.pos-slot-player');

        if (slotData.playerId) {
            const player = gameState.players.find(p => p.id === slotData.playerId);
            if (player) {
                const remaining = getSlotTimeRemaining(group);
                const trainer = TRAINER_STATS[slotData.trainerId];
                playerEl.innerHTML = `
                    <div class="training-player-info">
                        <span class="tp-name">${player.name.split(' ')[0]}</span>
                        <span class="tp-stat">${trainer?.stat || '?'}</span>
                        <span class="tp-timer" data-slot="${group}">${formatTimeRemaining(remaining)}</span>
                    </div>
                    <button class="btn-cancel-training" onclick="cancelTraining('${group}')">×</button>
                `;
                slot.classList.add('active');
            } else {
                clearTrainingSlot(group);
            }
        } else {
            playerEl.innerHTML = `
                <button class="btn-assign-player" onclick="openPlayerSelectModal('${group}')">+ Speler</button>
            `;
            slot.classList.remove('active');
        }
    });
}

function renderTrainerSlots() {
    Object.keys(TRAINER_STATS).forEach(trainerId => {
        const statusEl = document.getElementById(`trainer-${trainerId}-status`);
        if (!statusEl) return;

        const trainerData = gameState.training.trainerStatus[trainerId];
        const assignBtn = statusEl.querySelector('.btn-assign-trainer');

        if (trainerData.busy) {
            statusEl.innerHTML = `
                <span class="trainer-busy">Bezig met ${POSITION_GROUP_LABELS[trainerData.assignedSlot]}</span>
            `;
        } else {
            statusEl.innerHTML = `
                <span class="trainer-available">Nog te bouwen</span>
                <button class="btn btn-primary btn-small btn-assign-trainer" data-trainer="${trainerId}">Toewijzen</button>
            `;
        }
    });

    // Re-add event listeners
    document.querySelectorAll('.btn-assign-trainer').forEach(btn => {
        btn.addEventListener('click', () => {
            const trainerId = btn.dataset.trainer;
            openTrainerAssignModal(trainerId);
        });
    });
}

function renderTeamTraining() {
    const options = document.querySelectorAll('.team-training-option');
    options.forEach(option => {
        const type = option.dataset.type;
        const btn = option.querySelector('button');

        if (gameState.training.teamTraining.selected === type) {
            option.classList.add('selected');
            btn.textContent = 'Geselecteerd';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-secondary');
        } else {
            option.classList.remove('selected');
            btn.textContent = 'Selecteer';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    });
}

function updateTrainingTimers() {
    Object.keys(gameState.training.slots).forEach(group => {
        const slotData = gameState.training.slots[group];
        if (slotData.playerId && slotData.startTime) {
            const remaining = getSlotTimeRemaining(group);
            const timerEl = document.querySelector(`.tp-timer[data-slot="${group}"]`);

            if (remaining <= 0) {
                completeTraining(group);
            } else if (timerEl) {
                timerEl.textContent = formatTimeRemaining(remaining);
            }
        }
    });
}

function getSlotTimeRemaining(group) {
    const slotData = gameState.training.slots[group];
    if (!slotData.startTime) return 0;
    const elapsed = Date.now() - slotData.startTime;
    return Math.max(0, gameState.training.sessionDuration - elapsed);
}

function openPlayerSelectModal(group) {
    // Get available players for this position group
    const availablePlayers = gameState.players.filter(player => {
        const posData = POSITIONS[player.position];
        if (!posData || posData.group !== group) return false;

        // Check if already training
        const alreadyTraining = Object.values(gameState.training.slots).some(
            slot => slot.playerId === player.id
        );
        return !alreadyTraining;
    });

    if (availablePlayers.length === 0) {
        alert(`Geen ${POSITION_GROUP_LABELS[group].toLowerCase()}s beschikbaar voor training.`);
        return;
    }

    // Find an available trainer
    const availableTrainer = Object.entries(gameState.training.trainerStatus)
        .find(([id, data]) => !data.busy);

    if (!availableTrainer) {
        alert('Alle trainers zijn momenteel bezet.');
        return;
    }

    // For simplicity, show a selection prompt
    const playerOptions = availablePlayers.map((p, i) => `${i + 1}. ${p.name} (${p.overall})`).join('\n');
    const selection = prompt(`Selecteer een ${POSITION_GROUP_LABELS[group].toLowerCase()} om te trainen:\n\n${playerOptions}\n\nVoer het nummer in:`);

    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < availablePlayers.length) {
            assignPlayerToTraining(group, availablePlayers[index].id, availableTrainer[0]);
        }
    }
}

function openTrainerAssignModal(trainerId) {
    // Find slots without a trainer
    const emptySlots = Object.entries(gameState.training.slots)
        .filter(([group, data]) => data.playerId && !data.trainerId)
        .map(([group, data]) => {
            const player = gameState.players.find(p => p.id === data.playerId);
            return { group, player };
        });

    if (emptySlots.length === 0) {
        alert('Wijs eerst spelers toe aan trainingsposities.');
        return;
    }

    const options = emptySlots.map((slot, i) =>
        `${i + 1}. ${POSITION_GROUP_LABELS[slot.group]} - ${slot.player?.name || 'Onbekend'}`
    ).join('\n');

    const selection = prompt(`Wijs ${TRAINER_STATS[trainerId].name} toe aan:\n\n${options}\n\nVoer het nummer in:`);

    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < emptySlots.length) {
            assignTrainerToSlot(trainerId, emptySlots[index].group);
        }
    }
}

function assignPlayerToTraining(group, playerId, trainerId) {
    gameState.training.slots[group] = {
        playerId: playerId,
        startTime: Date.now(),
        trainerId: trainerId
    };

    gameState.training.trainerStatus[trainerId] = {
        busy: true,
        assignedSlot: group
    };

    renderTrainingPage();
}

function assignTrainerToSlot(trainerId, group) {
    gameState.training.slots[group].trainerId = trainerId;
    gameState.training.slots[group].startTime = Date.now();

    gameState.training.trainerStatus[trainerId] = {
        busy: true,
        assignedSlot: group
    };

    renderTrainingPage();
}

function cancelTraining(group) {
    const slotData = gameState.training.slots[group];

    if (slotData.trainerId) {
        gameState.training.trainerStatus[slotData.trainerId] = {
            busy: false,
            assignedSlot: null
        };
    }

    clearTrainingSlot(group);
    renderTrainingPage();
}

function clearTrainingSlot(group) {
    gameState.training.slots[group] = {
        playerId: null,
        startTime: null,
        trainerId: null
    };
}

function completeTraining(group) {
    const slotData = gameState.training.slots[group];
    const player = gameState.players.find(p => p.id === slotData.playerId);
    const trainer = TRAINER_STATS[slotData.trainerId];

    if (player && trainer) {
        // Apply +1 to the stat
        player.attributes[trainer.stat] = Math.min(99, player.attributes[trainer.stat] + 1);
        player.overall = calculateOverall(player.attributes, player.position);

        alert(`Training voltooid! ${player.name} heeft +1 ${trainer.stat} gekregen.`);
    }

    // Free up the trainer
    if (slotData.trainerId) {
        gameState.training.trainerStatus[slotData.trainerId] = {
            busy: false,
            assignedSlot: null
        };
    }

    clearTrainingSlot(group);
    renderTrainingPage();
    renderPlayerCards();
}

function selectTeamTraining(type) {
    gameState.training.teamTraining.selected = type;

    // Set bonus for next match
    const bonuses = {
        defense: { type: 'defense', value: 10 },
        setpiece: { type: 'setpiece', value: 10 },
        attack: { type: 'attack', value: 10 }
    };

    gameState.training.teamTraining.bonus = bonuses[type];
    renderTeamTraining();
}

// Train my player (individual training, 1x per day)
window.trainMyPlayer = function(key) {
    const mp = initMyPlayer();

    if (hasTrainedToday(mp)) {
        showNotification('Je hebt vandaag al getraind! Kom morgen terug.', 'warning');
        return;
    }

    if (key === 'vrije_tijd') {
        awardPlayerXP(gameState, 'training', 25);
        mp.lastTrainingDate = getTodayString();
        showNotification('Getraind! +25 XP', 'success');
    } else if (key === 'massage') {
        mp.energy = Math.min(100, mp.energy + 50);
        mp.lastTrainingDate = getTodayString();
        showNotification('Massage voltooid! +50% energie', 'success');
    } else if (key === 'spy') {
        mp.lastTrainingDate = getTodayString();
        // Generate opponent intel
        const opponent = generateOpponent(
            gameState.club.division,
            gameState.nextMatch?.opponentPosition || Math.floor(Math.random() * 8) + 1
        );
        const formations = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2'];
        const formation = formations[Math.floor(Math.random() * formations.length)];
        const styles = ['Aanvallend', 'Verdedigend', 'Gebalanceerd', 'Hoog druk', 'Counter'];
        const style = styles[Math.floor(Math.random() * styles.length)];
        const stats = { Aanval: opponent.strength.attack, Middenveld: opponent.strength.midfield, Verdediging: opponent.strength.defense };
        const weakest = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];

        // Give match bonus
        gameState.nextMatchBonus = (gameState.nextMatchBonus || 0) + 3;

        // Show spy report modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'spy-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closeSpyModal()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="closeSpyModal()">&times;</button>
                <h3>Scoutingsrapport</h3>
                <p class="modal-subtitle">${gameState.nextMatch?.opponent || 'Tegenstander'}</p>
                <div class="spy-report">
                    <div class="spy-row"><span class="spy-label">Formatie</span><span class="spy-value">${formation}</span></div>
                    <div class="spy-row"><span class="spy-label">Speelstijl</span><span class="spy-value">${style}</span></div>
                    <div class="spy-row"><span class="spy-label">Aanval</span><span class="spy-value">${opponent.strength.attack}</span></div>
                    <div class="spy-row"><span class="spy-label">Middenveld</span><span class="spy-value">${opponent.strength.midfield}</span></div>
                    <div class="spy-row"><span class="spy-label">Verdediging</span><span class="spy-value">${opponent.strength.defense}</span></div>
                    <div class="spy-weakness">Zwakke plek: <strong>${weakest[0]}</strong> (${weakest[1]})</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
        showNotification('Tegenstander bespioneerd! +3% wedstrijdbonus', 'success');
    }

    saveGame();
    renderTrainingPage();
    renderPlayerCards();
};

window.closeSpyModal = function() {
    const modal = document.getElementById('spy-modal');
    if (modal) { modal.classList.remove('active'); setTimeout(() => modal.remove(), 200); }
};

// Make functions globally available
window.openPlayerSelectModal = openPlayerSelectModal;
window.cancelTraining = cancelTraining;
window.selectTeamTraining = selectTeamTraining;
window.hireStaff = hireStaff;
window.hireAssistant = hireAssistant;
window.closeTrainingModal = closeTrainingModal;
window.selectTrainingPlayer = selectTrainingPlayer;

// ================================================
// MATCH SYSTEM
// ================================================

function updateConstructionTimer() {
    const construction = gameState.stadium.construction;
    if (!construction) return;

    const remaining = construction.completesAt - Date.now();
    const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((remaining % (1000 * 60)) / 1000));
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update map timer
    const mapTimer = document.getElementById('construction-timer-map');
    if (mapTimer) mapTimer.textContent = timeStr;

    // Update panel timer (if open)
    const panelTimer = document.querySelector('.sup-building-timer');
    if (panelTimer) {
        const shortStr = hours > 0 ? `${hours}u ${String(minutes).padStart(2, '0')}m` : `${minutes}m ${String(seconds).padStart(2, '0')}s`;
        panelTimer.textContent = shortStr;
    }
}

function updateMatchTimer() {
    checkConstruction();
    updateConstructionTimer();
    const remaining = gameState.nextMatch.time - Date.now();

    // Update new kantine board timer segments
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    const playBtn = document.getElementById('play-match-btn');
    if (hoursEl && minutesEl && secondsEl) {
        if (remaining <= 0) {
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            // Match ready — show play button
            if (playBtn) {
                playBtn.classList.add('match-ready');
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg> SPEEL WEDSTRIJD';
                playBtn.onclick = playMatch;
            }
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');

            // Match not ready — show "Bekijk vorige wedstrijd" if there is match history
            if (playBtn && gameState.matchHistory && gameState.matchHistory.length > 0) {
                playBtn.classList.remove('match-ready');
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7a6.97 6.97 0 0 1-4.95-2.05l-1.41 1.41A8.97 8.97 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg> BEKIJK VORIGE WEDSTRIJD';
                playBtn.onclick = function() {
                    navigateToPage('wedstrijden');
                    setTimeout(() => activateTabOnPage('wedstrijden', 'verslag'), 50);
                };
            }
        }
    }

    // Also update old timer element for compatibility
    const timerEl = document.getElementById('match-timer');
    if (timerEl && !hoursEl) {
        timerEl.textContent = remaining <= 0 ? 'Nu spelen!' : formatTimeRemaining(remaining);
    }
}

// ================================================
// MODALS
// ================================================

function showPlayerDetail(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const modal = document.getElementById('player-modal');
    const content = document.getElementById('player-detail-content');

    const personalityClass = PERSONALITIES.good.includes(player.personality) ? 'good' :
                            PERSONALITIES.bad.includes(player.personality) ? 'bad' : '';

    const marketValue = calculatePlayerValue(player, gameState.club.division);
    const minPrice = Math.round(marketValue * 0.5);
    const maxPrice = Math.round(marketValue * 2.5);
    const defaultPrice = marketValue;

    content.innerHTML = `
        <div class="player-detail-header">
            <div class="player-detail-avatar" style="background: ${POSITIONS[player.position].color}">${getInitials(player.name)}</div>
            <div class="player-detail-info">
                <h2>${player.name} ${player.nationality.flag}</h2>
                <div class="player-detail-meta">
                    <span>${player.age} jaar</span>
                    <span>${POSITIONS[player.position].name}</span>
                    <span>ALG: ${player.overall}</span>
                    <span>${renderStarsHTML(player.stars || 0.5)}</span>
                </div>
            </div>
        </div>

        <div class="player-detail-personality">
            <h4>Persoonlijkheid</h4>
            <span class="personality-badge ${personalityClass}">${player.personality}</span>
        </div>

        <div class="player-detail-stats">
            <div class="stat-box">
                <span class="stat-value">${player.goals}</span>
                <span class="stat-label">Doelpunten</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${player.assists}</span>
                <span class="stat-label">Assists</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${player.morale}%</span>
                <span class="stat-label">Moraal</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${formatCurrency(player.salary)}</span>
                <span class="stat-label">Salaris/week</span>
            </div>
        </div>

        <div class="player-transfer-section">
            <h4>Zet op Transfermarkt</h4>
            <div class="transfer-price-setting">
                <input type="range" class="transfer-price-slider" id="transfer-list-price"
                       min="${minPrice}" max="${maxPrice}" value="${defaultPrice}" step="100">
                <span class="transfer-price-display" id="transfer-list-price-display">${formatCurrency(defaultPrice)}</span>
            </div>
            <div class="transfer-price-info">
                <span>Min: ${formatCurrency(minPrice)} (0.5x)</span>
                <span>Marktwaarde: ${formatCurrency(marketValue)}</span>
                <span>Max: ${formatCurrency(maxPrice)} (2.5x)</span>
            </div>
            <button class="btn-list-transfer" data-player-id="${player.id}">
                Zet op Transfermarkt
            </button>
        </div>

        <div class="player-buyout-section">
            <h4>Contract afkopen</h4>
            <p class="buyout-info">Kost 10x het weeksalaris om het contract te ontbinden.</p>
            <div class="buyout-cost">Afkoopsom: <strong>${formatCurrency((player.salary || 0) * 10)}</strong></div>
            <button class="btn-buyout" data-player-id="${player.id}" ${gameState.club.budget >= (player.salary || 0) * 10 ? '' : 'disabled'}>
                Afkopen — ${formatCurrency((player.salary || 0) * 10)}
            </button>
        </div>
    `;

    // Add slider listener
    const slider = document.getElementById('transfer-list-price');
    const display = document.getElementById('transfer-list-price-display');
    if (slider && display) {
        slider.addEventListener('input', () => {
            display.textContent = formatCurrency(parseInt(slider.value));
        });
    }

    // Add transfer button listener
    const transferBtn = content.querySelector('.btn-list-transfer');
    if (transferBtn) {
        transferBtn.addEventListener('click', () => {
            const price = parseInt(slider.value);
            listPlayerOnTransferMarket(playerId, price);
        });
    }

    // Add buyout button listener
    const buyoutBtn = content.querySelector('.btn-buyout');
    if (buyoutBtn) {
        buyoutBtn.addEventListener('click', () => {
            buyoutPlayer(playerId);
        });
    }

    modal.classList.add('active');
}

function buyoutPlayer(playerId) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];
    const cost = (player.salary || 0) * 10;

    if (gameState.club.budget < cost) {
        showNotification('Niet genoeg budget voor de afkoopsom!', 'error');
        return;
    }

    if (!confirm(`Wil je het contract van ${player.name} afkopen voor ${formatCurrency(cost)}?`)) return;

    gameState.club.budget -= cost;
    gameState.players.splice(playerIndex, 1);

    // Remove from lineup if present
    for (const pos of Object.keys(gameState.lineup)) {
        if (gameState.lineup[pos] === playerId) {
            gameState.lineup[pos] = null;
        }
    }

    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.remove('active');

    showNotification(`${player.name} afgekocht voor ${formatCurrency(cost)}.`, 'info');
    renderPlayerCards();
    updateBudgetDisplays();
    saveGame();
}

async function listPlayerOnTransferMarket(playerId, price) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];

    if (confirm(`Wil je ${player.name} op de transfermarkt zetten voor ${formatCurrency(price)}?`)) {
        if (isMultiplayer()) {
            // Multiplayer: insert into shared transfer_market table
            try {
                const { error } = await supabase.from('transfer_market').insert({
                    league_id: gameState.multiplayer.leagueId,
                    player_name: player.name,
                    player_data: {
                        age: player.age,
                        position: player.position,
                        nationality: player.nationality || 'nl',
                        overall: player.overall,
                        stars: player.stars || 0.5,
                        attributes: player.attributes || {}
                    },
                    listed_by_club_id: gameState.multiplayer.clubId,
                    price: price,
                    salary: player.salary || 0,
                    min_division: gameState.club.division,
                    is_free_agent: price === 0
                });

                if (error) throw error;

                // Mark player as listed in DB
                await supabase.from('players').update({ listed_for_sale: true }).eq('id', playerId);

                // Remove from local squad
                gameState.players.splice(playerIndex, 1);
                showNotification(`${player.name} staat nu op de transfermarkt!`, 'success');
            } catch (err) {
                alert('Fout bij plaatsen op transfermarkt: ' + err.message);
                return;
            }
        } else {
            // Singleplayer: local transfer market
            gameState.players.splice(playerIndex, 1);
            player.price = price;
            player.listedByPlayer = true;
            gameState.transferMarket.players.push(player);
            alert(`${player.name} staat nu op de transfermarkt voor ${formatCurrency(price)}!`);
        }

        document.getElementById('player-modal').classList.remove('active');
        renderPlayerCards();
    }
}

// ================================================
// NAVIGATION & INITIALIZATION
// ================================================

function navigateToPage(page) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page)?.classList.add('active');

    // Scroll to top of the main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Clean up scout mission timer when leaving scout page
    if (page !== 'scout') clearScoutMissionTimer();

    // Render page-specific content
    if (page === 'squad') renderPlayerCards();
    if (page === 'tactics') renderTacticsPage();
    if (page === 'training') {
        renderTrainingPage();
        initTrainingTabs();
    }
    if (page === 'stadium') renderStadiumPage();
    if (page === 'scout') renderScoutPage();
    if (page === 'transfers') renderTransferMarket();
    if (page === 'finances') renderDailyFinances();
    if (page === 'sponsors') renderSponsorsPage();
    // activities page removed
    if (page === 'staff') renderStaffCenterPage();
    if (page === 'prestaties') {
        renderVoortgang();
        initPrestatieTabs();
    }
    if (page === 'mijnteam') openClubIdentityModal();
    if (page === 'jeugdteam') renderJeugdteamPage();
    if (page === 'kantine') renderKantineDashboard();
    if (page === 'wedstrijden') renderMatchesPage();

    // Track daily checklist visits
    const checklistMap = {
        'tactics': 'tacticsVisited',
        'sponsors': 'sponsorsVisited',
        'scout': 'scoutStarted',
        'jeugdteam': 'youthVisited',
        'transfers': 'transfersVisited',
        'stadium': 'stadiumVisited',
        'staff': 'staffVisited'
    };
    if (checklistMap[page]) {
        markChecklistItem(checklistMap[page]);
    }
}

function initNavigation() {
    // Position fixed submenus on hover
    document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const submenu = item.querySelector('.nav-submenu');
            if (submenu) {
                const rect = item.getBoundingClientRect();
                submenu.style.top = rect.top + 'px';
            }
        });
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't navigate if clicking on submenu
            if (e.target.closest('.nav-submenu')) return;
            navigateToPage(item.dataset.page);

            // Close mobile sidebar after navigation
            document.querySelector('.sidebar')?.classList.remove('sidebar-open');
            document.getElementById('sidebar-overlay')?.classList.remove('active');
            document.getElementById('hamburger-btn')?.classList.remove('active');
        });
    });

    // Handle submenu clicks
    document.querySelectorAll('.nav-submenu li').forEach(subItem => {
        subItem.addEventListener('click', (e) => {
            e.stopPropagation();
            const navItem = subItem.closest('.nav-item');
            const page = navItem.dataset.page;
            const tab = subItem.dataset.tab;

            // Navigate to page first
            navigateToPage(page);

            // Then activate the specific tab
            setTimeout(() => {
                activateTabOnPage(page, tab);
            }, 50);
        });
    });

    // Club identity modal via sidebar header
    const sidebarHeaderBtn = document.getElementById('sidebar-header-btn');
    if (sidebarHeaderBtn) {
        sidebarHeaderBtn.style.cursor = 'pointer';
        sidebarHeaderBtn.addEventListener('click', () => openClubIdentityModal());
    }

    // Mobile hamburger menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
            sidebarOverlay.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            sidebarOverlay.classList.remove('active');
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
        });
    }
}

function activateTabOnPage(page, tab) {
    if (page === 'tactics') {
        const tabBtn = document.querySelector(`.tactics-tab[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'training') {
        const tabBtn = document.querySelector(`.training-tab[data-training-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'staff') {
        const tabBtn = document.querySelector(`.staff-tab[data-staff-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'wedstrijden') {
        const tabBtn = document.querySelector(`.matches-tab[data-matches-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'prestaties') {
        const tabBtn = document.querySelector(`.page-tab[data-page-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    }
}

function initQuickActions() {
    const actionToPage = {
        'training': 'training',
        'lineup': 'tactics',
        'scout': 'scout',
        'stadium': 'stadium'
    };

    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const page = actionToPage[action];
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPlayerCards();
        });
    });
}

function initModals() {
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        });
    });
}

function initTrainingButton() {
    const btn = document.getElementById('execute-training-btn');
    if (btn) {
        btn.addEventListener('click', executeTraining);
    }
}

function updateBudgetDisplays() {
    const budget = gameState.club.budget;
    const formattedBudget = formatCurrency(budget);

    // Update all budget displays
    document.querySelectorAll('.budget-display, .budget-value').forEach(el => {
        el.textContent = formattedBudget;
    });

    // Update header budget display (new dashboard)
    const headerBudget = document.getElementById('header-budget');
    if (headerBudget) {
        headerBudget.textContent = formattedBudget;
    }

    // Update global budget display
    const globalBudget = document.getElementById('global-budget-display');
    const globalAmount = document.getElementById('global-budget-amount');
    if (globalBudget && globalAmount) {
        globalAmount.textContent = formattedBudget;

        // Update styling based on budget level
        globalBudget.classList.remove('low-budget', 'high-budget');
        if (budget < 1000) {
            globalBudget.classList.add('low-budget');
        } else if (budget > 20000) {
            globalBudget.classList.add('high-budget');
        }

        // Pulse animation
        globalBudget.classList.remove('budget-changed');
        void globalBudget.offsetWidth; // Trigger reflow
        globalBudget.classList.add('budget-changed');
    }
}

function startTimers() {
    // Update training timer every second
    setInterval(() => {
        updateTrainingTimers();
    }, 1000);

    // Update match timer
    setInterval(updateMatchTimer, 1000);
}

// ================================================
// TRANSFER MARKET
// ================================================

function generateTransferMarket() {
    // In multiplayer, transfer market comes from shared Supabase table
    if (isMultiplayer()) return;

    const players = [];
    const division = gameState.club.division;
    const count = random(10, 20);

    for (let i = 0; i < count; i++) {
        // Mix: 40% own division, 25% one higher, 20% two higher, 15% three higher
        const roll = Math.random();
        let playerDiv;
        if (roll < 0.40) {
            playerDiv = division;
        } else if (roll < 0.65) {
            playerDiv = Math.max(1, division - 1);
        } else if (roll < 0.85) {
            playerDiv = Math.max(1, division - 2);
        } else {
            playerDiv = Math.max(1, division - 3);
        }

        const player = generatePlayer(playerDiv);

        // Cap overall to division max
        const divInfo = getDivision(playerDiv);
        if (player.overall > divInfo.maxAttr) {
            player.overall = random(Math.max(divInfo.minAttr, divInfo.maxAttr - 3), divInfo.maxAttr);
        }

        // 6e Klasse (id 8): klein salaris, geen transferwaarde
        if (playerDiv === 8) {
            player.price = 0;
            player.signingBonus = 0;
            player.isFreeAgent = true;
        } else {
            // 5e Klasse en hoger: salaris + transferwaarde
            if (Math.random() < 0.20) {
                player.price = 0;
                player.signingBonus = Math.round(player.salary * 52 * 0.3);
                player.isFreeAgent = true;
            } else {
                player.price = calculatePlayerValue(player, playerDiv);
                player.signingBonus = 0;
                player.isFreeAgent = false;
            }
        }

        // Minimaal gewenst niveau (lager getal = betere divisie)
        if (playerDiv < division) {
            // Speler uit betere divisie: 20% kans bereid te zakken, anders blijft bij eigen niveau
            player.minDivision = Math.random() < 0.20 ? division : playerDiv;
        } else {
            player.minDivision = division;
        }

        players.push(player);
    }

    gameState.transferMarket.players = players.sort((a, b) => b.overall - a.overall);
    gameState.transferMarket.lastRefresh = Date.now();
}

// Migrate old transfer players missing minDivision
function migrateTransferMinDivision() {
    const division = gameState.club.division;
    (gameState.transferMarket.players || []).forEach(p => {
        if (p.minDivision === undefined) {
            // Assign based on overall relative to division average
            const divInfo = getDivision(division);
            const avg = (divInfo.minAttr + divInfo.maxAttr) / 2;
            if (p.overall > avg * 1.3) {
                p.minDivision = Math.max(1, division - 2);
            } else if (p.overall > avg * 1.1) {
                p.minDivision = Math.max(1, division - 1);
            } else {
                p.minDivision = division;
            }
        }
    });
}

// Helper to get obscured value range (shows range instead of exact value)
function getValueRange(value, variance = 4) {
    const min = Math.max(1, value - variance);
    const max = Math.min(99, value + variance);
    return `${min}-${max}`;
}

// Helper to get potential range (larger variance for more uncertainty)
function getPotentialRange(potential, overall) {
    const variance = 6; // Larger range for potential
    const min = Math.max(overall, potential - variance);
    const max = Math.min(99, potential + variance);
    return `${min}-${max}`;
}

async function loadMultiplayerTransferMarket() {
    if (!isMultiplayer() || !gameState.multiplayer.leagueId) return;
    const listings = await fetchTransferMarket(gameState.multiplayer.leagueId);
    gameState.transferMarket.players = listings.map(l => ({
        id: l.id,
        name: l.player_name,
        ...l.player_data,
        price: Number(l.price),
        signingBonus: Number(l.signing_bonus),
        salary: Number(l.salary),
        minDivision: l.min_division,
        isFreeAgent: l.is_free_agent,
        listedByPlayer: l.listed_by_club_id !== null,
        _listingId: l.id
    }));
    gameState.transferMarket.lastRefresh = Date.now();
}

function renderTransferMarket() {
    const container = document.getElementById('transfer-list');
    if (!container) return;

    // In multiplayer, load from shared market
    if (isMultiplayer() && (!gameState.transferMarket.lastRefresh || Date.now() - gameState.transferMarket.lastRefresh > 30000)) {
        loadMultiplayerTransferMarket().then(() => renderTransferMarket());
        return;
    }

    // Get active filters
    const positionFilter = document.querySelector('.transfer-filter.active')?.dataset.filter || 'all';
    const minPrice = parseInt(document.getElementById('transfer-min-price')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('transfer-max-price')?.value) || 50000;
    const freeOnly = document.getElementById('transfer-free-only')?.checked || false;
    const interestedOnly = document.getElementById('transfer-interested-only')?.checked || false;

    let players = [...gameState.transferMarket.players];

    // Apply position filter
    if (positionFilter !== 'all') {
        players = players.filter(p => getPositionGroup(p.position) === positionFilter);
    }

    // Apply price filter
    if (freeOnly) {
        players = players.filter(p => p.price === 0);
    } else {
        players = players.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }

    // Apply interested filter (includes players one div above — buyable at premium)
    const clubDiv = gameState.club.division;
    if (interestedOnly) {
        players = players.filter(p => {
            const md = p.minDivision ?? clubDiv;
            return md >= clubDiv || md === clubDiv - 1;
        });
    }

    if (players.length === 0) {
        container.innerHTML = '<p class="no-results">Geen spelers gevonden met deze filters.</p>';
        return;
    }

    // Group by position (like squad page)
    const groups = {
        attacker: { name: 'Aanvallers', icon: '⚽', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', players: [] }
    };

    players.forEach(player => {
        const group = getPositionGroup(player.position);
        if (groups[group]) groups[group].players.push(player);
    });

    let html = '';
    for (const [key, group] of Object.entries(groups)) {
        if (group.players.length === 0) continue;

        html += `<div class="squad-group">
            <div class="squad-group-header">
                <span class="squad-group-icon">${group.icon}</span>
                <span class="squad-group-name">${group.name}</span>
                <span class="squad-group-count">${group.players.length}</span>
            </div>
            <div class="squad-group-players">`;

        group.players.forEach(player => {
            const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
            const overallDisplay = player.overall;
            const priceText = player.price === 0 ? 'Transfervrij' : formatCurrency(player.price);
            const energy = player.energy || 75;
            const minDiv = player.minDivision ?? clubDiv;
            const isInterested = minDiv >= clubDiv;
            const isOneAbove = !isInterested && minDiv === clubDiv - 1;
            const minDivInfo = getDivision(minDiv);

            // Stars rating (fixed property)
            const realStars = player.stars || 0.5;
            const knownStars = Math.max(0.5, realStars - 1); // 1 star uncertainty
            const uncertainStars = realStars - knownStars; // the uncertain part

            html += `
                <div class="player-card transfer-card" data-player-id="${player.id}">
                    <div class="pc-left">
                        <span class="pc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                        <div class="pc-age-box">
                            <span class="pc-age-value">${player.age}</span>
                            <span class="pc-age-label">jr</span>
                        </div>
                        <img class="pc-flag-img" src="https://flagcdn.com/w40/${(player.nationality.code || 'nl').toLowerCase()}.png" alt="${player.nationality.code || 'NL'}" />
                    </div>
                    <span class="pc-name">${player.name}</span>
                    <span class="pc-finance">
                        <span class="pc-salary">${formatCurrency(player.salary ?? 0)}/w</span>
                        <span class="pc-value">${priceText}</span>
                    </span>
                    <div class="pc-condition-bars">
                        <div class="pc-bar-item">
                            <span class="pc-bar-label">Energie</span>
                            <div class="pc-bar-track">
                                <div class="pc-bar-fill" style="width: ${energy}%; background: ${getBarColor(energy)}"></div>
                            </div>
                            <span class="pc-bar-value">${energy}%</span>
                        </div>
                    </div>
                    <div class="pc-ratings">
                        <div class="pc-overall" style="background: ${posData.color}">
                            <span class="pc-overall-value">${overallDisplay}</span>
                            <span class="pc-overall-label">ALG</span>
                        </div>
                        <div class="pc-potential-stars">
                            <span class="pc-stars">${renderTransferStarsHTML(knownStars, uncertainStars)}</span>
                            <span class="pc-potential-label">POT</span>
                        </div>
                    </div>
                    ${isInterested
                        ? `<button class="btn btn-primary btn-sm btn-transfer-buy" data-player-id="${player.id}">Kopen</button>`
                        : isOneAbove
                            ? `<span class="pc-min-division pc-min-premium" data-player-id="${player.id}">Min. ${minDivInfo?.name || 'div. ' + minDiv}</span>`
                            : `<span class="pc-min-division" title="Wil minimaal ${minDivInfo?.name || minDiv} spelen">Min. ${minDivInfo?.name || 'div. ' + minDiv}</span>`
                    }
                </div>
            `;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;

    // Add buy handlers
    document.querySelectorAll('.btn-transfer-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = parsePlayerId(btn.dataset.playerId);
            handleTransferBuy(playerId, false);
        });
    });

    // Add premium (one div above) handlers
    document.querySelectorAll('.pc-min-premium').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = parsePlayerId(el.dataset.playerId);
            handleTransferBuy(playerId, true);
        });
    });
}

async function handleTransferBuy(playerId, isPremium = false) {
    const player = gameState.transferMarket.players.find(p => p.id === playerId);
    if (!player) return;

    const totalCost = player.price + (player.signingBonus || 0);

    if (totalCost > gameState.club.budget) {
        alert('Je hebt niet genoeg budget!');
        return;
    }

    // Premium: double salary for players one division above
    if (isPremium) {
        player.salary = Math.round(player.salary * 2);
    }

    const costText = player.price === 0
        ? `gratis (${formatCurrency(player.signingBonus)} tekengeld)`
        : formatCurrency(player.price);
    const premiumNote = isPremium ? ` (dubbel salaris: ${formatCurrency(player.salary)}/w)` : '';

    if (confirm(`Wil je ${player.name} contracteren voor ${costText}${premiumNote}?`)) {
        if (isMultiplayer() && player._listingId) {
            // Multiplayer: atomic transfer via Edge Function
            try {
                const { data, error } = await supabase.rpc('execute_transfer', {
                    p_listing_id: player._listingId,
                    p_buyer_club_id: gameState.multiplayer.clubId,
                    p_buyer_user_id: gameState.multiplayer.userId
                });

                if (error) throw error;
                if (!data.success) {
                    alert(data.error || 'Transfer mislukt');
                    return;
                }

                // Refresh from server
                await loadMultiplayerTransferMarket();
                gameState.club.budget -= data.total_cost;
                // Player will appear after sync
                showNotification(`${player.name} is gekocht!`, 'success');
            } catch (err) {
                alert('Transfer mislukt: ' + err.message);
                return;
            }
        } else {
            if (gameState.players.length >= 18) {
                showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
                return;
            }
            // Singleplayer: local transfer
            gameState.club.budget -= totalCost;
            gameState.players.push(player);
            gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== playerId);
            alert(`${player.name} is toegevoegd aan je selectie!`);
        }

        updateBudgetDisplays();
        renderTransferMarket();
    } else if (isPremium) {
        // Revert salary if cancelled
        player.salary = Math.round(player.salary / 2);
    }
}

function initTransferMarket() {
    // Generate initial market if empty
    if (gameState.transferMarket.players.length === 0) {
        generateTransferMarket();
    }

    // Migrate old players missing minDivision
    migrateTransferMinDivision();

    // Add position filter button listeners
    document.querySelectorAll('.transfer-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.transfer-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTransferMarket();
        });
    });

    // Price range inputs
    const minPriceInput = document.getElementById('transfer-min-price');
    const maxPriceInput = document.getElementById('transfer-max-price');
    const freeOnlyCheckbox = document.getElementById('transfer-free-only');

    if (minPriceInput) {
        minPriceInput.addEventListener('change', () => {
            // Ensure min doesn't exceed max
            const max = parseInt(maxPriceInput?.value) || 50000;
            if (parseInt(minPriceInput.value) > max) {
                minPriceInput.value = max;
            }
            renderTransferMarket();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', () => {
            // Ensure max doesn't go below min
            const min = parseInt(minPriceInput?.value) || 0;
            if (parseInt(maxPriceInput.value) < min) {
                maxPriceInput.value = min;
            }
            renderTransferMarket();
        });
    }

    if (freeOnlyCheckbox) {
        freeOnlyCheckbox.addEventListener('change', () => {
            // Disable price inputs when "free only" is checked
            if (minPriceInput) minPriceInput.disabled = freeOnlyCheckbox.checked;
            if (maxPriceInput) maxPriceInput.disabled = freeOnlyCheckbox.checked;
            renderTransferMarket();
        });
    }

    // Interested only checkbox
    const interestedCheckbox = document.getElementById('transfer-interested-only');
    if (interestedCheckbox) {
        interestedCheckbox.addEventListener('change', renderTransferMarket);
    }

    // Refresh button
    document.getElementById('refresh-market-btn')?.addEventListener('click', () => {
        generateTransferMarket();
        renderTransferMarket();
    });
}

// ================================================
// SCOUT CRITERIA SYSTEM
// ================================================

function calculateScoutSuccessChance() {
    let chance = 100;

    const position = document.getElementById('scout-position')?.value || 'all';
    const minAge = parseInt(document.getElementById('scout-min-age')?.value) || 16;
    const maxAge = parseInt(document.getElementById('scout-max-age')?.value) || 35;
    const minPotential = parseInt(document.getElementById('scout-min-potential')?.value) || 0;
    const minAan = parseInt(document.getElementById('scout-min-aan')?.value) || 0;
    const minVer = parseInt(document.getElementById('scout-min-ver')?.value) || 0;
    const minTec = parseInt(document.getElementById('scout-min-tec')?.value) || 0;
    const minSne = parseInt(document.getElementById('scout-min-sne')?.value) || 0;
    const minFys = parseInt(document.getElementById('scout-min-fys')?.value) || 0;

    // Position specificity
    if (position !== 'all') chance -= 10;

    // Age-based success chance:
    // - Younger players (under 23) are HARDER to find (scouts compete for them)
    // - Older players (over 28) are EASIER to find (less competition)
    if (minAge < 20) {
        chance -= 20; // Very young talent is rare
    } else if (minAge < 23) {
        chance -= 10; // Young talent penalty
    } else if (minAge >= 28) {
        chance += 5; // Older players easier to find
    }
    if (minAge >= 30) {
        chance += 5; // Even easier for veterans
    }

    // Age range restriction (narrower = harder)
    const ageRange = maxAge - minAge;
    if (ageRange < 5) {
        chance -= (5 - ageRange) * 5;
    }

    // Potential requirement (higher = harder to find)
    if (minPotential > 0) {
        chance -= Math.floor(minPotential / 10) * 8;
    }

    // Attribute minimums (each 10 points above 0 = -5%)
    chance -= Math.floor(minAan / 10) * 5;
    chance -= Math.floor(minVer / 10) * 5;
    chance -= Math.floor(minTec / 10) * 5;
    chance -= Math.floor(minSne / 10) * 5;
    chance -= Math.floor(minFys / 10) * 5;

    return Math.max(5, Math.min(100, chance));
}

function updateScoutSuccessDisplay() {
    const chance = calculateScoutSuccessChance();
    const fill = document.getElementById('success-meter-fill');
    const percentage = document.getElementById('success-percentage');
    const hint = document.getElementById('success-hint');

    if (fill) fill.style.width = `${chance}%`;
    if (percentage) percentage.textContent = `${chance}%`;

    if (hint) {
        if (chance >= 80) {
            hint.textContent = 'Hoge kans om een speler te vinden!';
            fill.style.background = '#4caf50';
        } else if (chance >= 50) {
            hint.textContent = 'Redelijke kans, kan even duren...';
            fill.style.background = '#ff9800';
        } else {
            hint.textContent = 'Lage kans - overweeg bredere criteria';
            fill.style.background = '#f44336';
        }
    }
}

// Scout Advisor Tips
const SCOUT_ADVICE = {
    youngTalent: "Jonge talenten (onder 20) zijn extreem zeldzaam! Elke club jaagt op deze pareltjes. Het voordeel: als je ze vindt, ken ik hun exacte potentieel - geen gokwerk zoals op de transfermarkt.",
    youngPlayers: "Spelers van 20-23 zijn populair. Moeilijker te vinden, maar ik kan je precies vertellen wat hun plafond is. Op de transfermarkt zie je alleen schattingen!",
    experienced: "Ervaren spelers (28+) vind ik makkelijk. Minder potentieel, maar wel zekerheid. Hun stats zijn wat je krijgt - geen verrassingen.",
    highPotential: "Hoog potentieel als eis? Lastig! Maar als ik ze vind, weet je precies wat je koopt. De transfermarkt toont alleen vage ranges.",
    specific: "Specifieke eisen maken het zoeken lastiger. Maar elk speler die ik vind is grondig geanalyseerd - je ziet exacte waardes, niet geschatte ranges.",
    general: "Met scouting krijg je zekerheid! Op de transfermarkt zie je geschatte ranges (bijv. 45-52). Ik geef je de echte cijfers. Dat is mijn toegevoegde waarde.",
    system: "Hoe het werkt: De transfermarkt toont onzekere info (ranges). Via mij krijg je exacte stats, potentieel en persoonlijkheid. Investeer in kennis!"
};

function updateScoutAdvice() {
    const adviceEl = document.getElementById('scout-advice');
    if (!adviceEl) return;

    const minAge = parseInt(document.getElementById('scout-min-age')?.value) || 16;
    const minPotential = parseInt(document.getElementById('scout-min-potential')?.value) || 0;
    const position = document.getElementById('scout-position')?.value || 'all';

    let advice = '';

    if (minAge < 20) {
        advice = SCOUT_ADVICE.youngTalent;
    } else if (minAge < 23) {
        advice = SCOUT_ADVICE.youngPlayers;
    } else if (minAge >= 28) {
        advice = SCOUT_ADVICE.experienced;
    } else if (minPotential > 60) {
        advice = SCOUT_ADVICE.highPotential;
    } else if (position !== 'all') {
        advice = SCOUT_ADVICE.specific;
    } else {
        advice = SCOUT_ADVICE.general;
    }

    adviceEl.innerHTML = `<p>${advice}</p>`;
}

function initScoutCriteria() {
    // Age range sliders
    const minAgeSlider = document.getElementById('scout-min-age');
    const maxAgeSlider = document.getElementById('scout-max-age');
    const ageDisplay = document.getElementById('age-range-display');
    const ageHint = document.getElementById('scout-age-hint');

    const updateAgeDisplay = () => {
        const min = parseInt(minAgeSlider?.value) || 16;
        const max = parseInt(maxAgeSlider?.value) || 35;
        if (ageDisplay) ageDisplay.textContent = `${min} - ${max}`;

        // Update age hint based on age range
        if (ageHint) {
            if (min < 20) {
                ageHint.textContent = '⚠️ Jonge talenten zijn moeilijk te vinden!';
                ageHint.style.color = '#f44336';
            } else if (min < 23) {
                ageHint.textContent = 'Jonge spelers zijn lastiger te vinden';
                ageHint.style.color = '#ff9800';
            } else if (min >= 28) {
                ageHint.textContent = '✓ Ervaren spelers zijn makkelijker te vinden';
                ageHint.style.color = '#4caf50';
            } else {
                ageHint.textContent = 'Standaard leeftijdsrange';
                ageHint.style.color = 'var(--text-muted)';
            }
        }
        updateScoutSuccessDisplay();
        updateScoutAdvice();
    };

    minAgeSlider?.addEventListener('input', updateAgeDisplay);
    maxAgeSlider?.addEventListener('input', updateAgeDisplay);

    // Potential slider
    const potentialSlider = document.getElementById('scout-min-potential');
    const potentialDisplay = document.getElementById('potential-display');

    potentialSlider?.addEventListener('input', () => {
        if (potentialDisplay) potentialDisplay.textContent = potentialSlider.value;
        updateScoutSuccessDisplay();
        updateScoutAdvice();
    });

    // Position dropdown
    document.getElementById('scout-position')?.addEventListener('change', () => {
        updateScoutSuccessDisplay();
        updateScoutAdvice();
    });

    // Attribute sliders
    ['aan', 'ver', 'tec', 'sne', 'fys'].forEach(attr => {
        const slider = document.getElementById(`scout-min-${attr}`);
        const valueDisplay = document.getElementById(`scout-min-${attr}-val`);

        slider?.addEventListener('input', () => {
            if (valueDisplay) valueDisplay.textContent = slider.value;
            updateScoutSuccessDisplay();
        });
    });

    // Initial display update
    updateAgeDisplay();
    updateScoutSuccessDisplay();
    updateScoutAdvice();
}

// ================================================
// ADVANCED TACTICS HANDLERS
// ================================================

// initAdvancedTactics, updateMarkingExplanation, updateSliderLabels removed — replaced by renderTacticsOptions

// ================================================
// TACTICS TABS & LINEUP BUILDER
// ================================================

function initTacticsTabs() {
    const tabs = document.querySelectorAll('.tactics-tab');
    const panels = document.querySelectorAll('.tactics-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetTab}-panel`) {
                    panel.classList.add('active');
                }
            });

            if (targetTab === 'opstelling') {
                renderLineupPitch();
                renderAvailablePlayers();
                updateLineupFit();
            }
            if (targetTab === 'tactiek') {
                renderTacticsOptions();
                renderTeamTraining();
            }
            if (targetTab === 'specialisten') {
                populateSpecialistSelects();
            }
        });
    });
}

function renderLineupBuilder() {
    const pitchContainer = document.getElementById('lineup-pitch');
    const benchContainer = document.getElementById('lineup-bench');
    const formationDisplay = document.getElementById('lineup-formation-name');
    if (!pitchContainer || !benchContainer) return;

    const formation = gameState.formation;
    const formationData = FORMATIONS[formation];
    if (!formationData) return;

    // Update formation display
    if (formationDisplay) {
        formationDisplay.textContent = formation;
    }

    // Render pitch with field background
    let pitchHTML = `
        <div class="lineup-field-bg">
            <div class="pitch-markings">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area top"></div>
                <div class="goal-area bottom"></div>
            </div>
            <div class="lineup-positions">
    `;
    formationData.positions.forEach((pos, index) => {
        const assignedPlayer = gameState.lineup[index];
        const posData = POSITIONS[pos.role] || { abbr: '??', color: '#666' };

        pitchHTML += `
            <div class="lineup-slot"
                 data-index="${index}"
                 data-role="${pos.role}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 onclick="openLineupDropdown(event, ${index}, '${pos.role}')"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)">
                ${assignedPlayer ? `
                    <div class="lineup-player-filled" style="background: ${posData.color}">
                        <span class="lp-overall">${assignedPlayer.overall}</span>
                        <span class="lp-name">${assignedPlayer.name.split(' ')[0]}</span>
                        <button class="lp-remove" onclick="event.stopPropagation(); removeFromLineup(${index})">×</button>
                    </div>
                ` : `
                    <div class="lineup-slot-empty" style="border-color: ${posData.color}">
                        <span>${posData.abbr}</span>
                        <span class="slot-hint">Klik om te kiezen</span>
                    </div>
                `}
            </div>
        `;
    });
    pitchHTML += '</div></div>';
    pitchContainer.innerHTML = pitchHTML;

    // Render bench grouped by position
    const groups = {
        attacker: { label: 'AAN', players: [] },
        midfielder: { label: 'MID', players: [] },
        defender: { label: 'DEF', players: [] },
        goalkeeper: { label: 'KEE', players: [] }
    };

    // Get players not in lineup
    const lineupIds = Object.values(gameState.lineup).filter(p => p).map(p => p.id);
    const availablePlayers = gameState.players.filter(p => !lineupIds.includes(p.id));

    availablePlayers.forEach(player => {
        const posData = POSITIONS[player.position];
        if (posData && groups[posData.group]) {
            groups[posData.group].players.push(player);
        }
    });

    let benchHTML = '';
    Object.entries(groups).forEach(([group, data]) => {
        benchHTML += `
            <div class="sidebar-group ${data.players.length === 0 ? 'empty' : ''}">
                <div class="sidebar-group-header">${data.label}</div>
                <div class="sidebar-players">
                    ${data.players.map(player => {
                        const posData = POSITIONS[player.position];
                        return `
                            <div class="sidebar-player"
                                 draggable="true"
                                 data-player-id="${player.id}"
                                 ondragstart="handleDragStart(event)"
                                 ondragend="handleDragEnd(event)">
                                <span class="sp-overall" style="background: ${posData?.color || '#666'}">${player.overall}</span>
                                <span class="sp-name">${player.name.split(' ')[0]}</span>
                            </div>
                        `;
                    }).join('') || '<span class="no-players">-</span>'}
                </div>
            </div>
        `;
    });
    benchContainer.innerHTML = benchHTML;
}

function renderLineupPlayer(player) {
    const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
    return `
        <div class="lineup-player" data-player-id="${player.id}">
            <span class="lineup-player-overall">${player.overall}</span>
            <span class="lineup-player-name">${player.name.split(' ')[0]}</span>
            <button class="lineup-remove" onclick="removeFromLineup(${Object.keys(gameState.tactics.lineup).find(k => gameState.tactics.lineup[k]?.id === player.id)})">×</button>
        </div>
    `;
}

// Drag and drop handlers
let draggedPlayerId = null;

function handleDragStart(event) {
    draggedPlayerId = event.target.dataset.playerId;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Find the lineup-slot parent element
    const slot = event.target.closest('.lineup-slot') || event.currentTarget;
    slot.classList.add('drag-over');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    document.querySelectorAll('.lineup-slot').forEach(slot => slot.classList.remove('drag-over'));
}

function handleDrop(event) {
    event.preventDefault();
    // Find the lineup-slot parent element
    const slot = event.target.closest('.lineup-slot') || event.currentTarget;
    slot.classList.remove('drag-over');

    const positionIndex = parseInt(slot.dataset.index);
    const player = gameState.players.find(p => p.id === parsePlayerId(draggedPlayerId));

    if (player && !isNaN(positionIndex)) {
        // Remove player from any existing position
        Object.keys(gameState.lineup).forEach(key => {
            if (gameState.lineup[key]?.id === player.id) {
                gameState.lineup[key] = null;
            }
        });

        // Add player to new position
        gameState.lineup[positionIndex] = player;
        renderLineupBuilder();
        renderPitch(); // Update main pitch too
    }

    draggedPlayerId = null;
}

function removeFromLineup(index) {
    gameState.lineup[index] = null;
    renderLineupBuilder();
    renderPitch();
}

// Lineup dropdown functions
function openLineupDropdown(event, positionIndex, role) {
    event.stopPropagation();

    // Close any existing dropdown
    closeLineupDropdown();

    const slot = event.currentTarget;
    const posData = POSITIONS[role] || { abbr: '??', color: '#666', group: 'midfielder' };

    // Get available players (not in lineup) that fit this position
    const lineupIds = Object.values(gameState.lineup).filter(p => p).map(p => p.id);
    const availablePlayers = gameState.players.filter(p => !lineupIds.includes(p.id));

    // Get best fit players (same position) and alternatives (same group)
    const exactFit = availablePlayers.filter(p => p.position === role);
    const groupFit = availablePlayers.filter(p => {
        const pData = POSITIONS[p.position];
        return pData && pData.group === posData.group && p.position !== role;
    });

    // Sort by overall
    exactFit.sort((a, b) => b.overall - a.overall);
    groupFit.sort((a, b) => b.overall - a.overall);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'lineup-dropdown';
    dropdown.id = 'lineup-dropdown-active';

    let html = `<div class="dropdown-header">${posData.abbr} - Kies speler</div>`;

    if (exactFit.length > 0) {
        html += `<div class="dropdown-section-label">Beste keuze</div>`;
        exactFit.forEach(player => {
            const pData = POSITIONS[player.position];
            html += `
                <div class="dropdown-player" onclick="selectLineupPlayer(${positionIndex}, ${player.id})">
                    <span class="dp-overall" style="background: ${pData?.color || '#666'}">${player.overall}</span>
                    <span class="dp-name">${player.name}</span>
                    <span class="dp-pos">${pData?.abbr || '??'}</span>
                </div>
            `;
        });
    }

    if (groupFit.length > 0) {
        html += `<div class="dropdown-section-label">Alternatieven</div>`;
        groupFit.slice(0, 5).forEach(player => {
            const pData = POSITIONS[player.position];
            html += `
                <div class="dropdown-player alt" onclick="selectLineupPlayer(${positionIndex}, ${player.id})">
                    <span class="dp-overall" style="background: ${pData?.color || '#666'}">${player.overall}</span>
                    <span class="dp-name">${player.name}</span>
                    <span class="dp-pos">${pData?.abbr || '??'}</span>
                </div>
            `;
        });
    }

    if (exactFit.length === 0 && groupFit.length === 0) {
        html += `<div class="dropdown-empty">Geen spelers beschikbaar</div>`;
    }

    dropdown.innerHTML = html;
    slot.appendChild(dropdown);

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', closeLineupDropdown, { once: true });
    }, 10);
}

function closeLineupDropdown() {
    const dropdown = document.getElementById('lineup-dropdown-active');
    if (dropdown) {
        dropdown.remove();
    }
}

function selectLineupPlayer(positionIndex, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // Remove player from any existing position
    Object.keys(gameState.lineup).forEach(key => {
        if (gameState.lineup[key]?.id === player.id) {
            gameState.lineup[key] = null;
        }
    });

    // Add to new position
    gameState.lineup[positionIndex] = player;

    closeLineupDropdown();
    renderLineupBuilder();
    renderPitch();
}

// Make functions globally accessible
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDragEnd = handleDragEnd;
window.handleDrop = handleDrop;
window.removeFromLineup = removeFromLineup;
window.openLineupDropdown = openLineupDropdown;
window.selectLineupPlayer = selectLineupPlayer;

// ================================================
// CLUB SETTINGS
// ================================================

function applyClubColors() {
    document.documentElement.style.setProperty('--primary-green', gameState.club.colors.primary);
    document.documentElement.style.setProperty('--cream', gameState.club.colors.secondary);
    document.documentElement.style.setProperty('--orange', gameState.club.colors.accent);

    // Update badge
    const badgePath = document.getElementById('badge-path');
    const badgeText1 = document.getElementById('badge-text-1');
    const badgeText2 = document.getElementById('badge-text-2');

    if (badgePath) {
        badgePath.setAttribute('fill', gameState.club.colors.primary);
        badgePath.setAttribute('stroke', gameState.club.colors.secondary);
    }
    if (badgeText1) badgeText1.setAttribute('fill', gameState.club.colors.secondary);
    if (badgeText2) badgeText2.setAttribute('fill', gameState.club.colors.accent);
}

function updateClubDisplays() {
    const clubNameDisplay = document.getElementById('club-name-display');
    if (clubNameDisplay) clubNameDisplay.textContent = gameState.club.name;
}

// ================================================
// CLUB IDENTITY MODAL
// ================================================

function openClubIdentityModal() {
    // Remove existing modal if any
    const existing = document.getElementById('club-identity-modal');
    if (existing) existing.remove();

    const isLocked = gameState.club.settingsChangedThisSeason;
    const { primary, secondary, accent } = gameState.club.colors;

    const modal = document.createElement('div');
    modal.id = 'club-identity-modal';
    modal.className = 'club-id-overlay';
    modal.innerHTML = `
        <div class="club-id-backdrop"></div>
        <div class="club-id-modal">
            <button class="club-id-close">&times;</button>
            <div class="club-id-layout">
                <div class="club-id-preview">
                    <svg viewBox="0 0 100 120" class="club-id-badge" id="club-id-badge-svg">
                        <path d="M50 5 L95 25 L95 70 Q95 100 50 115 Q5 100 5 70 L5 25 Z" fill="${primary}" stroke="${secondary}" stroke-width="3"/>
                        <path d="M50 12 L88 28 L88 68 Q88 93 50 107 Q12 93 12 68 L12 28 Z" fill="none" stroke="${secondary}" stroke-width="1" opacity="0.3"/>
                        <g transform="translate(35, 25)">
                            <rect x="0" y="8" width="3" height="22" fill="${secondary}"/>
                            <rect x="27" y="8" width="3" height="22" fill="${secondary}"/>
                            <rect x="0" y="5" width="30" height="4" fill="${secondary}"/>
                            <line x1="4" y1="9" x2="4" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="10" y1="9" x2="10" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="15" y1="9" x2="15" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="20" y1="9" x2="20" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="26" y1="9" x2="26" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="3" y1="15" x2="27" y2="15" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <line x1="3" y1="22" x2="27" y2="22" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
                            <circle cx="15" cy="20" r="6" fill="${accent}" stroke="${secondary}" stroke-width="1"/>
                            <path d="M12 17 L18 23 M18 17 L12 23" stroke="${secondary}" stroke-width="0.8" opacity="0.7"/>
                        </g>
                        <text x="50" y="70" text-anchor="middle" fill="${secondary}" font-family="Bebas Neue, sans-serif" font-size="11" letter-spacing="2">FC</text>
                        <text x="50" y="85" text-anchor="middle" fill="${accent}" font-family="Bebas Neue, sans-serif" font-size="16" font-weight="bold" letter-spacing="1">GOALS</text>
                        <text x="50" y="100" text-anchor="middle" fill="${secondary}" font-family="Bebas Neue, sans-serif" font-size="12" letter-spacing="2">MAKEN</text>
                    </svg>
                    <div class="club-id-kit">
                        <svg viewBox="0 0 80 100" class="club-id-kit-svg">
                            <path d="M20 25 L10 35 L10 50 L15 50 L15 85 L65 85 L65 50 L70 50 L70 35 L60 25 L55 15 L45 10 L35 10 L25 15 Z"
                                  fill="${primary}" stroke="${secondary}" stroke-width="2"/>
                            <path d="M35 10 Q40 15 45 10" fill="none" stroke="${accent}" stroke-width="3"/>
                            <path d="M20 85 L20 95 L35 95 L40 85 L45 95 L60 95 L60 85"
                                  fill="${secondary}" stroke="${primary}" stroke-width="1.5"/>
                        </svg>
                    </div>
                </div>
                <div class="club-id-form">
                    <h3 class="club-id-title">Club Identiteit</h3>
                    ${isLocked ? `
                        <div class="club-id-locked">
                            <span>Je hebt je club dit seizoen al aangepast. Wacht tot volgend seizoen.</span>
                        </div>
                    ` : `
                        <div class="club-id-notice">
                            <span>Je kunt je clubnaam en kleuren <strong>1x per seizoen</strong> wijzigen.</span>
                        </div>
                    `}
                    <div class="club-id-field">
                        <label for="club-id-name">Clubnaam</label>
                        <input type="text" id="club-id-name" class="form-input" maxlength="25" value="${gameState.club.name}" ${isLocked ? 'disabled' : ''}>
                    </div>
                    <div class="club-id-colors">
                        <div class="club-id-color">
                            <label>Primair</label>
                            <input type="color" id="club-id-primary" value="${primary}" ${isLocked ? 'disabled' : ''}>
                        </div>
                        <div class="club-id-color">
                            <label>Secundair</label>
                            <input type="color" id="club-id-secondary" value="${secondary}" ${isLocked ? 'disabled' : ''}>
                        </div>
                        <div class="club-id-color">
                            <label>Accent</label>
                            <input type="color" id="club-id-accent" value="${accent}" ${isLocked ? 'disabled' : ''}>
                        </div>
                    </div>
                    ${!isLocked ? `
                        <button class="btn btn-primary club-id-save">Opslaan</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.club-id-backdrop').addEventListener('click', closeClubIdentityModal);
    modal.querySelector('.club-id-close').addEventListener('click', closeClubIdentityModal);

    // Save handler
    const saveBtn = modal.querySelector('.club-id-save');
    if (saveBtn) saveBtn.addEventListener('click', saveClubIdentity);

    // Live preview listeners
    if (!isLocked) {
        ['club-id-primary', 'club-id-secondary', 'club-id-accent'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', updateClubIdPreview);
        });
    }
}

function updateClubIdPreview() {
    const p = document.getElementById('club-id-primary')?.value;
    const s = document.getElementById('club-id-secondary')?.value;
    const a = document.getElementById('club-id-accent')?.value;
    if (!p || !s || !a) return;

    const badge = document.getElementById('club-id-badge-svg');
    if (badge) {
        badge.querySelector('path').setAttribute('fill', p);
        badge.querySelector('path').setAttribute('stroke', s);
        badge.querySelectorAll('rect, line').forEach(el => {
            if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') el.setAttribute('fill', s);
            if (el.getAttribute('stroke')) el.setAttribute('stroke', s);
        });
        badge.querySelector('circle').setAttribute('fill', a);
        badge.querySelector('circle').setAttribute('stroke', s);
        const texts = badge.querySelectorAll('text');
        if (texts[0]) texts[0].setAttribute('fill', s);
        if (texts[1]) texts[1].setAttribute('fill', a);
        if (texts[2]) texts[2].setAttribute('fill', s);
    }

    // Kit preview
    const kitShirt = document.querySelector('.club-id-kit-svg path:first-child');
    const kitCollar = document.querySelector('.club-id-kit-svg path:nth-child(2)');
    const kitShorts = document.querySelector('.club-id-kit-svg path:nth-child(3)');
    if (kitShirt) { kitShirt.setAttribute('fill', p); kitShirt.setAttribute('stroke', s); }
    if (kitCollar) { kitCollar.setAttribute('stroke', a); }
    if (kitShorts) { kitShorts.setAttribute('fill', s); kitShorts.setAttribute('stroke', p); }
}

function saveClubIdentity() {
    if (gameState.club.settingsChangedThisSeason) return;

    const name = document.getElementById('club-id-name')?.value?.trim();
    const p = document.getElementById('club-id-primary')?.value;
    const s = document.getElementById('club-id-secondary')?.value;
    const a = document.getElementById('club-id-accent')?.value;

    if (!name) { alert('Voer een geldige clubnaam in.'); return; }

    gameState.club.name = name;
    gameState.club.colors.primary = p || gameState.club.colors.primary;
    gameState.club.colors.secondary = s || gameState.club.colors.secondary;
    gameState.club.colors.accent = a || gameState.club.colors.accent;
    gameState.club.settingsChangedThisSeason = true;

    applyClubColors();
    updateClubDisplays();
    updateMainBadgeSVG();
    saveGame(gameState);

    closeClubIdentityModal();
}

function closeClubIdentityModal() {
    const modal = document.getElementById('club-identity-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    }
}


function updateMijnTeamBadgePreview() {
    const badgePreview = document.getElementById('badge-preview-svg');
    if (!badgePreview) return;

    const primary = document.getElementById('team-primary-color')?.value || gameState.club.colors.primary;
    const secondary = document.getElementById('team-secondary-color')?.value || gameState.club.colors.secondary;
    const accent = document.getElementById('team-accent-color')?.value || gameState.club.colors.accent;

    // Copy the main badge SVG content
    badgePreview.innerHTML = `
        <!-- Shield background -->
        <path d="M50 5 L95 25 L95 70 Q95 100 50 115 Q5 100 5 70 L5 25 Z" fill="${primary}" stroke="${secondary}" stroke-width="3"/>

        <!-- Inner shield decoration -->
        <path d="M50 12 L88 28 L88 68 Q88 93 50 107 Q12 93 12 68 L12 28 Z" fill="none" stroke="${secondary}" stroke-width="1" opacity="0.3"/>

        <!-- Goal net symbol -->
        <g transform="translate(35, 25)">
            <!-- Goal posts -->
            <rect x="0" y="8" width="3" height="22" fill="${secondary}"/>
            <rect x="27" y="8" width="3" height="22" fill="${secondary}"/>
            <rect x="0" y="5" width="30" height="4" fill="${secondary}"/>
            <!-- Net lines -->
            <line x1="4" y1="9" x2="4" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="10" y1="9" x2="10" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="15" y1="9" x2="15" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="20" y1="9" x2="20" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="26" y1="9" x2="26" y2="30" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="15" x2="27" y2="15" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="22" x2="27" y2="22" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
            <!-- Ball going in -->
            <circle cx="15" cy="20" r="6" fill="${accent}" stroke="${secondary}" stroke-width="1"/>
            <path d="M12 17 L18 23 M18 17 L12 23" stroke="${secondary}" stroke-width="0.8" opacity="0.7"/>
        </g>

        <!-- FC text -->
        <text x="50" y="70" text-anchor="middle" fill="${secondary}" font-family="Bebas Neue, sans-serif" font-size="11" letter-spacing="2">FC</text>

        <!-- GOALS text -->
        <text x="50" y="85" text-anchor="middle" fill="${accent}" font-family="Bebas Neue, sans-serif" font-size="16" font-weight="bold" letter-spacing="1">GOALS</text>

        <!-- MAKEN text -->
        <text x="50" y="100" text-anchor="middle" fill="${secondary}" font-family="Bebas Neue, sans-serif" font-size="12" letter-spacing="2">MAKEN</text>
    `;
}

function updateKitPreview() {
    const kitSvg = document.querySelector('.kit-svg');
    if (!kitSvg) return;

    const primary = document.getElementById('team-primary-color')?.value || gameState.club.colors.primary;
    const secondary = document.getElementById('team-secondary-color')?.value || gameState.club.colors.secondary;
    const accent = document.getElementById('team-accent-color')?.value || gameState.club.colors.accent;

    kitSvg.style.setProperty('--kit-primary', primary);
    kitSvg.style.setProperty('--kit-secondary', secondary);
    kitSvg.style.setProperty('--kit-accent', accent);
}

function updateClubStats() {
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];

    document.getElementById('club-founded').textContent = `Seizoen ${gameState.club.stats?.founded || 1}`;
    document.getElementById('club-titles').textContent = gameState.club.stats?.titles || 0;
    document.getElementById('club-highest-div').textContent = divisionNames[gameState.club.stats?.highestDivision || 8] || '6e Klasse';
    document.getElementById('club-total-goals').textContent = gameState.club.stats?.totalGoals || 0;
    document.getElementById('club-total-matches').textContent = gameState.club.stats?.totalMatches || 0;
    document.getElementById('club-reputation').textContent = gameState.club.reputation || 10;
}

function initMijnTeamListeners() {
    const primaryColor = document.getElementById('team-primary-color');
    const secondaryColor = document.getElementById('team-secondary-color');
    const accentColor = document.getElementById('team-accent-color');
    const saveBtn = document.getElementById('save-team-btn');

    // Color change listeners
    [primaryColor, secondaryColor, accentColor].forEach(input => {
        if (input) {
            input.removeEventListener('input', handleMijnTeamColorChange);
            input.addEventListener('input', handleMijnTeamColorChange);
        }
    });

    // Save button listener
    if (saveBtn) {
        saveBtn.removeEventListener('click', saveMijnTeamSettings);
        saveBtn.addEventListener('click', saveMijnTeamSettings);
    }
}

function handleMijnTeamColorChange() {
    updateMijnTeamBadgePreview();
    updateKitPreview();
}

function saveMijnTeamSettings() {
    if (gameState.club.settingsChangedThisSeason) {
        alert('Je hebt je club dit seizoen al aangepast. Wacht tot volgend seizoen.');
        return;
    }

    const nameInput = document.getElementById('team-name-input');
    const primaryColor = document.getElementById('team-primary-color');
    const secondaryColor = document.getElementById('team-secondary-color');
    const accentColor = document.getElementById('team-accent-color');

    if (!nameInput?.value.trim()) {
        alert('Voer een geldige clubnaam in.');
        return;
    }

    // Save the settings
    gameState.club.name = nameInput.value.trim();
    gameState.club.colors.primary = primaryColor?.value || gameState.club.colors.primary;
    gameState.club.colors.secondary = secondaryColor?.value || gameState.club.colors.secondary;
    gameState.club.colors.accent = accentColor?.value || gameState.club.colors.accent;

    // Mark as changed this season
    gameState.club.settingsChangedThisSeason = true;

    // Apply to the whole site
    applyClubColors();
    updateClubDisplays();

    // Update the main badge SVG
    updateMainBadgeSVG();

    // Re-render the page to show locked state
    renderMijnTeamPage();

    alert('Club instellingen opgeslagen! Dit kan pas volgend seizoen weer gewijzigd worden.');
}

function updateMainBadgeSVG() {
    const badgeSvg = document.getElementById('club-badge-svg');
    if (!badgeSvg) return;

    const { primary, secondary, accent } = gameState.club.colors;

    // Update main badge
    const badgePath = badgeSvg.querySelector('#badge-path');
    const fcText = badgeSvg.querySelector('#badge-text-fc');
    const goalsText = badgeSvg.querySelector('#badge-text-1');
    const makenText = badgeSvg.querySelector('#badge-text-2');

    if (badgePath) {
        badgePath.setAttribute('fill', primary);
        badgePath.setAttribute('stroke', secondary);
    }
    if (fcText) fcText.setAttribute('fill', secondary);
    if (goalsText) goalsText.setAttribute('fill', accent);
    if (makenText) makenText.setAttribute('fill', secondary);

    // Update all elements that use secondary color for fill
    badgeSvg.querySelectorAll('[fill="var(--text-primary)"]').forEach(el => {
        el.setAttribute('fill', secondary);
    });

    // Update all strokes
    badgeSvg.querySelectorAll('[stroke="var(--text-primary)"]').forEach(el => {
        el.setAttribute('stroke', secondary);
    });
}

// ================================================
// ACHIEVEMENTS SECTION
// ================================================

function renderAchievementsSection() {
    const progressEl = document.getElementById('achievements-progress');
    const gridEl = document.getElementById('achievements-grid');

    if (!progressEl || !gridEl) return;

    const stats = getAchievementStats(gameState);
    const allAchievements = getAllAchievements(gameState);

    // Update progress
    progressEl.innerHTML = `
        <span class="progress-text">${stats.unlocked} / ${stats.total} behaald</span>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.progress}%"></div>
        </div>
    `;

    // Render achievements grid
    let html = '';
    allAchievements.forEach(achievement => {
        const isHidden = achievement.hidden && !achievement.unlocked;
        const displayName = isHidden ? 'Verborgen' : achievement.name;
        const displayDesc = isHidden ? '???' : achievement.description;

        html += `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''} ${achievement.hidden ? 'hidden-achievement' : ''}">
                <div class="achievement-icon">${isHidden ? '❓' : achievement.icon}</div>
                <div class="achievement-info">
                    <span class="achievement-name">${displayName}</span>
                    <span class="achievement-desc">${displayDesc}</span>
                </div>
                ${achievement.unlocked ? '<span class="achievement-check">✓</span>' : ''}
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

function initAchievementsToggle() {
    const toggleBtn = document.getElementById('toggle-achievements');
    const gridEl = document.getElementById('achievements-grid');

    if (!toggleBtn || !gridEl) return;

    toggleBtn.addEventListener('click', () => {
        const isHidden = gridEl.style.display === 'none';
        gridEl.style.display = isHidden ? 'grid' : 'none';
        toggleBtn.textContent = isHidden ? 'Verberg' : 'Toon Alle';
    });
}

// ================================================
// JEUGDTEAM PAGE
// ================================================

let currentYouthAgeGroup = '12-13';

function getAcademyMaxStars() {
    const level = gameState.stadium?.academy || 'acad_1';
    const config = STADIUM_TILE_CONFIG?.academy?.levels.find(l => l.id === level);
    return config?.maxStars || 1;
}

function getYouthMaxPerCategory() {
    const level = gameState.stadium?.academy || 'acad_1';
    const map = { acad_1: 3, acad_2: 4, acad_3: 5, acad_4: 7, acad_5: 9, acad_6: 11, acad_7: 13, acad_8: 15, acad_9: 18, acad_10: 20 };
    return map[level] || 3;
}

function getYouthCategoryCount(ageGroup) {
    const [minAge, maxAge] = ageGroup.split('-').map(Number);
    return gameState.youthPlayers.filter(p => p.age >= minAge && p.age <= maxAge).length;
}

function renderJeugdteamPage() {
    // Generate initial youth players if empty
    if (gameState.youthPlayers.length === 0) {
        generateInitialYouthPlayers();
    }

    // Update academy capacity display
    updateAcademyCapacity();

    // Update academy level, benefits & upgrade button
    updateAcademyUI();

    // Render current age group
    renderYouthPlayers(currentYouthAgeGroup);

    // Update tab badges
    updateYouthTabBadges();

    // Init tab listeners
    initYouthTabListeners();
}

function updateAcademyUI() {
    const card = document.getElementById('youth-academy-card');
    const capCard = document.getElementById('youth-capacity-card');
    if (!card) return;

    const config = STADIUM_TILE_CONFIG.academy;
    const currentId = gameState.stadium?.academy || 'acad_1';
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const currentLevel = config.levels[currentIndex];
    const nextLevel = config.levels[currentIndex + 1];
    const levelNum = currentIndex + 1;
    const maxPerCat = getYouthMaxPerCategory();

    const groups = [
        { label: 'Pupillen', age: '12-13' },
        { label: 'Junioren', age: '14-15' },
        { label: 'Aspiranten', age: '16-17' }
    ];

    // Capacity card (separate tile above)
    if (capCard) {
        capCard.innerHTML = `
            <div class="acad-capacity-title">Plekken per categorie</div>
            ${groups.map(g => {
                const count = getYouthCategoryCount(g.age);
                const full = count >= maxPerCat;
                return `<div class="acad-cap-row ${full ? 'full' : ''}">
                    <span class="acad-cap-label">${g.label}</span>
                    <span class="acad-cap-bar"><span class="acad-cap-fill" style="width: ${Math.min(100, Math.round(count / maxPerCat * 100))}%"></span></span>
                    <span class="acad-cap-count">${count}/${maxPerCat}</span>
                </div>`;
            }).join('')}
        `;
    }

    // Current stars
    const currentStarsHtml = renderStarsHTML(currentLevel?.maxStars || 1);

    // Upgrade section
    let upgradeHtml = '';
    if (nextLevel) {
        const nextLevelNum = currentIndex + 2;
        const canAfford = gameState.club.budget >= nextLevel.cost;
        const nextStarsHtml = renderStarsHTML(nextLevel.maxStars);
        const reqHtml = nextLevel.reqCapacity
            ? `<div class="acad-upgrade-req">Vereist: ${nextLevel.reqCapacity} capaciteit</div>`
            : nextLevel.reqDivision
                ? `<div class="acad-upgrade-req">Vereist: Divisie ${nextLevel.reqDivision}</div>`
                : '';

        upgradeHtml = `
            <div class="acad-upgrade-block">
                <div class="acad-upgrade-header">Upgrade naar Lvl ${nextLevelNum}</div>
                <div class="acad-upgrade-stars">
                    <span class="acad-upgrade-stars-label">Max potentieel</span>
                    <span class="pc-stars">${nextStarsHtml}</span>
                </div>
                ${reqHtml}
                <button class="btn btn-primary acad-upgrade-btn" id="btn-academy-upgrade">
                    Upgrade — ${formatCurrency(nextLevel.cost)}
                </button>
            </div>`;
    } else {
        upgradeHtml = `
            <div class="acad-upgrade-block acad-maxed">
                <div class="acad-upgrade-header">Maximaal niveau</div>
            </div>`;
    }

    card.innerHTML = `
        <div class="acad-current">
            <div class="acad-current-top">
                <span class="acad-icon">🎓</span>
                <div class="acad-current-info">
                    <span class="acad-current-name">Jeugdacademie</span>
                    <span class="acad-current-lvl">Huidig: Lvl ${levelNum}</span>
                </div>
            </div>
            <div class="acad-current-stars">
                <span class="acad-stars-label">Potentieel</span>
                <span class="pc-stars">${currentStarsHtml}</span>
            </div>
        </div>
        ${upgradeHtml}
    `;

    // Navigate to stadium academy tab
    const btn = document.getElementById('btn-academy-upgrade');
    if (btn && nextLevel) {
        btn.onclick = () => {
            navigateToPage('stadium');
            setTimeout(() => selectStadiumCategory('academy'), 100);
        };
    }
}

function updateAcademyCapacity() {
    updateAcademyUI();
}

function updateYouthTabBadges() {
    const max = getYouthMaxPerCategory();
    document.querySelectorAll('.youth-tab').forEach(tab => {
        const age = tab.dataset.age;
        const count = getYouthCategoryCount(age);
        const full = count >= max;
        tab.classList.toggle('tab-full', full);

        // Update or create badge
        let badge = tab.querySelector('.ytab-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'ytab-badge';
            tab.appendChild(badge);
        }
        badge.textContent = `${count}/${max}`;
        badge.classList.toggle('badge-full', full);
    });
}

function ageYouthPlayersDaily() {
    const today = new Date().toDateString();
    if (gameState._lastYouthAgingDate === today) return; // Already aged today
    gameState._lastYouthAgingDate = today;

    if (!gameState.youthPlayers || gameState.youthPlayers.length === 0) return;

    // Age all youth players by 1 year
    gameState.youthPlayers.forEach(player => {
        player.age++;
    });

    // Remove players who turned 18+ (they leave the academy)
    const leavers = gameState.youthPlayers.filter(p => p.age >= 18);
    if (leavers.length > 0) {
        gameState.youthPlayers = gameState.youthPlayers.filter(p => p.age < 18);
        leavers.forEach(p => {
            showNotification(`${p.name} (${p.age}) heeft de jeugdopleiding verlaten.`, 'info');
        });
    }
}

function generateInitialYouthPlayers() {
    const maxStars = getAcademyMaxStars();
    const ageGroups = [
        { min: 12, max: 13, count: random(3, 5) },
        { min: 14, max: 15, count: random(3, 5) },
        { min: 16, max: 17, count: random(2, 4) }
    ];

    ageGroups.forEach(group => {
        for (let i = 0; i < group.count; i++) {
            const player = generateYouthPlayer(group.min, group.max);
            // Random stars from 0.5 to maxStars, in 0.5 steps
            const steps = Math.floor(maxStars / 0.5);
            player.potentialStars = (random(1, steps) * 0.5);
            gameState.youthPlayers.push(player);
        }
    });
}

function generateYouthPlayer(minAge, maxAge) {
    const age = random(minAge, maxAge);
    const nationality = NATIONALITIES[Math.random() < 0.7 ? 0 : random(0, NATIONALITIES.length - 1)];
    const firstName = DUTCH_FIRST_NAMES[random(0, DUTCH_FIRST_NAMES.length - 1)];
    const lastName = DUTCH_LAST_NAMES[random(0, DUTCH_LAST_NAMES.length - 1)];

    // Positions for youth - no keeper in younger ages
    const availablePositions = Object.keys(POSITIONS).filter(pos => {
        if (age < 14 && pos === 'keeper') return false;
        return true;
    });
    const position = availablePositions[random(0, availablePositions.length - 1)];

    // Youth have lower base attributes but potentially high growth
    const baseMin = 15;
    const baseMax = 40;

    // Generate potential (youth have higher potential ceiling)
    const potentialBase = random(50, 85);
    const potentialBonus = Math.random() < 0.15 ? random(10, 20) : 0; // 15% chance of supertalent
    const potential = Math.min(99, potentialBase + potentialBonus);

    // Current attributes are lower than potential
    const currentLevel = 0.3 + (age - 12) * 0.08; // Older youth are more developed
    const attributes = {
        AAN: Math.round(random(baseMin, baseMax) * currentLevel),
        VER: Math.round(random(baseMin, baseMax) * currentLevel),
        SNE: Math.round(random(baseMin, baseMax) * currentLevel),
        FYS: Math.round(random(baseMin, baseMax) * currentLevel)
    };

    // Add keeper attributes if keeper
    if (position === 'keeper') {
        attributes.REF = Math.round(random(baseMin, baseMax) * currentLevel);
        attributes.BAL = Math.round(random(baseMin, baseMax) * currentLevel);
    }

    // Calculate overall from position weights
    const weights = POSITIONS[position].weights;
    let overall = 0;
    Object.keys(weights).forEach(attr => {
        overall += (attributes[attr] || 0) * weights[attr];
    });
    overall = Math.round(overall);

    // Determine if supertalent (potential > 75)
    const isSupertalent = potential >= 75;

    return {
        id: Date.now() + Math.random(),
        name: `${firstName} ${lastName}`,
        age,
        nationality,
        position,
        attributes,
        overall,
        potential,
        isSupertalent,
        growthRate: random(2, 5), // Points growth per season
        yearsInAcademy: random(1, 3)
    };
}

function updateYouthStats() {
    // Stats tiles removed — no-op for compatibility
}

function renderYouthPlayers(ageGroup) {
    const grid = document.getElementById('youth-players-grid');
    const emptyState = document.getElementById('youth-empty-state');

    if (!grid) return;

    // Parse age range
    const [minAge, maxAge] = ageGroup.split('-').map(Number);

    // Filter players by age
    const players = gameState.youthPlayers.filter(p => p.age >= minAge && p.age <= maxAge);

    if (players.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Sort by stars descending
    players.sort((a, b) => (b.potentialStars || 1) - (a.potentialStars || 1));

    // Check if category is full
    const max = getYouthMaxPerCategory();
    const isFull = players.length >= max;

    const fullBanner = isFull ? `<div class="youth-full-banner">
        <span class="yfb-icon">🚫</span>
        <span class="yfb-text">Deze categorie zit vol (${players.length}/${max}). Ontslaa een speler om ruimte te maken voor nieuw talent.</span>
    </div>` : '';

    grid.innerHTML = fullBanner + players.map(player => createYouthPlayerCard(player)).join('');

    // Add contract button listeners
    grid.querySelectorAll('.btn-sign-contract').forEach(btn => {
        btn.addEventListener('click', () => {
            const playerId = parsePlayerId(btn.dataset.playerId);
            signYouthContract(playerId);
        });
    });

    // Add dismiss button listeners
    grid.querySelectorAll('.btn-dismiss-youth').forEach(btn => {
        btn.addEventListener('click', () => {
            const playerId = parsePlayerId(btn.dataset.playerId);
            dismissYouthPlayer(playerId);
        });
    });
}

function getYouthMaxLevel(age) {
    if (age >= 16) return 5;  // Aspiranten
    if (age >= 14) return 3;  // Junioren
    return 1;                 // Pupillen
}

function getYouthLevel(overall, maxLevel) {
    const normalized = Math.max(0, Math.min(1, (overall - 5) / 25));
    return Math.max(1, Math.ceil(normalized * maxLevel));
}

function createYouthPlayerCard(player) {
    const posData = POSITIONS[player.position] || { abbr: '??', color: '#666', name: 'Onbekend' };
    const canSign = player.age >= 16;
    const stars = player.potentialStars || 1;
    const maxLevel = getYouthMaxLevel(player.age);
    const level = getYouthLevel(player.overall, maxLevel);

    return `
        <div class="player-card youth-card" data-player-id="${player.id}">
            <div class="pc-left">
                <span class="pc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                <div class="pc-age-box">
                    <span class="pc-age-value">${player.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <img class="pc-flag-img" src="https://flagcdn.com/w40/${(player.nationality.code || 'nl').toLowerCase()}.png" alt="${player.nationality.code || 'NL'}" />
            </div>
            <span class="pc-name">${player.name}</span>
            <div class="pc-overall" style="background: ${posData.color}">
                <span class="pc-overall-value">${level}</span>
                <span class="pc-overall-label">ALG</span>
            </div>
            <div class="pc-potential-stars">
                <span class="pc-stars">${renderStarsHTML(stars)}</span>
                <span class="pc-potential-label">POT</span>
            </div>
            <span class="yc-action">
                <button class="btn ${canSign ? 'btn-primary' : 'btn-secondary'} btn-sign-contract btn-sm"
                        data-player-id="${player.id}"
                        ${!canSign ? 'disabled' : ''}>
                    ${canSign ? 'Overhevelen' : 'Te jong'}
                </button>
                <button class="btn btn-danger btn-dismiss-youth btn-sm"
                        data-player-id="${player.id}">
                    Ontslaan
                </button>
            </span>
        </div>
    `;
}

function initYouthTabListeners() {
    document.querySelectorAll('.youth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.youth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Render players for this age group
            currentYouthAgeGroup = tab.dataset.age;
            renderYouthPlayers(currentYouthAgeGroup);
        });
    });
}

function signYouthContract(playerId) {
    const playerIndex = gameState.youthPlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const youthPlayer = gameState.youthPlayers[playerIndex];

    if (youthPlayer.age < 16) {
        alert('Deze speler is te jong voor het eerste team.');
        return;
    }

    // Create a professional player from the youth player
    const division = gameState.club.division;
    const divData = getDivision(division);

    // Calculate salary based on stars and division
    const baseSalary = divData ? divData.salary.avg : 50;
    const starsBonus = ((youthPlayer.potentialStars || 1) - 1) * 20;
    const salary = Math.max(divData?.salary.min || 25, Math.round(baseSalary * 0.5 + starsBonus));

    // Determine personality
    const personalityPool = [...PERSONALITIES.good, ...PERSONALITIES.neutral, ...PERSONALITIES.bad];
    const personality = personalityPool[random(0, personalityPool.length - 1)];

    // Determine player tag
    const highestAttr = Object.entries(youthPlayer.attributes)
        .filter(([key]) => key !== 'REF' && key !== 'BAL')
        .sort((a, b) => b[1] - a[1])[0];
    const tagData = PLAYER_TAGS[youthPlayer.position]?.[highestAttr?.[0]];
    const tag = tagData?.name || 'Jeugdproduct';

    const professionalPlayer = {
        id: Date.now() + Math.random(),
        name: youthPlayer.name,
        age: youthPlayer.age,
        nationality: youthPlayer.nationality,
        position: youthPlayer.position,
        attributes: { ...youthPlayer.attributes },
        overall: youthPlayer.overall,
        stars: youthPlayer.potentialStars || 1,
        salary,
        personality,
        tag,
        condition: 100,
        energy: 100,
        form: 70,
        morale: 80,
        injuryDaysLeft: 0,
        contractYears: 3,
        isYouthProduct: true
    };

    // Add to squad (check max)
    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }
    gameState.players.push(professionalPlayer);

    // Remove from youth team
    gameState.youthPlayers.splice(playerIndex, 1);

    // Re-render
    renderYouthPlayers(currentYouthAgeGroup);
    updateAcademyCapacity();
    updateYouthTabBadges();

    showNotification(`${youthPlayer.name} heeft een profcontract getekend!`, 'success');
}

function dismissYouthPlayer(playerId) {
    const playerIndex = gameState.youthPlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.youthPlayers[playerIndex];
    gameState.youthPlayers.splice(playerIndex, 1);

    renderYouthPlayers(currentYouthAgeGroup);
    updateAcademyCapacity();
    updateYouthTabBadges();
    showNotification(`${player.name} is ontslagen uit de jeugdopleiding.`, 'info');
    saveGame();
}

// ================================================
// DAILY FINANCES
// ================================================


function calculateWeeklyFinances() {
    // === INCOME (per week / per match) ===

    // Kaartverkoop: alleen bij thuiswedstrijden, attendance max = fans
    const lastMatch = gameState.lastMatch;
    const wasHome = lastMatch ? lastMatch.isHome : true;
    const capacity = gameState.stadium.capacity || 200;
    const fans = gameState.club.fans || 50;
    const ticketPrice = 8;
    const maxAttendance = Math.min(capacity, fans);
    const attendance = wasHome ? Math.round(maxAttendance * 0.75) : 0;
    const ticketIncome = attendance * ticketPrice;

    // Shirt sponsor (matchIncome = per match = per week)
    const shirtIncome = gameState.sponsor?.matchIncome || 0;

    // Win bonus (potential, not guaranteed)
    const winBonus = gameState.sponsor?.winBonus || 0;

    // Board sponsor (alleen bij thuiswedstrijden)
    const bordIncome = wasHome ? (gameState.sponsorSlots?.bord?.weeklyIncome || 0) : 0;

    // Kantine income (alleen bij thuiswedstrijden)
    const kantineConfig = STADIUM_TILE_CONFIG?.kantine?.levels.find(l => l.id === gameState.stadium.kantine);
    const kantineMatch = kantineConfig?.effect?.match(/€(\d+)/);
    const kantineIncome = wasHome ? (kantineMatch ? parseInt(kantineMatch[1]) : 0) : 0;

    // === EXPENSES (per week) ===

    // Player salaries
    const playerSalaries = gameState.players.reduce((total, p) => total + (p.salary || 0), 0);

    // Staff salaries
    let staffSalaries = 0;
    const hiredIds = [
        ...(gameState.hiredStaff?.medisch || []),
        ...(gameState.hiredStaff?.trainers || [])
    ];
    STAFF_MEMBERS.forEach(staff => {
        if (hiredIds.includes(staff.id)) {
            staffSalaries += staff.salary;
        }
    });
    // Legacy fallback
    if (gameState.staff?.fysio) staffSalaries += 100;
    if (gameState.staff?.scout) staffSalaries += 150;
    if (gameState.staff?.dokter) staffSalaries += 200;
    Object.values(gameState.assistantTrainers || {}).forEach(trainer => {
        if (trainer) staffSalaries += 75;
    });

    // Maintenance
    const maintenance = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune)?.maintenance || 0;

    // Youth scouting network
    const scoutingCost = SCOUTING_NETWORKS[gameState.scoutingNetwork || 'none']?.weeklyCost || 0;

    const totalIncome = ticketIncome + shirtIncome + bordIncome + kantineIncome;
    const totalExpense = playerSalaries + staffSalaries + maintenance + scoutingCost;
    const weeklyResult = totalIncome - totalExpense;

    return {
        income: [
            { label: 'Kaartverkoop', value: ticketIncome, detail: wasHome ? `${attendance} toeschouwers` : 'Uitwedstrijd' },
            { label: 'Shirtsponsor', value: shirtIncome },
            { label: 'Bordsponsor', value: bordIncome, detail: wasHome ? '' : 'Uitwedstrijd' },
            { label: 'Kantine', value: kantineIncome, detail: wasHome ? '' : 'Uitwedstrijd' }
        ],
        expense: [
            { label: 'Spelerssalarissen', value: playerSalaries },
            { label: 'Stafsalarissen', value: staffSalaries },
            { label: 'Stadiononderhoud', value: maintenance },
            { label: 'Jeugdscouting', value: scoutingCost }
        ],
        winBonus,
        totalIncome,
        totalExpense,
        weeklyResult
    };
}

function renderDailyFinances() {
    const fin = calculateWeeklyFinances();

    // Header balance
    const balEl = document.getElementById('fin-balance');
    if (balEl) balEl.textContent = formatCurrency(gameState.club.budget);

    // Income list
    const incList = document.getElementById('fin-income-list');
    if (incList) {
        let html = fin.income
            .filter(i => i.value > 0)
            .map(i => `<li><span class="fin-item-label">${i.label}${i.detail ? ` <small>(${i.detail})</small>` : ''}</span><span class="fin-item-val income">+${formatCurrency(i.value)}</span></li>`)
            .join('');
        if (fin.winBonus > 0) {
            html += `<li class="fin-item-bonus"><span class="fin-item-label">Winbonus <small>(bij winst)</small></span><span class="fin-item-val bonus">+${formatCurrency(fin.winBonus)}</span></li>`;
        }
        incList.innerHTML = html || '<li class="fin-empty">Geen inkomsten</li>';
    }

    // Income total
    const incTotal = document.getElementById('fin-total-income');
    if (incTotal) incTotal.textContent = `+${formatCurrency(fin.totalIncome)}`;

    // Expense list
    const expList = document.getElementById('fin-expense-list');
    if (expList) {
        expList.innerHTML = fin.expense
            .filter(e => e.value > 0)
            .map(e => `<li><span class="fin-item-label">${e.label}</span><span class="fin-item-val expense">-${formatCurrency(e.value)}</span></li>`)
            .join('') || '<li class="fin-empty">Geen uitgaven</li>';
    }

    // Expense total
    const expTotal = document.getElementById('fin-total-expense');
    if (expTotal) expTotal.textContent = `-${formatCurrency(fin.totalExpense)}`;

    // Result
    const resAmount = document.getElementById('fin-result-amount');
    const resEl = document.getElementById('fin-result');
    if (resAmount) {
        const sign = fin.weeklyResult >= 0 ? '+' : '';
        resAmount.textContent = `${sign}${formatCurrency(fin.weeklyResult)}`;
        resAmount.className = fin.weeklyResult >= 0 ? 'fin-result-positive' : 'fin-result-negative';
    }
    if (resEl) {
        resEl.className = `fin-result ${fin.weeklyResult >= 0 ? 'positive' : 'negative'}`;
    }
}

// Keep backward compatibility for dashboard
function calculateDailyFinances() {
    const weekly = calculateWeeklyFinances();
    const dailyBalance = Math.round(weekly.weeklyResult / 7);
    return {
        income: {
            sponsor: Math.round((weekly.income[1]?.value || 0) / 7),
            sponsoringBonus: 0,
            merch: 0,
            kantine: Math.round((weekly.income[3]?.value || 0) / 7)
        },
        expense: {
            playerSalary: Math.round((weekly.expense[0]?.value || 0) / 7),
            staffSalary: Math.round((weekly.expense[1]?.value || 0) / 7),
            maintenance: Math.round((weekly.expense[2]?.value || 0) / 7)
        },
        totalIncome: Math.round(weekly.totalIncome / 7),
        totalExpense: Math.round(weekly.totalExpense / 7),
        dailyBalance,
        tomorrowBalance: gameState.club.budget + dailyBalance,
        weeklyPlayerSalary: weekly.expense[0]?.value || 0,
        weeklyStaffSalary: weekly.expense[1]?.value || 0,
        weeklySponsor: (weekly.income[1]?.value || 0) + (weekly.income[2]?.value || 0)
    };
}

// ================================================
// GAME INITIALIZATION
// ================================================

// ================================================
// CHAIRMAN ADVISOR SYSTEM
// ================================================

const CHAIRMAN_TIPS = {
    // Opstelling & Tactiek
    lineup: [
        "Heb je de opstelling al bekeken? Zorg dat iedereen op z'n plek staat!",
        "Een goede opstelling is het halve werk, zeggen ze altijd.",
        "Sommige jongens presteren beter op bepaalde posities. Experimenteer gerust!",
        "Die linksback van ons kan ook prima op het middenveld uit de voeten.",
        "Vergeet niet: een sterk middenveld wint wedstrijden!"
    ],
    // Training
    training: [
        "Jonge spelers hebben potentieel. Laat ze regelmatig trainen!",
        "Training is de sleutel tot groei. Vergeet de talenten niet!",
        "Een getraind team is een winnend team, dat zei mijn vader ook altijd.",
        "Die jonge gasten moeten meer trainen, anders worden ze niks.",
        "Conditietraining is niet sexy, maar wel belangrijk!"
    ],
    // Scouting
    scout: [
        "Op zoek naar nieuw talent? De scout kan helpen!",
        "Scouten op jonge spelers is lastig, maar de beloning kan groot zijn.",
        "Ervaren spelers zijn makkelijker te vinden dan jong talent.",
        "Ik hoorde dat er een talentje rondloopt bij de buren...",
        "Een goede scout is goud waard voor een club als de onze."
    ],
    // Stadion
    stadium: [
        "Upgrade het stadion voor meer inkomsten en thuisvoordeel!",
        "Een groter stadion betekent meer fans en meer geld.",
        "De faciliteiten niet vergeten - horeca levert extra inkomsten op.",
        "Die kleedkamers kunnen wel een likje verf gebruiken.",
        "Met beter veldonderhoud spelen we ook beter voetbal!"
    ],
    // Kantine & Derde helft
    kantine: [
        "Na de wedstrijd is de derde helft net zo belangrijk, hè?",
        "De kantine draait goed dit seizoen. Mooi voor de clubkas!",
        "Vergeet niet even langs de bar te komen na afloop.",
        "Een goed gesprek in de kantine lost veel problemen op.",
        "De bitterballen zijn vers, zegt de kantinebeheerder.",
        "Zonder vrijwilligers in de kantine zijn we nergens.",
        "Het clubgevoel ontstaat in de kantine, niet op het veld.",
        "Zaterdag is er stamppot in de kantine. Niet te missen!"
    ],
    // Weer & Veld
    weer: [
        "Het wordt wisselvallig dit weekend. Misschien moddervoetbal!",
        "Bij dit weer moet je korte passes spelen, lange ballen werken niet.",
        "Hopelijk blijft het droog, anders wordt het een modderbad.",
        "Met deze wind moet je slim spelen. Gebruik hem in je voordeel!",
        "Het veld ligt er goed bij ondanks het weer van vorige week."
    ],
    // Scheidsrechter
    scheids: [
        "Respect voor de scheidsrechter, ook als hij fout zit!",
        "Die scheids van vorige week... ach, laat ik maar niks zeggen.",
        "Zonder scheidsrechters geen wedstrijden. Behandel ze netjes!",
        "Ik hoop dat we dit keer een ervaren scheids krijgen.",
        "Discussiëren met de scheids heeft nog nooit geholpen."
    ],
    // Motivatie
    motivatie: [
        "Ik geloof in dit team. Jullie kunnen het!",
        "Elke wedstrijd is een nieuwe kans om te laten zien wat we kunnen.",
        "Verlies hoort erbij, maar opgeven nooit!",
        "Discipline en inzet, daar win je mee.",
        "Samen staan we sterk. Dat is de kracht van deze club!",
        "Laat je niet gek maken door de tegenstander.",
        "Focus op jezelf, niet op de ander.",
        "Dit seizoen gaan we het doen, ik voel het!"
    ],
    // Financiën & Sponsors
    financien: [
        "De begroting is krap, maar we redden het wel weer.",
        "Elke euro telt bij een club als de onze.",
        "De sponsors zijn tevreden, dat is goed nieuws!",
        "Misschien moeten we een loterij organiseren voor extra geld.",
        "De contributie komt binnen, dus we draaien quitte.",
        "Investeer slim, want het geld groeit niet aan de bomen."
    ],
    // Jeugd
    jeugd: [
        "De jeugd is de toekomst van deze club!",
        "Ik zag een paar talenten bij de F-jes. Veelbelovend!",
        "Laat de jeugd meekijken bij het eerste. Dat motiveert!",
        "Een sterke jeugdopleiding is de basis van succes.",
        "Die jongen uit de A1 kan zo door naar het eerste, let op mijn woorden."
    ],
    // Blessures
    blessures: [
        "Hopelijk blijven we dit seizoen van blessures gespaard.",
        "Goed warmlopen voorkomt veel ellende!",
        "Die hamstringblessures komen vaak door te weinig rekken.",
        "Luister naar je lichaam, forceer niks.",
        "De fysio is z'n gewicht in goud waard voor ons."
    ],
    // Wedstrijdvoorbereiding
    wedstrijd: [
        "Vandaag moeten we vanaf de eerste minuut scherp zijn!",
        "Onderschat de tegenstander niet, dat is al vaker fout gegaan.",
        "Een goede voorbereiding is het halve werk.",
        "Concentratie en discipline, daar gaan we het mee winnen.",
        "De tegenstander heeft ook zwakke punten. Benut ze!"
    ],
    // Clubliefde & Tradities
    club: [
        "Deze club is meer dan voetbal. Het is familie!",
        "Al generaties lang komen mensen hier samen voor de liefde van het spel.",
        "De clubkleuren dragen is een eer, vergeet dat nooit.",
        "Wat er ook gebeurt, we blijven trots op onze club.",
        "De sfeer hier is uniek. Dat vind je nergens anders!"
    ],
    // Humor & Grappen
    humor: [
        "Weet je wat het verschil is tussen voetbal en politiek? Bij voetbal mag je nog eerlijk zijn!",
        "Onze keeper vangt alles... behalve de bus van half negen.",
        "Die spits van ons schiet vaker naast dan raak, maar hij is wel gezellig!",
        "Ik zei tegen de trainer: meer balbezit! Nu houden ze de bal vast in de kantine.",
        "Vroeger was alles beter, behalve ons voetbal. Dat was altijd al matig.",
        "Een goede verdediger is als een goede schoonmoeder: altijd in de weg!"
    ],
    // Algemeen
    general: [
        "Welkom! Als voorzitter help ik je met tips.",
        "Elke beslissing telt. Bouw de club stap voor stap op!",
        "Succes komt niet vanzelf - train, scout en investeer!",
        "Ik sta altijd klaar voor de club. Dag en nacht!",
        "Samen maken we er een mooi seizoen van.",
        "Vertrouw op het proces. Rome is ook niet in één dag gebouwd.",
        "Communicatie is alles in een team. Praat met elkaar!",
        "Een club bouwen kost tijd, maar het is het waard."
    ]
};

let chairmanTipIndex = 0;
let chairmanTipInterval = null;

function getChairmanTip() {
    // Collect tips from various categories based on context and randomness
    const tips = [];

    // Game-state based tips
    if (Math.random() < 0.3) {
        tips.push(...CHAIRMAN_TIPS.lineup);
    }

    const youngPlayers = gameState.players?.filter(p => p.age <= 23) || [];
    if (youngPlayers.length > 0 && Math.random() < 0.3) {
        tips.push(...CHAIRMAN_TIPS.training);
    }

    if (Math.random() < 0.25) {
        tips.push(...CHAIRMAN_TIPS.scout);
    }

    if (Math.random() < 0.25) {
        tips.push(...CHAIRMAN_TIPS.stadium);
    }

    // Kantine tips - always a favorite topic!
    if (Math.random() < 0.4) {
        tips.push(...CHAIRMAN_TIPS.kantine);
    }

    // Weather tips
    if (Math.random() < 0.2) {
        tips.push(...CHAIRMAN_TIPS.weer);
    }

    // Referee tips
    if (Math.random() < 0.15) {
        tips.push(...CHAIRMAN_TIPS.scheids);
    }

    // Motivation tips
    if (Math.random() < 0.35) {
        tips.push(...CHAIRMAN_TIPS.motivatie);
    }

    // Finance tips
    if (Math.random() < 0.2) {
        tips.push(...CHAIRMAN_TIPS.financien);
    }

    // Youth tips
    if (Math.random() < 0.25) {
        tips.push(...CHAIRMAN_TIPS.jeugd);
    }

    // Injury tips
    if (Math.random() < 0.15) {
        tips.push(...CHAIRMAN_TIPS.blessures);
    }

    // Match preparation tips
    if (Math.random() < 0.3) {
        tips.push(...CHAIRMAN_TIPS.wedstrijd);
    }

    // Club love tips
    if (Math.random() < 0.25) {
        tips.push(...CHAIRMAN_TIPS.club);
    }

    // Humor - occasional jokes!
    if (Math.random() < 0.2) {
        tips.push(...CHAIRMAN_TIPS.humor);
    }

    // Always include general tips as fallback
    tips.push(...CHAIRMAN_TIPS.general);

    // Return a single random tip (not two combined, for better readability)
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return tip;
}

function updateChairmanTip() {
    const tipElement = document.getElementById('chairman-tip');
    const avatarElement = document.getElementById('chairman-avatar');

    if (!tipElement || !avatarElement) return;

    // Start talking animation
    avatarElement.classList.add('talking');

    // Get new tip
    const newTip = getChairmanTip();

    // Animate the tip change
    tipElement.style.opacity = '0';
    setTimeout(() => {
        tipElement.textContent = newTip;
        tipElement.style.opacity = '1';

        // Stop talking after tip is shown
        setTimeout(() => {
            avatarElement.classList.remove('talking');
        }, 1500);
    }, 300);
}

function initChairmanTips() {
    // Initial tip
    updateChairmanTip();

    // Rotate tips every 15 seconds
    chairmanTipInterval = setInterval(updateChairmanTip, 15000);
}

function migratePlayersToZaterdag() {
    if (!gameState.players || gameState.players.length === 0) return;

    const nlNat = NATIONALITIES[0]; // { code: 'NL', flag: '🇳🇱', ... }

    gameState.players.forEach(player => {
        // Ensure nationality has code property (needed for flag images)
        if (player.nationality && !player.nationality.code) {
            const match = NATIONALITIES.find(n => n.name === player.nationality.name);
            if (match) {
                player.nationality = match;
            } else {
                player.nationality = nlNat;
            }
        }

        // Make ~90% Dutch: if not already Dutch, 90% chance to convert
        if (player.nationality && player.nationality.code !== 'NL' && Math.random() < 0.90) {
            player.nationality = nlNat;
        }

        // Zaterdagvoetbal stats: salary 0, age 40-55, overall 1-10
        player.salary = 0;
        if (player.age < 40) player.age = random(40, 55);
        if (player.fixedMarketValue === undefined) player.fixedMarketValue = 0;

        // Clamp overall and attributes to 1-10
        if (player.overall > 10) {
            const isKeeper = player.position === 'keeper';
            const attrNames = isKeeper ? ['REF', 'BAL', 'SNE', 'FYS'] : ['AAN', 'VER', 'SNE', 'FYS'];
            attrNames.forEach(attr => {
                if (player.attributes[attr] !== undefined) {
                    player.attributes[attr] = random(1, 10);
                }
            });
            player.overall = calculateOverall(player.attributes, player.position);
            player.stars = 0.5;
        }
    });
}

function generateFakeMatchHistory() {
    const opponents = ['FC Rivaal', 'SC Concordia', 'Vv De Meeuwen', 'SV Oranje'];
    const results = [
        { playerScore: 3, opponentScore: 1, resultType: 'win' },
        { playerScore: 0, opponentScore: 2, resultType: 'loss' },
        { playerScore: 1, opponentScore: 1, resultType: 'draw' },
        { playerScore: 2, opponentScore: 0, resultType: 'win' }
    ];

    if (!gameState.matchHistory) gameState.matchHistory = [];
    const lineupPlayers = (gameState.lineup || []).filter(p => p != null);
    const playersForRatings = lineupPlayers.length > 0 ? lineupPlayers : gameState.players.slice(0, 11);
    // Attackers/midfielders more likely to score
    const attackers = playersForRatings.filter(p => ['spits', 'linksbuiten', 'rechtsbuiten', 'linksMid', 'centraleMid', 'rechtsMid'].includes(p.position));
    const scorerPool = attackers.length > 0 ? attackers : playersForRatings;

    for (let i = 0; i < 4; i++) {
        const isHome = i % 2 === 0;
        const pScore = results[i].playerScore;
        const oScore = results[i].opponentScore;

        // Start with base ratings, no goals/assists
        const ratings = playersForRatings.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            rating: Math.round((5.5 + Math.random() * 3.5) * 10) / 10,
            goals: 0,
            assists: 0,
            yellowCards: Math.random() < 0.12 ? 1 : 0,
            redCards: 0
        }));

        // Distribute player goals among scorerPool players and create goal events
        const fakeEvents = [];
        const usedMinutes = new Set();
        for (let g = 0; g < pScore; g++) {
            const scorerIdx = Math.floor(Math.random() * scorerPool.length);
            const scorer = scorerPool[scorerIdx];
            const ratingEntry = ratings.find(r => r.id === scorer.id);
            if (ratingEntry) {
                ratingEntry.goals++;
                ratingEntry.rating = Math.round((ratingEntry.rating + 1.0) * 10) / 10;
            }
            let minute;
            do { minute = 5 + Math.floor(Math.random() * 85); } while (usedMinutes.has(minute));
            usedMinutes.add(minute);
            fakeEvents.push({
                minute,
                type: 'goal',
                team: isHome ? 'home' : 'away',
                player: scorer.name,
                playerId: scorer.id,
                commentary: `${scorer.name} scoort! ${minute}'`
            });
        }
        // Opponent goals (no specific player)
        for (let g = 0; g < oScore; g++) {
            let minute;
            do { minute = 5 + Math.floor(Math.random() * 85); } while (usedMinutes.has(minute));
            usedMinutes.add(minute);
            fakeEvents.push({
                minute,
                type: 'goal',
                team: isHome ? 'away' : 'home',
                player: 'Tegenstander',
                commentary: `Tegendoelpunt in de ${minute}e minuut.`
            });
        }
        // Add yellow card events for players that got one
        ratings.filter(r => r.yellowCards > 0).forEach(r => {
            let minute;
            do { minute = 5 + Math.floor(Math.random() * 85); } while (usedMinutes.has(minute));
            usedMinutes.add(minute);
            fakeEvents.push({
                minute,
                type: 'yellow_card',
                team: isHome ? 'home' : 'away',
                player: r.name,
                playerId: r.id,
                commentary: `Gele kaart voor ${r.name}.`
            });
        });
        fakeEvents.sort((a, b) => a.minute - b.minute);

        const possHome = 45 + Math.floor(Math.random() * 20);
        const bestPlayer = [...ratings].sort((a, b) => b.rating - a.rating)[0];

        gameState.matchHistory.push({
            week: i + 1,
            season: gameState.season,
            opponent: opponents[i],
            isHome,
            playerScore: pScore,
            opponentScore: oScore,
            resultType: results[i].resultType,
            events: fakeEvents,
            possession: { home: possHome, away: 100 - possHome },
            shots: { home: 5 + Math.floor(Math.random() * 10), away: 3 + Math.floor(Math.random() * 8) },
            shotsOnTarget: { home: 2 + Math.floor(Math.random() * 5), away: 1 + Math.floor(Math.random() * 4) },
            corners: { home: Math.floor(Math.random() * 6), away: Math.floor(Math.random() * 6) },
            fouls: { home: 3 + Math.floor(Math.random() * 8), away: 3 + Math.floor(Math.random() * 8) },
            cards: { home: { yellow: ratings.filter(r => r.yellowCards > 0).length, red: 0 }, away: { yellow: Math.floor(Math.random() * 3), red: 0 } },
            manOfTheMatch: bestPlayer ? { name: bestPlayer.name, rating: bestPlayer.rating } : null,
            playerRatings: ratings,
            improvements: [],
            chairmanComments: {
                positive: 'De voorzitter waardeert de inzet van het team.',
                negative: 'De voorzitter ziet altijd ruimte voor verbetering.'
            }
        });
    }

    // Set lastMatch to most recent
    gameState.lastMatch = gameState.matchHistory[gameState.matchHistory.length - 1];
    // Set week to 5 (after 4 matches)
    gameState.week = 5;
}

function initGame(mode = 'local') {
    // Check for existing save (singleplayer uses sync load)
    const savedState = loadGameSync();

    if (savedState) {
        // Load saved game
        replaceGameState(savedState);
        console.log('Save file loaded!');

        // Calculate and apply offline progress (silently)
        const offlineProgress = calculateOfflineProgress(gameState);
        if (offlineProgress && offlineProgress.hoursAway >= 1) {
            applyOfflineProgress(gameState, offlineProgress);
        }

        // Check if construction completed while offline
        checkConstruction();
    } else {
        // New game - generate initial data
        gameState.players = generateSquad(gameState.club.division);
        gameState.standings = generateNewStandings(gameState.club.name, gameState.club.division);
        gameState.achievements = initAchievements();
    }

    // Migrate tactics: old keys → new keys
    if (gameState.tactics && gameState.tactics.mentality !== undefined) {
        const oldTactics = gameState.tactics;
        const offensiefMap = { defensive: 'verdedigend', balanced: 'gebalanceerd', attacking: 'offensief', ultra_attacking: 'leeroy' };
        const tempoMap = { slow: 'rustig', normal: 'normaal', fast: 'snel', counter: 'snel' };
        const breedteMap = { narrow: 'smal', normal: 'gebalanceerd', wide: 'breed' };
        const dekkingVal = (gameState.advancedTactics?.marking) || 'zone';
        gameState.tactics = {
            mentaliteit: 'normaal',
            offensief: offensiefMap[oldTactics.mentality] || 'gebalanceerd',
            speltempo: tempoMap[oldTactics.tempo] || 'normaal',
            veldbreedte: breedteMap[oldTactics.width] || 'gebalanceerd',
            dekking: dekkingVal === 'man' ? 'man' : 'zone'
        };
        delete gameState.advancedTactics;
    }

    // Migrate existing players: ensure 90% Dutch nationality + zaterdagvoetbal stats
    migratePlayersToZaterdag();

    // Ensure myPlayer is in gameState.players so they can be in the lineup
    const mp = initMyPlayer();
    const mpInSquad = gameState.players.some(p => p && p.id === 'myplayer');
    if (!mpInSquad) {
        const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
        gameState.players.unshift({
            id: 'myplayer',
            name: mp.name,
            age: mp.age,
            position: mp.position,
            overall: mpOverall,
            stars: 5,
            isMyPlayer: true,
            nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
            salary: 0,
            energy: mp.energy || 100,
            attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
        });
    }

    // Migrate: convert potential to fixed stars property
    if (gameState.players && gameState.players.length > 0) {
        gameState.players.forEach(p => {
            if (p && p.stars === undefined) {
                if (p.isMyPlayer) {
                    p.stars = 5;
                } else if (p.potential !== undefined) {
                    p.stars = getPotentialStars(p.overall, p.potential);
                } else {
                    p.stars = 0.5;
                }
            }
        });
        // Ensure at least 3 players have >= 1.5 stars
        const highStarCount = gameState.players.filter(p => p && !p.isMyPlayer && (p.stars || 0) >= 1.5).length;
        if (highStarCount < 3) {
            const lowStarPlayers = gameState.players.filter(p => p && !p.isMyPlayer && (p.stars || 0) < 1.5)
                .sort(() => Math.random() - 0.5).slice(0, 3 - highStarCount);
            lowStarPlayers.forEach(p => {
                p.age = random(18, 23);
                p.stars = randomFromArray([1.5, 2, 2, 2.5, 3]);
            });
        }
    }

    // Migrate youth players: assign potentialStars if missing
    if (gameState.youthPlayers && gameState.youthPlayers.length > 0) {
        const needsMigration = gameState.youthPlayers.some(p => p.potentialStars === undefined);
        if (needsMigration) {
            const maxStars = getAcademyMaxStars();
            const steps = Math.floor(maxStars / 0.5);
            gameState.youthPlayers.forEach(p => {
                if (p.potentialStars === undefined) {
                    p.potentialStars = (random(1, steps) * 0.5);
                }
            });
        }
    }

    // Migrate stadium: buildings that should start unbuilt
    if (gameState.stadium) {
        const unbuiltMigrations = {
            medical: 'med_0', scouting: 'scout_0', youthscouting: 'ysct_0',
            kantine: 'kantine_0', sponsoring: 'sponsor_0', perszaal: 'pers_0'
        };
        Object.entries(unbuiltMigrations).forEach(([key, lvl0]) => {
            const config = STADIUM_TILE_CONFIG[key];
            if (!config) return;
            const currentId = gameState.stadium[config.stateKey];
            // If still on old free level 1 (cost was 0), migrate to level 0
            if (currentId === config.levels[1]?.id) {
                const oldCost = config.levels[1]?.cost;
                // Only migrate if they never actually paid to build (old saves had cost 0)
                if (oldCost && !gameState.stadium._migratedV3) {
                    gameState.stadium[config.stateKey] = lvl0;
                }
            }
            // If key is missing entirely, set to unbuilt
            if (!currentId) {
                gameState.stadium[config.stateKey] = lvl0;
            }
        });
        gameState.stadium._migratedV3 = true;
    }

    // Check and apply daily reward (silently)
    const dailyRewardResult = checkDailyReward(gameState);
    // Reward is claimed but no modal shown

    // Age youth players daily
    ageYouthPlayersDaily();

    // Generate fake match history for testing (only on first load with no history)
    if ((!gameState.matchHistory || gameState.matchHistory.length === 0) && gameState.players.length > 0) {
        generateFakeMatchHistory();
    }

    // Reset match timer so match is always playable on refresh
    gameState.nextMatch.time = Date.now() - 1000;

    // Render initial content
    renderStandings();
    renderTopScorers();
    renderPlayerCards();
    updateBudgetDisplays();
    renderDashboardExtras();

    // Initialize interactions
    initNavigation();
    initQuickActions();
    initFilters();
    initModals();
    initScoutFilters();
    initTrainingButton();

    // Initialize new features
    initTransferMarket();
    initScoutCriteria();
    initTacticsTabs();
    initChairmanTips();
    initPlayMatchButton();
    initSaveLoadButtons();

    // Start timers
    startTimers();

    // Start auto-save
    startAutoSave(gameState);

    // Random events disabled - no popups on dashboard load

    // Check achievements
    const newAchievements = checkAchievements(gameState);
    if (newAchievements.length > 0) {
        setTimeout(() => queueAchievements(newAchievements), 2000);
    }

    console.log('🎮 Zaterdagvoetbal v2.0 initialized!');
    console.log('📊 Squad:', gameState.players.length, 'players');
    console.log('💰 Budget:', formatCurrency(gameState.club.budget));
    console.log('🏆 Achievements:', getAchievementStats(gameState).unlocked + '/' + getAchievementStats(gameState).total);
}

// ================================================
// DASHBOARD EXTRAS
// ================================================

function renderDashboardExtras() {
    // Render trainer card
    const managerInfo = getManagerLevel(gameState.manager?.xp || 0);
    const currentXp = managerInfo.xp;
    const xpForNextLevel = currentXp + managerInfo.xpToNext;
    const progressPercent = Math.round(managerInfo.progress * 100);

    // Update trainer info (works for both old and new dashboard)
    const trainerTitle = document.getElementById('trainer-title');
    const trainerLevel = document.getElementById('trainer-level');
    const xpCurrent = document.getElementById('xp-current');
    const xpTarget = document.getElementById('xp-target');
    const xpFill = document.getElementById('xp-fill');

    if (trainerTitle) trainerTitle.textContent = managerInfo.title;
    if (trainerLevel) trainerLevel.textContent = managerInfo.level;
    if (xpCurrent) xpCurrent.textContent = currentXp;
    if (xpTarget) xpTarget.textContent = managerInfo.xpToNext > 0 ? xpForNextLevel : 'MAX';
    if (xpFill) xpFill.style.width = `${progressPercent}%`;

    // Update global top bar manager info
    const globalManagerTitle = document.getElementById('global-manager-title');
    const globalManagerLevel = document.getElementById('global-manager-level');
    const globalXpFill = document.getElementById('global-xp-fill');
    if (globalManagerTitle) globalManagerTitle.textContent = managerInfo.title;
    if (globalManagerLevel) globalManagerLevel.textContent = managerInfo.level;
    if (globalXpFill) globalXpFill.style.width = `${progressPercent}%`;
    const globalXpLabel = document.getElementById('global-xp-label');
    if (globalXpLabel) globalXpLabel.textContent = managerInfo.xpToNext > 0 ? `${currentXp} / ${xpForNextLevel} XP` : `${currentXp} XP — Max!`;

    // Render streak (new kantine board sticker)
    const streak = gameState.dailyRewards?.streak || 0;
    const dailyStreakSticker = document.getElementById('daily-streak');
    if (dailyStreakSticker && dailyStreakSticker.classList.contains('daily-streak-sticker')) {
        dailyStreakSticker.innerHTML = `
            <span class="streak-fire">🔥</span>
            <span class="streak-count">${streak}</span>
            <span class="streak-label">dagen</span>
        `;
    }

    // Update streak displays
    const streakDays = document.getElementById('streak-days');
    if (streakDays) streakDays.textContent = streak;
    const sidebarStreak = document.querySelector('.streak-display');
    if (sidebarStreak) sidebarStreak.textContent = streak;

    // Update claim button state
    const claimBtn = document.getElementById('btn-claim-daily');
    if (claimBtn) {
        const today = new Date().toDateString();
        const alreadyClaimed = gameState.dailyRewards?.lastClaimDate === today;
        const nextRewardDay = ((streak) % 7) + 1;
        const rewardAmounts = [100, 200, 300, 400, 500, 600, 1000];

        if (alreadyClaimed) {
            claimBtn.disabled = true;
            claimBtn.textContent = '✓';
        } else {
            claimBtn.disabled = false;
            claimBtn.textContent = `€${rewardAmounts[nextRewardDay - 1]}`;
        }
    }

    // Render season info (new separate elements)
    const seasonNumberEl = document.getElementById('season-number');
    const weekNumberEl = document.getElementById('week-number');
    const newspaperWeek = document.getElementById('newspaper-week');
    const posterMatchday = document.getElementById('poster-matchday');

    if (seasonNumberEl) seasonNumberEl.textContent = gameState.season;
    if (weekNumberEl) weekNumberEl.textContent = gameState.week;
    if (newspaperWeek) newspaperWeek.textContent = gameState.week;
    if (posterMatchday) posterMatchday.textContent = gameState.week;

    // Update team names on poster
    const homeTeamName = document.getElementById('home-team-name');
    const awayTeamName = document.getElementById('away-team-name');
    if (homeTeamName) homeTeamName.textContent = gameState.club.name;
    if (awayTeamName && gameState.nextMatch) awayTeamName.textContent = gameState.nextMatch.opponent;

    // Update chalkboard stats
    const statWins = document.getElementById('stat-wins');
    const statDraws = document.getElementById('stat-draws');
    const statLosses = document.getElementById('stat-losses');
    if (statWins) statWins.textContent = gameState.stats?.wins || 0;
    if (statDraws) statDraws.textContent = gameState.stats?.draws || 0;
    if (statLosses) statLosses.textContent = gameState.stats?.losses || 0;

    // Update top scorer polaroid
    updateTopScorerPolaroid();

    // Render dashboard finances, top players and checklist
    renderDashboardFinances();
    renderDashboardTopPlayers();
    resetDailyChecklist();
    renderDashboardChecklist();

    // Initialize sticky note quick actions
    initStickyNotes();
}

function renderDashboardFinances() {
    const container = document.getElementById('dashboard-finances');
    if (!container) return;

    const budget = gameState.club.budget || 0;
    const fin = calculateWeeklyFinances();
    const weekly = fin.weeklyResult;
    const sign = weekly >= 0 ? '+' : '';
    const color = weekly >= 0 ? 'var(--accent-green)' : '#c62828';
    const trendArrow = weekly >= 0 ? '↑' : '↓';

    container.innerHTML = `
        <div class="fin-budget">
            <span class="fin-label">Saldo</span>
            <span class="fin-amount">${formatCurrency(budget)}</span>
            <span class="fin-daily" style="color: ${color}">${trendArrow} ${sign}${formatCurrency(weekly)}/wk</span>
        </div>
        <div class="fin-breakdown">
            <div class="fin-row fin-income">
                <span class="fin-row-label">Inkomsten /wk</span>
                <span class="fin-row-val" style="color: var(--accent-green)">+${formatCurrency(fin.totalIncome)}</span>
            </div>
            <div class="fin-row fin-expense">
                <span class="fin-row-label">Uitgaven /wk</span>
                <span class="fin-row-val" style="color: #c62828">-${formatCurrency(fin.totalExpense)}</span>
            </div>
        </div>
    `;
}

function renderDashboardTopPlayers() {
    const container = document.getElementById('dashboard-toptalents');
    if (!container) return;

    // Get youth players sorted by potential
    const topTalents = [...(gameState.youthPlayers || [])]
        .sort((a, b) => (b.potentialStars || 1) - (a.potentialStars || 1))
        .slice(0, 3);

    if (topTalents.length === 0) {
        container.innerHTML = '<p style="font-size: 0.6rem; color: var(--text-muted); text-align: center; padding: 6px;">Upgrade jeugdacademie</p>';
        return;
    }

    container.innerHTML = topTalents.map((player) => {
        const stars = player.potentialStars || 1;
        const starsHtml = renderStarsHTML(stars);
        const posData = POSITIONS[player.position] || { color: '#1a5f2a', abbr: '?' };
        const maxLevel = getYouthMaxLevel(player.age);
        const level = getYouthLevel(player.overall, maxLevel);
        return `
            <div class="tt-item">
                <span class="tt-pos" style="background: ${posData.color}">${posData.abbr}</span>
                <span class="tt-flag">${player.nationality?.flag || '🇳🇱'}</span>
                <div class="tt-info">
                    <span class="tt-name">${player.name}</span>
                    <span class="tt-age">${player.age} jaar</span>
                </div>
                <div class="tt-ovr" style="background: ${posData.color}"><span class="tt-ovr-value">${level}</span><span class="tt-ovr-label">ALG</span></div>
                <span class="tt-stars">${starsHtml}</span>
            </div>
        `;
    }).join('');
}

// ================================================
// DAILY CHECKLIST SYSTEM
// ================================================

function resetDailyChecklist() {
    const today = new Date().toDateString();
    if (!gameState.dailyChecklist) {
        gameState.dailyChecklist = {};
    }
    if (gameState.dailyChecklist.lastResetDate !== today) {
        gameState.dailyChecklist = {
            lastResetDate: today,
            tacticsVisited: false,
            sponsorsVisited: false,
            scoutStarted: false,
            youthVisited: false,
            transfersVisited: false,
            stadiumVisited: false,
            staffVisited: false
        };
    }
}

function markChecklistItem(key) {
    resetDailyChecklist();
    if (gameState.dailyChecklist[key] !== undefined) {
        gameState.dailyChecklist[key] = true;
        renderDashboardChecklist();
    }
}

function getChecklistItems() {
    resetDailyChecklist();
    const cl = gameState.dailyChecklist;

    // Auto-detect lineup: 11 non-null slots
    const hasLineup = (gameState.lineup || []).filter(x => x !== null).length >= 11;

    // Auto-detect training: any slot has a player
    const slots = gameState.training?.slots || {};
    const hasTraining = Object.values(slots).some(s => s.playerId !== null);

    const mustDo = [
        {
            id: 'lineup',
            label: 'Opstelling maken',
            done: hasLineup,
            action: 'tactics',
            icon: '📋'
        },
        {
            id: 'tactics',
            label: 'Tactiek bedenken',
            done: cl.tacticsVisited,
            action: 'tactics',
            icon: '🧠'
        },
        {
            id: 'sponsors',
            label: 'Sponsors werven',
            done: cl.sponsorsVisited,
            action: 'sponsors',
            icon: '🤝'
        },
        {
            id: 'training',
            label: 'Individuele training',
            done: hasTraining,
            action: 'training',
            icon: '💪'
        }
    ];

    const mayDo = [
        {
            id: 'scout',
            label: 'Scouten',
            done: cl.scoutStarted || gameState.scoutMission?.active,
            action: 'scout',
            icon: '🔍'
        },
        {
            id: 'youth',
            label: 'Jeugd rekruteren',
            done: cl.youthVisited,
            action: 'jeugdteam',
            icon: '⭐'
        },
        {
            id: 'transfers',
            label: 'Team versterken',
            done: cl.transfersVisited,
            action: 'transfers',
            icon: '🔄'
        },
        {
            id: 'stadium',
            label: 'Stadionupgrades',
            done: cl.stadiumVisited,
            action: 'stadium',
            icon: '🏟️'
        },
        {
            id: 'staff',
            label: 'Staf aannemen',
            done: cl.staffVisited,
            action: 'staff',
            icon: '👔'
        }
    ];

    return { mustDo, mayDo };
}

function renderDashboardChecklist() {
    const container = document.getElementById('dashboard-checklist');
    if (!container) return;

    const { mustDo, mayDo } = getChecklistItems();
    const totalMust = mustDo.length;
    const doneMust = mustDo.filter(i => i.done).length;
    const totalMay = mayDo.length;
    const doneMay = mayDo.filter(i => i.done).length;
    const allDone = doneMust === totalMust;

    function renderItem(item) {
        return `
            <div class="cl-item ${item.done ? 'cl-done' : ''}" onclick="handleChecklistClick('${item.action}')">
                <div class="cl-checkbox ${item.done ? 'cl-checked' : ''}">
                    ${item.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>' : ''}
                </div>
                <span class="cl-icon">${item.icon}</span>
                <span class="cl-label">${item.label}</span>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="cl-progress">
            <div class="cl-progress-bar">
                <div class="cl-progress-fill" style="width: ${(doneMust / totalMust) * 100}%"></div>
            </div>
            <span class="cl-progress-text">${doneMust}/${totalMust}</span>
        </div>
        <div class="cl-section">
            <div class="cl-section-label">To Do</div>
            ${mustDo.map(renderItem).join('')}
        </div>
        <div class="cl-section">
            <div class="cl-section-label">Ook niet vergeten <span class="cl-optional-count">${doneMay}/${totalMay}</span></div>
            ${mayDo.map(renderItem).join('')}
        </div>
        ${allDone ? '<div class="cl-complete">Alles afgevinkt! Top, trainer! ⚽</div>' : ''}
    `;
}

function handleChecklistClick(action) {
    navigateToPage(action);
}

// Make functions globally accessible
window.handleChecklistClick = handleChecklistClick;
window.navigateTo = navigateToPage;

function updateTopScorerPolaroid() {
    const photoEl = document.getElementById('top-scorer-photo');
    const nameEl = document.getElementById('top-scorer-name');
    const statEl = document.getElementById('top-scorer-stat');

    if (!photoEl || !nameEl || !statEl) return;

    // Find top scorer from players
    const topScorer = gameState.players
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals)[0];

    if (topScorer) {
        photoEl.textContent = '⚽';
        nameEl.textContent = topScorer.name;
        statEl.textContent = `${topScorer.goals} doelpunten`;
    } else {
        photoEl.textContent = '⭐';
        nameEl.textContent = 'Nog geen';
        statEl.textContent = 'topscorer';
    }
}

function initStickyNotes() {
    // Support all action button class names
    const actionButtons = document.querySelectorAll('.sticky-note, .sticky-compact, .kd-action, .da-btn');
    actionButtons.forEach(btn => {
        // Remove existing listeners to prevent duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            const action = newBtn.dataset.action;
            switch (action) {
                case 'training':
                    document.querySelector('[data-page="training"]')?.click();
                    break;
                case 'lineup':
                    document.querySelector('[data-page="tactics"]')?.click();
                    break;
                case 'scout':
                    document.querySelector('[data-page="scout"]')?.click();
                    break;
                case 'transfers':
                    document.querySelector('[data-page="transfers"]')?.click();
                    break;
                case 'squad':
                    document.querySelector('[data-page="squad"]')?.click();
                    break;
                case 'stadium':
                    document.querySelector('[data-page="stadium"]')?.click();
                    break;
            }
        });
    });
}

function claimDailyBonus() {
    const result = checkDailyReward(gameState);
    if (result.alreadyClaimed) {
        showNotification('Je hebt vandaag al geclaimd!', 'info');
        return;
    }

    if (result.claimed) {
        showNotification(`+€${result.reward.amount} ontvangen! ${result.reward.description}`, 'success');
        updateBudgetDisplays();
        renderDashboardExtras();
        saveGame();
    }
}

window.claimDailyBonus = claimDailyBonus;

// ================================================
// PLAY MATCH SYSTEM
// ================================================

function initPlayMatchButton() {
    // Button behavior is set dynamically by updateMatchTimer()
}

function playMatch() {
    // Block manual match play in multiplayer mode
    if (isMultiplayer()) {
        showNotification('Wedstrijden worden automatisch gesimuleerd om 20:00!', 'info');
        return;
    }

    // Check if match is available
    const now = Date.now();
    if (gameState.nextMatch.time > now) {
        showNotification('De wedstrijd is nog niet beschikbaar!', 'warning');
        return;
    }

    // Check if lineup is valid
    const validLineup = gameState.lineup.filter(p => p !== null);
    if (validLineup.length < 11) {
        showNotification('Vul eerst je opstelling aan (11 spelers nodig)!', 'error');
        return;
    }

    // Generate opponent
    const opponent = generateOpponent(
        gameState.club.division,
        gameState.nextMatch.opponentPosition || random(1, 8)
    );
    opponent.name = gameState.nextMatch.opponent || opponent.name;

    // Determine if home game (alternate)
    const isHome = (gameState.week % 2 === 1);

    // Simulate match
    const result = simulateMatch(
        { name: gameState.club.name, strength: calculateTeamStrength(gameState.lineup, gameState.formation, gameState.tactics, gameState.lineup) },
        opponent,
        gameState.lineup,
        gameState.formation,
        gameState.tactics,
        isHome
    );

    // Determine scores from player's perspective
    const playerScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;

    // Apply results to player stats
    applyMatchResults(gameState.lineup, result, isHome);

    // Update standings
    updateStandings(gameState.standings, gameState.club.name, playerScore, opponentScore);
    updateStandings(gameState.standings, opponent.name, opponentScore, playerScore);

    // Simulate AI matches
    simulateAIMatches(gameState.standings);

    // Update club stats
    gameState.club.stats.totalMatches++;
    gameState.club.stats.totalGoals += playerScore;

    // Update match statistics
    const resultType = getMatchResultType(result.homeScore, result.awayScore, isHome);
    if (resultType === 'win') {
        gameState.stats.wins++;
        gameState.stats.currentUnbeaten++;
        gameState.stats.currentWinStreak = (gameState.stats.currentWinStreak || 0) + 1;
        if (isHome) gameState.stats.homeWins++;
    } else if (resultType === 'draw') {
        gameState.stats.draws++;
        gameState.stats.currentUnbeaten++;
        gameState.stats.currentWinStreak = 0;
    } else {
        gameState.stats.losses++;
        gameState.stats.currentUnbeaten = 0;
        gameState.stats.currentWinStreak = 0;
    }

    // Update all-time records
    gameState.stats.bestWinStreak = Math.max(gameState.stats.bestWinStreak || 0, gameState.stats.currentWinStreak);
    gameState.stats.bestUnbeaten = Math.max(gameState.stats.bestUnbeaten || 0, gameState.stats.currentUnbeaten);

    if (opponentScore === 0) {
        gameState.stats.cleanSheets++;
    }

    if (playerScore > gameState.stats.highestScoreMatch) {
        gameState.stats.highestScoreMatch = playerScore;
    }

    // Check for Saturday match
    if (new Date().getDay() === 6) {
        gameState.stats.saturdayMatches++;
    }

    // Award Manager XP
    const xpReasons = [];
    if (resultType === 'win') { awardXP(gameState, 'matchWin'); xpReasons.push({ reason: 'Wedstrijd gewonnen', amount: 50 }); }
    else if (resultType === 'draw') { awardXP(gameState, 'matchDraw'); xpReasons.push({ reason: 'Gelijkspel', amount: 20 }); }
    if (opponentScore === 0) { awardXP(gameState, 'cleanSheet'); xpReasons.push({ reason: 'Clean sheet', amount: 25 }); }
    if (playerScore > 0) { awardXP(gameState, 'goalScored', playerScore * 5); xpReasons.push({ reason: `${playerScore} doelpunt${playerScore > 1 ? 'en' : ''} gescoord`, amount: playerScore * 5 }); }
    if (xpReasons.length > 0) showManagerXPPopup(xpReasons);

    // Award Player XP
    if (resultType === 'win') awardPlayerXP(gameState, 'matchWin');
    else if (resultType === 'draw') awardPlayerXP(gameState, 'matchDraw');
    if (opponentScore === 0) awardPlayerXP(gameState, 'cleanSheet');
    awardPlayerXP(gameState, 'goalScored', playerScore * 10);

    // Player improvement: only lineup players with >= 1.5 stars improve
    // Growth works via progress bar: each match adds %, at 100% → +1 ALG (max 99)
    const improvements = [];
    const lineupIds = new Set((gameState.lineup || []).filter(p => p).map(p => p.id));
    gameState.players.forEach(player => {
        if (!player) return;
        if (!lineupIds.has(player.id)) return; // Only lineup players
        const stars = player.isMyPlayer ? 5 : (player.stars || 0.5);
        if (stars >= 1.5 && player.overall < 99) {
            // Growth per match: stars determine speed (1.5★ = slow, 5★ = fast)
            const growthGain = Math.round(15 + stars * 4 + Math.random() * 10);
            if (!player.growthProgress) player.growthProgress = 0;
            player.growthProgress += growthGain;
            let leveled = false;
            if (player.growthProgress >= 100) {
                player.growthProgress -= 100;
                player.overall = Math.min(99, player.overall + 1);
                leveled = true;
            }
            improvements.push({ id: player.id, name: player.name, stars, gainPct: growthGain, progressPct: player.growthProgress, leveled, newOverall: player.overall });
        } else {
            improvements.push({ id: player.id, name: player.name, stars, gainPct: 0, progressPct: 0, leveled: false, newOverall: player.overall });
        }
    });

    // Compact playerRatings for storage (embed growth data directly)
    const improvById = {};
    improvements.forEach(imp => { improvById[String(imp.id)] = imp; });
    const compactRatings = result.playerRatings ? Object.entries(result.playerRatings).map(([id, data]) => {
        const pid = isNaN(Number(id)) ? id : Number(id);
        const imp = improvById[String(pid)];
        return {
            id: pid,
            name: data.player.name,
            position: data.player.position,
            rating: Math.round(data.rating * 10) / 10,
            goals: data.goals,
            assists: data.assists,
            yellowCards: data.yellowCards,
            redCards: data.redCards,
            gainPct: imp ? imp.gainPct : 0,
            progressPct: imp ? imp.progressPct : 0,
            leveled: imp ? imp.leveled : false,
            potStars: imp ? imp.stars : 0
        };
    }) : [];

    // Count corners from events
    const cornersHome = result.events.filter(e => e.type === 'corner' && e.team === 'home').length;
    const cornersAway = result.events.filter(e => e.type === 'corner' && e.team === 'away').length;

    // Generate chairman comments
    const chairmanComments = generateChairmanComments(result, isHome, improvements, resultType, playerScore, opponentScore);

    // Important events to store
    const storedEvents = result.events.filter(e =>
        ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'penalty_miss'].includes(e.type)
    );

    // Store last match
    gameState.lastMatch = {
        ...result,
        isHome,
        playerScore,
        opponentScore,
        resultType,
        opponent: opponent.name,
        playerRatings: compactRatings,
        improvements,
        chairmanComments,
        corners: { home: cornersHome, away: cornersAway },
        fouls: result.fouls || { home: 0, away: 0 },
        cards: result.cards || { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } }
    };

    // Calculate new fans
    const baseFans = resultType === 'win' ? 10 : resultType === 'draw' ? 3 : -2;
    const offensiveMultipliers = { zeer_verdedigend: 0.5, verdedigend: 0.7, gebalanceerd: 1.0, offensief: 1.5, leeroy: 2.0 };
    const offensiveMultiplier = offensiveMultipliers[gameState.tactics.offensief] || 1.0;
    const homeMultiplier = isHome ? 1.2 : 1.0;
    const goalBonus = playerScore * 2;
    const newFans = Math.round(baseFans * offensiveMultiplier * homeMultiplier) + goalBonus;
    gameState.club.fans = Math.max(0, (gameState.club.fans || 50) + newFans);
    gameState.lastMatch.newFans = newFans;

    // Increase formation drive for the formation used this match (+15-20%)
    if (!gameState.formationDrives) gameState.formationDrives = {};
    const driveGain = 15 + Math.random() * 5;
    gameState.formationDrives[gameState.formation] = Math.min(100, (gameState.formationDrives[gameState.formation] || 0) + driveGain);

    // Push to match history
    if (!gameState.matchHistory) gameState.matchHistory = [];
    gameState.matchHistory.push({
        week: gameState.week,
        season: gameState.season,
        opponent: opponent.name,
        isHome,
        playerScore,
        opponentScore,
        resultType,
        events: storedEvents,
        possession: result.possession,
        shots: result.shots,
        shotsOnTarget: result.shotsOnTarget,
        corners: { home: cornersHome, away: cornersAway },
        fouls: result.fouls || { home: 0, away: 0 },
        cards: result.cards || { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } },
        manOfTheMatch: result.manOfTheMatch,
        playerRatings: compactRatings,
        improvements,
        chairmanComments
    });

    // Advance week
    gameState.week++;

    // Tick sponsor contracts (decrease weeks remaining)
    tickSponsorContracts();

    // Refresh sponsor market for new week
    generateSponsorMarket();

    // Check if season is complete
    if (isSeasonComplete(gameState.standings)) {
        const seasonResult = handleEndOfSeason();
        showSeasonEndModal(seasonResult);
    } else {
        // Set next match
        setNextMatch();
    }

    // Show match result modal
    showMatchResultModal(result, isHome, opponent.name);

    // Check achievements
    const newAchievements = checkAchievements(gameState);
    if (newAchievements.length > 0) {
        setTimeout(() => queueAchievements(newAchievements), 3000);
    }

    // Re-render UI
    renderStandings();
    renderTopScorers();
    renderPlayerCards();
    updateBudgetDisplays();
    renderDashboardExtras();

    // Save game
    saveGame(gameState);
}

function setNextMatch() {
    const nextOpponent = getNextOpponent(gameState.standings, gameState.week);
    if (nextOpponent) {
        gameState.nextMatch = {
            opponent: nextOpponent.name,
            time: getNextMidnight(),
            isHome: nextOpponent.isHome,
            opponentPosition: nextOpponent.position
        };
    } else {
        // Default
        gameState.nextMatch = {
            opponent: 'Onbekende Tegenstander',
            time: getNextMidnight()
        };
    }
}

function handleEndOfSeason() {
    const result = calculateSeasonResults(gameState.standings, gameState.club.division);

    // Track promotions/relegation escapes
    if (result.promoted) {
        gameState.stats.promotions++;
        awardXP(gameState, 'promotion');
        awardPlayerXP(gameState, 'promotion');
        showManagerXPPopup([{ reason: 'Promotie!', amount: 500 }]);
    }
    if (result.position === 6) {
        gameState.stats.relegationEscapes++;
    }
    if (result.isChampion) {
        awardXP(gameState, 'title');
        awardPlayerXP(gameState, 'title');
        showManagerXPPopup([{ reason: 'Kampioen!', amount: 1000 }]);
    }

    // Start new season
    startNewSeason(gameState);

    return result;
}

// ================================================
// WEDSTRIJDEN PAGE
// ================================================

function renderMatchesPage() {
    // Update season/week label
    const label = document.getElementById('matches-season-label');
    if (label) label.textContent = `Seizoen ${gameState.season} · Week ${gameState.week}`;

    // Init tab switching
    document.querySelectorAll('.matches-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.matches-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.matches-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panelId = `matches-${tab.dataset.matchesTab}`;
            document.getElementById(panelId)?.classList.add('active');
        });
    });

    renderMatchReport();
    renderPlayerRatingsTab();
    renderMatchProgram();
}

function generateChairmanComments(result, isHome, improvements, resultType, playerScore, opponentScore) {
    const positiveOptions = [];
    const negativeOptions = [];

    // Positive options
    if (resultType === 'win') positiveOptions.push('De voorzitter is tevreden met de overwinning.');
    if (opponentScore === 0) positiveOptions.push('De voorzitter prijst de verdediging — geen tegendoelpunt!');
    if (playerScore >= 3) positiveOptions.push('Wat een doelpuntenfestijn! De voorzitter geniet.');
    if (result.manOfTheMatch) positiveOptions.push(`De voorzitter is onder de indruk van ${result.manOfTheMatch.name}.`);
    if (improvements.length > 0) positiveOptions.push(`${improvements[0].name} wordt steeds beter! De voorzitter ziet de groei.`);
    if (positiveOptions.length === 0) positiveOptions.push('De voorzitter waardeert de inzet van het team.');

    // Negative options
    if (resultType === 'loss') negativeOptions.push('De voorzitter maakt zich zorgen over het resultaat.');
    if (opponentScore >= 3) negativeOptions.push('Te veel tegendoelpunten. De voorzitter wil actie.');
    const cards = (result.events || []).filter(e => e.type === 'yellow_card' || e.type === 'red_card');
    if (cards.length >= 2) negativeOptions.push('Te veel kaarten. De discipline moet beter.');
    const possession = isHome ? result.possession?.home : result.possession?.away;
    if (possession && possession < 40) negativeOptions.push('De voorzitter vindt dat we meer aan de bal moeten zijn.');
    if (playerScore === 0) negativeOptions.push('Niet gescoord. De voorzitter verwacht meer aanvallend vermogen.');
    if (negativeOptions.length === 0) negativeOptions.push('De voorzitter ziet altijd ruimte voor verbetering.');

    return {
        positive: positiveOptions[Math.floor(Math.random() * positiveOptions.length)],
        negative: negativeOptions[Math.floor(Math.random() * negativeOptions.length)]
    };
}

function renderMatchReport() {
    const container = document.getElementById('matches-verslag');
    if (!container) return;

    const match = gameState.lastMatch;
    if (!match) {
        container.innerHTML = `
            <div class="match-report-empty">
                <div class="match-report-empty-icon">⚽</div>
                <p>Nog geen wedstrijd gespeeld</p>
                <p class="match-report-empty-sub">Speel je eerste wedstrijd om hier het verslag te zien.</p>
            </div>
        `;
        return;
    }

    const { isHome, playerScore, opponentScore, resultType, opponent } = match;
    const resultClass = resultType === 'win' ? 'result-win' : resultType === 'loss' ? 'result-loss' : 'result-draw';
    const resultText = resultType === 'win' ? 'Gewonnen!' : resultType === 'loss' ? 'Verloren' : 'Gelijkspel';

    // Stats
    const possHome = isHome ? match.possession.home : match.possession.away;
    const possAway = isHome ? match.possession.away : match.possession.home;
    const shotsHome = isHome ? match.shots.home : match.shots.away;
    const shotsAway = isHome ? match.shots.away : match.shots.home;
    const sotHome = isHome ? match.shotsOnTarget.home : match.shotsOnTarget.away;
    const sotAway = isHome ? match.shotsOnTarget.away : match.shotsOnTarget.home;
    const cornersHome = isHome ? (match.corners?.home || 0) : (match.corners?.away || 0);
    const cornersAway = isHome ? (match.corners?.away || 0) : (match.corners?.home || 0);
    const foulsHome = isHome ? (match.fouls?.home || 0) : (match.fouls?.away || 0);
    const foulsAway = isHome ? (match.fouls?.away || 0) : (match.fouls?.home || 0);
    const cardsYellowHome = isHome ? (match.cards?.home?.yellow || 0) : (match.cards?.away?.yellow || 0);
    const cardsYellowAway = isHome ? (match.cards?.away?.yellow || 0) : (match.cards?.home?.yellow || 0);
    const cardsRedHome = isHome ? (match.cards?.home?.red || 0) : (match.cards?.away?.red || 0);
    const cardsRedAway = isHome ? (match.cards?.away?.red || 0) : (match.cards?.home?.red || 0);

    // Goal scorers with minutes — only show OUR team's goals
    const events = match.events || [];
    const ourTeam = isHome ? 'home' : 'away';
    const ourGoals = events.filter(e => (e.type === 'goal' || e.type === 'penalty') && e.team === ourTeam).sort((a, b) => a.minute - b.minute);
    const ownGoalEvents = events.filter(e => e.type === 'own_goal' && e.team === ourTeam).sort((a, b) => a.minute - b.minute);
    const cardEvents = events.filter(e => (e.type === 'yellow_card' || e.type === 'red_card') && e.team === ourTeam).sort((a, b) => a.minute - b.minute);

    const ratings = match.playerRatings || [];
    let goalItems = [];
    if (ourGoals.length > 0 || ownGoalEvents.length > 0) {
        ourGoals.forEach(g => goalItems.push({ minute: g.minute, name: g.player || '?', ownGoal: false }));
        ownGoalEvents.forEach(g => goalItems.push({ minute: g.minute, name: g.player || '?', ownGoal: true }));
        goalItems.sort((a, b) => (a.minute || 0) - (b.minute || 0));
    } else if (playerScore > 0) {
        // Fallback: build from playerRatings goals
        const scorers = ratings.filter(p => p.goals > 0);
        scorers.forEach(p => {
            for (let i = 0; i < p.goals; i++) {
                goalItems.push({ minute: null, name: p.name, ownGoal: false });
            }
        });
    }

    const goalSummaryHtml = goalItems.length > 0 ? `
        <div class="report-goal-summary">
            ${goalItems.map(g => {
                const minuteStr = g.minute ? `${g.minute}' ` : '';
                return g.ownGoal
                    ? `<span class="report-goal-item own-goal">⚽ ${minuteStr}${g.name} (e.d.)</span>`
                    : `<span class="report-goal-item">⚽ ${minuteStr}${g.name}</span>`;
            }).join('')}
        </div>
    ` : '';

    const cardSummaryHtml = cardEvents.length > 0 ? `
        <div class="report-card-summary">
            ${cardEvents.map(c => `<span class="report-card-item">${c.type === 'red_card' ? '🟥' : '🟨'} ${c.minute}' ${c.player || ''}</span>`).join('')}
        </div>
    ` : '';

    // Player ratings (sorted by position: keeper → defenders → midfielders → attackers)
    const posOrder = ['keeper', 'linksback', 'centraleVerdediger', 'rechtsback', 'linksMid', 'centraleMid', 'rechtsMid', 'linksbuiten', 'rechtsbuiten', 'spits'];
    const sortedRatings = [...ratings].sort((a, b) => posOrder.indexOf(a.position) - posOrder.indexOf(b.position));
    const ratingsHtml = sortedRatings.length > 0 ? `
        <table class="match-ratings-table">
            <thead>
                <tr><th>Pos</th><th>Speler</th><th>ALG</th><th>Cijfer</th><th>Groei</th></tr>
            </thead>
            <tbody>
                ${sortedRatings.map(p => {
                    const ratingClass = p.rating >= 8.0 ? 'good' : p.rating >= 6.5 ? 'okay' : 'poor';
                    const posAbbr = POSITIONS[p.position]?.abbr || p.position;
                    const icons = (p.goals ? '⚽'.repeat(p.goals) : '') + (p.assists ? '🅰️'.repeat(p.assists) : '') + (p.yellowCards ? '🟨'.repeat(p.yellowCards) : '') + (p.redCards ? '🟥'.repeat(p.redCards) : '');
                    const actualPlayer = gameState.players.find(pl => pl && pl.id === p.id);
                    const isMyPlayer = actualPlayer && actualPlayer.isMyPlayer;
                    const stars = isMyPlayer ? 5 : (actualPlayer ? (actualPlayer.stars || 0.5) : (p.potStars || 0));
                    let growthHTML;
                    if (isMyPlayer) {
                        growthHTML = `<a class="rating-myplayer-link" onclick="navigateTo('training')">Check voortgang</a>`;
                    } else if (p.gainPct > 0) {
                        const levelUpIcon = p.leveled ? ' <span class="rating-levelup">+1 ALG!</span>' : '';
                        growthHTML = `<div class="rating-growth-wrap">
                            <div class="rating-growth-bar"><div class="rating-growth-fill" style="width: ${p.progressPct}%"></div></div>
                            <span class="rating-growth-label-positive">+${p.gainPct}%</span>${levelUpIcon}
                        </div>`;
                    } else if (stars < 1.5) {
                        growthHTML = `<span class="rating-no-growth">-</span>`;
                    } else {
                        growthHTML = `<span class="rating-no-growth">-</span>`;
                    }
                    const posData2 = POSITIONS[p.position] || { color: '#666' };
                    return `<tr>
                        <td><span class="mr-pos-badge" style="background: ${posData2.color}">${posAbbr}</span></td>
                        <td>${p.name} ${icons}</td>
                        <td><span class="mr-ovr-badge" style="background: ${posData2.color}">${actualPlayer ? actualPlayer.overall : '?'}</span></td>
                        <td><span class="match-rating-badge ${ratingClass}">${p.rating.toFixed(1)}</span></td>
                        <td class="rating-growth-cell">${growthHTML}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    ` : '';

    // Chairman + improvements (compact)
    const comments = match.chairmanComments;
    const improvements = match.improvements || [];

    container.innerHTML = `
        <div class="match-report-container">
            <div class="report-grid">
                <div class="report-col-left">
                    <div class="match-result-scoreboard ${resultClass}">
                        <div class="match-result-team home">
                            <span class="match-result-team-name">${gameState.club.name}</span>
                        </div>
                        <div class="match-result-score-display">
                            <span class="match-result-score-num">${playerScore}</span>
                            <span class="match-result-score-sep">-</span>
                            <span class="match-result-score-num">${opponentScore}</span>
                        </div>
                        <div class="match-result-team away">
                            <span class="match-result-team-name">${opponent}</span>
                        </div>
                    </div>
                    <div class="match-result-verdict">${resultText}</div>
                    ${goalSummaryHtml}
                    ${cardSummaryHtml}

                    <div class="match-result-stats-compact">
                        <div class="stat-compact-row"><span class="stat-compact-val">${possHome}%</span><span class="stat-compact-label">Balbezit</span><span class="stat-compact-val">${possAway}%</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${shotsHome}</span><span class="stat-compact-label">Schoten</span><span class="stat-compact-val">${shotsAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${sotHome}</span><span class="stat-compact-label">Op doel</span><span class="stat-compact-val">${sotAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${cornersHome}</span><span class="stat-compact-label">Corners</span><span class="stat-compact-val">${cornersAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${foulsHome}</span><span class="stat-compact-label">Overtredingen</span><span class="stat-compact-val">${foulsAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${cardsYellowHome} / ${cardsRedHome}</span><span class="stat-compact-label">Geel / Rood</span><span class="stat-compact-val">${cardsYellowAway} / ${cardsRedAway}</span></div>
                    </div>

                    ${match.manOfTheMatch ? `
                        <div class="match-result-motm">
                            <span class="match-result-motm-star">⭐</span>
                            <div class="match-result-motm-info">
                                <span class="match-result-motm-label">Man of the Match</span>
                                <span class="match-result-motm-name">${match.manOfTheMatch.name}</span>
                                ${match.manOfTheMatch.rating ? `<span class="match-result-motm-rating">${match.manOfTheMatch.rating.toFixed(1)}</span>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${comments ? `
                        <div class="chairman-comments">
                            <div class="chairman-comment positive">${comments.positive}</div>
                            <div class="chairman-comment negative">${comments.negative}</div>
                        </div>
                    ` : ''}

                    ${match.newFans !== undefined ? `
                        <div class="fans-change ${match.newFans >= 0 ? 'fans-positive' : 'fans-negative'}">
                            ${match.newFans >= 0 ? `🎉 +${match.newFans} nieuwe fans!` : `😔 ${match.newFans} fans verloren`} (Totaal: ${gameState.club.fans} fans)
                        </div>
                    ` : ''}

                </div>

                <div class="report-col-right">
                    <h3 class="report-section-title">Spelercijfers</h3>
                    ${ratingsHtml}
                </div>
            </div>
        </div>
    `;
}

function renderPlayerRatingsTab() {
    const container = document.getElementById('matches-waardering');
    if (!container) return;

    const history = (gameState.matchHistory || []).filter(h => h.season === gameState.season && h.playerRatings && h.playerRatings.length > 0);
    const recentMatches = history.slice(-5);

    if (recentMatches.length === 0) {
        container.innerHTML = `
            <div class="match-report-empty">
                <div class="match-report-empty-icon">📊</div>
                <p>Nog geen beoordelingen</p>
                <p class="match-report-empty-sub">Speel wedstrijden om spelersbeoordelingen te zien.</p>
            </div>
        `;
        return;
    }

    // Build form overview
    const playerMap = new Map();
    recentMatches.forEach(m => {
        (m.playerRatings || []).forEach(p => {
            if (!playerMap.has(p.id)) {
                playerMap.set(p.id, { name: p.name, position: p.position, ratings: [] });
            }
        });
    });
    recentMatches.forEach((m, idx) => {
        const matchRatings = new Map((m.playerRatings || []).map(p => [p.id, p.rating]));
        playerMap.forEach((data, id) => {
            data.ratings[idx] = matchRatings.get(id) || null;
        });
    });
    const posOrder = ['keeper', 'linksback', 'centraleVerdediger', 'rechtsback', 'linksMid', 'centraleMid', 'rechtsMid', 'linksbuiten', 'rechtsbuiten', 'spits'];
    const players = [...playerMap.entries()].sort((a, b) => {
        return posOrder.indexOf(a[1].position) - posOrder.indexOf(b[1].position);
    });

    container.innerHTML = `
        <div class="waardering-container">
            <div class="waardering-section">
                <h3>Vormoverzicht — Seizoen ${gameState.season}</h3>
                <table class="form-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Speler</th>
                            ${recentMatches.map(m => `<th>W${m.week}</th>`).join('')}
                            <th>Gem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map(([id, data]) => {
                            const validRatings = data.ratings.filter(r => r !== null && r !== undefined);
                            const avg = validRatings.length > 0 ? validRatings.reduce((s, r) => s + r, 0) / validRatings.length : 0;
                            const avgClass = avg >= 8.0 ? 'good' : avg >= 6.5 ? 'okay' : 'poor';
                            const posAbbr = POSITIONS[data.position]?.abbr || data.position;
                            return `<tr>
                                <td class="form-pos">${posAbbr}</td>
                                <td>${data.name}</td>
                                ${data.ratings.map(r => {
                                    if (r === null || r === undefined) return '<td><span class="form-badge none">-</span></td>';
                                    const cls = r >= 8.0 ? 'good' : r >= 6.5 ? 'okay' : 'poor';
                                    return `<td><span class="form-badge ${cls}">${r.toFixed(1)}</span></td>`;
                                }).join('')}
                                <td><span class="form-badge ${avgClass}">${avg > 0 ? avg.toFixed(1) : '-'}</span></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderMatchProgram() {
    const container = document.getElementById('programma-schedule');
    if (!container || !gameState.standings || gameState.standings.length === 0) {
        if (container) container.innerHTML = '<p>Geen competitieschema beschikbaar.</p>';
        return;
    }

    // Render standings next to program
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];
    const standContainer = document.getElementById('programma-standings');
    if (standContainer) standContainer.innerHTML = renderCompactStandings(divisionNames);

    const schedule = getSeasonSchedule(gameState.standings, gameState.week);
    const playerTeam = gameState.standings.find(t => t.isPlayer)?.name || gameState.club.name;
    const currentWeek = gameState.week;
    const history = gameState.matchHistory || [];
    const currentSeasonHistory = history.filter(h => h.season === gameState.season);

    let html = '';

    schedule.forEach((roundMatches, roundIndex) => {
        const weekNum = roundIndex + 1;
        const isCurrentWeek = weekNum === currentWeek;
        const isPast = weekNum < currentWeek;

        html += `<div class="program-round ${isCurrentWeek ? 'current' : ''}">`;
        html += `<div class="program-round-header">Week ${weekNum}${isCurrentWeek ? ' <span class="program-current-badge">Nu</span>' : ''}</div>`;

        roundMatches.forEach(match => {
            const isPlayerMatch = match.home === playerTeam || match.away === playerTeam;
            const historyEntry = isPlayerMatch ? currentSeasonHistory.find(h => h.week === weekNum) : null;

            let scoreHtml = '';
            if (historyEntry) {
                const homeScore = match.home === playerTeam ? historyEntry.playerScore : historyEntry.opponentScore;
                const awayScore = match.away === playerTeam ? historyEntry.playerScore : historyEntry.opponentScore;
                const resultClass = historyEntry.resultType === 'win' ? 'program-result-win' : historyEntry.resultType === 'loss' ? 'program-result-loss' : 'program-result-draw';
                scoreHtml = `<span class="program-result ${resultClass}">${homeScore} - ${awayScore}</span>`;
            } else if (isPast && !isPlayerMatch) {
                scoreHtml = `<span class="program-result program-result-played">-</span>`;
            } else {
                scoreHtml = `<span class="program-result program-result-tbd">vs</span>`;
            }

            html += `
                <div class="program-match ${isPlayerMatch ? 'player-match' : ''} ${isCurrentWeek ? 'current' : ''}">
                    <span class="program-team home ${match.home === playerTeam ? 'is-player' : ''}">${match.home}</span>
                    ${scoreHtml}
                    <span class="program-team away ${match.away === playerTeam ? 'is-player' : ''}">${match.away}</span>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

// ================================================
// MATCH RESULT MODAL
// ================================================

function showMatchResultModal(result, isHome, opponentName) {
    const modal = document.getElementById('match-result-modal') || createMatchResultModal();

    const playerScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;
    const resultType = getMatchResultType(result.homeScore, result.awayScore, isHome);

    const resultClass = resultType === 'win' ? 'result-win' : resultType === 'loss' ? 'result-loss' : 'result-draw';
    const resultText = resultType === 'win' ? 'Gewonnen!' : resultType === 'loss' ? 'Verloren' : 'Gelijkspel';

    const content = modal.querySelector('.modal-content') || modal;

    const eventIcons = {
        'goal': '⚽',
        'own_goal': '⚽',
        'yellow_card': '🟨',
        'red_card': '🟥',
        'substitution': '🔄',
        'injury': '🤕',
        'shot': '💨',
        'shot_saved': '🧤',
        'save': '🧤',
        'foul': '⚠️',
        'corner': '📐',
        'free_kick': '🎯',
        'penalty': '⚽',
        'penalty_miss': '❌',
        'chance': '💥'
    };

    // Get important events (goals, cards, injuries, substitutions)
    const importantEvents = result.events.filter(e =>
        ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'penalty_miss'].includes(e.type)
    );

    // Stats bars
    const possHome = isHome ? result.possession.home : result.possession.away;
    const possAway = isHome ? result.possession.away : result.possession.home;
    const shotsHome = isHome ? result.shots.home : result.shots.away;
    const shotsAway = isHome ? result.shots.away : result.shots.home;
    const sotHome = isHome ? result.shotsOnTarget.home : result.shotsOnTarget.away;
    const sotAway = isHome ? result.shotsOnTarget.away : result.shotsOnTarget.home;

    content.innerHTML = `
        <div class="match-result-container">
            <div class="match-result-scoreboard ${resultClass}">
                <div class="match-result-team home">
                    <span class="match-result-team-name">${gameState.club.name}</span>
                </div>
                <div class="match-result-score-display">
                    <span class="match-result-score-num">${playerScore}</span>
                    <span class="match-result-score-sep">-</span>
                    <span class="match-result-score-num">${opponentScore}</span>
                </div>
                <div class="match-result-team away">
                    <span class="match-result-team-name">${opponentName}</span>
                </div>
            </div>
            <div class="match-result-verdict">${resultText}</div>

            <div class="match-result-timeline">
                <h3>Wedstrijdverloop</h3>
                <div class="match-result-timeline-track">
                    ${importantEvents.map(event => `
                        <div class="match-result-event ${event.type}">
                            <span class="match-result-event-icon">${eventIcons[event.type] || '📋'}</span>
                            <span class="match-result-event-minute">${event.minute}'</span>
                            <span class="match-result-event-text">${event.commentary || event.description || event.type}</span>
                        </div>
                    `).join('')}
                    ${importantEvents.length === 0 ? '<div class="match-result-event"><span class="match-result-event-text">Geen bijzondere gebeurtenissen</span></div>' : ''}
                </div>
            </div>

            <div class="match-result-stats">
                <h3>Statistieken</h3>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${possHome}%</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Balbezit</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${possHome}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${possAway}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${possAway}%</span>
                </div>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${shotsHome}</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Schoten</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${shotsHome + shotsAway > 0 ? (shotsHome / (shotsHome + shotsAway) * 100) : 50}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${shotsHome + shotsAway > 0 ? (shotsAway / (shotsHome + shotsAway) * 100) : 50}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${shotsAway}</span>
                </div>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${sotHome}</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Op doel</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${sotHome + sotAway > 0 ? (sotHome / (sotHome + sotAway) * 100) : 50}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${sotHome + sotAway > 0 ? (sotAway / (sotHome + sotAway) * 100) : 50}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${sotAway}</span>
                </div>
            </div>

            ${result.manOfTheMatch ? `
                <div class="match-result-motm">
                    <div class="match-result-motm-star">&#11088;</div>
                    <div class="match-result-motm-info">
                        <span class="match-result-motm-label">Man of the Match</span>
                        <span class="match-result-motm-name">${result.manOfTheMatch.name}</span>
                        ${result.manOfTheMatch.rating ? `<span class="match-result-motm-rating">${result.manOfTheMatch.rating.toFixed(1)}</span>` : ''}
                    </div>
                </div>
            ` : ''}

            <button class="btn btn-primary match-result-close-btn" onclick="closeMatchResultModal()">Sluiten</button>
        </div>
    `;

    modal.style.display = 'flex';
}

function createMatchResultModal() {
    const modal = document.createElement('div');
    modal.id = 'match-result-modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content match-result-content"></div>';
    document.body.appendChild(modal);
    return modal;
}

function closeMatchResultModal() {
    const modal = document.getElementById('match-result-modal');
    if (modal) modal.style.display = 'none';
}
window.closeMatchResultModal = closeMatchResultModal;

// ================================================
// DAILY REWARD MODAL
// ================================================

function showDailyRewardModal(rewardResult) {
    const modal = document.getElementById('daily-reward-modal') || createDailyRewardModal();
    const content = modal.querySelector('.modal-content') || modal;

    const streakDots = Array(7).fill(0).map((_, i) => {
        const active = i < rewardResult.streakDay;
        return `<span class="streak-dot ${active ? 'active' : ''}">${active ? '✓' : (i + 1)}</span>`;
    }).join('');

    content.innerHTML = `
        <div class="daily-reward-header">
            <h2>🎁 Dagelijkse Beloning!</h2>
            <p>${rewardResult.reward.description}</p>
        </div>
        <div class="reward-amount">
            <span class="reward-icon">💰</span>
            <span class="reward-value">+${formatCurrency(rewardResult.reward.amount)}</span>
        </div>
        <div class="streak-display">
            <h3>Streak: ${rewardResult.streak} dagen</h3>
            <div class="streak-dots">${streakDots}</div>
            ${rewardResult.streakDay === 7 ? '<p class="streak-complete">🎉 Week voltooid! Extra bonus!</p>' : ''}
        </div>
        <button class="btn btn-primary" onclick="closeDailyRewardModal()">Bedankt!</button>
    `;

    modal.style.display = 'flex';
}

function createDailyRewardModal() {
    const modal = document.createElement('div');
    modal.id = 'daily-reward-modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content daily-reward-content"></div>';
    document.body.appendChild(modal);
    return modal;
}

function closeDailyRewardModal() {
    const modal = document.getElementById('daily-reward-modal');
    if (modal) modal.style.display = 'none';
}
window.closeDailyRewardModal = closeDailyRewardModal;

// ================================================
// OFFLINE PROGRESS MODAL
// ================================================

function showOfflineProgressModal(progress) {
    const modal = document.getElementById('offline-modal') || createOfflineModal();
    const content = modal.querySelector('.modal-content') || modal;

    content.innerHTML = `
        <div class="offline-header">
            <h2>⏰ Welkom Terug!</h2>
            <p>Je was ${progress.hoursAway} uur weg. Dit is er gebeurd:</p>
        </div>
        <div class="offline-progress">
            ${progress.energyRecovered > 0 ? `
                <div class="progress-item">
                    <span class="progress-icon">⚡</span>
                    <span>Spelers hersteld: +${progress.energyRecovered}% energie</span>
                </div>
            ` : ''}
            ${progress.trainingSessions > 0 ? `
                <div class="progress-item">
                    <span class="progress-icon">🏋️</span>
                    <span>${progress.trainingSessions} trainingssessie(s) voltooid</span>
                </div>
            ` : ''}
            ${progress.scoutMissionsCompleted > 0 ? `
                <div class="progress-item">
                    <span class="progress-icon">🔭</span>
                    <span>Scout missie voltooid!</span>
                </div>
            ` : ''}
            ${progress.matchesReady ? `
                <div class="progress-item">
                    <span class="progress-icon">⚽</span>
                    <span>Wedstrijd staat klaar om gespeeld te worden!</span>
                </div>
            ` : ''}
        </div>
        <button class="btn btn-primary" onclick="closeOfflineModal()">Verder spelen</button>
    `;

    modal.style.display = 'flex';
}

function createOfflineModal() {
    const modal = document.createElement('div');
    modal.id = 'offline-modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content offline-content"></div>';
    document.body.appendChild(modal);
    return modal;
}

function closeOfflineModal() {
    const modal = document.getElementById('offline-modal');
    if (modal) modal.style.display = 'none';
}
window.closeOfflineModal = closeOfflineModal;

// ================================================
// ACHIEVEMENT UNLOCKED
// ================================================

// Achievement queue system
let achievementQueue = [];
let achievementModalOpen = false;

function queueAchievements(achievements) {
    achievementQueue.push(...achievements);
    if (!achievementModalOpen) {
        showNextAchievement();
    }
}

function showNextAchievement() {
    if (achievementQueue.length === 0) {
        achievementModalOpen = false;
        return;
    }
    achievementModalOpen = true;
    const achievement = achievementQueue.shift();
    showAchievementModal(achievement);
}

function showAchievementModal(achievement) {
    // Calculate total XP
    const reward = achievement.reward || {};
    const totalXP = (reward.playerXP || 0) + (reward.managerXP || 0) + (reward.xp || 0);

    const overlay = document.createElement('div');
    overlay.className = 'achievement-modal-overlay';
    overlay.innerHTML = `
        <div class="achievement-modal">
            <div class="achievement-modal-icon">${achievement.icon}</div>
            <div class="achievement-modal-label">Prestatie ontgrendeld!</div>
            <div class="achievement-modal-name">${achievement.name}</div>
            <div class="achievement-modal-desc">${achievement.description}</div>
            ${reward.cash ? `<div class="achievement-modal-reward">+${formatCurrency(reward.cash)}</div>` : ''}
            <button class="achievement-modal-claim-btn" onclick="claimAchievement(this)">
                Claim${totalXP > 0 ? ` ${totalXP} XP` : ''}
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Trigger scale-in animation
    requestAnimationFrame(() => overlay.classList.add('show'));
}

function claimAchievement(btn) {
    const overlay = btn.closest('.achievement-modal-overlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.remove();
        showNextAchievement();
    }, 300);
}
window.claimAchievement = claimAchievement;

// ================================================
// MANAGER XP POPUP
// ================================================

function showManagerXPPopup(reasons) {
    // Remove existing popup if present
    const existing = document.querySelector('.manager-xp-popup');
    if (existing) existing.remove();

    const totalXP = reasons.reduce((sum, r) => sum + r.amount, 0);
    const lines = reasons.map(r => `<div class="mxp-line"><span class="mxp-reason">${r.reason}</span><span class="mxp-amount">+${r.amount} XP</span></div>`).join('');

    const popup = document.createElement('div');
    popup.className = 'manager-xp-popup';
    popup.innerHTML = `
        <div class="mxp-header">Manager XP +${totalXP}</div>
        ${lines}
    `;

    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('show'));

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 400);
    }, 5000);
}

// ================================================
// SEASON END MODAL
// ================================================

function showSeasonEndModal(result) {
    const modal = document.getElementById('season-end-modal') || createSeasonEndModal();
    const content = modal.querySelector('.modal-content') || modal;

    const statusText = result.promoted ? '⬆️ PROMOTIE!' :
                      result.relegated ? '⬇️ DEGRADATIE' :
                      result.isChampion ? '🏆 KAMPIOEN!' : 'Seizoen Afgelopen';

    const statusClass = result.promoted || result.isChampion ? 'status-good' :
                       result.relegated ? 'status-bad' : 'status-neutral';

    const divisionName = getDivision(result.newDivision)?.name || 'Onbekend';

    content.innerHTML = `
        <div class="season-end-header ${statusClass}">
            <h2>${statusText}</h2>
            <p>Seizoen ${gameState.season - 1} is afgelopen</p>
        </div>
        <div class="season-stats">
            <div class="stat-item">
                <span class="stat-value">${result.position}e</span>
                <span class="stat-label">Eindstand</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${result.points}</span>
                <span class="stat-label">Punten</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${result.won}-${result.drawn}-${result.lost}</span>
                <span class="stat-label">W-G-V</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${result.goalsFor}-${result.goalsAgainst}</span>
                <span class="stat-label">Doelsaldo</span>
            </div>
        </div>
        <div class="new-season-info">
            <h3>Nieuw Seizoen</h3>
            <p>Je speelt volgend seizoen in de <strong>${divisionName}</strong></p>
        </div>
        <button class="btn btn-primary" onclick="closeSeasonEndModal()">Start Nieuw Seizoen</button>
    `;

    modal.style.display = 'flex';
}

function createSeasonEndModal() {
    const modal = document.createElement('div');
    modal.id = 'season-end-modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content season-end-content"></div>';
    document.body.appendChild(modal);
    return modal;
}

function closeSeasonEndModal() {
    const modal = document.getElementById('season-end-modal');
    if (modal) modal.style.display = 'none';

    // Re-render everything for new season
    renderStandings();
    renderTopScorers();
    renderPlayerCards();
    updateBudgetDisplays();
    renderDashboardExtras();
}
window.closeSeasonEndModal = closeSeasonEndModal;

// ================================================
// RANDOM EVENT SYSTEM
// ================================================

function checkForRandomEvent() {
    if (!canTriggerEvent(gameState)) return;

    const events = getWeeklyEvents(gameState, 1);
    if (events.length === 0) return;

    const event = events[0];
    gameState.activeEvent = event;
    showEventModal(event);
}

function showEventModal(event) {
    const modal = document.getElementById('event-modal') || createEventModal();
    const content = modal.querySelector('.modal-content') || modal;

    const choicesHtml = event.choices.map((choice, index) => {
        const disabled = choice.condition && !choice.condition(gameState);
        return `
            <button class="btn ${disabled ? 'btn-disabled' : 'btn-secondary'}"
                    ${disabled ? 'disabled' : ''}
                    onclick="handleEventChoice(${index})">
                ${choice.text}
            </button>
        `;
    }).join('');

    content.innerHTML = `
        <div class="event-header">
            <span class="event-icon">${event.icon}</span>
            <h2>${event.title}</h2>
        </div>
        <div class="event-message">
            <p>${event.message}</p>
        </div>
        <div class="event-choices">
            ${choicesHtml}
        </div>
    `;

    modal.style.display = 'flex';
}

function createEventModal() {
    const modal = document.createElement('div');
    modal.id = 'event-modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content event-content"></div>';
    document.body.appendChild(modal);
    return modal;
}

function handleEventChoice(choiceIndex) {
    const event = gameState.activeEvent;
    if (!event) return;

    // Apply choice effect
    applyEventChoice(gameState, event, choiceIndex);

    // Add to history
    addEventToHistory(gameState, event, choiceIndex);

    // Clear active event
    gameState.activeEvent = null;

    // Close modal
    const modal = document.getElementById('event-modal');
    if (modal) modal.style.display = 'none';

    // Show notification
    showNotification('Keuze gemaakt!', 'success');

    // Update displays
    updateBudgetDisplays();
    renderPlayerCards();

    // Check achievements
    const newAchievements = checkAchievements(gameState);
    if (newAchievements.length > 0) {
        queueAchievements(newAchievements);
    }

    // Save
    saveGame(gameState);
}
window.handleEventChoice = handleEventChoice;

// ================================================
// SAVE/LOAD UI
// ================================================

function initSaveLoadButtons() {
    // Manual save button
    const saveBtn = document.getElementById('save-game-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveGame(gameState);
            showNotification('Spel opgeslagen!', 'success');
        });
    }

    // Export save button
    const exportBtn = document.getElementById('export-save-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportSave(gameState);
            showNotification('Save geëxporteerd!', 'success');
        });
    }

    // Import save button
    const importBtn = document.getElementById('import-save-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const newState = await importSave(file);
                        replaceGameState(newState);
                        showNotification('Save geïmporteerd! Pagina wordt herladen...', 'success');
                        setTimeout(() => location.reload(), 1500);
                    } catch (error) {
                        showNotification('Fout bij importeren: ' + error.message, 'error');
                    }
                }
            };
            input.click();
        });
    }
}

// Keep the old generateStandings for backward compatibility
function generateStandings() {
    return generateNewStandings(gameState.club.name, gameState.club.division);
}

// ================================================
// SPONSORS SYSTEM
// ================================================

const SPONSORS = {
    stable: {
        name: 'Bakkerij De Ouderwetse',
        tagline: 'Al 40 jaar hetzelfde recept',
        description: 'Betrouwbaar als roggebrood. Geen verrassingen, gewoon elke week je geld.',
        matchIncome: 500,
        winBonus: 0,
        icon: '🥖',
        duration: 8
    },
    balanced: {
        name: 'Café Het Gouden Paard',
        tagline: 'Soms is het druk, soms niet',
        description: 'Gezellig kroegje met een gokkast achter. Winnen levert bonusrondes op.',
        matchIncome: 300,
        winBonus: 250,
        icon: '🍺',
        duration: 10
    },
    intimico: {
        name: 'intimico.nl',
        tagline: 'Ontdek Je Sensualiteit',
        description: 'Chique lingerielabel. Betaalt bescheiden, maar bij winst gaat de champagne open.',
        matchIncome: 150,
        winBonus: 750,
        icon: '♥',
        shirtName: 'Intimico ♥',
        duration: 8
    }
};

const STADIUM_SPONSORS = {
    local: {
        name: 'Lokale Supermarkt Plus',
        tagline: 'Vers van bij ons',
        weeklyIncome: 200,
        icon: '🏪'
    },
    dealer: {
        name: 'Autobedrijf Van Dijk',
        tagline: 'Rijden is leven',
        weeklyIncome: 400,
        icon: '🚗'
    },
    brewery: {
        name: 'Brouwerij De Gouden Tap',
        tagline: 'Proost op de overwinning',
        weeklyIncome: 600,
        icon: '🍺'
    }
};

const SPONSOR_POOL = [
    // Bordsponsors (€200-750/week, 4-14 weken contract)
    { id: 'bord_supermarkt', slot: 'bord', name: 'Supermarkt Van Dalen', icon: '🛒', weeklyIncome: 250, minReputation: 5, duration: 6 },
    { id: 'bord_garage', slot: 'bord', name: 'Garage De Versnelling', icon: '🔧', weeklyIncome: 300, minReputation: 10, duration: 8 },
    { id: 'bord_brouwerij', slot: 'bord', name: 'Brouwerij De Gouden Tap', icon: '🍻', weeklyIncome: 400, minReputation: 20, duration: 10 },
    { id: 'bord_bouwmarkt', slot: 'bord', name: 'Bouwmarkt Henk & Zonen', icon: '🏗️', weeklyIncome: 350, minReputation: 15, duration: 8 },
    { id: 'bord_autohandel', slot: 'bord', name: 'Autohandel Kansen', icon: '🚗', weeklyIncome: 500, minReputation: 30, duration: 12 },
    { id: 'bord_verzekering', slot: 'bord', name: 'Verzekeringen Direct', icon: '🛡️', weeklyIncome: 600, minReputation: 40, duration: 14 },
    { id: 'bord_makelaardij', slot: 'bord', name: 'Makelaardij Van Houten', icon: '🏠', weeklyIncome: 750, minReputation: 55, duration: 14 },
    { id: 'bord_fysiotherapie', slot: 'bord', name: 'Fysio Topfit', icon: '💪', weeklyIncome: 200, minReputation: 5, duration: 4 },
    { id: 'bord_accountant', slot: 'bord', name: 'Boekhouder Balans BV', icon: '📊', weeklyIncome: 450, minReputation: 25, duration: 10 },
    { id: 'bord_tuincentrum', slot: 'bord', name: 'Tuincentrum Groen & Groei', icon: '🌿', weeklyIncome: 275, minReputation: 8, duration: 6 },
];

const SCOUTING_NETWORKS = {
    none: {
        name: 'Geen netwerk',
        description: 'Je vindt geen nieuwe jeugdspelers',
        weeklyCost: 0,
        chancePerWeek: 0,
        potentialRange: [0, 0],
        icon: '❌'
    },
    local: {
        name: 'Lokaal netwerk',
        description: 'Scout in je eigen gemeente',
        weeklyCost: 50,
        chancePerWeek: 0.15,
        potentialRange: [25, 40],
        icon: '🏘️'
    },
    regional: {
        name: 'Regionaal netwerk',
        description: 'Scout in de hele regio',
        weeklyCost: 150,
        chancePerWeek: 0.25,
        potentialRange: [35, 50],
        icon: '🗺️'
    },
    national: {
        name: 'Nationaal netwerk',
        description: 'Scout door heel Nederland',
        weeklyCost: 400,
        chancePerWeek: 0.35,
        potentialRange: [45, 65],
        icon: '🇳🇱'
    },
    international: {
        name: 'Internationaal netwerk',
        description: 'Scout over de hele wereld',
        weeklyCost: 800,
        chancePerWeek: 0.45,
        potentialRange: [55, 80],
        icon: '🌍'
    }
};

function selectSponsor(sponsorId) {
    const sponsor = SPONSORS[sponsorId];
    if (!sponsor) return;

    // Block switching during active contract
    if (gameState.sponsor && gameState.sponsor.weeksRemaining > 0) {
        showNotification(`Je hebt nog een contract met ${gameState.sponsor.name} (${gameState.sponsor.weeksRemaining} weken)!`, 'warning');
        return;
    }

    // Store full sponsor object with contract duration
    gameState.sponsor = {
        id: sponsorId,
        name: sponsor.name,
        matchIncome: sponsor.matchIncome,
        winBonus: sponsor.winBonus,
        weeklyPay: sponsor.matchIncome,
        icon: sponsor.icon,
        weeksRemaining: sponsor.duration
    };

    // Update UI
    updateSponsorKitDisplay();
    renderShirtSponsorGrid();

    showNotification(`${sponsor.name} is nu je shirtsponsor voor ${sponsor.duration} weken!`, 'success');
    renderSponsorOverview();
    saveGame();
}

function updateSponsorKitDisplay() {
    const kitDisplay = document.getElementById('kit-display');
    const sponsorNameEl = document.getElementById('current-sponsor-name');
    const sponsorEarningsEl = document.getElementById('current-sponsor-earnings');
    const shirtLine1 = document.getElementById('shirt-sponsor-line1');
    const shirtLine2 = document.getElementById('shirt-sponsor-line2');

    // Get club colors
    const primaryColor = gameState.club?.colors?.primary || '#1b5e20';
    const secondaryColor = gameState.club?.colors?.secondary || '#f5f0e1';

    // Update CSS variables for kit (shirt + shorts)
    if (kitDisplay) {
        kitDisplay.style.setProperty('--shirt-primary', primaryColor);
        kitDisplay.style.setProperty('--shirt-secondary', secondaryColor);
    }

    if (gameState.sponsor) {
        // Use shirtName from config if available, otherwise sponsor name
        const sponsorConfig = SPONSORS[gameState.sponsor.id];
        const displayName = (sponsorConfig && sponsorConfig.shirtName) || gameState.sponsor.name;

        // Split sponsor name across two lines
        const words = displayName.split(' ');
        let line1 = '';
        let line2 = '';

        // Try to split evenly across two lines
        const midpoint = Math.ceil(words.length / 2);
        line1 = words.slice(0, midpoint).join(' ');
        line2 = words.slice(midpoint).join(' ');

        if (shirtLine1) shirtLine1.textContent = line1.toUpperCase();
        if (shirtLine2) shirtLine2.textContent = line2.toUpperCase();
        if (sponsorNameEl) sponsorNameEl.textContent = gameState.sponsor.name;
        if (sponsorEarningsEl) sponsorEarningsEl.textContent = `€${gameState.sponsor.matchIncome} per wedstrijd`;
    } else {
        if (shirtLine1) shirtLine1.textContent = 'GEEN';
        if (shirtLine2) shirtLine2.textContent = 'SPONSOR';
        if (sponsorNameEl) sponsorNameEl.textContent = 'Geen sponsor';
        if (sponsorEarningsEl) sponsorEarningsEl.textContent = '€0 per wedstrijd';
    }
}

// Alias for backwards compatibility
function updateSponsorShirtDisplay() {
    updateSponsorKitDisplay();
}

function selectStadiumSponsor(sponsorId) {
    gameState.stadiumSponsor = sponsorId;

    // Update UI
    document.querySelectorAll('.sponsor-card[data-stadium-sponsor]').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.stadium-sponsor-select-btn');
        if (btn) btn.textContent = 'Selecteren';
    });

    const selectedCard = document.querySelector(`.sponsor-card[data-stadium-sponsor="${sponsorId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        const btn = selectedCard.querySelector('.stadium-sponsor-select-btn');
        if (btn) btn.textContent = 'Geselecteerd';
    }

    // Update current sponsor display
    const sponsorName = document.getElementById('current-stadium-sponsor-name');
    if (sponsorName) {
        sponsorName.textContent = STADIUM_SPONSORS[sponsorId].name;
    }

    showNotification(`${STADIUM_SPONSORS[sponsorId].name} is nu je stadionsponsor!`, 'success');
}

function expireSponsorContracts() {
    // Shirt sponsor
    if (gameState.sponsor && gameState.sponsor.weeksRemaining != null && gameState.sponsor.weeksRemaining <= 0) {
        showNotification(`Contract met shirtsponsor ${gameState.sponsor.name} is afgelopen.`, 'info');
        gameState.sponsor = null;
        saveGame();
    }
    // Board sponsor
    const bord = gameState.sponsorSlots?.bord;
    if (bord && bord.weeksRemaining != null && bord.weeksRemaining <= 0) {
        showNotification(`Contract met ${bord.name} is afgelopen.`, 'info');
        gameState.sponsorSlots.bord = null;
        saveGame();
    }
}

function tickSponsorContracts() {
    // Shirt sponsor
    if (gameState.sponsor && gameState.sponsor.weeksRemaining != null) {
        gameState.sponsor.weeksRemaining--;
        if (gameState.sponsor.weeksRemaining <= 0) {
            showNotification(`Contract met shirtsponsor ${gameState.sponsor.name} is afgelopen.`, 'info');
            gameState.sponsor = null;
        }
    }
    // Board sponsor
    const bord = gameState.sponsorSlots?.bord;
    if (bord && bord.weeksRemaining != null) {
        bord.weeksRemaining--;
        if (bord.weeksRemaining <= 0) {
            showNotification(`Contract met ${bord.name} is afgelopen.`, 'info');
            gameState.sponsorSlots.bord = null;
        }
    }
}

function renderSponsorsPage() {
    // Ensure defaults for old saves — migrate old mouw/broek away
    if (!gameState.sponsorSlots) gameState.sponsorSlots = { bord: null };
    delete gameState.sponsorSlots.mouw;
    delete gameState.sponsorSlots.broek;
    if (!gameState.sponsorMarket) gameState.sponsorMarket = { offers: [], generatedForWeek: 0 };

    // Expire finished contracts
    expireSponsorContracts();

    renderShirtSponsorGrid();
    renderSponsorMarket();
    renderSponsorOverview();
}

function renderShirtSponsorGrid() {
    const container = document.getElementById('shirt-sponsor-grid');
    if (!container) return;

    const hasContract = gameState.sponsor && gameState.sponsor.weeksRemaining > 0;

    container.innerHTML = Object.entries(SPONSORS).map(([id, s]) => {
        const isActive = gameState.sponsor?.id === id;
        const isLocked = hasContract && !isActive;
        const weeksLeft = isActive && gameState.sponsor.weeksRemaining ? `${gameState.sponsor.weeksRemaining}w` : '';

        return `
        <div class="sponsor-block ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-sponsor="${id}" onclick="selectSponsor('${id}')">
            <div class="sb-icon">${s.icon}</div>
            <div class="sb-info">
                <div class="sb-name">${s.name}</div>
                <div class="sb-tagline">${s.tagline}</div>
                <div class="sb-duration">${s.duration} weken contract</div>
            </div>
            <div class="sb-stats">
                <span class="sb-pay">€${s.matchIncome}/wed</span>
                ${s.winBonus > 0 ? `<span class="sb-bonus">+€${s.winBonus} win</span>` : ''}
                ${weeksLeft ? `<span class="sb-weeks">${weeksLeft}</span>` : ''}
            </div>
        </div>`;
    }).join('');
}

function generateSponsorMarket() {
    const rep = gameState.reputation || 10;
    const activeIds = Object.values(gameState.sponsorSlots || {}).filter(s => s).map(s => s.id);
    const available = SPONSOR_POOL.filter(s => s.minReputation <= rep && !activeIds.includes(s.id));

    // Shuffle and pick 4-6
    const shuffled = available.sort(() => Math.random() - 0.5);
    const count = Math.min(shuffled.length, 4 + Math.floor(Math.random() * 3));
    const offers = shuffled.slice(0, count);

    gameState.sponsorMarket = {
        offers,
        generatedForWeek: gameState.week
    };
}

function renderSponsorMarket() {
    const container = document.getElementById('sponsor-market-grid');
    if (!container) return;

    // Safety check: regenerate if stale
    if (gameState.sponsorMarket.generatedForWeek !== gameState.week || gameState.sponsorMarket.offers.length === 0) {
        generateSponsorMarket();
    }

    const weekBadge = document.getElementById('sponsor-market-week');
    if (weekBadge) weekBadge.textContent = `Week ${gameState.week}`;

    const offers = gameState.sponsorMarket.offers;
    if (offers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">Geen aanbiedingen beschikbaar. Verhoog je reputatie!</p>';
        return;
    }

    container.innerHTML = offers.map(offer => {
        const incomeLabel = offer.slot === 'bord' ? `€${offer.weeklyIncome}/thuiswedstrijd` : `€${offer.weeklyIncome}/wk`;
        return `<div class="sponsor-market-offer" onclick="selectMarketSponsor('${offer.id}')">
            <div class="smo-icon">${offer.icon}</div>
            <div class="smo-name">${offer.name}</div>
            <div class="smo-details">
                <span class="smo-income">${incomeLabel}</span>
                <span class="smo-duration">${offer.duration} weken</span>
            </div>
        </div>`;
    }).join('');
}

function selectMarketSponsor(id) {
    const offer = gameState.sponsorMarket.offers.find(o => o.id === id);
    if (!offer) return;

    // Check if slot already occupied
    if (gameState.sponsorSlots.bord) {
        showNotification('Je hebt al een bordsponsor! Wacht tot het contract afloopt.', 'warning');
        return;
    }

    // Place in bord slot with contract duration
    gameState.sponsorSlots.bord = {
        id: offer.id,
        name: offer.name,
        icon: offer.icon,
        weeklyIncome: offer.weeklyIncome,
        slot: 'bord',
        weeksRemaining: offer.duration || 8,
        startedAtWeek: gameState.week
    };

    // Remove from market
    gameState.sponsorMarket.offers = gameState.sponsorMarket.offers.filter(o => o.id !== id);

    showNotification(`${offer.name} is nu je bordsponsor voor ${offer.duration || 8} weken!`, 'success');
    renderSponsorMarket();
    renderSponsorOverview();
    saveGame();
}

function clearSponsorSlot(slotType) {
    if (!gameState.sponsorSlots[slotType]) return;
    const name = gameState.sponsorSlots[slotType].name;
    gameState.sponsorSlots[slotType] = null;
    showNotification(`${name} verwijderd als ${slotType}sponsor`, 'info');
    renderSponsorOverview();
    saveGame();
}

function renderSponsorOverview() {
    const panel = document.getElementById('sponsor-overview-panel');
    if (!panel) return;

    // Update kit display
    updateSponsorKitDisplay();

    const shirtData = gameState.sponsor ? { name: gameState.sponsor.name, weeklyIncome: gameState.sponsor.weeklyPay, weeksRemaining: gameState.sponsor.weeksRemaining } : null;
    const bordData = gameState.sponsorSlots?.bord || null;

    // Update reclamebord
    const bordIcon = document.getElementById('bord-sponsor-icon');
    const bordName = document.getElementById('bord-sponsor-name');
    if (bordIcon && bordName) {
        if (bordData) {
            bordIcon.textContent = bordData.icon || '';
            bordName.textContent = bordData.name;
        } else {
            bordIcon.textContent = '';
            bordName.textContent = 'Geen sponsor';
        }
    }

    function slotTile(label, data, key) {
        if (data) {
            const weeksInfo = data.weeksRemaining != null ? `<span class="spo-weeks">${data.weeksRemaining}w resterend</span>` : '';
            const incomeLabel = key === 'bord' ? `€${data.weeklyIncome}/thuiswedstrijd` : `€${data.weeklyIncome}/w`;
            return `<div class="spo-tile filled">
                <div class="spo-tile-header">
                    <span class="spo-label">${label}</span>
                </div>
                <span class="spo-name">${data.name}</span>
                <div class="spo-tile-footer">
                    <span class="spo-income">${incomeLabel}</span>
                    ${weeksInfo}
                </div>
            </div>`;
        }
        return `<div class="spo-tile empty">
            <div class="spo-tile-header"><span class="spo-label">${label}</span></div>
            <span class="spo-name">Geen sponsor</span>
            <div class="spo-tile-footer"><span class="spo-income">-</span></div>
        </div>`;
    }

    const shirtWeekly = gameState.sponsor?.weeklyPay || 0;
    const bordWeekly = bordData?.weeklyIncome || 0;
    const totalWeekly = shirtWeekly + bordWeekly;

    const tileShirt = document.getElementById('spo-tile-shirt');
    if (tileShirt) tileShirt.innerHTML = slotTile('👕 Shirtsponsor', shirtData, 'shirt');

    const tileBord = document.getElementById('spo-tile-bord');
    if (tileBord) tileBord.innerHTML = slotTile('📋 Bordsponsor', bordData, 'bord');

    const totalEl = document.getElementById('sponsor-overview-total');
    if (totalEl) {
        totalEl.innerHTML = `<div class="spo-total"><span>Totaal per week</span><span>€${totalWeekly}</span></div>`;
    }
}

window.selectSponsor = selectSponsor;
window.updateSponsorShirtDisplay = updateSponsorShirtDisplay;
window.selectMarketSponsor = selectMarketSponsor;
window.clearSponsorSlot = clearSponsorSlot;

// ================================================
// SCOUTING NETWORK SYSTEM
// ================================================

function renderScoutingNetworkOptions() {
    const container = document.getElementById('scouting-network-options');
    const currentNameEl = document.getElementById('current-network-name');

    if (!container) return;

    // Update current network display
    const currentNetwork = SCOUTING_NETWORKS[gameState.scoutingNetwork];
    if (currentNameEl && currentNetwork) {
        currentNameEl.textContent = currentNetwork.name;
    }

    let html = '';

    for (const [key, network] of Object.entries(SCOUTING_NETWORKS)) {
        const isSelected = gameState.scoutingNetwork === key;
        const costText = key === 'none' ? 'Gratis' : `€${network.weeklyCost}/w`;

        html += `
            <button class="network-chip ${isSelected ? 'active' : ''}" onclick="selectScoutingNetwork('${key}')">
                <span class="nc-icon">${network.icon}</span>
                <span class="nc-name">${network.name.replace(' netwerk', '')}</span>
                <span class="nc-cost">${costText}</span>
            </button>
        `;
    }

    container.innerHTML = html;
}

function selectScoutingNetwork(networkId) {
    const network = SCOUTING_NETWORKS[networkId];
    if (!network) return;

    gameState.scoutingNetwork = networkId;

    // Update UI
    renderScoutingNetworkOptions();

    if (networkId === 'none') {
        showNotification('Jeugdscoutingnetwerk uitgeschakeld', 'info');
    } else {
        showNotification(`${network.name} geactiveerd! Kosten: €${network.weeklyCost}/week`, 'success');
    }
}

window.selectScoutingNetwork = selectScoutingNetwork;

// Activities system removed

// startActivity, renderActivitiesPage, window.startActivity removed

// ================================================
// STAFF CENTER PAGE
// ================================================

const STAFF_MEMBERS = [
    { id: 'st_scout', name: 'Talentscout', icon: '🔭', cost: 500, salary: 150, effect: 'Betere spelers op de transfermarkt' },
    { id: 'st_trainer', name: 'Individuele Trainer', icon: '🎯', cost: 400, salary: 120, effect: '+20% individuele training' },
    { id: 'st_fysio', name: 'Fysiotherapeut', icon: '🏥', cost: 750, salary: 200, effect: 'Sneller blessure herstel', requiresMedical: 1 },
    { id: 'st_jurist', name: 'Jurist', icon: '⚖️', cost: 1000, salary: 250, effect: '-10% transferkosten', requiresDivision: 6 }
];

// Direct hire scout from scout page
window.hireScoutDirect = function() {
    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };
    if (!gameState.hiredStaff.medisch) gameState.hiredStaff.medisch = [];

    if (gameState.hiredStaff.medisch.includes('st_scout')) {
        showNotification('Je hebt al een scout!', 'info');
        return;
    }

    const scoutCost = STAFF_MEMBERS.find(s => s.id === 'st_scout')?.cost || 500;
    if (gameState.club.budget < scoutCost) {
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    gameState.club.budget -= scoutCost;
    gameState.hiredStaff.medisch.push('st_scout');
    updateBudgetDisplays();
    renderScoutPage();
    saveGame();
    showNotification('Scout aangenomen! Je kunt nu scouten.', 'success');
};

function renderStaffPage() {
    const container = document.getElementById('staff-hire-grid');
    if (!container) return;

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };

    // Get medical building level for fysio check
    const medConfig = STADIUM_TILE_CONFIG.medical;
    const medId = gameState.stadium[medConfig.stateKey];
    const medLevel = medConfig.levels.findIndex(l => l.id === medId);

    const division = gameState.club.division;

    let html = '';
    STAFF_MEMBERS.forEach(staff => {
        const isHired = gameState.hiredStaff.medisch?.includes(staff.id) || gameState.hiredStaff.trainers?.includes(staff.id);

        // Check lock conditions
        let lockReason = null;
        if (staff.requiresMedical !== undefined && medLevel < staff.requiresMedical) {
            lockReason = 'Bouw eerst een Fysiogebouw (Medisch Niv. 1)';
        }
        if (staff.requiresDivision !== undefined && division > staff.requiresDivision) {
            lockReason = 'Vrijgespeeld in de 4e Klasse';
        }

        const canAfford = gameState.club.budget >= staff.cost;

        if (isHired) {
            html += `
                <div class="staff-hire-card hired">
                    <div class="shc-icon">${staff.icon}</div>
                    <div class="shc-name">${staff.name}</div>
                    <div class="shc-desc">${staff.effect}</div>
                    <div class="shc-status">✓ In dienst</div>
                    <div class="shc-cost">${formatCurrency(staff.salary)}/week</div>
                </div>
            `;
        } else if (lockReason) {
            html += `
                <div class="staff-hire-card locked">
                    <div class="shc-icon">${staff.icon}</div>
                    <div class="shc-name">${staff.name}</div>
                    <div class="shc-desc">${staff.effect}</div>
                    <div class="shc-lock">🔒 ${lockReason}</div>
                </div>
            `;
        } else {
            html += `
                <div class="staff-hire-card ${!canAfford ? 'cant-afford' : ''}">
                    <div class="shc-icon">${staff.icon}</div>
                    <div class="shc-name">${staff.name}</div>
                    <div class="shc-desc">${staff.effect}</div>
                    <div class="shc-cost-row">
                        <span class="shc-cost">${formatCurrency(staff.cost)} eenmalig</span>
                        <span class="shc-salary">+ ${formatCurrency(staff.salary)}/week</span>
                    </div>
                    <button class="btn btn-sm btn-primary" ${!canAfford ? 'disabled' : ''} onclick="hireStaffMember('${staff.id}', ${staff.cost})">
                        ${canAfford ? 'Aannemen' : 'Te duur'}
                    </button>
                </div>
            `;
        }
    });
    container.innerHTML = html;
}

function renderScoutingContent() {
    const container = document.getElementById('scout-content-wrapper');
    if (!container) return;

    container.innerHTML = `
        <div class="scout-section">
            <h3>🔍 Scout Filters</h3>
            <div class="scout-filters-compact">
                <div class="filter-group-inline">
                    <label>Leeftijd:</label>
                    <input type="number" id="scout-min-age-staff" min="16" max="35" value="${gameState.scoutSearch?.minAge || 16}" class="small-input">
                    <span>-</span>
                    <input type="number" id="scout-max-age-staff" min="16" max="35" value="${gameState.scoutSearch?.maxAge || 35}" class="small-input">
                </div>
                <div class="filter-group-inline">
                    <label>Positie:</label>
                    <select id="scout-position-staff" class="small-select">
                        <option value="all">Alle</option>
                        <option value="keeper">Keeper</option>
                        <option value="defender">Verdediger</option>
                        <option value="midfielder">Middenvelder</option>
                        <option value="attacker">Aanvaller</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="startScoutSearchFromStaff()">Zoeken</button>
            </div>
        </div>
        <div class="scout-results-section">
            <h3>Gevonden Spelers</h3>
            <div class="scout-results-compact" id="scout-results-staff">
                <p class="no-results">Gebruik de zoekfilters om spelers te vinden.</p>
            </div>
        </div>
    `;
}

window.hireStaff = function(category, staffId, cost) {
    // Legacy compatibility — redirect to new system
    window.hireStaffMember(staffId, cost);
};

window.hireStaffMember = function(staffId, cost) {
    if (gameState.club.budget < cost) {
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };
    if (!gameState.hiredStaff.medisch) gameState.hiredStaff.medisch = [];

    if (gameState.hiredStaff.medisch.includes(staffId)) {
        showNotification('Al in dienst!', 'info');
        return;
    }

    // Check lock conditions
    const staff = STAFF_MEMBERS.find(s => s.id === staffId);
    if (staff) {
        if (staff.requiresMedical !== undefined) {
            const medConfig = STADIUM_TILE_CONFIG.medical;
            const medId = gameState.stadium[medConfig.stateKey];
            const medLevel = medConfig.levels.findIndex(l => l.id === medId);
            if (medLevel < staff.requiresMedical) {
                showNotification('Bouw eerst een Fysiogebouw!', 'error');
                return;
            }
        }
        if (staff.requiresDivision !== undefined && gameState.club.division > staff.requiresDivision) {
            showNotification('Nog niet vrijgespeeld!', 'error');
            return;
        }
    }

    gameState.hiredStaff.medisch.push(staffId);
    gameState.club.budget -= cost;
    updateBudgetDisplays();
    renderStaffPage();
    saveGame();

    const staffName = staff?.name || 'Stafmedewerker';
    showNotification(`${staffName} aangenomen!`, 'success');
};

window.startScoutSearchFromStaff = function() {
    const minAge = parseInt(document.getElementById('scout-min-age-staff')?.value) || 16;
    const maxAge = parseInt(document.getElementById('scout-max-age-staff')?.value) || 35;
    const position = document.getElementById('scout-position-staff')?.value || 'all';

    gameState.scoutSearch = { minAge, maxAge, position, results: [] };

    // Generate some scout results
    const results = [];
    for (let i = 0; i < 5; i++) {
        const player = generatePlayer(
            position === 'all' ? null : position,
            minAge + Math.floor(Math.random() * (maxAge - minAge)),
            gameState.club.division
        );
        player.price = Math.floor(player.overall * 100 + Math.random() * 5000);
        results.push(player);
    }
    gameState.scoutSearch.results = results;
    renderScoutResults();
};

// Old staff center function - kept for compatibility
function renderStaffCenterPage() {
    renderStaffPage();
}

function renderStaffSection(containerId, staffList, category) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!gameState.staffCenter) {
        gameState.staffCenter = { assistantManager: [], medicalStaff: [], scoutStaff: [] };
    }

    const hiredIds = gameState.staffCenter[category] || [];

    let html = '';
    staffList.forEach(staff => {
        const isHired = hiredIds.includes(staff.id);
        const canAfford = gameState.club.budget >= staff.cost;

        html += `
            <div class="staff-card ${isHired ? 'hired' : ''} ${!canAfford && !isHired ? 'locked' : ''}">
                <div class="staff-icon">${staff.icon}</div>
                <div class="staff-info">
                    <h4>${staff.name}</h4>
                    <p class="staff-effect">${staff.effect}</p>
                    ${isHired ? `
                        <span class="staff-salary">💰 ${formatCurrency(staff.weeklySalary)}/week</span>
                        <span class="staff-status hired">✓ In dienst</span>
                    ` : `
                        <span class="staff-cost">Kosten: ${formatCurrency(staff.cost)}</span>
                        <span class="staff-salary">+ ${formatCurrency(staff.weeklySalary)}/week</span>
                        <button class="btn btn-primary btn-sm staff-hire-btn"
                                ${!canAfford ? 'disabled' : ''}
                                onclick="hireStaffMember('${category}', '${staff.id}', ${staff.cost})">
                            ${canAfford ? 'Aannemen' : 'Te duur'}
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.hireStaffMember = function(category, staffId, cost) {
    if (gameState.club.budget < cost) {
        alert('Niet genoeg budget!');
        return;
    }

    if (!gameState.staffCenter) {
        gameState.staffCenter = { assistantManager: [], medicalStaff: [], scoutStaff: [] };
    }

    if (!gameState.staffCenter[category].includes(staffId)) {
        gameState.club.budget -= cost;
        gameState.staffCenter[category].push(staffId);
        updateBudgetDisplays();
        renderStaffCenterPage();
        showNotification('Nieuw staflid aangenomen!', 'success');
    }
};

// ================================================
// SPECIALIST SELECTION SYSTEM
// ================================================

function populateSpecialistSelects() {
    if (!gameState.specialists) {
        gameState.specialists = { cornerTaker: null, penaltyTaker: null, freekickTaker: null, captain: null };
    }

    const inLineup = gameState.lineup.filter(p => p != null);
    const lineupPlayers = (inLineup.length > 0 ? inLineup : gameState.players || [])
        .sort((a, b) => (b.overall || 0) - (a.overall || 0));
    const posAbbr = (pos) => POSITIONS[pos]?.abbr || pos;
    const posColor = (pos) => POSITIONS[pos]?.color || '#666';

    const primary = gameState.club.colors.primary || '#1b5e20';
    const secondary = gameState.club.colors.secondary || '#f5f0e1';

    function renderShirtSvg(name, overall) {
        const lastName = name.includes(' ') ? name.split(' ').pop() : name;
        return `<svg viewBox="0 0 120 140" class="spec-shirt-svg">
            <path d="M30,8 L20,12 L4,28 L14,38 L24,28 L24,130 L96,130 L96,28 L106,38 L116,28 L100,12 L90,8 C85,20 75,26 60,26 C45,26 35,20 30,8Z"
                  fill="${primary}" stroke="${secondary}" stroke-width="2"/>
            <path d="M30,8 C35,20 45,26 60,26 C75,26 85,20 90,8"
                  fill="none" stroke="${secondary}" stroke-width="1.5"/>
            <text x="60" y="72" text-anchor="middle" font-size="36" font-weight="900"
                  fill="${secondary}" font-family="sans-serif">${overall}</text>
            <text x="60" y="104" text-anchor="middle" font-size="${lastName.length > 10 ? 9 : lastName.length > 7 ? 11 : 13}" font-weight="800"
                  fill="${secondary}" font-family="sans-serif" text-transform="uppercase"
                  letter-spacing="1">${lastName.toUpperCase()}</text>
        </svg>`;
    }

    function renderPlayerRow(p, isSelected) {
        const color = posColor(p.position);
        return `
            <div class="spec-player-row ${isSelected ? 'selected' : ''}" data-player-id="${p.id}">
                <span class="spec-player-badge" style="background: ${color}">${p.overall}</span>
                <span class="spec-player-name">${p.name}</span>
                <span class="spec-player-age">${p.age}j</span>
                <span class="spec-player-pos">${posAbbr(p.position)}</span>
            </div>
        `;
    }

    const cards = document.querySelectorAll('.spec-card');
    const dropdownMap = {
        cornerTaker: 'corner-taker',
        penaltyTaker: 'penalty-taker',
        freekickTaker: 'freekick-taker',
        captain: 'captain-select'
    };

    for (const card of cards) {
        const key = card.dataset.role;
        if (!key) continue;

        const dropdownId = dropdownMap[key];
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) continue;

        const emptyEl = card.querySelector('.spec-card-empty');
        const shirtEl = card.querySelector('.spec-card-shirt');
        const selectedEl = dropdown.querySelector('.spec-selected');
        const optionsEl = dropdown.querySelector('.spec-options');
        const selectedId = gameState.specialists[key];
        const selectedPlayer = lineupPlayers.find(p => String(p.id) === String(selectedId));

        // Show shirt or empty state
        if (selectedPlayer) {
            card.classList.add('has-player');
            shirtEl.innerHTML = renderShirtSvg(selectedPlayer.name, selectedPlayer.overall) +
                `<span class="spec-shirt-role">${card.dataset.label}</span>`;
            selectedEl.innerHTML = `<span class="spec-change-text">Wijzig</span><span class="spec-chevron"></span>`;
        } else {
            card.classList.remove('has-player');
            shirtEl.innerHTML = '';
            selectedEl.innerHTML = `<span class="spec-change-text">Selecteer</span><span class="spec-chevron"></span>`;
        }

        // Render options list
        let optionsHtml = `<div class="spec-player-row spec-clear-option" data-player-id="">
            <span class="spec-clear-text">Geen specialist</span>
        </div>`;
        for (const p of lineupPlayers) {
            optionsHtml += renderPlayerRow(p, String(p.id) === String(selectedId));
        }
        optionsEl.innerHTML = optionsHtml;

        // Click on card opens dropdown
        card.onclick = (e) => {
            if (e.target.closest('.spec-options')) return;
            e.stopPropagation();
            document.querySelectorAll('.spec-dropdown.open').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        };

        // Option click handlers
        optionsEl.querySelectorAll('.spec-player-row').forEach(row => {
            row.onclick = (e) => {
                e.stopPropagation();
                const playerId = row.dataset.playerId;
                gameState.specialists[key] = playerId || null;
                dropdown.classList.remove('open');
                saveGame();
                populateSpecialistSelects();
            };
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.spec-dropdown.open').forEach(d => d.classList.remove('open'));
    }, { once: true });
}

// ================================================
// STADIUM TILES SYSTEM
// ================================================

function renderStadiumMap() {
    const container = document.getElementById('stadium-map');
    if (!container) return;

    const capacityEl = document.getElementById('stadium-capacity');
    if (capacityEl) capacityEl.textContent = gameState.stadium.capacity || 200;

    const fansEl = document.getElementById('stadium-fans');
    if (fansEl) fansEl.textContent = gameState.club.fans || 50;

    // ===== LAYOUT =====
    const cx = 310, cy = 165;
    const fieldW = 130, fieldH = 74;

    const tribuneConfig = STADIUM_TILE_CONFIG.tribune;
    const tribuneId = gameState.stadium[tribuneConfig.stateKey];
    const tribuneLevel = Math.max(0, tribuneConfig.levels.findIndex(l => l.id === tribuneId));
    const ringThickness = [0, 14, 22, 32, 42][tribuneLevel];
    const stadW = fieldW + ringThickness * 2;
    const stadH = fieldH + ringThickness * 2;

    const bw = 82, bh = 50;

    function getLevel(key) {
        const config = STADIUM_TILE_CONFIG[key];
        const id = gameState.stadium[config.stateKey];
        return Math.max(0, config.levels.findIndex(l => l.id === id));
    }

    // Road ring around stadium (scales with tribune size)
    const roadMargin = 22;
    const roadAreaW = Math.max(200, stadW + roadMargin * 2);
    const roadAreaH = Math.max(120, stadH + roadMargin * 2);
    const roadLeft = cx - roadAreaW / 2;
    const roadRight = cx + roadAreaW / 2;
    const roadTop = cy - roadAreaH / 2;
    const roadBottom = cy + roadAreaH / 2;

    // Building positions — kantine+scouting small & near stadium
    const positions = {
        kantine:  { x: roadLeft + 30, y: roadTop - 30, w: 74, h: 46 },
        scouting: { x: roadRight - 30, y: roadTop - 30, w: 74, h: 46 },
        medical:  { x: roadLeft - 45, y: cy },
        perszaal: { x: roadRight + 45, y: cy },
    };

    // Training & Academy field positions (below stadium)
    const trainW = 110, trainH = 62;
    const acadW = 90, acadH = 50;
    const trainX = cx - trainW - 8, trainY = 290;
    const acadX = cx + 8, acadY = 290;

    const constructionData = gameState.stadium.construction;

    let svg = `<svg viewBox="0 0 620 400" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Inter', system-ui, sans-serif;">`;

    // ===== DEFS =====
    svg += `<defs>
        <pattern id="grass-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#2d5e2d"/>
            <rect x="0" y="0" width="10" height="20" fill="#2b5a2b"/>
        </pattern>
        <filter id="shadow-sm"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
        <filter id="shadow-md"><feDropShadow dx="2" dy="3" stdDeviation="4" flood-opacity="0.3"/></filter>
        <linearGradient id="road-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6b6b6b"/>
            <stop offset="50%" stop-color="#5a5a5a"/>
            <stop offset="100%" stop-color="#4a4a4a"/>
        </linearGradient>
        <pattern id="construction-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="rgba(255,165,0,0.3)"/>
            <rect x="4" width="4" height="8" fill="rgba(0,0,0,0.15)"/>
        </pattern>
    </defs>`;

    // Helper: render construction overlay on a building area
    function renderConstructionOverlay(x, y, w, h, rx) {
        let overlay = '';
        overlay += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#construction-stripes)" rx="${rx || 8}" class="construction-stripes-anim"/>`;
        overlay += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255,165,0,0.08)" rx="${rx || 8}"/>`;
        // Crane icon
        const iconX = x + w/2, iconY = y + h/2 - 6;
        overlay += `<text x="${iconX}" y="${iconY}" text-anchor="middle" font-size="14" fill="rgba(255,165,0,0.9)">🏗️</text>`;
        // Timer badge
        overlay += `<rect x="${x + w/2 - 22}" y="${y + h/2 + 2}" width="44" height="14" fill="rgba(0,0,0,0.7)" rx="7"/>`;
        overlay += `<text id="construction-timer-map" x="${x + w/2}" y="${y + h/2 + 12}" text-anchor="middle" fill="#ffa500" font-size="8" font-weight="bold">--:--</text>`;
        return overlay;
    }

    // ===== BACKGROUND =====
    svg += `<rect width="620" height="400" fill="url(#grass-pattern)" rx="12"/>`;
    // Subtle grass texture lines
    for (let i = 0; i < 31; i++) {
        const x = i * 20;
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>`;
    }

    // ===== ROADS (ring around stadium + spur to training) =====
    const roadW = 10;
    const roadColor = 'url(#road-grad)';
    const lineColor = 'rgba(255,255,200,0.25)';

    // Top road (extends to edges as main approach)
    svg += `<rect x="30" y="${roadTop - roadW/2}" width="560" height="${roadW}" fill="${roadColor}" rx="5"/>`;
    for (let dx = 35; dx < 585; dx += 18) svg += `<rect x="${dx}" y="${roadTop - 0.5}" width="10" height="1" fill="${lineColor}" rx="0.5"/>`;
    // Bottom road
    svg += `<rect x="${roadLeft}" y="${roadBottom - roadW/2}" width="${roadAreaW}" height="${roadW}" fill="${roadColor}" rx="5"/>`;
    for (let dx = roadLeft + 5; dx < roadRight - 5; dx += 18) svg += `<rect x="${dx}" y="${roadBottom - 0.5}" width="10" height="1" fill="${lineColor}" rx="0.5"/>`;
    // Left road
    svg += `<rect x="${roadLeft - roadW/2}" y="${roadTop}" width="${roadW}" height="${roadAreaH}" fill="${roadColor}" rx="5"/>`;
    for (let dy = roadTop + 8; dy < roadBottom - 5; dy += 18) svg += `<rect x="${roadLeft - 0.5}" y="${dy}" width="1" height="10" fill="${lineColor}" rx="0.5"/>`;
    // Right road
    svg += `<rect x="${roadRight - roadW/2}" y="${roadTop}" width="${roadW}" height="${roadAreaH}" fill="${roadColor}" rx="5"/>`;
    for (let dy = roadTop + 8; dy < roadBottom - 5; dy += 18) svg += `<rect x="${roadRight - 0.5}" y="${dy}" width="1" height="10" fill="${lineColor}" rx="0.5"/>`;
    // Spur to training fields
    svg += `<rect x="${cx - roadW/2}" y="${roadBottom}" width="${roadW}" height="${trainY - roadBottom + trainH/2 + 10}" fill="${roadColor}" rx="5"/>`;
    for (let dy = roadBottom + 8; dy < trainY + trainH/2; dy += 18) svg += `<rect x="${cx - 0.5}" y="${dy}" width="1" height="10" fill="${lineColor}" rx="0.5"/>`;
    // Road circles at corners and junctions
    [[roadLeft, roadTop], [roadRight, roadTop], [roadLeft, roadBottom], [roadRight, roadBottom], [cx, roadBottom]].forEach(([ix, iy]) => {
        svg += `<circle cx="${ix}" cy="${iy}" r="7" fill="#555" stroke="#666" stroke-width="0.5"/>`;
    });

    // ===== STADIUM (tribune) =====
    const tribuneColors = ['#6a4a2a', '#5a5a5a', '#4a4a6a', '#3a3a7a', '#8a6a0a'];
    const tc = tribuneColors[tribuneLevel];
    const levelColors = [['#6b6b6b','#ef5350'],['#1b5e20','#4ade80'],['#1565c0','#42a5f5'],['#6a1b9a','#ce93d8'],['#e65100','#ffd54f']];
    const tColors = levelColors[Math.min(tribuneLevel, levelColors.length - 1)];
    const isStadActive = currentStadiumCategory === 'tribune';

    svg += `<g class="stadium-building${isStadActive ? ' active' : ''}" data-category="tribune" onclick="selectStadiumCategory('tribune')" filter="url(#shadow-md)">`;
    if (tribuneLevel === 0) {
        // Empty — no tribune, just clickable area
        svg += `<rect x="${cx - fieldW/2 - 20}" y="${cy - fieldH/2 - 20}" width="${fieldW + 40}" height="${fieldH + 40}" fill="transparent"/>`;
    } else {
        const ox = cx - stadW/2, oy = cy - stadH/2;
        svg += `<rect x="${ox}" y="${oy}" width="${stadW}" height="${stadH}" fill="${tc}" stroke="${tColors[1]}" stroke-width="2" rx="${Math.min(6, ringThickness)}"/>`;
        svg += `<rect x="${cx - fieldW/2}" y="${cy - fieldH/2}" width="${fieldW}" height="${fieldH}" fill="#2d5e2d" rx="2"/>`;
        const standInset = 3, standThick = ringThickness - 6;
        if (standThick > 4) {
            svg += `<rect x="${cx - fieldW/2}" y="${oy + standInset}" width="${fieldW}" height="${standThick}" fill="${tc}" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" rx="2"/>`;
            svg += `<rect x="${cx - fieldW/2}" y="${cy + fieldH/2 + standInset}" width="${fieldW}" height="${standThick}" fill="${tc}" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" rx="2"/>`;
            svg += `<rect x="${ox + standInset}" y="${cy - fieldH/2}" width="${standThick}" height="${fieldH}" fill="${tc}" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" rx="2"/>`;
            svg += `<rect x="${cx + fieldW/2 + standInset}" y="${cy - fieldH/2}" width="${standThick}" height="${fieldH}" fill="${tc}" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" rx="2"/>`;
        }
        if (tribuneLevel >= 2) [[ox+3,oy+3],[ox+stadW-3,oy+3],[ox+3,oy+stadH-3],[ox+stadW-3,oy+stadH-3]].forEach(([px,py]) => { svg += `<circle cx="${px}" cy="${py}" r="3" fill="${tColors[1]}" opacity="0.4"/>`; });
        if (tribuneLevel >= 3) [[ox,oy],[ox+stadW,oy],[ox,oy+stadH],[ox+stadW,oy+stadH]].forEach(([lx,ly]) => { const dir = lx < cx ? -1 : 1; svg += `<line x1="${lx}" y1="${ly}" x2="${lx+dir*10}" y2="${ly-16}" stroke="#bbb" stroke-width="1.5"/><circle cx="${lx+dir*10}" cy="${ly-18}" r="3" fill="#ffe066"/>`; });
    }
    const labelY = cy - stadH/2 - (tribuneLevel === 0 ? 6 : 8);
    svg += `<text x="${cx - 16}" y="${labelY}" text-anchor="middle" fill="white" font-size="8" font-weight="bold">Stadion</text>`;
    svg += `<rect x="${cx + 8}" y="${labelY - 10}" width="22" height="12" fill="${tColors[1]}" rx="6"/>`;
    svg += `<text x="${cx + 19}" y="${labelY - 1}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${tribuneLevel + 1}</text>`;
    // Construction overlay for tribune
    if (constructionData && constructionData.category === 'tribune') {
        const ox = cx - stadW/2, oy = cy - stadH/2;
        svg += renderConstructionOverlay(ox, oy, stadW, stadH, 6);
    }
    svg += `</g>`;

    // ===== GRASS (field) =====
    const grassLevel = getLevel('grass');
    const grassColorList = ['#3a7a3a','#3a8a3a','#2a9a2a','#1aaa1a'];
    const gc = grassColorList[Math.min(grassLevel, grassColorList.length-1)];
    const gColors = levelColors[Math.min(grassLevel, levelColors.length-1)];
    const isGrassActive = currentStadiumCategory === 'grass';

    svg += `<g class="stadium-building${isGrassActive ? ' active' : ''}" data-category="grass" onclick="selectStadiumCategory('grass')">`;
    svg += `<rect x="${cx-fieldW/2}" y="${cy-fieldH/2}" width="${fieldW}" height="${fieldH}" fill="${gc}" stroke="white" stroke-width="1.5" rx="2"/>`;
    svg += `<rect x="${cx-fieldW/2+3}" y="${cy-fieldH/2+3}" width="${fieldW-6}" height="${fieldH-6}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<line x1="${cx}" y1="${cy-fieldH/2+3}" x2="${cx}" y2="${cy+fieldH/2-3}" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    // Penalty areas (left & right)
    svg += `<rect x="${cx-fieldW/2+3}" y="${cy-18}" width="20" height="36" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<rect x="${cx+fieldW/2-23}" y="${cy-18}" width="20" height="36" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    // Goal area (small box)
    svg += `<rect x="${cx-fieldW/2+3}" y="${cy-10}" width="10" height="20" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<rect x="${cx+fieldW/2-13}" y="${cy-10}" width="10" height="20" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    // Penalty arcs (half circles on the 16m line)
    svg += `<path d="M${cx-fieldW/2+23} ${cy-8} A 10 10 0 0 1 ${cx-fieldW/2+23} ${cy+8}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<path d="M${cx+fieldW/2-23} ${cy-8} A 10 10 0 0 0 ${cx+fieldW/2-23} ${cy+8}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    // Goals (nets)
    svg += `<rect x="${cx-fieldW/2-4}" y="${cy-6}" width="4" height="12" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8" rx="1"/>`;
    svg += `<rect x="${cx+fieldW/2}" y="${cy-6}" width="4" height="12" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8" rx="1"/>`;
    svg += `<text x="${cx - 16}" y="${cy+fieldH/2-5}" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="600" letter-spacing="1">Wedstrijdveld</text>`;
    svg += `<rect x="${cx + 22}" y="${cy+fieldH/2-13}" width="22" height="12" fill="${gColors[1]}" rx="6"/>`;
    svg += `<text x="${cx + 33}" y="${cy+fieldH/2-4}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${grassLevel+1}</text>`;
    // Construction overlay for grass
    if (constructionData && constructionData.category === 'grass') {
        svg += renderConstructionOverlay(cx-fieldW/2, cy-fieldH/2, fieldW, fieldH, 2);
    }
    svg += `</g>`;

    // ===== TRAINING FIELD =====
    function renderField(x, y, w, h, level, key, label, icon, colorSet) {
        const isActive = currentStadiumCategory === key;
        const greens = ['#3a6a3a','#3a7a3a','#2a8a2a','#1a9a1a'];
        const fg = greens[Math.min(level, greens.length-1)];
        const lc = colorSet;
        svg += `<g class="stadium-building${isActive ? ' active' : ''}" data-category="${key}" onclick="selectStadiumCategory('${key}')" filter="url(#shadow-sm)">`;
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fg}" stroke="${lc[1]}" stroke-width="1.5" rx="6"/>`;
        svg += `<rect x="${x+2}" y="${y+2}" width="${w-4}" height="${h-4}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" rx="4"/>`;
        svg += `<line x1="${x+w/2}" y1="${y+2}" x2="${x+w/2}" y2="${y+h-2}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        svg += `<circle cx="${x+w/2}" cy="${y+h/2}" r="7" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        // Penalty areas
        svg += `<rect x="${x+2}" y="${y+h/2-12}" width="14" height="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        svg += `<rect x="${x+w-16}" y="${y+h/2-12}" width="14" height="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        // Penalty arcs
        svg += `<path d="M${x+16} ${y+h/2-6} A 7 7 0 0 1 ${x+16} ${y+h/2+6}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        svg += `<path d="M${x+w-16} ${y+h/2-6} A 7 7 0 0 0 ${x+w-16} ${y+h/2+6}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
        // Goals
        svg += `<rect x="${x-2}" y="${y+h/2-4}" width="4" height="8" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.5" rx="1"/>`;
        svg += `<rect x="${x+w-2}" y="${y+h/2-4}" width="4" height="8" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.5" rx="1"/>`;
        if (level >= 1) {
            for (let c = 0; c < 3; c++) svg += `<circle cx="${x+14+c*12}" cy="${y+h-7}" r="2" fill="orange" opacity="0.4"/>`;
        }
        svg += `<text x="${x+w/2 - 14}" y="${y-6}" text-anchor="middle" fill="${lc[1]}" font-size="8" font-weight="bold">${icon} ${label}</text>`;
        svg += `<rect x="${x+w/2 + 6}" y="${y-16}" width="22" height="12" fill="${lc[1]}" rx="6"/>`;
        svg += `<text x="${x+w/2 + 17}" y="${y-7}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${level+1}</text>`;
        // Construction overlay for training/academy fields
        if (constructionData && constructionData.category === key) {
            svg += renderConstructionOverlay(x, y, w, h, 6);
        }
        svg += `</g>`;
    }

    const trainLevel = getLevel('training');
    const acadLevel = getLevel('academy');
    renderField(trainX, trainY, trainW, trainH, trainLevel, 'training', 'Training', '', levelColors[Math.min(trainLevel, 4)]);

    // Academy: 2 small fields side by side
    const acadSmallW = 52, acadSmallH = 62, acadGap = 8;
    const isAcadActive = currentStadiumCategory === 'academy';
    const acadGreens = ['#3a6a3a','#3a7a3a','#2a8a2a','#1a9a1a'];
    const acFg = acadGreens[Math.min(acadLevel, acadGreens.length-1)];
    const acColors = levelColors[Math.min(acadLevel, 4)];
    svg += `<g class="stadium-building${isAcadActive ? ' active' : ''}" data-category="academy" onclick="selectStadiumCategory('academy')" filter="url(#shadow-sm)">`;
    // Field 1 (goals on short sides = top/bottom, midline horizontal)
    const f1x = acadX, f1y = acadY;
    svg += `<rect x="${f1x}" y="${f1y}" width="${acadSmallW}" height="${acadSmallH}" fill="${acFg}" stroke="${acColors[1]}" stroke-width="1.5" rx="4"/>`;
    svg += `<line x1="${f1x+2}" y1="${f1y+acadSmallH/2}" x2="${f1x+acadSmallW-2}" y2="${f1y+acadSmallH/2}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<circle cx="${f1x+acadSmallW/2}" cy="${f1y+acadSmallH/2}" r="5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Penalty areas field 1
    svg += `<rect x="${f1x+acadSmallW/2-8}" y="${f1y+1}" width="16" height="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<rect x="${f1x+acadSmallW/2-8}" y="${f1y+acadSmallH-11}" width="16" height="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Penalty arcs field 1
    svg += `<path d="M${f1x+acadSmallW/2-5} ${f1y+11} A 5 5 0 0 1 ${f1x+acadSmallW/2+5} ${f1y+11}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<path d="M${f1x+acadSmallW/2-5} ${f1y+acadSmallH-11} A 5 5 0 0 0 ${f1x+acadSmallW/2+5} ${f1y+acadSmallH-11}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Goals field 1
    svg += `<rect x="${f1x+acadSmallW/2-4}" y="${f1y-2}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="0.5"/>`;
    svg += `<rect x="${f1x+acadSmallW/2-4}" y="${f1y+acadSmallH-1}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="0.5"/>`;
    // Field 2 (goals on short sides = top/bottom, midline horizontal)
    const f2x = acadX + acadSmallW + acadGap;
    svg += `<rect x="${f2x}" y="${f1y}" width="${acadSmallW}" height="${acadSmallH}" fill="${acFg}" stroke="${acColors[1]}" stroke-width="1.5" rx="4"/>`;
    svg += `<line x1="${f2x+2}" y1="${f1y+acadSmallH/2}" x2="${f2x+acadSmallW-2}" y2="${f1y+acadSmallH/2}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<circle cx="${f2x+acadSmallW/2}" cy="${f1y+acadSmallH/2}" r="5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Penalty areas field 2
    svg += `<rect x="${f2x+acadSmallW/2-8}" y="${f1y+1}" width="16" height="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<rect x="${f2x+acadSmallW/2-8}" y="${f1y+acadSmallH-11}" width="16" height="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Penalty arcs field 2
    svg += `<path d="M${f2x+acadSmallW/2-5} ${f1y+11} A 5 5 0 0 1 ${f2x+acadSmallW/2+5} ${f1y+11}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<path d="M${f2x+acadSmallW/2-5} ${f1y+acadSmallH-11} A 5 5 0 0 0 ${f2x+acadSmallW/2+5} ${f1y+acadSmallH-11}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    // Goals field 2
    svg += `<rect x="${f2x+acadSmallW/2-4}" y="${f1y-2}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="0.5"/>`;
    svg += `<rect x="${f2x+acadSmallW/2-4}" y="${f1y+acadSmallH-1}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="0.5"/>`;
    // Label + level badge
    const acadCenterX = acadX + acadSmallW + acadGap/2;
    svg += `<text x="${acadCenterX - 10}" y="${f1y-6}" text-anchor="middle" fill="${acColors[1]}" font-size="8" font-weight="bold">Jeugdacademie</text>`;
    svg += `<rect x="${acadCenterX + 30}" y="${f1y-16}" width="22" height="12" fill="${acColors[1]}" rx="6"/>`;
    svg += `<text x="${acadCenterX + 41}" y="${f1y-7}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${acadLevel+1}</text>`;
    // Construction overlay for academy
    if (constructionData && constructionData.category === 'academy') {
        const totalAcadW = acadSmallW * 2 + acadGap;
        svg += renderConstructionOverlay(acadX, acadY, totalAcadW, acadSmallH, 4);
    }
    svg += `</g>`;

    // ===== BUILDINGS (left & right columns) =====
    const buildingMeta = {
        medical:       { icon: '', accent: '#e05050', name: 'Fysio' },
        kantine:       { icon: '', accent: '#d4a044', name: 'Kantine' },
        scouting:      { icon: '', accent: '#60a5fa', name: 'Scouting' },
        perszaal:      { icon: '', accent: '#94a3b8', name: 'Media' },
    };

    const buildingDetails = {
        medical: (bx, by, bw, bh, level) => {
            let d = `<rect x="${bx+bw/2-2}" y="${by+14}" width="4" height="14" fill="#ff4444" rx="1"/>`;
            d += `<rect x="${bx+bw/2-7}" y="${by+19}" width="14" height="4" fill="#ff4444" rx="1"/>`;
            if (level >= 2) d += `<rect x="${bx+6}" y="${by+bh-12}" width="14" height="8" fill="white" rx="2" opacity="0.4"/>`;
            return d;
        },
        kantine: (bx, by, bw, bh, level) => {
            let d = `<rect x="${bx+10}" y="${by+20}" width="${bw-20}" height="5" fill="#d4a044" opacity="0.4" rx="2"/>`;
            d += `<rect x="${bx+bw/2-7}" y="${by+12}" width="5" height="7" fill="rgba(255,200,50,0.4)" rx="1"/>`;
            d += `<rect x="${bx+bw/2+2}" y="${by+12}" width="5" height="7" fill="rgba(255,200,50,0.4)" rx="1"/>`;
            d += `<rect x="${bx+bw/2-7}" y="${by+11}" width="5" height="3" fill="rgba(255,255,255,0.3)" rx="1"/>`;
            d += `<rect x="${bx+bw/2+2}" y="${by+11}" width="5" height="3" fill="rgba(255,255,255,0.3)" rx="1"/>`;
            if (level >= 2) { d += `<circle cx="${bx+14}" cy="${by+33}" r="3.5" fill="#d4a044" opacity="0.2"/>`; d += `<circle cx="${bx+bw-14}" cy="${by+33}" r="3.5" fill="#d4a044" opacity="0.2"/>`; }
            return d;
        },
        scouting: (bx, by, bw, bh, level) => {
            let d = `<circle cx="${bx+bw/2}" cy="${by+20}" r="9" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.45"/>`;
            d += `<circle cx="${bx+bw/2}" cy="${by+20}" r="4.5" fill="none" stroke="#60a5fa" stroke-width="0.7" opacity="0.35"/>`;
            d += `<circle cx="${bx+bw/2}" cy="${by+20}" r="1.5" fill="#60a5fa" opacity="0.5"/>`;
            if (level >= 3) d += `<circle cx="${bx+bw/2}" cy="${by+20}" r="14" fill="none" stroke="#60a5fa" stroke-width="0.5" opacity="0.2"/>`;
            return d;
        },
        perszaal: (bx, by, bw, bh, level) => {
            let d = `<line x1="${bx+bw-16}" y1="${by+3}" x2="${bx+bw-12}" y2="${by-5}" stroke="#94a3b8" stroke-width="1.3"/>`;
            d += `<path d="M${bx+bw-18} ${by-3} Q${bx+bw-12} ${by-9} ${bx+bw-6} ${by-3}" fill="none" stroke="#94a3b8" stroke-width="0.8"/>`;
            d += `<rect x="${bx+10}" y="${by+14}" width="16" height="10" fill="rgba(148,163,184,0.15)" stroke="#94a3b8" stroke-width="0.7" rx="2"/>`;
            d += `<rect x="${bx+12}" y="${by+16}" width="12" height="6" fill="rgba(100,180,255,0.12)" rx="1"/>`;
            if (level >= 2) { d += `<line x1="${bx+bw-16}" y1="${by+17}" x2="${bx+bw-16}" y2="${by+28}" stroke="#94a3b8" stroke-width="1"/>`; d += `<circle cx="${bx+bw-16}" cy="${by+15}" r="2.5" fill="#94a3b8" opacity="0.35"/>`; }
            return d;
        }
    };

    Object.entries(positions).forEach(([key, pos]) => {
        const level = getLevel(key);
        const isUnbuilt = level === 0;
        const isActive = currentStadiumCategory === key;
        const meta = buildingMeta[key];
        const cbw = pos.w || bw, cbh = pos.h || bh;
        const bx = pos.x - cbw/2, by = pos.y - cbh/2;
        const config = STADIUM_TILE_CONFIG[key];

        svg += `<g class="stadium-building${isActive ? ' active' : ''}${isUnbuilt ? ' unbuilt' : ''}" data-category="${key}" onclick="selectStadiumCategory('${key}')" filter="url(#shadow-sm)">`;

        if (isUnbuilt) {
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="${cbh}" fill="#4a3d28" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="5 3" rx="8"/>`;
            svg += `<rect x="${bx+6}" y="${by+6}" width="${cbw-12}" height="${cbh-12}" fill="#3e3420" rx="5"/>`;
            svg += `<circle cx="${bx+15}" cy="${by+15}" r="4" fill="#56472e" opacity="0.5"/>`;
            svg += `<circle cx="${bx+cbw-20}" cy="${by+cbh-18}" r="5" fill="#56472e" opacity="0.4"/>`;
            svg += `<circle cx="${bx+cbw/2+8}" cy="${by+12}" r="3" fill="#56472e" opacity="0.3"/>`;
            svg += `<circle cx="${pos.x}" cy="${pos.y-2}" r="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>`;
            svg += `<text x="${pos.x}" y="${pos.y+3}" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="13" font-weight="300">+</text>`;
            svg += `<text x="${pos.x}" y="${by+cbh-5}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="7" font-weight="600">${meta.name}</text>`;
            svg += `<rect x="${bx+cbw-24}" y="${by+2}" width="24" height="12" fill="#9e9e9e" rx="6"/>`;
            svg += `<text x="${bx+cbw-12}" y="${by+11}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv0</text>`;
        } else {
            const darkBase = { medical:'#3a1a1a', kantine:'#3a2a1a', scouting:'#1a2a3a', perszaal:'#1a1a2a' };
            const roofColor = { medical:'#c03030', kantine:'#a07820', scouting:'#2a5a9a', perszaal:'#475569' };
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="${cbh}" fill="${darkBase[key]}" stroke="${meta.accent}" stroke-width="1.5" rx="8"/>`;
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="7" fill="${roofColor[key]}" rx="8"/>`;
            svg += `<rect x="${bx}" y="${by+5}" width="${cbw}" height="2" fill="${roofColor[key]}"/>`;
            svg += buildingDetails[key](bx, by, cbw, cbh, level);
            svg += `<text x="${pos.x}" y="${by+cbh-5}" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-size="7" font-weight="600">${meta.name}</text>`;
            svg += `<rect x="${bx+cbw-24}" y="${by-2}" width="24" height="12" fill="${meta.accent}" rx="6"/>`;
            svg += `<text x="${bx+cbw-12}" y="${by+7}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${level}</text>`;
        }

        // Construction overlay
        if (constructionData && constructionData.category === key) {
            svg += renderConstructionOverlay(bx, by, cbw, cbh, 8);
        }

        svg += `</g>`;
    });

    // ===== TREES (decoration) =====
    [[22,40],[598,40],[22,370],[598,370],[170,365],[450,365],[25,200],[595,200]].forEach(([tx,ty]) => {
        svg += `<circle cx="${tx}" cy="${ty}" r="8" fill="#1a4a1a" opacity="0.5"/>`;
        svg += `<circle cx="${tx}" cy="${ty-3}" r="6" fill="#2a6a2a" opacity="0.5"/>`;
        svg += `<circle cx="${tx}" cy="${ty-5}" r="4" fill="#3a8a3a" opacity="0.4"/>`;
    });

    // ===== PARKING LINES (near top road) =====
    for (let p = 0; p < 4; p++) {
        svg += `<rect x="${40+p*14}" y="${roadTop+8}" width="10" height="6" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" rx="1"/>`;
        svg += `<rect x="${540+p*14}" y="${roadTop+8}" width="10" height="6" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" rx="1"/>`;
    }

    // ===== VILLAGE HOUSES (dorpshuisjes) =====
    const houses = [
        // Left top houses
        { x: 38, y: 60, w: 18, h: 14, roof: '#8b4513', wall: '#d2b48c' },
        { x: 60, y: 55, w: 14, h: 12, roof: '#a0522d', wall: '#deb887' },
        { x: 42, y: 82, w: 16, h: 13, roof: '#6b3a1a', wall: '#c4a67a' },
        // Right bottom houses
        { x: 550, y: 310, w: 18, h: 14, roof: '#a0522d', wall: '#d2b48c' },
        { x: 572, y: 325, w: 14, h: 11, roof: '#8b4513', wall: '#deb887' },
        { x: 555, y: 345, w: 16, h: 13, roof: '#6b3a1a', wall: '#c4a67a' },
    ];
    houses.forEach(h => {
        // Wall
        svg += `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" fill="${h.wall}" rx="1" opacity="0.7"/>`;
        // Roof (triangle)
        svg += `<polygon points="${h.x-2},${h.y} ${h.x+h.w/2},${h.y-6} ${h.x+h.w+2},${h.y}" fill="${h.roof}" opacity="0.8"/>`;
        // Window
        svg += `<rect x="${h.x+h.w/2-2}" y="${h.y+3}" width="4" height="3" fill="rgba(255,220,100,0.5)" rx="0.5"/>`;
        // Door
        svg += `<rect x="${h.x+h.w/2-1.5}" y="${h.y+h.h-5}" width="3" height="5" fill="${h.roof}" opacity="0.6" rx="0.5"/>`;
    });

    // ===== WINDMILL (molen, rechts boven) =====
    const mx = 580, my = 340;
    // Tower
    svg += `<polygon points="${mx-5},${my} ${mx-3},${my-22} ${mx+3},${my-22} ${mx+5},${my}" fill="#8b7355" opacity="0.8"/>`;
    // Cap/roof
    svg += `<polygon points="${mx-4},${my-22} ${mx},${my-27} ${mx+4},${my-22}" fill="#5a4a3a" opacity="0.8"/>`;
    // Blades (4 wieken)
    svg += `<line x1="${mx}" y1="${my-24}" x2="${mx-14}" y2="${my-36}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-24}" x2="${mx+14}" y2="${my-12}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-24}" x2="${mx+12}" y2="${my-38}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-24}" x2="${mx-12}" y2="${my-10}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.7"/>`;
    // Blade sails
    svg += `<polygon points="${mx},${my-24} ${mx-14},${my-36} ${mx-12},${my-35}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-24} ${mx+14},${my-12} ${mx+12},${my-13}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-24} ${mx+12},${my-38} ${mx+11},${my-36}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-24} ${mx-12},${my-10} ${mx-11},${my-12}" fill="rgba(255,255,255,0.2)"/>`;
    // Center hub
    svg += `<circle cx="${mx}" cy="${my-24}" r="1.5" fill="#5a4a3a" opacity="0.8"/>`;
    // Door
    svg += `<rect x="${mx-2}" y="${my-5}" width="4" height="5" fill="#5a4a3a" opacity="0.6" rx="1"/>`;

    // Subtitle
    svg += `<text x="310" y="393" text-anchor="middle" fill="rgba(255,255,255,0.12)" font-size="8" font-style="italic" letter-spacing="2">Het Dorpsveld</text>`;

    svg += `</svg>`;
    container.innerHTML = svg;

    if (currentStadiumCategory) {
        const activeBuilding = container.querySelector(`[data-category="${currentStadiumCategory}"]`);
        if (activeBuilding) activeBuilding.classList.add('active');
    }
}

const STADIUM_TILE_CONFIG = {
    tribune: {
        description: 'Vergroot de capaciteit om meer supporters te ontvangen en meer wedstrijdinkomsten te genereren.',
        levels: [
            { id: 'tribune_1', name: 'Geen tribune', capacity: 200, cost: 0, effect: '200 toeschouwers' },
            { id: 'tribune_2', name: 'Stenen Tribune', capacity: 500, cost: 5000, effect: '500 toeschouwers' },
            { id: 'tribune_3', name: 'Overdekte Tribune', capacity: 1000, cost: 15000, effect: '1.000 toeschouwers' },
            { id: 'tribune_4', name: 'Moderne Tribune', capacity: 2500, cost: 40000, effect: '2.500 toeschouwers', reqCapacity: 500 },
            { id: 'tribune_5', name: 'Stadion Tribune', capacity: 5000, cost: 100000, effect: '5.000 toeschouwers', reqCapacity: 1000, reqDivision: 6 },
            { id: 'tribune_6', name: 'Hoefijzer Stadion', capacity: 8000, cost: 250000, effect: '8.000 toeschouwers', reqDivision: 5 },
            { id: 'tribune_7', name: 'Gesloten Stadion', capacity: 12000, cost: 500000, effect: '12.000 toeschouwers', reqDivision: 4 },
            { id: 'tribune_8', name: 'Professioneel Stadion', capacity: 18000, cost: 1000000, effect: '18.000 toeschouwers', reqDivision: 3 },
            { id: 'tribune_9', name: 'Groot Stadion', capacity: 28000, cost: 2500000, effect: '28.000 toeschouwers', reqDivision: 2 },
            { id: 'tribune_10', name: 'Arena', capacity: 40000, cost: 6000000, effect: '40.000 toeschouwers', reqDivision: 1 }
        ],
        stateKey: 'tribune'
    },
    grass: {
        description: 'Beter gras geeft je team een thuisvoordeel tijdens wedstrijden.',
        levels: [
            { id: 'grass_0', name: 'Basis Gras', cost: 0, effect: 'Geen bonus' },
            { id: 'grass_1', name: 'Onderhouden Gras', cost: 3000, effect: '+5% thuisvoordeel' },
            { id: 'grass_2', name: 'Professioneel Gras', cost: 8000, effect: '+10% thuisvoordeel', reqCapacity: 500 },
            { id: 'grass_3', name: 'Kunstgras', cost: 20000, effect: '+15% thuisvoordeel', reqCapacity: 1000 },
            { id: 'grass_4', name: 'Hybride Gras', cost: 50000, effect: '+20% thuisvoordeel', reqDivision: 6 },
            { id: 'grass_5', name: 'Verwarmd Veld', cost: 120000, effect: '+25% thuisvoordeel', reqDivision: 5 },
            { id: 'grass_6', name: 'Premium Turf', cost: 250000, effect: '+30% thuisvoordeel', reqDivision: 4 },
            { id: 'grass_7', name: 'Drainage Systeem', cost: 500000, effect: '+35% thuisvoordeel', reqDivision: 3 },
            { id: 'grass_8', name: 'Topgras met Groeilicht', cost: 1000000, effect: '+40% thuisvoordeel', reqDivision: 2 },
            { id: 'grass_9', name: 'Eredivisie Veld', cost: 2500000, effect: '+50% thuisvoordeel', reqDivision: 1 }
        ],
        stateKey: 'grass'
    },
    training: {
        description: 'Beter trainingsfaciliteiten zorgen ervoor dat spelers sneller verbeteren.',
        levels: [
            { id: 'train_1', name: 'Basisveld', cost: 0, effect: '+5% trainingssnelheid' },
            { id: 'train_2', name: 'Trainingsveld', cost: 5000, effect: '+10% trainingssnelheid' },
            { id: 'train_3', name: 'Modern Complex', cost: 15000, effect: '+20% trainingssnelheid', reqCapacity: 500 },
            { id: 'train_4', name: 'Elite Complex', cost: 40000, effect: '+30% trainingssnelheid', reqCapacity: 1000 },
            { id: 'train_5', name: 'Professioneel Complex', cost: 100000, effect: '+40% trainingssnelheid', reqDivision: 6 },
            { id: 'train_6', name: 'Meerdere Velden', cost: 250000, effect: '+50% trainingssnelheid', reqDivision: 5 },
            { id: 'train_7', name: 'Indoor Hal', cost: 500000, effect: '+65% trainingssnelheid', reqDivision: 4 },
            { id: 'train_8', name: 'Wetenschappelijk Lab', cost: 1000000, effect: '+80% trainingssnelheid', reqDivision: 3 },
            { id: 'train_9', name: 'Topsport Centrum', cost: 2000000, effect: '+100% trainingssnelheid', reqDivision: 2 },
            { id: 'train_10', name: 'Wereldklasse Complex', cost: 5000000, effect: '+125% trainingssnelheid', reqDivision: 1 }
        ],
        stateKey: 'training'
    },
    medical: {
        description: 'Betere medische voorzieningen verkorten de hersteltijd van geblesseerde spelers.',
        levels: [
            { id: 'med_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'med_1', name: 'EHBO Kist', cost: 2000, effect: '-10% blessureduur' },
            { id: 'med_2', name: 'Medische Kamer', cost: 4000, effect: '-20% blessureduur' },
            { id: 'med_3', name: 'Fysiotherapie', cost: 12000, effect: '-35% blessureduur', reqCapacity: 500 },
            { id: 'med_4', name: 'Medisch Centrum', cost: 30000, effect: '-50% blessureduur', reqCapacity: 1000 },
            { id: 'med_5', name: 'Sportmedische Kliniek', cost: 75000, effect: '-60% blessureduur', reqDivision: 6 },
            { id: 'med_6', name: 'Revalidatiecentrum', cost: 180000, effect: '-65% blessureduur', reqDivision: 5 },
            { id: 'med_7', name: 'Hydrotherapie', cost: 400000, effect: '-70% blessureduur', reqDivision: 4 },
            { id: 'med_8', name: 'Cryokamer', cost: 800000, effect: '-75% blessureduur', reqDivision: 3 },
            { id: 'med_9', name: 'Medisch Instituut', cost: 2000000, effect: '-85% blessureduur', reqDivision: 2 }
        ],
        stateKey: 'medical'
    },
    academy: {
        description: 'Een betere jeugdopleiding produceert talentvoller spelers.',
        levels: [
            { id: 'acad_1', name: 'Jeugdelftal', cost: 0, effect: 'Max ★ potentieel', maxStars: 1 },
            { id: 'acad_2', name: 'Jeugdopleiding', cost: 6000, effect: 'Max ★⯪ potentieel', maxStars: 1.5 },
            { id: 'acad_3', name: 'Voetbalschool', cost: 18000, effect: 'Max ★★ potentieel', maxStars: 2, reqCapacity: 500 },
            { id: 'acad_4', name: 'Topacademie', cost: 50000, effect: 'Max ★★⯪ potentieel', maxStars: 2.5, reqCapacity: 1000 },
            { id: 'acad_5', name: 'Talentcentrum', cost: 130000, effect: 'Max ★★★ potentieel', maxStars: 3, reqDivision: 6 },
            { id: 'acad_6', name: 'Regionale Academie', cost: 300000, effect: 'Max ★★★⯪ potentieel', maxStars: 3.5, reqDivision: 5 },
            { id: 'acad_7', name: 'Nationale Academie', cost: 600000, effect: 'Max ★★★★ potentieel', maxStars: 4, reqDivision: 4 },
            { id: 'acad_8', name: 'Elite Academie', cost: 1200000, effect: 'Max ★★★★⯪ potentieel', maxStars: 4.5, reqDivision: 3 },
            { id: 'acad_9', name: 'Topinstituut', cost: 2500000, effect: 'Max ★★★★★ potentieel', maxStars: 5, reqDivision: 2 },
            { id: 'acad_10', name: 'Wereldacademie', cost: 5000000, effect: 'Max ★★★★★ potentieel', maxStars: 5, reqDivision: 1 }
        ],
        stateKey: 'academy'
    },
    scouting: {
        description: 'Een groter scoutingnetwerk vindt betere en meer spelers.',
        levels: [
            { id: 'scout_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'scout_1', name: 'Basisnetwerk', cost: 2000, effect: 'Lokaal scouten' },
            { id: 'scout_2', name: 'Regionaal Netwerk', cost: 4000, effect: 'Regionaal scouten' },
            { id: 'scout_3', name: 'Nationaal Netwerk', cost: 12000, effect: 'Nationaal scouten', reqCapacity: 500 },
            { id: 'scout_4', name: 'Internationaal', cost: 35000, effect: 'Internationaal scouten', reqCapacity: 1000 },
            { id: 'scout_5', name: 'Europees Netwerk', cost: 80000, effect: 'Europa + potentieel', reqDivision: 6 },
            { id: 'scout_6', name: 'Wereldwijd Netwerk', cost: 200000, effect: 'Wereld + potentieel', reqDivision: 5 },
            { id: 'scout_7', name: 'Data-Analyse', cost: 450000, effect: 'Data-scouting + stats', reqDivision: 4 },
            { id: 'scout_8', name: 'AI Scouting', cost: 1000000, effect: 'AI-analyse + verborgen parels', reqDivision: 3 },
            { id: 'scout_9', name: 'Globaal Netwerk', cost: 2500000, effect: 'Volledige transparantie', reqDivision: 2 }
        ],
        stateKey: 'scouting'
    },
    youthscouting: {
        description: 'Betere jeugdscouting vindt talentvoller jeugdspelers voor je academie.',
        levels: [
            { id: 'ysct_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'ysct_1', name: 'Lokale Scouts', cost: 2500, effect: 'Basis jeugdtalent' },
            { id: 'ysct_2', name: 'Regionale Scouts', cost: 5000, effect: 'Beter jeugdtalent' },
            { id: 'ysct_3', name: 'Nationale Scouts', cost: 15000, effect: 'Goed jeugdtalent', reqCapacity: 500 },
            { id: 'ysct_4', name: 'Elite Scouts', cost: 40000, effect: 'Top jeugdtalent', reqCapacity: 1000 },
            { id: 'ysct_5', name: 'Europese Scouts', cost: 100000, effect: 'Europees jeugdtalent', reqDivision: 6 },
            { id: 'ysct_6', name: 'Wereldwijde Scouts', cost: 250000, effect: 'Wereldwijd talent', reqDivision: 5 },
            { id: 'ysct_7', name: 'Jeugd Data-Lab', cost: 500000, effect: 'Data-gestuurde selectie', reqDivision: 4 },
            { id: 'ysct_8', name: 'Expertnetwerk', cost: 1000000, effect: 'Expert scouts + wonderkids', reqDivision: 3 },
            { id: 'ysct_9', name: 'Wereldklasse Scouting', cost: 2500000, effect: 'Beste jeugd ter wereld', reqDivision: 2 }
        ],
        stateKey: 'youthscouting'
    },
    kantine: {
        description: 'De kantine genereert extra inkomsten tijdens wedstrijden.',
        levels: [
            { id: 'kantine_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'kantine_1', name: 'Koffiehoek', cost: 1500, effect: '€50 per wedstrijd' },
            { id: 'kantine_2', name: 'Clubkantine', cost: 3000, effect: '€150 per wedstrijd' },
            { id: 'kantine_3', name: 'Restaurant', cost: 10000, effect: '€400 per wedstrijd', reqCapacity: 500 },
            { id: 'kantine_4', name: 'Horeca Complex', cost: 25000, effect: '€800 per wedstrijd', reqCapacity: 1000 },
            { id: 'kantine_5', name: 'Brasserie', cost: 60000, effect: '€1500 per wedstrijd', reqDivision: 6 },
            { id: 'kantine_6', name: 'Grand Cafe', cost: 150000, effect: '€3000 per wedstrijd', reqDivision: 5 },
            { id: 'kantine_7', name: 'Food Court', cost: 350000, effect: '€5000 per wedstrijd', reqDivision: 4 },
            { id: 'kantine_8', name: 'Premium Restaurant', cost: 750000, effect: '€8000 per wedstrijd', reqDivision: 3 },
            { id: 'kantine_9', name: 'VIP Hospitality', cost: 2000000, effect: '€15000 per wedstrijd', reqDivision: 2 }
        ],
        stateKey: 'kantine'
    },
    sponsoring: {
        description: 'Betere sponsorfaciliteiten trekken rijkere sponsors aan.',
        levels: [
            { id: 'sponsor_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'sponsor_1', name: 'Lokale Sponsors', cost: 2500, effect: 'Basis sponsordeals' },
            { id: 'sponsor_2', name: 'Regionale Sponsors', cost: 5000, effect: 'Betere deals' },
            { id: 'sponsor_3', name: 'Grote Sponsors', cost: 15000, effect: 'Premium deals', reqCapacity: 500 },
            { id: 'sponsor_4', name: 'Hoofdsponsors', cost: 40000, effect: 'Top sponsordeals', reqCapacity: 1000 },
            { id: 'sponsor_5', name: 'Bedrijfslounge', cost: 100000, effect: 'Bedrijfssponsoring', reqDivision: 6 },
            { id: 'sponsor_6', name: 'Business Club', cost: 250000, effect: 'Business partnerships', reqDivision: 5 },
            { id: 'sponsor_7', name: 'Corporate Partners', cost: 500000, effect: 'Corporate sponsoring', reqDivision: 4 },
            { id: 'sponsor_8', name: 'Naamrechten', cost: 1500000, effect: 'Stadion naamrechten', reqDivision: 3 },
            { id: 'sponsor_9', name: 'Internationaal Merk', cost: 4000000, effect: 'Internationaal sponsormerk', reqDivision: 2 }
        ],
        stateKey: 'sponsoring'
    },
    perszaal: {
        description: 'Mediafaciliteiten vergroten de reputatie en bekendheid van je club.',
        levels: [
            { id: 'pers_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'pers_1', name: 'Interview Hoek', cost: 2000, effect: '+5% reputatie' },
            { id: 'pers_2', name: 'Perszaal', cost: 4000, effect: '+10% reputatie' },
            { id: 'pers_3', name: 'Mediacentrum', cost: 12000, effect: '+20% reputatie', reqCapacity: 500 },
            { id: 'pers_4', name: 'Perscomplex', cost: 30000, effect: '+35% reputatie', reqCapacity: 1000 },
            { id: 'pers_5', name: 'Broadcast Studio', cost: 75000, effect: '+50% reputatie', reqDivision: 6 },
            { id: 'pers_6', name: 'TV Studio', cost: 180000, effect: '+65% reputatie', reqDivision: 5 },
            { id: 'pers_7', name: 'Digitaal Platform', cost: 400000, effect: '+80% reputatie', reqDivision: 4 },
            { id: 'pers_8', name: 'Streaming Studio', cost: 1000000, effect: '+100% reputatie', reqDivision: 3 },
            { id: 'pers_9', name: 'Mediacomplex', cost: 2500000, effect: '+150% reputatie', reqDivision: 2 }
        ],
        stateKey: 'perszaal'
    }
};

function renderStadiumTiles() {
    const grid = document.getElementById('stadium-tiles-grid');
    if (!grid) return;

    Object.entries(STADIUM_TILE_CONFIG).forEach(([category, config]) => {
        const currentId = gameState.stadium[config.stateKey];
        const currentIndex = config.levels.findIndex(l => l.id === currentId);
        const currentLevel = config.levels[currentIndex] || config.levels[0];
        const nextLevel = config.levels[currentIndex + 1];
        const isMaxed = !nextLevel;
        const progress = ((currentIndex + 1) / config.levels.length) * 100;

        // Update tile elements
        const levelEl = document.getElementById(`tile-${category}-level`);
        const effectEl = document.getElementById(`tile-${category}-effect`);
        const costEl = document.getElementById(`tile-${category}-cost`);
        const progressEl = document.getElementById(`tile-${category}-progress`);
        const tile = grid.querySelector(`[data-category="${category}"]`);

        if (levelEl) levelEl.textContent = currentLevel.name;
        if (effectEl) effectEl.textContent = currentLevel.effect;
        if (costEl) {
            costEl.textContent = isMaxed ? '' : formatCurrency(nextLevel.cost);
            if (isMaxed) costEl.innerHTML = '<span class="tile-max">MAX</span>';
        }
        if (progressEl) progressEl.style.width = `${progress}%`;
        if (tile) {
            tile.classList.toggle('maxed', isMaxed);
        }
    });

    // Update capacity display
    const capacityEl = document.getElementById('stadium-capacity');
    if (capacityEl) {
        capacityEl.textContent = gameState.stadium.capacity || 200;
    }
}

function showStadiumUpgradeModal(category) {
    const config = STADIUM_TILE_CONFIG[category];
    if (!config) return;

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const nextLevel = config.levels[currentIndex + 1];

    if (!nextLevel) {
        showNotification('Dit is al op het hoogste niveau!', 'info');
        return;
    }

    const canAfford = gameState.club.budget >= nextLevel.cost;
    const categoryNames = {
        tribune: 'Tribune', grass: 'Grasveld', training: 'Training',
        medical: 'Medisch', academy: 'Jeugdopleiding', scouting: 'Scouting',
        kantine: 'Kantine', sponsoring: 'Sponsoring', perszaal: 'Perszaal'
    };

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal stadium-upgrade-modal">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h2>Upgrade ${categoryNames[category]}</h2>
            <div class="upgrade-details">
                <div class="upgrade-from">
                    <h4>Huidig</h4>
                    <p class="level-name">${config.levels[currentIndex].name}</p>
                    <p class="level-effect">${config.levels[currentIndex].effect}</p>
                </div>
                <div class="upgrade-arrow">→</div>
                <div class="upgrade-to">
                    <h4>Upgrade naar</h4>
                    <p class="level-name">${nextLevel.name}</p>
                    <p class="level-effect">${nextLevel.effect}</p>
                </div>
            </div>
            <div class="upgrade-cost">
                <span class="cost-label">Kosten:</span>
                <span class="cost-value ${canAfford ? '' : 'cannot-afford'}">${formatCurrency(nextLevel.cost)}</span>
            </div>
            <div class="upgrade-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuleren</button>
                <button class="btn btn-primary" ${canAfford ? '' : 'disabled'} onclick="upgradeStadiumTile('${category}')">
                    ${canAfford ? 'Upgraden' : 'Niet genoeg budget'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function upgradeStadiumTile(category) {
    const config = STADIUM_TILE_CONFIG[category];
    if (!config) return;

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const nextLevel = config.levels[currentIndex + 1];

    if (!nextLevel || gameState.club.budget < nextLevel.cost) {
        showNotification('Upgrade niet mogelijk!', 'error');
        return;
    }

    // Deduct cost and apply upgrade
    gameState.club.budget -= nextLevel.cost;
    gameState.stadium[config.stateKey] = nextLevel.id;

    // Update capacity if tribune
    if (category === 'tribune' && nextLevel.capacity) {
        gameState.stadium.capacity = nextLevel.capacity;
    }

    // Close modal and update UI
    document.querySelector('.modal-overlay')?.remove();
    renderStadiumTiles();
    updateBudgetDisplays();
    showNotification(`${nextLevel.name} gebouwd!`, 'success');
}

window.showStadiumUpgradeModal = showStadiumUpgradeModal;
window.upgradeStadiumTile = upgradeStadiumTile;

// New stadium category selection system
let currentStadiumCategory = 'tribune';

function selectStadiumCategory(category) {
    currentStadiumCategory = category;

    // Update active state on map buildings
    document.querySelectorAll('.stadium-building').forEach(b => {
        b.classList.remove('active');
        if (b.dataset.category === category) {
            b.classList.add('active');
        }
    });

    updateStadiumUpgradePanel(category);
}

function closeStadiumPanel() {
    const panel = document.getElementById('stadium-upgrade-panel');
    const backdrop = document.getElementById('stadium-panel-backdrop');
    if (panel) panel.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    document.querySelectorAll('.stadium-building').forEach(b => b.classList.remove('active'));
    currentStadiumCategory = null;
}

function getDivisionUnlockLabel(reqDivision) {
    const labels = {
        6: 'Vrijgespeeld in de 4e Klasse',
        5: 'Vrijgespeeld in de 3e Klasse',
        4: 'Vrijgespeeld in de 2e Klasse',
        3: 'Vrijgespeeld in de 1e Klasse',
        2: 'Vrijgespeeld in de Tweede Divisie',
        1: 'Vrijgespeeld in de Eerste Divisie'
    };
    return labels[reqDivision] || '';
}

function updateStadiumUpgradePanel(category) {
    const panel = document.getElementById('stadium-upgrade-panel');
    if (!panel) return;

    const config = STADIUM_TILE_CONFIG[category];
    if (!config) return;

    const categoryIcons = {
        tribune: '🏟️', grass: '🌱', training: '💪',
        medical: '🏥', academy: '🎓', scouting: '🔍',
        youthscouting: '👶', kantine: '🍺', sponsoring: '💼', perszaal: '📰'
    };
    const categoryNames = {
        tribune: 'Stadion', grass: 'Wedstrijdveld', training: 'Trainingsveld',
        medical: 'Medisch', academy: 'Jeugdopleiding', scouting: 'Scouting',
        youthscouting: 'Scoutingcentrum', kantine: 'Kantine', sponsoring: 'Sponsoring', perszaal: 'Perszaal'
    };

    if (!gameState.stadium.youthscouting) {
        gameState.stadium.youthscouting = 'ysct_0';
    }

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const currentLevel = config.levels[currentIndex] || config.levels[0];
    const totalLevels = config.levels.length;
    const levelOffset = config.levels[0].id.match(/_0$/) ? 0 : 1;

    const currentCapacity = STADIUM_TILE_CONFIG.tribune.levels.find(
        l => l.id === gameState.stadium.tribune
    )?.capacity || 200;

    const clubDivision = gameState.club.division;

    // Header
    document.getElementById('sup-icon').textContent = categoryIcons[category] || '🏟️';
    document.getElementById('sup-title').textContent = categoryNames[category] || category;
    document.getElementById('sup-level').textContent = `Niveau ${currentIndex + levelOffset} van ${totalLevels}`;
    document.getElementById('sup-description').textContent = config.description || '';

    // Build level cards
    const listEl = document.getElementById('sup-levels-list');
    let cardsHTML = '';

    const construction = gameState.stadium.construction;

    config.levels.forEach((level, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isBuilding = construction && construction.targetId === level.id;
        const isNext = !isBuilding && idx === currentIndex + 1;
        const isDivLocked = level.reqDivision !== undefined && clubDivision > level.reqDivision;
        const hasCapReq = level.reqCapacity && currentCapacity < level.reqCapacity;

        // Skip past levels - don't show them
        if (isPast) return;

        // For academy levels, render stars properly instead of raw text
        const effectHTML = (category === 'academy' && level.maxStars)
            ? `Max ${renderStarsHTML(level.maxStars)} potentieel`
            : level.effect;

        let cardClass = 'sup-level-card';
        let contentHTML = '';

        if (isCurrent) {
            cardClass += ' current';
            contentHTML = `
                <span class="sup-level-num">Niv. ${idx + levelOffset}</span>
                <div class="sup-level-info">
                    <span class="sup-level-name">${level.name}</span>
                    <span class="sup-level-effect">${effectHTML}</span>
                </div>
                <span class="sup-badge current-badge">Huidig</span>`;
        } else if (isBuilding) {
            cardClass += ' building';
            const remaining = construction.completesAt - Date.now();
            const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
            const minutes = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));
            const timeStr = hours > 0 ? `${hours}u ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
            contentHTML = `
                <span class="sup-level-num">Niv. ${idx + levelOffset}</span>
                <div class="sup-level-info">
                    <span class="sup-level-name">${level.name}</span>
                    <span class="sup-level-effect">${effectHTML}</span>
                </div>
                <div class="sup-building-status">
                    <span class="sup-badge building-badge">In aanbouw...</span>
                    <span class="sup-building-timer">${timeStr}</span>
                </div>`;
        } else if (isDivLocked) {
            cardClass += ' division-locked';
            contentHTML = `
                <div class="sup-level-blur">
                    <span class="sup-level-num">Niv. ${idx + levelOffset}</span>
                    <div class="sup-level-info">
                        <span class="sup-level-name">${level.name}</span>
                        <span class="sup-level-effect">${effectHTML}</span>
                    </div>
                    <span class="sup-level-cost">${formatCurrency(level.cost)}</span>
                </div>
                <div class="sup-lock-overlay">
                    <span class="sup-lock-icon">🔒</span>
                    <span class="sup-lock-text">${getDivisionUnlockLabel(level.reqDivision)}</span>
                </div>`;
        } else if (isNext) {
            cardClass += ' next';
            const canAfford = gameState.club.budget >= level.cost;
            const constructionActive = gameState.stadium.construction !== null;
            let btnHTML = '';
            let overlayHTML = '';
            if (constructionActive) {
                overlayHTML = `<span class="sup-construction-notice">🚧 Er wordt al gebouwd</span>`;
            } else if (hasCapReq) {
                btnHTML = `<button class="btn btn-sm btn-upgrade-stadium" disabled>🔒 Stadion te klein</button>`;
            } else if (!canAfford) {
                btnHTML = `<button class="btn btn-sm btn-upgrade-stadium" disabled>💸 Te duur</button>`;
            } else {
                btnHTML = `<button class="btn btn-sm btn-primary btn-upgrade-stadium" onclick="upgradeStadiumCategory()">🔨 Bouwen</button>`;
            }
            contentHTML = `
                ${overlayHTML}
                <span class="sup-level-num">Niv. ${idx + levelOffset}</span>
                <div class="sup-level-info">
                    <span class="sup-level-name">${level.name}</span>
                    <span class="sup-level-effect">${effectHTML}</span>
                </div>
                <div class="sup-level-action">
                    <span class="sup-level-cost">${formatCurrency(level.cost)}</span>
                    ${btnHTML}
                </div>`;
        } else {
            // Future but unlocked (not next, not div-locked)
            cardClass += ' future';
            contentHTML = `
                <span class="sup-level-num">Niv. ${idx + levelOffset}</span>
                <div class="sup-level-info">
                    <span class="sup-level-name">${level.name}</span>
                    <span class="sup-level-effect">${effectHTML}</span>
                </div>
                <span class="sup-level-cost">${formatCurrency(level.cost)}</span>`;
        }

        cardsHTML += `<div class="${cardClass}">${contentHTML}</div>`;
    });

    listEl.innerHTML = cardsHTML;

    panel.style.display = 'flex';
    const backdrop = document.getElementById('stadium-panel-backdrop');
    if (backdrop) backdrop.style.display = 'block';

    // Auto-scroll to current level
    requestAnimationFrame(() => {
        const currentCard = listEl.querySelector('.sup-level-card.current');
        if (currentCard) {
            currentCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    });
}

window.closeStadiumPanel = closeStadiumPanel;

// Generate SVG illustrations for stadium categories
function getStadiumIllustration(category, level) {
    // Using preserveAspectRatio="xMidYMid slice" for edge-to-edge fill
    const illustrations = {
        tribune: [
            // Level 1: Houten Tribune
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="120" width="400" height="60" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="40" fill="#87CEEB"/>
                <rect x="30" y="60" width="340" height="60" fill="#8B4513"/>
                <rect x="40" y="65" width="45" height="50" fill="#A0522D"/><rect x="90" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="140" y="65" width="45" height="50" fill="#A0522D"/><rect x="190" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="240" y="65" width="45" height="50" fill="#A0522D"/><rect x="290" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="340" y="65" width="45" height="50" fill="#A0522D"/>
                <circle cx="62" cy="55" r="8" fill="#ffcc80"/><circle cx="112" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="162" cy="55" r="8" fill="#ffcc80"/><circle cx="212" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="262" cy="55" r="8" fill="#ffcc80"/><circle cx="312" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="362" cy="55" r="8" fill="#ffcc80"/>
            </svg>`,
            // Level 2: Stenen Tribune
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="130" width="400" height="50" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="30" fill="#87CEEB"/>
                <rect x="0" y="40" width="400" height="90" fill="#78909c"/>
                <rect x="5" y="45" width="55" height="35" fill="#90a4ae"/><rect x="65" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="125" y="45" width="55" height="35" fill="#90a4ae"/><rect x="185" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="245" y="45" width="55" height="35" fill="#90a4ae"/><rect x="305" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="365" y="45" width="35" height="35" fill="#90a4ae"/>
                <rect x="5" y="85" width="55" height="35" fill="#b0bec5"/><rect x="65" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="125" y="85" width="55" height="35" fill="#b0bec5"/><rect x="185" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="245" y="85" width="55" height="35" fill="#b0bec5"/><rect x="305" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="365" y="85" width="35" height="35" fill="#b0bec5"/>
                <circle cx="32" cy="38" r="7" fill="#ffcc80"/><circle cx="92" cy="38" r="7" fill="#ffcc80"/><circle cx="152" cy="38" r="7" fill="#ffcc80"/>
                <circle cx="212" cy="38" r="7" fill="#ffcc80"/><circle cx="272" cy="38" r="7" fill="#ffcc80"/><circle cx="332" cy="38" r="7" fill="#ffcc80"/>
            </svg>`,
            // Level 3: Overdekte Tribune
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="140" width="400" height="40" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="20" fill="#87CEEB"/>
                <rect x="0" y="30" width="400" height="110" fill="#607d8b"/>
                <polygon points="0,30 200,5 400,30" fill="#455a64"/>
                <rect x="5" y="38" width="50" height="28" fill="#78909c"/><rect x="60" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="115" y="38" width="50" height="28" fill="#78909c"/><rect x="170" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="230" y="38" width="50" height="28" fill="#78909c"/><rect x="285" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="340" y="38" width="55" height="28" fill="#78909c"/>
                <rect x="5" y="70" width="50" height="28" fill="#90a4ae"/><rect x="60" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="115" y="70" width="50" height="28" fill="#90a4ae"/><rect x="170" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="230" y="70" width="50" height="28" fill="#90a4ae"/><rect x="285" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="340" y="70" width="55" height="28" fill="#90a4ae"/>
                <rect x="5" y="102" width="50" height="28" fill="#b0bec5"/><rect x="60" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="115" y="102" width="50" height="28" fill="#b0bec5"/><rect x="170" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="230" y="102" width="50" height="28" fill="#b0bec5"/><rect x="285" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="340" y="102" width="55" height="28" fill="#b0bec5"/>
            </svg>`,
            // Level 4: Moderne Tribune
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="145" width="400" height="35" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="130" fill="#37474f"/>
                <rect x="0" y="0" width="400" height="18" fill="#263238"/>
                <rect x="5" y="22" width="38" height="22" fill="#1b5e20"/><rect x="48" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="91" y="22" width="38" height="22" fill="#1b5e20"/><rect x="134" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="177" y="22" width="38" height="22" fill="#ff9800"/><rect x="220" y="22" width="38" height="22" fill="#ff9800"/>
                <rect x="263" y="22" width="38" height="22" fill="#1b5e20"/><rect x="306" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="349" y="22" width="50" height="22" fill="#1b5e20"/>
                <rect x="5" y="48" width="38" height="22" fill="#2e7d32"/><rect x="48" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="91" y="48" width="38" height="22" fill="#2e7d32"/><rect x="134" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="177" y="48" width="38" height="22" fill="#2e7d32"/><rect x="220" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="263" y="48" width="38" height="22" fill="#2e7d32"/><rect x="306" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="349" y="48" width="50" height="22" fill="#2e7d32"/>
                <rect x="5" y="74" width="38" height="22" fill="#388e3c"/><rect x="48" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="91" y="74" width="38" height="22" fill="#388e3c"/><rect x="134" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="177" y="74" width="38" height="22" fill="#388e3c"/><rect x="220" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="263" y="74" width="38" height="22" fill="#388e3c"/><rect x="306" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="349" y="74" width="50" height="22" fill="#388e3c"/>
                <rect x="80" y="102" width="240" height="35" fill="#263238"/>
                <text x="200" y="125" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">VIP LOUNGE</text>
            </svg>`,
            // Level 5: Stadion Tribune
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="150" width="400" height="30" fill="#4a7c4e"/>
                <ellipse cx="200" cy="155" rx="200" ry="50" fill="#37474f"/>
                <ellipse cx="200" cy="155" rx="160" ry="38" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="110" fill="#263238"/>
                <rect x="0" y="0" width="400" height="18" fill="#1b5e20"/>
                <rect x="175" y="20" width="50" height="85" fill="#ffeb3b" opacity="0.2"/>
                <text x="200" y="70" text-anchor="middle" fill="#ffeb3b" font-size="28" font-family="sans-serif">★</text>
                <rect x="5" y="22" width="35" height="18" fill="#1b5e20"/><rect x="45" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="85" y="22" width="35" height="18" fill="#1b5e20"/><rect x="125" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="165" y="22" width="35" height="18" fill="#ff9800"/><rect x="245" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="285" y="22" width="35" height="18" fill="#1b5e20"/><rect x="325" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="365" y="22" width="35" height="18" fill="#1b5e20"/>
                <circle cx="20" cy="130" r="5" fill="#fff176"/><circle cx="50" cy="130" r="5" fill="#fff176"/>
                <circle cx="80" cy="130" r="5" fill="#fff176"/><circle cx="110" cy="130" r="5" fill="#fff176"/>
                <circle cx="290" cy="130" r="5" fill="#fff176"/><circle cx="320" cy="130" r="5" fill="#fff176"/>
                <circle cx="350" cy="130" r="5" fill="#fff176"/><circle cx="380" cy="130" r="5" fill="#fff176"/>
            </svg>`,
            // Level 6: Hoefijzer Stadion
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="150" width="400" height="30" fill="#2e7d32"/>
                <rect x="0" y="0" width="400" height="150" fill="#1a237e"/>
                <rect x="0" y="0" width="400" height="12" fill="#0d47a1"/>
                <path d="M0,15 L0,145 Q200,170 400,145 L400,15 Z" fill="#283593"/>
                <rect x="5" y="18" width="28" height="16" fill="#1565c0"/><rect x="38" y="18" width="28" height="16" fill="#1565c0"/>
                <rect x="71" y="18" width="28" height="16" fill="#ff6f00"/><rect x="104" y="18" width="28" height="16" fill="#1565c0"/>
                <rect x="137" y="18" width="28" height="16" fill="#1565c0"/><rect x="170" y="18" width="28" height="16" fill="#ff6f00"/>
                <rect x="203" y="18" width="28" height="16" fill="#ff6f00"/><rect x="236" y="18" width="28" height="16" fill="#1565c0"/>
                <rect x="269" y="18" width="28" height="16" fill="#1565c0"/><rect x="302" y="18" width="28" height="16" fill="#ff6f00"/>
                <rect x="335" y="18" width="28" height="16" fill="#1565c0"/><rect x="368" y="18" width="28" height="16" fill="#1565c0"/>
                <rect x="5" y="40" width="28" height="16" fill="#1e88e5"/><rect x="38" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="71" y="40" width="28" height="16" fill="#1e88e5"/><rect x="104" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="137" y="40" width="28" height="16" fill="#1e88e5"/><rect x="170" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="203" y="40" width="28" height="16" fill="#1e88e5"/><rect x="236" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="269" y="40" width="28" height="16" fill="#1e88e5"/><rect x="302" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="335" y="40" width="28" height="16" fill="#1e88e5"/><rect x="368" y="40" width="28" height="16" fill="#1e88e5"/>
                <rect x="5" y="62" width="28" height="16" fill="#42a5f5"/><rect x="38" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="71" y="62" width="28" height="16" fill="#42a5f5"/><rect x="104" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="137" y="62" width="28" height="16" fill="#42a5f5"/><rect x="170" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="203" y="62" width="28" height="16" fill="#42a5f5"/><rect x="236" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="269" y="62" width="28" height="16" fill="#42a5f5"/><rect x="302" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="335" y="62" width="28" height="16" fill="#42a5f5"/><rect x="368" y="62" width="28" height="16" fill="#42a5f5"/>
                <rect x="130" y="95" width="140" height="50" fill="#0d47a1" rx="4"/>
                <text x="200" y="125" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">BUSINESSCLUB</text>
                <line x1="0" y1="145" x2="140" y2="145" stroke="#ffd700" stroke-width="2"/>
                <line x1="260" y1="145" x2="400" y2="145" stroke="#ffd700" stroke-width="2"/>
            </svg>`,
            // Level 7: Gesloten Stadion
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="155" width="400" height="25" fill="#1b5e20"/>
                <rect x="0" y="0" width="400" height="155" fill="#212121"/>
                <rect x="0" y="0" width="400" height="8" fill="#424242"/>
                <path d="M0,8 Q200,-10 400,8 L400,12 Q200,-6 0,12 Z" fill="#616161"/>
                <rect x="3" y="16" width="24" height="13" fill="#1b5e20"/><rect x="30" y="16" width="24" height="13" fill="#1b5e20"/>
                <rect x="57" y="16" width="24" height="13" fill="#ff6f00"/><rect x="84" y="16" width="24" height="13" fill="#1b5e20"/>
                <rect x="111" y="16" width="24" height="13" fill="#1b5e20"/><rect x="138" y="16" width="24" height="13" fill="#1b5e20"/>
                <rect x="165" y="16" width="24" height="13" fill="#ff6f00"/><rect x="192" y="16" width="24" height="13" fill="#ff6f00"/>
                <rect x="219" y="16" width="24" height="13" fill="#1b5e20"/><rect x="246" y="16" width="24" height="13" fill="#1b5e20"/>
                <rect x="273" y="16" width="24" height="13" fill="#1b5e20"/><rect x="300" y="16" width="24" height="13" fill="#ff6f00"/>
                <rect x="327" y="16" width="24" height="13" fill="#1b5e20"/><rect x="354" y="16" width="24" height="13" fill="#1b5e20"/>
                <rect x="3" y="33" width="24" height="13" fill="#2e7d32"/><rect x="30" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="57" y="33" width="24" height="13" fill="#2e7d32"/><rect x="84" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="111" y="33" width="24" height="13" fill="#2e7d32"/><rect x="138" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="165" y="33" width="24" height="13" fill="#2e7d32"/><rect x="192" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="219" y="33" width="24" height="13" fill="#2e7d32"/><rect x="246" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="273" y="33" width="24" height="13" fill="#2e7d32"/><rect x="300" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="327" y="33" width="24" height="13" fill="#2e7d32"/><rect x="354" y="33" width="24" height="13" fill="#2e7d32"/>
                <rect x="3" y="50" width="24" height="13" fill="#388e3c"/><rect x="30" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="57" y="50" width="24" height="13" fill="#388e3c"/><rect x="84" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="111" y="50" width="24" height="13" fill="#388e3c"/><rect x="138" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="165" y="50" width="24" height="13" fill="#388e3c"/><rect x="192" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="219" y="50" width="24" height="13" fill="#388e3c"/><rect x="246" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="273" y="50" width="24" height="13" fill="#388e3c"/><rect x="300" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="327" y="50" width="24" height="13" fill="#388e3c"/><rect x="354" y="50" width="24" height="13" fill="#388e3c"/>
                <rect x="0" y="68" width="400" height="4" fill="#616161"/>
                <rect x="70" y="80" width="260" height="65" fill="#263238" rx="4"/>
                <text x="200" y="100" text-anchor="middle" fill="#e0e0e0" font-size="10">GESLOTEN STADION</text>
                <rect x="90" y="108" width="220" height="30" fill="#37474f" rx="3"/>
                <text x="200" y="128" text-anchor="middle" fill="#ffd700" font-size="12" font-weight="bold">12.000 PLAATSEN</text>
                <circle cx="10" cy="155" r="4" fill="#fff176"/><circle cx="30" cy="155" r="4" fill="#fff176"/>
                <circle cx="370" cy="155" r="4" fill="#fff176"/><circle cx="390" cy="155" r="4" fill="#fff176"/>
            </svg>`
        ],
        grass: [
            // Level 1: Basis Gras
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="0" y="0" width="400" height="180" fill="#7cb342" stroke="white" stroke-width="3"/>
                <circle cx="200" cy="90" r="35" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="350" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <ellipse cx="100" cy="60" rx="20" ry="10" fill="#6a9c3a"/>
                <ellipse cx="300" cy="120" rx="25" ry="12" fill="#6a9c3a"/>
                <ellipse cx="150" cy="140" rx="30" ry="14" fill="#5d8a32"/>
                <ellipse cx="280" cy="50" rx="18" ry="9" fill="#5d8a32"/>
            </svg>`,
            // Level 2: Onderhouden Gras
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="80" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="160" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="240" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="320" y="0" width="40" height="180" fill="#7cb342"/>
                <circle cx="200" cy="90" r="40" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="345" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,
            // Level 3: Professioneel Gras
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="70" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="140" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="210" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="280" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="350" y="0" width="50" height="180" fill="#66bb6a"/>
                <circle cx="200" cy="90" r="45" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="200" cy="90" r="5" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="4"/>
                <rect x="0" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="335" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="0" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
                <rect x="368" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,
            // Level 4: Kunstgras
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#388e3c"/>
                <defs>
                    <pattern id="turf" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#43a047"/>
                        <rect x="0" y="0" width="10" height="10" fill="#4caf50"/>
                        <rect x="10" y="10" width="10" height="10" fill="#4caf50"/>
                    </pattern>
                </defs>
                <rect x="0" y="0" width="400" height="180" fill="url(#turf)" opacity="0.5"/>
                <circle cx="200" cy="90" r="50" fill="none" stroke="white" stroke-width="5"/>
                <circle cx="200" cy="90" r="6" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="5"/>
                <rect x="0" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="325" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="0" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <rect x="362" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="38" cy="90" r="4" fill="white"/><circle cx="362" cy="90" r="4" fill="white"/>
            </svg>`,
            // Level 5: Hybride Gras
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#2e7d32"/>
                <rect x="0" y="0" width="30" height="180" fill="#388e3c"/><rect x="60" y="0" width="30" height="180" fill="#388e3c"/>
                <rect x="120" y="0" width="30" height="180" fill="#388e3c"/><rect x="180" y="0" width="30" height="180" fill="#388e3c"/>
                <rect x="240" y="0" width="30" height="180" fill="#388e3c"/><rect x="300" y="0" width="30" height="180" fill="#388e3c"/>
                <rect x="360" y="0" width="40" height="180" fill="#388e3c"/>
                <circle cx="200" cy="90" r="55" fill="none" stroke="white" stroke-width="5"/>
                <circle cx="200" cy="90" r="7" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="5"/>
                <rect x="0" y="25" width="80" height="130" fill="none" stroke="white" stroke-width="5"/>
                <rect x="320" y="25" width="80" height="130" fill="none" stroke="white" stroke-width="5"/>
                <rect x="0" y="45" width="42" height="90" fill="none" stroke="white" stroke-width="4"/>
                <rect x="358" y="45" width="42" height="90" fill="none" stroke="white" stroke-width="4"/>
                <rect x="150" y="170" width="100" height="10" fill="#ffa000" rx="2"/>
                <text x="200" y="178" text-anchor="middle" fill="white" font-size="6" font-weight="bold">VERWARMING</text>
                <line x1="20" y1="170" x2="100" y2="170" stroke="#ffa000" stroke-width="1.5" stroke-dasharray="4 2"/>
                <line x1="300" y1="170" x2="380" y2="170" stroke="#ffa000" stroke-width="1.5" stroke-dasharray="4 2"/>
            </svg>`,
            // Level 6: Verwarmd Veld
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1b5e20"/>
                <rect x="0" y="0" width="28" height="180" fill="#2e7d32"/><rect x="56" y="0" width="28" height="180" fill="#2e7d32"/>
                <rect x="112" y="0" width="28" height="180" fill="#2e7d32"/><rect x="168" y="0" width="28" height="180" fill="#2e7d32"/>
                <rect x="224" y="0" width="28" height="180" fill="#2e7d32"/><rect x="280" y="0" width="28" height="180" fill="#2e7d32"/>
                <rect x="336" y="0" width="28" height="180" fill="#2e7d32"/><rect x="364" y="0" width="36" height="180" fill="#2e7d32"/>
                <circle cx="200" cy="90" r="60" fill="none" stroke="white" stroke-width="6"/>
                <circle cx="200" cy="90" r="8" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="6"/>
                <rect x="0" y="20" width="85" height="140" fill="none" stroke="white" stroke-width="6"/>
                <rect x="315" y="20" width="85" height="140" fill="none" stroke="white" stroke-width="6"/>
                <rect x="0" y="40" width="45" height="100" fill="none" stroke="white" stroke-width="5"/>
                <rect x="355" y="40" width="45" height="100" fill="none" stroke="white" stroke-width="5"/>
                <rect x="0" y="0" width="400" height="6" fill="#ffd700" opacity="0.3"/>
                <rect x="0" y="174" width="400" height="6" fill="#ffd700" opacity="0.3"/>
                <circle cx="50" cy="5" r="8" fill="#ffd700" opacity="0.15"/><circle cx="150" cy="5" r="8" fill="#ffd700" opacity="0.15"/>
                <circle cx="250" cy="5" r="8" fill="#ffd700" opacity="0.15"/><circle cx="350" cy="5" r="8" fill="#ffd700" opacity="0.15"/>
            </svg>`
        ],
        training: [
            // Level 1: Basisveld
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="20" y="30" width="160" height="100" fill="#7cb342" stroke="#fff" stroke-width="3" stroke-dasharray="8,4"/>
                <circle cx="320" cy="80" r="45" fill="none" stroke="white" stroke-width="3"/>
                <rect x="250" y="130" width="130" height="50" fill="#5d4037"/>
                <rect x="260" y="138" width="110" height="35" fill="#8d6e63"/>
                <circle cx="100" cy="80" r="12" fill="#fff"/><circle cx="100" cy="80" r="6" fill="#333"/>
                <line x1="200" y1="60" x2="200" y2="100" stroke="#fff" stroke-width="4"/>
                <line x1="175" y1="80" x2="225" y2="80" stroke="#fff" stroke-width="4"/>
            </svg>`,
            // Level 2: Trainingsveld
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#7cb342"/>
                <rect x="0" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="210" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="10" y="130" width="80" height="45" fill="#5d4037"/><rect x="110" y="130" width="80" height="45" fill="#5d4037"/>
                <rect x="210" y="130" width="80" height="45" fill="#5d4037"/><rect x="310" y="130" width="80" height="45" fill="#5d4037"/>
                <circle cx="95" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <circle cx="305" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <rect x="50" y="25" width="10" height="60" fill="#ff9800"/><rect x="130" y="25" width="10" height="60" fill="#ff9800"/>
                <rect x="260" y="25" width="10" height="60" fill="#2196f3"/><rect x="340" y="25" width="10" height="60" fill="#2196f3"/>
            </svg>`,
            // Level 3: Modern Complex
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#558b2f"/>
                <rect x="0" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="0" y="100" width="130" height="80" fill="#455a64"/>
                <rect x="10" y="110" width="50" height="28" fill="#78909c"/><rect x="70" y="110" width="50" height="28" fill="#78909c"/>
                <rect x="10" y="145" width="50" height="28" fill="#78909c"/><rect x="70" y="145" width="50" height="28" fill="#78909c"/>
                <rect x="140" y="100" width="120" height="80" fill="#37474f"/>
                <text x="200" y="148" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">FITNESS</text>
                <rect x="270" y="100" width="130" height="80" fill="#455a64"/>
                <circle cx="335" cy="140" r="28" fill="#29b6f6"/>
            </svg>`,
            // Level 4: Elite Complex
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#33691e"/>
                <rect x="0" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="135" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="270" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="0" y="65" width="200" height="55" fill="#263238"/>
                <text x="100" y="98" text-anchor="middle" fill="#ffd700" font-size="14" font-family="sans-serif" font-weight="bold">⭐ ELITE GYM ⭐</text>
                <rect x="200" y="65" width="200" height="55" fill="#1565c0"/>
                <text x="300" y="98" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">🏊 ZWEMBAD</text>
                <rect x="0" y="125" width="133" height="55" fill="#37474f"/>
                <text x="66" y="158" text-anchor="middle" fill="#4caf50" font-size="11" font-family="sans-serif">ANALYSE LAB</text>
                <rect x="133" y="125" width="134" height="55" fill="#4e342e"/>
                <text x="200" y="158" text-anchor="middle" fill="#ffcc80" font-size="11" font-family="sans-serif">SAUNA</text>
                <rect x="267" y="125" width="133" height="55" fill="#1b5e20"/>
                <text x="333" y="158" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">RECOVERY</text>
            </svg>`,
            // Level 5: Professioneel Complex
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1b5e20"/>
                <rect x="0" y="0" width="130" height="50" fill="#388e3c" stroke="#ffd700" stroke-width="2"/>
                <rect x="135" y="0" width="130" height="50" fill="#388e3c" stroke="#ffd700" stroke-width="2"/>
                <rect x="270" y="0" width="130" height="50" fill="#388e3c" stroke="#ffd700" stroke-width="2"/>
                <rect x="0" y="55" width="195" height="50" fill="#263238" rx="3"/>
                <text x="97" y="85" text-anchor="middle" fill="#4fc3f7" font-size="12" font-weight="bold">INDOOR TRAINING</text>
                <rect x="205" y="55" width="195" height="50" fill="#1565c0" rx="3"/>
                <text x="302" y="85" text-anchor="middle" fill="white" font-size="12" font-weight="bold">TACTIEKRUIMTE</text>
                <rect x="0" y="110" width="100" height="70" fill="#37474f" rx="3"/>
                <text x="50" y="150" text-anchor="middle" fill="#81c784" font-size="10">KRACHTHAL</text>
                <rect x="105" y="110" width="95" height="70" fill="#455a64" rx="3"/>
                <text x="152" y="150" text-anchor="middle" fill="#4fc3f7" font-size="10">IJSBAD</text>
                <rect x="205" y="110" width="95" height="70" fill="#37474f" rx="3"/>
                <text x="252" y="150" text-anchor="middle" fill="#ffcc80" font-size="10">SAUNA</text>
                <rect x="305" y="110" width="95" height="70" fill="#0d47a1" rx="3"/>
                <text x="352" y="150" text-anchor="middle" fill="white" font-size="10">VIDEO LAB</text>
            </svg>`,
            // Level 6: Meerdere Velden
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#0d4710"/>
                <rect x="5" y="5" width="120" height="70" fill="#2e7d32" stroke="#ffd700" stroke-width="2" rx="3"/>
                <rect x="140" y="5" width="120" height="70" fill="#2e7d32" stroke="#ffd700" stroke-width="2" rx="3"/>
                <rect x="275" y="5" width="120" height="70" fill="#2e7d32" stroke="#ffd700" stroke-width="2" rx="3"/>
                <line x1="65" y1="5" x2="65" y2="75" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <line x1="200" y1="5" x2="200" y2="75" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <line x1="335" y1="5" x2="335" y2="75" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <rect x="0" y="85" width="200" height="45" fill="#1a237e" rx="3"/>
                <text x="100" y="112" text-anchor="middle" fill="#ffd700" font-size="13" font-weight="bold">INDOOR HAL</text>
                <rect x="210" y="85" width="190" height="45" fill="#004d40" rx="3"/>
                <text x="305" y="112" text-anchor="middle" fill="#80cbc4" font-size="13" font-weight="bold">HYDROTERAPIE</text>
                <rect x="0" y="140" width="400" height="40" fill="#263238" rx="3"/>
                <text x="200" y="165" text-anchor="middle" fill="white" font-size="12" font-weight="bold">SPORTWETENSCHAPPELIJK CENTRUM</text>
            </svg>`
        ],
        medical: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="130" y="30" width="140" height="100" fill="#fff" stroke="#e53935" stroke-width="4"/>
                <rect x="180" y="45" width="40" height="70" fill="#e53935"/>
                <rect x="145" y="65" width="110" height="40" fill="#e53935"/>
                <rect x="0" y="130" width="120" height="50" fill="#8d6e63"/>
                <rect x="280" y="130" width="120" height="50" fill="#8d6e63"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="50" y="15" width="300" height="140" fill="#fff" stroke="#1976d2" stroke-width="4"/>
                <rect x="70" y="35" width="110" height="50" fill="#bbdefb"/><rect x="220" y="35" width="110" height="50" fill="#bbdefb"/>
                <rect x="120" y="100" width="160" height="45" fill="#90caf9"/>
                <circle cx="200" cy="122" r="16" fill="#e53935"/><rect x="193" y="108" width="14" height="28" fill="#fff"/>
                <rect x="188" y="115" width="24" height="14" fill="#fff"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e1f5fe"/>
                <rect x="0" y="10" width="400" height="145" fill="#fff" stroke="#0288d1" stroke-width="4"/>
                <rect x="15" y="30" width="115" height="60" fill="#b3e5fc"/>
                <rect x="145" y="30" width="115" height="60" fill="#81d4fa"/>
                <rect x="275" y="30" width="110" height="60" fill="#4fc3f7"/>
                <rect x="80" y="105" width="240" height="45" fill="#0288d1"/>
                <text x="200" y="135" text-anchor="middle" fill="white" font-size="14" font-weight="bold">FYSIOTHERAPIE</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="0" width="400" height="180" fill="#fff" stroke="#303f9f" stroke-width="4"/>
                <rect x="10" y="15" width="120" height="70" fill="#c5cae9"/><rect x="140" y="15" width="120" height="70" fill="#9fa8da"/>
                <rect x="270" y="15" width="120" height="70" fill="#7986cb"/>
                <rect x="10" y="95" width="190" height="75" fill="#3f51b5"/>
                <text x="105" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MRI SCANNER</text>
                <rect x="200" y="95" width="190" height="75" fill="#1a237e"/>
                <text x="295" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">OPERATIEKAMER</text>
            </svg>`,
            // Level 5: Sportmedisch Centrum
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0f2f1"/>
                <rect x="0" y="0" width="400" height="180" fill="#fff" stroke="#00695c" stroke-width="5"/>
                <rect x="0" y="0" width="400" height="25" fill="#00695c"/>
                <text x="200" y="18" text-anchor="middle" fill="white" font-size="13" font-weight="bold">SPORTMEDISCH CENTRUM</text>
                <rect x="10" y="35" width="90" height="55" fill="#e0f2f1" rx="3"/>
                <rect x="28" y="48" width="14" height="28" fill="#e53935" rx="2"/>
                <rect x="21" y="55" width="28" height="14" fill="#e53935" rx="2"/>
                <text x="55" y="72" text-anchor="middle" fill="#00695c" font-size="8">EHBO</text>
                <rect x="110" y="35" width="90" height="55" fill="#b2dfdb" rx="3"/>
                <text x="155" y="67" text-anchor="middle" fill="#00695c" font-size="9" font-weight="bold">FYSIO</text>
                <rect x="210" y="35" width="90" height="55" fill="#80cbc4" rx="3"/>
                <text x="255" y="67" text-anchor="middle" fill="#004d40" font-size="9" font-weight="bold">CRYO</text>
                <rect x="310" y="35" width="80" height="55" fill="#4db6ac" rx="3"/>
                <text x="350" y="67" text-anchor="middle" fill="white" font-size="9" font-weight="bold">SCAN</text>
                <rect x="10" y="100" width="185" height="70" fill="#00897b" rx="4"/>
                <text x="102" y="140" text-anchor="middle" fill="white" font-size="14" font-weight="bold">MRI + CT SCAN</text>
                <rect x="205" y="100" width="185" height="70" fill="#004d40" rx="4"/>
                <text x="297" y="140" text-anchor="middle" fill="#80cbc4" font-size="14" font-weight="bold">OPERATIEZAAL</text>
            </svg>`
        ],
        academy: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#c8e6c9"/>
                <rect x="0" y="90" width="400" height="90" fill="#8bc34a"/>
                <circle cx="100" cy="65" r="25" fill="#ffcc80"/><circle cx="200" cy="60" r="22" fill="#ffcc80"/><circle cx="300" cy="65" r="25" fill="#ffcc80"/>
                <rect x="88" y="80" width="24" height="50" fill="#1976d2"/><rect x="188" y="78" width="24" height="52" fill="#388e3c"/><rect x="288" y="80" width="24" height="50" fill="#d32f2f"/>
                <circle cx="200" cy="140" r="20" fill="#fff" stroke="#333" stroke-width="3"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#a5d6a7"/>
                <rect x="0" y="70" width="400" height="110" fill="#66bb6a"/>
                <rect x="20" y="10" width="160" height="60" fill="#5d4037"/>
                <rect x="220" y="10" width="160" height="60" fill="#5d4037"/>
                <circle cx="60" cy="95" r="18" fill="#ffcc80"/><circle cx="130" cy="90" r="16" fill="#ffcc80"/><circle cx="200" cy="95" r="18" fill="#ffcc80"/>
                <circle cx="270" cy="90" r="16" fill="#ffcc80"/><circle cx="340" cy="95" r="18" fill="#ffcc80"/>
                <rect x="50" y="108" width="20" height="35" fill="#1976d2"/><rect x="120" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="190" y="108" width="20" height="35" fill="#1976d2"/><rect x="260" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="330" y="108" width="20" height="35" fill="#1976d2"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="50" width="195" height="130" fill="#4caf50" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="50" width="195" height="130" fill="#388e3c" stroke="#fff" stroke-width="3"/>
                <rect x="100" y="5" width="200" height="45" fill="#5d4037"/>
                <text x="200" y="35" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">VOETBALSCHOOL</text>
                <circle cx="50" cy="100" r="16" fill="#ffcc80"/><circle cx="100" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="150" cy="100" r="16" fill="#ffcc80"/>
                <circle cx="250" cy="100" r="16" fill="#ffcc80"/><circle cx="300" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="350" cy="100" r="16" fill="#ffcc80"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="40" width="400" height="140" fill="#2e7d32" stroke="#ffd700" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="42" fill="#ffd700"/>
                <text x="200" y="28" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">TOPACADEMIE</text>
                <circle cx="50" cy="100" r="20" fill="#ffcc80"/><circle cx="120" cy="95" r="17" fill="#ffcc80"/>
                <circle cx="190" cy="100" r="20" fill="#ffcc80"/><circle cx="260" cy="100" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="95" r="17" fill="#ffcc80"/><circle cx="390" cy="100" r="20" fill="#ffcc80"/>
                <text x="50" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="200" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
            </svg>`,
            // Level 5: Professionele Academie
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1b5e20"/>
                <rect x="0" y="0" width="400" height="30" fill="#ffd700"/>
                <text x="200" y="22" text-anchor="middle" fill="#1b5e20" font-size="16" font-weight="bold">PROFESSIONELE ACADEMIE</text>
                <rect x="5" y="38" width="125" height="55" fill="#388e3c" stroke="white" stroke-width="2" rx="3"/>
                <rect x="138" y="38" width="125" height="55" fill="#388e3c" stroke="white" stroke-width="2" rx="3"/>
                <rect x="271" y="38" width="124" height="55" fill="#388e3c" stroke="white" stroke-width="2" rx="3"/>
                <text x="67" y="62" text-anchor="middle" fill="white" font-size="7">O13</text>
                <text x="200" y="62" text-anchor="middle" fill="white" font-size="7">O15</text>
                <text x="333" y="62" text-anchor="middle" fill="white" font-size="7">O17</text>
                <rect x="5" y="100" width="195" height="35" fill="#263238" rx="3"/>
                <text x="102" y="122" text-anchor="middle" fill="#4fc3f7" font-size="11" font-weight="bold">ANALYSE LAB</text>
                <rect x="210" y="100" width="185" height="35" fill="#0d47a1" rx="3"/>
                <text x="302" y="122" text-anchor="middle" fill="white" font-size="11" font-weight="bold">KLASLOKAAL</text>
                <rect x="5" y="142" width="390" height="32" fill="#004d40" rx="3"/>
                <text x="200" y="163" text-anchor="middle" fill="#ffd700" font-size="12" font-weight="bold">INTERNAATCOMPLEX</text>
            </svg>`
        ],
        scouting: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <circle cx="200" cy="90" r="70" fill="#c8e6c9" stroke="#4caf50" stroke-width="4"/>
                <circle cx="200" cy="90" r="50" fill="#a5d6a7"/>
                <circle cx="200" cy="90" r="30" fill="#81c784"/>
                <circle cx="200" cy="90" r="8" fill="#4caf50"/>
                <circle cx="170" cy="70" r="10" fill="#ffcc80"/><circle cx="230" cy="105" r="8" fill="#ffcc80"/>
                <circle cx="120" cy="100" r="6" fill="#ffcc80"/><circle cx="280" cy="80" r="7" fill="#ffcc80"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <ellipse cx="200" cy="90" rx="190" ry="80" fill="#bbdefb" stroke="#1976d2" stroke-width="3"/>
                <ellipse cx="200" cy="90" rx="130" ry="55" fill="#90caf9"/>
                <ellipse cx="200" cy="90" rx="70" ry="30" fill="#64b5f6"/>
                <circle cx="80" cy="70" r="10" fill="#ffcc80"/><circle cx="200" cy="50" r="8" fill="#ffcc80"/>
                <circle cx="320" cy="80" r="9" fill="#ffcc80"/><circle cx="140" cy="120" r="7" fill="#ffcc80"/>
                <circle cx="260" cy="115" r="8" fill="#ffcc80"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <ellipse cx="200" cy="90" rx="200" ry="85" fill="#ffe0b2" stroke="#ff9800" stroke-width="3"/>
                <path d="M50 90 Q200 20 350 90 Q200 160 50 90" fill="#ffcc80"/>
                <circle cx="60" cy="90" r="8" fill="#d32f2f"/><circle cx="130" cy="55" r="7" fill="#1976d2"/>
                <circle cx="200" cy="40" r="9" fill="#388e3c"/><circle cx="270" cy="60" r="7" fill="#7b1fa2"/>
                <circle cx="340" cy="90" r="8" fill="#ff9800"/><circle cx="270" cy="125" r="7" fill="#00796b"/>
                <circle cx="130" cy="130" r="8" fill="#c2185b"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1a237e"/>
                <circle cx="200" cy="90" r="75" fill="#3f51b5"/>
                <ellipse cx="200" cy="90" rx="100" ry="45" fill="none" stroke="#7986cb" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="140" ry="65" fill="none" stroke="#9fa8da" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="180" ry="80" fill="none" stroke="#c5cae9" stroke-width="2"/>
                <circle cx="50" cy="50" r="5" fill="#ffeb3b"/><circle cx="100" cy="140" r="4" fill="#ffeb3b"/>
                <circle cx="200" cy="25" r="6" fill="#ffeb3b"/><circle cx="300" cy="60" r="5" fill="#ffeb3b"/>
                <circle cx="350" cy="120" r="4" fill="#ffeb3b"/><circle cx="140" cy="35" r="4" fill="#ffeb3b"/>
                <circle cx="260" cy="155" r="5" fill="#ffeb3b"/>
                <rect x="360" y="10" width="35" height="25" fill="#78909c"/>
                <rect x="367" y="0" width="6" height="12" fill="#90a4ae"/><rect x="382" y="0" width="6" height="12" fill="#90a4ae"/>
            </svg>`,
            // Level 5: Wereldwijd Scoutingsnetwerk
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#0d1b2a"/>
                <circle cx="200" cy="90" r="75" fill="#1b2838" stroke="#1e88e5" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="75" ry="30" fill="none" stroke="#1565c0" stroke-width="1"/>
                <ellipse cx="200" cy="90" rx="50" ry="75" fill="none" stroke="#1565c0" stroke-width="1"/>
                <ellipse cx="200" cy="90" rx="30" ry="75" fill="none" stroke="#0d47a1" stroke-width="0.7"/>
                <line x1="125" y1="90" x2="275" y2="90" stroke="#1565c0" stroke-width="0.7"/>
                <circle cx="160" cy="60" r="6" fill="#f44336"/><circle cx="240" cy="70" r="5" fill="#4caf50"/>
                <circle cx="180" cy="110" r="7" fill="#ffc107"/><circle cx="220" cy="50" r="5" fill="#9c27b0"/>
                <circle cx="250" cy="110" r="6" fill="#ff5722"/><circle cx="150" cy="95" r="4" fill="#03a9f4"/>
                <line x1="160" y1="60" x2="240" y2="70" stroke="#1e88e5" stroke-width="0.5" opacity="0.5"/>
                <line x1="180" y1="110" x2="220" y2="50" stroke="#1e88e5" stroke-width="0.5" opacity="0.5"/>
                <line x1="250" y1="110" x2="160" y2="60" stroke="#1e88e5" stroke-width="0.5" opacity="0.5"/>
                <rect x="300" y="10" width="90" height="50" fill="#1a237e" rx="4"/>
                <text x="345" y="30" text-anchor="middle" fill="#64b5f6" font-size="8" font-weight="bold">SCOUTS</text>
                <text x="345" y="48" text-anchor="middle" fill="#ffd700" font-size="16" font-weight="bold">24</text>
                <rect x="10" y="130" width="90" height="40" fill="#1a237e" rx="4"/>
                <text x="55" y="148" text-anchor="middle" fill="#64b5f6" font-size="8" font-weight="bold">LANDEN</text>
                <text x="55" y="164" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">12</text>
            </svg>`
        ],
        youthscouting: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f3e5f5"/>
                <rect x="0" y="30" width="400" height="120" fill="#e1bee7" stroke="#9c27b0" stroke-width="3"/>
                <circle cx="100" cy="80" r="25" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/><circle cx="300" cy="80" r="23" fill="#ffcc80"/>
                <rect x="90" y="100" width="20" height="35" fill="#7b1fa2"/><rect x="190" y="95" width="20" height="35" fill="#7b1fa2"/>
                <rect x="290" y="100" width="20" height="35" fill="#7b1fa2"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="25" width="400" height="130" fill="#c5cae9" stroke="#3f51b5" stroke-width="3"/>
                <circle cx="50" cy="80" r="22" fill="#ffcc80"/><circle cx="130" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="210" cy="80" r="22" fill="#ffcc80"/><circle cx="290" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="370" cy="80" r="22" fill="#ffcc80"/>
                <text x="50" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="210" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="370" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0f7fa"/>
                <rect x="0" y="20" width="400" height="140" fill="#b2ebf2" stroke="#00acc1" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="28" fill="#00838f"/>
                <text x="200" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SCOUTRAPPORT</text>
                <circle cx="60" cy="75" r="25" fill="#ffcc80"/><circle cx="160" cy="70" r="22" fill="#ffcc80"/>
                <circle cx="260" cy="75" r="25" fill="#ffcc80"/><circle cx="360" cy="70" r="22" fill="#ffcc80"/>
                <text x="60" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A</text>
                <text x="160" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">B+</text>
                <text x="260" y="125" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="360" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A-</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 215,55 255,55 223,80 235,120 200,95 165,120 177,80 145,55 185,55" fill="#ffd700"/>
                <circle cx="50" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="140" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="260" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="350" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <text x="50" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="140" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="260" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
            </svg>`,
            // Level 5: Talentencentrum
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1a237e"/>
                <rect x="0" y="0" width="400" height="28" fill="#ffd700"/>
                <text x="200" y="20" text-anchor="middle" fill="#1a237e" font-size="14" font-weight="bold">TALENTENCENTRUM</text>
                <rect x="10" y="38" width="120" height="55" fill="#283593" rx="4"/>
                <circle cx="50" cy="58" r="14" fill="#ffcc80"/><rect x="42" y="70" width="16" height="18" fill="#1565c0" rx="2"/>
                <text x="95" y="64" text-anchor="middle" fill="#ffd700" font-size="16">★★</text>
                <rect x="140" y="38" width="120" height="55" fill="#283593" rx="4"/>
                <circle cx="180" cy="58" r="14" fill="#ffcc80"/><rect x="172" y="70" width="16" height="18" fill="#388e3c" rx="2"/>
                <text x="225" y="64" text-anchor="middle" fill="#ffd700" font-size="16">★★★</text>
                <rect x="270" y="38" width="120" height="55" fill="#283593" rx="4"/>
                <circle cx="310" cy="58" r="14" fill="#ffcc80"/><rect x="302" y="70" width="16" height="18" fill="#c62828" rx="2"/>
                <text x="355" y="64" text-anchor="middle" fill="#ffd700" font-size="16">★★★</text>
                <rect x="10" y="100" width="185" height="70" fill="#0d47a1" rx="4"/>
                <text x="102" y="140" text-anchor="middle" fill="white" font-size="12" font-weight="bold">TESTLABORATORIUM</text>
                <rect x="205" y="100" width="185" height="70" fill="#004d40" rx="4"/>
                <text x="297" y="140" text-anchor="middle" fill="#80cbc4" font-size="12" font-weight="bold">DATACENTRUM</text>
            </svg>`
        ],
        kantine: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#efebe9"/>
                <rect x="50" y="40" width="300" height="120" fill="#8d6e63" stroke="#5d4037" stroke-width="4"/>
                <rect x="160" y="90" width="80" height="70" fill="#5d4037"/>
                <rect x="80" y="60" width="50" height="55" fill="#a1887f"/>
                <rect x="270" y="60" width="50" height="55" fill="#a1887f"/>
                <ellipse cx="200" cy="30" rx="45" ry="22" fill="#795548"/>
                <text x="200" y="38" text-anchor="middle" fill="white" font-size="16">☕</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <rect x="0" y="35" width="400" height="130" fill="#ffcc80" stroke="#ff9800" stroke-width="4"/>
                <rect x="20" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="250" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="140" y="130" width="120" height="50" fill="#5d4037"/>
                <ellipse cx="85" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="85" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
                <ellipse cx="315" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="315" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="25" width="400" height="140" fill="#f8bbd9" stroke="#e91e63" stroke-width="4"/>
                <rect x="15" y="45" width="110" height="60" fill="#fff"/>
                <rect x="145" y="45" width="110" height="60" fill="#fff"/>
                <rect x="275" y="45" width="110" height="60" fill="#fff"/>
                <rect x="80" y="120" width="240" height="50" fill="#c2185b"/>
                <text x="200" y="152" text-anchor="middle" fill="white" font-size="16" font-weight="bold">KEUKEN</text>
                <circle cx="70" cy="75" r="20" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="75" r="20" fill="#ffcc80"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="15" width="400" height="150" fill="#c5cae9" stroke="#3f51b5" stroke-width="5"/>
                <rect x="10" y="25" width="125" height="65" fill="#fff"/><rect x="145" y="25" width="125" height="65" fill="#fff"/>
                <rect x="280" y="25" width="110" height="65" fill="#fff"/>
                <rect x="10" y="100" width="195" height="60" fill="#1a237e"/>
                <text x="107" y="138" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">⭐ VIP LOUNGE ⭐</text>
                <rect x="210" y="100" width="180" height="60" fill="#283593"/>
                <text x="300" y="138" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SKYBOX</text>
            </svg>`,
            // Level 5: Restaurant
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1a1a2e"/>
                <rect x="0" y="0" width="400" height="180" fill="#16213e" stroke="#ffd700" stroke-width="5"/>
                <rect x="0" y="0" width="400" height="30" fill="#0f3460"/>
                <text x="200" y="22" text-anchor="middle" fill="#ffd700" font-size="15" font-weight="bold">STADIONRESTAURANT</text>
                <rect x="15" y="40" width="170" height="65" fill="#1a1a2e" rx="4"/>
                <circle cx="50" cy="70" r="14" fill="#3e2723"/><circle cx="90" cy="70" r="14" fill="#3e2723"/>
                <circle cx="130" cy="70" r="14" fill="#3e2723"/><circle cx="160" cy="70" r="10" fill="#3e2723"/>
                <rect x="215" y="40" width="170" height="65" fill="#1a1a2e" rx="4"/>
                <rect x="225" y="52" width="50" height="40" fill="#4a148c" rx="3"/>
                <rect x="285" y="52" width="50" height="40" fill="#4a148c" rx="3"/>
                <rect x="345" y="52" width="30" height="40" fill="#4a148c" rx="3"/>
                <rect x="15" y="115" width="175" height="55" fill="#b71c1c" rx="4"/>
                <text x="102" y="148" text-anchor="middle" fill="white" font-size="13" font-weight="bold">BRASSERIE</text>
                <rect x="200" y="115" width="185" height="55" fill="#004d40" rx="4"/>
                <text x="292" y="148" text-anchor="middle" fill="#ffd700" font-size="13" font-weight="bold">CHAMPAGNEBAR</text>
            </svg>`
        ],
        sponsoring: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f5f5f5"/>
                <rect x="50" y="30" width="300" height="120" fill="#fff" stroke="#9e9e9e" stroke-width="3"/>
                <rect x="80" y="55" width="240" height="70" fill="#e0e0e0"/>
                <text x="200" y="98" text-anchor="middle" fill="#616161" font-size="16" font-weight="bold">LOKALE SPONSOR</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="10" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <rect x="205" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <text x="102" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR A</text>
                <text x="297" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR B</text>
                <rect x="100" y="125" width="200" height="50" fill="#1565c0"/>
                <text x="200" y="158" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🤝 PARTNERSHIP</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="5" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="140" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="275" y="15" width="120" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <text x="67" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="202" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="335" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <rect x="50" y="105" width="300" height="65" fill="#1b5e20"/>
                <text x="200" y="145" text-anchor="middle" fill="white" font-size="16" font-weight="bold">💼 GROTE SPONSORS</text>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 218,65 270,65 228,95 245,145 200,115 155,145 172,95 130,65 182,65" fill="#ffd700"/>
                <rect x="10" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <rect x="290" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <text x="60" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
                <text x="340" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
            </svg>`,
            // Level 5: Bedrijfslounge
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#0d1b2a"/>
                <rect x="0" y="0" width="400" height="25" fill="#ffd700"/>
                <text x="200" y="18" text-anchor="middle" fill="#0d1b2a" font-size="13" font-weight="bold">BEDRIJFSLOUNGE</text>
                <rect x="10" y="35" width="185" height="60" fill="#1b2838" stroke="#ffd700" stroke-width="2" rx="4"/>
                <text x="102" y="72" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">MAIN SPONSOR</text>
                <rect x="205" y="35" width="90" height="60" fill="#1b2838" stroke="#64b5f6" stroke-width="2" rx="4"/>
                <text x="250" y="72" text-anchor="middle" fill="#64b5f6" font-size="10" font-weight="bold">PREMIUM</text>
                <rect x="305" y="35" width="85" height="60" fill="#1b2838" stroke="#64b5f6" stroke-width="2" rx="4"/>
                <text x="347" y="72" text-anchor="middle" fill="#64b5f6" font-size="10" font-weight="bold">PREMIUM</text>
                <rect x="10" y="105" width="120" height="65" fill="#263238" rx="4"/>
                <text x="70" y="143" text-anchor="middle" fill="#ffa000" font-size="10" font-weight="bold">BOARDROOM</text>
                <rect x="140" y="105" width="120" height="65" fill="#263238" rx="4"/>
                <text x="200" y="143" text-anchor="middle" fill="#ffa000" font-size="10" font-weight="bold">NETWERK</text>
                <rect x="270" y="105" width="120" height="65" fill="#263238" rx="4"/>
                <text x="330" y="143" text-anchor="middle" fill="#ffa000" font-size="10" font-weight="bold">HOSPITALITY</text>
            </svg>`
        ],
        perszaal: [
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#eceff1"/>
                <rect x="50" y="35" width="300" height="120" fill="#cfd8dc" stroke="#607d8b" stroke-width="3"/>
                <rect x="150" y="55" width="100" height="55" fill="#455a64"/>
                <circle cx="200" cy="82" r="15" fill="#263238"/>
                <rect x="100" y="120" width="200" height="30" fill="#78909c"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0e0e0"/>
                <rect x="0" y="25" width="400" height="130" fill="#bdbdbd" stroke="#757575" stroke-width="4"/>
                <rect x="130" y="35" width="140" height="70" fill="#424242"/>
                <circle cx="200" cy="70" r="20" fill="#212121"/>
                <rect x="30" y="115" width="90" height="35" fill="#616161"/>
                <rect x="155" y="115" width="90" height="35" fill="#616161"/>
                <rect x="280" y="115" width="90" height="35" fill="#616161"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="0" y="15" width="400" height="150" fill="#bbdefb" stroke="#1976d2" stroke-width="4"/>
                <rect x="100" y="25" width="200" height="90" fill="#0d47a1"/>
                <rect x="115" y="38" width="170" height="65" fill="#1565c0"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="18" font-weight="bold">📺 LIVE</text>
                <circle cx="40" cy="135" r="20" fill="#ffcc80"/><circle cx="100" cy="135" r="20" fill="#ffcc80"/>
                <circle cx="300" cy="135" r="20" fill="#ffcc80"/><circle cx="360" cy="135" r="20" fill="#ffcc80"/>
            </svg>`,
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="10" width="400" height="160" fill="#f8bbd9" stroke="#c2185b" stroke-width="5"/>
                <rect x="90" y="20" width="220" height="100" fill="#880e4f"/>
                <rect x="105" y="32" width="190" height="76" fill="#ad1457"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🎬 STUDIO</text>
                <rect x="15" y="130" width="110" height="40" fill="#6a1b9a"/>
                <rect x="145" y="130" width="110" height="40" fill="#4a148c"/>
                <rect x="275" y="130" width="110" height="40" fill="#6a1b9a"/>
            </svg>`,
            // Level 5: Broadcasting Centrum
            `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#0d1b2a"/>
                <rect x="0" y="0" width="400" height="180" fill="#1a1a2e" stroke="#e53935" stroke-width="4"/>
                <rect x="0" y="0" width="400" height="28" fill="#b71c1c"/>
                <circle cx="18" cy="14" r="6" fill="#ff1744"/><text x="50" y="19" fill="white" font-size="11" font-weight="bold">LIVE</text>
                <text x="200" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">BROADCASTING CENTRUM</text>
                <rect x="10" y="38" width="180" height="90" fill="#212121" rx="5"/>
                <rect x="18" y="44" width="164" height="78" fill="#1565c0" rx="3"/>
                <text x="100" y="88" text-anchor="middle" fill="white" font-size="14" font-weight="bold">STUDIO A</text>
                <rect x="200" y="38" width="90" height="42" fill="#212121" rx="4"/>
                <rect x="208" y="44" width="74" height="30" fill="#263238"/>
                <text x="245" y="64" text-anchor="middle" fill="#64b5f6" font-size="8">CAM 1</text>
                <rect x="300" y="38" width="90" height="42" fill="#212121" rx="4"/>
                <rect x="308" y="44" width="74" height="30" fill="#263238"/>
                <text x="345" y="64" text-anchor="middle" fill="#64b5f6" font-size="8">CAM 2</text>
                <rect x="200" y="86" width="190" height="42" fill="#212121" rx="4"/>
                <text x="295" y="112" text-anchor="middle" fill="#ff9800" font-size="11" font-weight="bold">REGIEPANEEL</text>
                <rect x="10" y="138" width="380" height="32" fill="#1a237e" rx="4"/>
                <text x="200" y="159" text-anchor="middle" fill="white" font-size="11" font-weight="bold">PERSCONFERENTIE + MIXED ZONE</text>
            </svg>`
        ]
    };

    const categoryIllustrations = illustrations[category];
    if (!categoryIllustrations) return '';

    return categoryIllustrations[level] || categoryIllustrations[categoryIllustrations.length - 1];
}

function updateStadiumDetailPanel(category) {
    const config = STADIUM_TILE_CONFIG[category];
    if (!config) return;

    const categoryIcons = {
        tribune: '🏟️', grass: '🌱', training: '💪',
        medical: '🏥', academy: '🎓', scouting: '🔍',
        youthscouting: '👶', kantine: '🍺', sponsoring: '💼', perszaal: '📰'
    };
    const categoryNames = {
        tribune: 'Stadion', grass: 'Wedstrijdveld', training: 'Trainingsveld',
        medical: 'Medische Voorzieningen', academy: 'Jeugdopleiding', scouting: 'Scouting',
        youthscouting: 'Scoutingcentrum', kantine: 'Kantine', sponsoring: 'Sponsoring', perszaal: 'Perszaal'
    };

    // Initialize youthscouting in state if needed
    if (!gameState.stadium.youthscouting) {
        gameState.stadium.youthscouting = 'ysct_0';
    }

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const currentLevel = config.levels[currentIndex] || config.levels[0];
    const nextLevel = config.levels[currentIndex + 1];
    const isMaxed = !nextLevel;
    const totalLevels = config.levels.length;

    // Get current stadium capacity for requirements
    const currentCapacity = STADIUM_TILE_CONFIG.tribune.levels.find(
        l => l.id === gameState.stadium.tribune
    )?.capacity || 200;

    // Check if next level has requirement
    const hasRequirement = nextLevel?.reqCapacity && currentCapacity < nextLevel.reqCapacity;

    // Get DOM elements
    const iconEl = document.getElementById('detail-icon');
    const titleEl = document.getElementById('detail-title');
    const levelEl = document.getElementById('detail-level');
    const levelNameEl = document.getElementById('detail-level-name');
    const descEl = document.getElementById('detail-description');
    const currentEffectEl = document.getElementById('detail-current-effect');
    const nextEffectEl = document.getElementById('detail-next-effect');
    const nextNameEl = document.getElementById('detail-next-name');
    const improvementEl = document.getElementById('detail-improvement');
    const levelsTrackEl = document.getElementById('detail-levels-track');
    const nextUpgradeEl = document.getElementById('detail-next-upgrade');
    const costEl = document.getElementById('detail-cost');
    const reqEl = document.getElementById('detail-requirement');
    const reqTextEl = document.getElementById('detail-req-text');
    const upgradeBtn = document.getElementById('btn-upgrade-stadium');

    // Update basic info
    if (iconEl) iconEl.textContent = categoryIcons[category] || '🏟️';
    if (titleEl) titleEl.textContent = categoryNames[category] || category;
    if (levelEl) levelEl.textContent = `Niveau ${currentIndex + 1} van ${totalLevels}`;
    if (levelNameEl) levelNameEl.textContent = currentLevel.name || '';
    if (descEl) descEl.textContent = config.description || '';
    if (currentEffectEl) currentEffectEl.innerHTML = `<span class="benefit-main">${currentLevel.effect}</span>`;

    // Update large illustration
    const illustrationEl = document.getElementById('detail-illustration');
    if (illustrationEl) {
        illustrationEl.innerHTML = getStadiumIllustration(category, currentIndex);
    }

    // Build levels progress track
    if (levelsTrackEl) {
        let trackHTML = '';
        config.levels.forEach((level, idx) => {
            let stepClass = 'level-step';
            if (idx < currentIndex) stepClass += ' completed';
            else if (idx === currentIndex) stepClass += ' current';
            else stepClass += ' locked';

            // Short name for display
            const shortName = level.name.split(' ')[0];

            trackHTML += `
                <div class="${stepClass}">
                    <div class="level-dot">${idx + 1}</div>
                    <span class="level-name-short">${shortName}</span>
                </div>
            `;
        });
        levelsTrackEl.innerHTML = trackHTML;
    }

    // Update next upgrade section
    if (isMaxed) {
        if (nextUpgradeEl) {
            nextUpgradeEl.classList.add('maxed');
            nextUpgradeEl.innerHTML = `
                <div class="next-upgrade-header">
                    <span class="next-label">Status</span>
                    <span class="next-name">✅ Maximaal niveau</span>
                </div>
                <div class="next-upgrade-content">
                    <div class="next-benefit">
                        <span class="next-benefit-icon">🏆</span>
                        <span class="next-benefit-text">Alle upgrades voltooid!</span>
                    </div>
                </div>
            `;
        }
        if (costEl) costEl.textContent = '—';
        if (reqEl) reqEl.style.display = 'none';
        if (upgradeBtn) {
            upgradeBtn.disabled = true;
            upgradeBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Maximaal</span>';
        }
    } else {
        const canAfford = gameState.club.budget >= nextLevel.cost;

        if (nextUpgradeEl) {
            nextUpgradeEl.classList.remove('maxed');
        }
        if (nextNameEl) nextNameEl.textContent = nextLevel.name;
        if (nextEffectEl) nextEffectEl.textContent = nextLevel.effect;

        // Calculate improvement percentage if possible
        if (improvementEl) {
            const improvementText = getImprovementText(category, currentLevel, nextLevel);
            if (improvementText) {
                improvementEl.style.display = 'flex';
                improvementEl.innerHTML = `
                    <span class="improvement-badge">${improvementText.badge}</span>
                    <span class="improvement-text">${improvementText.text}</span>
                `;
            } else {
                improvementEl.style.display = 'none';
            }
        }

        if (costEl) costEl.textContent = formatCurrency(nextLevel.cost);

        // Show requirement if needed
        if (reqEl) {
            if (hasRequirement) {
                reqEl.style.display = 'flex';
                if (reqTextEl) reqTextEl.textContent = `Vereist: Stadion met ${nextLevel.reqCapacity}+ capaciteit`;
            } else {
                reqEl.style.display = 'none';
            }
        }

        if (upgradeBtn) {
            if (hasRequirement) {
                upgradeBtn.disabled = true;
                upgradeBtn.innerHTML = '<span class="btn-icon">🔒</span><span class="btn-text">Stadion te klein</span>';
            } else if (!canAfford) {
                upgradeBtn.disabled = true;
                upgradeBtn.innerHTML = '<span class="btn-icon">💸</span><span class="btn-text">Te duur</span>';
            } else {
                upgradeBtn.disabled = false;
                upgradeBtn.innerHTML = '<span class="btn-icon">🔨</span><span class="btn-text">Bouwen</span>';
            }
        }
    }
}

// Helper function to calculate improvement text
function getImprovementText(category, currentLevel, nextLevel) {
    // Try to extract numbers from effects
    const currentMatch = currentLevel.effect.match(/(\d+)/);
    const nextMatch = nextLevel.effect.match(/(\d+)/);

    if (currentMatch && nextMatch) {
        const currentVal = parseInt(currentMatch[1]);
        const nextVal = parseInt(nextMatch[1]);
        if (currentVal > 0) {
            const increase = Math.round(((nextVal - currentVal) / currentVal) * 100);
            if (increase > 0) {
                return { badge: `+${increase}%`, text: 'verbetering' };
            }
        } else if (nextVal > 0) {
            return { badge: `+${nextVal}`, text: 'nieuw' };
        }
    }

    // Category-specific improvements
    const improvements = {
        tribune: { badge: '⬆️', text: 'meer capaciteit' },
        grass: { badge: '⬆️', text: 'beter thuisvoordeel' },
        training: { badge: '⬆️', text: 'snellere groei' },
        medical: { badge: '⬆️', text: 'sneller herstel' },
        academy: { badge: '⬆️', text: 'beter talent' },
        scouting: { badge: '⬆️', text: 'groter bereik' },
        youthscouting: { badge: '⬆️', text: 'beter jeugdtalent' },
        kantine: { badge: '⬆️', text: 'meer inkomsten' }
    };

    return improvements[category] || null;
}

function upgradeStadiumCategory() {
    const category = currentStadiumCategory;
    const config = STADIUM_TILE_CONFIG[category];
    if (!config) return;

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const nextLevel = config.levels[currentIndex + 1];

    if (!nextLevel) {
        showNotification('Maximaal niveau bereikt!', 'info');
        return;
    }

    if (gameState.club.budget < nextLevel.cost) {
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    // Check stadium capacity requirement
    if (nextLevel.reqCapacity) {
        const currentCapacity = STADIUM_TILE_CONFIG.tribune.levels.find(
            l => l.id === gameState.stadium.tribune
        )?.capacity || 200;
        if (currentCapacity < nextLevel.reqCapacity) {
            showNotification(`Stadion te klein! Vereist ${nextLevel.reqCapacity}+ capaciteit.`, 'error');
            return;
        }
    }

    // Check division requirement
    if (nextLevel.reqDivision !== undefined) {
        if (gameState.club.division > nextLevel.reqDivision) {
            showNotification('Nog niet vrijgespeeld in deze divisie!', 'error');
            return;
        }
    }

    // Check if already building
    if (gameState.stadium.construction) {
        showNotification('Er wordt al gebouwd! Wacht tot het huidige project klaar is.', 'error');
        return;
    }

    // Deduct cost and start construction
    gameState.club.budget -= nextLevel.cost;
    gameState.stadium.construction = {
        category: category,
        targetId: nextLevel.id,
        completesAt: getNextMidnight()
    };

    // Update UI
    renderStadiumMap();
    updateStadiumUpgradePanel(category);
    updateBudgetDisplays();
    showNotification(`Bouw gestart: ${nextLevel.name}! Klaar morgen om 00:00.`, 'success');
    saveGame();
}

function checkConstruction() {
    const construction = gameState.stadium.construction;
    if (!construction) return;

    if (Date.now() < construction.completesAt) return;

    // Construction complete — apply upgrade
    const config = STADIUM_TILE_CONFIG[construction.category];
    if (config) {
        gameState.stadium[config.stateKey] = construction.targetId;

        // Update capacity if tribune
        if (construction.category === 'tribune') {
            const level = config.levels.find(l => l.id === construction.targetId);
            if (level && level.capacity) {
                gameState.stadium.capacity = level.capacity;
            }
        }

        const level = config.levels.find(l => l.id === construction.targetId);
        showNotification(`${level?.name || 'Upgrade'} is voltooid!`, 'success');
    }

    gameState.stadium.construction = null;
    saveGame();

    // Refresh UI if on stadium page
    renderStadiumMap();
    if (currentStadiumCategory) {
        updateStadiumUpgradePanel(currentStadiumCategory);
    }
    updateBudgetDisplays();
}

function updateStadiumCategoryLevels() {
    // Update capacity in header
    const capacityEl = document.getElementById('stadium-capacity');
    if (capacityEl) {
        capacityEl.textContent = gameState.stadium.capacity || 200;
    }
}

function initStadiumCategories() {
    updateStadiumCategoryLevels();
}

window.selectStadiumCategory = selectStadiumCategory;
window.upgradeStadiumCategory = upgradeStadiumCategory;

// ================================================
// DASHBOARD 2: DE KANTINE
// ================================================

function initDashboardTabs() {
    const tabs = document.querySelectorAll('.dash-tab');
    const dashGrid = document.querySelector('.dash-grid');
    const kantineDashboard = document.getElementById('kantine-dashboard');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const dashboard = tab.dataset.dashboard;

            if (dashboard === '1') {
                // Show classic dashboard
                if (dashGrid) dashGrid.style.display = 'grid';
                if (kantineDashboard) kantineDashboard.style.display = 'none';
            } else if (dashboard === '2') {
                // Show kantine dashboard
                if (dashGrid) dashGrid.style.display = 'none';
                if (kantineDashboard) kantineDashboard.style.display = 'block';
                renderKantineDashboard();
            }
        });
    });
}

function renderKantineDashboard() {
    renderKantineHeader();
    renderKantineMatch();
    renderKantineStats();
    renderKantineStandings();
    renderKantineCircleStats();
    renderKantineStarplayers();
}

function renderKantineHeader() {
    const managerEl = document.getElementById('km-manager-name');
    const clubNameEl = document.getElementById('km-club-name');

    if (managerEl) managerEl.textContent = gameState.managerName || 'Trainer';
    if (clubNameEl) clubNameEl.textContent = gameState.clubName || 'FC Goals Maken';
}

function renderKantineMatch() {
    const homeEl = document.getElementById('km-home');
    const awayEl = document.getElementById('km-away');
    const leagueEl = document.getElementById('km-league');
    const dateEl = document.getElementById('km-match-date');

    if (homeEl) homeEl.textContent = gameState.clubName || 'FC Goals Maken';

    // Get next opponent
    const schedule = gameState.schedule || [];
    const nextMatch = schedule.find(m => !m.played);
    if (nextMatch && awayEl) {
        const isHome = nextMatch.homeTeam === gameState.clubName;
        awayEl.textContent = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
    }

    // Set league name
    if (leagueEl) {
        const division = gameState.division || 8;
        leagueEl.textContent = `${division}e Klasse`;
    }

    // Set match date/time from countdown
    if (dateEl) {
        const hours = document.getElementById('timer-hours')?.textContent || '00';
        const minutes = document.getElementById('timer-minutes')?.textContent || '00';
        dateEl.textContent = `Over ${hours}u ${minutes}m`;

        // Update periodically
        setInterval(() => {
            const h = document.getElementById('timer-hours')?.textContent || '00';
            const m = document.getElementById('timer-minutes')?.textContent || '00';
            dateEl.textContent = `Over ${h}u ${m}m`;
        }, 60000);
    }
}

function renderKantineStats() {
    const playedEl = document.getElementById('km-played');
    const winsEl = document.getElementById('km-wins');
    const drawsEl = document.getElementById('km-draws');
    const lossesEl = document.getElementById('km-losses');

    // Get season stats from gameState
    const stats = gameState.seasonStats || { wins: 0, draws: 0, losses: 0 };
    const played = (stats.wins || 0) + (stats.draws || 0) + (stats.losses || 0);

    if (playedEl) playedEl.textContent = played;
    if (winsEl) winsEl.textContent = stats.wins || 0;
    if (drawsEl) drawsEl.textContent = stats.draws || 0;
    if (lossesEl) lossesEl.textContent = stats.losses || 0;
}

function renderKantineStandings() {
    const container = document.getElementById('km-standings-body');
    if (!container) return;

    const standings = gameState.standings || [];
    const playerTeam = gameState.clubName || 'FC Goals Maken';

    let html = '';
    standings.forEach((team, index) => {
        const isPlayer = team.name === playerTeam;
        const isPromo = index < 2;
        const isRelegation = index >= standings.length - 2;

        html += `<tr class="${isPlayer ? 'is-player' : ''} ${isPromo ? 'promo' : ''} ${isRelegation ? 'relegation' : ''}">
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.wins || 0}</td>
            <td>${team.draws || 0}</td>
            <td>${team.losses || 0}</td>
            <td>${team.points}</td>
        </tr>`;
    });

    container.innerHTML = html;
}

function renderKantineCircleStats() {
    const possessionEl = document.getElementById('km-possession');
    const budgetEl = document.getElementById('km-budget');
    const ratingEl = document.getElementById('km-rating');
    const goalsEl = document.getElementById('km-goals');

    // Calculate average possession (default 50%)
    const possession = gameState.avgPossession || 50;
    if (possessionEl) {
        possessionEl.textContent = `${Math.round(possession)}%`;
        // Update circle progress
        const circle = possessionEl.closest('.km-circle');
        if (circle) circle.style.setProperty('--progress', possession);
    }

    // Budget
    if (budgetEl) {
        const budget = gameState.budget || 5000;
        budgetEl.textContent = `€${budget.toLocaleString('nl-NL')}`;
    }

    // Team rating (average overall)
    if (ratingEl) {
        const players = gameState.players || [];
        const avgRating = players.length > 0
            ? Math.round(players.reduce((sum, p) => sum + (p.overall || 40), 0) / players.length)
            : 40;
        ratingEl.textContent = avgRating;
    }

    // Total goals
    if (goalsEl) {
        const totalGoals = (gameState.players || []).reduce((sum, p) => sum + (p.seasonGoals || 0), 0);
        goalsEl.textContent = totalGoals;
    }
}

function renderKantineStarplayers() {
    const container = document.getElementById('km-starplayers');
    if (!container) return;

    const starPlayers = (gameState.players || [])
        .filter(p => !p.isYouth)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 3);

    if (starPlayers.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Geen spelers in selectie</p>';
        return;
    }

    container.innerHTML = starPlayers.map((player) => {
        const posData = POSITIONS[player.position] || { name: 'Speler', abbr: '?' };
        return `
            <div class="km-star-player">
                <div class="km-star-avatar">${player.nationality?.flag || '🇳🇱'}</div>
                <div class="km-star-info">
                    <p class="km-star-name">${player.name}</p>
                    <span class="km-star-pos">${posData.name} · ${player.age} jaar</span>
                </div>
                <span class="km-star-rating">${player.overall}</span>
            </div>
        `;
    }).join('');
}

// Legacy function stubs for backwards compatibility
function renderKantineToptalents() {}
function renderKantineChairman() {}
function renderKantineTopscorers() {}

// ============================================
// MULTIPLAYER INTEGRATION
// ============================================

/**
 * Initialize game in multiplayer mode (called after Supabase load)
 */
async function initMultiplayerGame(detail) {
    const { leagueId, clubId, userId, league } = detail;

    // Load game state from Supabase
    setStorageMode('multiplayer', leagueId, clubId);
    const mpState = await loadGame();

    if (mpState) {
        replaceGameState(mpState);
        gameState.multiplayer.userId = userId;
        gameState.multiplayer.isHost = league.created_by === userId;
    }

    // Render everything
    renderStandings();
    renderTopScorers();
    renderPlayerCards();
    updateBudgetDisplays();
    renderDashboardExtras();

    // Subscribe to realtime updates
    subscribeToLeague(leagueId, {
        onStandingsChange: async () => {
            const standings = await fetchStandings(leagueId);
            if (standings.length > 0) {
                gameState.standings = standings;
                renderStandings();
            }
        },
        onMatchResult: (result) => {
            showNotification(`Uitslag: ${result.home_score}-${result.away_score}`, 'info');
        },
        onTransferChange: () => {
            if (typeof renderTransferMarket === 'function') renderTransferMarket();
        },
        onFeedItem: (item) => {
            if (item.type === 'result') {
                showNotification('Nieuwe wedstrijduitslagen beschikbaar!', 'info');
            }
        },
        onLeagueUpdate: (league) => {
            if (league.week !== gameState.week || league.season !== gameState.season) {
                gameState.week = league.week;
                gameState.season = league.season;
                renderDashboardExtras();
            }
        }
    });

    // Show league overlay bar
    showLeagueOverlay(league.name || 'Competitie');
    startCountdown(league.match_time || '20:00');

    // Start auto-save to sync
    startAutoSave(gameState);

    console.log(`Multiplayer game loaded: league=${leagueId}, club=${clubId}`);
}

/**
 * Callback for mode selection — starts the game
 */
function onStartGame(mode) {
    if (mode === 'local') {
        setStorageMode('local');
        initGame('local');
    }
    // multiplayer mode is handled by the 'multiplayer-start' event
}

// Listen for multiplayer game start
window.addEventListener('multiplayer-start', (e) => {
    initMultiplayerGame(e.detail);
});

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize multiplayer UI listeners
    initMultiplayerUI(onStartGame);

    if (isSupabaseAvailable()) {
        // Supabase is configured: show auth/mode screen
        checkAuthAndRoute(onStartGame);
    } else {
        // No Supabase: go straight to singleplayer
        initGame('local');
    }
});
