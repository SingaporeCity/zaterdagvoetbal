/**
 * ZATERDAGVOETBAL - Match Engine Module
 * Full match simulation with events, tactics impact, and player performance
 */

import { POSITIONS, TACTICS, FORMATIONS } from './constants.js';
import { random, randomFromArray } from './utils.js';

// Match event types
const EVENT_TYPES = {
    GOAL: 'goal',
    SHOT: 'shot',
    SHOT_SAVED: 'shot_saved',
    SHOT_MISSED: 'shot_missed',
    FOUL: 'foul',
    YELLOW_CARD: 'yellow_card',
    RED_CARD: 'red_card',
    INJURY: 'injury',
    SUBSTITUTION: 'substitution',
    CORNER: 'corner',
    FREE_KICK: 'free_kick',
    PENALTY: 'penalty',
    OFFSIDE: 'offside',
    CHANCE: 'chance',
    SAVE: 'save'
};

// Dutch commentary templates
const COMMENTARY = {
    goal: [
        '{player} schiet binnen! GOAL!',
        'Daar is de {minute}! {player} scoort!',
        '{player} kopt raak! Prachtige goal!',
        'En daar gaat de bal in het net! {player} maakt \'m!',
        '{player} schuift de bal beheerst binnen!',
        'Vanaf de rand van de zestien... {player} SCOORT!',
        '{player} maakt er {score} van!'
    ],
    shot_saved: [
        '{player} schiet, maar de keeper pakt \'m!',
        'Goeie redding van de keeper op het schot van {player}!',
        '{player} probeert het, maar de doelman redt!',
        'De keeper strekt zich uit en houdt het schot van {player} tegen!'
    ],
    shot_missed: [
        '{player} schiet naast!',
        'Het schot van {player} gaat over!',
        '{player} mist het doel volledig!',
        'Die had er in gemoeten! {player} schiet wild over!'
    ],
    foul: [
        'Overtreding van {player}!',
        '{player} gaat te ver door en krijgt een vrije trap tegen!',
        'De scheidsrechter fluit voor een overtreding van {player}!'
    ],
    yellow_card: [
        'Gele kaart voor {player}!',
        '{player} krijgt geel voor die actie!',
        'De scheidsrechter pakt geel voor {player}!'
    ],
    red_card: [
        'ROOD! {player} moet eruit!',
        '{player} krijgt de rode kaart! Dat is een domper!',
        'Directe rode kaart voor {player}! Ongelooflijk!'
    ],
    injury: [
        '{player} blijft liggen! Dat ziet er niet goed uit...',
        'De verzorgers komen het veld op voor {player}!',
        '{player} grijpt naar zijn been. Blessure!'
    ],
    substitution: [
        '{player} wordt gewisseld voor {sub}.',
        'Wissel: {player} eraf, {sub} erin.',
        'De trainer brengt {sub} voor {player}.'
    ],
    chance: [
        '{player} krijgt een grote kans!',
        'Daar is de kans voor {player}!',
        '{player} komt oog in oog met de keeper!'
    ],
    corner: [
        'Corner voor {team}!',
        '{player} trapt de corner!',
        'Hoekschop, genomen door {player}!'
    ],
    penalty: [
        'PENALTY! De scheidsrechter wijst naar de stip!',
        '{player} gaat achter de bal staan voor de penalty...'
    ],
    save: [
        'Geweldige redding van {player}!',
        '{player} houdt zijn ploeg op de been met een knappe save!',
        'De keeper {player} redt zijn team!'
    ],
    half_time: [
        'Rust! De stand is {homeScore}-{awayScore}.',
        'Naar de kleedkamer met een {homeScore}-{awayScore} stand!'
    ],
    full_time: [
        'Het eindsignaal klinkt! {homeScore}-{awayScore}!',
        'Einde wedstrijd: {homeScore}-{awayScore}!'
    ]
};

/**
 * Calculate team strength based on lineup, formation, and tactics
 */
