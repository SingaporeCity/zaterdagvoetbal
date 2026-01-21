/**
 * ZATERDAGVOETBAL - Random Events Module
 * Dynamic events that add unpredictability and Dutch amateur football flavor
 */

import { random, randomFromArray } from './utils.js';

// Event categories
const EVENT_CATEGORIES = {
    PLAYER: 'player',
    STAFF: 'staff',
    STADIUM: 'stadium',
    FINANCIAL: 'financial',
    YOUTH: 'youth',
    MATCH: 'match',
    DUTCH: 'dutch' // Special Dutch amateur football events
};

// Event severity/impact
const SEVERITY = {
    MINOR: 'minor',
    MODERATE: 'moderate',
    MAJOR: 'major'
};

// All random events
const EVENTS = {
    // Player events
    playerInjuryTraining: {
        id: 'playerInjuryTraining',
        category: EVENT_CATEGORIES.PLAYER,
        severity: SEVERITY.MODERATE,
        title: 'Blessure op Training',
        getMessage: (data) => `${data.player.name} heeft zich geblesseerd tijdens de training! Hij is ${data.weeks} weken uit de roulatie.`,
        icon: '🏥',
        probability: 0.03,
        condition: (state) => state.players.length > 0,
        choices: [
            {
                text: 'Laat hem rusten',
                effect: (state, data) => {
                    data.player.injured = true;
                    data.player.injuryWeeks = data.weeks;
                    data.player.fitness = Math.max(30, data.player.fitness - 20);
                }
            },
            {
                text: 'Versneld hersteltraject (€500)',
                effect: (state, data) => {
                    if (state.club.budget >= 500) {
                        state.club.budget -= 500;
                        data.player.injured = true;
                        data.player.injuryWeeks = Math.max(1, data.weeks - 1);
                    }
                },
                condition: (state) => state.club.budget >= 500
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.players),
            weeks: random(1, 4)
        })
    },

    playerFormDrop: {
        id: 'playerFormDrop',
        category: EVENT_CATEGORIES.PLAYER,
        severity: SEVERITY.MINOR,
        title: 'Vormcrisis',
        getMessage: (data) => `${data.player.name} heeft een moeilijke periode. Zijn moraal is gedaald.`,
        icon: '📉',
        probability: 0.04,
        condition: (state) => state.players.length > 0,
        choices: [
            {
                text: 'Geef hem een peptalk',
                effect: (state, data) => {
                    data.player.morale = Math.max(30, data.player.morale - 10);
                }
            },
            {
                text: 'Laat hem even op de bank',
                effect: (state, data) => {
                    data.player.morale = Math.max(40, data.player.morale - 5);
                }
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.players.filter(p => p.morale > 50))
        })
    },

    playerDemandRaise: {
        id: 'playerDemandRaise',
        category: EVENT_CATEGORIES.PLAYER,
        severity: SEVERITY.MODERATE,
        title: 'Salarisverhoging Gevraagd',
        getMessage: (data) => `${data.player.name} wil een salarisverhoging van ${data.raise}% (€${data.newSalary - data.player.salary}/week extra).`,
        icon: '💰',
        probability: 0.02,
        condition: (state) => state.players.some(p => p.overall >= 50),
        choices: [
            {
                text: 'Akkoord',
                effect: (state, data) => {
                    data.player.salary = data.newSalary;
                    data.player.morale = Math.min(100, data.player.morale + 10);
                }
            },
            {
                text: 'Weigeren',
                effect: (state, data) => {
                    data.player.morale = Math.max(20, data.player.morale - 20);
                }
            },
            {
                text: 'Onderhandelen (50% verhoging)',
                effect: (state, data) => {
                    data.player.salary = Math.round(data.player.salary * 1.1);
                    data.player.morale = Math.min(100, data.player.morale + 3);
                }
            }
        ],
        getData: (state) => {
            const player = randomFromArray(state.players.filter(p => p.overall >= 50));
            const raise = random(10, 30);
            return {
                player,
                raise,
                newSalary: Math.round(player.salary * (1 + raise / 100))
            };
        }
    },

    playerBreakthrough: {
        id: 'playerBreakthrough',
        category: EVENT_CATEGORIES.PLAYER,
        severity: SEVERITY.MAJOR,
        title: 'Doorbraak!',
        getMessage: (data) => `${data.player.name} heeft een geweldige week gehad! Zijn attributes zijn verbeterd.`,
        icon: '🌟',
        probability: 0.01,
        condition: (state) => state.players.some(p => p.age <= 23 && p.overall < p.potential - 5),
        choices: [
            {
                text: 'Fantastisch!',
                effect: (state, data) => {
                    // Boost random attributes
                    const attrs = Object.keys(data.player.attributes);
                    for (let i = 0; i < 2; i++) {
                        const attr = randomFromArray(attrs);
                        data.player.attributes[attr] = Math.min(99, data.player.attributes[attr] + random(2, 4));
                    }
                    // Recalculate overall
                    data.player.overall = Math.min(99, data.player.overall + random(1, 3));
                    data.player.morale = Math.min(100, data.player.morale + 15);
                }
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.players.filter(p => p.age <= 23 && p.overall < p.potential - 5))
        })
    },

    // Stadium events
    stadiumVandalism: {
        id: 'stadiumVandalism',
        category: EVENT_CATEGORIES.STADIUM,
        severity: SEVERITY.MODERATE,
        title: 'Vandalisme',
        getMessage: (data) => `Vandalen hebben schade aangericht aan je stadion. Reparatiekosten: €${data.cost}.`,
        icon: '🔨',
        probability: 0.015,
        condition: (state) => state.stadium.capacity > 500,
        choices: [
            {
                text: 'Repareren',
                effect: (state, data) => {
                    state.club.budget -= data.cost;
                }
            },
            {
                text: 'Laten zitten (reputatie -5)',
                effect: (state, data) => {
                    state.club.reputation = Math.max(1, state.club.reputation - 5);
                }
            }
        ],
        getData: (state) => ({
            cost: random(200, 1000)
        })
    },

    stadiumWeatherDamage: {
        id: 'stadiumWeatherDamage',
        category: EVENT_CATEGORIES.STADIUM,
        severity: SEVERITY.MINOR,
        title: 'Stormschade',
        getMessage: (data) => `Een storm heeft schade aangericht aan het dak van de tribune. Kosten: €${data.cost}.`,
        icon: '🌧️',
        probability: 0.02,
        condition: (state) => true,
        choices: [
            {
                text: 'Direct repareren',
                effect: (state, data) => {
                    state.club.budget -= data.cost;
                }
            }
        ],
        getData: (state) => ({
            cost: random(100, 500)
        })
    },

    // Financial events
    sponsorOffer: {
        id: 'sponsorOffer',
        category: EVENT_CATEGORIES.FINANCIAL,
        severity: SEVERITY.MAJOR,
        title: 'Sponsoraanbod',
        getMessage: (data) => `${data.sponsorName} wil je club sponsoren met €${data.amount} per week!`,
        icon: '🤝',
        probability: 0.01,
        condition: (state) => state.club.reputation >= 30,
        choices: [
            {
                text: 'Accepteren',
                effect: (state, data) => {
                    state.club.budget += data.amount * 4; // 4 weeks bonus
                    if (!state.extraSponsors) state.extraSponsors = [];
                    state.extraSponsors.push({
                        name: data.sponsorName,
                        weeklyIncome: data.amount
                    });
                }
            },
            {
                text: 'Afwijzen',
                effect: () => {}
            }
        ],
        getData: (state) => ({
            sponsorName: randomFromArray([
                'Lokale Bakkerij', 'Autobedrijf Van Dijk', 'Café Het Dorstige Hert',
                'Bouwbedrijf Constructie', 'Sportwinkel De Speelman', 'Kapsalon Knip & Go'
            ]),
            amount: random(100, 500)
        })
    },

    taxAudit: {
        id: 'taxAudit',
        category: EVENT_CATEGORIES.FINANCIAL,
        severity: SEVERITY.MODERATE,
        title: 'Belastingcontrole',
        getMessage: (data) => `De Belastingdienst heeft een kleine fout gevonden. Je moet €${data.fine} betalen.`,
        icon: '📋',
        probability: 0.01,
        condition: (state) => state.club.budget > 1000,
        choices: [
            {
                text: 'Betalen',
                effect: (state, data) => {
                    state.club.budget -= data.fine;
                }
            },
            {
                text: 'In beroep gaan (50% kans)',
                effect: (state, data) => {
                    if (Math.random() > 0.5) {
                        // Won appeal
                        state.club.budget -= Math.round(data.fine * 0.3);
                    } else {
                        // Lost appeal - higher fine
                        state.club.budget -= Math.round(data.fine * 1.5);
                    }
                }
            }
        ],
        getData: (state) => ({
            fine: Math.round(state.club.budget * 0.05)
        })
    },

    donation: {
        id: 'donation',
        category: EVENT_CATEGORIES.FINANCIAL,
        severity: SEVERITY.MINOR,
        title: 'Donatie',
        getMessage: (data) => `Een anonieme weldoener heeft €${data.amount} gedoneerd aan de club!`,
        icon: '🎁',
        probability: 0.02,
        condition: (state) => true,
        choices: [
            {
                text: 'Geweldig!',
                effect: (state, data) => {
                    state.club.budget += data.amount;
                }
            }
        ],
        getData: (state) => ({
            amount: random(500, 2000)
        })
    },

    // Youth events
    wonderkindSpotted: {
        id: 'wonderkindSpotted',
        category: EVENT_CATEGORIES.YOUTH,
        severity: SEVERITY.MAJOR,
        title: 'Wonderkind Gespot!',
        getMessage: (data) => `Je scout heeft een bijzonder talent ontdekt: ${data.playerName}, ${data.age} jaar. Wil je hem naar de jeugd halen?`,
        icon: '🌟',
        probability: 0.008,
        condition: (state) => state.scoutingNetwork !== 'none',
        choices: [
            {
                text: 'Aannemen',
                effect: (state, data) => {
                    if (!state.youthPlayers) state.youthPlayers = [];
                    state.youthPlayers.push(data.player);
                }
            },
            {
                text: 'Niet interessant',
                effect: () => {}
            }
        ],
        getData: (state) => {
            const age = random(14, 17);
            const potential = random(60, 85);
            return {
                playerName: `${randomFromArray(['Jayden', 'Dani', 'Nouri', 'Mo', 'Justin'])} ${randomFromArray(['de Jong', 'Bakker', 'El Ghazi'])}`,
                age,
                player: {
                    id: Date.now() + Math.random(),
                    name: `Jayden de Jong`,
                    age,
                    position: randomFromArray(['centraleMid', 'spits', 'linksbuiten']),
                    overall: random(25, 40),
                    potential,
                    attributes: { AAN: random(20, 40), VER: random(20, 40), SNE: random(20, 40), FYS: random(20, 40) }
                }
            };
        }
    },

    youthBreakthrough: {
        id: 'youthBreakthrough',
        category: EVENT_CATEGORIES.YOUTH,
        severity: SEVERITY.MODERATE,
        title: 'Jeugdspeler Klopt Aan',
        getMessage: (data) => `Jeugdspeler ${data.player.name} wil graag doorstromen naar het eerste elftal!`,
        icon: '🎓',
        probability: 0.03,
        condition: (state) => state.youthPlayers && state.youthPlayers.length > 0,
        choices: [
            {
                text: 'Laat hem doorstromen',
                effect: (state, data) => {
                    state.players.push(data.player);
                    state.youthPlayers = state.youthPlayers.filter(p => p.id !== data.player.id);
                    if (!state.stats) state.stats = {};
                    state.stats.youthGraduates = (state.stats.youthGraduates || 0) + 1;
                }
            },
            {
                text: 'Nog een seizoen wachten',
                effect: (state, data) => {
                    data.player.morale = Math.max(30, (data.player.morale || 70) - 15);
                }
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.youthPlayers.filter(p => p.age >= 17))
        })
    },

    // DUTCH AMATEUR FOOTBALL SPECIAL EVENTS
    kantinedienst: {
        id: 'kantinedienst',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Kantinedienst',
        getMessage: (data) => `Het is ${data.player.name} zijn beurt voor kantinedienst dit weekend. Frikandellen bakken!`,
        icon: '🍟',
        probability: 0.05,
        condition: (state) => state.players.length > 0,
        choices: [
            {
                text: 'Prima, hoort erbij!',
                effect: (state, data) => {
                    data.player.morale = Math.min(100, data.player.morale + 3);
                    state.club.budget += 50; // Kleine opbrengst
                }
            },
            {
                text: 'Laat iemand anders het doen (€50)',
                effect: (state, data) => {
                    state.club.budget -= 50;
                }
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.players)
        })
    },

    scheidsrechterControverse: {
        id: 'scheidsrechterControverse',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Scheidsrechter Controversie',
        getMessage: (data) => `De scheidsrechter van vorige week heeft een discutabele beslissing genomen. De spelers zijn ontevreden.`,
        icon: '🟨',
        probability: 0.04,
        condition: (state) => state.club.stats?.totalMatches > 0,
        choices: [
            {
                text: 'Klacht indienen',
                effect: (state, data) => {
                    // 50% kans op gelijk krijgen
                    if (Math.random() > 0.5) {
                        state.club.reputation = Math.min(100, state.club.reputation + 2);
                    } else {
                        state.club.reputation = Math.max(1, state.club.reputation - 1);
                    }
                }
            },
            {
                text: 'Laten rusten',
                effect: (state, data) => {
                    state.players.forEach(p => {
                        p.morale = Math.max(30, p.morale - 2);
                    });
                }
            }
        ],
        getData: (state) => ({})
    },

    derdeHelftIncident: {
        id: 'derdeHelftIncident',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Derde Helft Incident',
        getMessage: (data) => `Tijdens de derde helft in de kantine ging het er gezellig aan toe. ${data.player.name} heeft iets te veel gedronken...`,
        icon: '🍺',
        probability: 0.03,
        condition: (state) => state.players.length > 0,
        choices: [
            {
                text: 'Lachen, het hoort erbij',
                effect: (state, data) => {
                    data.player.fitness = Math.max(50, data.player.fitness - 10);
                    data.player.morale = Math.min(100, data.player.morale + 5);
                }
            },
            {
                text: 'Streng toespreken',
                effect: (state, data) => {
                    data.player.morale = Math.max(30, data.player.morale - 5);
                }
            }
        ],
        getData: (state) => ({
            player: randomFromArray(state.players)
        })
    },

    kunstgrasDebat: {
        id: 'kunstgrasDebat',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Kunstgras Debat',
        getMessage: (data) => `De gemeente overweegt om kunstgras aan te leggen. De oudere spelers zijn tegen, de jongeren zijn voor.`,
        icon: '🏟️',
        probability: 0.01,
        condition: (state) => state.stadium.grass !== 'grass_3',
        choices: [
            {
                text: 'Steun kunstgras',
                effect: (state, data) => {
                    state.players.filter(p => p.age < 25).forEach(p => {
                        p.morale = Math.min(100, p.morale + 3);
                    });
                    state.players.filter(p => p.age >= 25).forEach(p => {
                        p.morale = Math.max(30, p.morale - 2);
                    });
                }
            },
            {
                text: 'Blijf bij natuurgras',
                effect: (state, data) => {
                    state.players.filter(p => p.age >= 25).forEach(p => {
                        p.morale = Math.min(100, p.morale + 2);
                    });
                }
            }
        ],
        getData: (state) => ({})
    },

    toernooiUitnodiging: {
        id: 'toernooiUitnodiging',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Toernooi Uitnodiging',
        getMessage: (data) => `Je bent uitgenodigd voor het ${data.tournamentName}! Deelname kost €${data.cost} maar kan €${data.prize} opleveren.`,
        icon: '🏆',
        probability: 0.02,
        condition: (state) => true,
        choices: [
            {
                text: 'Deelnemen',
                effect: (state, data) => {
                    state.club.budget -= data.cost;
                    // 30% kans om te winnen
                    if (Math.random() < 0.3) {
                        state.club.budget += data.prize;
                        state.club.reputation = Math.min(100, state.club.reputation + 3);
                    } else if (Math.random() < 0.5) {
                        state.club.budget += Math.round(data.prize * 0.3);
                    }
                    // Teammoraal boost
                    state.players.forEach(p => {
                        p.morale = Math.min(100, p.morale + 2);
                    });
                }
            },
            {
                text: 'Afzeggen',
                effect: () => {}
            }
        ],
        getData: (state) => ({
            tournamentName: randomFromArray([
                'Dorpstoernooi', 'Paastoernooi', 'Zomertoernooi', 'Nieuwjaarstoernooi',
                'Kroegentocht Cup', 'Lokale Derby Days'
            ]),
            cost: random(100, 300),
            prize: random(500, 2000)
        })
    },

    lokaleSlagerSponsor: {
        id: 'lokaleSlagerSponsor',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Lokale Slager Sponsort',
        getMessage: (data) => `Slagerij "${data.slagerName}" wil 100 frikandellen leveren voor de kantine en vraagt reclamebord-ruimte.`,
        icon: '🥩',
        probability: 0.02,
        condition: (state) => true,
        choices: [
            {
                text: 'Deal! Frikandellen zijn altijd welkom',
                effect: (state, data) => {
                    state.club.budget += 75; // Bespaarde kosten
                    state.club.reputation = Math.min(100, state.club.reputation + 1);
                }
            },
            {
                text: 'We willen geen reclame',
                effect: () => {}
            }
        ],
        getData: (state) => ({
            slagerName: randomFromArray(['De Vette Knol', 'Het Gouden Varken', 'Slagerij Van Dam', 'De Lokale Slager'])
        })
    },

    veldbezettingConflict: {
        id: 'veldbezettingConflict',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Veldbezetting Conflict',
        getMessage: (data) => `De jeugd van een andere club claimt dat zij het veld gereserveerd hadden voor training.`,
        icon: '⚽',
        probability: 0.03,
        condition: (state) => true,
        choices: [
            {
                text: 'Veld delen',
                effect: (state, data) => {
                    state.club.reputation = Math.min(100, state.club.reputation + 2);
                }
            },
            {
                text: 'Wij hebben voorrang',
                effect: (state, data) => {
                    state.club.reputation = Math.max(1, state.club.reputation - 1);
                }
            }
        ],
        getData: (state) => ({})
    },

    rijdendeTapWagen: {
        id: 'rijdendeTapWagen',
        category: EVENT_CATEGORIES.DUTCH,
        severity: SEVERITY.MINOR,
        title: 'Rijdende Tap Kapot',
        getMessage: (data) => `De rijdende tap is kapot gegaan! Reparatie kost €${data.cost}. Zonder tap geen bier bij uitwedstrijden...`,
        icon: '🚐',
        probability: 0.02,
        condition: (state) => state.club.budget > 200,
        choices: [
            {
                text: 'Direct repareren',
                effect: (state, data) => {
                    state.club.budget -= data.cost;
                    state.players.forEach(p => {
                        p.morale = Math.min(100, p.morale + 2);
                    });
                }
            },
            {
                text: 'Even wachten',
                effect: (state, data) => {
                    state.players.forEach(p => {
                        p.morale = Math.max(30, p.morale - 3);
                    });
                }
            }
        ],
        getData: (state) => ({
            cost: random(150, 400)
        })
    }
};

