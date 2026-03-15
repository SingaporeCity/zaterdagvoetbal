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
export function calculateTeamStrength(lineup, formation, tactics, players, options = {}) {
    const filledCount = lineup ? lineup.filter(p => p !== null).length : 0;
    if (!lineup || filledCount === 0) {
        return { attack: 1, defense: 1, midfield: 1, overall: 1 };
    }

    let attack = 0;
    let defense = 0;
    let midfield = 0;
    let goalkeeper = 0;
    let totalPlayers = 0;

    // Track individual strengths per line for star player impact
    const lineStrengths = { defender: [], midfielder: [], attacker: [] };

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

        // Energy factor: 100% = ×1.0, 50% = ×0.67 (ovr 6→4), 0% = ×0.33
        const energyFactor = 0.333 + ((player.energy || 100) / 100) * 0.667;
        const playerStrength = player.overall * fitMultiplier * energyFactor;

        switch (positionGroup) {
            case 'goalkeeper':
                goalkeeper += playerStrength;
                break;
            case 'defender':
                defense += playerStrength;
                lineStrengths.defender.push(playerStrength);
                break;
            case 'midfielder':
                midfield += playerStrength;
                lineStrengths.midfielder.push(playerStrength);
                break;
            case 'attacker':
                attack += playerStrength;
                lineStrengths.attacker.push(playerStrength);
                break;
        }
        totalPlayers++;
    });

    // Star player impact: lineStrength = average * 0.8 + best * 0.2
    const calcLineStrength = (strengths) => {
        if (strengths.length === 0) return 0;
        const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        const best = Math.max(...strengths);
        return avg * 0.8 + best * 0.2;
    };

    defense = calcLineStrength(lineStrengths.defender) || defense;
    midfield = calcLineStrength(lineStrengths.midfielder) || midfield;
    attack = calcLineStrength(lineStrengths.attacker) || attack;

    // Apply tactics modifiers (5 dimensions)
    const offensiefMod = TACTICS.offensief.find(t => t.id === tactics.offensief)?.effect || {};
    const tempoMod = TACTICS.speltempo.find(t => t.id === tactics.speltempo)?.effect || {};
    const breedteMod = TACTICS.veldbreedte.find(t => t.id === tactics.veldbreedte)?.effect || {};
    const dekkingMod = TACTICS.dekking.find(t => t.id === tactics.dekking)?.effect || {};

    // Offensief → attack/defense balance
    attack += (offensiefMod.attack || 0) / 2;
    defense += (offensiefMod.defense || 0) / 2;
    // Speltempo → midfield control
    midfield += (tempoMod.control || 0) / 4;
    // Veldbreedte → attack creativity
    attack += (breedteMod.wide || 0) / 4;
    // Dekking → defensive pressing
    defense += (dekkingMod.pressing || 0) / 4;

    // Team training bonus
    const teamTrainingBonus = options.teamTrainingBonus;
    if (teamTrainingBonus) {
        if (teamTrainingBonus.type === 'attack') attack += teamTrainingBonus.value / 2;
        if (teamTrainingBonus.type === 'defense') defense += teamTrainingBonus.value / 2;
    }

    // Formation drive: 0% = ×0.90 (-10%), 100% = ×1.0 (no penalty)
    const formationDrive = options.formationDrive ?? 100;
    const driveMultiplier = 0.90 + (formationDrive / 100) * 0.10;
    attack *= driveMultiplier;
    defense *= driveMultiplier;
    midfield *= driveMultiplier;

    // Include goalkeeper in defense
    defense = (defense * 3 + goalkeeper) / 4;

    // Penalty for missing players: each empty slot = ~9% weaker (1/11)
    if (filledCount < 11) {
        const missingPenalty = filledCount / 11;
        attack *= missingPenalty;
        defense *= missingPenalty;
        midfield *= missingPenalty;
    }

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
        8: { base: 5, variance: 2 },
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
        roster: generateOpponentRoster(),
        position: position || random(1, 8)
    };
}