export function calculateTeamStrength(lineup, formation, tactics, players) {
    if (!lineup || lineup.filter(p => p !== null).length < 11) {
        return { attack: 30, defense: 30, midfield: 30, overall: 30 };
    }

    let attack = 0;
    let defense = 0;
    let midfield = 0;
    let goalkeeper = 0;
    let totalPlayers = 0;

    const formationData = FORMATIONS[formation];
    if (!formationData) return { attack: 30, defense: 30, midfield: 30, overall: 30 };

    lineup.forEach((player, index) => {
        if (!player) return;

        const positionData = formationData.positions[index];
        if (!positionData) return;

        const positionRole = positionData.role;
        const positionGroup = POSITIONS[positionRole]?.group || 'midfielder';

        // Calculate position fit penalty/bonus
        let fitMultiplier = 1.0;
        if (player.position === positionRole) {
            fitMultiplier = 1.1; // Bonus for perfect fit
        } else if (POSITIONS[player.position]?.group === positionGroup) {
            fitMultiplier = 0.95; // Small penalty for same group
        } else {
            fitMultiplier = 0.75; // Bigger penalty for wrong group
        }

        const playerStrength = player.overall * fitMultiplier * (player.fitness / 100);

        switch (positionGroup) {
            case 'goalkeeper':
                goalkeeper += playerStrength;
                break;
            case 'defender':
                defense += playerStrength;
                break;
            case 'midfielder':
                midfield += playerStrength;
                break;
            case 'attacker':
                attack += playerStrength;
                break;
        }
        totalPlayers++;
    });

    // Normalize by typical formation distribution
    const defenderCount = Math.max(1, lineup.filter((p, i) => p && POSITIONS[formationData.positions[i]?.role]?.group === 'defender').length);
    const midfielderCount = Math.max(1, lineup.filter((p, i) => p && POSITIONS[formationData.positions[i]?.role]?.group === 'midfielder').length);
    const attackerCount = Math.max(1, lineup.filter((p, i) => p && POSITIONS[formationData.positions[i]?.role]?.group === 'attacker').length);

    defense = defense / defenderCount;
    midfield = midfield / midfielderCount;
    attack = attack / attackerCount;

    // Apply tactics modifiers
    const mentalityMod = TACTICS.mentality.find(t => t.id === tactics.mentality)?.effect || {};
    const pressingMod = TACTICS.pressing.find(t => t.id === tactics.pressing)?.effect || {};

    attack += (mentalityMod.attack || 0) / 2;
    defense += (mentalityMod.defense || 0) / 2;
    midfield += (pressingMod.pressing || 0) / 4;

    // Include goalkeeper in defense
    defense = (defense * 3 + goalkeeper) / 4;

    const overall = (attack + defense + midfield) / 3;

    return {
        attack: Math.round(Math.max(1, Math.min(99, attack))),
        defense: Math.round(Math.max(1, Math.min(99, defense))),
        midfield: Math.round(Math.max(1, Math.min(99, midfield))),
        goalkeeper: Math.round(Math.max(1, Math.min(99, goalkeeper))),
        overall: Math.round(Math.max(1, Math.min(99, overall)))
    };
}

/**
 * Generate an opponent team for the match
 */
export function generateOpponent(division, position = null) {
    const divisionNames = {
        8: ['De Zondagsrust', 'Vv Zaterdagvoetbal', 'FC Derde Helft', 'SC Bierpomp', 'VV De Kansen', 'FC Buitenspel', 'SV De Keeper', 'VV Groen Wit'],
        7: ['SC Sportief', 'VV Voorwaarts', 'FC Dynamisch', 'SV Actief', 'VV De Toekomst', 'FC Eendracht', 'SC Victoria', 'VV Sparta'],
        6: ['FC Sterken', 'VV Progressief', 'SC Ambitie', 'SV Krachtig', 'VV Klimmen', 'FC Opwaarts', 'SC Stijgers', 'VV Winnaar'],
        5: ['FC Elite', 'VV Toppers', 'SC Kampioen', 'SV Premier', 'VV De Beste', 'FC Gouden Bal', 'SC Trofee', 'VV Beker'],
        4: ['FC Professioneel', 'VV Divisie', 'SC Competitie', 'SV Liga', 'VV Klasse', 'FC Niveau', 'SC Standaard', 'VV Kwaliteit'],
        3: ['FC Sterren', 'VV Glorie', 'SC Majesteit', 'SV Koninglijk', 'VV Adellijk', 'FC Prestige', 'SC Ereklasse', 'VV Subliem'],
        2: ['FC Ajax B', 'VV Oranje', 'SC Leeuwen', 'SV Nederland', 'VV Tulp', 'FC Windmolen', 'SC Kaas', 'VV Klompen'],
        1: ['Jong Ajax', 'Jong PSV', 'Jong Feyenoord', 'Jong AZ', 'Jong Twente', 'Jong Utrecht', 'Jong Vitesse', 'Jong Heerenveen'],
        0: ['Ajax', 'PSV', 'Feyenoord', 'AZ', 'FC Twente', 'FC Utrecht', 'Vitesse', 'SC Heerenveen']
    };

    const names = divisionNames[division] || divisionNames[8];
    const name = randomFromArray(names);

    // Calculate base strength for division
    const divisionStrengths = {
        8: { base: 25, variance: 10 },
        7: { base: 35, variance: 10 },
        6: { base: 45, variance: 10 },
        5: { base: 52, variance: 10 },
        4: { base: 60, variance: 10 },
        3: { base: 68, variance: 10 },
        2: { base: 76, variance: 8 },
        1: { base: 84, variance: 6 },
        0: { base: 90, variance: 5 }
    };

    const strengthData = divisionStrengths[division] || divisionStrengths[8];
    const baseStrength = strengthData.base + random(-strengthData.variance, strengthData.variance);

    // Adjust based on league position
    let positionBonus = 0;
    if (position !== null) {
        if (position <= 2) positionBonus = 5;
        else if (position <= 4) positionBonus = 2;
        else if (position >= 7) positionBonus = -3;
    }

    return {
        name,
        strength: {
            attack: Math.min(99, baseStrength + random(-5, 5) + positionBonus),
            defense: Math.min(99, baseStrength + random(-5, 5) + positionBonus),
            midfield: Math.min(99, baseStrength + random(-5, 5) + positionBonus),
            overall: Math.min(99, baseStrength + positionBonus)
        },
        position: position || random(1, 8)
    };
}

