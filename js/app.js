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
    calculatePotential,
    getNextMidnight,
    formatTimeRemaining
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
    hasSaveFile,
    getSaveInfo,
    startAutoSave,
    calculateOfflineProgress,
    applyOfflineProgress,
    exportSave,
    importSave
} from './storage.js';

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
    getNextOpponent,
    getZoneInfo,
    getSeasonSchedule,
    MANAGER_LEVELS,
    XP_REWARDS
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
        potential: calculatePotential(overall, playerAge),
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

    return squad;
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
        potential: overall + random(0, 2),
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
    const divBonus = scoutLevel === 'scout_5' || scoutLevel === 'scout_6' ? -1 : 0;
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
            potential: calculateScoutRanges(player.potential, player.scoutCount),
            attack: calculateScoutRanges(player.attack, player.scoutCount),
            defense: calculateScoutRanges(player.defense, player.scoutCount),
            speed: calculateScoutRanges(player.speed, player.scoutCount),
            stamina: calculateScoutRanges(player.stamina, player.scoutCount)
        };

        // Hide info based on scout level
        player.scoutInfo = {
            overall: true,
            attributes: ['scout_3', 'scout_4', 'scout_5', 'scout_6'].includes(scoutLevel),
            personality: ['scout_4', 'scout_5', 'scout_6'].includes(scoutLevel),
            potential: ['scout_5', 'scout_6'].includes(scoutLevel)
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
        potential: calculateScoutRanges(player.potential, player.scoutCount),
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
    const potential = player.potential || overall;
    const age = player.age || 25;

    // Base value from overall rating
    let baseValue = Math.pow(overall, 2) * (divMultipliers[div] || 0.4) * 100;

    // Potential bonus (higher potential = higher value)
    const potentialBonus = 1 + ((potential - overall) / 100);
    baseValue *= potentialBonus;

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

    // Update squad stats
    const squadCount = document.getElementById('squad-count');
    const squadAvg = document.getElementById('squad-avg');
    if (squadCount) squadCount.textContent = gameState.players.length;
    if (squadAvg) {
        const avg = Math.round(gameState.players.reduce((sum, p) => sum + p.overall, 0) / gameState.players.length);
        squadAvg.textContent = avg;
    }

    // Add click handlers
    document.querySelectorAll('#player-cards .player-card').forEach(card => {
        card.addEventListener('click', () => {
            const playerId = parseFloat(card.dataset.playerId);
            showPlayerDetail(playerId);
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
    const count = Math.round(Math.min(5, Math.max(1, starCount)));
    for (let i = 0; i < count; i++) {
        html += '<span class="star full">★</span>';
    }
    for (let i = count; i < 5; i++) {
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

    // Potential as stars: own player = real rating, others = 1 or 2
    const potentialStars = player.isMyPlayer
        ? potentialToStarsGlobal(99)
        : (player.overall >= 25 ? 2 : 1);

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
            position: 'CM',
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
    // Migrate to ALG 12: clamp all attributes
    const attrKeys = ['SNE', 'TEC', 'PAS', 'SCH', 'VER', 'FYS'];
    attrKeys.forEach(k => { if (a[k] > 12) a[k] = 12; });
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

let mspTabsInitialized = false;
function initMijnSpelerTabs() {
    if (mspTabsInitialized) return;
    mspTabsInitialized = true;

    const tabs = document.querySelectorAll('.msp-tab');
    const panels = document.querySelectorAll('.msp-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.mspTab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `msp-${targetTab}`) {
                    panel.classList.add('active');
                }
            });

            if (targetTab === 'overzicht') renderMijnSpelerPage();
            else if (targetTab === 'speler') renderSpelersPrestaties();
            else if (targetTab === 'manager') renderManagersPrestaties();
        });
    });
}

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
                return `<div class="${cls}">
                    <span class="ach-icon">${icon}</span>
                    <div class="ach-info">
                        <span class="ach-name">${name}</span>
                        <span class="ach-desc">${desc}</span>
                    </div>
                    ${a.unlocked ? '<span class="ach-check">✓</span>' : ''}
                </div>`;
            }).join('');
        return cards;
    }

    return { progressPct, stats, filterBtns, renderCards, defaultCategory: filterCategories[0] };
}

function renderSpelersPrestaties() {
    const container = document.getElementById('speler-prestaties');
    if (!container) return;

    // --- Stats ---
    const history = gameState.matchHistory || [];
    const seasonHistory = history.filter(h => h.season === gameState.season);
    const clubStats = gameState.club?.stats || {};
    const stats = gameState.stats || {};
    const totalSeasons = gameState.season || 1;

    const seasonMatches = seasonHistory.length;
    const seasonGoals = seasonHistory.reduce((sum, m) => sum + (m.playerScore || 0), 0);
    const seasonAssists = seasonHistory.reduce((sum, m) => {
        return sum + (m.events || []).filter(e => e.type === 'goal' && e.team === 'home' && e.assistId).length;
    }, 0);
    const seasonCleanSheets = seasonHistory.filter(m => m.opponentScore === 0).length;
    const seasonWins = seasonHistory.filter(m => m.resultType === 'win').length;
    const seasonDraws = seasonHistory.filter(m => m.resultType === 'draw').length;
    const seasonLosses = seasonHistory.filter(m => m.resultType === 'loss').length;

    function recordItem(value, label) {
        return `<div class="mp-record-item">
            <span class="mp-record-value">${value}</span>
            <span class="mp-record-label">${label}</span>
        </div>`;
    }

    // --- Achievements ---
    const allAch = getAllAchievements(gameState);
    const spelerCats = [CATEGORIES.MATCHES, CATEGORIES.GOALS, CATEGORIES.SEASON, CATEGORIES.SPECIAL];
    const ach = renderAchievementCards(allAch, spelerCats);

    container.innerHTML = `
        <div class="mp-dual-grid" style="margin-bottom: 16px;">
            <div class="mp-stats-section">
                <h4 class="mp-section-title">Seizoen ${totalSeasons}</h4>
                <div class="mp-record-grid">
                    ${recordItem(seasonMatches, 'Wedstrijden')}
                    ${recordItem(seasonGoals, 'Doelpunten')}
                    ${recordItem(seasonAssists, 'Assists')}
                    ${recordItem(seasonCleanSheets, 'Clean sheets')}
                    ${recordItem(seasonWins, 'Zeges')}
                    ${recordItem(seasonDraws + ' / ' + seasonLosses, 'Gelijk / Verloren')}
                </div>
            </div>
            <div class="mp-stats-section">
                <h4 class="mp-section-title">Carrière</h4>
                <div class="mp-record-grid">
                    ${recordItem(clubStats.totalMatches || 0, 'Wedstrijden')}
                    ${recordItem(clubStats.totalGoals || 0, 'Doelpunten')}
                    ${recordItem(stats.wins || 0, 'Zeges')}
                    ${recordItem(stats.draws || 0, 'Gelijk')}
                    ${recordItem(stats.losses || 0, 'Verloren')}
                    ${recordItem(stats.cleanSheets || 0, 'Clean sheets')}
                </div>
            </div>
        </div>

        <div class="mp-stats-section">
            <h4 class="mp-section-title">Spelersprestaties</h4>
            <div class="ach-progress">
                <div class="ach-progress-bar">
                    <div class="ach-progress-fill" style="width: ${ach.progressPct}%"></div>
                </div>
                <span class="ach-progress-text">${ach.stats.unlocked} / ${ach.stats.total}</span>
            </div>
            <div class="ach-filters" id="speler-ach-filters">
                <button class="ach-filter-btn active" data-ach-cat="all">Alles</button>
                ${ach.filterBtns}
            </div>
            <div class="ach-grid" id="speler-ach-grid">
                ${ach.renderCards(null)}
            </div>
        </div>
    `;

    // Filter click handlers
    container.querySelectorAll('.ach-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.ach-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.achCat;
            const grid = document.getElementById('speler-ach-grid');
            if (grid) grid.innerHTML = ach.renderCards(cat === 'all' ? null : cat);
        });
    });
}

