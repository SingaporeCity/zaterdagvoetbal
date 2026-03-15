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
    NAMES_BY_NATIONALITY,
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
    startAutoSave,
    exportSave,
    importSave,
    setStorageMode,
    isMultiplayer,
    forceSyncToSupabase,
    supabasePlayerToLocal
} from './storage.js';

// Import multiplayer systems
import { initMultiplayerUI, checkAuthAndRoute, showLeagueOverlay, hideAllOverlays, getMyMatch, getMatchResult, simulateWeek, getScheduledOpponent, getClubPlayers, insertPlayerToSupabase, getFullSchedule, generateSchedule } from './multiplayer.js';
import { subscribeToLeague, unsubscribeAll, fetchStandings } from './realtime.js';
import { supabase, isSupabaseAvailable } from './supabase.js';

import {
    simulateMatch,
    generateOpponent,
    calculateTeamStrength,
    getMatchResultType,
    applyMatchResults
} from './matchEngine.js';

import {
    isSeasonComplete,
    calculateSeasonResults,
    checkDailyReward,
    getManagerLevel,
    awardXP,
    getPlayerLevel,
    awardPlayerXP,
    getZoneInfo,
    getSeasonSchedule,
    MANAGER_LEVELS,
    XP_REWARDS,
    PLAYER_LEVELS,
    PLAYER_XP_REWARDS,
    getSPPerLevel
} from './progression.js';

import {
    checkAchievements,
    getAllAchievements,
    getAchievementsByCategory,
    getAchievementStats,
    getRecentAchievements,
    initAchievements,
    CATEGORIES,
    DIVISION_NAMES
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

const CHAIRMAN_SVG = `<svg viewBox="0 0 55 60"><!-- Head --><ellipse cx="27" cy="30" rx="14" ry="15" fill="#f5d0c5"/><!-- Ears --><ellipse cx="13" cy="29" rx="3" ry="4" fill="#e8bfb0"/><ellipse cx="41" cy="29" rx="3" ry="4" fill="#e8bfb0"/><!-- Hat crown (covers top of head) --><path d="M14 20 L14 8 Q14 2 27 2 Q40 2 40 8 L40 20 Z" fill="#777"/><path d="M14 20 L14 8 Q14 2 27 2 Q40 2 40 8 L40 20 Z" fill="none" stroke="#666" stroke-width="0.8"/><!-- Hat band --><rect x="14" y="17" width="26" height="3.5" rx="0.5" fill="#555"/><!-- Hat brim (over forehead) --><ellipse cx="27" cy="20" rx="22" ry="5" fill="#888"/><ellipse cx="27" cy="20" rx="22" ry="5" fill="none" stroke="#666" stroke-width="0.8"/><!-- Eyebrows --><path d="M18 26 Q21 24 24 26" fill="none" stroke="#555" stroke-width="1.2"/><path d="M30 26 Q33 24 36 26" fill="none" stroke="#555" stroke-width="1.2"/><!-- Eyes whites --><circle cx="21" cy="29" r="2.5" fill="white"/><circle cx="33" cy="29" r="2.5" fill="white"/><!-- Eyes pupils --><circle cx="21.5" cy="29.3" r="1.2" fill="#333"/><circle cx="33.5" cy="29.3" r="1.2" fill="#333"/><!-- Glasses --><circle cx="21" cy="29" r="5" fill="none" stroke="#333" stroke-width="1.2"/><circle cx="33" cy="29" r="5" fill="none" stroke="#333" stroke-width="1.2"/><line x1="26" y1="29" x2="28" y2="29" stroke="#333" stroke-width="1"/><!-- Nose --><path d="M27 32 L25.5 36 L28.5 36" fill="none" stroke="#d4a88a" stroke-width="1"/><!-- Mouth with cigar --><path d="M23 39 Q27 41 31 39" fill="none" stroke="#a0522d" stroke-width="1.3"/><!-- Cigar --><rect x="31" y="37.5" width="12" height="3" rx="1.5" fill="#8B4513"/><rect x="31" y="37.5" width="3" height="3" rx="1" fill="#cd853f"/><!-- Cigar glow --><circle cx="43" cy="39" r="1.2" fill="#e65100" opacity="0.7"/><!-- Cigar smoke --><path d="M44 37 Q46 33 44 29" fill="none" stroke="rgba(200,200,200,0.5)" stroke-width="0.8"/><path d="M45 38 Q48 32 45 27" fill="none" stroke="rgba(200,200,200,0.35)" stroke-width="0.6"/><!-- Suit --><path d="M10 57 Q10 49 18 47 L27 50 L36 47 Q44 49 44 57 L44 60 L10 60 Z" fill="#1a365d"/><!-- Tie --><path d="M26 50 L27 58 L28 50 Z" fill="#c62828"/><!-- Collar --><path d="M22 49 L27 52 L32 49" fill="none" stroke="white" stroke-width="1.5"/></svg>`;

function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.game-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `game-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-avatar">${CHAIRMAN_SVG}</div>
        <div class="notification-body">
            <span class="notification-sender">Voorzitter</span>
            <span class="notification-message">${message}</span>
        </div>
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

function showConfirm(message) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.chairman-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'chairman-modal-overlay';
        overlay.innerHTML = `
            <div class="chairman-modal">
                <div class="chairman-modal-header">
                    <div class="notification-avatar">${CHAIRMAN_SVG}</div>
                    <span class="notification-sender">Voorzitter</span>
                </div>
                <p class="chairman-modal-message">${message}</p>
                <div class="chairman-modal-actions">
                    <button class="btn btn-secondary chairman-modal-cancel">Annuleren</button>
                    <button class="btn btn-primary chairman-modal-ok">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cleanup = (result) => {
            overlay.classList.add('chairman-modal-fade-out');
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };

        overlay.querySelector('.chairman-modal-ok').addEventListener('click', () => cleanup(true));
        overlay.querySelector('.chairman-modal-cancel').addEventListener('click', () => cleanup(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false); });
    });
}

function showAlert(message) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.chairman-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'chairman-modal-overlay';
        overlay.innerHTML = `
            <div class="chairman-modal">
                <div class="chairman-modal-header">
                    <div class="notification-avatar">${CHAIRMAN_SVG}</div>
                    <span class="notification-sender">Voorzitter</span>
                </div>
                <p class="chairman-modal-message">${message}</p>
                <div class="chairman-modal-actions">
                    <button class="btn btn-primary chairman-modal-ok">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cleanup = () => {
            overlay.classList.add('chairman-modal-fade-out');
            setTimeout(() => overlay.remove(), 200);
            resolve();
        };

        overlay.querySelector('.chairman-modal-ok').addEventListener('click', cleanup);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });
    });
}

function showContractOffer(player, salary, bonus) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.chairman-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'chairman-modal-overlay';
        overlay.innerHTML = `
            <div class="chairman-modal" style="max-width: 420px;">
                <div class="chairman-modal-header">
                    <div class="notification-avatar">${CHAIRMAN_SVG}</div>
                    <span class="notification-sender">Contractonderhandeling</span>
                </div>
                <div class="contract-offer-player">
                    <strong>${player.name}</strong> — ${player.position} ${renderStarsHTML(player.potentialStars || player.stars)}
                </div>
                <div class="contract-offer-details">
                    <div class="contract-offer-line">
                        <span>Geëist salaris:</span>
                        <span class="contract-offer-amount">${formatCurrency(salary)} p/w</span>
                    </div>
                    <div class="contract-offer-line">
                        <span>Tekenbonus:</span>
                        <span class="contract-offer-amount">${formatCurrency(bonus)}</span>
                    </div>
                </div>
                <div class="contract-offer-actions">
                    <button class="btn contract-btn-accept" data-choice="accept">Laten we tekenen</button>
                    <button class="btn contract-btn-negotiate" data-choice="negotiate">Laten we er even over praten</button>
                    <button class="btn contract-btn-refuse" data-choice="refuse">Ben je gek? Mijn club uit!</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cleanup = (result) => {
            overlay.classList.add('chairman-modal-fade-out');
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };

        overlay.querySelector('[data-choice="accept"]').addEventListener('click', () => cleanup('accept'));
        overlay.querySelector('[data-choice="negotiate"]').addEventListener('click', () => cleanup('negotiate'));
        overlay.querySelector('[data-choice="refuse"]').addEventListener('click', () => cleanup('refuse'));
    });
}

function showNegotiationResult(player, oldSalary, oldBonus, newSalary, newBonus) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.chairman-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'chairman-modal-overlay';
        overlay.innerHTML = `
            <div class="chairman-modal" style="max-width: 420px;">
                <div class="chairman-modal-header">
                    <div class="notification-avatar">${CHAIRMAN_SVG}</div>
                    <span class="notification-sender">Nieuw voorstel</span>
                </div>
                <p class="chairman-modal-message">${player.name} wil wel water bij de wijn doen:</p>
                <div class="contract-offer-details">
                    <div class="contract-offer-line">
                        <span>Salaris:</span>
                        <span><span class="contract-old-amount">${formatCurrency(oldSalary)} p/w</span> <span class="contract-offer-amount">${formatCurrency(newSalary)} p/w</span></span>
                    </div>
                    <div class="contract-offer-line">
                        <span>Tekenbonus:</span>
                        <span><span class="contract-old-amount">${formatCurrency(oldBonus)}</span> <span class="contract-offer-amount">${formatCurrency(newBonus)}</span></span>
                    </div>
                </div>
                <div class="chairman-modal-actions">
                    <button class="btn btn-secondary contract-neg-refuse">Nee bedankt</button>
                    <button class="btn contract-btn-accept contract-neg-accept">Akkoord!</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cleanup = (result) => {
            overlay.classList.add('chairman-modal-fade-out');
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };

        overlay.querySelector('.contract-neg-accept').addEventListener('click', () => cleanup(true));
        overlay.querySelector('.contract-neg-refuse').addEventListener('click', () => cleanup(false));
    });
}

function showOverallReveal(playerName, minVal, maxVal, realVal, starsMin, starsMax, realStars) {
    // Clamp realVal within the displayed range to prevent animation issues
    const safeMin = Math.min(minVal, realVal);
    const safeMax = Math.max(maxVal, realVal);

    const hasStars = starsMin !== undefined && starsMax !== undefined && realStars !== undefined;
    // Build star slots: each uncertain star that will be revealed one by one
    const starSlotCount = hasStars ? Math.ceil(starsMax) : 0;
    let starsHTML = '';
    for (let i = 0; i < starSlotCount; i++) {
        starsHTML += `<span class="reveal-star reveal-star-pending" data-index="${i}">★</span>`;
    }
    // Empty slots after max
    for (let i = starSlotCount; i < 5; i++) {
        starsHTML += `<span class="reveal-star reveal-star-empty">☆</span>`;
    }

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'chairman-modal-overlay';
        overlay.innerHTML = `
            <div class="chairman-modal" style="max-width: 340px; text-align: center;">
                <div class="reveal-player-name">${playerName}</div>
                <div class="reveal-overall-box">
                    <span class="reveal-number" id="reveal-min">${safeMin}</span>
                    <span class="reveal-dash">-</span>
                    <span class="reveal-number" id="reveal-max">${safeMax}</span>
                </div>
                <div class="reveal-label">ALG</div>
                ${hasStars ? `
                <div class="reveal-stars-row" id="reveal-stars-row">
                    ${starsHTML}
                </div>
                <div class="reveal-label reveal-label-pot">POTENTIE</div>
                ` : ''}
                <div class="reveal-effect-container" id="reveal-effects"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const minEl = document.getElementById('reveal-min');
        const maxEl = document.getElementById('reveal-max');
        const effectsEl = document.getElementById('reveal-effects');
        let currentMin = safeMin;
        let currentMax = safeMax;
        const totalSteps = Math.max(safeMax - realVal, realVal - safeMin);
        let step = 0;

        function getDelay() {
            const progress = step / Math.max(totalSteps, 1);
            return 120 + progress * 230;
        }

        function tick() {
            if (currentMin < realVal) currentMin++;
            if (currentMax > realVal) currentMax--;
            minEl.textContent = currentMin;
            maxEl.textContent = currentMax;
            step++;

            const box = overlay.querySelector('.reveal-overall-box');
            if (box && step > totalSteps * 0.7) {
                box.classList.add('reveal-shake');
                setTimeout(() => box.classList.remove('reveal-shake'), 100);
            }

            if (currentMin === realVal && currentMax === realVal) {
                // Phase 1 done: show final ALG
                const midpoint = (minVal + maxVal) / 2;
                const range = maxVal - minVal;
                const lowThreshold = minVal + range * 0.3;
                const isGreat = realVal > midpoint;
                const isBad = realVal < lowThreshold;

                setTimeout(() => {
                    minEl.parentElement.innerHTML = `<span class="reveal-number reveal-final">${realVal}</span>`;
                    const finalEl = overlay.querySelector('.reveal-final');
                    if (finalEl) finalEl.classList.add('reveal-pulse');

                    if (isGreat) {
                        finalEl.classList.add('reveal-great');
                        spawnConfetti(effectsEl);
                    } else if (isBad && !(realStars >= 0.5)) {
                        finalEl.classList.add('reveal-bad');
                        spawnRain(effectsEl);
                    }

                    // Phase 2: reveal stars one by one after ALG is shown
                    if (hasStars) {
                        revealStarsOneByOne(overlay, realStars, starSlotCount, () => {
                            setTimeout(() => {
                                overlay.classList.add('chairman-modal-fade-out');
                                setTimeout(() => { overlay.remove(); resolve(); }, 200);
                            }, 1200);
                        });
                    } else {
                        setTimeout(() => {
                            overlay.classList.add('chairman-modal-fade-out');
                            setTimeout(() => { overlay.remove(); resolve(); }, 200);
                        }, 1800);
                    }
                }, 500);
            } else {
                setTimeout(tick, getDelay());
            }
        }

        setTimeout(tick, 600);
    });
}

function revealStarsOneByOne(overlay, realStars, slotCount, onDone) {
    const fullStars = Math.floor(realStars);
    const hasHalf = (realStars - fullStars) >= 0.25;
    const stars = overlay.querySelectorAll('.reveal-star-pending');
    let i = 0;
    const delay = 400;

    // Brief pause before stars start revealing
    setTimeout(function revealNext() {
        if (i >= stars.length) {
            if (onDone) setTimeout(onDone, 300);
            return;
        }
        const star = stars[i];
        const idx = parseInt(star.dataset.index);

        if (idx < fullStars) {
            // This is a real star — light it up gold
            star.classList.remove('reveal-star-pending');
            star.classList.add('reveal-star-gold');
        } else if (idx === fullStars && hasHalf) {
            // Half star — show as half gold
            star.classList.remove('reveal-star-pending');
            star.classList.add('reveal-star-half');
            star.innerHTML = '<span class="star-half-filled">★</span><span class="star-half-empty">★</span>';
        } else {
            // Not a real star — transition to empty outline ☆
            star.classList.remove('reveal-star-pending');
            star.classList.add('reveal-star-gone');
            star.textContent = '☆';
        }

        i++;
        setTimeout(revealNext, delay);
    }, 500);
}

function spawnConfetti(container) {
    const colors = ['#ffd700', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4'];
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'reveal-confetti';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        container.appendChild(piece);
    }
}

function spawnRain(container) {
    for (let i = 0; i < 40; i++) {
        const drop = document.createElement('div');
        drop.className = 'reveal-raindrop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDelay = Math.random() * 0.8 + 's';
        drop.style.animationDuration = (0.6 + Math.random() * 0.4) + 's';
        container.appendChild(drop);
    }
}

// Make showNotification available globally for onclick handlers
window.showNotification = showNotification;
window.showConfirm = showConfirm;
window.showAlert = showAlert;

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

function generatePlayerName(nationality) {
    const code = nationality?.code || 'NL';
    const names = NAMES_BY_NATIONALITY[code] || NAMES_BY_NATIONALITY.NL;
    return `${randomFromArray(names.first)} ${randomFromArray(names.last)}`;
}

function generateNationality() {
    // ~50% Dutch, ~50% foreign for realistic transfer market
    const weights = [71, 8, 8, 5, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3, 1, 1, 2];
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

/**
 * Calculate salary based on division, age, stars — NOT directly on overall.
 * This prevents salary from revealing exact player quality.
 * Higher potential (stars) = more expensive (they know their worth).
 */
function calculateSalary(division, age, stars) {
    const div = getDivision(division) || getDivision(8);
    const salaryRange = div.salary;

    // Base: random point in the division's salary range (wide spread)
    const rangeSpread = salaryRange.max - salaryRange.min;
    const base = salaryRange.min + rangeSpread * (0.2 + Math.random() * 0.6);

    // Age factor: young players cheap, peak (27-31) expensive, old declining
    let ageFactor;
    if (age <= 19) ageFactor = 0.4 + Math.random() * 0.2;       // 0.4-0.6
    else if (age <= 22) ageFactor = 0.55 + Math.random() * 0.25; // 0.55-0.8
    else if (age <= 26) ageFactor = 0.75 + Math.random() * 0.25; // 0.75-1.0
    else if (age <= 31) ageFactor = 0.9 + Math.random() * 0.3;   // 0.9-1.2
    else if (age <= 34) ageFactor = 0.7 + Math.random() * 0.3;   // 0.7-1.0
    else ageFactor = 0.5 + Math.random() * 0.3;                  // 0.5-0.8

    // Stars: slight tendency for higher potential = more expensive, but with huge overlap
    let starsMod = 1.0;
    if (stars >= 4.5) starsMod = 1.0 + Math.random() * 0.4;       // 1.0-1.4x
    else if (stars >= 3.5) starsMod = 0.9 + Math.random() * 0.4;  // 0.9-1.3x
    else if (stars >= 2.5) starsMod = 0.8 + Math.random() * 0.4;  // 0.8-1.2x
    else if (stars >= 1.5) starsMod = 0.7 + Math.random() * 0.4;  // 0.7-1.1x
    else starsMod = 0.6 + Math.random() * 0.4;                    // 0.6-1.0x

    // Big random noise — salary is unreliable as quality indicator
    const noise = 0.6 + Math.random() * 0.8; // 0.6-1.4x

    const salary = Math.round(base * ageFactor * starsMod * noise);
    return Math.max(salaryRange.min || 5, salary);
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
    const playerName = generatePlayerName(nationality);
    const playerAge = random(minAge, maxAge);
    const playerPersonality = generatePersonality(division, qualityPercentile);
    const playerStars = assignPlayerStars(playerAge);

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
        personality: playerPersonality,
        salary: calculateSalary(division, playerAge, playerStars),
        goals: random(0, 5),
        assists: random(0, 3),
        morale: random(60, 90),
        condition: random(70, 100),
        energy: random(60, 100),
        stars: playerStars,
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

    // Pick 3 random non-keeper indices to be young players
    const nonKeeperIndices = positionList.map((p, i) => p !== 'keeper' ? i : -1).filter(i => i >= 0);
    const youngIndices = new Set();
    while (youngIndices.size < 3 && nonKeeperIndices.length > 0) {
        const pick = nonKeeperIndices.splice(Math.floor(Math.random() * nonKeeperIndices.length), 1)[0];
        youngIndices.add(pick);
    }

    // Pick 3 random old (non-young, non-keeper) indices to be hopeless players (ALG 1-2)
    const remainingOld = positionList.map((p, i) => (p !== 'keeper' && !youngIndices.has(i)) ? i : -1).filter(i => i >= 0);
    const hopelessIndices = new Set();
    while (hopelessIndices.size < 3 && remainingOld.length > 0) {
        const pick = remainingOld.splice(Math.floor(Math.random() * remainingOld.length), 1)[0];
        hopelessIndices.add(pick);
    }

    positionList.forEach((position, i) => {
        squad.push(createZaterdagPlayer(position, {
            young: youngIndices.has(i),
            hopeless: hopelessIndices.has(i)
        }));
    });

    return squad;
}

function assignPlayerStars(age) {
    // Most players start at 0, occasionally 0.5
    return randomFromArray([0, 0, 0, 0, 0, 0, 0, 0.5]);
}

function createZaterdagPlayer(position, { young = false, hopeless = false } = {}) {
    const isKeeper = position === 'keeper';
    const attrNames = isKeeper ? ['REF', 'BAL', 'SNE', 'FYS'] : ['AAN', 'VER', 'SNE', 'FYS'];

    // Young players: ALG 2-3, age 20-27, 0.5 stars (potential to grow)
    // Hopeless old players: ALG 1-2, age 40-55, 0 stars (de vader van iemand)
    // Normal old players: ALG 3-7, age 40-55, 0 stars
    const targetOverall = young ? random(2, 3) : hopeless ? random(1, 2) : random(3, 7);
    const attributes = {};

    // Generate attributes that produce the target overall
    // Repeatedly randomize until we hit the target
    let overall;
    let attempts = 0;
    do {
        attrNames.forEach(attr => {
            const spread = young ? 2 : 3;
            attributes[attr] = Math.max(1, Math.min(10, targetOverall + random(-spread, spread)));
        });
        overall = calculateOverall(attributes, position);
        attempts++;
    } while (overall !== targetOverall && attempts < 50);

    // Fallback: force attributes to match target
    if (overall !== targetOverall) {
        attrNames.forEach(attr => { attributes[attr] = targetOverall; });
        overall = calculateOverall(attributes, position);
    }

    const nationality = Math.random() < 0.90 ? NATIONALITIES[0] : generateNationality();
    const tag = getPlayerTag(attributes, position);
    const playerName = generatePlayerName(nationality);
    const playerAge = young ? random(20, 27) : random(40, 55);
    const playerStars = young ? 0.5 : 0;
    const calculatedSalary = Math.round(5 + (overall / 10) + playerStars * 3 + random(0, 3));

    // Energy: most players 70-100, but a few start lower (kroegavond)
    const energy = Math.random() < 0.25 ? random(55, 65) : random(70, 100);

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
        salary: calculatedSalary,
        goals: 0,
        assists: 0,
        morale: random(60, 90),
        condition: random(70, 100),
        energy: energy,
        stars: playerStars,
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
    const stars = player.stars || 0;
    const age = player.age || 25;

    // Players under ALG 10 have no market value
    if (overall < 10) return 0;

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

    const mp = isMultiplayer();
    let html = '';
    gameState.standings.forEach((team, index) => {
        const isPlayer = team.isPlayer;
        const position = index + 1;
        const isClickable = mp && !isPlayer && !team.isAI && team.clubId;

        // Determine zone class
        let zoneClass = '';
        if (position <= promotionZone) zoneClass = 'promotion-zone';
        else if (position > relegationZone) zoneClass = 'relegation-zone';

        html += `
            <tr class="${isPlayer ? 'is-player' : ''} ${zoneClass}${isClickable ? ' clickable-opponent' : ''}"${isClickable ? ` onclick="showOpponentSquad('${team.clubId}', '${team.name.replace(/'/g, "\\'")}')" style="cursor:pointer"` : ''}>
                <td>${position}</td>
                <td>${team.name}${isClickable ? ' <span style="opacity:0.5;font-size:0.8em">👤</span>' : ''}</td>
                <td>${team.won || team.wins || 0}</td>
                <td>${team.drawn || team.draws || 0}</td>
                <td>${team.lost || team.losses || 0}</td>
                <td><strong>${team.points}</strong>${isPlayer && gameState.club.pointsDeducted ? ` <span style="color: #f44336; font-size: 0.7em;">(-${gameState.club.pointsDeducted})</span>` : ''}</td>
            </tr>
        `;
    });

    container.innerHTML = html;
}

async function showOpponentSquad(clubId, clubName) {
    // Remove existing popup if any
    document.querySelector('.opponent-popup-overlay')?.remove();

    // Find standing info for this club
    const standing = gameState.standings.find(s => s.clubId === clubId);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'opponent-popup-overlay';
    overlay.innerHTML = `
        <div class="opponent-popup">
            <button class="opponent-popup-close">&times;</button>
            <div class="opponent-popup-header">
                <div class="opponent-popup-name">${clubName}</div>
                ${standing ? `<div class="opponent-popup-stats">
                    <span class="opponent-stat">${standing.points} pnt</span>
                    <span class="opponent-stat-sep"></span>
                    <span class="opponent-stat">${standing.won || standing.wins || 0}W ${standing.drawn || standing.draws || 0}G ${standing.lost || standing.losses || 0}V</span>
                    <span class="opponent-stat-sep"></span>
                    <span class="opponent-stat">${standing.goalsFor || 0}-${standing.goalsAgainst || 0}</span>
                </div>` : ''}
            </div>
            <div class="opponent-popup-divider"></div>
            <div class="opponent-popup-title">Beste spelers</div>
            <div class="opponent-popup-players">
                <div class="opponent-popup-loading">Laden...</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close handlers
    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.opponent-popup-close').addEventListener('click', close);

    // Fetch players + club client_state (for myPlayer)
    const [players, clubData] = await Promise.all([
        getClubPlayers(clubId),
        supabase.from('clubs').select('client_state').eq('id', clubId).single()
    ]);
    const playersContainer = overlay.querySelector('.opponent-popup-players');

    const mapped = (players || []).map(p => supabasePlayerToLocal(p));

    // Add opponent's created player from client_state
    const opponentMyPlayer = clubData?.data?.client_state?.myPlayer;
    if (opponentMyPlayer && opponentMyPlayer.name) {
        const a = opponentMyPlayer.attributes || {};
        const ovr = opponentMyPlayer.overall || Math.round(((a.SNE || 0) + (a.TEC || 0) + (a.PAS || 0) + (a.SCH || 0) + (a.VER || 0) + (a.FYS || 0)) / 6);
        mapped.push({
            id: 'opponent-myplayer',
            name: opponentMyPlayer.name,
            age: opponentMyPlayer.age || 20,
            position: opponentMyPlayer.position || 'spits',
            overall: ovr,
            stars: opponentMyPlayer.stars || 1,
            nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
            isMyPlayer: true
        });
    }

    if (mapped.length === 0) {
        playersContainer.innerHTML = '<div class="opponent-popup-empty">Geen spelers gevonden</div>';
        return;
    }

    const top5 = mapped.sort((a, b) => b.overall - a.overall).slice(0, 5);

    playersContainer.innerHTML = top5.map((p, i) => {
        const posInfo = POSITIONS[p.position];
        const posName = posInfo?.name || p.position;
        const posColor = posInfo?.color || '#666';
        const flag = p.nationality?.flag || '🏳️';
        const stars = p.stars || 0;
        const starsDisplay = stars > 0 ? Array(Math.min(stars, 5)).fill('★').join('') : '';

        return `<div class="opponent-player-row">
            <div class="opponent-player-ovr" style="background:${posColor}">${p.overall}</div>
            <div class="opponent-player-info">
                <div class="opponent-player-name">${flag} ${p.name}${p.isMyPlayer ? ' <span class="opponent-created-badge">SPELER</span>' : ''}</div>
                <div class="opponent-player-meta">${posName} · ${p.age} jaar</div>
            </div>
            ${starsDisplay ? `<div class="opponent-player-stars">${starsDisplay}</div>` : ''}
        </div>`;
    }).join('');
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
        attacker: { name: 'Aanvallers', icon: '⚽', color: '#9c27b0', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', color: '#4caf50', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', color: '#2196f3', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', color: '#f9a825', players: [] }
    };

    // Add "Mijn Speler" to the squad list
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const mpSquadStars = gameState.players.find(p => p && p.id === 'myplayer');
    const myPlayerEntry = {
        id: 'myplayer',
        name: mp.name,
        age: mp.age,
        position: mp.position,
        overall: mpOverall,
        potential: 99,
        stars: mpSquadStars ? mpSquadStars.stars : (mp.stars || 1),
        isMyPlayer: true,
        nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
        salary: calculateSalary(gameState.club?.division || 8, mp.age || 20, mp.stars || 1),
        energy: mp.energy || 100,
        attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
    };

    const allPlayers = [myPlayerEntry, ...gameState.players.filter(p => !p.isMyPlayer)];
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
                <div class="squad-group-header" style="background: ${group.color}">
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
    if (percentage < 30) return '#f44336'; // Red
    if (percentage < 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
}

// Convert potential (1-99) to 1-5 whole stars
function potentialToStarsGlobal(potential) {
    const stars = Math.round(potential / 20);
    return Math.min(5, Math.max(1, stars));
}

// Render stars as HTML (whole stars only)
/**
 * Render stars HTML — always shows 5 stars total.
 * @param {number} starCount - filled (yellow) stars
 * @param {number} darkExtra - extra dark/black stars after yellow (uncertainty margin, for transfer market)
 */
function renderStarsHTML(starCount, darkExtra) {
    let html = '';
    const clamped = Math.min(5, Math.max(0, starCount));
    const dark = darkExtra ? Math.min(5 - clamped, darkExtra) : 0;

    // Yellow filled stars
    const full = Math.floor(clamped);
    const hasHalf = (clamped - full) >= 0.25;
    for (let i = 0; i < full; i++) {
        html += '<span class="star full">★</span>';
    }
    if (hasHalf && dark > 0) {
        // Half yellow + half black in one star
        html += '<span class="star half-yellow-dark"><span class="star-half-filled">★</span><span class="star-half-dark">★</span></span>';
    } else if (hasHalf) {
        html += '<span class="star half"><span class="star-half-filled">★</span><span class="star-half-empty">★</span></span>';
    }
    const filledCount = full + (hasHalf ? 1 : 0);

    // Dark/black uncertainty stars (subtract 0.5 if we already used half in the combo star)
    const effectiveDark = hasHalf && dark > 0 ? dark - 0.5 : dark;
    const darkFull = Math.floor(effectiveDark);
    const darkHasHalf = (effectiveDark - darkFull) >= 0.25;
    for (let i = 0; i < darkFull; i++) {
        html += '<span class="star dark">★</span>';
    }
    if (darkHasHalf) {
        html += '<span class="star dark-half"><span class="star-half-filled-dark">★</span><span class="star-half-empty">★</span></span>';
    }
    const darkCount = darkFull + (darkHasHalf ? 1 : 0);

    // Transparent empty stars to fill up to 5
    const remaining = 5 - filledCount - darkCount;
    for (let i = 0; i < remaining; i++) {
        html += '<span class="star empty">☆</span>';
    }
    return html;
}

// Create a scouted player with caps based on scout level
// scoutLevel: 0 = no scout, 1 = scout, 2 = scout + centrum
function createScoutedPlayer(scoutLevel) {
    const positions = Object.keys(POSITIONS).filter(p => p !== 'keeper');
    const pos = randomFromArray(positions);
    const isKeeper = false;
    const attrNames = ['AAN', 'VER', 'SNE', 'FYS'];

    // Determine attribute cap based on scout level
    // Max overall: 0=5, 1=10, 2=15 → attributes capped accordingly
    const maxAttr = scoutLevel === 0 ? 3 : scoutLevel === 1 ? 6 : 8;
    const attributes = {};
    attrNames.forEach(attr => {
        attributes[attr] = random(1, maxAttr);
    });

    let overall = calculateOverall(attributes, pos);

    // Hard cap overall
    const maxOverall = scoutLevel === 0 ? 5 : scoutLevel === 1 ? 10 : 15;
    if (overall > maxOverall) {
        // Scale attributes down proportionally
        const scale = maxOverall / overall;
        attrNames.forEach(attr => {
            attributes[attr] = Math.max(1, Math.round(attributes[attr] * scale));
        });
        overall = calculateOverall(attributes, pos);
    }

    // Stars: scout = 0 (onzekerheid toont 1 zwarte ster), centrum = 0-0.5, geen scout = 0
    let stars = 0;
    if (scoutLevel >= 2) {
        stars = Math.random() < 0.5 ? 0 : 0.5;
    }

    const nationality = Math.random() < 0.90 ? NATIONALITIES[0] : generateNationality();
    const tag = getPlayerTag(attributes, pos);
    const playerName = generatePlayerName(nationality);
    const playerAge = random(16, 45);

    const scoutPersonality = generatePersonality(8, 0.5);
    const salary = calculateSalary(8, playerAge, stars);

    return {
        id: Date.now() + Math.random(),
        name: playerName,
        age: playerAge,
        position: pos,
        nationality: nationality,
        attributes: attributes,
        overall: overall,
        tag: tag.name,
        tagBonus: tag.bonus,
        personality: scoutPersonality,
        salary: salary,
        goals: 0,
        assists: 0,
        morale: random(60, 90),
        condition: random(70, 100),
        energy: random(60, 100),
        stars: stars,
        signingBonus: Math.round(salary * (2 + (stars || 0)) / 10) * 10,
        fixedMarketValue: 0,
        photo: generatePlayerPhoto(playerName, pos),
        scoutedAtWeek: gameState.week,
        scoutUncertainty: true
    };
}

// Scout uncertainty system
function getScoutUncertainty(player) {
    if (!player.scoutUncertainty) {
        return { weeksScouted: 99, isExact: true, overallMin: player.overall, overallMax: player.overall, starsMin: player.stars, starsMax: player.stars };
    }
    const weeksScouted = Math.min(3, (gameState.week || 1) - (player.scoutedAtWeek || 0));
    if (weeksScouted >= 3) {
        return { weeksScouted: 3, isExact: true, overallMin: player.overall, overallMax: player.overall, starsMin: player.stars, starsMax: player.stars };
    }
    const margins = [12, 8, 4];
    const starMargins = [2, 1.5, 0.5];
    const margin = margins[weeksScouted];
    const starMargin = starMargins[weeksScouted];
    return {
        weeksScouted,
        isExact: false,
        overallMin: Math.max(1, player.overall - margin),
        overallMax: Math.min(99, player.overall + margin),
        starsMin: Math.max(0, Math.floor(player.stars - starMargin)),
        starsMax: Math.min(5, Math.max(1, Math.ceil(player.stars + starMargin)))
    };
}

// Render scout stars: white (certain minimum) + black (uncertain range)
function renderScoutStarsHTML(minStars, maxStars) {
    return renderStarsHTML(minStars, maxStars - minStars);
}

function renderTransferStarsHTML(known, uncertain) {
    return renderStarsHTML(known, uncertain);
}

function renderStarsRangeHTML(minStars, maxStars) {
    // Gold ★ for guaranteed (min), black ★ for uncertain range, transparent ☆ for empty
    return renderStarsHTML(minStars, maxStars - minStars);
}

function createPlayerCardHTML(player, mini = false, readOnly = false) {
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

    const marketValue = player.isMyPlayer ? 0 : getPlayerMarketValue(player);
    const energy = player.energy || 75;
    const myPlayerClass = player.isMyPlayer ? ' my-player-card' : '';

    // Stars rating (fixed property)
    const potentialStars = player.stars || 0;

    // Compact horizontal card - flat grid layout for equal column alignment
    return `
        <div class="player-card${myPlayerClass}" data-player-id="${player.id}"${readOnly ? '' : ` onclick="if(!event.target.closest('.pc-buyout-btn,.pc-transfer-btn'))showPlayerDetail('${player.id}')"`}>
            <div class="pc-left">
                <span class="pc-pos" style="background: ${posData.color}">${posData.abbr}</span>
                <div class="pc-age-box">
                    <span class="pc-age-value">${player.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <img class="pc-flag-img" src="https://flagcdn.com/w40/${(player.nationality.code || 'nl').toLowerCase()}.png" alt="${player.nationality.code || 'NL'}" />
            </div>
            <span class="pc-name">${player.name}${player.suspendedUntil && player.suspendedUntil > gameState.week ? ` <span class="pc-status pc-suspended">🚫 Geschorst (${player.suspendedUntil - gameState.week}w)</span>` : player.injuredUntil && player.injuredUntil > gameState.week ? ` <span class="pc-status pc-injured">🏥 Geblesseerd (${player.injuredUntil - gameState.week}w)</span>` : (player.yellowCards || 0) > 0 ? ` <span class="pc-status pc-yellows">🟨${player.yellowCards}/5</span>` : ''}</span>
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
                <div class="pc-potential-stars"${player.isMyPlayer ? ` style="cursor:pointer" onclick="showTileTooltip(this, 'pot_my')"` : ''}>
                    <span class="pc-stars">${renderStarsHTML(potentialStars)}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
            ${readOnly ? '' : (!player.isMyPlayer ? (getPlayerMarketValue(player) > 0 ? `<button class="pc-transfer-btn" onclick="event.stopPropagation(); showTransferListPopup('${player.id}')" title="Zet op transfermarkt">💰</button>` : `<button class="pc-buyout-btn" onclick="event.stopPropagation(); buyoutPlayer('${player.id}')" title="Contract afkopen (${formatCurrency((player.salary || 0) * 10)})">✕</button>`) : '<span class="pc-buyout-placeholder"></span>')}
        </div>
    `;
}

// ================================================
// MIJN SPELER PAGE
// ================================================

function initMyPlayer() {
    if (!gameState.myPlayer) {
        gameState.myPlayer = {
            name: 'Speler',
            age: 20,
            position: 'spits',
            number: 10,
            energy: 100,
            attributes: {
                SNE: 5,
                TEC: 5,
                PAS: 5,
                SCH: 5,
                VER: 5,
                FYS: 5
            }
        };
    }
    // Migrate old saves missing new attributes
    const a = gameState.myPlayer.attributes;
    if (a.PAS === undefined) a.PAS = 5;
    if (a.SCH === undefined) a.SCH = 5;
    if (gameState.myPlayer.energy === undefined) gameState.myPlayer.energy = 100;
    // Migrate position to valid POSITIONS key
    if (gameState.myPlayer.position === 'CM') gameState.myPlayer.position = 'spits';
    // Migrate player XP fields
    if (gameState.myPlayer.xp === undefined) gameState.myPlayer.xp = 0;
    if (gameState.myPlayer.spentSkillPoints === undefined) gameState.myPlayer.spentSkillPoints = 0;
    if (!gameState.myPlayer.stars) gameState.myPlayer.stars = 1;
    if (!gameState.myPlayer.nationality) gameState.myPlayer.nationality = { code: 'NL', flag: '🇳🇱', name: 'Nederlands' };
    // Migrate very old saves where attributes were set high without skill point tracking
    // Only run once, tracked by _attrCapMigrated flag (the old !spentSkillPoints check was broken: 0 is falsy)
    if (!gameState.myPlayer._attrCapMigrated) {
        gameState.myPlayer._attrCapMigrated = true;
        // Only cap if spentSkillPoints was never set (truly old saves from before the SP system)
        if (gameState.myPlayer.spentSkillPoints === undefined || gameState.myPlayer.spentSkillPoints === null) {
            const attrKeys = ['SNE', 'TEC', 'PAS', 'SCH', 'VER', 'FYS'];
            attrKeys.forEach(k => { if (a[k] > 5) a[k] = 5; });
        }
    }
    // Sync overall from attributes
    gameState.myPlayer.overall = Math.round((a.SNE + a.TEC + a.PAS + a.SCH + a.VER + a.FYS) / 6);
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
    const energyColor = energy >= 70 ? '#4caf50' : energy >= 30 ? '#ff9800' : '#f44336';
    const energyLabel = energy >= 70 ? 'Fit' : energy >= 30 ? 'Vermoeid' : 'Uitgeput';

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
        const currentDiv = gameState.club?.division ?? 8;
        const items = filtered.filter(a => !category || a.category === category);

        // Sort: pending first, then unlocked, then locked
        items.sort((a, b) => {
            const aLocked = a.minDivision !== undefined && !a.unlocked && currentDiv > a.minDivision;
            const bLocked = b.minDivision !== undefined && !b.unlocked && currentDiv > b.minDivision;
            const aGroup = aLocked ? 2 : a.unlocked ? 1 : 0;
            const bGroup = bLocked ? 2 : b.unlocked ? 1 : 0;
            return aGroup - bGroup;
        });

        // Group by category when showing all
        const groups = !category ? filterCategories : [category];
        let html = '';

        for (const cat of groups) {
            const catItems = items.filter(a => a.category === cat);
            if (catItems.length === 0) continue;

            if (!category) {
                html += `<div class="ach-group-label">${catLabels[cat] || cat}</div>`;
            }

            html += catItems.map(a => {
                const isLocked = a.minDivision !== undefined && !a.unlocked && currentDiv > a.minDivision;
                const isHidden = a.hidden && !a.unlocked;

                if (isLocked) {
                    const divName = DIVISION_NAMES[a.minDivision] || '?';
                    return `<div class="ach-card locked">
                        <span class="ach-icon">🔒</span>
                        <div class="ach-info">
                            <span class="ach-name">${a.name}</span>
                            <span class="ach-desc">Bereikbaar vanaf ${divName}</span>
                        </div>
                    </div>`;
                }

                const name = isHidden ? '???' : a.name;
                const desc = isHidden ? 'Nog niet ontdekt...' : a.description;
                const icon = isHidden ? '❓' : a.icon;
                const cls = a.unlocked ? 'ach-card unlocked' : (isHidden ? 'ach-card hidden-ach' : 'ach-card');
                const xpBadge = a.reward?.playerXP ? `<span class="ach-xp-badge">+${a.reward.playerXP * 2} XP</span>` :
                                a.reward?.managerXP ? `<span class="ach-xp-badge mgr">+${a.reward.managerXP * 2} XP</span>` : '';
                const showProgress = !a.unlocked && !isHidden && a.progressTarget > 0;
                const progressBar = showProgress
                    ? `<div class="ach-card-progress"><div class="ach-card-progress-fill" style="width:${Math.round((a.progressCurrent / a.progressTarget) * 100)}%"></div><span class="ach-card-progress-text">${a.progressCurrent}/${a.progressTarget}</span></div>`
                    : '';
                return `<div class="${cls}">
                    <span class="ach-icon">${icon}</span>
                    <div class="ach-info">
                        <span class="ach-name">${name}${xpBadge}</span>
                        <span class="ach-desc">${desc}</span>
                        ${progressBar}
                    </div>
                    ${a.unlocked ? '<span class="ach-check">✓</span>' : ''}
                </div>`;
            }).join('');
        }

        return html;
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

    const mp = isMultiplayer();
    const rows = standings.map((team, i) => {
        const pos = i + 1;
        const isClickable = mp && !team.isPlayer && !team.isAI && team.clubId;
        let cls = team.isPlayer ? 'vg-stand-player' : '';
        if (isClickable) cls += ' clickable-opponent';
        if (pos <= promoZone) cls += ' vg-stand-promo';
        else if (pos > relegZone) cls += ' vg-stand-releg';
        const gf = team.goalsFor || 0;
        const ga = team.goalsAgainst || 0;
        return `<tr class="${cls}"${isClickable ? ` onclick="showOpponentSquad('${team.clubId}', '${team.name.replace(/'/g, "\\'")}')" style="cursor:pointer"` : ''}>
            <td>${pos}</td>
            <td>${team.name}${isClickable ? ' <span style="opacity:0.5;font-size:0.8em">👤</span>' : ''}</td>
            <td>${team.played || 0}</td>
            <td>${team.won || team.wins || 0}</td>
            <td>${team.drawn || team.draws || 0}</td>
            <td>${team.lost || team.losses || 0}</td>
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

// Skill point spending
window.spendSkillPoint = function(attr) {
    const mp = initMyPlayer();
    const pLevel = getPlayerLevel(mp.xp || 0, mp.stars || 1);
    const availablePoints = Math.max(0, pLevel.skillPoints - (mp.spentSkillPoints || 0));

    if (availablePoints <= 0) return;
    if ((mp.attributes[attr] || 0) >= 99) return;

    mp.attributes[attr]++;
    mp.spentSkillPoints = (mp.spentSkillPoints || 0) + 1;

    // Sync overall from attributes
    const a = mp.attributes;
    mp.overall = Math.round((a.SNE + a.TEC + a.PAS + a.SCH + a.VER + a.FYS) / 6);

    saveGame(gameState);
    renderProfileTraining();
    renderDashboardExtras();
};

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

function getGrassLevel() {
    const grassId = gameState.stadium?.grass || 'grass_0';
    const match = grassId.match(/grass_(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
        gameState.stats.changedFormation = true;
        renderLineupPitch();
        renderAvailablePlayers();
        updateLineupFit();
        updateFormationDrive();
        triggerAchievementCheck();
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

// Dual nationality: MA and TR players also count as NL
const DUAL_NATIONALITY_CODES = new Set(['ma', 'MA', 'tr', 'TR']);

function getDualFlag(player) {
    const code = (typeof player.nationality === 'object' ? player.nationality?.code : player.nationality) || '';
    const nat = NATIONALITIES.find(n => n.code === code);
    let flag = nat?.flag || '🏳️';
    if (DUAL_NATIONALITY_CODES.has(code.toUpperCase())) flag += '🇳🇱';
    return flag;
}

function getPlayerNationalities(player) {
    const code = (typeof player.nationality === 'object' ? player.nationality?.code : player.nationality) || '';
    const normalized = code.toUpperCase();
    const nats = new Set([normalized]);
    if (DUAL_NATIONALITY_CODES.has(code) || DUAL_NATIONALITY_CODES.has(normalized)) {
        nats.add('NL');
    }
    return nats;
}

function nationalitiesMatch(natSetA, natSetB) {
    for (const n of natSetA) {
        if (natSetB.has(n)) return true;
    }
    return false;
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

        // Check if all adjacent players share a nationality (dual nationality counts)
        if (adjacentPlayers.length > 0) {
            const playerNats = getPlayerNationalities(player);
            const allMatch = adjacentPlayers.every(ap => nationalitiesMatch(playerNats, getPlayerNationalities(ap)));
            if (allMatch) {
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
            const natCode = typeof player.nationality === 'object' ? player.nationality?.code : player.nationality;
            const nat = NATIONALITIES.find(n => n.code === natCode);
            nationalityFlag = nat?.flag || '🏳️';
            // Dual nationality: MA/TR also show NL flag
            if (natCode && DUAL_NATIONALITY_CODES.has(natCode.toUpperCase())) {
                nationalityFlag += '🇳🇱';
            }
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
                        <span class="lp-overall">${player.overall + chemistryBonus}${chemistryBonus > 0 ? '<span class="chemistry-boost">+' + chemistryBonus + '</span>' : ''}</span>
                        <span class="lp-name">${player.name.split(' ')[0]}</span>
                        <span class="lp-flag">${nationalityFlag}</span>
                        <span class="lp-position">${POSITIONS[player.position]?.abbr || player.position}</span>
                        ${player.suspendedUntil && player.suspendedUntil > gameState.week ? `<span class="lp-status">🚫${player.suspendedUntil - gameState.week}</span>` : player.injuredUntil && player.injuredUntil > gameState.week ? `<span class="lp-status lp-injured">🏥${player.injuredUntil - gameState.week}</span>` : (player.yellowCards || 0) >= 3 ? `<span class="lp-status">🟨${player.yellowCards}</span>` : ''}
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

    const lineupIds = new Set(gameState.lineup.filter(p => p).map(p => p.id));

    const groups = {
        attacker: { name: 'Aanvallers', icon: '⚽', color: '#9c27b0', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', color: '#4caf50', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', color: '#2196f3', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', color: '#f9a825', players: [] }
    };

    // Include "Mijn Speler" in available players
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const myPlayerEntry = {
        id: 'myplayer',
        name: mp.name,
        age: mp.age,
        position: mp.position,
        overall: mpOverall,
        stars: mp.stars || 1,
        isMyPlayer: true,
        energy: mp.energy || 100,
        nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
        attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
    };

    const allPlayers = [myPlayerEntry, ...gameState.players.filter(p => !p.isMyPlayer)];
    allPlayers.forEach(player => {
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
                <div class="player-group-header" style="background: ${group.color}; color: white; padding: 4px 8px; border-radius: 4px;">${group.icon} ${group.name}</div>
                <div class="player-group-list">
        `;

        group.players.forEach(player => {
            const posData = POSITIONS[player.position];
            const energy = player.energy || 75;
            const energyColor = energy >= 70 ? '#4caf50' : energy >= 30 ? '#ff9800' : '#f44336';
            const stars = player.stars || 0;
            const inLineup = lineupIds.has(player.id);

            const isSuspended = player.suspendedUntil && player.suspendedUntil > gameState.week;
            const isInjured = player.injuredUntil && player.injuredUntil > gameState.week;
            const isUnavailable = isSuspended || isInjured;

            let statusHTML = '';
            if (isSuspended) {
                const weeks = player.suspendedUntil - gameState.week;
                statusHTML = `<span class="ap-status ap-suspended">🚫${weeks}w</span>`;
            } else if (isInjured) {
                const weeks = player.injuredUntil - gameState.week;
                statusHTML = `<span class="ap-status ap-injured">🏥${weeks}w</span>`;
            } else if ((player.yellowCards || 0) >= 3) {
                statusHTML = `<span class="ap-status ap-yellows">🟨${player.yellowCards}</span>`;
            }

            html += `
                <div class="available-player${inLineup ? ' in-lineup' : ''}${isUnavailable ? ' unavailable' : ''}"
                     draggable="${isUnavailable ? 'false' : 'true'}"
                     data-player-id="${player.id}">
                    <span class="ap-pos" style="background:${posData?.color || '#666'};color:#fff">${posData?.abbr || '??'}</span>
                    <span class="ap-flag">${getDualFlag(player)}</span>
                    <span class="ap-name">${player.name}</span>
                    ${statusHTML}
                    <span class="ap-energy"><span class="ap-energy-bar" style="width:${energy}%;background:${energyColor}"></span></span>
                    <span class="ap-overall" style="background: ${posData?.color || '#666'}">${player.overall}</span>
                    ${stars > 0 ? `<span class="ap-stars-compact">${'★'.repeat(Math.floor(stars))}${stars % 1 >= 0.25 ? '½' : ''}</span>` : ''}
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
        // Tap-to-select for mobile
        el.addEventListener('click', () => {
            if (el.classList.contains('in-lineup') || el.classList.contains('unavailable')) return;
            const playerId = parsePlayerId(el.dataset.playerId);
            let player = gameState.players.find(p => p.id === playerId);
            if (!player && playerId === 'myplayer') {
                const mp = initMyPlayer();
                const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
                player = {
                    id: 'myplayer', name: mp.name, age: mp.age, position: mp.position,
                    overall: mpOverall, stars: mp.stars || 1, isMyPlayer: true,
                    energy: mp.energy || 100,
                    nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
                    attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
                };
            }
            if (!player) return;
            // Toggle selection
            const wasSelected = el.classList.contains('tap-selected');
            document.querySelectorAll('.available-player.tap-selected').forEach(s => s.classList.remove('tap-selected'));
            if (!wasSelected) {
                el.classList.add('tap-selected');
                lineupTapSelected = player;
            } else {
                lineupTapSelected = null;
            }
        });
    });
}

function updateLineupFit() {
    renderDashboardChecklist();
}

// Drag & Drop + tap-to-select for lineup
let lineupDragData = { player: null, fromSlot: null };
let lineupTapSelected = null;

function initLineupDragDrop() {
    // Slots can receive drops AND taps
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

        // Tap-to-place: click on slot — mobile shows picker, desktop uses tap-select
        slot.addEventListener('click', () => {
            const slotIndex = parseInt(slot.dataset.slotIndex);
            const existing = gameState.lineup[slotIndex];

            if (window.matchMedia('(max-width: 768px)').matches) {
                // Mobile: show player picker dropdown
                showSlotPlayerPicker(slotIndex, existing);
            } else if (lineupTapSelected) {
                lineupDragData = { player: lineupTapSelected, fromSlot: null };
                handleLineupDrop(slotIndex);
                lineupTapSelected = null;
                document.querySelectorAll('.available-player.tap-selected').forEach(s => s.classList.remove('tap-selected'));
            } else if (existing) {
                gameState.lineup[slotIndex] = null;
                renderLineupPitch();
                renderAvailablePlayers();
                updateLineupFit();
                saveGame(gameState);
            }
        });
    });

    // Existing players in lineup can be dragged
    document.querySelectorAll('.lineup-player').forEach(el => {
        el.addEventListener('dragstart', (e) => {
            const playerId = parsePlayerId(el.dataset.playerId);
            const slotIndex = parseInt(el.closest('.lineup-slot').dataset.slotIndex);
            let player = gameState.players.find(p => p.id === playerId);
            if (!player && playerId === 'myplayer') {
                player = gameState.lineup[slotIndex]; // already in lineup
            }
            lineupDragData = {
                player: player,
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
    // UUIDs (from Supabase) must stay as strings
    if (typeof raw === 'string' && raw.includes('-')) return raw;
    const num = parseFloat(raw);
    return isNaN(num) ? raw : num;
}

function handleAvailablePlayerDragStart(e) {
    const playerId = parsePlayerId(e.target.dataset.playerId);
    let player = gameState.players.find(p => p.id === playerId);
    if (!player && playerId === 'myplayer') {
        const mp = initMyPlayer();
        const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
        player = {
            id: 'myplayer', name: mp.name, age: mp.age, position: mp.position,
            overall: mpOverall, stars: mp.stars || 1, isMyPlayer: true,
            energy: mp.energy || 100,
            nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
            attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
        };
    }
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

    const p = lineupDragData.player;
    if ((p.injuredUntil && p.injuredUntil > gameState.week) || (p.suspendedUntil && p.suspendedUntil > gameState.week)) {
        showNotification(`${p.name} is niet beschikbaar!`, 'warning');
        lineupDragData = { player: null, fromSlot: null };
        return;
    }

    const existingPlayer = gameState.lineup[targetSlotIndex];

    // Place dragged player in target slot
    gameState.lineup[targetSlotIndex] = lineupDragData.player;

    // Achievement: check if player placed on wrong position
    if (lineupDragData.player && !gameState.stats.placedWrongPosition) {
        const formation = FORMATIONS[gameState.formation];
        if (formation) {
            const requiredPos = formation.positions[targetSlotIndex];
            const posGroup = POSITIONS[requiredPos?.role || requiredPos]?.group;
            const playerGroup = POSITIONS[lineupDragData.player.position]?.group;
            if (posGroup && playerGroup && posGroup !== playerGroup) {
                gameState.stats.placedWrongPosition = true;
                triggerAchievementCheck();
            }
        }
    }

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

function showSlotPlayerPicker(slotIndex, existingPlayer) {
    // Remove any existing picker
    document.querySelector('.slot-picker-overlay')?.remove();

    const formation = FORMATIONS[gameState.formation];
    const slotRole = formation?.positions[slotIndex]?.role || '';
    const slotPosData = POSITIONS[slotRole];
    const slotGroup = getPositionGroup(slotRole);

    // Build player list: myPlayer + all squad players not in lineup
    const lineupIds = new Set(gameState.lineup.filter(p => p).map(p => p.id));
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const myPlayerEntry = {
        id: 'myplayer', name: mp.name, position: mp.position, overall: mpOverall,
        stars: mp.stars || 1, isMyPlayer: true, energy: mp.energy || 100,
        nationality: { code: 'NL', flag: '🇳🇱' }
    };
    const allPlayers = [myPlayerEntry, ...gameState.players.filter(p => !p.isMyPlayer)];

    // Sort: matching position group first, then by overall
    const available = allPlayers.filter(p => {
        if (lineupIds.has(p.id)) return false;
        const isSuspended = p.suspendedUntil && p.suspendedUntil > gameState.week;
        const isInjured = p.injuredUntil && p.injuredUntil > gameState.week;
        return !isSuspended && !isInjured;
    }).sort((a, b) => {
        const groupOrder = { attacker: 0, midfielder: 1, defender: 2, goalkeeper: 3 };
        const aGroup = groupOrder[getPositionGroup(a.position)] ?? 9;
        const bGroup = groupOrder[getPositionGroup(b.position)] ?? 9;
        if (aGroup !== bGroup) return aGroup - bGroup;
        return b.overall - a.overall;
    });

    let rowsHTML = '';
    available.forEach(p => {
        const pd = POSITIONS[p.position];
        const flag = getDualFlag(p);
        const energy = p.energy || 75;
        const energyColor = energy >= 70 ? '#4caf50' : energy >= 30 ? '#ff9800' : '#f44336';
        const stars = p.stars || 0;
        const starsHTML = stars > 0 ? '★'.repeat(Math.floor(stars)) + (stars % 1 >= 0.25 ? '½' : '') : '';
        const isMatch = getPositionGroup(p.position) === slotGroup;

        rowsHTML += `
            <div class="spp-row${isMatch ? ' spp-match' : ''}" data-player-id="${p.id}">
                <span class="spp-pos" style="background:${pd?.color || '#666'}">${pd?.abbr || '??'}</span>
                <span class="spp-flag">${flag}</span>
                <span class="spp-name">${p.name}</span>
                <span class="spp-energy"><span class="spp-energy-fill" style="width:${energy}%;background:${energyColor}"></span></span>
                <span class="spp-overall" style="background:${pd?.color || '#666'}">${p.overall}</span>
                <span class="spp-stars">${starsHTML}</span>
            </div>`;
    });

    const overlay = document.createElement('div');
    overlay.className = 'slot-picker-overlay';
    overlay.innerHTML = `
        <div class="slot-picker">
            <div class="spp-header">
                <span class="spp-title">${slotPosData?.name || slotRole} kiezen</span>
                <button class="spp-close">✕</button>
            </div>
            ${existingPlayer ? `<button class="spp-remove-btn">✕ ${existingPlayer.name} verwijderen</button>` : ''}
            <div class="spp-list">${rowsHTML || '<div class="spp-empty">Geen spelers beschikbaar</div>'}</div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Close
    overlay.querySelector('.spp-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Remove existing player
    const removeBtn = overlay.querySelector('.spp-remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            gameState.lineup[slotIndex] = null;
            overlay.remove();
            renderLineupPitch();
            renderAvailablePlayers();
            updateLineupFit();
            saveGame(gameState);
        });
    }

    // Select player
    overlay.querySelectorAll('.spp-row').forEach(row => {
        row.addEventListener('click', () => {
            const playerId = parsePlayerId(row.dataset.playerId);
            let player = allPlayers.find(p => String(p.id) === String(playerId));
            if (!player) return;
            lineupDragData = { player, fromSlot: null };
            handleLineupDrop(slotIndex);
            overlay.remove();
            saveGame(gameState);
        });
    });
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
            gameState.stats.tacticsChanged = true;
            if (category === 'offensief' && option === 'zeer_verdedigend' && !gameState.stats.usedZeerVerdedigend) {
                gameState.stats.usedZeerVerdedigend = true;
                triggerAchievementCheck();
            }
            if (category === 'offensief' && option === 'leeroy' && !gameState.stats.usedLeeroy) {
                gameState.stats.usedLeeroy = true;
                triggerAchievementCheck();
            }
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

    // Achievement: check if player placed on wrong position
    const placedPlayer = gameState.lineup[targetIndex];
    if (placedPlayer && !gameState.stats.placedWrongPosition) {
        const formation = FORMATIONS[gameState.formation];
        if (formation) {
            const requiredPos = formation.positions[targetIndex];
            const posGroup = POSITIONS[requiredPos?.role || requiredPos]?.group;
            const playerGroup = POSITIONS[placedPlayer.position]?.group;
            if (posGroup && playerGroup && posGroup !== playerGroup) {
                gameState.stats.placedWrongPosition = true;
                triggerAchievementCheck();
            }
        }
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
    renderStadiumMobileFacilities();
}

function renderStadiumMobileFacilities() {
    // Remove existing mobile facilities container
    const existing = document.getElementById('stadium-mobile-facilities');
    if (existing) existing.remove();

    const mapContainer = document.querySelector('.stadium-map-container');
    if (!mapContainer) return;

    const categoryIcons = {
        tribune: '🏟️', grass: '🌱', training: '💪',
        medical: '🏥', academy: '🎓', scouting: '🔍',
        youthscouting: '👶', kantine: '🍺', sponsoring: '💼', perszaal: '🎉'
    };
    const categoryNames = {
        tribune: 'Stadion', grass: 'Wedstrijdveld', training: 'Trainingsveld',
        medical: 'Medisch', academy: 'Jeugdopleiding', scouting: 'Scouting',
        youthscouting: 'Scoutingcentrum', kantine: 'Horeca', sponsoring: 'Sponsoring', perszaal: 'Supporters'
    };

    let html = '';
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    Object.keys(STADIUM_TILE_CONFIG).forEach(key => {
        if (isMobile && key === 'youthscouting') return;
        const config = STADIUM_TILE_CONFIG[key];
        const currentId = gameState.stadium[config.stateKey];
        const currentIndex = config.levels.findIndex(l => l.id === currentId);
        const currentLevel = config.levels[currentIndex] || config.levels[0];
        const levelOffset = config.levels[0].effect === 'Niet gebouwd' ? 0 : 1;

        html += `
            <div class="stadium-mobile-facility-btn" onclick="selectStadiumCategory('${key}')">
                <span class="smf-icon">${categoryIcons[key] || '🏗️'}</span>
                <div class="smf-info">
                    <div class="smf-name">${categoryNames[key] || key}</div>
                    <div class="smf-level">${currentLevel.name} — Niv. ${currentIndex + levelOffset}</div>
                </div>
                <span class="smf-arrow">›</span>
            </div>
        `;
    });

    const container = document.createElement('div');
    container.id = 'stadium-mobile-facilities';
    container.className = 'stadium-mobile-facilities';
    container.innerHTML = html;
    mapContainer.parentNode.insertBefore(container, mapContainer);

    // On mobile: move fans/capacity overlay above the facility buttons
    if (isMobile) {
        const overlay = mapContainer.querySelector('.stadium-map-overlay');
        if (overlay) {
            mapContainer.parentNode.insertBefore(overlay, container);
        }
    }
}

function renderTierList() {
    const container = document.getElementById('tier-list-container');
    if (!container) return;

    const currentCapacity = STADIUM_UPGRADES.tribunes.find(t => t.id === gameState.stadium.tribune)?.capacity || 200;

    const tiers = [
        { name: 'Kelderklasse', minCap: 0, maxCap: 500, color: '#8b6914', icon: '⚽', facilities: ['Horeca', 'Parking', 'Training'] },
        { name: 'Amateur', minCap: 500, maxCap: 2000, color: '#4ade80', icon: '🥉', facilities: ['Medical', 'Fanshop', 'Horeca'] },
        { name: 'Semi-Pro', minCap: 2000, maxCap: 10000, color: '#60a5fa', icon: '🥈', facilities: ['VIP', 'Verlichting', 'Jeugd', 'Supporters'] },
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

async function purchaseUpgrade(category, upgradeId) {
    const upgrades = STADIUM_UPGRADES[category];
    const upgrade = upgrades?.find(u => u.id === upgradeId);

    if (!upgrade || gameState.club.budget < upgrade.cost) return;

    if (await showConfirm(`Wil je ${upgrade.name} bouwen voor ${formatCurrency(upgrade.cost)}?`)) {
        gameState.club.budget -= upgrade.cost;

        const singularCategories = ['tribunes', 'grass', 'training', 'medical', 'academy', 'scouting', 'lighting', 'sponsoring', 'kantine', 'perszaal', 'hotel'];
        const stateKey = category === 'tribunes' ? 'tribune' : category;

        // Store construction — effect applies when completed, not immediately
        const buildTime = upgrade.buildTime || 0;
        if (buildTime > 0 && singularCategories.includes(category)) {
            gameState.stadium.construction = {
                category: stateKey,
                targetId: upgradeId,
                previousId: gameState.stadium[stateKey],
                completesAt: Date.now() + buildTime * 60 * 60 * 1000, // buildTime in hours
                capacity: upgrade.capacity || null
            };
        } else {
            // Instant upgrades (no build time)
            if (singularCategories.includes(category)) {
                gameState.stadium[stateKey] = upgradeId;
                if (category === 'tribunes') {
                    gameState.stadium.capacity = upgrade.capacity;
                }
            } else {
                if (!Array.isArray(gameState.stadium[category])) {
                    gameState.stadium[category] = [];
                }
                gameState.stadium[category].push(upgradeId);
            }
        }

        updateBudgetDisplays();
        renderStadiumPage();
        saveGame();
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

    const hasScout = gameState.hiredStaff?.medisch?.includes('st_scout_senior') || (gameState.staff?.scout !== null && gameState.staff?.scout !== undefined);
    const scoutLevel = hasScout ? 1 : 0;
    const hasCentrum = gameState.club.division <= 5;

    // Initialize scout tips early (before UI checks)
    if (!gameState.scoutTips) gameState.scoutTips = [];
    if (!gameState.scoutHistory) gameState.scoutHistory = [];

    // Fix signingBonus for players created before the salary variable bugfix
    [...gameState.scoutTips, ...gameState.scoutHistory].forEach(p => {
        if (!p.signingBonus || isNaN(p.signingBonus)) {
            p.signingBonus = Math.round((p.salary || 10) * (2 + (p.stars || 0)) / 10) * 10;
        }
    });

    // Seed first tip for new games (voorzitter's son)
    if (gameState.scoutTips.length === 0 && !gameState.scoutTipClaimed) {
        const chairmanSon = createScoutedPlayer(0);
        chairmanSon.name = `${randomFromArray(DUTCH_FIRST_NAMES)} Bakker`;
        chairmanSon.age = 18;
        chairmanSon.nationality = NATIONALITIES[0];
        chairmanSon.tipSource = 'voorzitter';
        gameState.scoutTips.push(chairmanSon);
        // Start 5-day cooldown so next voorzitter tip doesn't appear immediately
        gameState.scoutMission.lastVoorzitterDate = getTodayString();
        saveGame();
    }

    // Voorzitter tip every 5 days (no scout hired)
    if (scoutLevel === 0 && gameState.scoutTips.length === 0 && gameState.scoutTipClaimed) {
        const mission = gameState.scoutMission;
        const today = getTodayString();
        const lastDate = mission.lastVoorzitterDate;
        let daysPassed = 999;
        if (lastDate) {
            const last = new Date(lastDate);
            const now = new Date(today);
            daysPassed = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        }
        if (daysPassed >= 5) {
            const player = createScoutedPlayer(0);
            player.tipSource = 'voorzitter';
            gameState.scoutTips.push(player);
            mission.lastVoorzitterDate = today;
            saveGame();
            showNotification('De voorzitter heeft een tip voor je!', 'info');
        }
    }

    // Update header labels
    const levelLabel = document.getElementById('scout-level-label');
    if (levelLabel) levelLabel.textContent = '';
    const hintEl = document.getElementById('scout-header-hint');
    if (hintEl) {
        hintEl.textContent = scoutLevel === 0
            ? 'Neem een scout aan voor betere suggesties'
            : 'Je scout zoekt de beste spelers voor jou';
    }

    // Voorzitter quote bovenaan
    const chairmanIntro = document.getElementById('scout-chairman-intro');
    if (chairmanIntro) {
        const chairmanSvg = CHAIRMAN_SVG;
        const mission = gameState.scoutMission;
        const usedToday = !mission.active && mission.lastScoutDate === getTodayString();
        const quoteText = scoutLevel === 0
            ? '"We hebben nog geen scout, maar ik hoor wel eens wat in het café. Elke 5 dagen heb ik een tip voor je — maar verwacht geen wereldspelers. Neem een scout aan voor serieuze versterking."'
            : usedToday
            ? '"We hebben vandaag al gespeurd, trainer. Morgen kunnen we weer op pad! Vergeet niet: hoe langer je een speler scout, hoe beter je weet wat je in huis haalt."'
            : '"Onze scout is actief op zoek naar versterking. Stuur hem erop uit en hij komt terug met een rapport! Let op: een eerste rapport is nog onzeker — laat een speler langer scouten voor een nauwkeuriger beeld."';
        chairmanIntro.innerHTML = `
            <div class="chairman-intro">
                <div class="chairman-intro-avatar">${chairmanSvg}</div>
                <p class="chairman-intro-quote">${quoteText}</p>
            </div>`;
    }

    // Render sidebar: scout card
    const scoutCard = document.getElementById('scouting-scout-card');
    if (scoutCard) {
        const mission = gameState.scoutMission;
        const missionActive = mission.active && mission.startTime;
        const usedToday = !missionActive && mission.lastScoutDate === getTodayString();

        const hasPendingTip = gameState.scoutTips && gameState.scoutTips.length >= 1;

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
        } else if (hasPendingTip) {
            clearScoutMissionTimer();
            missionHTML = `
                <div class="scout-mission-status scout-blocked-banner">
                    <div class="scout-blocked-text">Scout kan niet werken — er is nog een speler in de Nieuw Gescoute Spelers lijst</div>
                </div>`;
        } else if (usedToday) {
            clearScoutMissionTimer();
            missionHTML = `
                <div class="scout-mission-status scout-used-today">
                    <div class="scout-mission-cooldown">✓ Vandaag al gezocht</div>
                    <div class="scout-mission-cooldown-sub">Morgen weer beschikbaar</div>
                </div>`;
        } else {
            clearScoutMissionTimer();
            missionHTML = `
                <div class="scout-mission-status">
                    <button class="btn btn-primary scout-mission-btn" onclick="startScoutMission()">Scout Versturen</button>
                </div>`;
        }

        scoutCard.innerHTML = scoutLevel === 0
            ? `
            <div class="scouting-card-header">
                <span class="scouting-card-icon">💬</span>
                <span class="scouting-card-title">Voorzitter</span>
            </div>
            <div class="scouting-card-desc">De voorzitter heeft eens in de 5 dagen een tip. Neem een scout aan voor betere spelers.</div>
            <button class="btn-staff-link" onclick="window.navigateTo('staff')">Scout aannemen</button>
            `
            : `
            <div class="scouting-card-header">
                <div class="scouting-card-avatar" style="background: #2e7d32;">${STAFF_MEMBERS.find(s => s.id === 'st_scout_senior')?.svg || ''}</div>
                <span class="scouting-card-title">Scout</span>
            </div>
            <div class="scouting-card-desc">Je scout zoekt de beste spelers voor jou.</div>
            <div class="scouting-card-info"></div>
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
                <div class="scouting-card-desc">2 plekken op je scoutinglijst in plaats van 1.</div>
            `;
        } else {
            centrumCard.innerHTML = `
                <div class="scouting-card-header">
                    <span class="scouting-card-icon">🏗️</span>
                    <span class="scouting-card-title">Scoutingscentrum</span>
                </div>
                <div class="scouting-card-level scouting-locked">Vergrendeld</div>
                <div class="scouting-card-desc">Promoveer naar de <strong>5e Klasse</strong> om een scoutingscentrum te bouwen en 2 plekken op je scoutinglijst te krijgen.</div>
                <div class="scouting-card-req">
                    <span>🔒</span> Vereist: 5e Klasse
                </div>
            `;
        }
    }

    // Helper to render a player card with uncertainty
    function renderScoutPlayerCard(player, actions) {
        const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
        const unc = getScoutUncertainty(player);

        // ALG + stars display based on scout progress
        let overallDisplay, starsHTML, progressHTML = '';
        if (unc.isExact) {
            overallDisplay = `<span class="pc-overall-value">${player.overall}</span>`;
            starsHTML = renderStarsHTML(player.stars);
        } else {
            overallDisplay = `<span class="pc-overall-value scout-overall-range">${unc.overallMin} - ${unc.overallMax}</span>`;
            starsHTML = renderScoutStarsHTML(unc.starsMin, unc.starsMax);
            progressHTML = `<div class="scout-progress-indicator">Week ${unc.weeksScouted}/3 🔍</div>`;
        }

        return `
            <div class="scout-tip-card">
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
                        <span class="pc-salary">${formatCurrency(player.salary || 0)}/w</span>
                        <span class="pc-signing-bonus">${formatCurrency(player.signingBonus || 0)}</span>
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
                            ${overallDisplay}
                            <span class="pc-overall-label">ALG</span>
                        </div>
                        <div class="pc-potential-stars">
                            <span class="pc-stars">${starsHTML}</span>
                            <span class="pc-potential-label">POT</span>
                        </div>
                    </div>
                    ${progressHTML}
                </div>
                <div class="scout-tip-actions">
                    ${actions}
                </div>
            </div>
        `;
    }

    // Section 1: Nieuw gescoute spelers (3 knoppen: Aannemen, Afwijzen, Blijven Scouten)
    const newTipsHTML = gameState.scoutTips.length > 0
        ? gameState.scoutTips.map(player => renderScoutPlayerCard(player, `
            <button class="btn btn-primary" onclick="acceptScoutTip('${player.id}')">Contracteren</button>
            <button class="btn btn-secondary" onclick="declineScoutTip('${player.id}')">Afwijzen</button>
            <button class="btn btn-outline" onclick="keepScouting('${player.id}')">Blijven Scouten</button>
        `)).join('')
        : '<p class="scout-no-tips">Geen nieuwe spelers. Stuur je scout erop uit!</p>';

    // Section 2: Scoutinglijst (met capaciteit)
    const maxScoutSlots = hasCentrum ? 2 : 1;
    const historyHTML = gameState.scoutHistory.length > 0
        ? gameState.scoutHistory.map(player => renderScoutPlayerCard(player, `
            <button class="btn btn-primary" onclick="acceptScoutTip('${player.id}')">Contracteren</button>
            <button class="btn btn-danger btn-sm" onclick="declineScoutTip('${player.id}')">Afwijzen</button>
        `)).join('')
        : '<p class="scout-no-tips">Geen spelers op de scoutinglijst.</p>';

    section.innerHTML = `
        <div class="scout-section">
            <div class="scout-section-header">
                <span class="scout-section-title">Nieuw gescoute spelers</span>
                <span class="scout-section-count">${gameState.scoutTips.length}</span>
            </div>
            ${newTipsHTML}
        </div>
        <div class="scout-section">
            <div class="scout-section-header scout-section-header--history">
                <span class="scout-section-title">Scoutinglijst</span>
                <span class="scout-capacity">${gameState.scoutHistory.length}/${maxScoutSlots}</span>
            </div>
            ${historyHTML}
        </div>
    `;
}

async function hireScoutedPlayer(playerId) {
    const player = gameState.scoutSearch.results.find(p => p.id === playerId);
    if (!player) return;

    if (player.price > gameState.club.budget) {
        showNotification('Je hebt niet genoeg budget!', 'error');
        return;
    }

    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    // Hire the player
    gameState.club.budget -= player.price;
    gameState.scoutSearch.results = gameState.scoutSearch.results.filter(p => p.id !== playerId);
    gameState.stats.totalTransfers = (gameState.stats.totalTransfers || 0) + 1;
    gameState.stats.seasonSpending = (gameState.stats.seasonSpending || 0) + player.price;
    if (player.price < 200) gameState.stats.cheapTransfer = true;
    if (player.price >= 1000000) gameState.stats.expensiveTransfer = true;
    // Achievement: signed high potential (stars ≥ 0.5)
    if ((player.stars || 0) >= 0.5) gameState.stats.signedHighPotential = true;

    // In multiplayer, insert player into Supabase to get UUID
    if (isMultiplayer() && gameState.multiplayer?.clubId && gameState.multiplayer?.leagueId) {
        const dbPlayer = await insertPlayerToSupabase(player, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
        if (dbPlayer) player.id = dbPlayer.id;
    }

    gameState.players.push(player);
    triggerAchievementCheck();
    updateBudgetDisplays();
    renderScoutPage();
    saveGame();
    showNotification(`${player.name} is toegevoegd aan je selectie!`, 'success');
}

// Scout tip system
window.acceptScoutTip = async function(playerId) {
    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    // Find player first (without removing) to show salary in confirmation
    let player = null;
    let source = null;
    if (gameState.scoutTips) {
        player = gameState.scoutTips.find(p => String(p.id) === String(playerId));
        if (player) source = 'tips';
    }
    if (!player && gameState.scoutHistory) {
        player = gameState.scoutHistory.find(p => String(p.id) === String(playerId));
        if (player) source = 'history';
    }
    if (!player) return;

    // Contract negotiation (same flow as transfer market)
    const salary = player.salary || 0;
    const bonus = player.signingBonus || 0;
    const choice = await showContractOffer(player, salary, bonus);

    if (choice === 'refuse') {
        // Player is offended and leaves
        removeScoutPlayer(player, source);
        renderScoutPage();
        await showAlert(`${player.name} is beledigd en vertrekt.`);
        return;
    }

    let finalSalary = salary;
    if (choice === 'negotiate') {
        if (Math.random() < 0.75) {
            const discount = 0.05 + Math.random() * 0.25;
            const newSalary = Math.max(1, Math.round(salary * (1 - discount)));
            const accepted = await showNegotiationResult(player, salary, bonus, newSalary, 0);
            if (!accepted) {
                showNotification(`Onderhandeling met ${player.name} afgebroken.`, 'info');
                return;
            }
            finalSalary = newSalary;
        } else {
            // Player refuses to negotiate and leaves
            removeScoutPlayer(player, source);
            renderScoutPage();
            await showAlert(`${player.name} voelt zich niet gewaardeerd en vertrekt.`);
            return;
        }
    }

    // Capture uncertainty before removing it
    const uncertainty = getScoutUncertainty(player);
    const hasUncertainty = !uncertainty.isExact;

    // Remove from scout list
    removeScoutPlayer(player, source);

    // Remove scout uncertainty fields so real values are shown
    delete player.scoutUncertainty;
    delete player.scoutedAtWeek;

    player.salary = finalSalary;
    player.energy = 100;
    player.condition = 100;

    // In multiplayer, insert the player into Supabase
    if (isMultiplayer() && gameState.multiplayer?.clubId && gameState.multiplayer?.leagueId) {
        const dbPlayer = await insertPlayerToSupabase(player, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
        if (dbPlayer) {
            player.id = dbPlayer.id; // Use the DB-generated UUID
        }
    }

    gameState.players.push(player);
    gameState.scoutTipClaimed = true;
    // Prevent immediate voorzitter tip regeneration after signing
    if (!gameState.scoutMission.lastVoorzitterDate) {
        gameState.scoutMission.lastVoorzitterDate = getTodayString();
    }
    gameState.stats.signedScouted = (gameState.stats.signedScouted || 0) + 1;
    gameState.stats.totalTransfers = (gameState.stats.totalTransfers || 0) + 1;
    if (!hasUncertainty) gameState.stats.exactScout = (gameState.stats.exactScout || 0) + 1;
    // Achievement: signed high potential (stars ≥ 0.5)
    if ((player.stars || 0) >= 0.5) gameState.stats.signedHighPotential = true;
    saveGame();
    renderScoutPage();
    renderPlayerCards();

    // Show reveal animation if player wasn't fully scouted
    if (hasUncertainty) {
        await showOverallReveal(player.name, uncertainty.overallMin, uncertainty.overallMax, player.overall, uncertainty.starsMin, uncertainty.starsMax, player.stars);
    }
    triggerAchievementCheck();
    showNotification(`${player.name} is toegevoegd aan je selectie!`, 'success');
};

function removeScoutPlayer(player, source) {
    if (source === 'tips') {
        const idx = gameState.scoutTips.findIndex(p => String(p.id) === String(player.id));
        if (idx !== -1) gameState.scoutTips.splice(idx, 1);
    } else {
        const idx = gameState.scoutHistory.findIndex(p => String(p.id) === String(player.id));
        if (idx !== -1) gameState.scoutHistory.splice(idx, 1);
    }
}

window.declineScoutTip = function(playerId) {
    // Permanent verwijderen uit scoutTips of scoutHistory
    let found = false;
    if (gameState.scoutTips) {
        const idx = gameState.scoutTips.findIndex(p => String(p.id) === String(playerId));
        if (idx !== -1) {
            gameState.scoutTips.splice(idx, 1);
            found = true;
        }
    }
    if (!found && gameState.scoutHistory) {
        const idx = gameState.scoutHistory.findIndex(p => String(p.id) === String(playerId));
        if (idx !== -1) {
            gameState.scoutHistory.splice(idx, 1);
            found = true;
        }
    }
    if (!found) return;
    gameState.scoutTipClaimed = true;
    // Prevent immediate voorzitter tip regeneration after declining
    if (!gameState.scoutMission.lastVoorzitterDate) {
        gameState.scoutMission.lastVoorzitterDate = getTodayString();
    }
    gameState.stats.rejected = (gameState.stats.rejected || 0) + 1;
    saveGame();
    renderScoutPage();
    showNotification('Speler permanent afgewezen.', 'info');
};

window.keepScouting = function(playerId) {
    if (!gameState.scoutTips) return;
    const idx = gameState.scoutTips.findIndex(p => String(p.id) === String(playerId));
    if (idx === -1) return;

    if (!gameState.scoutHistory) gameState.scoutHistory = [];
    const hasCentrum = gameState.club.division <= 5;
    const maxSlots = hasCentrum ? 2 : 1;
    if (gameState.scoutHistory.length >= maxSlots) {
        showNotification(`Scoutinglijst is vol! (max ${maxSlots}). Neem een speler aan of wijs er een af.`, 'warning');
        return;
    }

    const player = gameState.scoutTips.splice(idx, 1)[0];
    gameState.scoutHistory.push(player);
    gameState.scoutTipClaimed = true;
    // Always mark lastVoorzitterDate — prevents immediate voorzitter tip regeneration
    gameState.scoutMission.lastVoorzitterDate = getTodayString();
    saveGame();
    renderScoutPage();
    showNotification('Speler toegevoegd aan de scoutinglijst. Na elke wedstrijd wordt het rapport nauwkeuriger.', 'success');
};

window.removeFromHistory = function(playerId) {
    window.declineScoutTip(playerId);
};

// Scout daily mission
let scoutMissionInterval = null;

window.startScoutMission = function() {
    const mission = gameState.scoutMission;
    if (mission.active) return;
    if (mission.lastScoutDate === getTodayString()) return;

    // Check: max 1 speler in scoutTips
    if (gameState.scoutTips && gameState.scoutTips.length >= 1) {
        showAlert('Ho ho, er staat nog een speler bij "Nieuw Gescoute Spelers". Contracteer hem, laat hem verder scouten of wijs hem af voordat je de scout weer op pad stuurt.');
        return;
    }

    const hasCentrum = gameState.club.division <= 5;
    const scoutLevel = hasCentrum ? 2 : 1;
    const player = createScoutedPlayer(scoutLevel);
    player.tipSource = 'scout';

    mission.active = true;
    mission.startTime = Date.now();
    mission.pendingPlayer = player;
    mission.lastScoutDate = getTodayString();
    gameState.stats.totalScoutMissions = (gameState.stats.totalScoutMissions || 0) + 1;

    saveGame();
    triggerAchievementCheck();
    renderScoutPage();
    updateNavBadges();
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
        updateNavBadges();
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

function renderProfileTraining() {
    const mp = initMyPlayer();
    const trainedToday = hasTrainedToday(mp);

    const container = document.getElementById('training-content');
    if (!container) return;

    // --- Player XP ---
    const playerXP = mp.xp || 0;
    const pLevel = getPlayerLevel(playerXP, mp.stars || 1);
    const availableSkillPoints = Math.max(0, pLevel.skillPoints - (mp.spentSkillPoints || 0));

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

    const derived = getMyPlayerDerived(mp);

    // Massage / train / spy info
    const hasFysio = (gameState.hiredStaff?.medisch || []).includes('st_fysio');
    const canMassage = hasFysio && mp.energy < 100 && !trainedToday;
    const canSpy = !trainedToday;
    const hasIndividualTrainer = (gameState.hiredStaff?.trainers || []).length > 0 || (gameState.hiredStaff?.medisch || []).includes('st_trainer');
    const canTrain = !trainedToday && hasIndividualTrainer;
    const opponentName = gameState.nextMatch?.opponent || 'Onbekend';

    const spText = availableSkillPoints > 0
        ? `<span class="sp-count">${availableSkillPoints}</span> skill ${availableSkillPoints === 1 ? 'punt' : 'punten'} beschikbaar`
        : 'Geen skill punten — level up voor meer!';

    container.innerHTML = `
        <div class="training-page-content">
            <!-- Voorzitter intro -->
            <div class="chairman-intro chairman-intro-compact">
                <div class="chairman-intro-avatar">${CHAIRMAN_SVG}</div>
                <p class="chairman-intro-quote">"Elke dag mag je precies <strong>1 actie</strong> uitvoeren: trainen, massage of spioneren. Kies slim! En vergeet niet je skill punten te besteden als je die hebt."</p>
            </div>

            <!-- Dagelijkse acties + Kenmerken naast elkaar -->
            <div class="training-dual-row">
                <!-- Dagelijkse acties card (links) -->
                <div class="training-actions-card">
                    <div class="training-actions-header">Dagelijkse actie <span class="training-actions-hint ${!trainedToday ? 'training-hint-urgent' : 'training-hint-done'}">${trainedToday ? '(vandaag al gebruikt)' : '(1 per dag — kies slim!)'}</span></div>
                    <div class="training-actions-col">
                        <div class="training-action-card ${!hasIndividualTrainer ? 'locked' : ''} ${canTrain ? 'action-available' : ''}">
                            <div class="training-action-info">
                                <div class="training-sec-title">Trainen</div>
                                <div class="training-sec-desc">De manier om je speler beter te maken. Verdien <strong>+100 XP</strong> en werk naar meer skill punten.</div>
                                ${!hasIndividualTrainer ? '<div class="training-sec-warning">Je hebt een individuele trainer nodig!</div>' : ''}
                            </div>
                            ${hasIndividualTrainer
                                ? `<button class="btn btn-sm ${canTrain ? 'btn-primary' : trainedToday ? 'btn-danger' : 'btn-secondary'}" onclick="trainMyPlayer('vrije_tijd')" ${!canTrain ? 'disabled' : ''}>Trainen</button>`
                                : `<button class="btn btn-sm btn-primary" onclick="window.navigateTo('staff')">Aannemen</button>`}
                        </div>
                        <div class="training-action-card ${canSpy ? 'action-available' : ''}">
                            <div class="training-action-info">
                                <div class="training-sec-title">Spioneren</div>
                                <div class="training-sec-desc">Gluur vanuit de bosjes naar de training van <strong>${opponentName}</strong> en ontdek hun opstelling en zwakke plekken. Geeft een <strong>bonus voor de volgende wedstrijd</strong>.</div>
                            </div>
                            <button class="btn btn-sm ${canSpy ? 'btn-primary' : trainedToday ? 'btn-danger' : 'btn-secondary'}" onclick="trainMyPlayer('spy')" ${!canSpy ? 'disabled' : ''}>Spioneer</button>
                        </div>
                        <div class="training-action-card ${!hasFysio ? 'locked' : ''} ${canMassage ? 'action-available' : ''} ${hasFysio && mp.energy >= 100 ? 'action-done' : ''}">
                            <div class="training-action-info">
                                <div class="training-sec-title">Massage</div>
                                <div class="training-sec-desc">${!hasFysio
                                    ? 'Herstel energie na zware wedstrijden met een professionele massage.'
                                    : mp.energy >= 100
                                    ? 'Je energie is al <strong>100%</strong> — geen massage nodig.'
                                    : `Herstel <strong>+50% energie</strong>. Meer energie = betere prestaties in wedstrijden. Nu op ${Math.round(mp.energy)}%.`}</div>
                                ${!hasFysio ? '<div class="training-sec-warning">Je hebt een fysiotherapeut nodig!</div>' : ''}
                            </div>
                            ${hasFysio
                                ? `<button class="btn btn-sm ${canMassage ? 'btn-primary' : trainedToday ? 'btn-danger' : 'btn-secondary'}" onclick="${canMassage ? "trainMyPlayer('massage')" : ''}" ${!canMassage ? 'disabled' : ''}>${mp.energy >= 100 ? '✓ Vol' : 'Massage'}</button>`
                                : `<button class="btn btn-sm btn-primary" onclick="window.navigateTo('staff')">Aannemen</button>`}
                        </div>
                    </div>
                </div>

                <!-- Kenmerken card (rechts) -->
                <div class="training-attrs-card ${availableSkillPoints > 0 ? 'has-skill-points' : ''}">
                    <div class="training-attrs-header">
                        <span class="training-attrs-title">Kenmerken</span>
                    </div>
                    <div class="training-attrs-sp-banner ${availableSkillPoints > 0 ? 'has-points' : ''}">${spText}</div>
                    <div class="training-attrs-body">
                        <div class="training-hbars">
                            ${skillBars}
                            <div class="hbar-row energy-row">
                                <span class="hbar-label">Energie</span>
                                <div class="hbar-track"><div class="hbar-fill energy-fill" style="width: ${Math.round(mp.energy)}%"><span class="hbar-val">${Math.round(mp.energy)}%</span></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="training-attrs-footer">
                        <div class="training-info-tiles">
                            <div class="training-tile training-tile-pos" style="background: ${POSITIONS[mp.position]?.color || '#666'}">
                                <span class="training-tile-big">${POSITIONS[mp.position]?.abbr || mp.position}</span>
                                <span class="training-tile-lbl">${POSITIONS[mp.position]?.name || mp.position}</span>
                            </div>
                            <div class="training-tile training-tile-alg" style="background: ${POSITIONS[mp.position]?.color || '#666'}; cursor: pointer;" onclick="showTileTooltip(this, 'alg')">
                                <span class="training-tile-big">${derived.gemiddeld}</span>
                                <span class="training-tile-lbl">ALG</span>
                            </div>
                            <div class="training-tile training-tile-pot training-tile-pot-my" style="cursor: pointer;" onclick="showTileTooltip(this, 'pot_my')">
                                <span class="training-tile-stars">${renderStarsHTML(mp.stars || 1)}</span>
                                <span class="training-tile-lbl">Potentie</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Keep old name as alias for backward compat
function renderTrainingPage() { renderProfileTraining(); }

// Statistieken subtab — player stats + Club DNA + Records
function renderProfileStatistieken() {
    const container = document.getElementById('statistieken-content');
    if (!container) return;

    const mp = initMyPlayer();
    const derived = getMyPlayerDerived(mp);

    // Season stats
    const history = gameState.matchHistory || [];
    const seasonHistory = history.filter(h => h.season === gameState.season);
    const seasonMatches = seasonHistory.length;
    const seasonGoals = seasonHistory.reduce((sum, m) => sum + (m.playerScore || 0), 0);
    const seasonAssists = seasonHistory.reduce((sum, m) => {
        return sum + (m.events || []).filter(e =>
            e.type === 'goal' && e.team === 'home' && e.assistId
        ).length;
    }, 0);

    // Average rating (use playerRating if available)
    const ratingsArr = seasonHistory.map(m => m.playerRating).filter(r => r != null);
    const avgRating = ratingsArr.length > 0 ? (ratingsArr.reduce((s, r) => s + r, 0) / ratingsArr.length).toFixed(1) : '-';

    // Vorm (last 5 matches)
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
    const stats = gameState.stats || {};
    let streakText = '';
    if (stats.currentWinStreak > 1) streakText = `${stats.currentWinStreak} zeges op rij`;
    else if (stats.currentUnbeaten > 1) streakText = `${stats.currentUnbeaten} ongeslagen`;

    const trainedCount = mp.trainingSessions || 0;

    // Manager-side data
    const clubStats = gameState.club?.stats || {};
    const cStats = gameState.stats || {};
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];
    const highestDiv = divisionNames[clubStats.highestDivision || 8] || '6e Klasse';

    container.innerHTML = `
        <div class="profile-stats-section">
            <h4 class="profile-stats-title">⚽ Spelersstatistieken</h4>
            <div class="profile-stat-tiles">
                <div class="profile-stat-tile"><span class="profile-stat-val">${seasonMatches}</span><span class="profile-stat-lbl">Wedstrijden</span></div>
                <div class="profile-stat-tile"><span class="profile-stat-val">${seasonGoals}</span><span class="profile-stat-lbl">Doelpunten</span></div>
                <div class="profile-stat-tile"><span class="profile-stat-val">${seasonAssists}</span><span class="profile-stat-lbl">Assists</span></div>
                <div class="profile-stat-tile"><span class="profile-stat-val">${avgRating}</span><span class="profile-stat-lbl">Gem. rating</span></div>
            </div>
            <div class="profile-stat-extra">
                <div class="profile-stat-row">
                    <span class="profile-stat-row-lbl">Vorm</span>
                    <div class="training-vorm-row">${vormCircles.join('')}</div>
                    ${streakText ? `<span class="profile-stat-row-streak">${streakText}</span>` : ''}
                </div>
                <div class="profile-stat-row">
                    <span class="profile-stat-row-lbl">Energie</span>
                    <div class="hbar-track" style="flex:1"><div class="hbar-fill energy-fill" style="width: ${Math.round(mp.energy)}%"><span class="hbar-val">${Math.round(mp.energy)}%</span></div></div>
                </div>
                <div class="profile-stat-row">
                    <span class="profile-stat-row-lbl">Trainingen</span>
                    <span class="profile-stat-row-val">${trainedCount}</span>
                </div>
                <div class="profile-stat-row">
                    <span class="profile-stat-row-lbl">Positie</span>
                    <span class="profile-stat-row-val">${POSITIONS[mp.position]?.name || mp.position}</span>
                </div>
            </div>
        </div>

        <div class="profile-stats-section">
            <h4 class="profile-stats-title">📋 Managerstatistieken</h4>
            <div class="vg-mgr-columns">
                <div class="vg-mgr-col-left">
                    ${renderClubDNA(divisionNames)}
                </div>
                <div class="vg-mgr-col-right">
                    ${renderStatsAndRecords(cStats, clubStats, highestDiv)}
                </div>
            </div>
        </div>
    `;
}

// Achievements subtab — two columns: player left, manager right
function renderProfileAchievements() {
    const container = document.getElementById('achievements-content');
    if (!container) return;

    const allAch = getAllAchievements(gameState);

    // Player achievements
    const spelerCats = [CATEGORIES.MATCHES, CATEGORIES.GOALS, CATEGORIES.SEASON, CATEGORIES.SPECIAL];
    const spelerAch = renderAchievementCards(allAch, spelerCats);

    // Manager achievements
    const mgrCats = [CATEGORIES.CLUB, CATEGORIES.PLAYERS, CATEGORIES.STADIUM];
    const mgrAch = renderAchievementCards(allAch, mgrCats);

    container.innerHTML = `
        <div class="profile-achievements-grid">
            <div class="profile-ach-col">
                <h4 class="profile-ach-title">⚽ Speler <span class="ach-progress-text">${spelerAch.stats.unlocked} / ${spelerAch.stats.total}</span></h4>
                <div class="ach-progress">
                    <div class="ach-progress-bar">
                        <div class="ach-progress-fill" style="width: ${spelerAch.progressPct}%"></div>
                    </div>
                </div>
                <div class="ach-filters" id="player-ach-filters">
                    <button class="ach-filter-btn active" data-ach-cat="all">Alles</button>
                    ${spelerAch.filterBtns}
                </div>
                <div class="ach-grid" id="player-ach-grid">
                    ${spelerAch.renderCards(null)}
                </div>
            </div>
            <div class="profile-ach-col">
                <h4 class="profile-ach-title">📋 Manager <span class="ach-progress-text">${mgrAch.stats.unlocked} / ${mgrAch.stats.total}</span></h4>
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
        </div>
    `;

    // Player filter handlers
    container.querySelectorAll('#player-ach-filters .ach-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('#player-ach-filters .ach-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.achCat;
            const grid = document.getElementById('player-ach-grid');
            if (grid) grid.innerHTML = spelerAch.renderCards(cat === 'all' ? null : cat);
        });
    });

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
        if (tab === 'statistieken') renderProfileStatistieken();
        if (tab === 'achievements') renderProfileAchievements();
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
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    if (gameState.assistantTrainers[assistantType] !== null) {
        showNotification('Deze assistent is al in dienst!', 'warning');
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
        showNotification('Niet genoeg budget!', 'error');
        return;
    }

    if (gameState.staff[staffType] !== null) {
        showNotification('Deze stafrol is al ingevuld!', 'warning');
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
        showNotification('Geen spelers beschikbaar voor training.', 'warning');
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
        const starsHTML = renderStarsHTML(player.stars || 0);

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
    saveGame();
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
    const selected = gameState.training.teamTraining.selected;
    const options = document.querySelectorAll('.team-training-option');
    options.forEach(option => {
        const type = option.dataset.type;
        const btn = option.querySelector('button');

        if (selected === type) {
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

    const warning = document.getElementById('team-training-warning');
    if (warning) {
        warning.style.display = selected ? 'none' : '';
    }
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
        showNotification(`Geen ${POSITION_GROUP_LABELS[group].toLowerCase()}s beschikbaar voor training.`, 'warning');
        return;
    }

    // Find an available trainer
    const availableTrainer = Object.entries(gameState.training.trainerStatus)
        .find(([id, data]) => !data.busy);

    if (!availableTrainer) {
        showNotification('Alle trainers zijn momenteel bezet.', 'warning');
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
        showNotification('Wijs eerst spelers toe aan trainingsposities.', 'warning');
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
    renderDashboardChecklist();
    saveGame();
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
    renderDashboardChecklist();
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

        showNotification(`Training voltooid! ${player.name} heeft +1 ${trainer.stat} gekregen.`, 'success');
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
    saveGame();
}

function selectTeamTraining(type) {
    gameState.training.teamTraining.selected = type;

    // Set bonus for next match
    const bonuses = {
        defense: { type: 'defense', value: 10 },
        tactics: { type: 'tactics', value: 10 },
        attack: { type: 'attack', value: 10 }
    };

    gameState.training.teamTraining.bonus = bonuses[type];
    renderTeamTraining();
    renderDashboardChecklist();
    saveGame();
}

// Train my player (individual training, 1x per day)
window.trainMyPlayer = function(key) {
    const mp = initMyPlayer();

    if (hasTrainedToday(mp)) {
        showNotification('Je hebt vandaag al getraind! Kom morgen terug.', 'warning');
        return;
    }

    if (key === 'vrije_tijd') {
        if (!(gameState.hiredStaff?.trainers || []).length && !(gameState.hiredStaff?.medisch || []).includes('st_trainer')) {
            showNotification('Je hebt een individuele trainer nodig om te trainen!', 'warning');
            return;
        }
        mp.lastTrainingDate = getTodayString();
        gameState.stats.trainingSessions = (gameState.stats.trainingSessions || 0) + 1;
        triggerAchievementCheck();
        showPlayerXPPopup([{ reason: 'Training', amount: 100 }], () => {
            awardPlayerXP(gameState, 'training', 100);
        });
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
    renderProfileTraining();
    renderPlayerCards();
    renderDashboardExtras();
    updateNavBadges();
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

    // Recalculate next match time dynamically (handles midnight rollover)
    if (gameState.nextMatch) {
        gameState.nextMatch.time = getNextMatchTime();
    }
    const remaining = (gameState.nextMatch?.time || 0) - Date.now();

    // In multiplayer, check if current week is already played
    const mpWeekPlayed = isMultiplayer() && gameState._weekPlayed;

    // Check if already played today (daily limit)
    const playedToday = (() => {
        if (!gameState.lastMatchPlayedAt) return false;
        const last = new Date(gameState.lastMatchPlayedAt);
        const now = new Date();
        return last.toDateString() === now.toDateString();
    })();

    // Update new kantine board timer segments
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    const playBtn = document.getElementById('play-match-btn');
    if (hoursEl && minutesEl && secondsEl) {
        const showWaitState = (message) => {
            if (playBtn) {
                playBtn.classList.remove('match-ready');
                if (gameState.matchHistory && gameState.matchHistory.length > 0) {
                    playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7a6.97 6.97 0 0 1-4.95-2.05l-1.41 1.41A8.97 8.97 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg> BEKIJK VORIGE WEDSTRIJD';
                    playBtn.onclick = function() {
                        navigateToPage('wedstrijden');
                        setTimeout(() => activateTabOnPage('wedstrijden', 'verslag'), 50);
                    };
                } else {
                    playBtn.innerHTML = message;
                    playBtn.onclick = function() {
                        showAlert('Niet zo snel, de tegenstander is nog niet eens aangekomen!');
                    };
                }
            }
        };

        if (mpWeekPlayed || playedToday || remaining > 0) {
            // Show countdown timer
            if (remaining > 0) {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                hoursEl.textContent = String(hours).padStart(2, '0');
                minutesEl.textContent = String(minutes).padStart(2, '0');
                secondsEl.textContent = String(seconds).padStart(2, '0');
            } else {
                // Time is up but week already played — show dashes
                hoursEl.textContent = '--';
                minutesEl.textContent = '--';
                secondsEl.textContent = '--';
            }
            showWaitState('WACHTEN OP VOLGENDE RONDE');
        } else {
            // Match ready — timer at 00:00:00, show play button
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            if (playBtn) {
                playBtn.classList.add('match-ready');
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg> SPEEL WEDSTRIJD';
                playBtn.onclick = playMatch;
            }
        }
    }
}

// ================================================
// MODALS
// ================================================

function showPlayerDetail(playerId) {
    playerId = parsePlayerId(playerId);
    const player = gameState.players.find(p => String(p.id) === String(playerId));
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
                    <span>${renderStarsHTML(player.stars || 0)}</span>
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

async function buyoutPlayer(playerId) {
    const playerIndex = gameState.players.findIndex(p => String(p.id) === String(playerId));
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];
    const cost = (player.salary || 0) * 10;

    if (gameState.club.budget < cost) {
        showNotification('Niet genoeg budget voor de afkoopsom!', 'error');
        return;
    }

    if (!await showConfirm(`Wil je het contract van ${player.name} afkopen?\n\nAfkoopsom: ${formatCurrency(cost)} (10x weeksalaris van ${formatCurrency(player.salary || 0)})`)) return;

    gameState.club.budget -= cost;
    // Achievement: fired player older than 45
    if (player.age > 45) {
        gameState.stats.firedOldPlayer = true;
        triggerAchievementCheck();
    }
    gameState.players.splice(playerIndex, 1);
    gameState.stats.released = (gameState.stats.released || 0) + 1;
    triggerAchievementCheck();

    // Remove from lineup if present
    for (let i = 0; i < gameState.lineup.length; i++) {
        if (gameState.lineup[i] && String(gameState.lineup[i].id) === String(playerId)) {
            gameState.lineup[i] = null;
        }
    }

    // Remove from Supabase in multiplayer
    if (isMultiplayer()) {
        supabase.from('players').delete().eq('id', playerId).then(({ error }) => {
            if (error) console.error('Failed to delete player from DB:', error);
        });
    }

    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.remove('active');

    showNotification(`${player.name} afgekocht voor ${formatCurrency(cost)}.`, 'info');
    renderPlayerCards();
    updateBudgetDisplays();
    saveGame();
}

function showTransferListPopup(playerId) {
    const player = gameState.players.find(p => String(p.id) === String(playerId));
    if (!player) return;

    const marketValue = getPlayerMarketValue(player);
    const minPrice = Math.round(marketValue * 0.5 / 100) * 100;
    const maxPrice = Math.round(marketValue * 3 / 100) * 100;
    const defaultPrice = Math.round(marketValue / 100) * 100;
    const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };

    const overlay = document.createElement('div');
    overlay.className = 'transfer-list-overlay';
    overlay.innerHTML = `
        <div class="transfer-list-popup">
            <h3>Op transfermarkt zetten</h3>
            <div class="tlp-player">
                <span class="tlp-name">${player.name}</span>
                <span class="tlp-pos" style="background:${posData.color}">${posData.abbr}</span>
            </div>
            <div class="tlp-market-value">Marktwaarde: <strong>${formatCurrency(marketValue)}</strong></div>
            <div class="tlp-slider-section">
                <label class="tlp-price-label">Vraagprijs: <strong class="tlp-price-display">${formatCurrency(defaultPrice)}</strong></label>
                <input type="range" class="tlp-slider" min="${minPrice}" max="${maxPrice}" value="${defaultPrice}" step="100">
                <div class="tlp-slider-labels">
                    <span>Min (0.5x)</span>
                    <span>Marktwaarde</span>
                    <span>Max (3x)</span>
                </div>
            </div>
            <div class="tlp-buttons">
                <button class="btn tlp-confirm">Zet op Transfermarkt</button>
                <button class="btn tlp-cancel">Annuleren</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const slider = overlay.querySelector('.tlp-slider');
    const priceDisplay = overlay.querySelector('.tlp-price-display');

    slider.addEventListener('input', () => {
        priceDisplay.textContent = formatCurrency(parseInt(slider.value));
    });

    overlay.querySelector('.tlp-confirm').addEventListener('click', () => {
        const price = parseInt(slider.value);
        overlay.remove();
        listPlayerOnTransferMarket(playerId, price, true);
    });

    overlay.querySelector('.tlp-cancel').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

async function listPlayerOnTransferMarket(playerId, price, skipConfirm = false) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];

    const confirmed = skipConfirm || await showConfirm(`Wil je ${player.name} op de transfermarkt zetten voor ${formatCurrency(price)}?`);
    if (confirmed) {
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
                        stars: player.stars || 0,
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
                showNotification('Fout bij plaatsen op transfermarkt: ' + err.message, 'error');
                return;
            }
        } else {
            // Singleplayer: local transfer market
            gameState.players.splice(playerIndex, 1);
            player.price = price;
            player.listedByPlayer = true;
            gameState.transferMarket.players.push(player);
            gameState.stats.totalSales = (gameState.stats.totalSales || 0) + 1;
            if (price > (gameState.stats.highestSale || 0)) gameState.stats.highestSale = price;
            showNotification(`${player.name} staat nu op de transfermarkt voor ${formatCurrency(price)}!`, 'success');
        }

        document.getElementById('player-modal').classList.remove('active');
        renderPlayerCards();
        saveGame();
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

    // Move global tiles: mobile → top header bar, desktop → page header
    const tiles = document.querySelector('.global-top-tiles');
    if (window.matchMedia('(max-width: 768px)').matches) {
        const mobileHeader = document.querySelector('.mobile-header');
        if (tiles && mobileHeader && !mobileHeader.contains(tiles)) {
            mobileHeader.appendChild(tiles);
        }
    } else {
        const pageHeader = document.getElementById(page)?.querySelector('.page-header');
        if (tiles && pageHeader) pageHeader.appendChild(tiles);
    }


    // Close any open modals
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));

    // Scroll to top of the main content area
    const activePage = document.getElementById(page);
    if (activePage) activePage.scrollTop = 0;
    window.scrollTo(0, 0);

    // Clean up scout mission timer when leaving scout page
    if (page !== 'scout') clearScoutMissionTimer();

    // Always refresh dashboard checklist (it reads live gameState)
    if (page === 'dashboard') renderDashboardChecklist();

    // Render page-specific content
    if (page === 'squad') renderPlayerCards();
    if (page === 'tactics') renderTacticsPage();
    if (page === 'training') {
        renderProfileTraining();
        initTrainingTabs();
    }
    if (page === 'stadium') {
        if (!gameState.stadiumVisited) { gameState.stadiumVisited = true; saveGame(); }
        renderStadiumPage();
    }
    if (page === 'scout') renderScoutPage();
    if (page === 'transfers') renderTransferMarket();
    if (page === 'finances') {
        if (!gameState.stats.visitedFinances) {
            gameState.stats.visitedFinances = true;
            triggerAchievementCheck();
        }
        renderDailyFinances();
    }
    if (page === 'sponsors') renderSponsorsPage();
    // activities page removed
    if (page === 'staff') renderStaffCenterPage();
    // prestaties page merged into training
    if (page === 'mijnteam') openClubIdentityModal();
    if (page === 'jeugdteam') renderJeugdteamPage();
    if (page === 'kantine') renderKantineDashboard();
    if (page === 'wedstrijden') renderMatchesPage();
    if (page === 'bugs') {
        if (!gameState.stats.visitedBugsTab) {
            gameState.stats.visitedBugsTab = true;
            triggerAchievementCheck();
        }
        renderBugHistory();
        renderBugLeaderboard();
    }

    updateNavBadges();
}

function updateNavBadges() {
    // Tactiek: geen volle opstelling OF geen wedstrijdvoorbereiding geselecteerd
    const hasFullLineup = (gameState.lineup || []).filter(x => x !== null).length >= 11;
    const hasTeamTraining = gameState.training?.teamTraining?.selected != null;
    const tacticsBadge = document.getElementById('badge-tactics');
    if (tacticsBadge) tacticsBadge.style.display = (hasFullLineup && hasTeamTraining) ? 'none' : '';

    // Mijn Speler: nog niet getraind vandaag
    const mp = gameState.myPlayer;
    const trainedToday = mp && mp.lastTrainingDate === getTodayString();
    const trainingBadge = document.getElementById('badge-training');
    if (trainingBadge) trainingBadge.style.display = trainedToday ? 'none' : '';

    // Sponsors: geen shirtsponsor actief
    const hasSponsor = gameState.sponsor && gameState.sponsor.weeksRemaining > 0;
    const sponsorsBadge = document.getElementById('badge-sponsors');
    if (sponsorsBadge) sponsorsBadge.style.display = hasSponsor ? 'none' : '';

    // Jeugd: alle categorieën vol → niemand kan doorstromen
    const youthBadge = document.getElementById('badge-youth');
    if (youthBadge) {
        const hasAcademy = gameState.stadium?.academy && gameState.stadium.academy !== 'acad_0';
        if (hasAcademy) {
            const maxYouth = getYouthMaxPerCategory();
            const cat1Full = getYouthCategoryCount('12-13') >= maxYouth;
            const cat2Full = getYouthCategoryCount('14-15') >= maxYouth;
            const cat3Full = getYouthCategoryCount('16-17') >= maxYouth;
            youthBadge.style.display = (cat1Full && cat2Full && cat3Full) ? '' : 'none';
        } else {
            youthBadge.style.display = 'none';
        }
    }

    // Scouting: scout niet verstuurd vandaag, of scout terug met ongeziene speler
    const mission = gameState.scoutMission;
    const hasScout = gameState.staff?.scout !== null && gameState.staff?.scout !== undefined;
    const scoutUsedToday = mission?.lastScoutDate === getTodayString();
    const scoutActive = mission?.active && mission?.startTime;
    const hasNewTips = (gameState.scoutTips || []).length > 0;
    // Show badge if: has scout + not used today, OR new tips waiting
    const scoutNeedsAttention = (hasScout && !scoutUsedToday && !scoutActive) || hasNewTips;
    const scoutBadge = document.getElementById('badge-scout');
    if (scoutBadge) scoutBadge.style.display = scoutNeedsAttention ? '' : 'none';
}

let navigationInitialized = false;
function initNavigation() {
    // Guard: only attach listeners once (initNavigation can be called multiple times in multiplayer)
    if (navigationInitialized) return;
    navigationInitialized = true;

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

            // Mobile submenu toggle: second tap closes submenu + sidebar
            if (item.classList.contains('has-submenu') && item.classList.contains('submenu-open')) {
                item.classList.remove('submenu-open');
                document.querySelector('.sidebar')?.classList.remove('sidebar-open');
                document.getElementById('sidebar-overlay')?.classList.remove('active');
                document.getElementById('hamburger-btn')?.classList.remove('active');
                return;
            }

            // Close any other open submenus, open this one
            document.querySelectorAll('.nav-item.submenu-open').forEach(i => i.classList.remove('submenu-open'));
            if (item.classList.contains('has-submenu')) {
                item.classList.add('submenu-open');
            }

            navigateToPage(item.dataset.page);

            // Close mobile sidebar after navigation (only for items without submenu)
            if (!item.classList.contains('has-submenu')) {
                document.querySelector('.sidebar')?.classList.remove('sidebar-open');
                document.getElementById('sidebar-overlay')?.classList.remove('active');
                document.getElementById('hamburger-btn')?.classList.remove('active');
            }
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

            // Close submenu + mobile sidebar after navigation
            document.querySelectorAll('.nav-item.submenu-open').forEach(i => i.classList.remove('submenu-open'));
            document.querySelector('.sidebar')?.classList.remove('sidebar-open');
            document.getElementById('sidebar-overlay')?.classList.remove('active');
            document.getElementById('hamburger-btn')?.classList.remove('active');

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
            document.querySelectorAll('.nav-item.submenu-open').forEach(i => i.classList.remove('submenu-open'));
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
        const tabBtn = document.querySelector(`#training-tabs .page-tab[data-page-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'staff') {
        const tabBtn = document.querySelector(`.staff-tab[data-staff-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    } else if (page === 'wedstrijden') {
        const tabBtn = document.querySelector(`.matches-tab[data-matches-tab="${tab}"]`);
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
    // Achievement: budget below €1000
    if (budget < 1000 && !gameState.stats.budgetBelow1000) {
        gameState.stats.budgetBelow1000 = true;
        triggerAchievementCheck();
    }
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
    if (globalAmount) {
        globalAmount.textContent = formattedBudget;
    }
    if (globalBudget) {
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

let _trainingTimerInterval = null;
let _matchTimerInterval = null;

function startTimers() {
    // Clear existing intervals to prevent duplicates
    if (_trainingTimerInterval) clearInterval(_trainingTimerInterval);
    if (_matchTimerInterval) clearInterval(_matchTimerInterval);

    // Update training timer every second
    _trainingTimerInterval = setInterval(() => {
        updateTrainingTimers();
    }, 1000);

    // Update match timer
    _matchTimerInterval = setInterval(updateMatchTimer, 1000);
}

// ================================================
// TRANSFER MARKET
// ================================================

function generateTransferMarket() {

    const division = gameState.club.division;
    const count = random(7, 10);

    // Ensure at least 1 per position group: aanval, middenveld, verdediging, keeper
    const posGroups = {
        aanval: ['linksbuiten', 'rechtsbuiten', 'spits'],
        middenveld: ['linksMid', 'centraleMid', 'rechtsMid'],
        verdediging: ['linksback', 'centraleVerdediger', 'rechtsback'],
        keeper: ['keeper']
    };

    const players = [];

    // Generate 1 guaranteed player per position group
    for (const [group, positions] of Object.entries(posGroups)) {
        const pos = randomFromArray(positions);
        const player = generateTransferPlayer(division, pos);
        // Force 0 stars for guaranteed positional players
        if (division === 8) {
            player.stars = 0;
            player.starsMin = 0;
            player.starsMax = 1;
        }
        players.push(player);
    }

    // Generate exactly 1 player with 0.5 star potential
    const starPlayer = generateTransferPlayer(division);
    if (division === 8) {
        starPlayer.stars = 0.5;
        starPlayer.starsMin = 0.5;
        starPlayer.starsMax = 1.5;
        // Star player has lower overall — recalculate range to match
        starPlayer.overall = random(1, 4);
        starPlayer.overallMin = Math.max(1, starPlayer.overall - random(1, 3));
        starPlayer.overallMax = Math.min(99, starPlayer.overall + random(3, 8));
        starPlayer.signingBonus = random(100, 300);
        starPlayer.salary = random(5, 15);
    }
    players.push(starPlayer);

    // Fill remaining slots with random players
    const remaining = count - players.length;
    for (let i = 0; i < remaining; i++) {
        const player = generateTransferPlayer(division);
        if (division === 8) {
            player.stars = 0;
            player.starsMin = 0;
            player.starsMax = 1;
        }
        players.push(player);
    }

    gameState.transferMarket.players = players.sort((a, b) => (b.overallMax || b.overall) - (a.overallMax || a.overall));
    gameState.transferMarket.lastRefresh = Date.now();
    gameState._lastTransferMarketDate = new Date().toDateString();
}

function generateTransferPlayer(division, forcePosition) {
    let playerDiv;
    if (division === 8) {
        playerDiv = 8;
    } else {
        const roll = Math.random();
        if (roll < 0.40) playerDiv = division;
        else if (roll < 0.65) playerDiv = Math.max(1, division - 1);
        else if (roll < 0.85) playerDiv = Math.max(1, division - 2);
        else playerDiv = Math.max(1, division - 3);
    }

    const player = generatePlayer(playerDiv, forcePosition);

    // Cap overall to division max
    const divInfo = getDivision(playerDiv);
    if (player.overall > divInfo.maxAttr) {
        player.overall = random(Math.max(divInfo.minAttr, divInfo.maxAttr - 3), divInfo.maxAttr);
    }

    // 6e Klasse: gratis agenten, tekengeld op basis van leeftijd/persoonlijkheid
    if (playerDiv === 8) {
        player.price = 0;
        player.stars = player.overall < 5 ? 0.5 : 0;
        player.starsMin = player.stars;
        player.starsMax = Math.min(5, player.stars + 1);
        player.salary = calculateSalary(8, player.age, player.stars);
        // Tekengeld: gemiddeld ~1000, gebaseerd op overall
        const basBonus = player.overall * 150 + random(100, 400);
        const leeftijdsBonus = player.age >= 28 ? 100 : 0;
        player.signingBonus = Math.round((basBonus + leeftijdsBonus) / 10) * 10;
        player.isFreeAgent = true;
    } else {
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

    // Overall uncertainty range
    const variance = random(3, 8);
    let rangeBelow, rangeAbove;
    if (Math.random() < 0.5) {
        rangeBelow = random(0, Math.floor(variance * 0.6));
        rangeAbove = variance * 2 - rangeBelow;
    } else {
        rangeBelow = random(1, variance * 2 - 1);
        rangeAbove = variance * 2 - rangeBelow;
    }
    player.overallMin = Math.max(1, player.overall - rangeBelow);
    player.overallMax = Math.min(99, player.overall + rangeAbove);

    // Price based on estimated overall (skip for 6e Klasse) — salary already set by generatePlayer/calculateSalary
    if (playerDiv !== 8) {
        if (player.price > 0) {
            const inflatedOverall = Math.round((player.overallMin + player.overallMax * 3) / 4);
            const origPlayer = { ...player, overall: inflatedOverall };
            player.price = calculatePlayerValue(origPlayer, playerDiv);
        }
    }

    // Stars uncertainty range (skip for 6e Klasse)
    if (playerDiv !== 8) {
        const starsVariance = Math.random() < 0.5 ? 0.5 : 1;
        player.starsMin = Math.max(0, player.stars - starsVariance);
        player.starsMax = Math.min(5, player.stars + starsVariance);
    }

    // Minimaal gewenst niveau
    if (playerDiv < division) {
        player.minDivision = Math.random() < 0.20 ? division : playerDiv;
    } else {
        player.minDivision = division;
    }

    return player;
}

/**
 * Check if transfer market needs daily refresh
 */
function checkTransferMarketDaily() {
    const today = new Date().toDateString();
    if (gameState._lastTransferMarketDate === today) return;
    generateTransferMarket();
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
    // Mark as visited for checklist
    if (!gameState.transfersVisited) { gameState.transfersVisited = true; saveGame(); }

    const container = document.getElementById('transfer-list');
    if (!container) return;


    // Get active filters
    const positionFilter = document.querySelector('.transfer-filter.active')?.dataset.filter || 'all';
    const clubDiv = gameState.club.division;

    let players = [...gameState.transferMarket.players];

    // Apply position filter
    if (positionFilter !== 'all') {
        players = players.filter(p => getPositionGroup(p.position) === positionFilter);
    }

    if (players.length === 0) {
        container.innerHTML = '<p class="no-results">Geen spelers gevonden met deze filters.</p>';
        return;
    }

    // Group by position (like squad page)
    const groups = {
        attacker: { name: 'Aanvallers', icon: '⚽', color: '#9c27b0', players: [] },
        midfielder: { name: 'Middenvelders', icon: '⚙️', color: '#4caf50', players: [] },
        defender: { name: 'Verdedigers', icon: '🛡️', color: '#2196f3', players: [] },
        goalkeeper: { name: 'Keepers', icon: '🧤', color: '#f9a825', players: [] }
    };

    players.forEach(player => {
        const group = getPositionGroup(player.position);
        if (groups[group]) groups[group].players.push(player);
    });

    let html = '';
    for (const [key, group] of Object.entries(groups)) {
        if (group.players.length === 0) continue;

        html += `<div class="squad-group">
            <div class="squad-group-header" style="background: ${group.color}">
                <span class="squad-group-icon">${group.icon}</span>
                <span class="squad-group-name">${group.name}</span>
                <span class="squad-group-count">${group.players.length}</span>
            </div>
            <div class="squad-group-players">`;

        group.players.forEach(player => {
            const posData = POSITIONS[player.position] || { abbr: '??', color: '#666' };
            const overallDisplay = player.overallMin !== undefined ? `${player.overallMin}-${player.overallMax}` : player.overall;
            const priceText = player.price === 0 ? 'Transfervrij' : formatCurrency(player.price);
            const minDiv = player.minDivision ?? clubDiv;
            const isInterested = minDiv >= clubDiv;
            const minDivInfo = getDivision(minDiv);

            // Stars rating — show range if uncertainty exists, fallback for old saves
            const starsVarianceFallback = Math.random() < 0.5 ? 0.5 : 1;
            const starsMin = player.starsMin ?? Math.max(0, player.stars - starsVarianceFallback);
            const starsMax = player.starsMax ?? Math.min(5, player.stars + starsVarianceFallback);
            if (player.starsMin === undefined) { player.starsMin = starsMin; player.starsMax = starsMax; }

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
                        <span class="pc-value">${formatCurrency(player.signingBonus || player.price || 0)}</span>
                    </span>
                    <div class="pc-ratings">
                        <div class="pc-overall" style="background: ${posData.color}">
                            <span class="pc-overall-value">${overallDisplay}</span>
                            <span class="pc-overall-label">ALG</span>
                        </div>
                        <div class="pc-potential-stars">
                            <span class="pc-stars">${renderStarsRangeHTML(starsMin, starsMax)}</span>
                            <span class="pc-potential-label">POT</span>
                        </div>
                    </div>
                    ${isInterested
                        ? `<button class="btn btn-primary btn-sm btn-transfer-buy" data-player-id="${player.id}">${player.price === 0 ? 'Contracteren' : 'Kopen'}</button>`
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

}

async function handleTransferBuy(playerId) {
    const player = gameState.transferMarket.players.find(p => p.id === playerId);
    if (!player) return;

    // Free agent: use contract negotiation flow (same as youth players)
    if (player.price === 0) {
        await handleFreeAgentContract(player);
        return;
    }

    const totalCost = player.price + (player.signingBonus || 0);

    if (totalCost > gameState.club.budget) {
        showNotification('Je hebt niet genoeg budget!', 'error');
        return;
    }

    const costText = formatCurrency(player.price);

    if (await showConfirm(`Wil je ${player.name} kopen voor ${costText}?`)) {
        if (isMultiplayer() && player._listingId) {
            try {
                const { data, error } = await supabase.rpc('execute_transfer', {
                    p_listing_id: player._listingId,
                    p_buyer_club_id: gameState.multiplayer.clubId,
                    p_buyer_user_id: gameState.multiplayer.userId
                });

                if (error) throw error;
                if (!data.success) {
                    showNotification(data.error || 'Transfer mislukt', 'error');
                    return;
                }

                await loadMultiplayerTransferMarket();
                gameState.club.budget -= data.total_cost;
                showNotification(`${player.name} is gekocht!`, 'success');
            } catch (err) {
                showNotification('Transfer mislukt: ' + err.message, 'error');
                return;
            }
        } else {
            if (gameState.players.length >= 18) {
                showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
                return;
            }

            // Contract negotiation after agreeing transfer fee
            const salary = player.salary;
            const bonus = 0; // signing bonus is already in the transfer price
            const choice = await showContractOffer(player, salary, bonus);

            if (choice === 'refuse') {
                // Player leaves the market
                gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
                renderTransferMarket();
                await showAlert(`${player.name} is beledigd en trekt zich terug van de markt.`);
                return;
            }

            let finalSalary = salary;
            if (choice === 'negotiate') {
                if (Math.random() < 0.75) {
                    const discount = 0.05 + Math.random() * 0.25;
                    const newSalary = Math.max(1, Math.round(salary * (1 - discount)));
                    const accepted = await showNegotiationResult(player, salary, bonus, newSalary, 0);
                    if (!accepted) {
                        showNotification(`Onderhandeling met ${player.name} afgebroken.`, 'info');
                        return;
                    }
                    finalSalary = newSalary;
                } else {
                    // Player refuses to negotiate and leaves
                    gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
                    renderTransferMarket();
                    await showAlert(`${player.name} voelt zich niet gewaardeerd en trekt zich terug van de markt.`);
                    return;
                }
            }

            // Transfer succeeds — pay and add player
            const hasRange = player.overallMin !== undefined;
            const minVal = player.overallMin || player.overall;
            const maxVal = player.overallMax || player.overall;
            const realVal = player.overall;
            const sMin = player.starsMin;
            const sMax = player.starsMax;
            const sReal = player.stars;
            delete player.overallMin;
            delete player.overallMax;
            delete player.starsMin;
            delete player.starsMax;
            player.salary = finalSalary;
            player.energy = 100;
            gameState.club.budget -= totalCost;
            gameState.players.push(player);
            if (isMultiplayer()) {
                const dbPlayer = await insertPlayerToSupabase(player, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
                if (dbPlayer) player.id = dbPlayer.id; // sync local ID with DB UUID
            }
            gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
            gameState.stats.totalTransfers = (gameState.stats.totalTransfers || 0) + 1;
            gameState.stats.seasonSpending = (gameState.stats.seasonSpending || 0) + totalCost;
            if (totalCost < 200) gameState.stats.cheapTransfer = true;
            if (totalCost >= 1000000) gameState.stats.expensiveTransfer = true;
            // Achievement flags
            if (realVal <= 5) gameState.stats.boughtBadPlayer = true;
            gameState.stats.signedUnscouted = true;
            if ((sReal || 0) >= 0.5) gameState.stats.signedHighPotential = true;
            updateBudgetDisplays();
            renderTransferMarket();
            if (hasRange) await showOverallReveal(player.name, minVal, maxVal, realVal, sMin, sMax, sReal);
            triggerAchievementCheck();
            saveGame();
            showNotification(`${player.name} is toegevoegd aan je selectie!`, 'success');
        }

    }
}

async function handleFreeAgentContract(player) {
    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    const salary = player.salary;
    const bonus = player.signingBonus || 0;

    if (bonus > gameState.club.budget) {
        showNotification('Je hebt niet genoeg budget voor het tekengeld!', 'error');
        return;
    }

    const choice = await showContractOffer(player, salary, bonus);

    if (choice === 'accept') {
        finalizeFreeAgentTransfer(player, salary, bonus);
    } else if (choice === 'negotiate') {
        if (Math.random() < 0.75) {
            const discount = 0.05 + Math.random() * 0.25;
            const newSalary = Math.max(1, Math.round(salary * (1 - discount)));
            const newBonus = Math.round(bonus * (1 - discount) / 10) * 10;

            const accepted = await showNegotiationResult(player, salary, bonus, newSalary, newBonus);
            if (accepted) {
                finalizeFreeAgentTransfer(player, newSalary, newBonus);
            } else {
                showNotification(`Onderhandeling met ${player.name} afgebroken.`, 'info');
            }
        } else {
            gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
            renderTransferMarket();
            await showAlert(`${player.name} voelt zich niet gewaardeerd en trekt zich terug van de markt.`);
        }
    } else if (choice === 'refuse') {
        gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
        renderTransferMarket();
        await showAlert(`${player.name} is beledigd en trekt zich terug van de markt.`);
    }
}

async function finalizeFreeAgentTransfer(player, salary, bonus) {
    const hasRange = player.overallMin !== undefined;
    const minVal = player.overallMin || player.overall;
    const maxVal = player.overallMax || player.overall;
    const realVal = player.overall;
    const sMin = player.starsMin;
    const sMax = player.starsMax;
    const sReal = player.stars;

    player.salary = salary;
    player.energy = 100;
    delete player.overallMin;
    delete player.overallMax;
    delete player.starsMin;
    delete player.starsMax;
    gameState.club.budget -= bonus;
    gameState.players.push(player);
    if (isMultiplayer()) {
        const dbPlayer = await insertPlayerToSupabase(player, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
        if (dbPlayer) player.id = dbPlayer.id;
    }
    gameState.transferMarket.players = gameState.transferMarket.players.filter(p => p.id !== player.id);
    // Achievement flags
    if (realVal <= 5) gameState.stats.boughtBadPlayer = true;
    gameState.stats.signedUnscouted = true;
    if ((sReal || 0) >= 0.5) gameState.stats.signedHighPotential = true;
    updateBudgetDisplays();
    renderTransferMarket();

    if (hasRange) await showOverallReveal(player.name, minVal, maxVal, realVal, sMin, sMax, sReal);
    triggerAchievementCheck();
    showNotification(`${player.name} heeft getekend! Tekengeld: ${formatCurrency(bonus)}`, 'success');
    saveGame();
}

function initTransferMarket() {
    // Daily refresh or generate if empty
    checkTransferMarketDaily();
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
        attacker: { label: 'AAN', color: '#9c27b0', players: [] },
        midfielder: { label: 'MID', color: '#4caf50', players: [] },
        defender: { label: 'DEF', color: '#2196f3', players: [] },
        goalkeeper: { label: 'KEE', color: '#f9a825', players: [] }
    };

    // Get players not in lineup (include "Mijn Speler")
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const myPlayerEntry = {
        id: 'myplayer',
        name: mp.name,
        age: mp.age,
        position: mp.position,
        overall: mpOverall,
        stars: mp.stars || 1,
        isMyPlayer: true,
        energy: mp.energy || 100,
        nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
        attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
    };
    const allPlayers = [myPlayerEntry, ...gameState.players.filter(p => !p.isMyPlayer)];
    const lineupIds = Object.values(gameState.lineup).filter(p => p).map(p => p.id);
    const availablePlayers = allPlayers.filter(p => !lineupIds.includes(p.id));

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
                <div class="sidebar-group-header" style="background: ${data.color}; color: white; padding: 2px 6px; border-radius: 4px;">${data.label}</div>
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

function clearLineup() {
    gameState.lineup = gameState.lineup.map(() => null);
    renderLineupPitch();
    renderAvailablePlayers();
    saveGame();
}

// Lineup dropdown functions
function openLineupDropdown(event, positionIndex, role) {
    event.stopPropagation();

    // Close any existing dropdown
    closeLineupDropdown();

    const slot = event.currentTarget;
    const posData = POSITIONS[role] || { abbr: '??', color: '#666', group: 'midfielder' };

    // Get available players (not in lineup) that fit this position, including "Mijn Speler"
    const mp = initMyPlayer();
    const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
    const myPlayerEntry = {
        id: 'myplayer',
        name: mp.name,
        age: mp.age,
        position: mp.position,
        overall: mpOverall,
        stars: mp.stars || 1,
        isMyPlayer: true,
        energy: mp.energy || 100,
        attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
    };
    const allPlayers = [myPlayerEntry, ...gameState.players.filter(p => !p.isMyPlayer)];
    const lineupIds = Object.values(gameState.lineup).filter(p => p).map(p => p.id);
    const availablePlayers = allPlayers.filter(p => !lineupIds.includes(p.id));

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
                <div class="dropdown-player" onclick="selectLineupPlayer(${positionIndex}, '${player.id}')">
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
                <div class="dropdown-player alt" onclick="selectLineupPlayer(${positionIndex}, '${player.id}')">
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
    playerId = parsePlayerId(playerId);
    // Check gameState.players first, then try "Mijn Speler"
    let player = gameState.players.find(p => p.id === playerId);
    if (!player && playerId === 'myplayer') {
        const mp = initMyPlayer();
        const mpOverall = Math.round((mp.attributes.SNE + mp.attributes.TEC + mp.attributes.PAS + mp.attributes.SCH + mp.attributes.VER + mp.attributes.FYS) / 6);
        player = {
            id: 'myplayer', name: mp.name, age: mp.age, position: mp.position,
            overall: mpOverall, stars: mp.stars || 1, isMyPlayer: true,
            energy: mp.energy || 100,
            nationality: { code: 'NL', flag: '🇳🇱', name: 'Nederlands' },
            attributes: { AAN: mp.attributes.SCH, VER: mp.attributes.VER, SNE: mp.attributes.SNE, FYS: mp.attributes.FYS }
        };
    }
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
window.clearLineup = clearLineup;
window.buyoutPlayer = buyoutPlayer;
window.showTransferListPopup = showTransferListPopup;
window.showPlayerDetail = showPlayerDetail;
window.showOpponentSquad = showOpponentSquad;
window.openLineupDropdown = openLineupDropdown;
window.selectLineupPlayer = selectLineupPlayer;

// ================================================
// CLUB SETTINGS
// ================================================

function applyClubColors() {
    document.documentElement.style.setProperty('--primary-green', gameState.club.colors.primary);
    document.documentElement.style.setProperty('--cream', gameState.club.colors.secondary);
    document.documentElement.style.setProperty('--orange', gameState.club.colors.accent);

    // Update badge with colors + club name
    updateMainBadgeSVG();
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
                            <span>Je kunt je kleuren <strong>1x per seizoen</strong> wijzigen.</span>
                        </div>
                    `}
                    <div class="club-id-field">
                        <label for="club-id-name">Clubnaam</label>
                        <input type="text" id="club-id-name" class="form-input" maxlength="25" value="${gameState.club.name}" disabled>
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

    const p = document.getElementById('club-id-primary')?.value;
    const s = document.getElementById('club-id-secondary')?.value;
    const a = document.getElementById('club-id-accent')?.value;

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
        showNotification('Je hebt je club dit seizoen al aangepast. Wacht tot volgend seizoen.', 'warning');
        return;
    }

    const nameInput = document.getElementById('team-name-input');
    const primaryColor = document.getElementById('team-primary-color');
    const secondaryColor = document.getElementById('team-secondary-color');
    const accentColor = document.getElementById('team-accent-color');

    if (!nameInput?.value.trim()) {
        showNotification('Voer een geldige clubnaam in.', 'warning');
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

    showNotification('Club instellingen opgeslagen! Dit kan pas volgend seizoen weer gewijzigd worden.', 'success');
}

function updateMainBadgeSVG() {
    const badgeSvg = document.getElementById('club-badge-svg');
    if (!badgeSvg) return;

    const { primary, secondary, accent } = gameState.club.colors;
    const clubName = gameState.club.name || 'FC Goals Maken';

    // Update main badge
    const badgePath = badgeSvg.querySelector('#badge-path');
    const fcText = badgeSvg.querySelector('#badge-text-fc');
    const line1Text = badgeSvg.querySelector('#badge-text-1');
    const line2Text = badgeSvg.querySelector('#badge-text-2');

    if (badgePath) {
        badgePath.setAttribute('fill', primary);
        badgePath.setAttribute('stroke', secondary);
    }

    // Split club name into lines for the badge
    const words = clubName.split(' ');
    let prefix = '';
    let rest = words;
    // Extract common prefixes (FC, VV, SV, SC, etc.)
    if (words.length > 1 && ['FC', 'VV', 'SV', 'SC', 'AV', 'HV', 'RV', 'BV'].includes(words[0].toUpperCase())) {
        prefix = words[0].toUpperCase();
        rest = words.slice(1);
    }
    // Split remaining words into two lines
    const mid = Math.ceil(rest.length / 2);
    const nameLine1 = rest.slice(0, mid).join(' ').toUpperCase();
    const nameLine2 = rest.slice(mid).join(' ').toUpperCase();

    if (fcText) {
        fcText.textContent = prefix;
        fcText.setAttribute('fill', secondary);
    }
    if (line1Text) {
        line1Text.textContent = nameLine1;
        // Shrink font if name is long
        const fontSize = nameLine1.length > 10 ? 11 : nameLine1.length > 7 ? 13 : 16;
        line1Text.setAttribute('font-size', fontSize);
        line1Text.setAttribute('fill', accent);
    }
    if (line2Text) {
        line2Text.textContent = nameLine2;
        const fontSize = nameLine2.length > 10 ? 10 : 12;
        line2Text.setAttribute('font-size', fontSize);
        line2Text.setAttribute('fill', secondary);
    }

    // Update all elements that use secondary color for fill
    badgeSvg.querySelectorAll('[fill="var(--text-primary)"]').forEach(el => {
        el.setAttribute('fill', secondary);
    });

    // Update all strokes
    badgeSvg.querySelectorAll('[stroke="var(--text-primary)"]').forEach(el => {
        el.setAttribute('stroke', secondary);
    });

    // Sync match preview home-badge with updated sidebar badge
    const homeBadge = document.querySelector('.home-badge');
    if (homeBadge) {
        const clone = badgeSvg.cloneNode(true);
        clone.removeAttribute('id');
        homeBadge.innerHTML = '';
        homeBadge.appendChild(clone);
    }
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

    // Sort: visible achievements first, hidden (??) ones at the bottom
    allAchievements.sort((a, b) => {
        const aHidden = a.hidden && !a.unlocked ? 1 : 0;
        const bHidden = b.hidden && !b.unlocked ? 1 : 0;
        return aHidden - bHidden;
    });

    // Render achievements grid
    let html = '';
    allAchievements.forEach(achievement => {
        const isHidden = achievement.hidden && !achievement.unlocked;
        const displayName = isHidden ? 'Verborgen' : achievement.name;
        const displayDesc = isHidden ? '???' : achievement.description;
        const showProgress = !achievement.unlocked && !isHidden && achievement.progressTarget > 0;
        const progressBar = showProgress
            ? `<div class="ach-card-progress"><div class="ach-card-progress-fill" style="width:${Math.round((achievement.progressCurrent / achievement.progressTarget) * 100)}%"></div><span class="ach-card-progress-text">${achievement.progressCurrent}/${achievement.progressTarget}</span></div>`
            : '';

        html += `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''} ${achievement.hidden ? 'hidden-achievement' : ''}">
                <div class="achievement-icon">${isHidden ? '❓' : achievement.icon}</div>
                <div class="achievement-info">
                    <span class="achievement-name">${displayName}</span>
                    <span class="achievement-desc">${displayDesc}</span>
                    ${progressBar}
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
    // Mark as visited for checklist
    if (!gameState.youthVisited) { gameState.youthVisited = true; saveGame(); }

    // If academy is demolished, don't generate players
    if (gameState.stadium?.academy === 'acad_0') {
        // Still update UI to show "build" option
        updateAcademyUI();
        return;
    }

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

    // Demolished state — show rebuild option
    if (currentId === 'acad_0') {
        if (capCard) capCard.innerHTML = '';
        const rebuildLevel = config.levels.find(l => l.id === 'acad_1');
        const rebuildCost = rebuildLevel?.cost || 1500;
        card.innerHTML = `
            <div class="acad-current">
                <div class="acad-current-top">
                    <span class="acad-icon">🏚️</span>
                    <div class="acad-current-info">
                        <span class="acad-current-name">Geen Jeugdopleiding</span>
                        <span class="acad-current-lvl">Afgebroken</span>
                    </div>
                </div>
                <p style="color:var(--text-secondary);font-size:0.8rem;margin:8px 0">Je hebt geen jeugdopleiding. Bouw er een om jeugdspelers op te leiden.</p>
                <button class="btn btn-primary" id="btn-academy-rebuild">Jeugdopleiding bouwen — ${formatCurrency(rebuildCost)}</button>
            </div>
        `;
        const rebuildBtn = document.getElementById('btn-academy-rebuild');
        if (rebuildBtn) {
            rebuildBtn.onclick = async () => {
                if (gameState.club.budget < rebuildCost) {
                    showNotification('Niet genoeg budget!', 'warning');
                    return;
                }
                if (!await showConfirm(`Jeugdopleiding bouwen voor ${formatCurrency(rebuildCost)}? Dit kost ${formatCurrency(250)}/week aan onderhoud.`)) return;
                gameState.club.budget -= rebuildCost;
                gameState.stadium.academy = 'acad_1';
                saveGame();
                showNotification('Jeugdopleiding gebouwd! Kosten: €250/week', 'success');
                renderJeugdteamPage();
            };
        }
        return;
    }
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const currentLevel = config.levels[currentIndex];
    const nextLevel = config.levels[currentIndex + 1];
    const levelNum = currentIndex; // acad_0 = index 0 = not built, acad_1 = index 1 = Lvl 1
    const maxPerCat = getYouthMaxPerCategory();

    const groups = [
        { label: 'Pupillen', shortLabel: '12-13', age: '12-13' },
        { label: 'Junioren', shortLabel: '14-15', age: '14-15' },
        { label: 'Aspiranten', shortLabel: '16-17', age: '16-17' }
    ];

    // Capacity card (separate tile above)
    if (capCard) {
        capCard.innerHTML = `
            <div class="acad-capacity-title">Plekken per categorie</div>
            ${groups.map(g => {
                const count = getYouthCategoryCount(g.age);
                const full = count >= maxPerCat;
                return `<div class="acad-cap-row ${full ? 'full' : ''}">
                    <span class="acad-cap-label">${g.shortLabel}</span>
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
        const nextLevelNum = currentIndex + 1;
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
                    <span class="acad-upgrade-stars-label">Max instroom</span>
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
                <span class="acad-stars-label">Max instroom</span>
                <span class="pc-stars">${currentStarsHtml}</span>
            </div>
            <div class="acad-running-cost">Kosten: <strong>${formatCurrency(250)}/week</strong></div>
            <button class="btn btn-danger-outline acad-demolish-btn" id="btn-academy-demolish">Jeugdopleiding afbreken</button>
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

    // Demolish button
    const demolishBtn = document.getElementById('btn-academy-demolish');
    if (demolishBtn) {
        demolishBtn.onclick = async () => {
            const youthCount = (gameState.youthPlayers || []).length;
            const msg = youthCount > 0
                ? `Weet je zeker dat je de jeugdopleiding wilt afbreken? Je verliest al je ${youthCount} jeugdspelers en bespaart €250/week.`
                : 'Weet je zeker dat je de jeugdopleiding wilt afbreken? Je bespaart €250/week.';
            if (!await showConfirm(msg)) return;
            gameState.youthPlayers = [];
            gameState.stadium.academy = 'acad_0';
            saveGame();
            showNotification('Jeugdopleiding afgebroken. Alle jeugdspelers zijn vertrokken.', 'info');
            renderJeugdteamPage();
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

function processYouthDaily() {
    const today = new Date().toDateString();
    if (gameState._lastYouthDailyDate === today) return;
    gameState._lastYouthDailyDate = today;

    const hasAcademy = gameState.stadium?.academy && gameState.stadium.academy !== 'acad_0';
    if (!hasAcademy) return;

    if (!gameState.youthPlayers) gameState.youthPlayers = [];

    // Age all youth players by 1 year each day
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

    // Daily training growth: youth players improve based on potential stars
    gameState.youthPlayers.forEach(player => {
        const stars = player.potentialStars || 0;
        if (stars >= 1) {
            player.overall = Math.min(99, player.overall + random(0, 2));
        } else if (stars >= 0.5) {
            player.overall = Math.min(99, player.overall + random(0, 1));
        }
    });

    // Daily pupil intake: add a new 12-year-old if there's room in pupillen
    const maxPerCategory = getYouthMaxPerCategory();
    const pupillenCount = getYouthCategoryCount('12-13');
    if (pupillenCount < maxPerCategory) {
        const maxStars = getAcademyMaxStars();
        const newPupil = generateYouthPlayer(12, 12);
        const steps = Math.floor(maxStars / 0.5);
        newPupil.potentialStars = (random(1, steps) * 0.5);
        gameState.youthPlayers.push(newPupil);
    }
}

function generateInitialYouthPlayers() {
    const maxStars = getAcademyMaxStars();
    const ageGroups = [
        { min: 12, max: 13, count: 2 },
        { min: 14, max: 15, count: 2 },
        { min: 16, max: 17, count: 1 }
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
    const names = NAMES_BY_NATIONALITY[nationality.code] || NAMES_BY_NATIONALITY.NL;
    const firstName = randomFromArray(names.first);
    const lastName = randomFromArray(names.last);

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
                ${canSign ? `<button class="btn btn-primary btn-sign-contract btn-sm"
                        data-player-id="${player.id}">
                    Contract aanbieden
                </button>` : ''}
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

async function signYouthContract(playerId) {
    const playerIndex = gameState.youthPlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const youthPlayer = gameState.youthPlayers[playerIndex];

    if (youthPlayer.age < 16) {
        showNotification('Deze speler is te jong voor het eerste team.', 'warning');
        return;
    }

    if (gameState.players.length >= 18) {
        showNotification('Selectie is vol! (max 18 spelers). Koop eerst een contract af.', 'warning');
        return;
    }

    // Calculate salary — youth players are cheap (eager to play)
    const division = gameState.club.division;
    const salary = calculateSalary(division, youthPlayer.age, youthPlayer.potentialStars || 1);
    const youthDiscount = 0.5 + Math.random() * 0.2; // 50-70% of normal
    const finalSalary = Math.max(5, Math.round(salary * youthDiscount));

    // Tekenbonus: based on salary, not quality
    const bonus = Math.round(finalSalary * (2 + random(0, 4)));

    // Show contract offer modal
    const choice = await showContractOffer(youthPlayer, finalSalary, bonus);

    // Re-find index (in case anything changed during modal)
    const currentIndex = gameState.youthPlayers.findIndex(p => p.id === playerId);
    if (currentIndex === -1) return;

    if (choice === 'accept') {
        createProfessionalFromYouth(currentIndex, finalSalary, bonus);
    } else if (choice === 'negotiate') {
        // 75% chance of successful negotiation, 25% player refuses
        if (Math.random() < 0.75) {
            const discount = 0.05 + Math.random() * 0.25; // 5-30% korting
            const newSalary = Math.max(1, Math.round(finalSalary * (1 - discount)));
            const newBonus = Math.round(bonus * (1 - discount) / 10) * 10;

            const accepted = await showNegotiationResult(youthPlayer, finalSalary, bonus, newSalary, newBonus);
            const idx = gameState.youthPlayers.findIndex(p => p.id === playerId);
            if (idx === -1) return;

            if (accepted) {
                createProfessionalFromYouth(idx, newSalary, newBonus);
            } else {
                showNotification(`Onderhandeling met ${youthPlayer.name} afgebroken.`, 'info');
            }
        } else {
            // Player refuses and leaves
            gameState.youthPlayers.splice(currentIndex, 1);
            renderYouthPlayers(currentYouthAgeGroup);
            updateAcademyCapacity();
            updateYouthTabBadges();
            await showAlert(`${youthPlayer.name} voelt zich niet gewaardeerd en verlaat de jeugdopleiding.`);
            saveGame();
        }
    } else if (choice === 'refuse') {
        gameState.youthPlayers.splice(currentIndex, 1);
        renderYouthPlayers(currentYouthAgeGroup);
        updateAcademyCapacity();
        updateYouthTabBadges();
        await showAlert(`${youthPlayer.name} is woedend weggelopen en verlaat de club.`);
        saveGame();
    }
}

async function createProfessionalFromYouth(playerIndex, salary, bonus) {
    const youthPlayer = gameState.youthPlayers[playerIndex];

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

    // Subtract signing bonus from budget
    gameState.club.budget -= bonus;

    // In multiplayer, insert player into Supabase to get UUID
    if (isMultiplayer() && gameState.multiplayer?.clubId && gameState.multiplayer?.leagueId) {
        const dbPlayer = await insertPlayerToSupabase(professionalPlayer, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
        if (dbPlayer) professionalPlayer.id = dbPlayer.id;
    }

    // Add to squad and remove from youth
    gameState.players.push(professionalPlayer);
    gameState.youthPlayers.splice(playerIndex, 1);

    // Achievement: signed high potential (stars ≥ 0.5)
    if ((professionalPlayer.stars || 0) >= 0.5) gameState.stats.signedHighPotential = true;
    triggerAchievementCheck();

    renderYouthPlayers(currentYouthAgeGroup);
    updateAcademyCapacity();
    updateYouthTabBadges();
    showNotification(`${youthPlayer.name} heeft een profcontract getekend! Tekenbonus: ${formatCurrency(bonus)}`, 'success');
    saveGame();
}

function dismissYouthPlayer(playerId) {
    const playerIndex = gameState.youthPlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.youthPlayers[playerIndex];
    gameState.youthPlayers.splice(playerIndex, 1);

    // Achievement: dismissed a youth player
    gameState.stats.dismissedYouth = true;
    triggerAchievementCheck();

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
    const wasHome = lastMatch ? (lastMatch.isHome === true) : true;
    const capacity = gameState.stadium.capacity || 200;
    const fans = gameState.club.fans || 50;
    const ticketPrice = 10;
    const maxAttendance = Math.min(capacity, fans);
    const attendance = wasHome ? maxAttendance : 0;
    const ticketIncome = attendance * ticketPrice;

    // Shirt sponsor (matchIncome = per match = per week)
    const shirtIncome = gameState.sponsor?.matchIncome || 0;

    // Win bonus (potential, not guaranteed)
    const winBonus = gameState.sponsor?.winBonus || 0;

    // Board sponsor — full value always, homeOnly flag for display
    const bordFull = gameState.sponsorSlots?.bord?.weeklyIncome || 0;
    const bordIncome = wasHome ? bordFull : 0;

    // Kantine income — full value always, homeOnly flag for display
    const kantineConfig = STADIUM_TILE_CONFIG?.kantine?.levels.find(l => l.id === gameState.stadium.kantine);
    const kantineMatch = kantineConfig?.effect?.match(/€(\d+)/);
    const kantineFull = kantineMatch ? parseInt(kantineMatch[1]) : 0;
    const kantineIncome = wasHome ? kantineFull : 0;

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

    // Youth academy running cost
    const hasAcademy = gameState.stadium?.academy && gameState.stadium.academy !== 'acad_0';
    const academyCost = hasAcademy ? 250 : 0;

    const totalIncome = ticketIncome + shirtIncome + bordIncome + kantineIncome;
    const totalExpense = playerSalaries + staffSalaries + maintenance + scoutingCost + academyCost;
    const weeklyResult = totalIncome - totalExpense;

    return {
        income: [
            { label: 'Kaartverkoop', value: ticketIncome, fullValue: wasHome ? ticketIncome : maxAttendance * ticketPrice, homeOnly: true, detail: wasHome ? `${attendance} toeschouwers` : '' },
            { label: 'Shirtsponsor', value: shirtIncome },
            { label: 'Bordsponsor', value: bordIncome, fullValue: bordFull, homeOnly: true },
            { label: 'Horeca', value: kantineIncome, fullValue: kantineFull, homeOnly: true }
        ],
        wasHome,
        expense: [
            { label: 'Spelerssalarissen', value: playerSalaries },
            { label: 'Stafsalarissen', value: staffSalaries },
            { label: 'Stadiononderhoud', value: maintenance },
            { label: 'Jeugdscouting', value: scoutingCost },
            { label: 'Jeugdopleiding', value: academyCost }
        ],
        winBonus,
        totalIncome,
        totalExpense,
        weeklyResult
    };
}

function applyWeeklyFinances(didWin) {
    const fin = calculateWeeklyFinances();
    let delta = fin.weeklyResult;

    if (didWin && fin.winBonus > 0) {
        delta += fin.winBonus;
    }

    gameState.club.budget += delta;
    console.log(`💰 Weekresultaat: ${delta >= 0 ? '+' : ''}€${delta} → Budget: €${gameState.club.budget}`);

    // Bankroet check: alleen als budget < 0 én wekelijks resultaat ook negatief
    if (gameState.club.budget < 0 && fin.weeklyResult < 0) {
        checkBankruptcy();
    }

    return delta;
}

function checkBankruptcy() {
    if (gameState.club.budget >= 0) return;

    const deficit = Math.abs(gameState.club.budget);
    // Noodlening: dek het tekort + €500 buffer
    const loanAmount = deficit + 500;
    gameState.club.budget += loanAmount;

    // Puntenaftrek: -3 punten in de huidige competitie
    const pointsDeducted = 3;
    const clubName = gameState.club.name;
    const team = gameState.standings?.find(t => t.name === clubName);
    if (team) {
        team.points = Math.max(0, team.points - pointsDeducted);
        // Re-sort standings
        gameState.standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
        });
        gameState.standings.forEach((t, i) => { t.position = i + 1; });
    }

    // Track totale puntenaftrek dit seizoen
    if (!gameState.club.pointsDeducted) gameState.club.pointsDeducted = 0;
    gameState.club.pointsDeducted += pointsDeducted;

    saveGame();
    showNotification(`Bankroet! De bond heeft een noodlening van ${formatCurrency(loanAmount)} verstrekt. Straf: ${pointsDeducted} punten in mindering.`, 'error');
}

function renderDailyFinances() {
    const fin = calculateWeeklyFinances();

    // Icon maps
    const incomeIcons = {
        'Kaartverkoop': '🎟️',
        'Shirtsponsor': '👕',
        'Bordsponsor': '📋',
        'Horeca': '🍺'
    };
    const expenseIcons = {
        'Spelerssalarissen': '👥',
        'Stafsalarissen': '🧑‍💼',
        'Stadiononderhoud': '🏟️',
        'Jeugdscouting': '🔍',
        'Jeugdopleiding': '⚽'
    };

    // Budget card — current budget
    const budgetEl = document.getElementById('fin-budget-value');
    if (budgetEl) budgetEl.textContent = formatCurrency(gameState.club.budget);

    // Budget card — weekly trend
    const trendEl = document.getElementById('fin-budget-trend');
    if (trendEl) {
        const sign = fin.weeklyResult >= 0 ? '+' : '';
        const arrow = fin.weeklyResult >= 0 ? '↑' : '↓';
        trendEl.textContent = `${arrow} ${sign}${formatCurrency(fin.weeklyResult)} / week`;
        trendEl.className = `fin-budget-trend ${fin.weeklyResult >= 0 ? 'positive' : 'negative'}`;
    }

    // Budget card — balance bar
    const total = fin.totalIncome + fin.totalExpense;
    const incPct = total > 0 ? (fin.totalIncome / total * 100) : 50;
    const barInc = document.getElementById('fin-bar-income');
    const barExp = document.getElementById('fin-bar-expense');
    if (barInc) barInc.style.width = `${incPct}%`;
    if (barExp) barExp.style.width = `${100 - incPct}%`;

    // Balance bar labels
    const barIncLabel = document.getElementById('fin-bar-income-label');
    const barExpLabel = document.getElementById('fin-bar-expense-label');
    if (barIncLabel) barIncLabel.textContent = `+${formatCurrency(fin.totalIncome)}`;
    if (barExpLabel) barExpLabel.textContent = `-${formatCurrency(fin.totalExpense)}`;

    // Season spending
    const seasonEl = document.getElementById('fin-season-spending');
    if (seasonEl) {
        const spending = gameState.stats?.seasonSpending || 0;
        seasonEl.textContent = spending > 0 ? `Seizoensuitgaven: ${formatCurrency(spending)}` : '';
    }

    // Header balance (legacy)
    const balEl = document.getElementById('fin-balance');
    if (balEl) balEl.textContent = formatCurrency(gameState.club.budget);

    // Income list
    const incList = document.getElementById('fin-income-list');
    if (incList) {
        let html = fin.income
            .filter(i => i.value > 0)
            .map(i => {
                const icon = incomeIcons[i.label] || '';
                return `<li><span class="fin-item-label"><span class="fin-item-icon">${icon}</span>${i.label}${i.detail ? ` <small>(${i.detail})</small>` : ''}</span><span class="fin-item-val income">+${formatCurrency(i.value)}</span></li>`;
            })
            .join('');
        if (fin.winBonus > 0) {
            html += `<li class="fin-item-bonus"><span class="fin-item-label"><span class="fin-item-icon">🏆</span>Winbonus <small>(bij winst)</small></span><span class="fin-item-val bonus">+${formatCurrency(fin.winBonus)}</span></li>`;
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
            .map(e => {
                const icon = expenseIcons[e.label] || '';
                return `<li><span class="fin-item-label"><span class="fin-item-icon">${icon}</span>${e.label}</span><span class="fin-item-val expense">-${formatCurrency(e.value)}</span></li>`;
            })
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

    // Priority warnings — always show these first
    const hasAcademy = gameState.stadium?.academy && gameState.stadium.academy !== 'acad_0';
    if (hasAcademy) {
        const maxY = getYouthMaxPerCategory();
        const pupillenFull = getYouthCategoryCount('12-13') >= maxY;
        const allYouthFull = pupillenFull
            && getYouthCategoryCount('14-15') >= maxY
            && getYouthCategoryCount('16-17') >= maxY;
        if (allYouthFull) {
            return 'Alle jeugdcategorieën zitten vol! Maak ruimte, anders kan er geen nieuw talent instromen.';
        }
        if (pupillenFull) {
            return 'De pupillen zitten vol! Elke dag stromen er nieuwe talenten in — maak ruimte zodat ze niet worden afgewezen.';
        }
        // Mention daily intake as a general tip sometimes
        if (Math.random() < 0.3) {
            return 'Elke dag stroomt er een nieuwe pupil in bij de jeugdopleiding. Zorg dat er altijd plek is!';
        }
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
            player.stars = 0;
        }
    });
}

// ================================================
// ONBOARDING & TUTORIAL
// ================================================

let onboardingActive = false;
function showOnboarding() {
    if (onboardingActive) return;
    onboardingActive = true;
    const positionOptions = [
        { key: 'keeper', name: 'Keeper', abbr: 'KEE', color: '#f9a825' },
        { key: 'linksback', name: 'Linksback', abbr: 'LB', color: '#2196f3' },
        { key: 'centraleVerdediger', name: 'Centrale Verdediger', abbr: 'CV', color: '#1976d2' },
        { key: 'rechtsback', name: 'Rechtsback', abbr: 'RB', color: '#2196f3' },
        { key: 'linksMid', name: 'Links Middenvelder', abbr: 'LM', color: '#4caf50' },
        { key: 'centraleMid', name: 'Centrale Middenvelder', abbr: 'CM', color: '#4caf50' },
        { key: 'rechtsMid', name: 'Rechts Middenvelder', abbr: 'RM', color: '#4caf50' },
        { key: 'linksbuiten', name: 'Linksbuiten', abbr: 'LW', color: '#9c27b0' },
        { key: 'rechtsbuiten', name: 'Rechtsbuiten', abbr: 'RW', color: '#9c27b0' },
        { key: 'spits', name: 'Spits', abbr: 'ST', color: '#9c27b0' }
    ];

    let currentStep = 0;
    let selectedPosition = null;
    const skillPoints = { SNE: 5, TEC: 5, PAS: 5, SCH: 5, VER: 5, FYS: 5 };
    let pointsRemaining = 10;
    let savedClubName = '';
    let savedPlayerName = '';
    let savedColors = null;

    const colorPresets = [
        { name: 'Groen-Wit', primary: '#1b5e20', secondary: '#f5f0e1', accent: '#ff9800' },
        { name: 'Rood-Wit', primary: '#b71c1c', secondary: '#f5f0e1', accent: '#ffd600' },
        { name: 'Blauw-Wit', primary: '#0d47a1', secondary: '#f5f0e1', accent: '#ff9800' },
        { name: 'Zwart-Geel', primary: '#212121', secondary: '#fdd835', accent: '#fdd835' },
        { name: 'Oranje-Zwart', primary: '#e65100', secondary: '#212121', accent: '#fff3e0' },
        { name: 'Paars-Wit', primary: '#4a148c', secondary: '#f5f0e1', accent: '#ff9800' },
    ];

    const steps = [
        {
            title: 'Welkom bij de club!',
            text: 'Welkom, welkom! Ik ben de voorzitter van... ja, hoe heet onze club eigenlijk? We zijn net gepromoveerd naar de 6e klasse. Nou ja, \'gepromoveerd\'... we zijn er bij ingedeeld omdat er te weinig teams waren.',
            inputType: 'text',
            inputId: 'onboarding-clubname',
            placeholder: 'FC Goals Maken',
            label: 'Clubnaam'
        },
        {
            title: 'Wie ben jij?',
            text: 'Dus jij wilt speler-manager worden? Bij ons speelt de manager gewoon mee — we hebben namelijk niet genoeg spelers. Hoe heet je?',
            inputType: 'text',
            inputId: 'onboarding-playername',
            placeholder: 'JanAnsen',
            label: 'Jouw naam'
        },
        {
            title: 'Kies je positie',
            text: 'Op welke positie wil je spelen? Niet dat het veel uitmaakt in de 6e klasse — iedereen loopt toch overal. Maar goed, je hebt officieel een positie nodig voor het wedstrijdformulier.',
            inputType: 'positions'
        },
        {
            title: 'Verdeel je skillpunten',
            text: 'Je hebt 10 punten om te verdelen over je skills. De rest van de selectie is ook niet geweldig — sommigen kunnen amper een bal raken. Maar met een goede verdeling maak jij het verschil.',
            inputType: 'skills'
        },
        {
            title: 'Startkapitaal',
            text: 'Weet je wat, hier heb je €5.000. Kijk maar of je er iets mee kan. Het is niet veel, maar voor de 6e klasse is het een fortuin. Niet alles in één keer uitgeven hè!',
            inputType: 'budget'
        }
    ];

    // Remove any stale onboarding overlay (prevents duplicate panel bug)
    document.querySelectorAll('.onboarding-overlay').forEach(el => el.remove());

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    const panelEl = document.createElement('div');
    panelEl.className = 'onboarding-panel';
    overlay.appendChild(panelEl);
    document.body.appendChild(overlay);

    function renderStep(stepIndex) {
        const step = steps[stepIndex];
        const panel = panelEl;

        let inputHTML = '';
        if (step.inputType === 'text' && step.inputId === 'onboarding-clubname') {
            inputHTML = `
                <div class="onboarding-field">
                    <label class="onboarding-label">${step.label}</label>
                    <input type="text" id="${step.inputId}" class="onboarding-input" placeholder="${step.placeholder}" maxlength="30" autocomplete="off">
                </div>
                <div class="onboarding-field">
                    <label class="onboarding-label">Clubkleuren</label>
                    <div class="onboarding-color-presets">
                        ${colorPresets.map((c, i) => `
                            <button class="onboarding-color-btn ${i === 0 ? 'selected' : ''}" data-color-idx="${i}" title="${c.name}">
                                <span class="ocp-swatch" style="background: linear-gradient(135deg, ${c.primary} 50%, ${c.secondary} 50%); border: 2px solid ${c.accent}"></span>
                                <span class="ocp-label">${c.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>`;
        } else if (step.inputType === 'text') {
            inputHTML = `
                <div class="onboarding-field">
                    <label class="onboarding-label">${step.label}</label>
                    <input type="text" id="${step.inputId}" class="onboarding-input" placeholder="${step.placeholder}" maxlength="30" autocomplete="off">
                </div>`;
        } else if (step.inputType === 'positions') {
            inputHTML = `<div class="onboarding-positions">${positionOptions.map(p =>
                `<button class="onboarding-pos-btn" data-pos="${p.key}" style="--pos-color: ${p.color}">
                    <span class="onboarding-pos-abbr">${p.abbr}</span>
                    <span class="onboarding-pos-name">${p.name}</span>
                </button>`
            ).join('')}</div>`;
        } else if (step.inputType === 'budget') {
            inputHTML = `
                <div class="onboarding-budget-display">
                    <span class="onboarding-budget-amount">€5.000</span>
                </div>`;
        } else if (step.inputType === 'skills') {
            const skillNames = { SNE: 'Snelheid', TEC: 'Techniek', PAS: 'Passen', SCH: 'Schieten', VER: 'Verdedigen', FYS: 'Fysiek' };
            const avg = Math.round(Object.values(skillPoints).reduce((s, v) => s + v, 0) / 6);
            inputHTML = `
                <div class="onboarding-skills-header">
                    <span class="onboarding-points-left">Punten over: <strong id="points-remaining">${pointsRemaining}</strong></span>
                    <span class="onboarding-alg">ALG: <strong id="onboarding-alg">${avg}</strong></span>
                </div>
                <div class="onboarding-skills">
                    ${Object.entries(skillNames).map(([key, name]) => `
                        <div class="onboarding-skill-row">
                            <span class="onboarding-skill-name">${name}</span>
                            <button class="onboarding-skill-btn minus" data-skill="${key}" data-dir="-1">−</button>
                            <span class="onboarding-skill-value" id="skill-val-${key}">${skillPoints[key]}</span>
                            <button class="onboarding-skill-btn plus" data-skill="${key}" data-dir="1">+</button>
                        </div>
                    `).join('')}
                </div>`;
        }

        const isLast = stepIndex === steps.length - 1;
        const btnText = isLast ? '💰 €5.000 claimen' : 'Verder';
        const btnId = isLast ? 'onboarding-start' : 'onboarding-next';

        panel.innerHTML = `
            <div class="onboarding-step ${stepIndex > 0 ? 'slide-in' : ''}">
                <div class="onboarding-step-dots">
                    ${steps.map((_, i) => `<span class="onboarding-dot ${i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}"></span>`).join('')}
                </div>
                <div class="onboarding-content">
                    <div class="onboarding-avatar">${CHAIRMAN_SVG}</div>
                    <div class="onboarding-text">
                        <h3 class="onboarding-title">${step.title}</h3>
                        <p class="onboarding-speech">${step.text}</p>
                    </div>
                </div>
                ${inputHTML}
                <button class="onboarding-btn" id="${btnId}" ${step.inputType === 'positions' ? 'disabled' : ''} ${step.inputType === 'skills' && pointsRemaining > 0 ? 'disabled' : ''}>${btnText}</button>
            </div>
        `;

        // Trigger animation
        requestAnimationFrame(() => {
            panel.querySelector('.onboarding-step')?.classList.add('visible');
        });

        // Bind events — use panel.querySelector to avoid stale DOM references
        if (step.inputType === 'text') {
            const input = panel.querySelector(`#${step.inputId}`);
            if (input) {
                input.focus();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && input.value.trim()) nextStep();
                });
            }
        }

        // Color preset buttons (clubname step)
        if (step.inputId === 'onboarding-clubname') {
            savedColors = colorPresets[0]; // default
            panel.querySelectorAll('.onboarding-color-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    panel.querySelectorAll('.onboarding-color-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    savedColors = colorPresets[parseInt(btn.dataset.colorIdx)];
                });
            });
        }

        const nextBtn = panel.querySelector(`#${btnId}`);

        if (step.inputType === 'positions') {
            panel.querySelectorAll('.onboarding-pos-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    panel.querySelectorAll('.onboarding-pos-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedPosition = btn.dataset.pos;
                    if (nextBtn) nextBtn.disabled = false;
                });
            });
        }

        if (step.inputType === 'skills') {
            panel.querySelectorAll('.onboarding-skill-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const skill = btn.dataset.skill;
                    const dir = parseInt(btn.dataset.dir);
                    const newVal = skillPoints[skill] + dir;
                    if (newVal < 5 || newVal > 15) return;
                    if (dir > 0 && pointsRemaining <= 0) return;
                    skillPoints[skill] = newVal;
                    pointsRemaining -= dir;
                    const valEl = panel.querySelector(`#skill-val-${skill}`);
                    if (valEl) valEl.textContent = newVal;
                    const ptsEl = panel.querySelector('#points-remaining');
                    if (ptsEl) ptsEl.textContent = pointsRemaining;
                    const avg = Math.round(Object.values(skillPoints).reduce((s, v) => s + v, 0) / 6);
                    const algEl = panel.querySelector('#onboarding-alg');
                    if (algEl) algEl.textContent = avg;
                    if (nextBtn) nextBtn.disabled = pointsRemaining > 0;
                    // Update +/- button states
                    panel.querySelectorAll('.onboarding-skill-btn').forEach(b => {
                        const sk = b.dataset.skill;
                        const d = parseInt(b.dataset.dir);
                        if (d > 0) b.disabled = pointsRemaining <= 0 || skillPoints[sk] >= 15;
                        if (d < 0) b.disabled = skillPoints[sk] <= 5;
                    });
                });
            });
            // Initial button states
            panel.querySelectorAll('.onboarding-skill-btn.minus').forEach(b => b.disabled = true);
        }

        if (nextBtn) nextBtn.addEventListener('click', nextStep);
    }

    function nextStep() {
        // Save and validate current step — use panelEl to avoid stale DOM
        if (currentStep === 0) {
            const input = panelEl.querySelector('#onboarding-clubname');
            const val = input?.value.trim();
            if (!val) {
                input?.focus();
                return;
            }
            savedClubName = val;
        }
        if (currentStep === 1) {
            const input = panelEl.querySelector('#onboarding-playername');
            const val = input?.value.trim();
            if (!val) {
                input?.focus();
                return;
            }
            savedPlayerName = val;
        }
        if (currentStep === 2 && !selectedPosition) return;
        if (currentStep === 3 && pointsRemaining > 0) return;

        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep(currentStep);
        } else {
            applyOnboarding();
        }
    }

    function applyOnboarding() {
        const clubName = savedClubName || 'FC Goals Maken';
        const playerName = savedPlayerName || 'Speler';
        const position = selectedPosition || 'spits';

        const oldClubName = gameState.club.name;

        // Apply club name, colors and starting budget
        gameState.club.name = clubName;
        if (savedColors) {
            gameState.club.colors = { primary: savedColors.primary, secondary: savedColors.secondary, accent: savedColors.accent };
        }
        gameState.club.budget = 5000;

        // Apply player data
        gameState.myPlayer.name = playerName;
        gameState.myPlayer.position = position;
        gameState.myPlayer.attributes = { ...skillPoints };
        gameState.myPlayer.spentSkillPoints = 0;
        gameState.myPlayer.overall = Math.round(Object.values(skillPoints).reduce((s, v) => s + v, 0) / 6);

        // Sync myPlayer in players array
        const mpInSquad = gameState.players.find(p => p && p.id === 'myplayer');
        if (mpInSquad) {
            mpInSquad.name = playerName;
            mpInSquad.position = position;
            mpInSquad.overall = gameState.myPlayer.overall;
            mpInSquad.attributes = { AAN: skillPoints.SCH, VER: skillPoints.VER, SNE: skillPoints.SNE, FYS: skillPoints.FYS };
        }

        // Update standings with new club name
        if (gameState.standings) {
            gameState.standings.forEach(team => {
                if (team.name === oldClubName || team.isPlayer) {
                    team.name = clubName;
                }
            });
        }

        gameState.onboardingCompleted = true;
        onboardingActive = false;
        saveGame(gameState);

        // Re-render UI
        renderStandings();
        renderPlayerCards();
        updateBudgetDisplays();
        renderDashboardExtras();

        // Update club name, badge and colors in all UI locations
        const clubNameDisplay = document.getElementById('club-name-display');
        if (clubNameDisplay) clubNameDisplay.textContent = clubName;
        const homeTeamName = document.getElementById('home-team-name');
        if (homeTeamName) homeTeamName.textContent = clubName;
        applyClubColors();
        updateMainBadgeSVG();

        // Animate out
        panelEl.classList.add('slide-out');
        setTimeout(() => {
            overlay.remove();
            // Ask about tutorial
            showTutorialPrompt();
        }, 400);
    }

    renderStep(0);
}

function showTutorialPrompt() {
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-panel visible-immediate">
            <div class="onboarding-step visible">
                <div class="onboarding-content">
                    <div class="onboarding-avatar">${CHAIRMAN_SVG}</div>
                    <div class="onboarding-text">
                        <h3 class="onboarding-title">Rondleiding?</h3>
                        <p class="onboarding-speech">Ik ben Henk de Baas, voorzitter van deze prachtige club. Zal ik je even rondleiden? Dan laat ik je zien waar alles zit — of je zoekt het lekker zelf uit.</p>
                    </div>
                </div>
                <div class="onboarding-btn-row">
                    <button class="onboarding-btn secondary" id="tutorial-skip">Ik kan het echt zelf wel af</button>
                    <button class="onboarding-btn" id="tutorial-start">Ja, dankjewel!</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('tutorial-skip').addEventListener('click', () => {
        gameState.tutorialCompleted = true;
        if (!gameState.stats) gameState.stats = {};
        gameState.stats.skippedTutorial = true;
        saveGame(gameState);
        overlay.remove();
        // Trigger achievement check → "Ik Kan Echt Alles Zelf" (100 manager XP)
        const newAchievements = checkAchievements(gameState);
        if (newAchievements.length > 0) {
            setTimeout(() => queueAchievements(newAchievements), 500);
        }
    });

    document.getElementById('tutorial-start').addEventListener('click', () => {
        overlay.remove();
        showTutorial();
    });
}

function showTutorial() {
    const tutorialSteps = [
        // --- DASHBOARD (4 sub-stappen) ---
        {
            page: 'dashboard',
            highlight: '.dash-todo, .checklist-card',
            title: 'Takenlijst',
            text: 'Dit is je takenlijst. Hier zie je wat er gedaan moet worden — wedstrijden spelen, spelers trainen, de boel upgraden. Vink ze af en je krijgt beloningen. Ik zou beginnen met de makkelijke.'
        },
        {
            page: 'dashboard',
            highlight: '.dash-standings, .standings-card',
            title: 'Competitiestand',
            text: 'De ranglijst. We staan niet bovenaan — dat is een understatement. Maar van hier kan het alleen maar beter worden. Of slechter, maar laten we positief blijven.'
        },
        {
            page: 'dashboard',
            highlight: '.dash-talents, .talents-card',
            title: 'Toptalenten',
            text: 'Hier zie je de beste spelers uit de competitie. Handig om te weten wie je moet vrezen — of proberen te kopen als je ooit genoeg geld hebt. Spoiler: dat duurt even.'
        },
        {
            page: 'dashboard',
            highlight: '.dash-match, .match-card',
            title: 'Volgende Wedstrijd',
            text: 'Hier zie je je volgende wedstrijd. Wie de tegenstander is, wanneer je speelt, en hoe slecht het er voor staat. Als de wedstrijd beschikbaar is, druk je op spelen en hopen we het beste.'
        },
        // --- Overige pagina's in tabvolgorde (nav van boven naar beneden) ---
        {
            page: 'squad',
            highlight: '#player-cards, .squad-group',
            title: 'Selectie',
            text: 'Dit is de selectie die we nu hebben. Hij bestaat vooral uit oude vedettes die vroeger heel goed waren. Althans, dat zeggen ze zelf. Waarom we deze gasten betalen weet ik eigenlijk ook niet.'
        },
        {
            page: 'tactics',
            highlight: '.lineup-container, .lineup-pitch-panel',
            title: 'Opstelling & Tactiek',
            text: 'Hier stel je je team op en kies je de tactiek. Sleep spelers naar het veld, kies een formatie en stel je speelstijl in. Bij \'Specialisten\' wijs je de cornernemer, strafschopnemer en aanvoerder aan. Dat soort dingen maakt echt verschil — geloof me.'
        },
        {
            page: 'transfers',
            highlight: '.transfer-list, .transfer-filters-panel',
            title: 'Transfers',
            text: 'De transfermarkt! Hier kun je spelers aannemen. Let goed op de zwarte sterren bij potentieel — dat is de onzekerheidsmarge. Een speler met 1 gele ster en 1 zwarte ster kan in werkelijkheid 1 of 2 sterren hebben. Je weet het pas als hij tekent. Trap er niet in — je haalt zo de verkeerde lui binnen.'
        },
        {
            page: 'scout',
            highlight: '.scouting-layout, .scout-tip-section',
            title: 'Scouting',
            text: 'Hier scout je nieuwe spelers. Verwacht geen Messi — denk meer aan je buurman die vroeger bij de D-junioren zat. Maar met een goede scout vind je af en toe een pareltje!'
        },
        {
            page: 'jeugdteam',
            highlight: '#jeugdteam',
            title: 'Jeugdopleiding',
            text: 'Dit is onze jeugdopleiding. Hier komen de talenten van morgen vandaan — of in ons geval, de middenmoters van overmorgen. Investeer in de jeugd en af en toe stroomt er eentje door naar het eerste. Goedkoper dan de transfermarkt!'
        },
        {
            page: 'stadium',
            highlight: '.stadium-map-container, .stadium-mobile-facilities',
            title: 'Het Stadion',
            text: 'Dit is ons stadion. \'Stadion\' is een groot woord voor een veld met een hek eromheen. Begin met de kantine — de jongens willen na de wedstrijd een biertje. Dat is eigenlijk het belangrijkste van zaterdagvoetbal.'
        },
        {
            page: 'staff',
            highlight: '#staff',
            title: 'Staf',
            text: 'Hier beheer je de technische staf. Een goede assistent-trainer, een fysio, een jeugdcoach... het klinkt overdreven voor de 6e klasse, maar het helpt echt. Ze kosten wel geld, dus kies slim wie je aanneemt.'
        },
        {
            page: 'sponsors',
            highlight: '#sponsors',
            title: 'Sponsors',
            text: 'Sponsors zijn je broodwinning. Hoe beter je presteert en hoe groter je stadion, hoe meer sponsors geïnteresseerd zijn. Sommige deals zijn beter dan andere — lees de kleine lettertjes. Of niet, wij lezen ze ook nooit.'
        },
        {
            page: 'training',
            highlight: '.training-section, .training-slots',
            title: 'Jij als Speler',
            text: 'Dit is het overzicht van jou als speler. Je kan in je vrije tijd trainen om beter te worden. Met elke level-up krijg je skillpunten waarmee je je kenmerken verbetert — snelheid, techniek, passing, dat soort dingen. Maarja, wie wil er nou trainen in zijn vrije tijd?'
        }
    ];

    let currentStep = 0;
    let highlightedEl = null;

    // Create tutorial panel (fixed at bottom)
    const tutorialPanel = document.createElement('div');
    tutorialPanel.className = 'tutorial-panel';
    document.body.appendChild(tutorialPanel);

    function renderTutorialStep(stepIndex) {
        const step = tutorialSteps[stepIndex];

        // Remove previous highlight
        if (highlightedEl) {
            highlightedEl.classList.remove('tutorial-highlight');
            highlightedEl = null;
        }

        // Navigate to the right page
        navigateToPage(step.page);

        // Small delay to let the page render, then highlight
        setTimeout(() => {
            // Try each selector (comma-separated fallbacks)
            const selectors = step.highlight.split(',').map(s => s.trim());
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    highlightedEl = el;
                    el.classList.add('tutorial-highlight');
                    break;
                }
            }

            const isLast = stepIndex === tutorialSteps.length - 1;
            const btnText = isLast ? 'Aan de slag!' : 'Volgende';

            tutorialPanel.innerHTML = `
                <div class="tutorial-step visible">
                    <div class="tutorial-step-counter">${stepIndex + 1} / ${tutorialSteps.length}</div>
                    <div class="onboarding-content">
                        <div class="onboarding-avatar">${CHAIRMAN_SVG}</div>
                        <div class="onboarding-text">
                            <h3 class="onboarding-title">${step.title}</h3>
                            <p class="onboarding-speech">${step.text}</p>
                        </div>
                    </div>
                    <div class="onboarding-btn-row">
                        <button class="onboarding-btn secondary tutorial-skip-btn">Overslaan</button>
                        <button class="onboarding-btn tutorial-next-btn">${btnText}</button>
                    </div>
                </div>
            `;

            tutorialPanel.querySelector('.tutorial-next-btn').addEventListener('click', () => {
                if (stepIndex < tutorialSteps.length - 1) {
                    currentStep++;
                    renderTutorialStep(currentStep);
                } else {
                    closeTutorial(true); // completed fully
                }
            });

            tutorialPanel.querySelector('.tutorial-skip-btn').addEventListener('click', () => closeTutorial(false));
        }, 300);
    }

    function closeTutorial(completedFully) {
        if (highlightedEl) highlightedEl.classList.remove('tutorial-highlight');
        tutorialPanel.classList.add('slide-out');
        setTimeout(() => {
            tutorialPanel.remove();
            navigateToPage('dashboard');
        }, 400);
        gameState.tutorialCompleted = true;
        if (!gameState.stats) gameState.stats = {};
        if (completedFully) {
            // Finished entire tutorial → "Hou Me Bij De Hand Vast" (50 manager XP)
            gameState.stats.completedTutorial = true;
        } else {
            // Skipped halfway → "Man Man Man" (10 manager XP)
            gameState.stats.skippedTutorialHalfway = true;
        }
        saveGame(gameState);
        const newAchievements = checkAchievements(gameState);
        if (newAchievements.length > 0) {
            setTimeout(() => queueAchievements(newAchievements), 800);
        }
    }

    renderTutorialStep(0);
}

// initGame('local') removed — multiplayer only, see initMultiplayerGame()

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

    // Update manager level-up reward badge
    const managerRewardEl = document.getElementById('global-manager-reward');
    if (managerRewardEl) {
        const nextManagerLevel = MANAGER_LEVELS.find(l => l.xpRequired > (gameState.manager?.xp || 0));
        managerRewardEl.textContent = nextManagerLevel?.cashReward ? `+${formatCurrency(nextManagerLevel.cashReward)}` : '';
        managerRewardEl.style.display = nextManagerLevel?.cashReward ? '' : 'none';
    }

    // Update global player tile
    const mp = gameState.myPlayer;
    if (mp) {
        const pLevel = getPlayerLevel(mp.xp || 0, mp.stars || 1);
        const pXp = mp.xp || 0;
        const pNextXp = pXp + (pLevel.xpToNext || 0);
        const pProgress = Math.round(pLevel.progress * 100);

        const gpOverall = document.getElementById('global-player-overall');
        const gpTitle = document.getElementById('global-player-title');
        const gpLevel = document.getElementById('global-player-level');
        const gpFill = document.getElementById('global-player-xp-fill');
        const gpLabel = document.getElementById('global-player-xp-label');

        const mpAttrs = mp.attributes || {};
        const mpCalcOverall = Math.round((mpAttrs.SNE + mpAttrs.TEC + mpAttrs.PAS + mpAttrs.SCH + mpAttrs.VER + mpAttrs.FYS) / 6);
        const gpName = document.getElementById('global-player-name');
        const playerName = mp.name || 'Speler';
        if (gpName) gpName.textContent = `⚽ ${playerName} als speler`;
        const gmName = document.getElementById('global-manager-name');
        if (gmName) gmName.textContent = `📋 ${playerName} als manager`;
        // Dynamic player name in sidebar nav + page title
        const navPlayerName = document.getElementById('nav-player-name');
        if (navPlayerName) navPlayerName.textContent = playerName;
        const navGroupPlayerLabel = document.getElementById('nav-group-player-label');
        if (navGroupPlayerLabel) navGroupPlayerLabel.textContent = playerName;
        const profileTitle = document.getElementById('profile-page-title');
        if (profileTitle) profileTitle.textContent = playerName;
        if (gpOverall) gpOverall.textContent = mpCalcOverall || mp.overall || 50;
        const gpRatingBadge = document.querySelector('.gtb-player-rating');
        if (gpRatingBadge) gpRatingBadge.style.background = POSITIONS[mp.position]?.color || '#666';
        if (gpTitle) gpTitle.innerHTML = `<span class="gtb-stars-wrap"><span class="gtb-stars-row">${renderStarsHTML(mp.stars || 0)}</span><span class="gtb-pot-label">POT</span></span>`;
        if (gpLevel) gpLevel.textContent = pLevel.level;
        if (gpFill) gpFill.style.width = `${pProgress}%`;
        if (gpLabel) gpLabel.textContent = pLevel.xpToNext > 0 ? `${pXp} / ${pNextXp} XP` : `${pXp} XP — Max!`;

        // Update player level-up reward badge
        const playerRewardEl = document.getElementById('global-player-reward');
        if (playerRewardEl) {
            const nextPlayerLevel = PLAYER_LEVELS.find(l => l.xpRequired > (mp.xp || 0));
            playerRewardEl.textContent = nextPlayerLevel ? `+${pLevel.spPerLevel} SP` : '';
            playerRewardEl.style.display = nextPlayerLevel ? '' : 'none';
        }
    }

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

    // Sync home-badge in match preview with sidebar badge
    const sidebarBadge = document.getElementById('club-badge-svg');
    const homeBadge = document.querySelector('.home-badge');
    if (sidebarBadge && homeBadge) {
        const clone = sidebarBadge.cloneNode(true);
        clone.removeAttribute('id');
        homeBadge.innerHTML = '';
        homeBadge.appendChild(clone);
    }

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
        <table class="fin-table">
            <tbody>
                <tr class="fin-table-income">
                    <td class="fin-table-label">Inkomsten /wk</td>
                    <td class="fin-table-val">+${formatCurrency(fin.totalIncome)}</td>
                </tr>
                <tr class="fin-table-expense">
                    <td class="fin-table-label">Uitgaven /wk</td>
                    <td class="fin-table-val">-${formatCurrency(fin.totalExpense)}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="fin-table-result ${weekly >= 0 ? 'fin-result-positive' : 'fin-result-negative'}">
                    <td class="fin-table-label">Resultaat deze week</td>
                    <td class="fin-table-val">${sign}${formatCurrency(weekly)}</td>
                </tr>
            </tfoot>
        </table>
    `;
}

function renderDashboardTopPlayers() {
    const container = document.getElementById('dashboard-toptalents');
    if (!container) return;

    // Get youth players sorted by overall (level), then potential
    const topTalents = [...(gameState.youthPlayers || [])]
        .sort((a, b) => {
            const aLevel = getYouthLevel(a.overall, getYouthMaxLevel(a.age));
            const bLevel = getYouthLevel(b.overall, getYouthMaxLevel(b.age));
            if (bLevel !== aLevel) return bLevel - aLevel;
            return (b.potentialStars || 1) - (a.potentialStars || 1);
        })
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
        const code = (player.nationality?.code || 'nl').toLowerCase();
        return `
            <div class="tt-item">
                <span class="tt-pos" style="background: ${posData.color}">${posData.abbr}</span>
                <img class="tt-flag-img" src="https://flagcdn.com/w40/${code}.png" alt="${player.nationality?.code || 'NL'}" />
                <span class="tt-name">${player.name}</span>
                <span class="tt-age">${player.age} jaar</span>
                <div class="tt-ovr" style="background: ${posData.color}"><span class="tt-ovr-value">${level}</span><span class="tt-ovr-label">ALG</span></div>
                <span class="tt-stars">${starsHtml}</span>
            </div>
        `;
    }).join('');
}

// ================================================
// DAILY CHECKLIST SYSTEM
// ================================================

function getChecklistItems() {
    // Opstelling: 11 spelers ingevuld
    const hasLineup = (gameState.lineup || []).filter(x => x !== null).length >= 11;

    // Formatie gekozen
    const hasFormation = !!gameState.formation;

    // Wedstrijdvoorbereiding: teamtraining geselecteerd (reset na elke wedstrijd)
    const hasMatchPrep = !!gameState.training?.teamTraining?.selected;

    // Tactiek aangepast (niet alles standaard)
    const hasTactics = (() => {
        const t = gameState.tactics;
        if (!t) return false;
        const defaults = { mentaliteit: 'normaal', offensief: 'gebalanceerd', speltempo: 'normaal', veldbreedte: 'gebalanceerd', dekking: 'zone' };
        return Object.entries(defaults).some(([k, v]) => t[k] && t[k] !== v);
    })();

    // Specialisten gekozen (minstens aanvoerder + 1 andere)
    const specs = gameState.specialists || {};
    const hasSpecialists = !!specs.captain && !!(specs.cornerTaker || specs.penaltyTaker || specs.freekickTaker);

    // Sponsor actief
    const hasSponsor = (gameState.sponsor?.weeksRemaining > 0) || (gameState.sponsorSlots?.bord?.weeksRemaining > 0);

    // Speler heeft vandaag getraind
    const mp = initMyPlayer();
    const hasTraining = mp.lastTrainingDate === getTodayString();

    // Scouting: missie actief, pending speler, of tip beschikbaar
    const hasScouting = !!gameState.scoutMission?.active || !!gameState.scoutMission?.pendingPlayer || !!gameState.scoutMission?.lastScoutDate;

    // Jeugd bekeken: speler heeft de jeugdpagina bezocht
    const hasYouth = !!gameState.youthVisited;

    // Transfermarkt bezocht
    const hasSquad = !!gameState.transfersVisited;

    // Stadion pagina bezocht
    const hasStadiumUpgrade = !!gameState.stadiumVisited;

    // Staf: minstens 1 via nieuw of oud systeem
    const hasStaffNew = (gameState.hiredStaff?.medisch || []).length > 0;
    const hasStaffOld = Object.values(gameState.staff || {}).some(s => s !== null);
    const hasStaff = hasStaffNew || hasStaffOld;

    const mustDo = [
        {
            id: 'lineup',
            label: 'Stel je elf op',
            done: hasLineup,
            action: 'tactics',
            icon: '📋'
        },
        {
            id: 'tactics',
            label: 'Creëer een tactiek',
            done: hasTactics,
            action: 'tactics:tactiek',
            icon: '🧩'
        },
        {
            id: 'matchprep',
            label: 'Plan wedstrijdvoorbereiding',
            done: hasMatchPrep,
            action: 'tactics:tactiek',
            icon: '🎯'
        },
        {
            id: 'specialists',
            label: 'Kies specialisten',
            done: hasSpecialists,
            action: 'tactics:specialisten',
            icon: '⭐'
        },
        {
            id: 'sponsors',
            label: 'Regel een sponsor',
            done: hasSponsor,
            action: 'sponsors',
            icon: '🤝'
        }
    ];

    const mayDo = [
        {
            id: 'training',
            label: 'Train in je vrije tijd',
            done: hasTraining,
            action: 'training',
            icon: '💪'
        },
        {
            id: 'scout',
            label: 'Stuur de scout op pad',
            done: hasScouting,
            action: 'scout',
            icon: '🔍'
        },
        {
            id: 'youth',
            label: 'Bekijk de jeugd',
            done: hasYouth,
            action: 'jeugdteam',
            icon: '⭐'
        },
        {
            id: 'transfers',
            label: 'Versterk je selectie',
            done: hasSquad,
            action: 'transfers',
            icon: '🔄'
        },
        {
            id: 'stadium',
            label: 'Verbeter het sportcomplex',
            done: hasStadiumUpgrade,
            action: 'stadium',
            icon: '🏟️'
        }
    ];

    return { mustDo, mayDo };
}

function renderDashboardChecklist() {
    updateNavBadges();
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
                <span class="cl-label">${item.label}</span>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="cl-section">
            <div class="cl-section-label">Belangrijk</div>
            ${mustDo.map(renderItem).join('')}
        </div>
        <div class="cl-section">
            <div class="cl-section-label">Optioneel <span class="cl-optional-count">${doneMay}/${totalMay}</span></div>
            ${mayDo.map(renderItem).join('')}
        </div>
    `;
}

function handleChecklistClick(action) {
    // Support page:tab format (e.g. 'tactics:tactiek')
    if (action.includes(':')) {
        const [page, tab] = action.split(':');
        navigateToPage(page);
        setTimeout(() => activateTabOnPage(page, tab), 50);
    } else {
        navigateToPage(action);
    }
}

// Make functions globally accessible
window.handleChecklistClick = handleChecklistClick;
window.navigateTo = navigateToPage;
window.resetGame = function() {
    window.location.href = window.location.pathname + '?reset=1';
};

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
    playMultiplayerMatch();
}

/**
 * Multiplayer match flow:
 * 1. Check if match result already exists → show it
 * 2. If not, simulate ALL matches for the week, save to Supabase, update standings
 * 3. Show the player's match report
 */
let multiplayerMatchInProgress = false;

async function playMultiplayerMatch() {
    if (multiplayerMatchInProgress) return;
    multiplayerMatchInProgress = true;

    // Disable play button to prevent double-click
    const playBtn = document.getElementById('play-match-btn');
    if (playBtn) playBtn.disabled = true;

    try {
        await _playMultiplayerMatchInner();
    } finally {
        multiplayerMatchInProgress = false;
        if (playBtn) playBtn.disabled = false;
    }
}

async function _playMultiplayerMatchInner() {
    const mp = gameState.multiplayer;
    if (!mp || !mp.leagueId || !mp.clubId) {
        showNotification('Multiplayer niet correct ingesteld.', 'error');
        return;
    }

    const leagueId = mp.leagueId;
    const myClubId = mp.clubId;
    const season = gameState.season || 1;
    const week = gameState.week || 1;

    // Week 0 = no schedule yet, waiting for more players
    if (week === 0) {
        showNotification('De competitie begint zodra er meer spelers joinen! Deel je invite code.', 'info');
        return;
    }

    // Already played this week — wait for next round
    if (gameState._weekPlayed) {
        showNotification('Je hebt deze week al gespeeld. Wacht op de volgende ronde!', 'info');
        return;
    }

    // Daily limit: max 1 match per day
    if (gameState.lastMatchPlayedAt) {
        const lastDate = new Date(gameState.lastMatchPlayedAt);
        const now = new Date();
        if (lastDate.toDateString() === now.toDateString()) {
            showNotification('🏟️ Voorzitter: "Je bent wat te vroeg aanwezig, de tegenstander staat nog niet op het veld."', 'info');
            return;
        }
    }

    // Time gate: match only available after match_time (default 20:00)
    {
        const matchTimeStr = gameState._matchTime || '10:40';
        const [mh, mm] = matchTimeStr.split(':').map(Number);
        const now = new Date();
        if (now.getHours() < mh || (now.getHours() === mh && now.getMinutes() < mm)) {
            showNotification('🏟️ Voorzitter: "Je bent wat te vroeg aanwezig, de tegenstander staat nog niet op het veld."', 'info');
            return;
        }
    }

    showNotification('Wedstrijd laden...', 'info');

    try {
        // Check if already played
        let existingResult = await getMatchResult(leagueId, season, week, myClubId);

        if (!existingResult) {
            // First player to click — simulate all matches for this week
            await simulateWeek(leagueId, season, week, simulateMatch, calculateTeamStrength);

            // Fetch our result
            existingResult = await getMatchResult(leagueId, season, week, myClubId);
        }

        if (!existingResult) {
            showNotification('Kon wedstrijdresultaat niet vinden.', 'error');
            return;
        }

        // Determine perspective
        const isHome = existingResult.home_club_id === myClubId;
        const playerScore = isHome ? existingResult.home_score : existingResult.away_score;
        const opponentScore = isHome ? existingResult.away_score : existingResult.home_score;

        // Get opponent club name
        const opponentClubId = isHome ? existingResult.away_club_id : existingResult.home_club_id;
        const { data: opponentClub } = await supabase
            .from('clubs')
            .select('name')
            .eq('id', opponentClubId)
            .single();
        const opponentName = opponentClub?.name || 'Tegenstander';

        // Apply results to our players
        const matchData = existingResult.match_data || {};
        const resultType = getMatchResultType(existingResult.home_score, existingResult.away_score, isHome);

        // Tag myPlayer with club-specific rating ID for lookup in playerRatings
        const mpInLineupRef = gameState.lineup.find(p => p && (p.id === 'myplayer' || p.isMyPlayer));
        if (mpInLineupRef && myClubId) {
            mpInLineupRef._ratingId = `myplayer_${myClubId}`;
        }

        // Apply match results to player stats (morale, energy, cards, etc.)
        // Use captured `week` (not gameState.week) — realtime handler may bump it mid-function
        applyMatchResults(gameState.lineup, {
            homeScore: existingResult.home_score,
            awayScore: existingResult.away_score,
            playerRatings: matchData.playerRatings || {},
            events: matchData.events || []
        }, isHome, week);

        // Red card fines
        const ourTeam = isHome ? 'home' : 'away';
        const redCardEvents = (matchData.events || []).filter(e => e.type === 'red_card' && e.team === ourTeam);
        redCardEvents.forEach(() => gameState.club.budget -= 100);

        // Remove suspended/injured players from lineup (use week+1 = next week)
        const matchNotifications = [];
        const nextWeek = week + 1;
        gameState.lineup.forEach((p, i) => {
            if (!p) return;
            if (p.suspendedUntil && p.suspendedUntil > nextWeek) {
                const weeks = p.suspendedUntil - nextWeek;
                matchNotifications.push(`${p.name} is geschorst voor ${weeks} wedstrijd${weeks > 1 ? 'en' : ''}`);
                gameState.lineup[i] = null;
            }
            if (p.injuredUntil && p.injuredUntil > nextWeek) {
                const weeks = p.injuredUntil - nextWeek;
                matchNotifications.push(`${p.name} is geblesseerd voor ${weeks} wedstrijd${weeks > 1 ? 'en' : ''}`);
                gameState.lineup[i] = null;
            }
        });

        // Sync lineup changes back to gameState.players (they are separate objects)
        // applyMatchResults modified lineup objects; saveMultiplayer syncs from gameState.players
        const syncFields = ['goals', 'assists', 'morale', 'energy', 'yellowCards', 'redCards',
            'suspendedUntil', 'injuredUntil', 'injuryDuration', 'matchesTogether'];
        gameState.lineup.forEach(lineupPlayer => {
            if (!lineupPlayer) return;
            const squadPlayer = gameState.players.find(p => p && p.id === lineupPlayer.id);
            if (!squadPlayer) return;
            syncFields.forEach(field => {
                if (lineupPlayer[field] !== undefined) {
                    squadPlayer[field] = lineupPlayer[field];
                }
            });
        });

        // === Full post-match stats (shared with singleplayer) ===
        const myPlayerInLineup = gameState.lineup.some(p => p && p.isMyPlayer);
        if (myPlayerInLineup) {
            gameState.stats.myPlayerMatches = (gameState.stats.myPlayerMatches || 0) + 1;
        }

        gameState.club.stats.totalMatches++;
        gameState.club.stats.totalGoals += playerScore;

        // Match statistics & streaks
        if (resultType === 'win') {
            gameState.stats.wins++;
            gameState.stats.currentUnbeaten = (gameState.stats.currentUnbeaten || 0) + 1;
            gameState.stats.currentWinStreak = (gameState.stats.currentWinStreak || 0) + 1;
            if (isHome) gameState.stats.homeWins = (gameState.stats.homeWins || 0) + 1;
            const diff = playerScore - opponentScore;
            if (diff >= 3) gameState.stats.bigWins = (gameState.stats.bigWins || 0) + 1;
            if (diff >= 4) gameState.stats.bigWins4 = (gameState.stats.bigWins4 || 0) + 1;
            if (diff >= 5) gameState.stats.bigWins5 = (gameState.stats.bigWins5 || 0) + 1;
            if (!isHome) gameState.stats.awayWins = (gameState.stats.awayWins || 0) + 1;
            if (playerScore === 1 && opponentScore === 0) gameState.stats.oneNilWins = (gameState.stats.oneNilWins || 0) + 1;
            gameState.stats.drawStreak = 0;
            gameState.stats.lossStreak = 0;
        } else if (resultType === 'draw') {
            gameState.stats.draws++;
            gameState.stats.currentUnbeaten = (gameState.stats.currentUnbeaten || 0) + 1;
            gameState.stats.currentWinStreak = 0;
            gameState.stats.drawStreak = (gameState.stats.drawStreak || 0) + 1;
            gameState.stats.lossStreak = 0;
        } else {
            gameState.stats.losses++;
            gameState.stats.currentUnbeaten = 0;
            gameState.stats.currentWinStreak = 0;
            gameState.stats.drawStreak = 0;
            gameState.stats.lossStreak = (gameState.stats.lossStreak || 0) + 1;
        }
        gameState.stats.bestWinStreak = Math.max(gameState.stats.bestWinStreak || 0, gameState.stats.currentWinStreak);
        gameState.stats.bestUnbeaten = Math.max(gameState.stats.bestUnbeaten || 0, gameState.stats.currentUnbeaten);
        if (opponentScore === 0) {
            gameState.stats.cleanSheets = (gameState.stats.cleanSheets || 0) + 1;
            gameState.stats.cleanSheetStreak = (gameState.stats.cleanSheetStreak || 0) + 1;
        } else {
            gameState.stats.cleanSheetStreak = 0;
        }
        if (playerScore > (gameState.stats.highestScoreMatch || 0)) gameState.stats.highestScoreMatch = playerScore;
        gameState.stats.goalsAgainst = (gameState.stats.goalsAgainst || 0) + opponentScore;
        if (playerScore > 0) {
            gameState.stats.scoringStreak = (gameState.stats.scoringStreak || 0) + 1;
            gameState.stats.goalDrought = 0;
        } else {
            gameState.stats.goalDrought = (gameState.stats.goalDrought || 0) + 1;
            gameState.stats.scoringStreak = 0;
        }
        if (new Date().getHours() === 0) gameState.stats.playedAtMidnight = true;
        if (resultType === 'win' && gameState.myPlayer && Math.round(gameState.myPlayer.energy || 0) >= 100 && myPlayerInLineup) {
            gameState.stats.energy100Win = true;
        }
        if (new Date().getDay() === 6) gameState.stats.saturdayMatches = (gameState.stats.saturdayMatches || 0) + 1;

        // Manager XP
        const mgrLevelBefore = getManagerLevel(gameState.manager?.xp || 0);
        const xpReasons = [];
        if (resultType === 'win') { awardXP(gameState, 'matchWin'); xpReasons.push({ reason: 'Wedstrijd gewonnen', amount: 50 }); }
        else if (resultType === 'draw') { awardXP(gameState, 'matchDraw'); xpReasons.push({ reason: 'Gelijkspel', amount: 20 }); }
        if (opponentScore === 0) { awardXP(gameState, 'cleanSheet'); xpReasons.push({ reason: 'Clean sheet', amount: 25 }); }
        if (playerScore > 0) { awardXP(gameState, 'goalScored', playerScore * 5); xpReasons.push({ reason: `${playerScore} doelpunt${playerScore > 1 ? 'en' : ''} gescoord`, amount: playerScore * 5 }); }
        gameState._pendingManagerXP = xpReasons.length > 0 ? xpReasons : null;
        const mgrLevelAfter = getManagerLevel(gameState.manager?.xp || 0);
        if (mgrLevelAfter.level > mgrLevelBefore.level) {
            const mgrLevelData = MANAGER_LEVELS.find(l => l.level === mgrLevelAfter.level);
            const mgrNextData = MANAGER_LEVELS.find(l => l.level === mgrLevelAfter.level + 1);
            gameState._pendingLevelUps = gameState._pendingLevelUps || [];
            gameState._pendingLevelUps.push({ type: 'manager', data: {
                oldLevel: mgrLevelBefore.level, newLevel: mgrLevelAfter.level,
                oldTitle: mgrLevelBefore.title, newTitle: mgrLevelAfter.title,
                nextTitle: mgrNextData?.title || null,
                cashReward: mgrLevelData?.cashReward || 0,
                oldProgress: mgrLevelBefore.progress,
                progress: mgrLevelAfter.progress, xpToNext: mgrLevelAfter.xpToNext
            }});
        }

        // Player XP
        const playerXPReasons = [];
        if (myPlayerInLineup && gameState.myPlayer) {
            awardPlayerXP(gameState, 'match', 20);
            playerXPReasons.push({ reason: 'Wedstrijd gespeeld', amount: 20 });
            const myId = 'myplayer';
            const myGoals = (matchData.events || []).filter(e =>
                (e.type === 'goal' || e.type === 'penalty') && e.team === ourTeam && e.playerId === myId
            ).length;
            const myAssists = (matchData.events || []).filter(e =>
                (e.type === 'goal' || e.type === 'penalty') && e.team === ourTeam && e.assistId === myId
            ).length;
            if (myGoals > 0) {
                const goalXP = myGoals * 50;
                awardPlayerXP(gameState, 'match', goalXP);
                playerXPReasons.push({ reason: `${myGoals} doelpunt${myGoals > 1 ? 'en' : ''}`, amount: goalXP });
                gameState.stats.myPlayerGoals = (gameState.stats.myPlayerGoals || 0) + myGoals;
            }
            if (myAssists > 0) {
                const assistXP = myAssists * 50;
                awardPlayerXP(gameState, 'match', assistXP);
                playerXPReasons.push({ reason: `${myAssists} assist${myAssists > 1 ? 's' : ''}`, amount: assistXP });
                gameState.stats.myPlayerAssists = (gameState.stats.myPlayerAssists || 0) + myAssists;
            }
            if (myGoals > 0 && myAssists > 0) {
                gameState.stats.myGoalAndAssist = (gameState.stats.myGoalAndAssist || 0) + 1;
            }
            if (matchData.manOfTheMatch && matchData.manOfTheMatch.id === 'myplayer') {
                gameState.stats.myPlayerMotm = (gameState.stats.myPlayerMotm || 0) + 1;
            }
        }
        gameState._pendingPlayerXP = playerXPReasons.length > 0 ? playerXPReasons : null;

        // Player growth (lineup players with stars improve, heavily based on match rating)
        // Target: 0.5★ + rating 6 → ~40%, 0.5★ + rating 8 → ~75%
        // Formula: baseGrowth(rating) * starMultiplier
        // baseGrowth: rating 2→5%, 4→15%, 6→35%, 8→65%, 9→80%
        // starMultiplier: 0.5★ → 1.15x, 1★ → 1.5x, 2★ → 2.5x
        const improvements = [];
        const lineupIds = new Set((gameState.lineup || []).filter(p => p).map(p => p.id));
        // Also add club-specific myplayer ID for matching with server-simulated ratings
        const myClubIdForRatings = gameState.multiplayer?.clubId;
        if (lineupIds.has('myplayer') && myClubIdForRatings) {
            lineupIds.add(`myplayer_${myClubIdForRatings}`);
        }
        const ratings = matchData.playerRatings || {};
        gameState.players.forEach(player => {
            if (!player || !lineupIds.has(player.id)) return;
            const stars = player.stars || 0;
            if (stars >= 0.5 && player.overall < 99) {
                const ratingData = ratings[player.id] || ratings[String(player.id)];
                const rating = Math.round(ratingData?.rating || 5);
                // Growth curve: exponential-ish, centered around rating
                const baseGrowth = Math.round(5 + Math.pow(Math.max(0, rating - 2), 1.8) * 3.5);
                const starMultiplier = 0.8 + stars * 1.4;
                const growthGain = Math.round(baseGrowth * starMultiplier);
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

        // Energy: playing players lose, bench players recover
        const tempo = gameState.tactics?.speltempo || 'normaal';
        const tempoEnergyDrain = { rustig: { min: 15, max: 25 }, normaal: { min: 20, max: 30 }, snel: { min: 25, max: 35 } };
        const drain = tempoEnergyDrain[tempo] || tempoEnergyDrain.normaal;
        gameState.players.forEach(player => {
            if (!player) return;
            if (lineupIds.has(player.id)) {
                const loss = drain.min + Math.floor(Math.random() * (drain.max - drain.min + 1));
                player.energy = Math.max(0, (player.energy || 75) - loss);
            } else {
                const recovery = 15 + Math.floor(Math.random() * 11);
                player.energy = Math.min(100, (player.energy || 75) + recovery);
            }
        });
        if (gameState.myPlayer) {
            const mpInLineup = lineupIds.has('myplayer');
            if (mpInLineup) {
                const loss = drain.min + Math.floor(Math.random() * (drain.max - drain.min + 1));
                gameState.myPlayer.energy = Math.max(0, (gameState.myPlayer.energy || 100) - loss);
            } else {
                const recovery = 15 + Math.floor(Math.random() * 11);
                gameState.myPlayer.energy = Math.min(100, (gameState.myPlayer.energy || 100) + recovery);
            }
            const mpSquad = gameState.players.find(p => p && p.id === 'myplayer');
            if (mpSquad) mpSquad.energy = gameState.myPlayer.energy;
        }

        // Fans — calculate but DON'T apply yet (applied after live match commentary)
        const fansBeforeMatch = gameState.club.fans || 50;
        const baseFans = resultType === 'win' ? 10 : resultType === 'draw' ? 3 : -2;
        const offensiveMultipliers = { zeer_verdedigend: 0.5, verdedigend: 0.7, gebalanceerd: 1.0, offensief: 1.5, leeroy: 2.0 };
        const offensiveMultiplier = offensiveMultipliers[gameState.tactics?.offensief] || 1.0;
        const homeMultiplier = isHome ? 1.2 : 1.0;
        const goalBonus = playerScore * 2;
        let newFans = Math.round(baseFans * offensiveMultiplier * homeMultiplier) + goalBonus;

        // Supporters facility bonus (only for HOME matches, only if not under construction)
        let stadiumFanBonus = 0;
        if (isHome) {
            const persLevel = gameState.stadium?.perszaal;
            const isConstructingPers = gameState.stadium?.construction?.category === 'perszaal';
            if (persLevel && !isConstructingPers) {
                const fanBonusMap = { pers_1: 10, pers_2: 25, pers_3: 50, pers_4: 100, pers_5: 200, pers_6: 350, pers_7: 500, pers_8: 750, pers_9: 1000 };
                stadiumFanBonus = fanBonusMap[persLevel] || 0;
                newFans += stadiumFanBonus;
            }
        }

        // Formation drive
        if (!gameState.formationDrives) gameState.formationDrives = {};
        let driveGain = 15 + Math.random() * 5;
        if (gameState.training?.teamTraining?.bonus?.type === 'tactics') driveGain += 10;
        gameState.formationDrives[gameState.formation] = Math.min(100, (gameState.formationDrives[gameState.formation] || 0) + driveGain);

        // Compact playerRatings for storage — only OWN team players
        const improvById = {};
        improvements.forEach(imp => { improvById[String(imp.id)] = imp; });
        const compactRatings = matchData.playerRatings ? Object.entries(matchData.playerRatings)
            .filter(([id]) => lineupIds.has(id) || lineupIds.has(isNaN(Number(id)) ? id : Number(id)))
            .map(([id, data]) => {
            const pid = isNaN(Number(id)) ? id : Number(id);
            const imp = improvById[String(pid)];
            return {
                id: pid,
                name: data.player?.name || '?',
                position: data.player?.position,
                rating: Math.round(data.rating || 6),
                goals: data.goals || 0,
                assists: data.assists || 0,
                yellowCards: data.yellowCards || 0,
                redCards: data.redCards || 0,
                gainPct: imp ? imp.gainPct : 0,
                progressPct: imp ? imp.progressPct : 0,
                leveled: imp ? imp.leveled : false,
                potStars: imp ? imp.stars : 0
            };
        }) : [];

        // Build full result object
        const fullResult = {
            homeTeam: { name: isHome ? gameState.club.name : opponentName },
            awayTeam: { name: isHome ? opponentName : gameState.club.name },
            homeScore: existingResult.home_score,
            awayScore: existingResult.away_score,
            events: matchData.events || [],
            playerRatings: matchData.playerRatings || {},
            possession: matchData.possession || { home: 50, away: 50 },
            shots: matchData.shots || { home: 0, away: 0 },
            shotsOnTarget: matchData.shotsOnTarget || { home: 0, away: 0 },
            fouls: matchData.fouls || { home: 0, away: 0 },
            cards: matchData.cards || { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } },
            xG: matchData.xG || { home: 0, away: 0 },
            manOfTheMatch: matchData.manOfTheMatch
        };

        // Chairman comments
        const chairmanComments = generateChairmanComments(fullResult, isHome, improvements, resultType, playerScore, opponentScore);

        // Store last match
        gameState.lastMatch = {
            ...fullResult,
            isHome,
            playerScore,
            opponentScore,
            resultType,
            opponent: opponentName,
            playerRatings: compactRatings,
            improvements,
            chairmanComments,
            newFans,
            stadiumFanBonus
        };

        // Push to match history (use captured week/season, not gameState which may be bumped)
        if (!gameState.matchHistory) gameState.matchHistory = [];
        const storedEvents = (matchData.events || []).filter(e =>
            ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'injury', 'penalty', 'penalty_miss'].includes(e.type)
        );
        gameState.matchHistory.push({
            week,
            season,
            opponent: opponentName,
            isHome,
            playerScore,
            opponentScore,
            resultType,
            events: storedEvents,
            possession: fullResult.possession,
            shots: fullResult.shots,
            shotsOnTarget: fullResult.shotsOnTarget,
            xG: fullResult.xG,
            fouls: fullResult.fouls,
            cards: fullResult.cards,
            manOfTheMatch: fullResult.manOfTheMatch,
            playerRatings: compactRatings,
            improvements,
            chairmanComments
        });

        // Mark week as played — prevents replaying until next round
        gameState._weekPlayed = true;
        gameState.lastPlayedWeek = week; // Track which week this player last completed
        // Track when last match was played (daily limit: 1 per day)
        gameState.lastMatchPlayedAt = Date.now();
        // Update timer to count down to tomorrow's match time
        gameState.nextMatch.time = getNextMatchTime();

        // Advance week — sync from DB (RPC already advanced it)
        // Also clear any pending league update from realtime
        gameState._pendingLeagueWeek = null;
        gameState._pendingLeagueSeason = null;
        const { data: updatedLeague } = await supabase
            .from('leagues')
            .select('week, season')
            .eq('id', leagueId)
            .single();
        if (updatedLeague) {
            gameState.week = updatedLeague.week;
            gameState.season = updatedLeague.season;
        } else {
            gameState.week++;
        }

        // Sync standings from Supabase
        await syncStandingsFromSupabase();

        // Apply weekly finances
        const didWin = playerScore > opponentScore;
        applyWeeklyFinances(didWin);

        // Tick sponsor contracts + refresh market
        tickSponsorContracts();
        generateSponsorMarket();

        // Process youth academy (age + growth + intake)
        processYouthDaily();

        // Reset wedstrijdvoorbereiding
        if (gameState.training && gameState.training.teamTraining) {
            gameState.training.teamTraining.selected = null;
            gameState.training.teamTraining.bonus = null;
        }

        // Check season end
        if (isSeasonComplete(gameState.standings)) {
            // Multiplayer season transition: atomic RPC resets standings/season in DB
            const { data: seasonResult } = await supabase.rpc('process_season_end', {
                p_league_id: leagueId,
                p_season: season
            });

            // Local season-end effects (same as singleplayer handleEndOfSeason)
            const calcResult = calculateSeasonResults(gameState.standings, gameState.club.division);
            if (calcResult) {
                if (calcResult.promoted) {
                    gameState.stats.promotions = (gameState.stats.promotions || 0) + 1;
                    gameState.stats.consecutivePromotions = (gameState.stats.consecutivePromotions || 0) + 1;
                    awardXP(gameState, 'promotion');
                    showManagerXPPopup([{ reason: 'Promotie!', amount: 500 }]);

                    // Promotie bonus: +0.5 ster voor spelers die minstens helft seizoen speelden
                    const promoMatches = (gameState.matchHistory || []).filter(m => m.season === season);
                    const totalPromoMatches = promoMatches.length;
                    const halfPromoMatches = Math.ceil(totalPromoMatches / 2);
                    const matchCounts = {};
                    promoMatches.forEach(m => {
                        (m.playerRatings || []).forEach(r => {
                            const pid = String(r.id);
                            matchCounts[pid] = (matchCounts[pid] || 0) + 1;
                        });
                    });
                    gameState.players.forEach(p => {
                        const played = matchCounts[String(p.id)] || 0;
                        if (played >= halfPromoMatches) {
                            p.stars = Math.min(5, (p.stars || 0) + 0.5);
                        }
                    });
                } else {
                    gameState.stats.consecutivePromotions = 0;
                }
                if (calcResult.isChampion) {
                    awardXP(gameState, 'title');
                    showManagerXPPopup([{ reason: 'Kampioen!', amount: 1000 }]);
                    gameState.stats.champion = (gameState.stats.champion || 0) + 1;
                }
                if (calcResult.position === 6) {
                    gameState.stats.relegationEscapes = (gameState.stats.relegationEscapes || 0) + 1;
                }

                // Track season-end stats
                if (calcResult.position !== undefined) {
                    const totalTeams = gameState.standings?.length || 8;
                    if (calcResult.position <= Math.floor(totalTeams / 2)) {
                        gameState.stats.topHalfFinish = (gameState.stats.topHalfFinish || 0) + 1;
                    }
                    if (calcResult.position === 2) {
                        gameState.stats.runnerUp = (gameState.stats.runnerUp || 0) + 1;
                    }
                    if (calcResult.position === totalTeams) {
                        gameState.stats.lastPlace = true;
                    }
                }

                // Track perfect season
                const seasonMatchesForStats = (gameState.matchHistory || []).filter(m => m.season === season);
                if (seasonMatchesForStats.length >= 14) {
                    if (seasonMatchesForStats.every(m => m.resultType === 'win')) {
                        gameState.stats.perfectSeason = true;
                    }
                }

                // Track budget positive at season end
                if (gameState.club.budget > 0) {
                    gameState.stats.budgetPositive = true;
                }

                // Track yoyo club
                const sh = gameState.seasonHistory || [];
                if (sh.length >= 2) {
                    const prev = sh[sh.length - 1];
                    if ((prev.result === 'promoted' || prev.result === 'champion') && calcResult.relegated) {
                        gameState.stats.yoyoClub = true;
                    }
                }

                // Track comeback promotion
                if (calcResult.promoted && sh.length >= 1) {
                    const lastResult = sh[sh.length - 1]?.result;
                    if (lastResult === 'relegated') {
                        gameState.stats.comebackPromotion = true;
                    }
                }

                // Reset season spending + played week tracker
                gameState.stats.seasonSpending = 0;
                gameState.lastPlayedWeek = 0;
            }

            // Archive season
            const seasonMatches = (gameState.matchHistory || []).filter(m => m.season === season);
            gameState.seasonHistory = gameState.seasonHistory || [];
            gameState.seasonHistory.push({
                season,
                division: gameState.club.division,
                position: calcResult?.position || 1,
                wins: seasonMatches.filter(m => m.resultType === 'win').length,
                draws: seasonMatches.filter(m => m.resultType === 'draw').length,
                losses: seasonMatches.filter(m => m.resultType === 'loss').length,
                goalsFor: seasonMatches.reduce((s, m) => s + m.playerScore, 0),
                goalsAgainst: seasonMatches.reduce((s, m) => s + m.opponentScore, 0),
                result: calcResult?.isChampion ? 'champion' : calcResult?.promoted ? 'promoted' : calcResult?.relegated ? 'relegated' : 'normal'
            });

            // Update division locally (multiplayer: all teams stay in same league, but track individually)
            if (calcResult) {
                gameState.club.division = calcResult.newDivision;
                if (calcResult.isChampion) gameState.club.stats.titles = (gameState.club.stats.titles || 0) + 1;
                if (calcResult.newDivision < (gameState.club.stats.highestDivision || 8)) {
                    gameState.club.stats.highestDivision = calcResult.newDivision;
                }
            }

            // Age players, reset goals/assists
            gameState.players.forEach(p => { if (p) { p.age++; p.goals = 0; p.assists = 0; } });

            // Sync new week/season from DB
            const { data: newLeague } = await supabase
                .from('leagues')
                .select('week, season')
                .eq('id', leagueId)
                .single();
            if (newLeague) {
                gameState.week = newLeague.week;
                gameState.season = newLeague.season;
            }

            // Generate new schedule for the new season
            const { data: allClubs } = await supabase
                .from('clubs')
                .select('id, is_ai')
                .eq('league_id', leagueId);
            if (allClubs) {
                const humanClubIds = allClubs.filter(c => !c.is_ai).map(c => c.id);
                await generateSchedule(leagueId, gameState.season, allClubs.map(c => c.id), humanClubIds);
            }

            // Re-sync standings for new season
            await syncStandingsFromSupabase();

            gameState._weekPlayed = false; // New season = new round
            showSeasonEndModal(calcResult);
        } else {
            setNextMatch();
        }

        // Re-render
        renderStandings();
        renderTopScorers();
        renderPlayerCards();
        updateBudgetDisplays();
        renderDashboardExtras();

        // Save (forceSyncToSupabase routes through same lock as saveGame)
        saveGame(gameState);
        forceSyncToSupabase();

        // Show live match simulation — fans shown as pre-match value during commentary
        fullResult._fansBeforeMatch = fansBeforeMatch;
        showLiveMatch(fullResult, isHome, opponentName, () => {
            // Apply fan change AFTER commentary ends
            gameState.club.fans = Math.max(0, fansBeforeMatch + newFans);

            navigateToPage('wedstrijden');
            setTimeout(() => activateTabOnPage('wedstrijden', 'verslag'), 50);

            // Show pending XP popups
            setTimeout(() => showPendingXPModals(), 500);

            if (matchNotifications.length > 0) {
                setTimeout(() => {
                    matchNotifications.forEach(msg => showNotification(msg, 'warning'));
                }, 1000);
            }
            if (redCardEvents.length > 0) {
                setTimeout(() => {
                    showNotification(`Rode kaart boete: ${formatCurrency(redCardEvents.length * 100)}`, 'warning');
                }, 1500);
            }

            // Check achievements
            const newAchievements = checkAchievements(gameState);
            if (newAchievements.length > 0) {
                setTimeout(() => queueAchievements(newAchievements), 3000);
            }
        });

    } catch (err) {
        console.error('Multiplayer match error:', err);
        showNotification('Fout bij laden wedstrijd: ' + err.message, 'error');
    }
}

/**
 * Sync standings from Supabase into local gameState
 */
async function syncStandingsFromSupabase() {
    const mp = gameState.multiplayer;
    if (!mp || !mp.leagueId) return;

    const { data: standings } = await supabase
        .from('standings')
        .select('*, clubs(name, is_ai)')
        .eq('league_id', mp.leagueId)
        .eq('season', gameState.season || 1)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false });

    if (standings && standings.length > 0) {
        gameState.standings = standings.map((s, idx) => ({
            name: s.clubs?.name || 'Onbekend',
            played: s.played || 0,
            won: s.won || 0,
            drawn: s.drawn || 0,
            lost: s.lost || 0,
            goalsFor: s.goals_for || 0,
            goalsAgainst: s.goals_against || 0,
            goalDiff: (s.goals_for || 0) - (s.goals_against || 0),
            points: s.points || 0,
            position: idx + 1,
            clubId: s.club_id,
            isAI: s.clubs?.is_ai ?? true,
            isPlayer: s.club_id === mp.clubId
        }));
    }
}

function getNextMatchTime() {
    const matchTimeStr = gameState._matchTime || '10:40';
    const [hours, minutes] = matchTimeStr.split(':').map(Number);
    const now = new Date();
    const today = new Date(now);
    today.setHours(hours, minutes, 0, 0);

    // If we already played today, next match is tomorrow
    const lastPlayed = gameState.lastMatchPlayedAt;
    if (lastPlayed) {
        const lastDate = new Date(lastPlayed);
        const isToday = lastDate.toDateString() === now.toDateString();
        if (isToday) {
            // Already played today → tomorrow at match_time
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.getTime();
        }
    }

    // Haven't played today — if it's past match_time, match is available now
    if (now >= today) {
        return today.getTime(); // In the past = available now
    }

    // Before match_time today — count down to today's match_time
    return today.getTime();
}

function setNextMatch() {
    gameState.nextMatch = {
        opponent: 'Laden...',
        time: getNextMatchTime()
    };
    if (!gameState.multiplayer?.clubId) return;
    getScheduledOpponent(
        gameState.multiplayer.leagueId,
        gameState.season || 1,
        gameState.week || 1,
        gameState.multiplayer.clubId
    ).then(opp => {
        if (opp) {
            gameState.nextMatch.opponent = opp.name;
            gameState.nextMatch.isHome = opp.isHome;
            const awayTeamName = document.getElementById('away-team-name');
            if (awayTeamName) awayTeamName.textContent = opp.name;
        }
    }).catch(() => {});
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
    const formation = FORMATIONS[gameState.formation];
    const formationName = formation?.name || gameState.formation;
    const tactics = gameState.tactics || {};
    const teamTraining = gameState.training?.teamTraining?.selected;
    const possession = isHome ? result.possession?.home : result.possession?.away;
    const formationDrive = getFormationDrive(gameState.formation);
    const opponent = gameState.lastMatch?.opponent || gameState.nextMatch?.opponent || 'de tegenstander';

    const lineup = gameState.lineup || [];
    let wrongPositionCount = 0;
    if (formation) {
        lineup.forEach((playerId, i) => {
            if (!playerId || !formation.positions[i]) return;
            const player = gameState.players.find(p => p.id === playerId);
            if (!player) return;
            if (getPositionGroup(player.position) !== getPositionGroup(formation.positions[i].role)) {
                wrongPositionCount++;
            }
        });
    }

    // Build story parts
    const parts = [];

    // Opening — result reaction
    if (resultType === 'win' && playerScore >= 3) {
        parts.push(`Wat een wedstrijd! ${playerScore}-${opponentScore} tegen ${opponent}, daar kan niemand iets van zeggen.`);
    } else if (resultType === 'win') {
        parts.push(`Een verdiende overwinning tegen ${opponent}. ${playerScore}-${opponentScore}, daar doen we het voor.`);
    } else if (resultType === 'draw' && playerScore === 0) {
        parts.push(`Een bloedeloos gelijkspel tegen ${opponent}. Daar word ik niet warm van.`);
    } else if (resultType === 'draw') {
        parts.push(`${playerScore}-${opponentScore} tegen ${opponent}. Een gelijkspel, het had beide kanten op kunnen vallen.`);
    } else if (opponentScore >= 3) {
        parts.push(`${playerScore}-${opponentScore} tegen ${opponent}. Dit is pijnlijk, daar ga ik niet omheen draaien.`);
    } else {
        parts.push(`Een nederlaag tegen ${opponent}. ${playerScore}-${opponentScore}, dat is niet wat we wilden.`);
    }

    // Highlight — best moment
    if (opponentScore === 0) {
        parts.push('De nul houden tegen deze ploeg is knap. Achterin stond het als een huis.');
    }
    if (result.manOfTheMatch) {
        const motm = result.manOfTheMatch;
        const ratingStr = motm.rating ? ` met een ${Math.round(motm.rating)}` : '';
        parts.push(`${motm.name} was vandaag de uitblinker${ratingStr}. Zo\'n speler heb je nodig.`);
    }
    if (improvements.length > 0) {
        parts.push(`Mooi om te zien dat ${improvements[0].name} weer een stap vooruit heeft gezet.`);
    }

    // Tactical observation
    if (wrongPositionCount >= 3) {
        parts.push(`Maar ${wrongPositionCount} spelers op een verkeerde positie, dat kan echt niet. Daar verliezen we kwaliteit mee.`);
    } else if (wrongPositionCount >= 1) {
        parts.push('Ik zag spelers op verkeerde posities staan. Dat is zonde van hun talent.');
    }
    if (formationDrive >= 80) {
        parts.push(`Het team is goed ingespeeld op de ${formationName}, dat zie je terug op het veld.`);
    } else if (formationDrive < 40) {
        parts.push(`We zijn nog lang niet ingespeeld op de ${formationName}. Dat kost ons wedstrijden.`);
    }
    if (possession && possession >= 55) {
        parts.push('We hadden de controle met het balbezit, zo wil ik het zien.');
    } else if (possession && possession < 40) {
        parts.push('We waren te weinig aan de bal. Als je de bal niet hebt, kun je ook niet scoren.');
    }

    // Tactics feedback
    if (isHome && (tactics.offensief === 'zeer_verdedigend' || tactics.offensief === 'verdedigend')) {
        parts.push('Thuis zo verdedigend spelen vind ik niks. De fans komen voor aanvallend voetbal.');
    }
    if (!isHome && tactics.offensief === 'leeroy') {
        parts.push('Uit zo vol in de aanval gaan is wel erg risicovol. Een beetje voorzichtigheid mag ook.');
    }
    if (tactics.speltempo === 'snel' && resultType === 'loss') {
        parts.push('Het hoge tempo werkte vandaag tegen ons. Soms is rustig opbouwen slimmer.');
    }
    if (tactics.dekking === 'man' && opponentScore >= 2) {
        parts.push('De mandekking werd vandaag te makkelijk uitgespeeld. Zonedekking was misschien beter geweest.');
    }
    if (tactics.mentaliteit === 'extreem') {
        const cards = (result.events || []).filter(e => e.type === 'yellow_card' || e.type === 'red_card');
        if (cards.length >= 2) parts.push('Die extreme mentaliteit kost ons te veel kaarten. Zo houden we geen elf man op het veld.');
    }

    // Training feedback
    if (teamTraining === 'defense' && opponentScore === 0) {
        parts.push('De verdedigende voorbereiding heeft zich uitbetaald, de nul gehouden.');
    } else if (teamTraining === 'attack' && playerScore >= 2) {
        parts.push('De aanvallende voorbereiding heeft z\'n vruchten afgeworpen, dat zie je aan de doelpunten.');
    } else if (teamTraining === 'tactics' && formationDrive >= 60) {
        parts.push('De tactische bespreking heeft ons scherper gemaakt, goed gedaan.');
    } else if (!teamTraining) {
        parts.push('Jammer dat we geen wedstrijdvoorbereiding hebben gedaan. Dat is een gemiste kans.');
    }

    // Closing
    if (resultType === 'win') {
        if (playerScore === 0 && opponentScore === 0) {
            parts.push('Volgende week weer. We gaan door.');
        } else {
            const closers = ['Op naar de volgende.', 'Zo doorgaan.', 'Dit smaakt naar meer.'];
            parts.push(closers[Math.floor(Math.random() * closers.length)]);
        }
    } else if (resultType === 'draw') {
        const closers = ['Volgende week beter.', 'Er zit meer in dit team.', 'We pakken het volgende week op.'];
        parts.push(closers[Math.floor(Math.random() * closers.length)]);
    } else {
        const closers = ['Kop omhoog en door.', 'Volgende week revanche.', 'We moeten hiervan leren.'];
        parts.push(closers[Math.floor(Math.random() * closers.length)]);
    }

    // Limit to 4 parts max for readability (opening + 2 middle + closing)
    if (parts.length > 4) {
        const opening = parts[0];
        const closing = parts[parts.length - 1];
        const middle = parts.slice(1, -1);
        // Shuffle middle and pick 2
        for (let i = middle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [middle[i], middle[j]] = [middle[j], middle[i]];
        }
        return { story: [opening, ...middle.slice(0, 2), closing].join(' ') };
    }

    return { story: parts.join(' ') };
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
    const possHome = isHome ? (match.possession?.home ?? 50) : (match.possession?.away ?? 50);
    const possAway = isHome ? (match.possession?.away ?? 50) : (match.possession?.home ?? 50);
    const shotsHome = isHome ? match.shots.home : match.shots.away;
    const shotsAway = isHome ? match.shots.away : match.shots.home;
    const sotHome = isHome ? match.shotsOnTarget.home : match.shotsOnTarget.away;
    const sotAway = isHome ? match.shotsOnTarget.away : match.shotsOnTarget.home;
    const xgHome = isHome ? (match.xG?.home || 0) : (match.xG?.away || 0);
    const xgAway = isHome ? (match.xG?.away || 0) : (match.xG?.home || 0);
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
                <tr><th>Pos</th><th>Speler</th><th>ALG</th><th>POT</th><th>Cijfer</th><th>Groei</th></tr>
            </thead>
            <tbody>
                ${sortedRatings.map(p => {
                    const ratingClass = p.rating >= 8 ? 'good' : p.rating >= 6 ? 'okay' : 'poor';
                    const posAbbr = POSITIONS[p.position]?.abbr || p.position;
                    const actualPlayer = gameState.players.find(pl => pl && pl.id === p.id);
                    const injuryIcon = actualPlayer && actualPlayer.injuredUntil && actualPlayer.injuredUntil > gameState.week ? `<span class="mr-injury">🏥${actualPlayer.injuredUntil - gameState.week}</span>` : '';
                    const iconParts = [];
                    if (injuryIcon) iconParts.push(injuryIcon);
                    if (p.goals) iconParts.push(`⚽${p.goals > 1 ? p.goals : ''}`);
                    if (p.assists) iconParts.push(`🅰️${p.assists > 1 ? p.assists : ''}`);
                    if (p.yellowCards) iconParts.push('🟨');
                    if (p.redCards) iconParts.push('🟥');
                    const icons = iconParts.join('');
                    const isMyPlayer = actualPlayer && actualPlayer.isMyPlayer;
                    const stars = actualPlayer ? (actualPlayer.stars || 0) : (p.potStars || 0);
                    let growthHTML;
                    if (isMyPlayer) {
                        growthHTML = `<a class="rating-myplayer-link" onclick="navigateTo('training')">Check voortgang</a>`;
                    } else if (p.gainPct > 0) {
                        const levelUpIcon = p.leveled ? ' <span class="rating-levelup">+1 ALG!</span>' : '';
                        growthHTML = `<div class="rating-growth-wrap">
                            <div class="rating-growth-bar"><div class="rating-growth-fill" style="width: ${p.progressPct}%"></div></div>
                            <span class="rating-growth-label-positive">+${p.gainPct}%</span>${levelUpIcon}
                        </div>`;
                    } else {
                        growthHTML = `<span class="rating-no-growth">-</span>`;
                    }
                    const posData2 = POSITIONS[p.position] || { color: '#666' };
                    const starsHtml = renderStarsHTML(stars);
                    return `<tr>
                        <td><span class="mr-pos-badge" style="background: ${posData2.color}">${posAbbr}</span></td>
                        <td><span class="mr-name-wrap">${p.name} ${icons}</span></td>
                        <td><span class="mr-ovr-badge" style="background: ${posData2.color}">${actualPlayer ? actualPlayer.overall : '?'}</span></td>
                        <td><span class="rating-stars-cell">${starsHtml}</span></td>
                        <td><span class="match-rating-badge ${ratingClass}">${Math.round(p.rating)}</span></td>
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
            ${comments?.story ? `
                <div class="chairman-postmatch">
                    <div class="chairman-postmatch-avatar">${CHAIRMAN_SVG}</div>
                    <p class="chairman-postmatch-story">${comments.story}</p>
                </div>
            ` : ''}
            <div class="report-grid">
                <div class="report-col-left">
                    <div class="match-result-verdict">${resultText}</div>
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
                    ${goalSummaryHtml}
                    ${cardSummaryHtml}

                    <div class="match-result-stats-compact">
                        <div class="stat-compact-row"><span class="stat-compact-val">${possHome}%</span><span class="stat-compact-label">Balbezit</span><span class="stat-compact-val">${possAway}%</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${shotsHome}</span><span class="stat-compact-label">Schoten</span><span class="stat-compact-val">${shotsAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${sotHome}</span><span class="stat-compact-label">Op doel</span><span class="stat-compact-val">${sotAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${xgHome.toFixed(2)}</span><span class="stat-compact-label">xG</span><span class="stat-compact-val">${xgAway.toFixed(2)}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${cornersHome}</span><span class="stat-compact-label">Corners</span><span class="stat-compact-val">${cornersAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${foulsHome}</span><span class="stat-compact-label">Overtredingen</span><span class="stat-compact-val">${foulsAway}</span></div>
                        <div class="stat-compact-row"><span class="stat-compact-val">${cardsYellowHome} / ${cardsRedHome}</span><span class="stat-compact-label">Geel / Rood</span><span class="stat-compact-val">${cardsYellowAway} / ${cardsRedAway}</span></div>
                    </div>

                    ${match.manOfTheMatch || match.newFans !== undefined ? `
                        <div class="report-footer">
                            ${match.manOfTheMatch ? `
                                <div class="report-footer-item motm">
                                    <span class="report-footer-label">Man of the Match</span>
                                    <span class="report-footer-value">${match.manOfTheMatch.name}${match.manOfTheMatch.rating ? ` — ${Math.round(match.manOfTheMatch.rating)}` : ''}</span>
                                </div>
                            ` : ''}
                            ${match.newFans !== undefined ? `
                                <div class="report-footer-item fans">
                                    <span class="report-footer-label">Fans</span>
                                    <span class="report-footer-value">${match.newFans >= 0 ? `+${match.newFans}` : match.newFans}${match.stadiumFanBonus ? ` <span class="report-footer-meta">(waarvan +${match.stadiumFanBonus} stadion)</span>` : ''} <span class="report-footer-meta">(${gameState.club.fans} totaal)</span></span>
                                </div>
                            ` : ''}
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
                                    const cls = r >= 8 ? 'good' : r >= 6 ? 'okay' : 'poor';
                                    return `<td><span class="form-badge ${cls}">${Math.round(r)}</span></td>`;
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

async function renderMatchProgram() {
    const container = document.getElementById('programma-schedule');
    if (!container || !gameState.standings || gameState.standings.length === 0) {
        if (container) container.innerHTML = '<p>Geen competitieschema beschikbaar.</p>';
        return;
    }

    // Render standings next to program
    const divisionNames = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];
    const standContainer = document.getElementById('programma-standings');
    if (standContainer) standContainer.innerHTML = renderCompactStandings(divisionNames);

    // In multiplayer, use real schedule from Supabase
    let schedule;
    if (isMultiplayer() && gameState.multiplayer?.leagueId) {
        schedule = await getFullSchedule(gameState.multiplayer.leagueId, gameState.season || 1);
    }
    // Fallback to generated schedule for singleplayer or if Supabase fetch fails
    if (!schedule || schedule.length === 0) {
        schedule = getSeasonSchedule(gameState.standings, gameState.week);
    }

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
            if (match.played) {
                // Multiplayer: use scores from schedule table
                scoreHtml = `<span class="program-result program-result-played">${match.homeScore ?? 0} - ${match.awayScore ?? 0}</span>`;
            } else if (historyEntry) {
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
// LIVE MATCH SIMULATION
// ================================================

function showLiveMatch(result, isHome, opponentName, onComplete) {
    const playerTeam = gameState.club.name;

    // Fix preview events: replace tactics line with THIS player's tactics (not home team's)
    const myTactics = gameState.tactics?.offensief || 'gebalanceerd';
    const tacticsLabels = { zeer_verdedigend: 'zeer verdedigend', verdedigend: 'verdedigend', gebalanceerd: 'gebalanceerd', offensief: 'offensief', leeroy: 'vol in de aanval — Leeroy Jenkins-stijl' };
    const myTacticsLine = `We spelen vandaag ${tacticsLabels[myTactics] || 'gebalanceerd'}. Laten we hopen dat het werkt!`;
    result.events.forEach(ev => {
        if (ev.type === 'preview' && ev.commentary?.startsWith('⚽ We spelen vandaag')) {
            ev.commentary = `⚽ ${myTacticsLine}`;
        }
        // Fix team names in preview for away perspective
        if (ev.type === 'preview' && ev.commentary?.startsWith('📋 Voorbeschouwing') && !isHome) {
            ev.commentary = `📋 Voorbeschouwing — ${playerTeam} vs ${opponentName}`;
        }
    });

    // Build events timeline: map events to minutes, track running score
    const eventsByMinute = {};
    let runningHome = 0;
    let runningAway = 0;

    result.events.forEach(ev => {
        if (ev.type === 'half_time' || ev.type === 'full_time') return;
        const m = ev.minute;
        if (!eventsByMinute[m]) eventsByMinute[m] = [];

        let scoreAfter = null;
        if (ev.type === 'goal' || ev.type === 'penalty') {
            if (ev.team === 'home') runningHome++;
            else runningAway++;
            scoreAfter = { home: runningHome, away: runningAway };
        }

        eventsByMinute[m].push({ ...ev, scoreAfter });
    });

    // Check if event is a shot-type (gets suspense buildup)
    const shotTypes = new Set(['goal', 'shot_saved', 'shot_missed', 'penalty', 'penalty_miss']);
    function isShotEvent(ev) { return shotTypes.has(ev.type); }

    // Determine which half the play is on (for field highlight)
    // Own attacks = top half (opponent goal), opponent attacks = bottom half (our goal)
    function getFieldSide(ev) {
        const isPlayerTeam = (isHome && ev.team === 'home') || (!isHome && ev.team === 'away');
        switch (ev.type) {
            case 'goal': case 'shot': case 'shot_saved': case 'shot_missed':
            case 'penalty': case 'penalty_miss': case 'chance': case 'corner': case 'free_kick':
                return isPlayerTeam ? 'left' : 'right';
            default:
                return null; // no highlight
        }
    }

    function isOwnTeamEvent(ev) {
        return (isHome && ev.team === 'home') || (!isHome && ev.team === 'away');
    }

    // Buildup commentary templates (voorzitter is partijdig!)
    const buildupOwn = [
        `Kans voor ${playerTeam}! {player} haalt uit...`,
        `Ja! ${playerTeam} komt gevaarlijk opzetten! {player} staat vrij...`,
        `Mooie aanval van ${playerTeam}! {player} krijgt de bal...`,
        `${playerTeam} ruikt bloed! {player} zoekt de hoek...`,
        `Daar is de kans! {player} van ${playerTeam} schiet...`,
        `Kom op! {player} neemt 'm op de slof...`,
        `Grote kans voor ${playerTeam}! {player} staat oog in oog met de keeper...`,
        `${playerTeam} met een snelle counter! {player} is door...`
    ];
    const buildupOpp = [
        `Nee hè... ${opponentName} komt gevaarlijk opzetten. {player} staat vrij...`,
        `Oppassen! ${opponentName} via {player}...`,
        `Gevaar! {player} van ${opponentName} haalt uit...`,
        `${opponentName} dreigt... {player} staat alleen voor de keeper...`,
        `Ik hoop dat dit goed gaat... {player} van ${opponentName} schiet...`,
        `Verdedigen! ${opponentName} via {player}...`,
        `Oh nee, {player} van ${opponentName} is door...`,
        `${opponentName} met een snelle uitbraak! {player} is gevaarlijk...`
    ];

    // Voorzitter reacties na uitslag (partijdig)
    const reactionsOwnGoal = [
        `JAAAA! {player} scoort voor ${playerTeam}! Wat een held!`,
        `GOAL!! Geweldig van {player}! Daar word ik blij van!`,
        `{player} doet het! Fantastisch! Kom op ${playerTeam}!`,
        `WAT EEN GOAL van {player}! De club mag trots zijn!`
    ];
    const reactionsOppGoal = [
        `Nee... {player} van ${opponentName} scoort. Dat doet pijn.`,
        `Tegendoelpunt via {player}. Balen. Kom op jongens!`,
        `{player} maakt 'm voor ${opponentName}... We moeten terugvechten!`,
        `Ach nee, {player} scoort voor ${opponentName}. Dat had niet gemogen.`
    ];
    const reactionsOwnSaved = [
        `Jammer! De keeper houdt het schot van {player} tegen.`,
        `Bijna! {player} dicht bij een goal, maar de keeper redt.`,
        `Ohh, {player} schiet goed, maar de doelman pakt 'm.`
    ];
    const reactionsOppSaved = [
        `Gelukkig! Onze keeper houdt {player} van ${opponentName} tegen!`,
        `Goed zo keeper! {player} van ${opponentName} komt niet langs!`,
        `Pfoe, dat was gevaarlijk. Maar {player} wordt gestopt!`
    ];
    const reactionsOwnMiss = [
        `Nee! {player} schiet 'm naast! Die had erin gemoeten!`,
        `Ach, {player} mist het doel. Volgende keer beter!`,
        `{player} schiet over... Jammer, dat was een goede kans.`
    ];
    const reactionsOppMiss = [
        `Ha! {player} van ${opponentName} mist! Mazzel voor ons.`,
        `Gelukkig naast! {player} mist voor ${opponentName}.`,
        `Die gaat gelukkig over. {player} van ${opponentName} schiet wild.`
    ];

    // Event icons
    const eventIcons = {
        'goal': '\u26BD', 'own_goal': '\u26BD', 'yellow_card': '\uD83D\uDFE8',
        'red_card': '\uD83D\uDFE5', 'substitution': '\uD83D\uDD04', 'injury': '\uD83E\uDD15',
        'shot': '\uD83D\uDCA8', 'shot_saved': '\uD83E\uDDE4', 'shot_missed': '\uD83D\uDCA8',
        'save': '\uD83E\uDDE4', 'foul': '\u26A0\uFE0F', 'corner': '\uD83D\uDCD0',
        'free_kick': '\uD83C\uDFAF', 'penalty': '\u26BD', 'penalty_miss': '\u274C',
        'chance': '\uD83D\uDCA5', 'preview': '\uD83D\uDCCB'
    };

    // Live stats counters
    const liveStats = {
        shotsHome: 0, shotsAway: 0,
        sotHome: 0, sotAway: 0,
        foulsHome: 0, foulsAway: 0,
        yellowsHome: 0, yellowsAway: 0,
        redsHome: 0, redsAway: 0,
        xgHome: 0, xgAway: 0
    };

    // Build overlay HTML
    const overlay = document.createElement('div');
    overlay.className = 'live-match-overlay';

    const finalPossHome = isHome ? (result.possession?.home ?? 50) : (result.possession?.away ?? 50);
    const finalPossAway = 100 - finalPossHome;

    overlay.innerHTML = `
        <div class="live-match-body">
            <div class="live-match-left">
                <div class="live-match-field">
                    <div class="live-match-field-penalty-left"></div>
                    <div class="live-match-field-goal-left"></div>
                    <div class="live-match-field-penalty-right"></div>
                    <div class="live-match-field-goal-right"></div>
                    <div class="live-match-field-highlight" id="lm-highlight"></div>
                    <div class="live-match-field-ball" id="lm-ball"></div>
                    <div class="live-match-field-team top">${opponentName}</div>
                    <div class="live-match-field-team bottom">${playerTeam}</div>
                </div>
                <div class="live-match-minute" id="lm-minute">0'</div>
                <div class="live-match-scoreboard">
                    <div class="live-match-scoreboard-inner">
                        <span class="live-match-team-name home">${playerTeam}</span>
                        <div class="live-match-score">
                            <span class="live-match-score-num" id="lm-score-home">0</span>
                            <span class="live-match-score-sep">-</span>
                            <span class="live-match-score-num" id="lm-score-away">0</span>
                        </div>
                        <span class="live-match-team-name away">${opponentName}</span>
                    </div>
                </div>
                <div class="live-match-fans">Fans: ${result._fansBeforeMatch || gameState.club.fans || 50}</div>
                <div class="live-match-stats" id="lm-stats">
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-poss-home">50%</span>
                        <span class="live-match-stat-label">Balbezit</span>
                        <span class="live-match-stat-value away" id="lm-poss-away">50%</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-shots-home">0</span>
                        <span class="live-match-stat-label">Schoten</span>
                        <span class="live-match-stat-value away" id="lm-shots-away">0</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-sot-home">0</span>
                        <span class="live-match-stat-label">Op doel</span>
                        <span class="live-match-stat-value away" id="lm-sot-away">0</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-xg-home">0.00</span>
                        <span class="live-match-stat-label">xG</span>
                        <span class="live-match-stat-value away" id="lm-xg-away">0.00</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-fouls-home">0</span>
                        <span class="live-match-stat-label">Overtredingen</span>
                        <span class="live-match-stat-value away" id="lm-fouls-away">0</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-yellows-home">0</span>
                        <span class="live-match-stat-label">Gele kaarten</span>
                        <span class="live-match-stat-value away" id="lm-yellows-away">0</span>
                    </div>
                    <div class="live-match-stat">
                        <span class="live-match-stat-value home" id="lm-reds-home">0</span>
                        <span class="live-match-stat-label">Rode kaarten</span>
                        <span class="live-match-stat-value away" id="lm-reds-away">0</span>
                    </div>
                </div>
            </div>
            <div class="live-match-right">
                <div class="live-match-commentary" id="lm-commentary">
                    <div class="live-match-commentary-avatar">${CHAIRMAN_SVG}</div>
                    <div class="live-match-commentary-text">
                        <span class="speaker">De voorzitter</span>
                        <span id="lm-commentary-msg">De wedstrijd gaat zo beginnen...</span>
                    </div>
                </div>
                <div class="live-match-log" id="lm-log"></div>
            </div>
        </div>
        <div class="live-match-controls" id="lm-controls">
            <button class="live-match-btn-skip" id="lm-skip">
                Sla over naar resultaat
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // References
    const scoreHomeEl = document.getElementById('lm-score-home');
    const scoreAwayEl = document.getElementById('lm-score-away');
    const minuteEl = document.getElementById('lm-minute');
    const highlightEl = document.getElementById('lm-highlight');
    const ballEl = document.getElementById('lm-ball');
    const commentaryEl = document.getElementById('lm-commentary');
    const commentaryMsg = document.getElementById('lm-commentary-msg');
    const logEl = document.getElementById('lm-log');
    const skipBtn = document.getElementById('lm-skip');

    // Stats elements
    const statEls = {
        shotsHome: document.getElementById('lm-shots-home'),
        shotsAway: document.getElementById('lm-shots-away'),
        sotHome: document.getElementById('lm-sot-home'),
        sotAway: document.getElementById('lm-sot-away'),
        foulsHome: document.getElementById('lm-fouls-home'),
        foulsAway: document.getElementById('lm-fouls-away'),
        yellowsHome: document.getElementById('lm-yellows-home'),
        yellowsAway: document.getElementById('lm-yellows-away'),
        redsHome: document.getElementById('lm-reds-home'),
        redsAway: document.getElementById('lm-reds-away'),
        possHome: document.getElementById('lm-poss-home'),
        possAway: document.getElementById('lm-poss-away'),
        xgHome: document.getElementById('lm-xg-home'),
        xgAway: document.getElementById('lm-xg-away')
    };

    let currentMinute = 0;
    let displayHome = 0;
    let displayAway = 0;
    let timer = null;
    let stopped = false;

    function highlightField(side) {
        if (!side) return;
        highlightEl.style.top = side === 'left' ? '0' : '50%';
        highlightEl.classList.add('active');
        setTimeout(() => highlightEl.classList.remove('active'), 2000);
    }

    function showBall(ev) {
        const isOwn = isOwnTeamEvent(ev);
        // Own team attacks top (opponent goal at top), opponent attacks bottom (our goal at bottom)
        let top, left;
        if (isOwn) {
            top = 5 + Math.random() * 18;   // 5-23% — near opponent goal (top)
            left = 20 + Math.random() * 60;
        } else {
            top = 75 + Math.random() * 18;  // 75-93% — near our goal (bottom)
            left = 20 + Math.random() * 60;
        }
        ballEl.style.top = top + '%';
        ballEl.style.left = left + '%';
        ballEl.classList.add('visible');
    }

    function hideBall() {
        ballEl.classList.remove('visible');
    }

    function updatePossession(minute) {
        // Interpolate from 50/50 toward final possession, with slight random jitter
        const progress = Math.min(minute / 90, 1);
        const jitter = (Math.random() - 0.5) * 6; // ±3%
        let currHome = Math.round(50 + (finalPossHome - 50) * progress + jitter);
        currHome = Math.max(15, Math.min(85, currHome));
        statEls.possHome.textContent = currHome + '%';
        statEls.possAway.textContent = (100 - currHome) + '%';
    }

    function showCommentary(text, accent) {
        commentaryEl.classList.remove('visible', 'accent-own', 'accent-opponent');
        void commentaryEl.offsetWidth;
        commentaryMsg.textContent = text;
        if (accent) commentaryEl.classList.add('accent-' + accent);
        commentaryEl.classList.add('visible');
    }

    function updateStats(ev) {
        // Map to display side: left = player team, right = opponent
        const isPlayerTeam = (isHome && ev.team === 'home') || (!isHome && ev.team === 'away');
        const side = isPlayerTeam ? 'Home' : 'Away';

        // Count shots
        if (['goal', 'shot', 'shot_saved', 'shot_missed', 'penalty', 'penalty_miss', 'chance'].includes(ev.type)) {
            liveStats['shots' + side]++;
            statEls['shots' + side].textContent = liveStats['shots' + side];
        }

        // Shots on target
        if (['goal', 'shot_saved', 'penalty'].includes(ev.type)) {
            liveStats['sot' + side]++;
            statEls['sot' + side].textContent = liveStats['sot' + side];
        }

        // xG — expected goals per shot type
        const xgValues = { goal: 0.35, shot_saved: 0.12, shot_missed: 0.06, penalty: 0.76, penalty_miss: 0.76, chance: 0.08 };
        if (xgValues[ev.type] !== undefined) {
            liveStats['xg' + side] += xgValues[ev.type];
            statEls['xg' + side].textContent = liveStats['xg' + side].toFixed(2);
        }

        // Fouls
        if (ev.type === 'foul' || ev.type === 'yellow_card' || ev.type === 'red_card') {
            liveStats['fouls' + side]++;
            statEls['fouls' + side].textContent = liveStats['fouls' + side];
        }

        // Yellow cards
        if (ev.type === 'yellow_card') {
            liveStats['yellows' + side]++;
            statEls['yellows' + side].textContent = liveStats['yellows' + side];
        }

        // Red cards
        if (ev.type === 'red_card') {
            liveStats['reds' + side]++;
            statEls['reds' + side].textContent = liveStats['reds' + side];
        }
    }

    function addLogEntry(ev) {
        const entry = document.createElement('div');
        let cls = 'live-match-log-entry';
        if (ev.type === 'goal' || ev.type === 'penalty') cls += ' is-goal';
        else if (ev.type === 'yellow_card') cls += ' is-card';
        else if (ev.type === 'red_card') cls += ' is-red-card';

        // Team color indicator
        cls += isOwnTeamEvent(ev) ? ' team-own' : ' team-opponent';
        entry.className = cls;

        const icon = eventIcons[ev.type] || '\uD83D\uDCCB';
        const isOwn = isOwnTeamEvent(ev);
        const teamLabel = isOwn ? playerTeam : opponentName;
        let text = ev.commentary || ev.description || ev.type;

        // Show team badge for fouls, cards, injuries
        const showTeamBadge = ['foul', 'yellow_card', 'red_card', 'injury'].includes(ev.type);
        const teamBadge = showTeamBadge ? `<span class="live-match-log-team ${isOwn ? 'own' : 'opp'}">${teamLabel}</span>` : '';

        entry.innerHTML = `
            <span class="live-match-log-minute">${ev.minute}'</span>
            <span class="live-match-log-icon">${icon}</span>
            <span class="live-match-log-text">${teamBadge}${text}</span>
        `;

        logEl.insertBefore(entry, logEl.firstChild);
    }

    function flashScore(el) {
        el.classList.add('goal-flash');
        setTimeout(() => el.classList.remove('goal-flash'), 600);
    }

    function showGoalOverlay(isOwn) {
        const goalOv = document.createElement('div');
        goalOv.className = 'live-match-goal-overlay';
        goalOv.innerHTML = `<span class="live-match-goal-text${isOwn ? '' : ' opponent'}">GOAL!</span>`;
        overlay.appendChild(goalOv);
        setTimeout(() => goalOv.remove(), 1500);
    }

    function showHalftime() {
        const ht = document.createElement('div');
        ht.className = 'live-match-halftime-overlay';
        ht.innerHTML = '<span class="live-match-halftime-text">RUST</span>';
        overlay.appendChild(ht);
        setTimeout(() => ht.remove(), 1500);
    }

    function showFulltime() {
        const ft = document.createElement('div');
        ft.className = 'live-match-halftime-overlay';
        ft.innerHTML = '<span class="live-match-halftime-text">EINDE</span>';
        overlay.appendChild(ft);
        setTimeout(() => {
            ft.remove();
            finish();
        }, 1800);
    }

    function finish() {
        if (stopped) return;
        stopped = true;
        if (timer) clearTimeout(timer);
        overlay.remove();
        onComplete();
    }

    // Get biased voorzitter reaction for shot outcomes
    function getVoorzitterReaction(ev) {
        const own = isOwnTeamEvent(ev);
        const name = ev.player || 'Speler';
        let templates;
        if (ev.type === 'goal' || ev.type === 'penalty') {
            templates = own ? reactionsOwnGoal : reactionsOppGoal;
        } else if (ev.type === 'shot_saved') {
            templates = own ? reactionsOwnSaved : reactionsOppSaved;
        } else if (ev.type === 'shot_missed' || ev.type === 'penalty_miss') {
            templates = own ? reactionsOwnMiss : reactionsOppMiss;
        }
        if (templates) {
            return templates[Math.floor(Math.random() * templates.length)].replace(/\{player\}/g, name);
        }
        return null;
    }

    // Process a single event: update score, stats, log, field
    function revealEvent(ev) {
        // Highlight field side
        highlightField(getFieldSide(ev));

        // Update live stats
        updateStats(ev);

        // Show voorzitter reaction for shot events, otherwise regular commentary
        const reaction = getVoorzitterReaction(ev);
        const accent = isShotEvent(ev) ? (isOwnTeamEvent(ev) ? 'own' : 'opponent') : null;
        if (reaction) {
            showCommentary(reaction, accent);
        } else if (ev.commentary) {
            showCommentary(ev.commentary);
        }

        // Add log entry
        addLogEntry(ev);

        // Handle goals
        if (ev.scoreAfter) {
            const playerHomeScore = isHome ? ev.scoreAfter.home : ev.scoreAfter.away;
            const playerAwayScore = isHome ? ev.scoreAfter.away : ev.scoreAfter.home;

            if (playerHomeScore !== displayHome) {
                displayHome = playerHomeScore;
                scoreHomeEl.textContent = displayHome;
                flashScore(scoreHomeEl);
            }
            if (playerAwayScore !== displayAway) {
                displayAway = playerAwayScore;
                scoreAwayEl.textContent = displayAway;
                flashScore(scoreAwayEl);
            }

            showGoalOverlay(isOwnTeamEvent(ev));
        }
    }

    // Process events at a given minute with suspense for shot events
    function processMinuteEvents(events, callback) {
        if (stopped) return;

        // Split events into shot events (get suspense) and instant events
        const shotEvents = events.filter(isShotEvent);
        const instantEvents = events.filter(ev => !isShotEvent(ev));

        // Show instant events immediately
        instantEvents.forEach(ev => revealEvent(ev));

        // Process shot events sequentially with suspense
        function processNextShot(index) {
            if (stopped || index >= shotEvents.length) {
                callback();
                return;
            }

            const ev = shotEvents[index];
            const playerName = ev.player || 'Een speler';
            const isOwn = isOwnTeamEvent(ev);

            // Highlight field + show ball for own chances
            highlightField(getFieldSide(ev));
            showBall(ev);

            // 1. Show buildup commentary
            const templates = isOwn ? buildupOwn : buildupOpp;
            const buildupText = templates[Math.floor(Math.random() * templates.length)].replace('{player}', playerName);
            showCommentary(buildupText, isOwn ? 'own' : 'opponent');

            // 2. Wait for suspense, then reveal outcome
            timer = setTimeout(() => {
                if (stopped) return;
                hideBall();
                revealEvent(ev);
                // Small pause after reveal before next shot
                timer = setTimeout(() => processNextShot(index + 1), getDelay(800));
            }, getDelay(5000));
        }

        if (shotEvents.length > 0) {
            processNextShot(0);
        } else {
            callback();
        }
    }

    let fastForward = false;

    // Skip button — jump to result
    skipBtn.addEventListener('click', () => {
        // Pause the simulation
        if (timer) { clearTimeout(timer); timer = null; }

        const confirm = document.createElement('div');
        confirm.className = 'live-match-confirm-overlay';
        confirm.innerHTML = `
            <div class="live-match-confirm-box">
                <div class="live-match-confirm-icon">⏭️</div>
                <p class="live-match-confirm-title">Wedstrijd overslaan?</p>
                <p class="live-match-confirm-text">Je mist de rest van het live commentaar. De uitslag en statistieken worden wel opgeslagen.</p>
                <div class="live-match-confirm-buttons">
                    <button class="live-match-confirm-cancel" id="lm-confirm-cancel">Terug naar wedstrijd</button>
                    <button class="live-match-confirm-yes" id="lm-confirm-yes">Sla over</button>
                </div>
            </div>
        `;
        overlay.appendChild(confirm);

        document.getElementById('lm-confirm-cancel').addEventListener('click', () => {
            confirm.remove();
            // Resume simulation
            timer = setTimeout(tick, 400);
        });
        document.getElementById('lm-confirm-yes').addEventListener('click', () => {
            confirm.remove();
            finish();
        });
    });

    // Start simulation
    commentaryEl.classList.add('visible');

    function getDelay(normalDelay) {
        if (fastForward) { fastForward = false; return 30; }
        return normalDelay;
    }

    function tick() {
        if (stopped) return;
        currentMinute++;

        minuteEl.textContent = currentMinute + "'";
        updatePossession(currentMinute);

        // Check for events at this minute
        const eventsThisMinute = eventsByMinute[currentMinute];
        let delay = 400; // Fast default for no-event minutes

        if (eventsThisMinute && eventsThisMinute.length > 0) {
            // Minute pulse
            minuteEl.classList.add('pulse');
            setTimeout(() => minuteEl.classList.remove('pulse'), 500);

            const hasShotEvents = eventsThisMinute.some(isShotEvent);

            if (hasShotEvents) {
                // Timer pauses — suspense handles its own timing
                processMinuteEvents(eventsThisMinute, () => {
                    if (stopped) return;
                    // Halftime check
                    if (currentMinute === 45) {
                        showHalftime();
                        timer = setTimeout(tick, getDelay(1800));
                    } else if (currentMinute >= 90) {
                        showFulltime();
                    } else {
                        timer = setTimeout(tick, getDelay(600));
                    }
                });
                return; // Don't schedule next tick — processMinuteEvents handles it
            }

            // Non-shot events: show instantly
            eventsThisMinute.forEach(ev => revealEvent(ev));
            delay = 650;
        } else {
            // Random field highlight on some empty minutes
            if (!fastForward && Math.random() < 0.3) {
                const side = Math.random() < 0.5 ? 'left' : 'right';
                highlightField(side);
            }
        }

        // Halftime
        if (currentMinute === 45) {
            showHalftime();
            delay = 1800;
        }

        // Full time
        if (currentMinute >= 90) {
            showFulltime();
            return;
        }

        // Minute pulse on event minutes
        if (eventsThisMinute) {
            minuteEl.classList.add('pulse');
            setTimeout(() => minuteEl.classList.remove('pulse'), 500);
        }

        timer = setTimeout(tick, getDelay(delay));
    }

    // Show voorbeschouwing (minute 0 preview events) before match starts
    const previewEvents = eventsByMinute[0] || [];
    delete eventsByMinute[0];

    if (previewEvents.length > 0) {
        let pIdx = 0;
        function showNextPreview() {
            if (stopped || pIdx >= previewEvents.length) {
                timer = setTimeout(tick, 600);
                return;
            }
            const ev = previewEvents[pIdx];
            showCommentary(ev.commentary);
            addLogEntry(ev);
            pIdx++;
            timer = setTimeout(showNextPreview, 1800);
        }
        timer = setTimeout(showNextPreview, 600);
    } else {
        timer = setTimeout(tick, 800);
    }
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
                        ${result.manOfTheMatch.rating ? `<span class="match-result-motm-rating">${Math.round(result.manOfTheMatch.rating)}</span>` : ''}
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

    // Show pending XP popups sequentially after modal is closed
    showPendingXPModals();
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
    if (!achievementModalOpen && !levelUpModalOpen) {
        showNextAchievement();
    }
}

function triggerAchievementCheck() {
    const newAchievements = checkAchievements(gameState);
    if (newAchievements.length > 0) queueAchievements(newAchievements);
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
    const totalXP = ((reward.playerXP || 0) + (reward.managerXP || 0) + (reward.xp || 0)) * 2;

    const overlay = document.createElement('div');
    overlay.className = 'achievement-modal-overlay';
    overlay._achievementReward = reward;
    overlay.innerHTML = `
        <div class="achievement-modal">
            <div class="achievement-modal-icon-wrap">
                <div class="achievement-modal-icon">${achievement.icon}</div>
                <div class="achievement-modal-checkmark">✓</div>
            </div>
            <div class="achievement-modal-label">Prestatie ontgrendeld!</div>
            <div class="achievement-modal-name">${achievement.name}</div>
            <div class="achievement-modal-desc">${achievement.description}</div>
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
    if (btn.disabled) return;
    btn.disabled = true;
    const overlay = btn.closest('.achievement-modal-overlay');
    const reward = overlay._achievementReward || {};
    const playerXP = (reward.playerXP || 0) * 2;
    const managerXP = ((reward.managerXP || 0) + (reward.xp || 0)) * 2;

    // Capture levels before XP grant for level-up detection
    const mgrBefore = getManagerLevel(gameState.manager?.xp || 0);
    const plrBefore = getPlayerLevel(gameState.myPlayer?.xp || 0, gameState.myPlayer?.stars || 1);

    // Apply XP to game state now
    if (managerXP > 0 && gameState.manager) {
        gameState.manager.xp = (gameState.manager.xp || 0) + managerXP;
    }
    if (playerXP > 0 && gameState.myPlayer) {
        gameState.myPlayer.xp = (gameState.myPlayer.xp || 0) + playerXP;
    }

    // Detect level-ups from achievement XP
    if (managerXP > 0) {
        const mgrAfter = getManagerLevel(gameState.manager?.xp || 0);
        if (mgrAfter.level > mgrBefore.level) {
            // Sum cash rewards for ALL skipped levels
            let totalCashReward = 0;
            for (let lvl = mgrBefore.level + 1; lvl <= mgrAfter.level; lvl++) {
                const lvlData = MANAGER_LEVELS.find(l => l.level === lvl);
                totalCashReward += lvlData?.cashReward || 0;
            }
            const mgrNextData = MANAGER_LEVELS.find(l => l.level === mgrAfter.level + 1);
            setTimeout(() => queueLevelUp('manager', {
                oldLevel: mgrBefore.level, newLevel: mgrAfter.level,
                oldTitle: mgrBefore.title, newTitle: mgrAfter.title,
                nextTitle: mgrNextData?.title || null,
                cashReward: totalCashReward,
                oldProgress: mgrBefore.progress,
                progress: mgrAfter.progress, xpToNext: mgrAfter.xpToNext
            }), 1200);
        }
    }
    if (playerXP > 0) {
        const plrAfter = getPlayerLevel(gameState.myPlayer?.xp || 0, gameState.myPlayer?.stars || 1);
        if (plrAfter.level > plrBefore.level) {
            // Skill points = delta between new and old level
            const spPerLevel = getSPPerLevel(gameState.myPlayer?.stars || 1);
            const totalSP = (plrAfter.level - plrBefore.level) * spPerLevel;
            const plrNextData = PLAYER_LEVELS.find(l => l.xpRequired > (gameState.myPlayer?.xp || 0));
            setTimeout(() => queueLevelUp('player', {
                oldLevel: plrBefore.level, newLevel: plrAfter.level,
                oldTitle: plrBefore.title, newTitle: plrAfter.title,
                nextTitle: plrNextData?.title || null,
                skillPoints: totalSP,
                oldProgress: plrBefore.progress,
                progress: plrAfter.progress, xpToNext: plrAfter.xpToNext
            }), 1200);
        }
    }

    // Animate XP flying to tiles
    const btnRect = btn.getBoundingClientRect();
    let animationsLeft = 0;

    if (playerXP > 0) {
        const target = document.getElementById('global-player-bar');
        if (target) {
            animationsLeft++;
            animateXPToTile(btnRect, target, `+${playerXP} XP`, () => {
                updateGlobalPlayerTile();
                animationsLeft--;
                if (animationsLeft === 0) finishClaim(overlay);
            });
        }
    }

    if (managerXP > 0) {
        const target = document.getElementById('global-top-bar');
        if (target) {
            animationsLeft++;
            animateXPToTile(btnRect, target, `+${managerXP} XP`, () => {
                updateGlobalManagerTile();
                animationsLeft--;
                if (animationsLeft === 0) finishClaim(overlay);
            });
        }
    }

    // If no XP to animate, just close
    if (animationsLeft === 0) {
        finishClaim(overlay);
    } else {
        // Hide modal content while XP flies
        overlay.querySelector('.achievement-modal').style.opacity = '0';
        overlay.querySelector('.achievement-modal').style.transition = 'opacity 0.2s ease';
    }

    saveGame();
}
window.claimAchievement = claimAchievement;

function animateXPToTile(fromRect, targetEl, label, onDone) {
    const targetRect = targetEl.getBoundingClientRect();

    const floater = document.createElement('div');
    floater.className = 'xp-claim-floater';
    floater.textContent = label;
    floater.style.left = `${fromRect.left + fromRect.width / 2}px`;
    floater.style.top = `${fromRect.top}px`;
    document.body.appendChild(floater);

    // Force reflow
    floater.offsetHeight;

    // Animate to target tile center
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    floater.style.left = `${targetX}px`;
    floater.style.top = `${targetY}px`;
    floater.style.opacity = '0';
    floater.style.transform = 'translate(-50%, -50%) scale(0.5)';

    floater.addEventListener('transitionend', () => {
        floater.remove();
        // Flash the target tile
        targetEl.classList.add('xp-tile-flash');
        setTimeout(() => targetEl.classList.remove('xp-tile-flash'), 600);
        onDone();
    }, { once: true });
}

function updateGlobalManagerTile() {
    const managerInfo = getManagerLevel(gameState.manager?.xp || 0);
    const currentXp = managerInfo.xp;
    const xpForNextLevel = currentXp + managerInfo.xpToNext;
    const progressPercent = Math.round(managerInfo.progress * 100);

    const el = (id) => document.getElementById(id);
    if (el('global-manager-title')) el('global-manager-title').textContent = managerInfo.title;
    if (el('global-manager-level')) el('global-manager-level').textContent = managerInfo.level;
    if (el('global-xp-fill')) el('global-xp-fill').style.width = `${progressPercent}%`;
    if (el('global-xp-label')) el('global-xp-label').textContent = managerInfo.xpToNext > 0 ? `${currentXp} / ${xpForNextLevel} XP` : `${currentXp} XP — Max!`;
    const mReward = el('global-manager-reward');
    if (mReward) {
        const nextML = MANAGER_LEVELS.find(l => l.xpRequired > (gameState.manager?.xp || 0));
        mReward.textContent = nextML?.cashReward ? `+${formatCurrency(nextML.cashReward)}` : '';
        mReward.style.display = nextML?.cashReward ? '' : 'none';
    }
}

function updateGlobalPlayerTile() {
    const mp = gameState.myPlayer;
    if (!mp) return;
    const pLevel = getPlayerLevel(mp.xp || 0, mp.stars || 1);
    const pXp = mp.xp || 0;
    const pNextXp = pXp + (pLevel.xpToNext || 0);
    const pProgress = Math.round(pLevel.progress * 100);

    const el = (id) => document.getElementById(id);
    if (el('global-player-level')) el('global-player-level').textContent = pLevel.level;
    if (el('global-player-xp-fill')) el('global-player-xp-fill').style.width = `${pProgress}%`;
    if (el('global-player-xp-label')) el('global-player-xp-label').textContent = pLevel.xpToNext > 0 ? `${pXp} / ${pNextXp} XP` : `${pXp} XP — Max!`;
    const pReward = el('global-player-reward');
    if (pReward) {
        const nextPL = PLAYER_LEVELS.find(l => l.xpRequired > (mp.xp || 0));
        pReward.textContent = nextPL ? '+5 SP' : '';
        pReward.style.display = nextPL ? '' : 'none';
    }
}

function finishClaim(overlay) {
    setTimeout(() => {
        overlay.remove();
        showNextAchievement();
    }, 200);
}

// ================================================
// LEVEL UP MODAL
// ================================================

const levelUpQueue = [];
let levelUpModalOpen = false;

function queueLevelUp(type, data) {
    levelUpQueue.push({ type, data });
    if (!levelUpModalOpen && !achievementModalOpen) {
        showNextLevelUp();
    }
}

function showNextLevelUp() {
    if (levelUpQueue.length === 0) {
        levelUpModalOpen = false;
        return;
    }
    levelUpModalOpen = true;
    const { type, data } = levelUpQueue.shift();
    showLevelUpModal(type, data);
}

function showLevelUpModal(type, data) {
    const isManager = type === 'manager';
    const icon = isManager ? '📋' : '⚽';
    const label = isManager ? 'Manager' : 'Speler';
    const color = isManager ? '#1565c0' : '#2e7d32';
    const colorLight = isManager ? '#42a5f5' : '#66bb6a';
    const rewardText = isManager
        ? `+${formatCurrency(data.cashReward)}`
        : `+${data.skillPoints || 0} Skillpunten`;
    const rewardIcon = isManager ? '💰' : '⚡';
    const progressPct = Math.round((data.progress || 0) * 100);
    const oldProgressPct = Math.round((data.oldProgress || 0) * 100);

    // Get current XP and next level XP for display
    const currentXP = isManager ? (gameState.manager?.xp || 0) : (gameState.myPlayer?.xp || 0);
    const currentLevelInfo = isManager ? getManagerLevel(currentXP) : getPlayerLevel(currentXP, gameState.myPlayer?.stars || 1);
    const xpForNext = currentLevelInfo.xpToNext > 0
        ? `${currentXP} / ${currentXP + currentLevelInfo.xpToNext} XP`
        : `${currentXP} XP — Max!`;

    // RGB values for CSS custom properties
    const borderRgb = isManager ? '66, 165, 245' : '102, 187, 106';

    const overlay = document.createElement('div');
    overlay.className = 'levelup-modal-overlay';
    overlay.innerHTML = `
        <div class="levelup-modal" style="--lu-border-rgb: ${borderRgb}; --lu-accent: ${colorLight}">
            <div class="levelup-burst" style="--lu-color: ${colorLight}"></div>
            <div class="levelup-flash" id="lu-flash" style="--lu-color: ${colorLight}"></div>
            <div class="levelup-icon-wrap">
                <span class="levelup-icon">${icon}</span>
            </div>
            <div class="levelup-label">Level Up!</div>
            <div class="levelup-type">${label}</div>
            <div class="levelup-level-row">
                <span class="levelup-old-level" id="lu-level-badge">Niv. ${data.oldLevel}</span>
            </div>
            <div class="levelup-title-row">
                <span class="levelup-new-title" id="lu-title-text">${data.oldTitle}</span>
            </div>
            <div class="levelup-xp-bar-wrap">
                <div class="levelup-xp-bar">
                    <div class="levelup-xp-fill" id="lu-xp-fill" style="width: ${oldProgressPct}%; background: linear-gradient(90deg, ${color}, ${colorLight})"></div>
                </div>
                <div class="levelup-xp-labels" id="lu-xp-labels">
                    <span>Niv. ${data.oldLevel} — ${data.oldTitle}</span>
                    <span>Niv. ${data.newLevel} — ${data.newTitle}</span>
                </div>
                <div class="levelup-xp-amount" id="lu-xp-amount"></div>
            </div>
            <button class="levelup-claim-btn" id="lu-claim-btn" style="background: linear-gradient(135deg, ${color}, ${colorLight});">
                ${rewardIcon} ${rewardText} claimen
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    // === ANIMATED SEQUENCE ===
    const fill = overlay.querySelector('#lu-xp-fill');
    const badge = overlay.querySelector('#lu-level-badge');
    const titleText = overlay.querySelector('#lu-title-text');
    const labels = overlay.querySelector('#lu-xp-labels');
    const xpAmount = overlay.querySelector('#lu-xp-amount');
    const flash = overlay.querySelector('#lu-flash');
    const claimBtn = overlay.querySelector('#lu-claim-btn');

    // Phase 1 (after 600ms): fill bar from oldProgress → 100%
    setTimeout(() => {
        fill.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        fill.style.width = '100%';
    }, 600);

    // Phase 2 (at 1500ms): flash + update level
    setTimeout(() => {
        // Flash effect
        flash.classList.add('active');

        // Update badge and title
        badge.textContent = `Niv. ${data.newLevel}`;
        badge.classList.add('levelup-badge-pop');
        badge.style.background = color;
        badge.style.color = '#fff';
        badge.style.padding = '4px 14px';
        badge.style.borderRadius = '8px';
        titleText.textContent = data.newTitle;
        titleText.classList.add('levelup-title-pop');
    }, 1500);

    // Phase 3 (at 1900ms): reset bar to 0%, then fill to new progress
    setTimeout(() => {
        fill.style.transition = 'none';
        fill.style.width = '0%';

        // Update labels for new level range
        labels.innerHTML = `
            <span>Niv. ${data.newLevel} — ${data.newTitle}</span>
            <span>${data.nextTitle ? 'Niv. ' + (data.newLevel + 1) + ' — ' + data.nextTitle : ''}</span>
        `;
        xpAmount.textContent = xpForNext;
    }, 2000);

    setTimeout(() => {
        fill.style.transition = 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        fill.style.width = `${progressPct}%`;
    }, 2100);

    // Phase 4 (at 2900ms): show claim button
    setTimeout(() => {
        claimBtn.classList.add('visible');
        claimBtn.style.pointerEvents = 'auto';
    }, 2900);

    overlay.querySelector('.levelup-claim-btn').addEventListener('click', () => {
        if (claimBtn.disabled) return;
        claimBtn.disabled = true;
        // Apply reward on claim
        if (isManager && data.cashReward && gameState.club) {
            gameState.club.budget += data.cashReward;

            // Animate money flying to budget display
            const btnRect = claimBtn.getBoundingClientRect();
            const target = document.getElementById('global-budget-amount');
            if (target) {
                const targetRect = target.getBoundingClientRect();
                const floater = document.createElement('div');
                floater.className = 'money-floater';
                floater.textContent = `+${formatCurrency(data.cashReward)}`;
                floater.style.left = `${btnRect.left + btnRect.width / 2}px`;
                floater.style.top = `${btnRect.top + btnRect.height / 2}px`;
                document.body.appendChild(floater);

                requestAnimationFrame(() => {
                    floater.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    floater.style.top = `${targetRect.top + targetRect.height / 2}px`;
                    floater.style.opacity = '0';
                    floater.style.transform = 'translate(-50%, -50%) scale(0.4)';
                });

                // Flash the target when floater arrives
                setTimeout(() => {
                    floater.remove();
                    target.classList.add('budget-flash');
                    setTimeout(() => target.classList.remove('budget-flash'), 600);
                }, 700);
            }
        }
        // Update UI tiles after claiming
        updateGlobalManagerTile();
        updateGlobalPlayerTile();
        updateBudgetDisplays();
        renderProfileTraining();
        saveGame(gameState);

        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
            levelUpModalOpen = false;
            // Show next level-up or queued achievements
            if (levelUpQueue.length > 0) {
                showNextLevelUp();
            } else if (achievementQueue.length > 0) {
                showNextAchievement();
            }
        }, 300);
    });
}
window.queueLevelUp = queueLevelUp;

// ================================================
// MANAGER XP POPUP
// ================================================

function showTileTooltip(el, type) {
    // Remove existing tooltip
    document.querySelectorAll('.tile-tooltip').forEach(t => t.remove());

    const tooltips = {
        alg: `<strong>Algemene Rating (ALG)</strong><br>Het gemiddelde van al je zes kenmerken. Hoe hoger je ALG, hoe beter je overall als speler presteert.`,
        alg_other: `<strong>Algemene Rating (ALG)</strong><br>De overall kwaliteit van deze speler. Hoe hoger de ALG, hoe beter de speler presteert.`,
        pot: `<strong>Potentie</strong><br>
            <span class="tt-star">☆</span> Geen groeipotentie<br>
            <span class="tt-star">★</span> Lichte verbetering is mogelijk<br>
            <span class="tt-star">★★</span> Kan op termijn een stapje hogerop<br>
            <span class="tt-star">★★★</span> Pareltje<br>
            <span class="tt-star">★★★★</span> Toptalent<br>
            <span class="tt-star">★★★★★</span> Wereldster in wording<br><br>
            <em style="color:var(--text-muted);font-size:0.65rem">Bij promotie: +0.5★ voor spelers die minstens de helft van de wedstrijden speelden</em>`,
        pot_my: `<strong>Jouw Potentie</strong><br>
            Meer sterren = meer Skill Points per level-up.<br><br>
            <span class="tt-star">★</span> ${getSPPerLevel(1)} SP per level<br>
            <span class="tt-star">★★</span> ${getSPPerLevel(2)} SP per level<br>
            <span class="tt-star">★★★</span> ${getSPPerLevel(3)} SP per level<br>
            <span class="tt-star">★★★★</span> ${getSPPerLevel(4)} SP per level<br>
            <span class="tt-star">★★★★★</span> ${getSPPerLevel(5)} SP per level<br><br>
            <em style="color:var(--accent-green-dim);font-size:0.7rem">Jij krijgt ${getSPPerLevel(gameState.myPlayer?.stars || 1)} SP per level</em><br>
            <em style="color:var(--text-muted);font-size:0.65rem">Bij promotie: +0.5★</em>`
    };

    const tooltip = document.createElement('div');
    tooltip.className = 'tile-tooltip';
    tooltip.innerHTML = tooltips[type];
    document.body.appendChild(tooltip);

    // Position fixed relative to viewport — above if not enough space below
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    const tipHeight = tooltip.offsetHeight;
    tooltip.style.visibility = '';
    tooltip.style.display = '';
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < tipHeight + 16) {
        tooltip.style.top = (rect.top - tipHeight - 8) + 'px';
    } else {
        tooltip.style.top = rect.bottom + 8 + 'px';
    }

    setTimeout(() => tooltip.classList.add('visible'), 10);

    const dismiss = (e) => {
        if (!tooltip.contains(e.target) && e.target !== el) {
            tooltip.remove();
            document.removeEventListener('click', dismiss);
        }
    };
    setTimeout(() => document.addEventListener('click', dismiss), 50);
}
window.showTileTooltip = showTileTooltip;

// Global delegation for ALG and POT tooltips on player cards
document.addEventListener('click', (e) => {
    const algEl = e.target.closest('.pc-overall, .tpc-overall, .tt-ovr');
    if (algEl) {
        e.stopPropagation();
        const isTrainingTile = algEl.closest('.training-tile-alg');
        showTileTooltip(algEl, isTrainingTile ? 'alg' : 'alg_other');
        return;
    }
    const potEl = e.target.closest('.pc-potential-stars, .tpc-stars-row, .tt-stars');
    if (potEl) { e.stopPropagation(); showTileTooltip(potEl, 'pot'); return; }
});

function showPendingXPModals() {
    const queue = [];
    if (gameState._pendingManagerXP) {
        queue.push({ type: 'manager', reasons: gameState._pendingManagerXP });
        gameState._pendingManagerXP = null;
    }
    if (gameState._pendingPlayerXP) {
        queue.push({ type: 'player', reasons: gameState._pendingPlayerXP });
        gameState._pendingPlayerXP = null;
    }

    function showNext() {
        if (queue.length === 0) {
            // All XP modals done — now show level-ups
            if (gameState._pendingLevelUps && gameState._pendingLevelUps.length > 0) {
                const pending = gameState._pendingLevelUps.slice();
                gameState._pendingLevelUps = null;
                setTimeout(() => {
                    pending.forEach(lu => queueLevelUp(lu.type, lu.data));
                }, 300);
            }
            return;
        }
        const item = queue.shift();
        showXPModal(item.type, item.reasons, showNext);
    }

    showNext();
}

function showManagerXPPopup(reasons) {
    showXPModal('manager', reasons);
}

// ================================================
// PLAYER XP POPUP
// ================================================

function showPlayerXPPopup(reasons, onClaim) {
    showXPModal('player', reasons, undefined, onClaim);
}

function showXPModal(type, reasons, onDone, onClaim) {
    const totalXP = reasons.reduce((sum, r) => sum + r.amount, 0);
    const isPlayer = type === 'player';
    const icon = isPlayer ? '⚽' : '📋';
    const title = isPlayer ? 'Speler XP' : 'Manager XP';
    const targetId = isPlayer ? 'global-player-bar' : 'global-top-bar';

    const linesHTML = reasons.map(r =>
        `<div class="xp-modal-line"><span class="xp-modal-reason">${r.reason}</span><span class="xp-modal-amount">+${r.amount} XP</span></div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'achievement-modal-overlay';
    overlay.innerHTML = `
        <div class="achievement-modal xp-reward-modal">
            <div class="achievement-modal-icon-wrap">
                <div class="achievement-modal-icon">${icon}</div>
            </div>
            <div class="achievement-modal-label">${title}</div>
            <div class="xp-modal-lines">${linesHTML}</div>
            <button class="achievement-modal-claim-btn xp-modal-claim" data-target="${targetId}" data-total="${totalXP}" data-type="${type}">
                Claim ${totalXP} XP
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    overlay.querySelector('.xp-modal-claim').addEventListener('click', function() {
        const btn = this;
        if (btn.disabled) return;
        btn.disabled = true;
        const target = document.getElementById(btn.dataset.target);
        if (!target) { overlay.remove(); return; }

        // Capture levels before XP grant for level-up detection
        const plrBefore = getPlayerLevel(gameState.myPlayer?.xp || 0, gameState.myPlayer?.stars || 1);
        const mgrBefore = getManagerLevel(gameState.manager?.xp || 0);

        // Award XP on claim
        if (onClaim) onClaim();

        // Detect level-ups from XP modal
        if (isPlayer) {
            const plrAfter = getPlayerLevel(gameState.myPlayer?.xp || 0, gameState.myPlayer?.stars || 1);
            if (plrAfter.level > plrBefore.level) {
                const spPerLevel = getSPPerLevel(gameState.myPlayer?.stars || 1);
                const totalSP = (plrAfter.level - plrBefore.level) * spPerLevel;
                const plrNextData = PLAYER_LEVELS.find(l => l.xpRequired > (gameState.myPlayer?.xp || 0));
                setTimeout(() => queueLevelUp('player', {
                    oldLevel: plrBefore.level, newLevel: plrAfter.level,
                    oldTitle: plrBefore.title, newTitle: plrAfter.title,
                    nextTitle: plrNextData?.title || null,
                    skillPoints: totalSP,
                    oldProgress: plrBefore.progress,
                    progress: plrAfter.progress, xpToNext: plrAfter.xpToNext
                }), 800);
            }
        } else {
            const mgrAfter = getManagerLevel(gameState.manager?.xp || 0);
            if (mgrAfter.level > mgrBefore.level) {
                let totalCashReward = 0;
                for (let lvl = mgrBefore.level + 1; lvl <= mgrAfter.level; lvl++) {
                    const lvlData = MANAGER_LEVELS.find(l => l.level === lvl);
                    totalCashReward += lvlData?.cashReward || 0;
                }
                const mgrNextData = MANAGER_LEVELS.find(l => l.level === mgrAfter.level + 1);
                setTimeout(() => queueLevelUp('manager', {
                    oldLevel: mgrBefore.level, newLevel: mgrAfter.level,
                    oldTitle: mgrBefore.title, newTitle: mgrAfter.title,
                    nextTitle: mgrNextData?.title || null,
                    cashReward: totalCashReward,
                    oldProgress: mgrBefore.progress,
                    progress: mgrAfter.progress, xpToNext: mgrAfter.xpToNext
                }), 800);
            }
        }

        const btnRect = btn.getBoundingClientRect();

        // Hide modal content
        overlay.querySelector('.achievement-modal').style.opacity = '0';
        overlay.querySelector('.achievement-modal').style.transition = 'opacity 0.2s ease';

        animateXPToTile(btnRect, target, `+${btn.dataset.total} XP`, () => {
            if (btn.dataset.type === 'player') {
                updateGlobalPlayerTile();
            } else {
                updateGlobalManagerTile();
            }
            overlay.remove();
            if (onDone) setTimeout(onDone, 200);
        });
    });
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

async function handleEventChoice(choiceIndex) {
    const event = gameState.activeEvent;
    if (!event) return;

    // Snapshot player IDs before event
    const playerIdsBefore = new Set(gameState.players.map(p => p.id));

    // Apply choice effect
    applyEventChoice(gameState, event, choiceIndex);

    // In multiplayer, sync any new players added by the event to Supabase
    if (isMultiplayer() && gameState.multiplayer?.clubId && gameState.multiplayer?.leagueId) {
        for (const player of gameState.players) {
            if (!playerIdsBefore.has(player.id)) {
                const dbPlayer = await insertPlayerToSupabase(player, gameState.multiplayer.clubId, gameState.multiplayer.leagueId);
                if (dbPlayer) player.id = dbPlayer.id;
            }
        }
    }

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

// ================================================
// BUG REPORTS
// ================================================

function initBugReports() {
    const submitBtn = document.getElementById('bug-submit-btn');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', async () => {
        const titleEl = document.getElementById('bug-title');
        const descEl = document.getElementById('bug-description');
        const statusEl = document.getElementById('bug-status');
        const title = titleEl?.value?.trim();
        const description = descEl?.value?.trim();

        if (!title) {
            statusEl.textContent = 'Vul een omschrijving in.';
            statusEl.style.color = '#d32f2f';
            return;
        }

        if (!isSupabaseAvailable()) {
            statusEl.textContent = 'Kan niet versturen (geen verbinding).';
            statusEl.style.color = '#d32f2f';
            return;
        }

        submitBtn.disabled = true;
        statusEl.textContent = 'Versturen...';
        statusEl.style.color = 'var(--text-muted)';

        const { error } = await supabase.from('bug_reports').insert({
            user_id: gameState.multiplayer?.userId || null,
            title,
            description: description || null,
            user_agent: navigator.userAgent
        });

        if (error) {
            statusEl.textContent = 'Fout bij versturen. Probeer opnieuw.';
            statusEl.style.color = '#d32f2f';
            console.error('Bug report failed:', error);
        } else {
            statusEl.textContent = '';
            titleEl.value = '';
            descEl.value = '';
            awardPlayerXP(10);
            await showAlert('Thanks voor je bug report, hier is wat XP voor je.');
            if (!gameState.stats.submittedBugReport) {
                gameState.stats.submittedBugReport = true;
                triggerAchievementCheck();
            }
            renderBugHistory();
            renderBugLeaderboard();
            saveGame();
        }
        submitBtn.disabled = false;
    });
}

async function renderBugHistory() {
    const list = document.getElementById('bug-list');
    if (!list || !isSupabaseAvailable()) {
        if (list) list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Geen meldingen.</p>';
        return;
    }

    const { data, error } = await supabase
        .from('bug_reports')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error || !data || data.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Nog geen meldingen.</p>';
        return;
    }

    list.innerHTML = data.map(b => {
        const date = new Date(b.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return `<div class="bug-history-item">
            <div class="bug-history-item-title">${escapeHtml(b.title)}</div>
            ${b.description ? `<div class="bug-history-item-desc">${escapeHtml(b.description)}</div>` : ''}
            <div class="bug-history-item-date">${date}</div>
        </div>`;
    }).join('');
}

async function renderBugLeaderboard() {
    const container = document.getElementById('bug-leaderboard');
    if (!container || !isSupabaseAvailable()) {
        if (container) container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;">Niet beschikbaar.</p>';
        return;
    }

    // Fetch all bug reports with user_id
    const { data: reports, error } = await supabase
        .from('bug_reports')
        .select('user_id');

    if (error || !reports || reports.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;">Nog geen bugs gemeld.</p>';
        return;
    }

    // Count per user
    const counts = {};
    reports.forEach(r => {
        if (r.user_id) counts[r.user_id] = (counts[r.user_id] || 0) + 1;
    });

    const userIds = Object.keys(counts);
    if (userIds.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;">Nog geen bugs gemeld.</p>';
        return;
    }

    // Fetch club names + player names for these users
    const { data: clubs } = await supabase
        .from('clubs')
        .select('owner_id, name')
        .in('owner_id', userIds)
        .eq('is_ai', false);

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

    const clubMap = {};
    (clubs || []).forEach(c => {
        if (!clubMap[c.owner_id]) clubMap[c.owner_id] = c.name;
    });
    const playerMap = {};
    (profiles || []).forEach(p => {
        if (p.display_name) playerMap[p.id] = p.display_name;
    });

    // Sort by count descending
    const sorted = userIds
        .map(uid => ({ uid, count: counts[uid], club: clubMap[uid] || 'Onbekend', player: playerMap[uid] || '' }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const myUserId = gameState.multiplayer?.userId;
    const medals = ['🥇', '🥈', '🥉'];

    container.innerHTML = sorted.map((entry, i) => {
        const isMe = entry.uid === myUserId;
        const rank = i < 3 ? medals[i] : `${i + 1}.`;
        return `<div class="bh-row${isMe ? ' bh-me' : ''}">
            <span class="bh-rank">${rank}</span>
            <span class="bh-name">${escapeHtml(entry.club)}${entry.player ? ` <em class="bh-player">${escapeHtml(entry.player)}</em>` : ''}</span>
            <span class="bh-count">${entry.count} 🐛</span>
        </div>`;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ================================================
// SPONSORS SYSTEM
// ================================================

const SPONSORS = {
    stable: {
        name: 'Bakkerij De Ouderwetse',
        tagline: 'Al 40 jaar hetzelfde recept',
        description: 'Betrouwbaar als roggebrood. Geen verrassingen, gewoon elke week je geld.',
        matchIncome: 50,
        winBonus: 0,
        icon: '🥖',
        duration: 8
    },
    balanced: {
        name: 'Vishandel Smit',
        tagline: 'Dagverse vis, elke dag',
        description: 'De lekkerste kibbeling van de regio. Bij winst trakteert Smit de hele kleedkamer.',
        matchIncome: 30,
        winBonus: 25,
        icon: '🐟',
        duration: 10
    },
    intimico: {
        name: 'intimico.nl',
        tagline: 'Ontdek Je Sensualiteit',
        description: 'Chique lingerielabel. Betaalt bescheiden, maar bij winst gaat de champagne open.',
        matchIncome: 15,
        winBonus: 75,
        icon: '💗',
        shirtName: 'Intimico 💗',
        duration: 8
    }
};

const STADIUM_SPONSORS = {
    local: {
        name: 'Lokale Supermarkt Plus',
        tagline: 'Vers van bij ons',
        weeklyIncome: 20,
        icon: '🏪'
    },
    dealer: {
        name: 'Autobedrijf Van Dijk',
        tagline: 'Rijden is leven',
        weeklyIncome: 40,
        icon: '🚗'
    },
    brewery: {
        name: 'Brouwerij De Gouden Tap',
        tagline: 'Proost op de overwinning',
        weeklyIncome: 60,
        icon: '🍺'
    }
};

const SPONSOR_POOL = [
    // Bordsponsors (€10-80/thuiswedstrijd, 4-14 weken contract)
    { id: 'bord_supermarkt', slot: 'bord', name: 'Supermarkt Van Dalen', tagline: 'Elke dag vers, elke week trouw', icon: '🛒', weeklyIncome: 30, minReputation: 5, duration: 6 },
    { id: 'bord_garage', slot: 'bord', name: 'Garage De Versnelling', tagline: 'Van roestbak tot racemonster', icon: '🔧', weeklyIncome: 30, minReputation: 10, duration: 8 },
    { id: 'bord_brouwerij', slot: 'bord', name: 'Brouwerij De Gouden Tap', tagline: 'Na de wedstrijd altijd raak', icon: '🍻', weeklyIncome: 40, minReputation: 20, duration: 10 },
    { id: 'bord_bouwmarkt', slot: 'bord', name: 'Bouwmarkt Henk & Zonen', tagline: 'Wij bouwen, jullie scoren', icon: '🏗️', weeklyIncome: 40, minReputation: 15, duration: 8 },
    { id: 'bord_autohandel', slot: 'bord', name: 'Autohandel Kansen', tagline: 'Altijd een goede deal', icon: '🚗', weeklyIncome: 50, minReputation: 30, duration: 12 },
    { id: 'bord_verzekering', slot: 'bord', name: 'Verzekeringen Direct', tagline: 'Gedekt op elk niveau', icon: '🛡️', weeklyIncome: 60, minReputation: 40, duration: 14 },
    { id: 'bord_makelaardij', slot: 'bord', name: 'Makelaardij Van Houten', tagline: 'De beste plek op het veld en daarbuiten', icon: '🏠', weeklyIncome: 80, minReputation: 55, duration: 14 },
    { id: 'bord_fysiotherapie', slot: 'bord', name: 'Fysio Topfit', tagline: 'Snel terug op het veld', icon: '💪', weeklyIncome: 20, minReputation: 5, duration: 4 },
    { id: 'bord_accountant', slot: 'bord', name: 'Boekhouder Balans BV', tagline: 'De cijfers kloppen altijd', icon: '📊', weeklyIncome: 50, minReputation: 25, duration: 10 },
    { id: 'bord_tuincentrum', slot: 'bord', name: 'Tuincentrum Groen & Groei', tagline: 'Het gras is hier altijd groener', icon: '🌿', weeklyIncome: 30, minReputation: 8, duration: 6 },
    { id: 'bord_intimico_admin', slot: 'bord', name: 'Intimico Admin', tagline: 'Sexy data in een oogopslag', icon: '💚', weeklyIncome: 50, minReputation: 0, duration: 6 },
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

    // Vishandel Smit achievement
    if (sponsorId === 'balanced') {
        gameState.stats = gameState.stats || {};
        gameState.stats.choseVishandelSmit = true;
    }

    // Update UI
    showNotification(`${sponsor.name} is nu je shirtsponsor voor ${sponsor.duration} weken!`, 'success');
    renderShirtSponsorSection();
    saveGame();
    updateNavBadges();

    // Check achievements (sponsor-related)
    const newAchievements = checkAchievements(gameState);
    if (newAchievements.length > 0) {
        setTimeout(() => queueAchievements(newAchievements), 500);
    }
    renderDashboardChecklist();
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

    saveGame();
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

    renderShirtSponsorSection();
    renderBordSponsorSection();
}

function renderShirtSponsorSection() {
    // Update kit display
    updateSponsorKitDisplay();

    // Info panel
    const infoEl = document.getElementById('sponsor-info-shirt');
    if (infoEl) {
        const sp = gameState.sponsor;
        if (sp && sp.weeksRemaining > 0) {
            infoEl.innerHTML = `<div class="si-contract">${sp.weeksRemaining}w resterend</div>`;
        } else {
            infoEl.innerHTML = `<div class="si-detail">Geen sponsor</div>`;
        }
    }

    // Options grid
    const container = document.getElementById('shirt-sponsor-grid');
    if (!container) return;

    const hasContract = gameState.sponsor && gameState.sponsor.weeksRemaining > 0;

    container.innerHTML = Object.entries(SPONSORS).map(([id, s]) => {
        const isActive = gameState.sponsor?.id === id;
        const isLocked = hasContract && !isActive;
        const weeksLeft = isActive && gameState.sponsor.weeksRemaining ? `${gameState.sponsor.weeksRemaining}w` : '';

        return `
        <div class="sponsor-option ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-sponsor="${id}" onclick="selectSponsor('${id}')">
            <div class="so-icon">${s.icon}</div>
            <div class="so-body">
                <div class="so-name">${s.name}</div>
                <div class="so-tagline">${s.tagline}</div>
            </div>
            <div class="so-footer">
                <div class="so-pay-row">
                    <span class="so-pay">${formatCurrency(s.matchIncome)}/wed</span>
                    ${s.winBonus > 0 ? `<span class="so-bonus">+${formatCurrency(s.winBonus)} win</span>` : ''}
                </div>
                <div class="so-duration">${s.duration} weken</div>
            </div>
        </div>`;
    }).join('');
}

function generateSponsorMarket() {
    const rep = gameState.reputation || 10;
    const activeIds = Object.values(gameState.sponsorSlots || {}).filter(s => s).map(s => s.id);
    const available = SPONSOR_POOL.filter(s => s.minReputation <= rep && !activeIds.includes(s.id));

    // Always include Intimico Admin if not already active
    const intimico = available.find(s => s.id === 'bord_intimico_admin');
    const rest = available.filter(s => s.id !== 'bord_intimico_admin').sort(() => Math.random() - 0.5);
    const offers = intimico ? [intimico, ...rest.slice(0, 2)] : rest.slice(0, 3);

    gameState.sponsorMarket = {
        offers,
        generatedForWeek: gameState.week
    };
}

function renderBordSponsorSection() {
    // Info panel
    const infoEl = document.getElementById('sponsor-info-bord');
    if (infoEl) {
        const bord = gameState.sponsorSlots?.bord;
        if (bord) {
            infoEl.innerHTML = `<div class="si-contract">${bord.weeksRemaining}w resterend</div>`;
        } else {
            infoEl.innerHTML = `<div class="si-detail">Geen sponsor</div>`;
        }
    }

    // Update reclamebord visual
    const bordIcon = document.getElementById('bord-sponsor-icon');
    const bordName = document.getElementById('bord-sponsor-name');
    const bordData = gameState.sponsorSlots?.bord;
    if (bordIcon && bordName) {
        if (bordData) {
            bordIcon.textContent = bordData.icon || '';
            bordName.textContent = bordData.name;
        } else {
            bordIcon.textContent = '';
            bordName.textContent = 'Geen sponsor';
        }
    }

    // Market grid
    const container = document.getElementById('sponsor-market-grid');
    if (!container) return;

    // Safety check: regenerate if stale or too few offers
    if (gameState.sponsorMarket.generatedForWeek !== gameState.week || gameState.sponsorMarket.offers.length < 3) {
        generateSponsorMarket();
    }

    // Cap at 3 offers
    if (gameState.sponsorMarket.offers.length > 3) {
        gameState.sponsorMarket.offers = gameState.sponsorMarket.offers.slice(0, 3);
    }
    const offers = gameState.sponsorMarket.offers;

    // Build tiles: active sponsor first (replaces one offer slot), then remaining offers
    const activeBord = gameState.sponsorSlots?.bord;
    let tilesHTML = '';
    let remainingSlots = 3;

    if (activeBord) {
        tilesHTML += `<div class="sponsor-option sponsor-option-market active">
            <div class="so-icon">${activeBord.icon}</div>
            <div class="so-body">
                <div class="so-name">${activeBord.name}</div>
                <div class="so-tagline">Actieve sponsor</div>
            </div>
            <div class="so-footer">
                <div class="so-pay">${formatCurrency(activeBord.weeklyIncome)}/thuiswedstrijd</div>
                <div class="so-duration">${activeBord.weeksRemaining}w resterend</div>
            </div>
        </div>`;
        remainingSlots = 2;
    }

    if (offers.length === 0 && !activeBord) {
        container.innerHTML = '<p class="sponsor-empty-msg">Geen aanbiedingen beschikbaar. Verhoog je reputatie!</p>';
        return;
    }

    tilesHTML += offers.slice(0, remainingSlots).map(offer => {
        return `<div class="sponsor-option sponsor-option-market" onclick="selectMarketSponsor('${offer.id}')">
            <div class="so-icon">${offer.icon}</div>
            <div class="so-body">
                <div class="so-name">${offer.name}</div>
                ${offer.tagline ? `<div class="so-tagline">${offer.tagline}</div>` : ''}
            </div>
            <div class="so-footer">
                <div class="so-pay">${formatCurrency(offer.weeklyIncome)}/thuiswedstrijd</div>
                <div class="so-duration">${offer.duration} weken</div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = tilesHTML;
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
    renderBordSponsorSection();
    saveGame();
    triggerAchievementCheck();
}

function clearSponsorSlot(slotType) {
    if (!gameState.sponsorSlots[slotType]) return;
    const name = gameState.sponsorSlots[slotType].name;
    gameState.sponsorSlots[slotType] = null;
    showNotification(`${name} verwijderd als ${slotType}sponsor`, 'info');
    renderBordSponsorSection();
    saveGame();
}

// Legacy compat — redirect to new section renders
function renderSponsorOverview() {
    renderShirtSponsorSection();
    renderBordSponsorSection();
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

    saveGame();

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
    {
        id: 'st_scout_senior', name: 'Scout', salary: 200,
        effect: 'Speurt dagelijks nieuw talent op voor jouw club',
        color: '#2e7d32',
        bonuses: ['Ontgrendelt scouting-pagina'],
        svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="20" cy="13" r="7" fill="#fff3" stroke="white" stroke-width="1.8"/><path d="M10 42c0-9 4.5-15 10-15s10 6 10 15" fill="#fff2" stroke="white" stroke-width="1.8"/><path d="M16 11.5c1-2 3-3.5 5.5-3.5" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".5"/><circle cx="34" cy="16" r="6" stroke="white" stroke-width="2" fill="none"/><circle cx="34" cy="16" r="2.5" stroke="white" stroke-width="1.2" fill="none"/><line x1="38.2" y1="20.2" x2="43" y2="25" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M22 20c2-1 4-1 6 0" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".6"/></svg>`
    },
    {
        id: 'st_trainer', name: 'Individuele Trainer', salary: 120,
        effect: 'Geeft je spelers persoonlijke trainingssessies',
        color: '#1565c0',
        bonuses: ['+100 XP per training'],
        svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="18" cy="12" r="7" fill="#fff3" stroke="white" stroke-width="1.8"/><path d="M8 42c0-9 4.5-15 10-15s10 6 10 15" fill="#fff2" stroke="white" stroke-width="1.8"/><path d="M14 10c1-2 3-3.5 5.5-3.5" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".5"/><rect x="31" y="10" width="11" height="15" rx="2" fill="#fff2" stroke="white" stroke-width="1.8"/><line x1="33.5" y1="14.5" x2="39.5" y2="14.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="33.5" y1="18" x2="39.5" y2="18" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="33.5" y1="21.5" x2="37" y2="21.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/><circle cx="36.5" cy="7" r="1" fill="white" opacity=".5"/><path d="M35.5 8 L36.5 10 L37.5 8" stroke="white" stroke-width=".8" opacity=".5"/></svg>`
    },
    {
        id: 'st_fysio', name: 'Fysiotherapeut', salary: 200,
        effect: 'Versnelt herstel en houdt spelers fit',
        color: '#c62828',
        bonuses: ['-1 week blessureherstel', 'Massage beschikbaar'],
        requiresMedical: 1,
        svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="18" cy="12" r="7" fill="#fff3" stroke="white" stroke-width="1.8"/><path d="M8 42c0-9 4.5-15 10-15s10 6 10 15" fill="#fff2" stroke="white" stroke-width="1.8"/><path d="M14 10c1-2 3-3.5 5.5-3.5" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".5"/><rect x="32" y="13" width="4" height="14" rx="1" fill="white"/><rect x="28" y="17.5" width="12" height="4" rx="1" fill="white"/><circle cx="34" cy="8" r="2.5" stroke="white" stroke-width="1.2" fill="none"/><path d="M32 8 L36 8" stroke="white" stroke-width="1"/><path d="M34 6 L34 10" stroke="white" stroke-width="1"/></svg>`
    },
    {
        id: 'st_jurist', name: 'Jurist', salary: 250,
        effect: 'Onderhandelt betere deals voor je club',
        color: '#6a1b9a',
        bonuses: ['-10% transferkosten', 'Betere contractonderhandeling'],
        requiresDivision: 6,
        svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="12" r="7" fill="#fff3" stroke="white" stroke-width="1.8"/><path d="M14 42c0-9 4.5-15 10-15s10 6 10 15" fill="#fff2" stroke="white" stroke-width="1.8"/><path d="M20 10c1-2 3-3.5 5.5-3.5" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".5"/><path d="M22.5 19 L24 28 L25.5 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 21 L24 23 L28 21" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="36" y="14" width="6" height="8" rx="1" stroke="white" stroke-width="1.2" fill="#fff1"/><line x1="37.5" y1="16.5" x2="40.5" y2="16.5" stroke="white" stroke-width=".8"/><line x1="37.5" y1="18.5" x2="40.5" y2="18.5" stroke="white" stroke-width=".8"/><line x1="37.5" y1="20.5" x2="39.5" y2="20.5" stroke="white" stroke-width=".8"/></svg>`
    },
    {
        id: 'st_arts', name: 'Arts', salary: 300,
        effect: 'Professionele diagnose en behandeling bij blessures',
        color: '#00838f',
        bonuses: ['-2 wedstrijden blessuretijd', 'Betere diagnoses'],
        requiresMedical: 2,
        svg: `<svg viewBox="0 0 48 48" fill="none"><circle cx="20" cy="11" r="7" fill="#fff3" stroke="white" stroke-width="1.8"/><path d="M10 42c0-9 4.5-15 10-15s10 6 10 15" fill="#fff2" stroke="white" stroke-width="1.8"/><path d="M16 9c1-2 3-3.5 5.5-3.5" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".5"/><circle cx="37" cy="14" r="8" stroke="white" stroke-width="1.5" fill="#fff1"/><rect x="35.2" y="9" width="3.6" height="10" rx=".8" fill="white"/><rect x="32" y="12.2" width="10" height="3.6" rx=".8" fill="white"/><path d="M30 23 Q33 26 37 24" stroke="white" stroke-width="1" stroke-linecap="round" opacity=".4"/></svg>`
    }
];

// Direct hire scout from scout page
window.hireScoutDirect = function() {
    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };
    if (!gameState.hiredStaff.medisch) gameState.hiredStaff.medisch = [];

    if (gameState.hiredStaff.medisch.includes('st_scout_senior')) {
        showNotification('Je hebt al een scout!', 'info');
        return;
    }

    gameState.hiredStaff.medisch.push('st_scout_senior');
    if (!gameState.staffHiredAt) gameState.staffHiredAt = {};
    gameState.staffHiredAt['st_scout_senior'] = gameState.week || 1;
    gameState.stats.staffHired = (gameState.stats.staffHired || 0) + 1;
    updateBudgetDisplays();
    renderScoutPage();
    saveGame();
    triggerAchievementCheck();
    const scoutSalary = STAFF_MEMBERS.find(s => s.id === 'st_scout_senior')?.salary || 175;
    showNotification(`Scout aangenomen! Salaris: ${formatCurrency(scoutSalary)}/week`, 'success');
};

function renderStaffPage() {
    const container = document.getElementById('staff-hire-grid');
    if (!container) return;

    if (!gameState.hiredStaff) gameState.hiredStaff = { trainers: [], medisch: [] };

    const medConfig = STADIUM_TILE_CONFIG.medical;
    const medId = gameState.stadium[medConfig.stateKey];
    const medLevel = medConfig.levels.findIndex(l => l.id === medId);
    const division = gameState.club.division;

    let html = '';
    STAFF_MEMBERS.forEach(staff => {
        const isHired = gameState.hiredStaff.medisch?.includes(staff.id) || gameState.hiredStaff.trainers?.includes(staff.id);

        let lockReason = null;
        let lockIcon = '';
        let lockRequirement = '';
        if (staff.requiresMedical !== undefined && medLevel < staff.requiresMedical) {
            const reqName = medConfig.levels[staff.requiresMedical]?.name || `Medisch Niv. ${staff.requiresMedical}`;
            lockIcon = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
            lockReason = 'Gebouw vereist';
            lockRequirement = reqName;
        }
        if (staff.requiresDivision !== undefined && division > staff.requiresDivision) {
            const divNames = {6: '4e Klasse', 5: '3e Klasse', 4: '2e Klasse', 3: '1e Klasse', 2: 'Hoofdklasse', 1: 'Eredivisie'};
            lockIcon = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
            lockReason = 'Divisie vereist';
            lockRequirement = divNames[staff.requiresDivision] || `Divisie ${staff.requiresDivision}`;
        }

        const stateClass = isHired ? 'hired' : lockReason ? 'locked' : '';

        const bonusesHtml = staff.bonuses.map(b => `<span class="staff-card-bonus">${b}</span>`).join('');

        const hiredWeek = gameState.staffHiredAt?.[staff.id];
        const canFire = hiredWeek !== undefined && (gameState.week || 1) > hiredWeek;

        let actionHtml = '';
        if (isHired) {
            actionHtml = `
                <div class="staff-btn-row">
                    <button class="staff-btn staff-btn-hired" disabled>In dienst</button>
                    <button class="staff-btn staff-btn-fire" ${!canFire ? 'disabled title="Kan pas na 1 dag ontslaan"' : ''} onclick="fireStaffMember('${staff.id}')">Ontslaan</button>
                </div>
                <div class="staff-card-salary">${formatCurrency(staff.salary)}/week</div>`;
        } else if (lockReason) {
            actionHtml = `
                <div class="staff-card-lock-badge">
                    <span class="staff-lock-icon">${lockIcon}</span>
                    <span class="staff-lock-label">${lockReason}</span>
                    <span class="staff-lock-req">${lockRequirement}</span>
                </div>`;
        } else {
            actionHtml = `
                <button class="staff-btn staff-btn-hire" onclick="hireStaffMember('${staff.id}')">Aannemen · ${formatCurrency(staff.salary)}/wk</button>`;
        }

        html += `
            <div class="staff-card ${stateClass}">
                <div class="staff-card-icon" style="background:${staff.color}">${staff.svg}</div>
                <div class="staff-card-info">
                    <div class="staff-card-name">${staff.name}</div>
                    <div class="staff-card-desc">${staff.effect}</div>
                    <div class="staff-card-bonuses">${bonusesHtml}</div>
                </div>
                <div class="staff-card-action">${actionHtml}</div>
            </div>`;
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

window.hireStaff = function(category, staffId) {
    // Legacy compatibility — redirect to new system
    window.hireStaffMember(staffId);
};

window.fireStaffMember = function(staffId) {
    if (!gameState.hiredStaff?.medisch) return;

    const staff = STAFF_MEMBERS.find(s => s.id === staffId);
    const hiredWeek = gameState.staffHiredAt?.[staffId];
    if (hiredWeek !== undefined && (gameState.week || 1) <= hiredWeek) {
        showNotification('Je kunt pas na 1 dag ontslaan!', 'error');
        return;
    }

    const idx = gameState.hiredStaff.medisch.indexOf(staffId);
    if (idx === -1) return;
    gameState.hiredStaff.medisch.splice(idx, 1);
    if (gameState.staffHiredAt) delete gameState.staffHiredAt[staffId];
    gameState.stats.staffFired = (gameState.stats.staffFired || 0) + 1;
    updateBudgetDisplays();
    renderStaffPage();
    renderDashboardChecklist();
    saveGame();
    triggerAchievementCheck();
    showNotification(`${staff?.name || 'Stafmedewerker'} ontslagen.`, 'info');
};

window.hireStaffMember = function(staffId) {
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
    if (!gameState.staffHiredAt) gameState.staffHiredAt = {};
    gameState.staffHiredAt[staffId] = gameState.week || 1;
    gameState.stats.staffHired = (gameState.stats.staffHired || 0) + 1;
    updateBudgetDisplays();
    renderStaffPage();
    renderDashboardChecklist();
    saveGame();
    triggerAchievementCheck();

    const staffName = staff?.name || 'Stafmedewerker';
    showNotification(`${staffName} aangenomen! Salaris: ${formatCurrency(staff?.salary || 0)}/week`, 'success');
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

// ================================================
// SPECIALIST SELECTION SYSTEM
// ================================================

function populateSpecialistSelects() {
    if (!gameState.specialists) {
        gameState.specialists = { cornerTaker: null, penaltyTaker: null, freekickTaker: null, captain: null };
    }

    const lineupIds = new Set(gameState.lineup.filter(p => p != null).map(p => p.id));

    // Build lineup players list including myPlayer
    const allPlayers = [...gameState.players];
    if (gameState.myPlayer && gameState.myPlayer.name) {
        const mp = gameState.myPlayer;
        const a = mp.attributes || {};
        const ovr = Math.round(((a.SNE || 0) + (a.TEC || 0) + (a.PAS || 0) + (a.SCH || 0) + (a.VER || 0) + (a.FYS || 0)) / 6);
        allPlayers.push({
            id: 'myplayer',
            name: mp.name,
            age: mp.age,
            position: mp.position,
            overall: ovr,
            stars: mp.stars || 1,
            isMyPlayer: true
        });
    }
    const lineupPlayers = allPlayers
        .filter(p => lineupIds.has(p.id))
        .sort((a, b) => (b.overall || 0) - (a.overall || 0));
    const posAbbr = (pos) => POSITIONS[pos]?.abbr || pos;
    const posColor = (pos) => POSITIONS[pos]?.color || '#666';

    const roleLabels = {
        captain: 'Aanvoerder',
        penaltyTaker: 'Strafschopnemer',
        cornerTaker: 'Cornernemer',
        freekickTaker: 'Vrije trap nemer'
    };

    // Update each row
    const rows = document.querySelectorAll('.spec-row');
    for (const row of rows) {
        const key = row.dataset.role;
        if (!key) continue;

        const displayEl = document.getElementById(`spec-display-${key}`);
        if (!displayEl) continue;

        const selectedId = gameState.specialists[key];
        const selectedPlayer = lineupPlayers.find(p => String(p.id) === String(selectedId));

        if (selectedPlayer) {
            row.classList.add('has-player');
            const color = posColor(selectedPlayer.position);
            displayEl.innerHTML = `
                <div class="spec-player-chip" data-role="${key}">
                    <span class="spec-chip-pos" style="background:${color}">${posAbbr(selectedPlayer.position)}</span>
                    <span class="spec-chip-name">${selectedPlayer.name}</span>
                    <span class="spec-chip-overall" style="background:${color}">${selectedPlayer.overall}</span>
                </div>`;
        } else {
            row.classList.remove('has-player');
            displayEl.innerHTML = `<button class="btn btn-secondary btn-small">Selecteer</button>`;
        }

        // Click row to open dropdown
        row.onclick = () => openSpecialistDropdown(key, roleLabels[key], lineupPlayers);
    }
}

function openSpecialistDropdown(roleKey, roleLabel, lineupPlayers) {
    const overlay = document.getElementById('spec-dropdown-overlay');
    const titleEl = document.getElementById('spec-dropdown-title');
    const listEl = document.getElementById('spec-dropdown-list');
    if (!overlay || !listEl) return;

    const posAbbr = (pos) => POSITIONS[pos]?.abbr || pos;
    const posColor = (pos) => POSITIONS[pos]?.color || '#666';
    const selectedId = gameState.specialists[roleKey];

    titleEl.textContent = roleLabel;

    const groupOrder = ['attacker', 'midfielder', 'defender', 'goalkeeper'];
    const groupLabels = { attacker: 'Aanval', midfielder: 'Middenveld', defender: 'Verdediging', goalkeeper: 'Keeper' };

    // Group players by position group
    const grouped = {};
    for (const g of groupOrder) grouped[g] = [];
    for (const p of lineupPlayers) {
        const group = POSITIONS[p.position]?.group || 'midfielder';
        if (grouped[group]) grouped[group].push(p);
    }

    let html = `<div class="spec-dropdown-item clear-option" data-player-id="">Geen specialist</div>`;
    for (const group of groupOrder) {
        const players = grouped[group];
        if (players.length === 0) continue;
        html += `<div class="spec-dropdown-group-header">${groupLabels[group]}</div>`;
        for (const p of players) {
            const color = posColor(p.position);
            const isSelected = String(p.id) === String(selectedId);
            const energy = p.energy || 75;
            const energyColor = energy >= 70 ? '#4caf50' : energy >= 30 ? '#ff9800' : '#f44336';
            html += `
                <div class="spec-dropdown-item available-player ${isSelected ? 'selected' : ''}" data-player-id="${p.id}">
                    <span class="ap-pos" style="background:${color};color:#fff">${posAbbr(p.position)}</span>
                    <span class="ap-age">${p.age}j</span>
                    <span class="ap-name">${p.name}</span>
                    <span class="ap-energy"><span class="ap-energy-bar" style="width:${energy}%;background:${energyColor}"></span></span>
                    <span class="ap-overall" style="background:${color}">${p.overall}</span>
                    <span class="ap-stars">${renderStarsHTML(p.stars || 0)}</span>
                </div>`;
        }
    }
    listEl.innerHTML = html;

    // Show overlay
    overlay.style.display = 'flex';

    // Close button
    document.getElementById('spec-dropdown-close').onclick = () => {
        overlay.style.display = 'none';
    };

    // Click backdrop to close
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    };

    // Player selection
    listEl.querySelectorAll('.spec-dropdown-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            const playerId = item.dataset.playerId;
            gameState.specialists[roleKey] = playerId || null;
            overlay.style.display = 'none';
            saveGame();
            populateSpecialistSelects();
            triggerAchievementCheck();
        };
    });
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

    // Update chairman quote based on construction state
    const quoteEl = document.querySelector('#stadium .chairman-intro-quote');
    if (quoteEl) {
        if (gameState.stadium.construction) {
            const config = STADIUM_TILE_CONFIG[gameState.stadium.construction.category];
            const level = config?.levels.find(l => l.id === gameState.stadium.construction.targetId);
            const name = level?.name || 'een upgrade';
            quoteEl.textContent = `"Er wordt momenteel gebouwd aan ${name}. We kunnen maar één project tegelijk aan, trainer — de aannemer heeft maar twee handen!"`;
        } else {
            quoteEl.textContent = `"Dit is ons complex, trainer. Klik op een gebouw om te upgraden. Grotere tribune, beter gras, een echte kantine... het kost wat, maar de supporters en de inkomsten groeien mee."`;
        }
    }

    // ===== LAYOUT =====
    const cy = 200;
    const fieldW = 170, fieldH = 96;

    const tribuneConfig = STADIUM_TILE_CONFIG.tribune;
    const tribuneId = gameState.stadium[tribuneConfig.stateKey];
    const tribuneLevel = Math.max(0, tribuneConfig.levels.findIndex(l => l.id === tribuneId));
    const ringThickness = [0, 16, 26, 36, 48, 54, 60, 66, 72, 78][tribuneLevel] || 0;
    const stadW = fieldW + ringThickness * 2;
    const stadH = fieldH + ringThickness * 2;

    const bw = 90, bh = 58;

    function getLevel(key) {
        const config = STADIUM_TILE_CONFIG[key];
        const id = gameState.stadium[config.stateKey];
        return Math.max(0, config.levels.findIndex(l => l.id === id));
    }

    // Road ring around stadium (scales with tribune size)
    const roadMargin = 26;
    const roadAreaW = Math.max(240, stadW + roadMargin * 2);
    const roadAreaH = Math.max(150, stadH + roadMargin * 2 + 16);
    const roadTop = cy - roadAreaH / 2;
    const roadBottom = cy + roadAreaH / 2;

    // Training & Academy field dimensions
    const trainW = 140, trainH = 78;
    const acadW = 110, acadH = 60;
    const trainY = Math.max(320, roadBottom + 20);

    const constructionData = gameState.stadium.construction;

    // Dynamic viewBox: match container aspect ratio so SVG fills perfectly
    const viewH = Math.max(460, trainY + trainH + 50);
    const containerRect = container.getBoundingClientRect();
    const viewW = (containerRect.width && containerRect.height)
        ? Math.max(700, Math.round(viewH * (containerRect.width / containerRect.height)))
        : 700;
    const cx = viewW / 2;

    // Positions derived from cx
    const roadLeft = cx - roadAreaW / 2;
    const roadRight = cx + roadAreaW / 2;

    // Building positions — spread wide to fill the map
    const buildingSideOffset = Math.min(140, (viewW - roadAreaW) / 2 - 50);
    const positions = {
        kantine:  { x: roadLeft - buildingSideOffset, y: cy - 32, w: 90, h: 58 },
        medical:  { x: roadLeft - buildingSideOffset, y: cy + 38, w: 90, h: 58 },
        scouting: { x: roadRight + buildingSideOffset, y: cy - 32, w: 90, h: 58 },
        perszaal: { x: roadRight + buildingSideOffset, y: cy + 38, w: 90, h: 58 },
    };

    const trainX = cx - trainW - 14;
    const acadX = cx + 14, acadY = trainY;

    let svg = `<svg viewBox="0 0 ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Inter', system-ui, sans-serif;">`;

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
        overlay += `<text id="construction-timer-map" x="${x + w/2}" y="${y + h/2 + 12}" text-anchor="middle" fill="#ffa500" font-size="10" font-weight="bold">--:--</text>`;
        return overlay;
    }

    // ===== BACKGROUND =====
    svg += `<rect width="${viewW}" height="${viewH}" fill="url(#grass-pattern)" rx="12"/>`;
    // Subtle grass texture lines
    for (let i = 0; i < Math.ceil(viewW / 20) + 1; i++) {
        const x = i * 20;
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="${viewH}" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>`;
    }

    // ===== ROADS (ring around stadium + spurs to buildings & training) =====
    const roadW = 10;
    const roadColor = 'url(#road-grad)';
    const lineColor = 'rgba(255,255,200,0.25)';

    // Top road (extends to edges as main approach)
    svg += `<rect x="30" y="${roadTop - roadW/2}" width="${viewW - 60}" height="${roadW}" fill="${roadColor}" rx="5"/>`;
    for (let dx = 35; dx < viewW - 35; dx += 18) svg += `<rect x="${dx}" y="${roadTop - 0.5}" width="10" height="1" fill="${lineColor}" rx="0.5"/>`;
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

    // Left spur road — from ring to left buildings
    const leftBuildX = positions.kantine.x;
    svg += `<rect x="${leftBuildX}" y="${cy - roadW/2}" width="${roadLeft - leftBuildX}" height="${roadW}" fill="${roadColor}" rx="5"/>`;
    for (let dx = leftBuildX + 5; dx < roadLeft - 5; dx += 18) svg += `<rect x="${dx}" y="${cy - 0.5}" width="10" height="1" fill="${lineColor}" rx="0.5"/>`;
    // Right spur road — from ring to right buildings
    const rightBuildX = positions.scouting.x;
    svg += `<rect x="${roadRight}" y="${cy - roadW/2}" width="${rightBuildX - roadRight}" height="${roadW}" fill="${roadColor}" rx="5"/>`;
    for (let dx = roadRight + 5; dx < rightBuildX - 5; dx += 18) svg += `<rect x="${dx}" y="${cy - 0.5}" width="10" height="1" fill="${lineColor}" rx="0.5"/>`;

    // Road circles at corners and junctions
    [[roadLeft, roadTop], [roadRight, roadTop], [roadLeft, roadBottom], [roadRight, roadBottom], [cx, roadBottom], [roadLeft, cy], [roadRight, cy]].forEach(([ix, iy]) => {
        svg += `<circle cx="${ix}" cy="${iy}" r="7" fill="#555" stroke="#666" stroke-width="0.5"/>`;
    });

    // ===== STADIUM (tribune) =====
    const tribuneColors = ['#6a4a2a', '#5a5a5a', '#4a4a6a', '#3a3a7a', '#8a6a0a', '#2a5a8a', '#1a4a6a', '#3a3a5a', '#4a2a5a', '#6a3a1a'];
    const tc = tribuneColors[Math.min(tribuneLevel, tribuneColors.length - 1)];
    const levelColors = [['#2e7d32','#90a4ae'],['#1b5e20','#b0bec5'],['#1565c0','#42a5f5'],['#6a1b9a','#ce93d8'],['#e65100','#ffd54f'],['#0d47a1','#64b5f6'],['#1a237e','#7986cb'],['#4a148c','#b39ddb'],['#b71c1c','#ef9a9a'],['#f57f17','#ffd54f']];
    const tColors = levelColors[Math.min(tribuneLevel, levelColors.length - 1)];
    const isStadActive = currentStadiumCategory === 'tribune';

    svg += `<g class="stadium-building${isStadActive ? ' active' : ''}" data-category="tribune" onclick="selectStadiumCategory('tribune')" filter="url(#shadow-md)">`;
    if (tribuneLevel === 0) {
        // Houten Banken — wooden benches around the pitch
        svg += `<rect x="${cx - fieldW/2 - 20}" y="${cy - fieldH/2 - 20}" width="${fieldW + 40}" height="${fieldH + 40}" fill="transparent"/>`;
        const bGap = 5;
        const plankW = 3;
        const woodA = '#c4a24e';
        const woodB = '#a07c2e';
        const woodSh = 'rgba(60,40,10,0.18)';
        // Draw a horizontal bench row (two planks + shadow)
        function drawHBench(bx, by, bw) {
            svg += `<rect x="${bx+0.5}" y="${by+1}" width="${bw}" height="${plankW*2+1}" fill="${woodSh}" rx="1"/>`;
            svg += `<rect x="${bx}" y="${by}" width="${bw}" height="${plankW}" fill="${woodA}" stroke="${woodB}" stroke-width="0.4" rx="0.5"/>`;
            svg += `<rect x="${bx}" y="${by+plankW+1}" width="${bw}" height="${plankW}" fill="${woodB}" stroke="${woodA}" stroke-width="0.3" rx="0.5"/>`;
            // Legs (supports underneath — small dark rectangles at ends)
            svg += `<rect x="${bx+1}" y="${by+plankW*2+1.5}" width="2" height="1.5" fill="#6a4e18" rx="0.3"/>`;
            svg += `<rect x="${bx+bw-3}" y="${by+plankW*2+1.5}" width="2" height="1.5" fill="#6a4e18" rx="0.3"/>`;
        }
        // Draw a vertical bench row (two planks + shadow)
        function drawVBench(bx, by, bh) {
            svg += `<rect x="${bx+1}" y="${by+0.5}" width="${plankW*2+1}" height="${bh}" fill="${woodSh}" rx="1"/>`;
            svg += `<rect x="${bx}" y="${by}" width="${plankW}" height="${bh}" fill="${woodA}" stroke="${woodB}" stroke-width="0.4" rx="0.5"/>`;
            svg += `<rect x="${bx+plankW+1}" y="${by}" width="${plankW}" height="${bh}" fill="${woodB}" stroke="${woodA}" stroke-width="0.3" rx="0.5"/>`;
            svg += `<rect x="${bx+plankW*2+1.5}" y="${by+1}" width="1.5" height="2" fill="#6a4e18" rx="0.3"/>`;
            svg += `<rect x="${bx+plankW*2+1.5}" y="${by+bh-3}" width="1.5" height="2" fill="#6a4e18" rx="0.3"/>`;
        }
        // TOP: 4 bench segments along long side
        const benchSegW = 24, benchSegGap = 6;
        const numLong = 4;
        const totalBenchW = numLong * benchSegW + (numLong - 1) * benchSegGap;
        const benchStartX = cx - totalBenchW / 2;
        const topBY = cy - fieldH/2 - bGap - plankW*2 - 1;
        for (let i = 0; i < numLong; i++) drawHBench(benchStartX + i * (benchSegW + benchSegGap), topBY, benchSegW);
        // BOTTOM: 4 bench segments
        const botBY = cy + fieldH/2 + bGap;
        for (let i = 0; i < numLong; i++) drawHBench(benchStartX + i * (benchSegW + benchSegGap), botBY, benchSegW);
        // LEFT: 2 bench segments along short side
        const benchSegH = 24, sideGap = 8;
        const totalBenchH = 2 * benchSegH + sideGap;
        const benchStartY = cy - totalBenchH / 2;
        const leftBX = cx - fieldW/2 - bGap - plankW*2 - 1;
        for (let i = 0; i < 2; i++) drawVBench(leftBX, benchStartY + i * (benchSegH + sideGap), benchSegH);
        // RIGHT: 2 bench segments
        const rightBX = cx + fieldW/2 + bGap;
        for (let i = 0; i < 2; i++) drawVBench(rightBX, benchStartY + i * (benchSegH + sideGap), benchSegH);
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
    const labelY = tribuneLevel === 0 ? cy - fieldH/2 - 16 : cy - stadH/2 - 8;
    const tribuneLevelName = tribuneConfig.levels[tribuneLevel]?.name || 'Stadion';
    const tribTextW = tribuneLevelName.length * 5.5;
    const tribTextX = cx - tribTextW / 2;
    const tribBadgeX = cx + tribTextW / 2 + 8;
    svg += `<text x="${cx}" y="${labelY}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${tribuneLevelName}</text>`;
    svg += `<rect x="${tribBadgeX}" y="${labelY - 12}" width="28" height="14" fill="${tColors[1]}" rx="7"/>`;
    svg += `<text x="${tribBadgeX + 14}" y="${labelY - 1}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${tribuneLevel + 1}</text>`;
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
    const grassLevelName = STADIUM_TILE_CONFIG.grass.levels[grassLevel]?.name || 'Wedstrijdveld';
    const grassTextW = grassLevelName.length * 5.5;
    const grassCenterX = cx;
    const grassBadgeX = grassCenterX + grassTextW / 2 + 8;
    const grassLabelY = cy + fieldH/2 - 5;
    svg += `<text x="${grassCenterX}" y="${grassLabelY}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${grassLevelName}</text>`;
    svg += `<rect x="${grassBadgeX}" y="${grassLabelY - 10}" width="28" height="14" fill="${gColors[1]}" rx="7"/>`;
    svg += `<text x="${grassBadgeX + 14}" y="${grassLabelY + 1}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${grassLevel + 1}</text>`;
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
        const fieldLabel = `${icon} ${label}`.trim();
        const fieldWords = fieldLabel.split(' ');
        const fieldCenterX = x + w/2;
        if (fieldWords.length > 2) {
            const mid = Math.ceil(fieldWords.length / 2);
            const line1 = fieldWords.slice(0, mid).join(' ');
            const line2 = fieldWords.slice(mid).join(' ');
            const longestLine = Math.max(line1.length, line2.length);
            const fieldBadgeX = fieldCenterX + longestLine * 5.5 / 2 + 8;
            svg += `<text x="${fieldCenterX}" y="${y-16}" text-anchor="middle" fill="${lc[1]}" font-size="11" font-weight="bold"><tspan x="${fieldCenterX}" dy="0">${line1}</tspan><tspan x="${fieldCenterX}" dy="12">${line2}</tspan></text>`;
            svg += `<rect x="${fieldBadgeX}" y="${y-24}" width="28" height="14" fill="${lc[1]}" rx="7"/>`;
            svg += `<text x="${fieldBadgeX + 14}" y="${y-14}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${level+1}</text>`;
        } else {
            const fieldTextW = fieldLabel.length * 5.5;
            const fieldBadgeX = fieldCenterX + fieldTextW / 2 + 8;
            svg += `<text x="${fieldCenterX}" y="${y-8}" text-anchor="middle" fill="${lc[1]}" font-size="11" font-weight="bold">${fieldLabel}</text>`;
            svg += `<rect x="${fieldBadgeX}" y="${y-18}" width="28" height="14" fill="${lc[1]}" rx="7"/>`;
            svg += `<text x="${fieldBadgeX + 14}" y="${y-8}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${level+1}</text>`;
        }
        // Construction overlay for training/academy fields
        if (constructionData && constructionData.category === key) {
            svg += renderConstructionOverlay(x, y, w, h, 6);
        }
        svg += `</g>`;
    }

    const trainLevel = getLevel('training');
    const acadLevel = getLevel('academy');
    const trainLevelName = STADIUM_TILE_CONFIG.training.levels[trainLevel]?.name || 'Training';
    renderField(trainX, trainY, trainW, trainH, trainLevel, 'training', trainLevelName, '', levelColors[Math.min(trainLevel, 4)]);

    // Academy: 2 small fields side by side
    const acadSmallW = 64, acadSmallH = 78, acadGap = 10;
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
    const acadLevelName = STADIUM_TILE_CONFIG.academy.levels[acadLevel]?.name || 'Jeugdacademie';
    const acadWords = acadLevelName.split(' ');
    if (acadWords.length > 1) {
        const acadMid = Math.ceil(acadWords.length / 2);
        const acadLine1 = acadWords.slice(0, acadMid).join(' ');
        const acadLine2 = acadWords.slice(acadMid).join(' ');
        const acadLongest = Math.max(acadLine1.length, acadLine2.length);
        const acadBadgeX = acadCenterX + acadLongest * 5.5 / 2 + 8;
        svg += `<text x="${acadCenterX}" y="${f1y-16}" text-anchor="middle" fill="${acColors[1]}" font-size="11" font-weight="bold"><tspan x="${acadCenterX}" dy="0">${acadLine1}</tspan><tspan x="${acadCenterX}" dy="12">${acadLine2}</tspan></text>`;
        svg += `<rect x="${acadBadgeX}" y="${f1y-24}" width="28" height="14" fill="${acColors[1]}" rx="7"/>`;
        svg += `<text x="${acadBadgeX + 14}" y="${f1y-14}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${acadLevel}</text>`;
    } else {
        const acadTextW = acadLevelName.length * 5.5;
        const acadBadgeX = acadCenterX + acadTextW / 2 + 8;
        svg += `<text x="${acadCenterX}" y="${f1y-8}" text-anchor="middle" fill="${acColors[1]}" font-size="11" font-weight="bold">${acadLevelName}</text>`;
        svg += `<rect x="${acadBadgeX}" y="${f1y-18}" width="28" height="14" fill="${acColors[1]}" rx="7"/>`;
        svg += `<text x="${acadBadgeX + 14}" y="${f1y-8}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${acadLevel}</text>`;
    }
    // Construction overlay for academy
    if (constructionData && constructionData.category === 'academy') {
        const totalAcadW = acadSmallW * 2 + acadGap;
        svg += renderConstructionOverlay(acadX, acadY, totalAcadW, acadSmallH, 4);
    }
    svg += `</g>`;

    // ===== BUILDINGS (left & right columns) =====
    const buildingMeta = {
        medical:       { icon: '', accent: '#e05050', name: 'Fysio' },
        kantine:       { icon: '', accent: '#d4a044', name: 'Horeca' },
        scouting:      { icon: '', accent: '#60a5fa', name: 'Scouting' },
        perszaal:      { icon: '', accent: '#94a3b8', name: 'Supporters' },
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

        const tileLevelName = config ? (config.levels[level]?.name || meta.name) : meta.name;
        const displayName = isUnbuilt ? meta.name : tileLevelName;

        if (isUnbuilt) {
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="${cbh}" fill="#4a3d28" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="5 3" rx="8"/>`;
            svg += `<rect x="${bx+6}" y="${by+6}" width="${cbw-12}" height="${cbh-12}" fill="#3e3420" rx="5"/>`;
            svg += `<circle cx="${bx+15}" cy="${by+15}" r="4" fill="#56472e" opacity="0.5"/>`;
            svg += `<circle cx="${bx+cbw-20}" cy="${by+cbh-18}" r="5" fill="#56472e" opacity="0.4"/>`;
            svg += `<circle cx="${bx+cbw/2+8}" cy="${by+12}" r="3" fill="#56472e" opacity="0.3"/>`;
            svg += `<circle cx="${pos.x}" cy="${pos.y-2}" r="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>`;
            svg += `<text x="${pos.x}" y="${pos.y+3}" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="15" font-weight="300">+</text>`;
            svg += `<text x="${pos.x}" y="${by+cbh-5}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="10" font-weight="600">${displayName}</text>`;
            svg += `<rect x="${bx+cbw-28}" y="${by+2}" width="28" height="14" fill="#9e9e9e" rx="7"/>`;
            svg += `<text x="${bx+cbw-14}" y="${by+12}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv0</text>`;
        } else {
            const darkBase = { medical:'#3a1a1a', kantine:'#3a2a1a', scouting:'#1a2a3a', perszaal:'#1a1a2a' };
            const roofColor = { medical:'#c03030', kantine:'#a07820', scouting:'#2a5a9a', perszaal:'#475569' };
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="${cbh}" fill="${darkBase[key]}" stroke="${meta.accent}" stroke-width="1.5" rx="8"/>`;
            svg += `<rect x="${bx}" y="${by}" width="${cbw}" height="7" fill="${roofColor[key]}" rx="8"/>`;
            svg += `<rect x="${bx}" y="${by+5}" width="${cbw}" height="2" fill="${roofColor[key]}"/>`;
            svg += buildingDetails[key](bx, by, cbw, cbh, level);
            svg += `<text x="${pos.x}" y="${by+cbh-5}" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-size="10" font-weight="600">${displayName}</text>`;
            svg += `<rect x="${bx+cbw-28}" y="${by-2}" width="28" height="14" fill="${meta.accent}" rx="7"/>`;
            svg += `<text x="${bx+cbw-14}" y="${by+8}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">Nv${level}</text>`;
        }

        // Construction overlay
        if (constructionData && constructionData.category === key) {
            svg += renderConstructionOverlay(bx, by, cbw, cbh, 8);
        }

        svg += `</g>`;
    });

    // ===== TREES (decoration) — scattered around the complex =====
    const bottomY = trainY + trainH;
    // Tree clusters: edges, between buildings, around training
    function drawTree(tx, ty, scale = 1) {
        const r1 = 10 * scale, r2 = 7 * scale, r3 = 5 * scale;
        svg += `<circle cx="${tx}" cy="${ty}" r="${r1}" fill="#1a4a1a" opacity="0.5"/>`;
        svg += `<circle cx="${tx}" cy="${ty-4*scale}" r="${r2}" fill="#2a6a2a" opacity="0.5"/>`;
        svg += `<circle cx="${tx}" cy="${ty-7*scale}" r="${r3}" fill="#3a8a3a" opacity="0.4"/>`;
    }
    // Corner clusters
    drawTree(20, 35); drawTree(38, 28, 0.7); drawTree(12, 55, 0.8);
    drawTree(viewW - 20, 35); drawTree(viewW - 38, 28, 0.7); drawTree(viewW - 12, 55, 0.8);
    drawTree(20, bottomY + 15); drawTree(38, bottomY + 8, 0.7);
    drawTree(viewW - 20, bottomY + 15); drawTree(viewW - 38, bottomY + 8, 0.7);
    // Between buildings and ring
    drawTree(roadLeft - buildingSideOffset/2, roadTop + 15, 0.8);
    drawTree(roadRight + buildingSideOffset/2, roadTop + 15, 0.8);
    drawTree(roadLeft - buildingSideOffset/2, roadBottom - 15, 0.7);
    drawTree(roadRight + buildingSideOffset/2, roadBottom - 15, 0.7);
    // Around training area
    drawTree(trainX - 16, trainY + trainH/2, 0.9);
    drawTree(acadX + acadSmallW*2 + acadGap + 16, trainY + trainH/2, 0.9);
    // Extra trees along the edges
    drawTree(20, cy, 0.9); drawTree(viewW - 20, cy, 0.9);
    drawTree(cx - viewW*0.35, bottomY + 5, 0.6);
    drawTree(cx + viewW*0.35, bottomY + 5, 0.6);

    // ===== PARKING LOT (left of top road) =====
    const parkX = 30, parkY = roadTop + 10;
    svg += `<rect x="${parkX}" y="${parkY}" width="52" height="32" fill="#3a3a3a" rx="3" opacity="0.4"/>`;
    for (let p = 0; p < 4; p++) {
        svg += `<rect x="${parkX+4+p*12}" y="${parkY+4}" width="10" height="7" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" rx="1"/>`;
        svg += `<rect x="${parkX+4+p*12}" y="${parkY+18}" width="10" height="7" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" rx="1"/>`;
    }
    // Right parking
    const parkX2 = viewW - 82, parkY2 = roadTop + 10;
    svg += `<rect x="${parkX2}" y="${parkY2}" width="52" height="32" fill="#3a3a3a" rx="3" opacity="0.4"/>`;
    for (let p = 0; p < 4; p++) {
        svg += `<rect x="${parkX2+4+p*12}" y="${parkY2+4}" width="10" height="7" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" rx="1"/>`;
        svg += `<rect x="${parkX2+4+p*12}" y="${parkY2+18}" width="10" height="7" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" rx="1"/>`;
    }

    // ===== VILLAGE HOUSES (dorpshuisjes) =====
    const houses = [
        // Top-left cluster
        { x: 30, y: 55, w: 22, h: 16, roof: '#8b4513', wall: '#d2b48c' },
        { x: 58, y: 50, w: 18, h: 14, roof: '#a0522d', wall: '#deb887' },
        { x: 34, y: 78, w: 20, h: 15, roof: '#6b3a1a', wall: '#c4a67a' },
        // Top-right cluster
        { x: viewW - 52, y: 55, w: 22, h: 16, roof: '#a0522d', wall: '#d2b48c' },
        { x: viewW - 78, y: 50, w: 18, h: 14, roof: '#8b4513', wall: '#deb887' },
        { x: viewW - 56, y: 78, w: 20, h: 15, roof: '#6b3a1a', wall: '#c4a67a' },
        // Bottom-left
        { x: 30, y: bottomY - 20, w: 20, h: 14, roof: '#8b4513', wall: '#d2b48c' },
        { x: 55, y: bottomY - 15, w: 16, h: 12, roof: '#a0522d', wall: '#deb887' },
        // Bottom-right
        { x: viewW - 50, y: bottomY - 20, w: 20, h: 14, roof: '#a0522d', wall: '#d2b48c' },
        { x: viewW - 72, y: bottomY - 15, w: 16, h: 12, roof: '#8b4513', wall: '#deb887' },
    ];
    houses.forEach(h => {
        svg += `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" fill="${h.wall}" rx="1" opacity="0.7"/>`;
        svg += `<polygon points="${h.x-2},${h.y} ${h.x+h.w/2},${h.y-7} ${h.x+h.w+2},${h.y}" fill="${h.roof}" opacity="0.8"/>`;
        svg += `<rect x="${h.x+h.w/2-3}" y="${h.y+3}" width="5" height="4" fill="rgba(255,220,100,0.5)" rx="0.5"/>`;
        svg += `<rect x="${h.x+h.w/2-2}" y="${h.y+h.h-6}" width="4" height="6" fill="${h.roof}" opacity="0.6" rx="0.5"/>`;
    });

    // ===== WINDMILL (molen, rechts) =====
    const mx = viewW - 35, my = cy + 60;
    svg += `<polygon points="${mx-7},${my} ${mx-4},${my-30} ${mx+4},${my-30} ${mx+7},${my}" fill="#8b7355" opacity="0.8"/>`;
    svg += `<polygon points="${mx-5},${my-30} ${mx},${my-36} ${mx+5},${my-30}" fill="#5a4a3a" opacity="0.8"/>`;
    const bladLen = 20;
    svg += `<line x1="${mx}" y1="${my-32}" x2="${mx-bladLen}" y2="${my-32-bladLen*0.8}" stroke="#7a6a5a" stroke-width="1.8" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-32}" x2="${mx+bladLen}" y2="${my-32+bladLen*0.8}" stroke="#7a6a5a" stroke-width="1.8" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-32}" x2="${mx+bladLen*0.8}" y2="${my-32-bladLen}" stroke="#7a6a5a" stroke-width="1.8" opacity="0.7"/>`;
    svg += `<line x1="${mx}" y1="${my-32}" x2="${mx-bladLen*0.8}" y2="${my-32+bladLen}" stroke="#7a6a5a" stroke-width="1.8" opacity="0.7"/>`;
    svg += `<polygon points="${mx},${my-32} ${mx-bladLen},${my-32-bladLen*0.8} ${mx-bladLen+3},${my-32-bladLen*0.8+2}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-32} ${mx+bladLen},${my-32+bladLen*0.8} ${mx+bladLen-3},${my-32+bladLen*0.8-2}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-32} ${mx+bladLen*0.8},${my-32-bladLen} ${mx+bladLen*0.8-2},${my-32-bladLen+3}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<polygon points="${mx},${my-32} ${mx-bladLen*0.8},${my-32+bladLen} ${mx-bladLen*0.8+2},${my-32+bladLen-3}" fill="rgba(255,255,255,0.2)"/>`;
    svg += `<circle cx="${mx}" cy="${my-32}" r="2" fill="#5a4a3a" opacity="0.8"/>`;
    svg += `<rect x="${mx-3}" y="${my-6}" width="6" height="6" fill="#5a4a3a" opacity="0.6" rx="1"/>`;

    // ===== SECOND WINDMILL (links) =====
    const mx2 = 35, my2 = cy - 50;
    svg += `<polygon points="${mx2-6},${my2} ${mx2-3},${my2-26} ${mx2+3},${my2-26} ${mx2+6},${my2}" fill="#8b7355" opacity="0.7"/>`;
    svg += `<polygon points="${mx2-4},${my2-26} ${mx2},${my2-31} ${mx2+4},${my2-26}" fill="#5a4a3a" opacity="0.7"/>`;
    const bl2 = 16;
    svg += `<line x1="${mx2}" y1="${my2-28}" x2="${mx2-bl2}" y2="${my2-28-bl2*0.8}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.6"/>`;
    svg += `<line x1="${mx2}" y1="${my2-28}" x2="${mx2+bl2}" y2="${my2-28+bl2*0.8}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.6"/>`;
    svg += `<line x1="${mx2}" y1="${my2-28}" x2="${mx2+bl2*0.8}" y2="${my2-28-bl2}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.6"/>`;
    svg += `<line x1="${mx2}" y1="${my2-28}" x2="${mx2-bl2*0.8}" y2="${my2-28+bl2}" stroke="#7a6a5a" stroke-width="1.5" opacity="0.6"/>`;
    svg += `<polygon points="${mx2},${my2-28} ${mx2-bl2},${my2-28-bl2*0.8} ${mx2-bl2+2},${my2-28-bl2*0.8+2}" fill="rgba(255,255,255,0.15)"/>`;
    svg += `<polygon points="${mx2},${my2-28} ${mx2+bl2},${my2-28+bl2*0.8} ${mx2+bl2-2},${my2-28+bl2*0.8-2}" fill="rgba(255,255,255,0.15)"/>`;
    svg += `<circle cx="${mx2}" cy="${my2-28}" r="1.5" fill="#5a4a3a" opacity="0.7"/>`;
    svg += `<rect x="${mx2-2}" y="${my2-5}" width="4" height="5" fill="#5a4a3a" opacity="0.5" rx="1"/>`;

    // ===== FENCES along training area =====
    const fenceY = trainY - 6;
    for (let fx = trainX; fx < acadX + acadSmallW*2 + acadGap; fx += 8) {
        svg += `<line x1="${fx}" y1="${fenceY}" x2="${fx}" y2="${fenceY-4}" stroke="rgba(255,255,255,0.06)" stroke-width="0.6"/>`;
    }
    svg += `<line x1="${trainX}" y1="${fenceY-2}" x2="${acadX + acadSmallW*2 + acadGap}" y2="${fenceY-2}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>`;

    // Subtitle
    svg += `<text x="${viewW / 2}" y="${viewH - 8}" text-anchor="middle" fill="rgba(255,255,255,0.12)" font-size="9" font-style="italic" letter-spacing="2">Het Dorpsveld</text>`;

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
            { id: 'tribune_1', name: 'Houten Banken', capacity: 200, cost: 0, effect: '200 toeschouwers' },
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
            { id: 'grass_0', name: 'Basis Gras', cost: 0, effect: '+5% thuisvoordeel' },
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
        description: 'Betere trainingsfaciliteiten zorgen ervoor dat spelers meer leren per wedstrijd.',
        levels: [
            { id: 'train_1', name: 'Slecht Trainingsveld', cost: 0, effect: 'Spelers worden 5% beter per wedstrijd' },
            { id: 'train_2', name: 'Trainingsveld', cost: 5000, effect: 'Spelers worden 10% beter per wedstrijd' },
            { id: 'train_3', name: 'Modern Complex', cost: 15000, effect: 'Spelers worden 20% beter per wedstrijd', reqDivision: 7 },
            { id: 'train_4', name: 'Elite Complex', cost: 40000, effect: 'Spelers worden 30% beter per wedstrijd', reqDivision: 7 },
            { id: 'train_5', name: 'Professioneel Complex', cost: 100000, effect: 'Spelers worden 40% beter per wedstrijd', reqDivision: 6 },
            { id: 'train_6', name: 'Meerdere Velden', cost: 250000, effect: 'Spelers worden 50% beter per wedstrijd', reqDivision: 5 },
            { id: 'train_7', name: 'Indoor Hal', cost: 500000, effect: 'Spelers worden 65% beter per wedstrijd', reqDivision: 4 },
            { id: 'train_8', name: 'Wetenschappelijk Lab', cost: 1000000, effect: 'Spelers worden 80% beter per wedstrijd', reqDivision: 3 },
            { id: 'train_9', name: 'Topsport Centrum', cost: 2000000, effect: 'Spelers worden 100% beter per wedstrijd', reqDivision: 2 },
            { id: 'train_10', name: 'Wereldklasse Complex', cost: 5000000, effect: 'Spelers worden 125% beter per wedstrijd', reqDivision: 1 }
        ],
        stateKey: 'training'
    },
    medical: {
        description: 'Betere medische voorzieningen verminderen de kans op blessures.',
        levels: [
            { id: 'med_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'med_1', name: 'EHBO Hokje', cost: 2000, effect: '-10% blessurekans' },
            { id: 'med_2', name: 'Medische Kamer', cost: 4000, effect: '-20% blessurekans' },
            { id: 'med_3', name: 'Fysiotherapie', cost: 12000, effect: '-35% blessurekans', reqDivision: 7 },
            { id: 'med_4', name: 'Medisch Centrum', cost: 30000, effect: '-50% blessurekans', reqDivision: 7 },
            { id: 'med_5', name: 'Sportmedische Kliniek', cost: 75000, effect: '-60% blessurekans', reqDivision: 6 },
            { id: 'med_6', name: 'Revalidatiecentrum', cost: 180000, effect: '-65% blessurekans', reqDivision: 5 },
            { id: 'med_7', name: 'Hydrotherapie', cost: 400000, effect: '-70% blessurekans', reqDivision: 4 },
            { id: 'med_8', name: 'Cryokamer', cost: 800000, effect: '-75% blessurekans', reqDivision: 3 },
            { id: 'med_9', name: 'Medisch Instituut', cost: 2000000, effect: '-85% blessurekans', reqDivision: 2 }
        ],
        stateKey: 'medical'
    },
    academy: {
        description: 'Een betere jeugdopleiding produceert talentvoller spelers.',
        levels: [
            { id: 'acad_0', name: 'Geen Jeugdopleiding', cost: 0, effect: 'Niet gebouwd', maxStars: 0 },
            { id: 'acad_1', name: 'Bescheiden Jeugdopleiding', cost: 1500, effect: 'Max ⯪ potentieel · €250/week', maxStars: 0.5 },
            { id: 'acad_2', name: 'Jeugdopleiding', cost: 3000, effect: 'Max ★ potentieel', maxStars: 1 },
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
            { id: 'scout_1', name: 'Basisnetwerk', cost: 2000, effect: 'Lokaal scouten', reqDivision: 7 },
            { id: 'scout_2', name: 'Regionaal Netwerk', cost: 4000, effect: 'Regionaal scouten', reqDivision: 7 },
            { id: 'scout_3', name: 'Nationaal Netwerk', cost: 12000, effect: 'Nationaal scouten', reqCapacity: 500, reqDivision: 6 },
            { id: 'scout_4', name: 'Internationaal', cost: 35000, effect: 'Internationaal scouten', reqCapacity: 1000, reqDivision: 6 },
            { id: 'scout_5', name: 'Europees Netwerk', cost: 80000, effect: 'Europa + potentieel', reqDivision: 5 },
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
        description: 'De kantine genereert extra inkomsten per toeschouwer tijdens wedstrijden.',
        levels: [
            { id: 'kantine_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'kantine_1', name: 'Koffiehoek', cost: 1500, effect: '+€5 per toeschouwer' },
            { id: 'kantine_2', name: 'Clubkantine', cost: 3000, effect: '+€10 per toeschouwer' },
            { id: 'kantine_3', name: 'Restaurant', cost: 10000, effect: '+€18 per toeschouwer', reqDivision: 7 },
            { id: 'kantine_4', name: 'Horeca Complex', cost: 25000, effect: '+€28 per toeschouwer', reqDivision: 7 },
            { id: 'kantine_5', name: 'Brasserie', cost: 60000, effect: '+€40 per toeschouwer', reqDivision: 6 },
            { id: 'kantine_6', name: 'Grand Cafe', cost: 150000, effect: '+€55 per toeschouwer', reqDivision: 5 },
            { id: 'kantine_7', name: 'Food Court', cost: 350000, effect: '+€75 per toeschouwer', reqDivision: 4 },
            { id: 'kantine_8', name: 'Premium Restaurant', cost: 750000, effect: '+€100 per toeschouwer', reqDivision: 3 },
            { id: 'kantine_9', name: 'VIP Hospitality', cost: 2000000, effect: '+€150 per toeschouwer', reqDivision: 2 }
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
        description: 'Trek meer supporters naar het stadion met betere faciliteiten en sfeer.',
        levels: [
            { id: 'pers_0', name: 'Lege Grond', cost: 0, effect: 'Niet gebouwd' },
            { id: 'pers_1', name: 'Scoreborden', cost: 2000, effect: '+10 fans per thuiswedstrijd' },
            { id: 'pers_2', name: 'Clubwebsite', cost: 4000, effect: '+25 fans per thuiswedstrijd' },
            { id: 'pers_3', name: 'Fanshop', cost: 12000, effect: '+50 fans per thuiswedstrijd', reqCapacity: 500 },
            { id: 'pers_4', name: 'Mascotte', cost: 30000, effect: '+100 fans per thuiswedstrijd', reqDivision: 7 },
            { id: 'pers_5', name: 'Seizoenskaarten', cost: 75000, effect: '+200 fans per thuiswedstrijd', reqDivision: 6 },
            { id: 'pers_6', name: 'Social Media Team', cost: 180000, effect: '+350 fans per thuiswedstrijd', reqDivision: 5 },
            { id: 'pers_7', name: 'LED-Reclameborden', cost: 400000, effect: '+500 fans per thuiswedstrijd', reqDivision: 4 },
            { id: 'pers_8', name: 'Sfeeracties & Tifo', cost: 1000000, effect: '+750 fans per thuiswedstrijd', reqDivision: 3 },
            { id: 'pers_9', name: 'Fan Experience Center', cost: 2500000, effect: '+1000 fans per thuiswedstrijd', reqDivision: 2 }
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
        kantine: 'Horeca', sponsoring: 'Sponsoring', perszaal: 'Supporters'
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
    saveGame();
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
        7: 'Vrijgespeeld in de 5e Klasse',
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
        youthscouting: '👶', kantine: '🍺', sponsoring: '💼', perszaal: '🎉'
    };
    const categoryNames = {
        tribune: 'Stadion', grass: 'Wedstrijdveld', training: 'Trainingsveld',
        medical: 'Medisch', academy: 'Jeugdopleiding', scouting: 'Scouting',
        youthscouting: 'Scoutingcentrum', kantine: 'Horeca', sponsoring: 'Sponsoring', perszaal: 'Supporters'
    };

    if (!gameState.stadium.youthscouting) {
        gameState.stadium.youthscouting = 'ysct_0';
    }

    const currentId = gameState.stadium[config.stateKey];
    const currentIndex = config.levels.findIndex(l => l.id === currentId);
    const currentLevel = config.levels[currentIndex] || config.levels[0];
    const totalLevels = config.levels.length;
    const levelOffset = config.levels[0].effect === 'Niet gebouwd' ? 0 : 1;

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
        youthscouting: '👶', kantine: '🍺', sponsoring: '💼', perszaal: '🎉'
    };
    const categoryNames = {
        tribune: 'Stadion', grass: 'Wedstrijdveld', training: 'Trainingsveld',
        medical: 'Medische Voorzieningen', academy: 'Jeugdopleiding', scouting: 'Scouting',
        youthscouting: 'Scoutingcentrum', kantine: 'Horeca', sponsoring: 'Sponsoring', perszaal: 'Supporters'
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
    gameState.stats.stadiumUpgrades = (gameState.stats.stadiumUpgrades || 0) + 1;
    gameState.stats.stadiumSpending = (gameState.stats.stadiumSpending || 0) + nextLevel.cost;
    gameState.stadium.construction = {
        category: category,
        targetId: nextLevel.id,
        completesAt: Date.now() + 12 * 60 * 60 * 1000 // 12 uur bouwtijd
    };

    // Update UI
    renderStadiumMap();
    updateStadiumUpgradePanel(category);
    updateBudgetDisplays();
    showNotification(`Bouw gestart: ${nextLevel.name}! Klaar over 12 uur.`, 'success');
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
            <td>${team.won || team.wins || 0}</td>
            <td>${team.drawn || team.draws || 0}</td>
            <td>${team.lost || team.losses || 0}</td>
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
let _initMultiplayerRunning = false;
async function initMultiplayerGame(detail) {
    if (_initMultiplayerRunning) return;
    _initMultiplayerRunning = true;
    const { leagueId, clubId, userId, league } = detail;

    try {
        // Load game state from Supabase
        setStorageMode('multiplayer', leagueId, clubId);
        const mpState = await loadGame();

        if (mpState) {
            replaceGameState(mpState);
            gameState.multiplayer.userId = userId;
            gameState.multiplayer.isHost = league.created_by === userId;
        } else {
            // First time or load failed — ensure multiplayer state is set
            gameState.multiplayer = {
                enabled: true,
                leagueId,
                clubId,
                userId,
                isHost: league.created_by === userId,
                leagueName: league.name,
                inviteCode: league.invite_code
            };
            gameState.season = league.season || 1;
            gameState.week = league.week || 1;
            gameState.lastPlayedWeek = 0;
            console.warn('No saved state found — using defaults');
        }

        // Match time — hardcoded, ignore DB value
        gameState._matchTime = '10:40';

        // Set up next match for multiplayer (real countdown to match_time)
        gameState.nextMatch = gameState.nextMatch || {};
        gameState.nextMatch.time = getNextMatchTime();

        // Determine which week this player should be on.
        // lastPlayedWeek tracks the last week this player completed (saw results + processed).
        // If league.week advanced (another player simulated), we set back to lastPlayedWeek + 1.
        if (gameState.multiplayer.clubId) {
            const lastPlayed = gameState.lastPlayedWeek || 0;
            const leagueWeek = gameState.week || 1;
            if (lastPlayed < leagueWeek) {
                // Player hasn't played this week yet (or a previous week)
                gameState.week = lastPlayed + 1;
                gameState._weekPlayed = false;
            } else {
                // Player is caught up
                gameState._weekPlayed = true;
            }

            // Fetch scheduled opponent
            try {
                const opp = await getScheduledOpponent(
                    leagueId,
                    gameState.season || 1,
                    gameState.week || 1,
                    gameState.multiplayer.clubId
                );
                if (opp) {
                    gameState.nextMatch.opponent = opp.name;
                    gameState.nextMatch.isHome = opp.isHome;
                }
            } catch (e) {
                console.warn('Could not fetch scheduled opponent:', e);
            }
        }

        // Move global tiles: mobile → top header bar, desktop → dashboard header
        const tiles = document.querySelector('.global-top-tiles');
        if (window.matchMedia('(max-width: 768px)').matches) {
            const mobileHeader = document.querySelector('.mobile-header');
            if (tiles && mobileHeader) mobileHeader.appendChild(tiles);
        } else {
            const dashHeader = document.getElementById('dashboard')?.querySelector('.page-header');
            if (tiles && dashHeader) dashHeader.appendChild(tiles);
        }

        // Initialize ALL UI interactions (must match initGame)
        initNavigation();
        initQuickActions();
        initFilters();
        initModals();
        initScoutFilters();
        initTrainingButton();
        initTransferMarket();
        initScoutCriteria();
        initTacticsTabs();
        initChairmanTips();
        initPlayMatchButton();
        initSaveLoadButtons();
        initBugReports();

        // Subscribe to realtime updates BEFORE rendering (catch updates during init)
        subscribeToLeague(leagueId, {
            onStandingsChange: async () => {
                const standings = await fetchStandings(leagueId);
                if (standings.length > 0) {
                    gameState.standings = standings;
                    renderStandings();
                }
            },
            onMatchResult: (result) => {
                // Only show notification for OWN matches
                const myClubId = gameState.multiplayer?.clubId;
                if (myClubId && (result.home_club_id === myClubId || result.away_club_id === myClubId)) {
                    // Don't show if we're currently playing (we'll see it in the match report)
                    if (!multiplayerMatchInProgress) {
                        showNotification(`Uitslag: ${result.home_score}-${result.away_score}`, 'info');
                    }
                }
            },
            onTransferChange: () => {
                if (typeof renderTransferMarket === 'function') renderTransferMarket();
            },
            onFeedItem: (item) => {
                if (item.type === 'result') {
                    showNotification('Nieuwe wedstrijduitslagen beschikbaar!', 'info');
                }
            },
            onLeagueUpdate: (leagueUpdate) => {
                // DON'T immediately advance the week — another player simulated,
                // but THIS player may not have seen their result yet.
                // Store as pending; it will be picked up after the player views their match.
                if (leagueUpdate.week !== gameState.week || leagueUpdate.season !== gameState.season) {
                    if (multiplayerMatchInProgress) {
                        // During active match: ignore completely (captured week/season is used)
                        return;
                    }
                    // Store the pending advance — don't bump gameState.week yet
                    gameState._pendingLeagueWeek = leagueUpdate.week;
                    gameState._pendingLeagueSeason = leagueUpdate.season;
                    // Refresh dashboard to show updated standings
                    renderDashboardExtras();
                }
            }
        });

        // Generate youth players if none loaded (Supabase doesn't store them yet)
        if (!gameState.youthPlayers || gameState.youthPlayers.length === 0) {
            gameState.youthPlayers = [];
            if (gameState.stadium?.academy !== 'acad_0') {
                generateInitialYouthPlayers();
            }
        }

        // Apply saved club name + colors to header/badge
        updateClubDisplays();
        applyClubColors();

        // Render everything
        renderStandings();
        renderTopScorers();
        renderPlayerCards();
        updateBudgetDisplays();
        renderDashboardExtras();

        // Explicitly navigate to dashboard to ensure page is visible
        navigateToPage('dashboard');

        // Start timers (training + match timer)
        startTimers();

        // Match timer is handled by updateMatchTimer() via startTimers()

        // Start auto-save to sync
        startAutoSave();

        // Trigger onboarding for first-time multiplayer players
        if (!gameState.onboardingCompleted) {
            gameState.week = gameState.week || 1;
            gameState.matchHistory = gameState.matchHistory || [];
            setTimeout(() => showOnboarding(), 500);
        }

        console.log(`Multiplayer game loaded: league=${leagueId}, club=${clubId}`);
    } catch (err) {
        console.error('initMultiplayerGame failed:', err);
        // Even if loading failed, ensure basic UI works
        initNavigation();
        navigateToPage('dashboard');
        showNotification('Fout bij laden multiplayer. Probeer opnieuw.', 'error');
    } finally {
        _initMultiplayerRunning = false;
    }
}

// Listen for multiplayer game start
window.addEventListener('multiplayer-start', (e) => {
    initMultiplayerGame(e.detail).catch(err => {
        console.error('Multiplayer start failed:', err);
    });
});

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMultiplayerUI();

    if (isSupabaseAvailable()) {
        checkAuthAndRoute();
    } else {
        console.error('Supabase niet bereikbaar — multiplayer vereist.');
        showNotification('Kan geen verbinding maken met de server. Probeer later opnieuw.', 'error');
    }
});