// Dutch player name pool for opponent teams
const OPPONENT_FIRST = ['Jan', 'Pieter', 'Klaas', 'Henk', 'Willem', 'Sander', 'Daan', 'Tim', 'Lars', 'Tom', 'Bas', 'Kevin', 'Mike', 'Rick', 'Ruben', 'Jesse', 'Mark', 'Joost', 'Thijs', 'Niels', 'Stijn', 'Bram', 'Luuk', 'Wouter', 'Jeroen', 'Dennis', 'Stefan', 'Marco', 'Patrick', 'Roy'];
const OPPONENT_LAST = ['de Jong', 'Jansen', 'de Vries', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Vermeer', 'Kok', 'van den Berg', 'Willems', 'Scholten', 'van der Linden', 'Kuipers', 'Prins', 'Wolters', 'Hoekstra'];

function generateOpponentRoster() {
    const used = new Set();
    const roster = [];
    for (let i = 0; i < 11; i++) {
        let name;
        do {
            name = randomFromArray(OPPONENT_LAST);
        } while (used.has(name));
        used.add(name);
        roster.push({ name, id: 'opp_' + i });
    }
    return roster;
}

/**
 * Simulate a single match event
 */
function simulateEvent(minute, homeStrength, awayStrength, isHome, currentScore, players, tactics) {
    const team = isHome ? 'home' : 'away';
    const strength = isHome ? homeStrength : awayStrength;
    const opposingStrength = isHome ? awayStrength : homeStrength;

    const events = [];
    const roll = Math.random() * 100;

    // Determine event type based on team strength and random factors
    // Minimum 30% chance creation even for weak teams — kelderklasse is chaotic
    const attackChance = Math.max(30, strength.attack / (strength.attack + opposingStrength.defense * 1.1) * 100);
    const chanceCreated = roll < attackChance;

    // Chaos factor — kelderklasse: anything can happen (lucky goal without a real chance)
    if (!chanceCreated && Math.random() < 0.05) {
        const luckyScorer = players ? selectScorer(players) : null;
        events.push({
            minute,
            type: EVENT_TYPES.GOAL,
            team,
            player: luckyScorer?.name || 'Speler',
            playerId: luckyScorer?.id,
            commentary: formatCommentary('goal', {
                player: luckyScorer?.name || 'Speler',
                minute: `${minute}'`,
                score: `${currentScore.home + (isHome ? 1 : 0)}-${currentScore.away + (isHome ? 0 : 1)}`
            })
        });
        return events;
    }

    if (chanceCreated) {
        // Direct goal probability based on attack vs defense advantage
        // Equal teams: ~25% goal, mismatch: up to 45%, underdog: down to 5%
        const shotRoll = Math.random() * 100;
        const attackAdvantage = strength.attack - opposingStrength.defense;
        const goalProb = Math.max(5, Math.min(45, 25 + attackAdvantage * 1.0));

        if (shotRoll < goalProb) {
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
        } else if (shotRoll < goalProb + 25) {
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
        } else {
            // Shot missed — kelderklasse: wild shots are common
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

    // Random events (fouls, cards) — influenced by mentaliteit
    const mentaliteitMod = tactics ? (TACTICS.mentaliteit.find(t => t.id === tactics.mentaliteit)?.effect || {}) : {};
    const foulChance = 0.08 + (mentaliteitMod.foulChance || 0);
    const cardMultiplier = 1 + (mentaliteitMod.cardChance || 0);

    if (Math.random() < foulChance) {
        const fouler = players ? randomFromArray(players.filter(p => p)) : null;
        events.push({
            minute,
            type: EVENT_TYPES.FOUL,
            team,
            player: fouler?.name || 'Speler',
            playerId: fouler?.id,
            commentary: formatCommentary('foul', { player: fouler?.name || 'Speler' })
        });

        // Chance for card (scaled by mentaliteit)
        if (Math.random() < 0.25 * cardMultiplier) {
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
export function simulateMatch(homeTeam, awayTeam, homeLineup, formation, tactics, isHomeGame = true, options = {}) {
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
        cards: { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } },
        xG: { home: 0.05, away: 0.05 }
    };

    // Use pre-calculated strengths (options like formationDrive/teamTraining are already baked in)
    const homeStrength = isHomeGame ? { ...homeTeam.strength } : { ...awayTeam.strength };
    const awayStrength = isHomeGame ? { ...awayTeam.strength } : { ...homeTeam.strength };

    // Player bonus vs AI — gives a slight edge to the human player
    if (options.playerTeamBonus) {
        const pb = options.playerTeamBonus;
        if (isHomeGame) {
            homeStrength.attack = Math.round(homeStrength.attack * pb);
            homeStrength.defense = Math.round(homeStrength.defense * pb);
            homeStrength.midfield = Math.round(homeStrength.midfield * pb);
        } else {
            awayStrength.attack = Math.round(awayStrength.attack * pb);
            awayStrength.defense = Math.round(awayStrength.defense * pb);
            awayStrength.midfield = Math.round(awayStrength.midfield * pb);
        }
    }

    // Spy bonus — scouting the opponent gives a tactical edge
    const spyBonus = options.spyBonus || 0;
    if (spyBonus > 0) {
        const spyMultiplier = 1 + spyBonus * 0.01; // +3 → ×1.03
        if (isHomeGame) {
            homeStrength.attack = Math.round(homeStrength.attack * spyMultiplier);
            homeStrength.defense = Math.round(homeStrength.defense * spyMultiplier);
            homeStrength.midfield = Math.round(homeStrength.midfield * spyMultiplier);
        } else {
            awayStrength.attack = Math.round(awayStrength.attack * spyMultiplier);
            awayStrength.defense = Math.round(awayStrength.defense * spyMultiplier);
            awayStrength.midfield = Math.round(awayStrength.midfield * spyMultiplier);
        }
    }

    // Specialists bonus — captain and set piece takers
    const specialists = options.specialists || {};
    const filledLineup = homeLineup ? homeLineup.filter(p => p) : [];
    const lineupIds = filledLineup.map(p => String(p.id));

    // Captain: must be 30+ years old for bonus (experience = leadership)
    if (specialists.captain && lineupIds.includes(String(specialists.captain))) {
        const captain = filledLineup.find(p => String(p.id) === String(specialists.captain));
        if (captain && (captain.age || 0) >= 30) {
            const captainBonus = 1.05; // +5% team boost
            if (isHomeGame) {
                homeStrength.attack = Math.round(homeStrength.attack * captainBonus);
                homeStrength.defense = Math.round(homeStrength.defense * captainBonus);
                homeStrength.midfield = Math.round(homeStrength.midfield * captainBonus);
            } else {
                awayStrength.attack = Math.round(awayStrength.attack * captainBonus);
                awayStrength.defense = Math.round(awayStrength.defense * captainBonus);
                awayStrength.midfield = Math.round(awayStrength.midfield * captainBonus);
            }
        }
    }

    // Set piece specialists: +2% attack each
    // Freekick: only counts if taker is the attacker/midfielder with highest potential
    let setPieceBonus = 0;
    ['cornerTaker', 'penaltyTaker'].forEach(role => {
        if (specialists[role] && lineupIds.includes(String(specialists[role]))) {
            setPieceBonus += 0.02;
        }
    });
    // Freekick: validate that taker is the highest-potential attacker/midfielder
    if (specialists.freekickTaker && lineupIds.includes(String(specialists.freekickTaker))) {
        const attackMidGroups = ['attacker', 'midfielder'];
        const attackMids = filledLineup.filter(p => {
            const group = POSITIONS[p.position]?.group;
            return attackMidGroups.includes(group);
        });
        if (attackMids.length > 0) {
            const bestStars = Math.max(...attackMids.map(p => p.stars || 0));
            const taker = filledLineup.find(p => String(p.id) === String(specialists.freekickTaker));
            if (taker && (taker.stars || 0) >= bestStars) {
                setPieceBonus += 0.02;
            }
        }
    }
    if (setPieceBonus > 0) {
        if (isHomeGame) {
            homeStrength.attack = Math.round(homeStrength.attack * (1 + setPieceBonus));
        } else {
            awayStrength.attack = Math.round(awayStrength.attack * (1 + setPieceBonus));
        }
    }

    // Mentaliteit — affects strength balance (not just fouls/cards)
    const mentaliteitId = tactics?.mentaliteit || 'normaal';
    const mentaliteitStrength = { rustig: { attack: -1, defense: 2 }, normaal: { attack: 0, defense: 0 }, hard: { attack: 1.5, defense: -1 }, extreem: { attack: 3, defense: -3 } };
    const mentMod = mentaliteitStrength[mentaliteitId] || { attack: 0, defense: 0 };
    if (isHomeGame) {
        homeStrength.attack += mentMod.attack;
        homeStrength.defense += mentMod.defense;
    } else {
        awayStrength.attack += mentMod.attack;
        awayStrength.defense += mentMod.defense;
    }

    // Home advantage — percentage-based, scales with grass level
    const grassLevel = options.grassLevel || 0;
    const homeMultiplier = 1.06 + grassLevel * 0.01;
    homeStrength.attack = Math.round(homeStrength.attack * homeMultiplier);
    homeStrength.defense = Math.round(homeStrength.defense * homeMultiplier);
    homeStrength.midfield = Math.round(homeStrength.midfield * (1 + (homeMultiplier - 1) * 0.5));

    // Calculate possession based on midfield strength (guard against division by zero)
    const totalMidfield = homeStrength.midfield + awayStrength.midfield;
    if (totalMidfield > 0) {
        result.possession.home = Math.round((homeStrength.midfield / totalMidfield) * 100);
        result.possession.away = 100 - result.possession.home;
    } else {
        result.possession.home = 50;
        result.possession.away = 50;
    }

    // Initialize player ratings — base influenced by player quality + random match performance
    if (homeLineup) {
        homeLineup.filter(p => p).forEach(player => {
            const quality = Math.min(1, Math.max(0, (player.overall || 50) / 100));
            const perf = (Math.random() + Math.random()) / 2; // 0-1, centered around 0.5
            const base = 3.5 + quality * 1.5 + perf * 2.5;
            result.playerRatings[player.id] = {
                player,
                rating: base,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0
            };
        });
    }

    // === Voorbeschouwing (pre-match commentary by chairman) ===
    const playerTeamName = isHomeGame ? homeTeam.name : awayTeam.name;
    const opponentTeamName = isHomeGame ? awayTeam.name : homeTeam.name;
    const playerStrength = isHomeGame ? homeStrength : awayStrength;
    const oppStrength = isHomeGame ? awayStrength : homeStrength;
    const playerOverall = (playerStrength.attack + playerStrength.defense + playerStrength.midfield) / 3;
    const oppOverall = (oppStrength.attack + oppStrength.defense + oppStrength.midfield) / 3;
    const filledSlots = homeLineup ? homeLineup.filter(p => p !== null).length : 0;

    // Weather based on grass level
    const grass = options.grassLevel || 0;
    const weatherLines = [
        'Het regent pijpenstelen vandaag — het veld is doorweekt!',
        'Bewolkt met af en toe een bui. Typisch Nederlands weer.',
        'Het is fris maar droog. Prima voetbalweer!',
        'Heerlijk weer vandaag! De zon schijnt volop.',
        'Stralend weer, het veld ligt er perfect bij!',
    ];
    const weatherLine = grass <= 1 ? randomFromArray(weatherLines.slice(0, 2))
        : grass <= 4 ? randomFromArray(weatherLines.slice(1, 3))
        : grass <= 7 ? randomFromArray(weatherLines.slice(2, 4))
        : randomFromArray(weatherLines.slice(3));

    // Strength comparison
    let strengthLine;
    const diff = playerOverall - oppOverall;
    if (diff > 10) strengthLine = `Op papier zijn wij duidelijk de sterkere ploeg. Dit moeten we winnen!`;
    else if (diff > 3) strengthLine = `We lijken iets sterker dan ${opponentTeamName}. Maar onderschat ze niet!`;
    else if (diff > -3) strengthLine = `Dit wordt een gelijkwaardige wedstrijd. Het kan alle kanten op.`;
    else if (diff > -10) strengthLine = `${opponentTeamName} lijkt sterker dan ons. We zullen ons beste beentje voor moeten zetten.`;
    else strengthLine = `${opponentTeamName} is veel sterker. Dit wordt een zware klus, maar in het zaterdagvoetbal kan alles!`;

    // Incomplete lineup
    let lineupLine = '';
    if (filledSlots < 11) {
        const missing = 11 - filledSlots;
        if (missing === 1) lineupLine = 'We staan met 10 man op het veld. Dat wordt zwaar, maar het is niet onmogelijk!';
        else if (missing <= 3) lineupLine = `We missen ${missing} spelers in de opstelling. Dat is een flinke handicap...`;
        else lineupLine = `Met maar ${filledSlots} spelers beginnen? Dit wordt een hels karwei!`;
    }

    // Tactics comment
    const tacticsOffensief = tactics?.offensief || 'gebalanceerd';
    const tacticsData = { zeer_verdedigend: 'zeer verdedigend', verdedigend: 'verdedigend', gebalanceerd: 'gebalanceerd', offensief: 'offensief', leeroy: 'vol in de aanval — Leeroy Jenkins-stijl' };
    const tacticsLine = `We spelen vandaag ${tacticsData[tacticsOffensief] || 'gebalanceerd'}. Laten we hopen dat het werkt!`;

    // Build voorbeschouwing events
    result.events.push({ minute: 0, type: 'preview', commentary: `📋 Voorbeschouwing — ${playerTeamName} vs ${opponentTeamName}` });
    result.events.push({ minute: 0, type: 'preview', commentary: `🌤️ ${weatherLine}` });
    result.events.push({ minute: 0, type: 'preview', commentary: `📊 ${strengthLine}` });
    if (lineupLine) result.events.push({ minute: 0, type: 'preview', commentary: `⚠️ ${lineupLine}` });
    result.events.push({ minute: 0, type: 'preview', commentary: `⚽ ${tacticsLine}` });
    result.events.push({ minute: 0, type: 'preview', commentary: '🏁 De scheidsrechter fluit — de wedstrijd begint!' });

    // Simulate match minute by minute with key moments
    const keyMinutes = generateKeyMinutes();

    for (const minute of keyMinutes) {
        const currentScore = { home: result.homeScore, away: result.awayScore };

        // Determine which team has possession this minute
        const possessionRoll = Math.random() * 100;
        const isHomePossession = possessionRoll < result.possession.home;

        // Pass lineup for whichever team has possession
        const isPlayerPossession = (isHomePossession && isHomeGame) || (!isHomePossession && !isHomeGame);
        const opponentTeam = isHomeGame ? awayTeam : homeTeam;
        const events = simulateEvent(
            minute,
            homeStrength,
            awayStrength,
            isHomePossession,
            currentScore,
            isPlayerPossession ? homeLineup : (opponentTeam.roster || null),
            isPlayerPossession ? tactics : null
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
                result.xG[team] += 0.35;

                // Update player stats
                if (event.playerId && result.playerRatings[event.playerId]) {
                    result.playerRatings[event.playerId].goals++;
                    result.playerRatings[event.playerId].rating += 1.5;
                }
                if (event.assistId && result.playerRatings[event.assistId]) {
                    result.playerRatings[event.assistId].assists++;
                    result.playerRatings[event.assistId].rating += 1.0;
                }
            } else if (event.type === EVENT_TYPES.SHOT_SAVED) {
                result.shots[team]++;
                result.shotsOnTarget[team]++;
                result.xG[team] += 0.12;
            } else if (event.type === EVENT_TYPES.SHOT_MISSED) {
                result.shots[team]++;
                result.xG[team] += 0.06;
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
        // Round and clamp ratings to 2-9
        data.rating = Math.max(2, Math.min(9, Math.round(data.rating)));

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

    // First half — 40% chance per minute for more action
    for (let i = 1; i <= 45; i++) {
        if (Math.random() < 0.40) {
            minutes.push(i);
        }
    }

    // Second half — 40% chance, slightly more hectic
    for (let i = 46; i <= 90; i++) {
        if (Math.random() < 0.40) {
            minutes.push(i);
        }
    }

    // Ensure minimum 20 key moments for a spectaculair match
    while (minutes.length < 20) {
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
export function applyMatchResults(players, matchResult, isHomeGame, currentWeek) {
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

        // Reduce energy
        player.energy = Math.max(30, (player.energy || 80) - random(10, 25));

        // Team samenhang: increment matchesTogether for lineup players
        player.matchesTogether = (player.matchesTogether || 0) + 1;

        // Track cards
        player.yellowCards = (player.yellowCards || 0) + (rating.yellowCards || 0);
        player.redCards = (player.redCards || 0) + (rating.redCards || 0);

        // Red card → 2 match suspension
        if (rating.redCards > 0) {
            player.suspendedUntil = currentWeek + 2;
        }
        // 5 yellows → 1 match suspension, reset
        if (player.yellowCards >= 5) {
            player.suspendedUntil = currentWeek + 1;
            player.yellowCards = 0;
        }

        // Injury events
        const injuryEvent = matchResult.events.find(e =>
            e.type === 'injury' && e.playerId === player.id && e.team === team
        );
        if (injuryEvent) {
            const duration = 1 + Math.floor(Math.random() * 5);
            player.injuredUntil = currentWeek + duration;
            player.injuryDuration = duration;
        }
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