/**
 * Get a random event that matches current game state
 */
export function getRandomEvent(gameState) {
    const eligibleEvents = Object.values(EVENTS).filter(event => {
        // Check if event condition is met
        if (!event.condition(gameState)) return false;

        // Check probability
        return Math.random() < event.probability;
    });

    if (eligibleEvents.length === 0) return null;

    // Pick random event from eligible ones
    const event = randomFromArray(eligibleEvents);

    // Generate event data
    const data = event.getData(gameState);
    if (!data || (data.player === undefined && event.getData.toString().includes('player'))) {
        return null; // Invalid data, skip event
    }

    return {
        ...event,
        data,
        message: event.getMessage(data)
    };
}

/**
 * Apply event choice effect
 */
export function applyEventChoice(gameState, event, choiceIndex) {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    // Check if choice has a condition and if it's met
    if (choice.condition && !choice.condition(gameState)) {
        return { success: false, reason: 'Voorwaarden niet voldaan' };
    }

    // Apply effect
    choice.effect(gameState, event.data);

    return { success: true };
}

/**
 * Get events for the current week
 */
export function getWeeklyEvents(gameState, count = 1) {
    const events = [];

    for (let i = 0; i < count * 3; i++) { // Try 3x to get enough events
        if (events.length >= count) break;

        const event = getRandomEvent(gameState);
        if (event && !events.find(e => e.id === event.id)) {
            events.push(event);
        }
    }

    return events;
}

/**
 * Initialize event history tracking
 */
export function initEventHistory() {
    return {
        events: [],
        lastEventTime: null
    };
}

/**
 * Add event to history
 */
export function addEventToHistory(gameState, event, choiceIndex) {
    if (!gameState.eventHistory) {
        gameState.eventHistory = initEventHistory();
    }

    gameState.eventHistory.events.push({
        id: event.id,
        title: event.title,
        message: event.message,
        choiceIndex,
        timestamp: Date.now(),
        season: gameState.season,
        week: gameState.week
    });

    gameState.eventHistory.lastEventTime = Date.now();

    // Keep only last 50 events
    if (gameState.eventHistory.events.length > 50) {
        gameState.eventHistory.events = gameState.eventHistory.events.slice(-50);
    }
}

/**
 * Check if enough time has passed for a new event
 */
export function canTriggerEvent(gameState) {
    if (!gameState.eventHistory?.lastEventTime) return true;

    const minTimeBetweenEvents = 60 * 60 * 1000; // 1 hour
    return Date.now() - gameState.eventHistory.lastEventTime >= minTimeBetweenEvents;
}

export { EVENTS, EVENT_CATEGORIES, SEVERITY };