/**
 * Simulate a single match event
 */
function simulateEvent(minute, homeStrength, awayStrength, isHome, currentScore, players) {
    const team = isHome ? 'home' : 'away';
    const strength = isHome ? homeStrength : awayStrength;
    const opposingStrength = isHome ? awayStrength : homeStrength;

    const events = [];
    const roll = Math.random() * 100;

    // Determine event type based on team strength and random factors
    const attackChance = strength.attack / (strength.attack + opposingStrength.defense) * 100;
    const chanceCreated = roll < attackChance;

    if (chanceCreated) {
        // Attack succeeds, create a chance
        const shotRoll = Math.random() * 100;
        const goalChance = (strength.attack / 2) + random(-10, 10);

        if (shotRoll < goalChance * 0.3) {
            // GOAL!
            const scorer = players ? selectScorer(players) : null;
            const assister = players && Math.random() > 0.4 ? selectAssister(players, scorer) : null;

            events.push({
                minute,
                type: EVENT_TYPES.GOAL,
                team,
                player: scorer?.name || 'Speler',
                playerId: scorer?.id,
                assist: assister?.name,
                assistId: assister?.id,
                commentary: formatCommentary('goal', {
                    player: scorer?.name || 'Speler',
                    minute: `${minute}'`,
                    score: `${currentScore.home + (isHome ? 1 : 0)}-${currentScore.away + (isHome ? 0 : 1)}`
                })
            });
        } else if (shotRoll < goalChance * 0.6) {
            // Shot saved
            const shooter = players ? selectScorer(players) : null;
            events.push({
                minute,
                type: EVENT_TYPES.SHOT_SAVED,
                team,
                player: shooter?.name || 'Speler',
                playerId: shooter?.id,
                commentary: formatCommentary('shot_saved', { player: shooter?.name || 'Speler' })
            });
        } else if (shotRoll < goalChance) {
            // Shot missed
            const shooter = players ? selectScorer(players) : null;
            events.push({
                minute,
                type: EVENT_TYPES.SHOT_MISSED,
                team,
                player: shooter?.name || 'Speler',
                playerId: shooter?.id,
                commentary: formatCommentary('shot_missed', { player: shooter?.name || 'Speler' })
            });
        }
    }

    // Random events (fouls, cards)
    if (Math.random() < 0.08) {
        const fouler = players ? randomFromArray(players.filter(p => p)) : null;
        events.push({
            minute,
            type: EVENT_TYPES.FOUL,
            team,
            player: fouler?.name || 'Speler',
            playerId: fouler?.id,
            commentary: formatCommentary('foul', { player: fouler?.name || 'Speler' })
        });

        // Chance for card
        if (Math.random() < 0.25) {
            const isRed = Math.random() < 0.05;
            events.push({
                minute,
                type: isRed ? EVENT_TYPES.RED_CARD : EVENT_TYPES.YELLOW_CARD,
                team,
                player: fouler?.name || 'Speler',
                playerId: fouler?.id,
                commentary: formatCommentary(isRed ? 'red_card' : 'yellow_card', { player: fouler?.name || 'Speler' })
            });
        }
    }

    // Rare injury event
    if (Math.random() < 0.01) {
        const injured = players ? randomFromArray(players.filter(p => p)) : null;
        events.push({
            minute,
            type: EVENT_TYPES.INJURY,
            team,
            player: injured?.name || 'Speler',
            playerId: injured?.id,
            commentary: formatCommentary('injury', { player: injured?.name || 'Speler' })
        });
    }

    return events;
}