function renderManagersPrestaties() {
    const container = document.getElementById('manager-prestaties');
    if (!container) return;

    // --- XP & Level ---
    const managerXP = gameState.manager?.xp || 0;
    const levelInfo = getManagerLevel(managerXP);
    const progressPct = Math.round(levelInfo.progress * 100);

    // --- Level Roadmap ---
    const roadmapSteps = MANAGER_LEVELS.map(lvl => {
        let cls = 'xp-step future';
        if (lvl.level < levelInfo.level) cls = 'xp-step achieved';
        else if (lvl.level === levelInfo.level) cls = 'xp-step current';
        return `<div class="${cls}">
            <div class="xp-dot">${lvl.level <= levelInfo.level ? '✓' : lvl.level}</div>
            <span class="xp-step-label">${lvl.title}</span>
        </div>`;
    }).join('');

    // --- XP Rewards ---
    const rewardLabels = {
        matchWin: 'Wedstrijd gewonnen',
        matchDraw: 'Gelijkspel',
        matchLoss: 'Wedstrijd verloren',
        cleanSheet: 'Clean sheet',
        goalScored: 'Doelpunt gescoord',
        promotion: 'Promotie',
        title: 'Kampioenschap',
        youthGraduate: 'Jeugdspeler doorgeschoven',
        playerSold: 'Speler verkocht',
        stadiumUpgrade: 'Stadion-upgrade',
        achievementUnlocked: 'Achievement behaald'
    };

    const rewardItems = Object.entries(XP_REWARDS).map(([key, xp]) =>
        `<div class="xp-reward-item">
            <span class="xp-reward-action">${rewardLabels[key] || key}</span>
            <span class="xp-reward-xp">+${xp} XP</span>
        </div>`
    ).join('');

    // --- Manager Achievements ---
    const allAch = getAllAchievements(gameState);
    const mgrCats = [CATEGORIES.CLUB, CATEGORIES.PLAYERS, CATEGORIES.STADIUM];
    const ach = renderAchievementCards(allAch, mgrCats);

    container.innerHTML = `
        <div class="xp-hero">
            <div class="xp-level">Level ${levelInfo.level}</div>
            <div class="xp-title">${levelInfo.title}</div>
            <div class="xp-bar-track">
                <div class="xp-bar-fill" style="width: ${progressPct}%"></div>
            </div>
            <div class="xp-info">
                <span>${managerXP} XP totaal</span>
                <span>${levelInfo.xpToNext > 0 ? levelInfo.xpToNext + ' XP tot volgend level' : 'Max level!'}</span>
            </div>
        </div>

        <div class="mp-stats-section" style="margin-bottom: 16px;">
            <h4 class="mp-section-title">Level Roadmap</h4>
            <div class="xp-roadmap">
                ${roadmapSteps}
            </div>
        </div>

        <div class="mp-stats-section" style="margin-bottom: 16px;">
            <h4 class="mp-section-title">XP Beloningen</h4>
            <div class="xp-rewards">
                ${rewardItems}
            </div>
        </div>

        <div class="mp-stats-section">
            <h4 class="mp-section-title">Managersprestaties</h4>
            <div class="ach-progress">
                <div class="ach-progress-bar">
                    <div class="ach-progress-fill" style="width: ${ach.progressPct}%"></div>
                </div>
                <span class="ach-progress-text">${ach.stats.unlocked} / ${ach.stats.total}</span>
            </div>
            <div class="ach-filters" id="manager-ach-filters">
                <button class="ach-filter-btn active" data-ach-cat="all">Alles</button>
                ${ach.filterBtns}
            </div>
            <div class="ach-grid" id="manager-ach-grid">
                ${ach.renderCards(null)}
            </div>
        </div>
    `;

    // Filter click handlers
    container.querySelectorAll('.ach-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.ach-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.achCat;
            const grid = document.getElementById('manager-ach-grid');
            if (grid) grid.innerHTML = ach.renderCards(cat === 'all' ? null : cat);
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
    initTacticsControls();
    populateSpecialistSelects();
    renderTeamTraining();
}

function renderFormationDropdown() {
    const select = document.getElementById('formation-select');
    if (!select) return;

    // Sort formations
    const sortedFormations = Object.entries(FORMATIONS).sort((a, b) => {
        const partsA = a[0].split('-').map(Number);
        const partsB = b[0].split('-').map(Number);
        if (partsB[0] !== partsA[0]) return partsB[0] - partsA[0];
        return 0;
    });

    let html = '';
    for (const [key, formation] of sortedFormations) {
        const selected = gameState.formation === key ? 'selected' : '';
        html += `<option value="${key}" ${selected}>${key}</option>`;
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
    };
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
        const posColor = posData?.color || '#666';

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
                         style="background: ${posColor}">
                        <span class="lp-flag">${nationalityFlag}</span>
                        <span class="lp-overall">${player.overall + chemistryBonus}${chemistryBonus > 0 ? '<span class="chemistry-boost">+' + chemistryBonus + '</span>' : ''}</span>
                        <span class="lp-name">${player.name.split(' ')[0]}</span>
                        <span class="lp-position">${POSITIONS[player.position]?.abbr || player.position}</span>
                    </div>
                ` : `
                    <div class="lineup-empty-slot" style="border-color: ${posColor}">
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
    const fitFill = document.getElementById('lineup-fit-fill');
    const fitScore = document.getElementById('lineup-fit-score');

    const filledCount = gameState.lineup.filter(p => p).length;
    const fit = Math.round((filledCount / 11) * 100);

    if (fitFill) fitFill.style.width = `${fit}%`;
    if (fitScore) fitScore.textContent = `${fit}%`;
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
            const playerId = parseFloat(el.dataset.playerId);
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

function handleAvailablePlayerDragStart(e) {
    const playerId = parseFloat(e.target.dataset.playerId);
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

function initTacticsControls() {
    // Playstyle buttons
    document.querySelectorAll('.playstyle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.playstyle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.tactics.playstyle = btn.dataset.style;
        });
    });

    // Tactic choice buttons
    document.querySelectorAll('.tactic-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.querySelectorAll('.tactic-choice').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Width slider info
    const widthSlider = document.getElementById('tactic-width');
    const widthInfo = document.getElementById('width-info');
    if (widthSlider && widthInfo) {
        widthSlider.addEventListener('input', () => {
            const val = parseInt(widthSlider.value);
            if (val < 30) widthInfo.textContent = 'Smal: Compacte verdediging, minder ruimte';
            else if (val < 70) widthInfo.textContent = 'Normaal: Standaard veldbreedte';
            else widthInfo.textContent = 'Breed: Meer ruimte op vleugels, risicovol';
        });
    }
}

function renderAdvancedTactics() {
    const container = document.querySelector('.advanced-tactics');
    if (!container) return;

    let html = '';

    for (const [category, options] of Object.entries(TACTICS)) {
        html += `
            <div class="tactic-category">
                <h4>${category === 'mentality' ? 'Mentaliteit' :
                      category === 'pressing' ? 'Druk' :
                      category === 'passingStyle' ? 'Speelstijl' :
                      category === 'tempo' ? 'Tempo' : 'Breedte'}</h4>
                <div class="tactic-options">
        `;

        options.forEach(option => {
            const isActive = gameState.tactics[category] === option.id ? 'active' : '';
            html += `
                <button class="tactic-option ${isActive}" data-category="${category}" data-option="${option.id}">
                    <span class="tactic-icon">${option.icon}</span>
                    <span class="tactic-name">${option.name}</span>
                </button>
            `;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;

    // Add handlers
    document.querySelectorAll('.tactic-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const option = btn.dataset.option;

            // Remove active from siblings
            btn.parentElement.querySelectorAll('.tactic-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            gameState.tactics[category] = option;
            updateTacticsFitDisplay();
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
        chairmanSon.potential = 40;
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
    const a = mp.attributes;
    const trainedToday = hasTrainedToday(mp);

    // Cooldown display
    const cooldownEl = document.getElementById('training-cooldown');
    if (cooldownEl) {
        cooldownEl.innerHTML = trainedToday
            ? '<span class="cooldown-badge used">Vandaag getraind</span>'
            : '<span class="cooldown-badge available">1 sessie beschikbaar</span>';
    }

    // Player bar
    const playerBar = document.getElementById('training-player-bar');
    if (playerBar) {
        playerBar.innerHTML = `
            <div class="tp-avatar">
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
            <div class="tp-info">
                <div class="tp-name">${mp.name}</div>
                <div class="tp-meta">${mp.position} · ${mp.age} jaar · #${mp.number}</div>
                <div class="tp-alg"><span class="tp-alg-value">${getMyPlayerDerived(mp).gemiddeld}</span> ALG</div>
            </div>
            <div class="tp-options">
                <div class="tp-option">
                    <span class="tp-option-icon">⚡</span>
                    <div class="tp-option-text">
                        <strong>Training</strong>
                        <span>Verbeter een vaardigheid: snelheid, techniek, passing, schieten, verdediging of fysiek.</span>
                    </div>
                </div>
                <div class="tp-option">
                    <span class="tp-option-icon">💆</span>
                    <div class="tp-option-text">
                        <strong>Massage</strong>
                        <span>Herstel energie zodat je fitter aan de volgende wedstrijd begint.</span>
                    </div>
                </div>
                <div class="tp-option">
                    <span class="tp-option-icon">🔭</span>
                    <div class="tp-option-text">
                        <strong>Spionage</strong>
                        <span>Analyseer je volgende tegenstander en ontdek hun sterke en zwakke punten.</span>
                    </div>
                </div>
            </div>
        `;
    }

    const ATTR_COLORS = {
        SNE: '#2196f3', TEC: '#9c27b0', PAS: '#4caf50',
        SCH: '#f44336', VER: '#ff9800', FYS: '#795548', ENE: '#ff9800'
    };

    const columns = [
        { key: 'SNE', name: 'Snelheid', icon: '⚡', desc: 'Sprint en versnelling' },
        { key: 'TEC', name: 'Techniek', icon: '🎯', desc: 'Balcontrole en dribbels' },
        { key: 'PAS', name: 'Passing', icon: '👟', desc: 'Korte en lange passes' },
        { key: 'SCH', name: 'Schieten', icon: '⚽', desc: 'Afronding en schoten' },
        { key: 'VER', name: 'Verdediging', icon: '🛡️', desc: 'Tackles en positionering' },
        { key: 'FYS', name: 'Fysiek', icon: '💪', desc: 'Kracht en uithoudingsvermogen' },
        { key: 'ENE', name: 'Massage', icon: '💆', desc: 'Herstel je energie', isEnergy: true },
        { key: 'SPY', name: 'Bespioneer', icon: '🔭', desc: 'Analyseer de tegenstander', isSpy: true }
    ];

    const container = document.getElementById('training-columns');
    if (!container) return;

    container.innerHTML = columns.map(col => {
        if (col.isSpy) {
            const canSpy = !trainedToday;
            const opponentName = gameState.nextMatch?.opponent || 'Onbekend';
            return `
                <div class="tc-column tc-spy">
                    <div class="tc-icon">${col.icon}</div>
                    <div class="tc-label">${col.name}</div>
                    <div class="tc-desc">${col.desc}</div>
                    <div class="tc-bar-container">
                        <div class="tc-spy-target">
                            <span class="tc-spy-vs">VS</span>
                            <span class="tc-spy-name">${opponentName}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm ${canSpy ? 'btn-primary' : 'btn-secondary'} tc-train-btn"
                            onclick="${canSpy ? "trainMyPlayer('spy')" : ''}" ${!canSpy ? 'disabled' : ''}>
                        Spioneer
                    </button>
                </div>
            `;
        }

        const value = col.isEnergy ? mp.energy : a[col.key];
        const maxVal = col.isEnergy ? 100 : 99;
        const pct = Math.round((value / maxVal) * 100);
        const color = ATTR_COLORS[col.key];
        const canTrain = col.isEnergy
            ? (mp.energy < 100 && !trainedToday)
            : (!trainedToday);
        const btnLabel = col.isEnergy ? 'Massage' : 'Train';
        const btnAction = canTrain ? `trainMyPlayer('${col.isEnergy ? 'massage' : col.key}')` : '';

        return `
            <div class="tc-column">
                <div class="tc-icon">${col.icon}</div>
                <div class="tc-label">${col.name}</div>
                <div class="tc-desc">${col.desc}</div>
                <div class="tc-bar-container">
                    <div class="tc-bar-track">
                        <div class="tc-bar-fill" style="height: ${pct}%; background: ${color}"></div>
                    </div>
                </div>
                <div class="tc-value" style="color: ${color}">${value}</div>
                <button class="btn btn-sm ${canTrain ? 'btn-primary' : 'btn-secondary'} tc-train-btn"
                        onclick="${btnAction}" ${!canTrain ? 'disabled' : ''}>
                    ${btnLabel}
                </button>
            </div>
        `;
    }).join('');
}

// Training tabs switching
function initTrainingTabs() {
    const tabs = document.querySelectorAll('.training-tab');
    const panels = document.querySelectorAll('.training-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.trainingTab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetTab}-training-panel`) {
                    panel.classList.add('active');
                }
            });
        });
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
        const potentialDisplay = getPotentialDisplay(player.potential, player.age);

        html += `
            <div class="training-player-card" onclick="selectTrainingPlayer(${player.id})">
                <div class="tpc-ratings">
                    <div class="tpc-overall" style="background: ${posData.color}">
                        <span class="tpc-overall-val">${player.overall}</span>
                        <span class="tpc-overall-lbl">OVR</span>
                    </div>
                    <div class="tpc-potential" style="background: ${posData.color}; opacity: 0.85">
                        <span class="tpc-potential-val">${potentialDisplay}</span>
                        <span class="tpc-potential-lbl">POT</span>
                    </div>
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

    if (key === 'massage') {
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
    } else {
        mp.attributes[key] = Math.min(99, mp.attributes[key] + 1);
        mp.lastTrainingDate = getTodayString();
        showNotification(`${key} getraind! Nu op ${mp.attributes[key]}`, 'success');
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

function updateMatchTimer() {
    const remaining = gameState.nextMatch.time - Date.now();

    // Update new kantine board timer segments
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    if (hoursEl && minutesEl && secondsEl) {
        if (remaining <= 0) {
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            // Add ready class to play button
            const playBtn = document.getElementById('play-match-btn');
            if (playBtn) playBtn.classList.add('match-ready');
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
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
                    <span>Overall: ${player.overall}</span>
                    <span>Potentieel: ${player.potential}</span>
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

    modal.classList.add('active');
}

function listPlayerOnTransferMarket(playerId, price) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];

    if (confirm(`Wil je ${player.name} op de transfermarkt zetten voor ${formatCurrency(price)}?`)) {
        // Remove from squad
        gameState.players.splice(playerIndex, 1);

        // Add to transfer market with set price
        player.price = price;
        player.listedByPlayer = true;
        gameState.transferMarket.players.push(player);

        // Close modal and refresh
        document.getElementById('player-modal').classList.remove('active');
        renderPlayerCards();
        alert(`${player.name} staat nu op de transfermarkt voor ${formatCurrency(price)}!`);
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

    // Render page-specific content
    if (page === 'squad') renderPlayerCards();
    if (page === 'tactics') renderTacticsPage();
    if (page === 'training') renderTrainingPage();
    if (page === 'stadium') renderStadiumPage();
    if (page === 'scout') renderScoutPage();
    if (page === 'transfers') renderTransferMarket();
    if (page === 'finances') renderDailyFinances();
    if (page === 'sponsors') renderSponsorsPage();
    if (page === 'activities') renderActivitiesPage();
    if (page === 'staff') renderStaffCenterPage();
    if (page === 'mijnspeler') {
        renderMijnSpelerPage();
        initMijnSpelerTabs();
        // Render active tab content
        const activeTab = document.querySelector('.msp-tab.active');
        if (activeTab) {
            const tab = activeTab.dataset.mspTab;
            if (tab === 'speler') renderSpelersPrestaties();
            else if (tab === 'manager') renderManagersPrestaties();
        }
    }
    if (page === 'mijnteam') renderMijnTeamPage();
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
    let tabSelector, panelPrefix;

    if (page === 'tactics') {
        tabSelector = '.tactics-tab';
        panelPrefix = '';
        // Find and click the tab
        const tabBtn = document.querySelector(`${tabSelector}[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'training') {
        tabSelector = '.training-tab';
        // Find and click the tab
        const tabBtn = document.querySelector(`${tabSelector}[data-training-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'staff') {
        tabSelector = '.staff-tab';
        // Find and click the tab
        const tabBtn = document.querySelector(`${tabSelector}[data-staff-tab="${tab}"]`);
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

function renderTransferMarket() {
    const container = document.getElementById('transfer-list');
    if (!container) return;

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

            // Potential stars with uncertainty: known (yellow) + uncertain (dark)
            const realStars = potentialToStarsGlobal(player.potential || player.overall);
            const knownStars = Math.max(1, realStars - 1); // 1 star uncertainty
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
            const playerId = parseFloat(btn.dataset.playerId);
            handleTransferBuy(playerId, false);
        });
    });

    // Add premium (one div above) handlers
    document.querySelectorAll('.pc-min-premium').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = parseFloat(el.dataset.playerId);
            handleTransferBuy(playerId, true);
        });
    });
}

function handleTransferBuy(playerId, isPremium = false) {
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
        gameState.club.budget -= totalCost;
        gameState.players.push(player);
        gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== playerId);

        updateBudgetDisplays();
        renderTransferMarket();
        alert(`${player.name} is toegevoegd aan je selectie!`);
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

function initAdvancedTactics() {
    // Toggles
    document.getElementById('tactic-keeper-pressure')?.addEventListener('change', (e) => {
        gameState.advancedTactics.keeperPressure = e.target.checked;
    });

    document.getElementById('tactic-set-pieces')?.addEventListener('change', (e) => {
        gameState.advancedTactics.forceSetPieces = e.target.checked;
    });

    // Choice buttons (both old .choice-btn and new .choice-btn-sm)
    document.querySelectorAll('.choice-btn, .choice-btn-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            const choice = btn.dataset.choice;
            // Find parent group - works for both old and new layouts
            const group = btn.closest('.tactic-choice-group') || btn.closest('.choice-btns');
            group.querySelectorAll('.choice-btn, .choice-btn-sm').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (choice.startsWith('fullback-')) {
                gameState.advancedTactics.fullbackRuns = choice.replace('fullback-', '');
            } else if (choice.startsWith('marking-')) {
                gameState.advancedTactics.marking = choice.replace('marking-', '');
                updateMarkingExplanation();
            }
        });
    });

    // Sliders
    const attackDefenseSlider = document.getElementById('tactic-attack-defense');
    const intensitySlider = document.getElementById('tactic-intensity');

    attackDefenseSlider?.addEventListener('input', (e) => {
        gameState.advancedTactics.attackDefense = parseInt(e.target.value);
        updateSliderLabels();
    });

    intensitySlider?.addEventListener('input', (e) => {
        gameState.advancedTactics.duelIntensity = parseInt(e.target.value);
        updateSliderLabels();
    });

    updateSliderLabels();
}

function updateMarkingExplanation() {
    const explanation = document.getElementById('marking-explanation');
    if (!explanation) return;

    if (gameState.advancedTactics.marking === 'zone') {
        explanation.innerHTML = '<p>Zone: Spelers dekken gebieden. Beter tegen teams met veel balbezit.</p>';
    } else {
        explanation.innerHTML = '<p>Man: Spelers volgen tegenstanders. Beter tegen individuele kwaliteit.</p>';
    }
}

function updateSliderLabels() {
    const attackDefenseValue = document.getElementById('attack-defense-value');
    const intensityValue = document.getElementById('intensity-value');

    if (attackDefenseValue) {
        const val = gameState.advancedTactics.attackDefense;
        if (val < 25) attackDefenseValue.textContent = 'Zeer Verdedigend';
        else if (val < 40) attackDefenseValue.textContent = 'Verdedigend';
        else if (val < 60) attackDefenseValue.textContent = 'Gebalanceerd';
        else if (val < 75) attackDefenseValue.textContent = 'Aanvallend';
        else attackDefenseValue.textContent = 'Zeer Aanvallend';
    }

    if (intensityValue) {
        const val = gameState.advancedTactics.duelIntensity;
        if (val < 25) intensityValue.textContent = 'Voorzichtig';
        else if (val < 40) intensityValue.textContent = 'Rustig';
        else if (val < 60) intensityValue.textContent = 'Normaal';
        else if (val < 75) intensityValue.textContent = 'Intens';
        else intensityValue.textContent = 'Agressief';
    }
}

// ================================================
// TACTICS TABS & LINEUP BUILDER
// ================================================

function initTacticsTabs() {
    const tabs = document.querySelectorAll('.tactics-tab');
    const panels = document.querySelectorAll('.tactics-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update tab active states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panel visibility
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetTab}-panel`) {
                    panel.classList.add('active');
                }
            });

            // Initialize lineup when opstelling tab is opened
            if (targetTab === 'opstelling') {
                renderLineupPitch();
                renderAvailablePlayers();
                updateLineupFit();
            }

            // Initialize specialists when specialisten tab is opened
            if (targetTab === 'specialisten') {
                initSpecialists();
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
    const player = gameState.players.find(p => p.id === parseFloat(draggedPlayerId));

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
// MIJN TEAM PAGE
// ================================================

function renderMijnTeamPage() {
    const nameInput = document.getElementById('team-name-input');
    const primaryColor = document.getElementById('team-primary-color');
    const secondaryColor = document.getElementById('team-secondary-color');
    const accentColor = document.getElementById('team-accent-color');
    const saveBtn = document.getElementById('save-team-btn');
    const settingsNotice = document.getElementById('settings-notice');
    const settingsLocked = document.getElementById('settings-locked');

    // Set current values
    if (nameInput) nameInput.value = gameState.club.name;
    if (primaryColor) primaryColor.value = gameState.club.colors.primary;
    if (secondaryColor) secondaryColor.value = gameState.club.colors.secondary;
    if (accentColor) accentColor.value = gameState.club.colors.accent;

    // Check if settings are locked this season
    const isLocked = gameState.club.settingsChangedThisSeason;
    if (settingsNotice) settingsNotice.style.display = isLocked ? 'none' : 'flex';
    if (settingsLocked) settingsLocked.style.display = isLocked ? 'flex' : 'none';
    if (nameInput) nameInput.disabled = isLocked;
    if (primaryColor) primaryColor.disabled = isLocked;
    if (secondaryColor) secondaryColor.disabled = isLocked;
    if (accentColor) accentColor.disabled = isLocked;
    if (saveBtn) saveBtn.disabled = isLocked;

    // Update badge preview
    updateMijnTeamBadgePreview();

    // Update kit preview
    updateKitPreview();

    // Update club stats
    updateClubStats();

    // Render scouting network options
    renderScoutingNetworkOptions();

    // Render achievements
    renderAchievementsSection();

    // Init event listeners
    initMijnTeamListeners();
    initAchievementsToggle();
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

function renderJeugdteamPage() {
    // Generate initial youth players if empty
    if (gameState.youthPlayers.length === 0) {
        generateInitialYouthPlayers();
    }

    // Update stats
    updateYouthStats();

    // Render current age group
    renderYouthPlayers(currentYouthAgeGroup);

    // Init tab listeners
    initYouthTabListeners();
}

function generateInitialYouthPlayers() {
    // Generate 3-5 players per age group
    // Star allocation: pupillen 1x3★, junioren 1x2★, aspiranten 1x2★, rest 1★
    const ageGroups = [
        { min: 12, max: 13, count: random(3, 5), topStars: 3 },
        { min: 14, max: 15, count: random(3, 5), topStars: 2 },
        { min: 16, max: 17, count: random(2, 4), topStars: 2 }
    ];

    ageGroups.forEach(group => {
        const groupPlayers = [];
        for (let i = 0; i < group.count; i++) {
            const player = generateYouthPlayer(group.min, group.max);
            player.potentialStars = 1;
            groupPlayers.push(player);
        }
        // Assign top stars to the best player in this group
        groupPlayers.sort((a, b) => b.potential - a.potential);
        if (groupPlayers.length > 0) {
            groupPlayers[0].potentialStars = group.topStars;
        }
        groupPlayers.forEach(p => gameState.youthPlayers.push(p));
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
    const youthCount = gameState.youthPlayers.length;
    const talentCount = gameState.youthPlayers.filter(p => p.isSupertalent).length;

    document.getElementById('youth-count').textContent = youthCount;
    document.getElementById('youth-talents').textContent = talentCount;
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

    // Sort by potential descending
    players.sort((a, b) => b.potential - a.potential);

    grid.innerHTML = players.map(player => createYouthPlayerCard(player)).join('');

    // Add contract button listeners
    grid.querySelectorAll('.btn-sign-contract').forEach(btn => {
        btn.addEventListener('click', () => {
            const playerId = parseFloat(btn.dataset.playerId);
            signYouthContract(playerId);
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
                <span class="pc-overall-label">Niv.</span>
            </div>
            <div class="yc-stars">
                <span class="pc-stars">${renderStarsHTML(stars)}</span>
            </div>
            <span class="yc-action">
                <button class="btn ${canSign ? 'btn-primary' : 'btn-secondary'} btn-sign-contract btn-sm"
                        data-player-id="${player.id}"
                        ${!canSign ? 'disabled' : ''}>
                    ${canSign ? 'Overhevelen naar Eerste Team' : 'Te jong voor het eerste team'}
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

    // Calculate salary based on potential and division
    const baseSalary = divData ? divData.salary.avg : 50;
    const potentialBonus = (youthPlayer.potential - 50) * 2;
    const salary = Math.max(divData?.salary.min || 25, Math.round(baseSalary * 0.5 + potentialBonus));

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
        potential: youthPlayer.potential,
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

    // Add to squad
    gameState.players.push(professionalPlayer);

    // Remove from youth team
    gameState.youthPlayers.splice(playerIndex, 1);

    // Re-render
    updateYouthStats();
    renderYouthPlayers(currentYouthAgeGroup);

    alert(`${youthPlayer.name} heeft een profcontract getekend en is toegevoegd aan de A-selectie!`);
}

// ================================================
// DAILY FINANCES
// ================================================

function calculateDailyFinances() {
    // === INCOME ===
    // Shirt + bord sponsor income (weekly divided by 7)
    const shirtSponsor = gameState.sponsor;
    const shirtWeekly = shirtSponsor?.weeklyPay || 0;
    const bordWeekly = gameState.sponsorSlots?.bord?.weeklyIncome || 0;
    const sponsorWeeklyIncome = shirtWeekly + bordWeekly;
    const sponsorDailyIncome = Math.round(sponsorWeeklyIncome / 7);

    // Sponsoring level bonus
    const sponsoringLevelIncome = STADIUM_UPGRADES.sponsoring.find(s => s.id === gameState.stadium.sponsoring)?.dailyIncome || 0;

    // Merchandise
    const merchIncome = gameState.stadium.fanshop.reduce((total, shopId) => {
        const shop = STADIUM_UPGRADES.fanshop.find(s => s.id === shopId);
        return total + (shop?.dailyIncome || 0);
    }, 0);

    // Kantine income
    const kantineConfig = STADIUM_TILE_CONFIG?.kantine?.levels.find(l => l.id === gameState.stadium.kantine);
    const kantineMatch = kantineConfig?.effect?.match(/€(\d+)/);
    const kantinePerMatch = kantineMatch ? parseInt(kantineMatch[1]) : 50;
    const kantineDaily = Math.round(kantinePerMatch / 7); // Average per day

    // === EXPENSES ===
    // Player salaries (weekly divided by 7)
    const playerSalaries = gameState.players.reduce((total, p) => total + (p.salary || 0), 0);
    const playerSalaryDaily = Math.round(playerSalaries / 7);

    // Staff salaries
    let staffSalaries = 0;
    if (gameState.staff?.fysio) staffSalaries += 100;
    if (gameState.staff?.scout) staffSalaries += 150;
    if (gameState.staff?.dokter) staffSalaries += 200;
    Object.values(gameState.assistantTrainers || {}).forEach(trainer => {
        if (trainer) staffSalaries += 75;
    });
    const staffSalaryDaily = Math.round(staffSalaries / 7);

    // Maintenance
    const maintenanceExpense = Math.round((STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune)?.maintenance || 0) / 7);

    // Totals
    const totalIncome = sponsorDailyIncome + sponsoringLevelIncome + merchIncome + kantineDaily;
    const totalExpense = playerSalaryDaily + staffSalaryDaily + maintenanceExpense;
    const dailyBalance = totalIncome - totalExpense;

    return {
        income: {
            sponsor: sponsorDailyIncome,
            sponsoringBonus: sponsoringLevelIncome,
            merch: merchIncome,
            kantine: kantineDaily
        },
        expense: {
            playerSalary: playerSalaryDaily,
            staffSalary: staffSalaryDaily,
            maintenance: maintenanceExpense
        },
        totalIncome,
        totalExpense,
        dailyBalance,
        tomorrowBalance: gameState.club.budget + dailyBalance,
        // Raw weekly values for display
        weeklyPlayerSalary: playerSalaries,
        weeklyStaffSalary: staffSalaries,
        weeklySponsor: sponsorWeeklyIncome
    };
}

function renderDailyFinances() {
    const finances = calculateDailyFinances();

    // Update current balance
    const currentBalanceEl = document.getElementById('current-balance');
    if (currentBalanceEl) {
        currentBalanceEl.textContent = formatCurrency(gameState.club.budget);
    }

    // Update tomorrow balance
    const tomorrowEl = document.getElementById('tomorrow-balance');
    if (tomorrowEl) {
        tomorrowEl.textContent = formatCurrency(finances.tomorrowBalance);
    }

    // Update income column
    const totalIncomeEl = document.getElementById('total-income');
    if (totalIncomeEl) {
        totalIncomeEl.textContent = `+${formatCurrency(finances.totalIncome)}`;
    }

    const incomeBreakdown = document.getElementById('income-breakdown');
    if (incomeBreakdown) {
        incomeBreakdown.innerHTML = `
            <li><span>Shirtsponsor</span><span>+${formatCurrency(finances.income.sponsor)}</span></li>
            <li><span>Sponsoring Niveau</span><span>+${formatCurrency(finances.income.sponsoringBonus)}</span></li>
            <li><span>Merchandise</span><span>+${formatCurrency(finances.income.merch)}</span></li>
            <li><span>Kantine</span><span>+${formatCurrency(finances.income.kantine)}</span></li>
        `;
    }

    // Update expense column
    const totalExpenseEl = document.getElementById('total-expense');
    if (totalExpenseEl) {
        totalExpenseEl.textContent = `-${formatCurrency(finances.totalExpense)}`;
    }

    const expenseBreakdown = document.getElementById('expense-breakdown');
    if (expenseBreakdown) {
        expenseBreakdown.innerHTML = `
            <li><span>Spelerssalarissen</span><span>-${formatCurrency(finances.expense.playerSalary)}</span></li>
            <li><span>Stafsalarissen</span><span>-${formatCurrency(finances.expense.staffSalary)}</span></li>
            <li><span>Onderhoud</span><span>-${formatCurrency(finances.expense.maintenance)}</span></li>
        `;
    }

    // Update profit column
    const totalProfitEl = document.getElementById('total-profit');
    if (totalProfitEl) {
        const profitClass = finances.dailyBalance >= 0 ? 'profit' : 'loss';
        totalProfitEl.textContent = (finances.dailyBalance >= 0 ? '+' : '') + formatCurrency(finances.dailyBalance);
        totalProfitEl.className = `finance-total ${profitClass}`;
    }

    const dailyProfitEl = document.getElementById('daily-profit');
    const weeklyProfitEl = document.getElementById('weekly-profit');
    const monthlyProfitEl = document.getElementById('monthly-profit');

    if (dailyProfitEl) {
        dailyProfitEl.textContent = (finances.dailyBalance >= 0 ? '+' : '') + formatCurrency(finances.dailyBalance);
        dailyProfitEl.className = `period-value ${finances.dailyBalance >= 0 ? 'positive' : 'negative'}`;
    }
    if (weeklyProfitEl) {
        const weeklyProfit = finances.dailyBalance * 7;
        weeklyProfitEl.textContent = (weeklyProfit >= 0 ? '+' : '') + formatCurrency(weeklyProfit);
        weeklyProfitEl.className = `period-value ${weeklyProfit >= 0 ? 'positive' : 'negative'}`;
    }
    if (monthlyProfitEl) {
        const monthlyProfit = finances.dailyBalance * 30;
        monthlyProfitEl.textContent = (monthlyProfit >= 0 ? '+' : '') + formatCurrency(monthlyProfit);
        monthlyProfitEl.className = `period-value ${monthlyProfit >= 0 ? 'positive' : 'negative'}`;
    }

    // Update bottom balance
    const balanceBottomEl = document.getElementById('current-balance-bottom');
    if (balanceBottomEl) {
        balanceBottomEl.textContent = formatCurrency(gameState.club.budget);
    }

    const balanceChangeEl = document.getElementById('balance-change');
    if (balanceChangeEl) {
        const changeText = (finances.dailyBalance >= 0 ? '+' : '') + formatCurrency(finances.dailyBalance) + ' vandaag';
        balanceChangeEl.textContent = changeText;
        balanceChangeEl.className = `balance-change ${finances.dailyBalance >= 0 ? 'positive' : 'negative'}`;
    }

    // Update season prediction (34 weeks remaining - simplified calculation)
    const weeksRemaining = 34 - gameState.week;
    const weeklyBalance = finances.dailyBalance * 7;
    const seasonIncome = finances.totalIncome * 7 * weeksRemaining;
    const seasonExpense = finances.totalExpense * 7 * weeksRemaining;
    const seasonEndBalance = gameState.club.budget + (weeklyBalance * weeksRemaining);

    const seasonEndEl = document.getElementById('season-end-estimate');
    if (seasonEndEl) {
        seasonEndEl.textContent = formatCurrency(Math.round(seasonEndBalance));
    }

    const seasonIncomeEl = document.getElementById('season-income');
    if (seasonIncomeEl) {
        seasonIncomeEl.textContent = '+' + formatCurrency(Math.round(seasonIncome));
    }

    const seasonExpenseEl = document.getElementById('season-expense');
    if (seasonExpenseEl) {
        seasonExpenseEl.textContent = '-' + formatCurrency(Math.round(seasonExpense));
    }

    const predSubtitleEl = document.querySelector('.prediction-subtitle');
    if (predSubtitleEl) {
        predSubtitleEl.textContent = `Over ${weeksRemaining} weken`;
    }
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
            player.potential = player.overall + random(0, 2);
        }
    });
}

function initGame() {
    // Check for existing save
    const savedState = loadGame();

    if (savedState) {
        // Load saved game
        replaceGameState(savedState);
        console.log('📂 Save file loaded!');

        // Calculate and apply offline progress (silently)
        const offlineProgress = calculateOfflineProgress(gameState);
        if (offlineProgress && offlineProgress.hoursAway >= 1) {
            applyOfflineProgress(gameState, offlineProgress);
        }
    } else {
        // New game - generate initial data
        gameState.players = generateSquad(gameState.club.division);
        gameState.standings = generateNewStandings(gameState.club.name, gameState.club.division);
        gameState.achievements = initAchievements();
    }

    // Migrate existing players: ensure 90% Dutch nationality + zaterdagvoetbal stats
    migratePlayersToZaterdag();

    // Migrate youth players: assign potentialStars if missing
    if (gameState.youthPlayers && gameState.youthPlayers.length > 0) {
        const needsMigration = gameState.youthPlayers.some(p => p.potentialStars === undefined);
        if (needsMigration) {
            // Group by age category and assign stars
            const groups = { '12-13': [], '14-15': [], '16-17': [] };
            gameState.youthPlayers.forEach(p => {
                p.potentialStars = p.potentialStars || 1;
                if (p.age <= 13) groups['12-13'].push(p);
                else if (p.age <= 15) groups['14-15'].push(p);
                else groups['16-17'].push(p);
            });
            const starAlloc = { '12-13': 3, '14-15': 2, '16-17': 2 };
            Object.entries(groups).forEach(([key, players]) => {
                if (players.length > 0) {
                    players.sort((a, b) => b.potential - a.potential);
                    players[0].potentialStars = starAlloc[key];
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
    initAdvancedTactics();
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
        setTimeout(() => {
            newAchievements.forEach((achievement, index) => {
                setTimeout(() => {
                    showAchievementUnlocked(achievement);
                }, index * 1500);
            });
        }, 2000);
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
    if (globalManagerTitle) globalManagerTitle.textContent = managerInfo.title;
    if (globalManagerLevel) globalManagerLevel.textContent = managerInfo.level;

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
    const finances = calculateDailyFinances();
    const daily = finances.dailyBalance;
    const dailySign = daily >= 0 ? '+' : '';
    const dailyColor = daily >= 0 ? 'var(--accent-green)' : '#c62828';
    const trendArrow = daily >= 0 ? '↑' : '↓';

    // Weekly totals
    const weeklyIn = finances.totalIncome * 7;
    const weeklyOut = finances.totalExpense * 7;

    container.innerHTML = `
        <div class="fin-budget">
            <span class="fin-label">Saldo</span>
            <span class="fin-amount">${formatCurrency(budget)}</span>
            <span class="fin-daily" style="color: ${dailyColor}">${trendArrow} ${dailySign}${formatCurrency(daily)}/dag</span>
        </div>
        <div class="fin-breakdown">
            <div class="fin-row fin-income">
                <span class="fin-row-label">Inkomsten /wk</span>
                <span class="fin-row-val" style="color: var(--accent-green)">+${formatCurrency(weeklyIn)}</span>
            </div>
            <div class="fin-row fin-expense">
                <span class="fin-row-label">Uitgaven /wk</span>
                <span class="fin-row-val" style="color: #c62828">-${formatCurrency(weeklyOut)}</span>
            </div>
        </div>
    `;
}

function renderDashboardTopPlayers() {
    const container = document.getElementById('dashboard-toptalents');
    if (!container) return;

    // Get youth players sorted by potential
    const topTalents = [...(gameState.youthPlayers || [])]
        .sort((a, b) => (b.potential || 0) - (a.potential || 0))
        .slice(0, 3);

    if (topTalents.length === 0) {
        container.innerHTML = '<p style="font-size: 0.6rem; color: var(--text-muted); text-align: center; padding: 6px;">Upgrade jeugdacademie</p>';
        return;
    }

    container.innerHTML = topTalents.map((player) => {
        const starCount = player.isMyPlayer
            ? potentialToStarsGlobal(99)
            : (player.overall >= 25 ? 2 : 1);
        const starsHtml = renderStarsHTML(starCount);
        const posData = POSITIONS[player.position] || { color: '#1a5f2a', abbr: '?' };
        return `
            <div class="tt-item">
                <span class="tt-flag">${player.nationality?.flag || '🇳🇱'}</span>
                <div class="tt-info">
                    <span class="tt-name">${player.name}</span>
                    <span class="tt-age">${player.age} jaar</span>
                </div>
                <span class="tt-pos" style="background: ${posData.color}">${posData.abbr}</span>
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
    const playBtn = document.getElementById('play-match-btn');
    if (playBtn) {
        playBtn.addEventListener('click', playMatch);
    }
}

function playMatch() {
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

    // Award XP
    awardXP(gameState, resultType === 'win' ? 'matchWin' : resultType === 'draw' ? 'matchDraw' : 'matchLoss');
    if (opponentScore === 0) awardXP(gameState, 'cleanSheet');
    awardXP(gameState, 'goalScored', playerScore * 5);

    // Store last match
    gameState.lastMatch = {
        ...result,
        isHome,
        playerScore,
        opponentScore,
        resultType,
        opponent: opponent.name
    };

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
        events: result.events.filter(e =>
            ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'penalty_miss'].includes(e.type)
        ),
        possession: result.possession,
        shots: result.shots,
        shotsOnTarget: result.shotsOnTarget,
        manOfTheMatch: result.manOfTheMatch
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
        setTimeout(() => {
            newAchievements.forEach((achievement, index) => {
                setTimeout(() => {
                    showAchievementUnlocked(achievement);
                }, index * 1500);
            });
        }, 3000);
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
    }
    if (result.position === 6) {
        gameState.stats.relegationEscapes++;
    }
    if (result.isChampion) {
        awardXP(gameState, 'title');
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
    renderMatchProgram();
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

    const eventIcons = {
        'goal': '⚽', 'own_goal': '⚽', 'yellow_card': '🟨', 'red_card': '🟥',
        'substitution': '🔄', 'injury': '🤕', 'penalty': '⚽', 'penalty_miss': '❌'
    };

    const importantEvents = match.events.filter(e =>
        ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'penalty_miss'].includes(e.type)
    );

    const possHome = isHome ? match.possession.home : match.possession.away;
    const possAway = isHome ? match.possession.away : match.possession.home;
    const shotsHome = isHome ? match.shots.home : match.shots.away;
    const shotsAway = isHome ? match.shots.away : match.shots.home;
    const sotHome = isHome ? match.shotsOnTarget.home : match.shotsOnTarget.away;
    const sotAway = isHome ? match.shotsOnTarget.away : match.shotsOnTarget.home;

    container.innerHTML = `
        <div class="match-report-container">
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

            ${match.manOfTheMatch ? `
                <div class="match-result-motm">
                    <div class="match-result-motm-star">&#11088;</div>
                    <div class="match-result-motm-info">
                        <span class="match-result-motm-label">Man of the Match</span>
                        <span class="match-result-motm-name">${match.manOfTheMatch.name}</span>
                        ${match.manOfTheMatch.rating ? `<span class="match-result-motm-rating">${match.manOfTheMatch.rating.toFixed(1)}</span>` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderMatchProgram() {
    const container = document.getElementById('matches-programma');
    if (!container || !gameState.standings || gameState.standings.length === 0) {
        if (container) container.innerHTML = '<p>Geen competitieschema beschikbaar.</p>';
        return;
    }

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

function showAchievementUnlocked(achievement) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-info">
            <span class="achievement-label">Prestatie ontgrendeld!</span>
            <span class="achievement-name">${achievement.name}</span>
            ${achievement.reward?.cash ? `<span class="achievement-reward">+${formatCurrency(achievement.reward.cash)}</span>` : ''}
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
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
    newAchievements.forEach((achievement, index) => {
        setTimeout(() => showAchievementUnlocked(achievement), index * 1500);
    });

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
        icon: '🥖'
    },
    balanced: {
        name: 'Café Het Gouden Paard',
        tagline: 'Soms is het druk, soms niet',
        description: 'Gezellig kroegje met een gokkast achter. Winnen levert bonusrondes op.',
        matchIncome: 300,
        winBonus: 250,
        icon: '🍺'
    },
    risky: {
        name: 'Casino Jackpot Jansen',
        tagline: 'Alles of niks, net als roulette',
        description: 'Betaalt bijna niks, tenzij je wint. Dan regent het munten.',
        matchIncome: 100,
        winBonus: 600,
        icon: '🎰'
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

    // Store full sponsor object with weeklyPay calculated
    gameState.sponsor = {
        id: sponsorId,
        name: sponsor.name,
        matchIncome: sponsor.matchIncome,
        winBonus: sponsor.winBonus,
        weeklyPay: sponsor.matchIncome, // One match per week
        icon: sponsor.icon
    };

    // Update UI
    updateSponsorKitDisplay();

    // Mark selected block (v2 layout)
    document.querySelectorAll('.sponsor-block').forEach(block => {
        block.classList.remove('active');
    });
    const selectedBlock = document.querySelector(`.sponsor-block[data-sponsor="${sponsorId}"]`);
    if (selectedBlock) {
        selectedBlock.classList.add('active');
    }

    // Also support old layout
    document.querySelectorAll('.sponsor-card-compact').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`.sponsor-card-compact[data-sponsor="${sponsorId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }

    showNotification(`${sponsor.name} is nu je shirtsponsor!`, 'success');
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
        // Split sponsor name across two lines
        const words = gameState.sponsor.name.split(' ');
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
    const bord = gameState.sponsorSlots?.bord;
    if (bord && bord.weeksRemaining != null && bord.weeksRemaining <= 0) {
        showNotification(`Contract met ${bord.name} is afgelopen.`, 'info');
        gameState.sponsorSlots.bord = null;
        saveGame();
    }
}

function tickSponsorContracts() {
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

    container.innerHTML = Object.entries(SPONSORS).map(([id, s]) => `
        <div class="sponsor-block ${gameState.sponsor?.id === id ? 'active' : ''}" data-sponsor="${id}" onclick="selectSponsor('${id}')">
            <div class="sb-icon">${s.icon}</div>
            <div class="sb-name">${s.name}</div>
            <div class="sb-stats">
                <span class="sb-pay">€${s.matchIncome}/wed</span>
                <span class="sb-bonus">+€${s.winBonus} win</span>
            </div>
        </div>
    `).join('');
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

    container.innerHTML = offers.map(offer => `
        <div class="sponsor-market-offer" onclick="selectMarketSponsor('${offer.id}')">
            <span class="smo-slot-badge smo-slot-bord">📋 Bordsponsor</span>
            <div class="smo-icon">${offer.icon}</div>
            <div class="smo-name">${offer.name}</div>
            <div class="smo-details">
                <span class="smo-income">€${offer.weeklyIncome}/week</span>
                <span class="smo-duration">${offer.duration} weken</span>
            </div>
        </div>
    `).join('');
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

    const shirtData = gameState.sponsor ? { name: gameState.sponsor.name, weeklyIncome: gameState.sponsor.weeklyPay } : null;
    const bordData = gameState.sponsorSlots?.bord || null;

    function slotTile(label, data, key) {
        if (data) {
            const weeksInfo = data.weeksRemaining != null ? `<span class="spo-weeks">${data.weeksRemaining}w resterend</span>` : '';
            const clearBtn = key !== 'shirt' ? `<button class="spo-clear" onclick="clearSponsorSlot('${key}')" title="Verwijderen">✕</button>` : '';
            return `<div class="spo-tile filled">
                <div class="spo-tile-header">
                    <span class="spo-label">${label}</span>
                    ${clearBtn}
                </div>
                <span class="spo-name">${data.name}</span>
                <div class="spo-tile-footer">
                    <span class="spo-income">€${data.weeklyIncome}/w</span>
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

    const overviewContent = document.getElementById('sponsor-overview-content');
    if (overviewContent) {
        overviewContent.innerHTML = `
            <div class="spo-tiles">
                ${slotTile('👕 Shirtsponsor', shirtData, 'shirt')}
                ${slotTile('📋 Bordsponsor', bordData, 'bord')}
            </div>
            <div class="spo-total">
                <span>Totaal per week</span>
                <span>€${totalWeekly}</span>
            </div>
        `;
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

// ================================================
// ACTIVITIES SYSTEM
// ================================================

const ACTIVITIES = {
    trainingcamp: {
        name: 'Trainingskamp',
        cost: 2500,
        effect: 'fitness',
        value: 2
    },
    teamparty: {
        name: 'Teamuitje',
        cost: 1000,
        effect: 'chemistry',
        value: 10
    },
    tactical: {
        name: 'Tactische Sessie',
        cost: 500,
        effect: 'tactics',
        value: 5
    }
};

function startActivity(activityId) {
    const activity = ACTIVITIES[activityId];
    if (!activity) return;

    if (gameState.club.budget < activity.cost) {
        showNotification('Niet genoeg budget voor deze activiteit!', 'error');
        return;
    }

    gameState.club.budget -= activity.cost;

    // Apply effect based on activity type
    if (activity.effect === 'fitness') {
        gameState.players.forEach(player => {
            if (player.attributes.FYS) {
                player.attributes.FYS = Math.min(99, player.attributes.FYS + activity.value);
            }
        });
        showNotification(`Trainingskamp afgerond! Alle spelers +${activity.value} FYS`, 'success');
    } else if (activity.effect === 'chemistry') {
        gameState.teamChemistry = (gameState.teamChemistry || 50) + activity.value;
        showNotification(`Teamuitje geslaagd! +${activity.value}% teamchemie`, 'success');
    } else if (activity.effect === 'tactics') {
        gameState.nextMatchBonus = (gameState.nextMatchBonus || 0) + activity.value;
        showNotification(`Tactische sessie gedaan! +${activity.value}% volgende wedstrijd`, 'success');
    }

    updateUI();
}

function renderActivitiesPage() {
    // Update costs display based on current budget
    document.querySelectorAll('.activity-card').forEach(card => {
        const activityId = card.dataset.activity;
        const activity = ACTIVITIES[activityId];
        if (activity) {
            const costEl = card.querySelector('.activity-cost');
            if (costEl) {
                costEl.textContent = formatCurrency(activity.cost);
            }
            // Disable if not enough budget
            const btn = card.querySelector('.activity-btn');
            if (btn) {
                if (gameState.club.budget < activity.cost) {
                    btn.disabled = true;
                    btn.textContent = 'Te weinig budget';
                } else {
                    btn.disabled = false;
                    btn.textContent = 'Uitvoeren';
                }
            }
        }
    });
}

window.startActivity = startActivity;

// ================================================
// STAFF CENTER PAGE
// ================================================

const STAFF_TRAINERS = [
    { id: 'tr_keeper', name: 'Keeperstrainer', icon: '🧤', cost: 3000, salary: 200, effect: 'Train keepers', position: 'keeper' },
    { id: 'tr_verdediging', name: 'Verdedigingstrainer', icon: '🛡️', cost: 3000, salary: 200, effect: 'Train verdedigers', position: 'verdediging' },
    { id: 'tr_middenveld', name: 'Middenveldtrainer', icon: '⚙️', cost: 3000, salary: 200, effect: 'Train middenvelders', position: 'middenveld' },
    { id: 'tr_aanval', name: 'Aanvalstrainer', icon: '⚽', cost: 3000, salary: 200, effect: 'Train aanvallers', position: 'aanval' },
    { id: 'tr_conditie', name: 'Conditietrainer', icon: '💪', cost: 4000, salary: 300, effect: '+10% fitness hele team', position: 'conditie' }
];

const STAFF_MEDISCH = [
    { id: 'st_assistent', name: 'Assistent Manager', icon: '👔', cost: 5000, salary: 400, effect: '+5% team prestatie' },
    { id: 'st_fysio', name: 'Fysiotherapeut', icon: '🏥', cost: 4000, salary: 300, effect: 'Sneller blessure herstel' },
    { id: 'st_arts', name: 'Clubarts', icon: '⚕️', cost: 8000, salary: 500, effect: 'Minder blessures' },
    { id: 'st_mascotte', name: 'Mascotte', icon: '🦁', cost: 2000, salary: 100, effect: '+5% thuisvoordeel' }
];

// Direct hire scout from scout page
window.hireScoutDirect = function() {
    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };
    if (!gameState.hiredStaff.medisch) gameState.hiredStaff.medisch = [];

    if (gameState.hiredStaff.medisch.includes('st_scout')) {
        showNotification('Je hebt al een scout!', 'info');
        return;
    }

    if (gameState.club.budget < 1) {
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    gameState.club.budget -= 1;
    gameState.hiredStaff.medisch.push('st_scout');
    updateBudgetDisplays();
    renderScoutPage();
    saveGame();
    showNotification('Scout aangenomen! Je kunt nu scouten.', 'success');
};

function renderStaffPage() {
    // Unified staff view - no tabs needed
    renderTrainersStaff();
    renderMedischStaff();
}

function renderTrainersStaff() {
    const container = document.getElementById('trainers-staff-grid');
    if (!container) return;

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };

    let html = '';
    STAFF_TRAINERS.forEach(staff => {
        const isHired = gameState.hiredStaff.trainers?.includes(staff.id);
        html += createStaffCard(staff, isHired, 'trainers');
    });
    container.innerHTML = html;
}

function renderMedischStaff() {
    const container = document.getElementById('medisch-staff-grid');
    if (!container) return;

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };

    let html = '';
    STAFF_MEDISCH.forEach(staff => {
        const isHired = gameState.hiredStaff.medisch?.includes(staff.id);
        html += createStaffCard(staff, isHired, 'medisch');
    });
    container.innerHTML = html;
}

function createStaffCard(staff, isHired, category) {
    return `
        <div class="staff-hire-card ${isHired ? 'hired' : ''}">
            <div class="shc-icon">${staff.icon}</div>
            <div class="shc-name">${staff.name}</div>
            <div class="shc-desc">${staff.effect}</div>
            ${isHired ? `
                <div class="shc-status">✓ In dienst</div>
                <div class="shc-cost">€${staff.salary}/week</div>
            ` : `
                <div class="shc-cost">€${staff.cost}</div>
                <button class="btn btn-sm btn-primary" onclick="hireStaff('${category}', '${staff.id}', ${staff.cost})">
                    Aannemen
                </button>
            `}
        </div>
    `;
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
    if (gameState.club.budget < cost) {
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };
    if (!gameState.hiredStaff[category]) gameState.hiredStaff[category] = [];

    if (!gameState.hiredStaff[category].includes(staffId)) {
        gameState.hiredStaff[category].push(staffId);
        gameState.club.budget -= cost;
        updateBudgetDisplays();
        renderStaffPage();
        saveGame();
        showNotification('Stafmedewerker aangenomen!', 'success');
    }
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
    const cornerSelect = document.getElementById('corner-taker');
    const penaltySelect = document.getElementById('penalty-taker');
    const freekickSelect = document.getElementById('freekick-taker');
    const captainSelect = document.getElementById('captain-select');

    if (!cornerSelect || !penaltySelect || !freekickSelect || !captainSelect) return;

    // Get all players for selection
    const allPlayers = gameState.players.filter(p => !p.injured);

    // Sort by position for better organization
    const sortedPlayers = [...allPlayers].sort((a, b) => {
        const posOrder = { K: 1, V: 2, M: 3, A: 4 };
        return (posOrder[a.position] || 5) - (posOrder[b.position] || 5);
    });

    // Generate options HTML
    const generateOptions = (players, selectedId) => {
        let html = '<option value="">-- Selecteer speler --</option>';
        players.forEach(player => {
            const selected = player.id === selectedId ? 'selected' : '';
            const posLabel = { K: 'Keeper', V: 'Verdediger', M: 'Middenvelder', A: 'Aanvaller' }[player.position] || player.position;
            html += `<option value="${player.id}" ${selected}>${player.name} (${posLabel} - ${player.overall})</option>`;
        });
        return html;
    };

    // Initialize specialists object if not exists
    if (!gameState.specialists) {
        gameState.specialists = {
            cornerTaker: null,
            penaltyTaker: null,
            freekickTaker: null,
            captain: null
        };
    }

    // Populate selects
    cornerSelect.innerHTML = generateOptions(sortedPlayers, gameState.specialists.cornerTaker);
    penaltySelect.innerHTML = generateOptions(sortedPlayers, gameState.specialists.penaltyTaker);
    freekickSelect.innerHTML = generateOptions(sortedPlayers, gameState.specialists.freekickTaker);
    captainSelect.innerHTML = generateOptions(sortedPlayers, gameState.specialists.captain);

    // Add event listeners
    cornerSelect.onchange = (e) => {
        gameState.specialists.cornerTaker = e.target.value || null;
        showNotification('Cornernemer ingesteld', 'success');
    };

    penaltySelect.onchange = (e) => {
        gameState.specialists.penaltyTaker = e.target.value || null;
        showNotification('Strafschopnemer ingesteld', 'success');
    };

    freekickSelect.onchange = (e) => {
        gameState.specialists.freekickTaker = e.target.value || null;
        showNotification('Vrije trap nemer ingesteld', 'success');
    };

    captainSelect.onchange = (e) => {
        gameState.specialists.captain = e.target.value || null;
        showNotification('Aanvoerder ingesteld', 'success');
    };
}

// ================================================
// STADIUM TILES SYSTEM
// ================================================

function renderStadiumMap() {
    const container = document.getElementById('stadium-map');
    if (!container) return;

    const capacityEl = document.getElementById('stadium-capacity');
    if (capacityEl) capacityEl.textContent = gameState.stadium.capacity || 200;

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
    </defs>`;

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
    const levelColors = [['#5a3a1a','#8B6914'],['#2d6a2e','#4ade80'],['#1a4a8a','#60a5fa'],['#6a2a9a','#a855f7'],['#8a5a0a','#f59e0b']];
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
    svg += `<text x="${cx - 16}" y="${labelY}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Stadion</text>`;
    svg += `<rect x="${cx + 8}" y="${labelY - 10}" width="26" height="13" fill="${tColors[1]}" rx="6"/>`;
    svg += `<text x="${cx + 21}" y="${labelY - 1}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${tribuneLevel}</text>`;
    svg += `</g>`;

    // ===== GRASS (field) =====
    const grassLevel = getLevel('grass');
    const grassColorList = ['#3a7a3a','#3a8a3a','#2a9a2a','#1aaa1a'];
    const gc = grassColorList[Math.min(grassLevel, grassColorList.length-1)];
    const gColors = levelColors[Math.min(grassLevel, levelColors.length-1)];
    const isGrassActive = currentStadiumCategory === 'grass';

    svg += `<g class="stadium-building${isGrassActive ? ' active' : ''}" data-category="grass" onclick="selectStadiumCategory('tribune')">`;
    svg += `<rect x="${cx-fieldW/2}" y="${cy-fieldH/2}" width="${fieldW}" height="${fieldH}" fill="${gc}" stroke="white" stroke-width="1.5" rx="2"/>`;
    svg += `<rect x="${cx-fieldW/2+3}" y="${cy-fieldH/2+3}" width="${fieldW-6}" height="${fieldH-6}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<line x1="${cx}" y1="${cy-fieldH/2+3}" x2="${cx}" y2="${cy+fieldH/2-3}" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>`;
    svg += `<text x="${cx - 16}" y="${cy+fieldH/2-5}" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="7" font-weight="600" letter-spacing="1">Wedstrijdveld</text>`;
    svg += `<rect x="${cx + 22}" y="${cy+fieldH/2-13}" width="22" height="12" fill="${gColors[1]}" rx="6"/>`;
    svg += `<text x="${cx + 33}" y="${cy+fieldH/2-4}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${grassLevel+1}</text>`;
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
        // Goals
        svg += `<rect x="${x+2}" y="${y+h/2-5}" width="4" height="10" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="1"/>`;
        svg += `<rect x="${x+w-6}" y="${y+h/2-5}" width="4" height="10" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="1"/>`;
        if (level >= 1) {
            for (let c = 0; c < 3; c++) svg += `<circle cx="${x+14+c*12}" cy="${y+h-7}" r="2" fill="orange" opacity="0.4"/>`;
        }
        svg += `<text x="${x+w/2 - 14}" y="${y-6}" text-anchor="middle" fill="${lc[1]}" font-size="8" font-weight="bold">${icon} ${label}</text>`;
        svg += `<rect x="${x+w/2 + 6}" y="${y-16}" width="22" height="12" fill="${lc[1]}" rx="6"/>`;
        svg += `<text x="${x+w/2 + 17}" y="${y-7}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${level+1}</text>`;
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
    svg += `<rect x="${f1x+acadSmallW/2-4}" y="${f1y+1}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" rx="0.5"/>`;
    svg += `<rect x="${f1x+acadSmallW/2-4}" y="${f1y+acadSmallH-4}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" rx="0.5"/>`;
    // Field 2 (goals on short sides = top/bottom, midline horizontal)
    const f2x = acadX + acadSmallW + acadGap;
    svg += `<rect x="${f2x}" y="${f1y}" width="${acadSmallW}" height="${acadSmallH}" fill="${acFg}" stroke="${acColors[1]}" stroke-width="1.5" rx="4"/>`;
    svg += `<line x1="${f2x+2}" y1="${f1y+acadSmallH/2}" x2="${f2x+acadSmallW-2}" y2="${f1y+acadSmallH/2}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<circle cx="${f2x+acadSmallW/2}" cy="${f1y+acadSmallH/2}" r="5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`;
    svg += `<rect x="${f2x+acadSmallW/2-4}" y="${f1y+1}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" rx="0.5"/>`;
    svg += `<rect x="${f2x+acadSmallW/2-4}" y="${f1y+acadSmallH-4}" width="8" height="3" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" rx="0.5"/>`;
    // Label + level badge
    const acadCenterX = acadX + acadSmallW + acadGap/2;
    svg += `<text x="${acadCenterX - 14}" y="${f1y-6}" text-anchor="middle" fill="${acColors[1]}" font-size="8" font-weight="bold">Jeugd</text>`;
    svg += `<rect x="${acadCenterX + 6}" y="${f1y-16}" width="22" height="12" fill="${acColors[1]}" rx="6"/>`;
    svg += `<text x="${acadCenterX + 17}" y="${f1y-7}" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Nv${acadLevel+1}</text>`;
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
            svg += `<rect x="${bx+cbw-24}" y="${by+2}" width="24" height="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" rx="6"/>`;
            svg += `<text x="${bx+cbw-12}" y="${by+11}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="7" font-weight="bold">Nv0</text>`;
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
            { id: 'tribune_5', name: 'Stadion Tribune', capacity: 5000, cost: 100000, effect: '5.000 toeschouwers', reqCapacity: 1000 }
        ],
        stateKey: 'tribune'
    },
    grass: {
        description: 'Beter gras geeft je team een thuisvoordeel tijdens wedstrijden.',
        levels: [
            { id: 'grass_0', name: 'Basis Gras', cost: 0, effect: 'Geen bonus' },
            { id: 'grass_1', name: 'Onderhouden Gras', cost: 3000, effect: '+5% thuisvoordeel' },
            { id: 'grass_2', name: 'Professioneel Gras', cost: 8000, effect: '+10% thuisvoordeel', reqCapacity: 500 },
            { id: 'grass_3', name: 'Kunstgras', cost: 20000, effect: '+15% thuisvoordeel', reqCapacity: 1000 }
        ],
        stateKey: 'grass'
    },
    training: {
        description: 'Beter trainingsfaciliteiten zorgen ervoor dat spelers sneller verbeteren.',
        levels: [
            { id: 'train_1', name: 'Basisveld', cost: 0, effect: '+5% trainingssnelheid' },
            { id: 'train_2', name: 'Trainingsveld', cost: 5000, effect: '+10% trainingssnelheid' },
            { id: 'train_3', name: 'Modern Complex', cost: 15000, effect: '+20% trainingssnelheid', reqCapacity: 500 },
            { id: 'train_4', name: 'Elite Complex', cost: 40000, effect: '+30% trainingssnelheid', reqCapacity: 1000 }
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
            { id: 'med_4', name: 'Medisch Centrum', cost: 30000, effect: '-50% blessureduur', reqCapacity: 1000 }
        ],
        stateKey: 'medical'
    },
    academy: {
        description: 'Een betere jeugdopleiding produceert talentvoller spelers.',
        levels: [
            { id: 'acad_1', name: 'Jeugdelftal', cost: 0, effect: 'Basistalent (40-55)' },
            { id: 'acad_2', name: 'Jeugdopleiding', cost: 6000, effect: 'Beter talent (45-60)' },
            { id: 'acad_3', name: 'Voetbalschool', cost: 18000, effect: 'Goed talent (50-65)', reqCapacity: 500 },
            { id: 'acad_4', name: 'Topacademie', cost: 50000, effect: 'Toptalent (55-75)', reqCapacity: 1000 }
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
            { id: 'scout_4', name: 'Internationaal', cost: 35000, effect: 'Internationaal scouten', reqCapacity: 1000 }
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
            { id: 'ysct_4', name: 'Elite Scouts', cost: 40000, effect: 'Top jeugdtalent', reqCapacity: 1000 }
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
            { id: 'kantine_4', name: 'Horeca Complex', cost: 25000, effect: '€800 per wedstrijd', reqCapacity: 1000 }
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
            { id: 'sponsor_4', name: 'Hoofdsponsors', cost: 40000, effect: 'Top sponsordeals', reqCapacity: 1000 }
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
            { id: 'pers_4', name: 'Perscomplex', cost: 30000, effect: '+35% reputatie', reqCapacity: 1000 }
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
    const nextLevel = config.levels[currentIndex + 1];
    const isMaxed = !nextLevel;
    const totalLevels = config.levels.length;

    const currentCapacity = STADIUM_TILE_CONFIG.tribune.levels.find(
        l => l.id === gameState.stadium.tribune
    )?.capacity || 200;
    const hasRequirement = nextLevel?.reqCapacity && currentCapacity < nextLevel.reqCapacity;

    // Header
    document.getElementById('sup-icon').textContent = categoryIcons[category] || '🏟️';
    document.getElementById('sup-title').textContent = categoryNames[category] || category;
    document.getElementById('sup-level').textContent = `Niveau ${currentIndex + 1} van ${totalLevels} — ${currentLevel.name}`;

    // Current benefit
    document.getElementById('sup-current').innerHTML = `<strong>Nu:</strong> ${currentLevel.effect}`;

    // Next upgrade info
    const nextEl = document.getElementById('sup-next');
    const actionEl = document.getElementById('sup-action');

    if (isMaxed) {
        nextEl.innerHTML = '✅ Maximaal niveau bereikt!';
        nextEl.style.borderColor = 'rgba(76, 175, 80, 0.25)';
        nextEl.style.background = 'rgba(76, 175, 80, 0.1)';
        actionEl.innerHTML = '';
    } else {
        nextEl.style.borderColor = '';
        nextEl.style.background = '';
        nextEl.innerHTML = `<span class="sup-next-name">${nextLevel.name}</span> — ${nextLevel.effect}`;

        const canAfford = gameState.club.budget >= nextLevel.cost;
        let btnHtml = '';
        if (hasRequirement) {
            btnHtml = `<span class="sup-cost">${formatCurrency(nextLevel.cost)}</span>
                <button class="btn btn-primary btn-upgrade-stadium" disabled>
                    <span class="btn-icon">🔒</span><span class="btn-text">Stadion te klein</span>
                </button>`;
        } else if (!canAfford) {
            btnHtml = `<span class="sup-cost">${formatCurrency(nextLevel.cost)}</span>
                <button class="btn btn-primary btn-upgrade-stadium" disabled>
                    <span class="btn-icon">💸</span><span class="btn-text">Te duur</span>
                </button>`;
        } else {
            btnHtml = `<span class="sup-cost">${formatCurrency(nextLevel.cost)}</span>
                <button class="btn btn-primary btn-upgrade-stadium" onclick="upgradeStadiumCategory()">
                    <span class="btn-icon">🔨</span><span class="btn-text">Bouwen</span>
                </button>`;
        }
        actionEl.innerHTML = btnHtml;
    }

    panel.style.display = 'flex';
    const backdrop = document.getElementById('stadium-panel-backdrop');
    if (backdrop) backdrop.style.display = 'block';
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

    // Deduct cost and apply upgrade
    gameState.club.budget -= nextLevel.cost;
    gameState.stadium[config.stateKey] = nextLevel.id;

    // Update capacity if tribune
    if (category === 'tribune' && nextLevel.capacity) {
        gameState.stadium.capacity = nextLevel.capacity;
    }

    // Update UI
    renderStadiumMap();
    updateStadiumUpgradePanel(category);
    updateBudgetDisplays();
    showNotification(`${nextLevel.name} gebouwd!`, 'success');
    saveGame();
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

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