/**
 * Select a likely scorer from the lineup
 */
function selectScorer(players) {
    const validPlayers = players.filter(p => p !== null);
    if (validPlayers.length === 0) return null;

    // Weight towards attackers and players with high AAN
    const weights = validPlayers.map(p => {
        let weight = 1;
        const group = POSITIONS[p.position]?.group;
        if (group === 'attacker') weight += 4;
        else if (group === 'midfielder') weight += 2;
        weight += (p.attributes?.AAN || 50) / 25;
        return weight;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < validPlayers.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return validPlayers[i];
    }

    return validPlayers[0];
}

/**
 * Select a likely assister (different from scorer)
 */
function selectAssister(players, scorer) {
    const validPlayers = players.filter(p => p !== null && p.id !== scorer?.id);
    if (validPlayers.length === 0) return null;

    // Weight towards midfielders and wingers
    const weights = validPlayers.map(p => {
        let weight = 1;
        const group = POSITIONS[p.position]?.group;
        if (group === 'midfielder') weight += 3;
        else if (group === 'attacker') weight += 2;
        weight += (p.attributes?.SNE || 50) / 30;
        return weight;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < validPlayers.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return validPlayers[i];
    }

    return validPlayers[0];
}

/**
 * Format commentary with placeholders
 */
function formatCommentary(type, vars) {
    const templates = COMMENTARY[type];
    if (!templates || templates.length === 0) return '';

    let text = randomFromArray(templates);
    for (const [key, value] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return text;
}

/**
 * Simulate a full match
 */
export function simulateMatch(homeTeam, awayTeam, homeLineup, formation, tactics, isHomeGame = true) {
    const result = {
        homeTeam: isHomeGame ? homeTeam : awayTeam,
        awayTeam: isHomeGame ? awayTeam : homeTeam,
        homeScore: 0,
        awayScore: 0,
        events: [],
        playerRatings: {},
        manOfTheMatch: null,
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        cards: { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } }
    };

    // Calculate team strengths
    const homeStrength = isHomeGame
        ? calculateTeamStrength(homeLineup, formation, tactics, homeLineup)
        : awayTeam.strength;
    const awayStrength = isHomeGame
        ? awayTeam.strength
        : calculateTeamStrength(homeLineup, formation, tactics, homeLineup);

    // Home advantage
    homeStrength.attack += 3;
    homeStrength.defense += 3;

    // Calculate possession based on midfield strength
    const totalMidfield = homeStrength.midfield + awayStrength.midfield;
    result.possession.home = Math.round((homeStrength.midfield / totalMidfield) * 100);
    result.possession.away = 100 - result.possession.home;

    // Initialize player ratings
    if (homeLineup) {
        homeLineup.filter(p => p).forEach(player => {
            result.playerRatings[player.id] = {
                player,
                rating: 6.0 + (Math.random() - 0.5),
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0
            };
        });
    }

    // Simulate match minute by minute with key moments
    const keyMinutes = generateKeyMinutes();

    for (const minute of keyMinutes) {
        const currentScore = { home: result.homeScore, away: result.awayScore };

        // Determine which team has possession this minute
        const possessionRoll = Math.random() * 100;
        const isHomePossession = possessionRoll < result.possession.home;

        const events = simulateEvent(
            minute,
            homeStrength,
            awayStrength,
            isHomePossession,
            currentScore,
            isHomePossession && isHomeGame ? homeLineup : null
        );

        for (const event of events) {
            result.events.push(event);

            // Update statistics
            const team = event.team;

            if (event.type === EVENT_TYPES.GOAL) {
                if (team === 'home') result.homeScore++;
                else result.awayScore++;
                result.shots[team]++;
                result.shotsOnTarget[team]++;

                // Update player stats
                if (event.playerId && result.playerRatings[event.playerId]) {
                    result.playerRatings[event.playerId].goals++;
                    result.playerRatings[event.playerId].rating += 1.0;
                }
                if (event.assistId && result.playerRatings[event.assistId]) {
                    result.playerRatings[event.assistId].assists++;
                    result.playerRatings[event.assistId].rating += 0.5;
                }
            } else if (event.type === EVENT_TYPES.SHOT_SAVED) {
                result.shots[team]++;
                result.shotsOnTarget[team]++;
            } else if (event.type === EVENT_TYPES.SHOT_MISSED) {
                result.shots[team]++;
            } else if (event.type === EVENT_TYPES.FOUL) {
                result.fouls[team]++;
            } else if (event.type === EVENT_TYPES.YELLOW_CARD) {
                result.cards[team].yellow++;
                if (event.playerId && result.playerRatings[event.playerId]) {
                    result.playerRatings[event.playerId].yellowCards++;
                    result.playerRatings[event.playerId].rating -= 0.5;
                }
            } else if (event.type === EVENT_TYPES.RED_CARD) {
                result.cards[team].red++;
                if (event.playerId && result.playerRatings[event.playerId]) {
                    result.playerRatings[event.playerId].redCards++;
                    result.playerRatings[event.playerId].rating -= 2.0;
                }
            }
        }

        // Add half-time event
        if (minute === 45) {
            result.events.push({
                minute: 45,
                type: 'half_time',
                commentary: formatCommentary('half_time', {
                    homeScore: result.homeScore,
                    awayScore: result.awayScore
                })
            });
        }
    }

    // Add full-time event
    result.events.push({
        minute: 90,
        type: 'full_time',
        commentary: formatCommentary('full_time', {
            homeScore: result.homeScore,
            awayScore: result.awayScore
        })
    });

    // Determine man of the match
    let bestRating = 0;
    let motm = null;
    for (const [id, data] of Object.entries(result.playerRatings)) {
        // Clamp ratings
        data.rating = Math.max(4.0, Math.min(10.0, data.rating));

        if (data.rating > bestRating) {
            bestRating = data.rating;
            motm = data.player;
        }
    }
    result.manOfTheMatch = motm;

    return result;
}

/**
 * Generate key minutes where events can happen
 */
function generateKeyMinutes() {
    const minutes = [];

    // First half
    for (let i = 1; i <= 45; i++) {
        if (Math.random() < 0.35) { // ~35% chance each minute has action
            minutes.push(i);
        }
    }

    // Second half
    for (let i = 46; i <= 90; i++) {
        if (Math.random() < 0.35) {
            minutes.push(i);
        }
    }

    // Ensure some minimum number of events
    while (minutes.length < 15) {
        const newMinute = random(1, 90);
        if (!minutes.includes(newMinute)) {
            minutes.push(newMinute);
        }
    }

    return minutes.sort((a, b) => a - b);
}

/**
 * Get match result type
 */
export function getMatchResultType(homeScore, awayScore, isHomeTeam) {
    const playerScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;

    if (playerScore > opponentScore) return 'win';
    if (playerScore < opponentScore) return 'loss';
    return 'draw';
}

/**
 * Calculate points from match result
 */
export function getMatchPoints(resultType) {
    switch (resultType) {
        case 'win': return 3;
        case 'draw': return 1;
        case 'loss': return 0;
        default: return 0;
    }
}

/**
 * Apply match results to player stats
 */
export function applyMatchResults(players, matchResult, isHomeGame) {
    const team = isHomeGame ? 'home' : 'away';
    const won = (isHomeGame && matchResult.homeScore > matchResult.awayScore) ||
                (!isHomeGame && matchResult.awayScore > matchResult.homeScore);
    const drew = matchResult.homeScore === matchResult.awayScore;

    players.forEach(player => {
        if (!player) return;

        const rating = matchResult.playerRatings[player.id];
        if (!rating) return;

        // Update goals and assists
        player.goals = (player.goals || 0) + rating.goals;
        player.assists = (player.assists || 0) + rating.assists;

        // Update morale based on result and personal performance
        let moraleDelta = 0;
        if (won) moraleDelta += 5;
        else if (drew) moraleDelta += 1;
        else moraleDelta -= 3;

        if (rating.rating >= 8.0) moraleDelta += 3;
        else if (rating.rating >= 7.0) moraleDelta += 1;
        else if (rating.rating < 5.5) moraleDelta -= 2;

        player.morale = Math.max(20, Math.min(100, (player.morale || 70) + moraleDelta));

        // Reduce fitness from playing
        player.fitness = Math.max(50, (player.fitness || 90) - random(5, 15));

        // Reduce energy
        player.energy = Math.max(30, (player.energy || 80) - random(10, 25));
    });
}

/**
 * Format match result for display
 */
export function formatMatchResult(matchResult) {
    return {
        score: `${matchResult.homeScore} - ${matchResult.awayScore}`,
        homeTeam: matchResult.homeTeam?.name || 'Thuis',
        awayTeam: matchResult.awayTeam?.name || 'Uit',
        events: matchResult.events,
        stats: {
            possession: matchResult.possession,
            shots: matchResult.shots,
            shotsOnTarget: matchResult.shotsOnTarget,
            fouls: matchResult.fouls,
            cards: matchResult.cards
        },
        manOfTheMatch: matchResult.manOfTheMatch,
        playerRatings: matchResult.playerRatings
    };
}
