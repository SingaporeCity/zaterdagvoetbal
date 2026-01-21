/**
 * ZATERDAGVOETBAL - Game State Module
 * Central game state management
 */

import { getNextMidnight } from './utils.js';

export let gameState = {
    club: {
        name: 'FC Goals Maken',
        division: 8,
        budget: 5000,
        reputation: 10,
        position: 3,
        colors: {
            primary: '#1b5e20',
            secondary: '#f5f0e1',
            accent: '#ff9800'
        },
        settingsChangedThisSeason: false,
        stats: {
            founded: 1,
            titles: 0,
            highestDivision: 8,
            totalGoals: 0,
            totalMatches: 0
        }
    },
    // Manager progression
    manager: {
        xp: 0,
        level: 1
    },
    // Daily login rewards
    dailyRewards: {
        lastLogin: null,
        lastClaimDate: null,
        streak: 0
    },
    // Achievements tracking
    achievements: {},
    // Event history
    eventHistory: {
        events: [],
        lastEventTime: null
    },
    // Match statistics
    stats: {
        wins: 0,
        draws: 0,
        losses: 0,
        cleanSheets: 0,
        comebacks: 0,
        hatTricks: 0,
        highestScoreMatch: 0,
        currentUnbeaten: 0,
        currentWinStreak: 0,
        promotions: 0,
        relegationEscapes: 0,
        youthGraduates: 0,
        highestSale: 0,
        sellouts: 0,
        homeWins: 0,
        saturdayMatches: 0
    },
    // Current active event (if any)
    activeEvent: null,
    // Last match result
    lastMatch: null,
    stadium: {
        tribune: 'tribune_1',
        capacity: 200,
        grass: 'grass_0',
        horeca: [],
        fanshop: [],
        vip: [],
        parking: [],
        lighting: null,
        training: 'train_1',
        medical: 'med_1',
        academy: 'acad_1',
        scouting: 'scout_1',
        sponsoring: 'sponsor_1',
        kantine: 'kantine_1',
        perszaal: 'pers_1',
        hotel: 'hotel_1'
    },
    players: [],
    youthPlayers: [],
    lineup: new Array(11).fill(null),
    formation: '4-4-2',
    tactics: {
        mentality: 'balanced',
        pressing: 'medium',
        passingStyle: 'mixed',
        tempo: 'normal',
        width: 'normal'
    },
    advancedTactics: {
        keeperPressure: false,
        forceSetPieces: false,
        fullbackRuns: 'outside',
        marking: 'zone',
        attackDefense: 50,
        duelIntensity: 50
    },
    // Specialists
    specialists: {
        cornerTaker: null,
        penaltyTaker: null,
        freekickTaker: null,
        captain: null
    },
    transferMarket: {
        players: [],
        lastRefresh: null
    },
    trainers: {
        attack: 1,
        midfield: 1,
        defense: 1,
        goalkeeper: 1,
        fitness: 1
    },
    training: {
        // Position slots: 1 player per position group
        slots: {
            goalkeeper: { playerId: null, startTime: null, trainerId: null },
            defender: { playerId: null, startTime: null, trainerId: null },
            midfielder: { playerId: null, startTime: null, trainerId: null },
            attacker: { playerId: null, startTime: null, trainerId: null }
        },
        // 5 trainers, one per stat
        trainerStatus: {
            aan: { busy: false, assignedSlot: null },
            ver: { busy: false, assignedSlot: null },
            tec: { busy: false, assignedSlot: null },
            sne: { busy: false, assignedSlot: null },
            fys: { busy: false, assignedSlot: null }
        },
        sessionDuration: 6 * 60 * 60 * 1000, // 6 hours
        // Team training
        teamTraining: {
            selected: null, // 'defense', 'setpiece', 'attack'
            bonus: null
        }
    },
    season: 1,
    week: 1,
    nextMatch: {
        opponent: 'FC Rivaal',
        time: Date.now() - 1000 // Start with match ready to play
    },
    standings: [],
    scoutSearch: {
        minAge: 16,
        maxAge: 35,
        position: 'all',
        results: []
    },
    scoutMission: {
        active: false,
        startTime: null,
        duration: 60 * 1000, // 1 minute (versneld voor testing)
        pendingPlayer: null
    },
    finances: {
        history: [4500, 4600, 4800, 4700, 4900, 5100, 5000]
    },
    staff: {
        fysio: null,      // Helps recovery, reduces injury duration
        scout: null,      // Better scout success rate
        dokter: null      // Reduces injury chance
    },
    assistantTrainers: {
        attacking: null,
        defensive: null,
        technical: null,
        physical: null
    },
    sponsor: null,
    stadiumSponsor: null,
    scoutingNetwork: 'none'
};

// Drag state for tactics
export let dragState = {
    player: null,
    sourceIndex: null,
    isFromBench: false
};

// Function to reset drag state
export function resetDragState() {
    dragState.player = null;
    dragState.sourceIndex = null;
    dragState.isFromBench = false;
}

// Function to update drag state
export function setDragState(player, sourceIndex, isFromBench) {
    dragState.player = player;
    dragState.sourceIndex = sourceIndex;
    dragState.isFromBench = isFromBench;
}

// Function to replace entire game state (for loading saves)
export function replaceGameState(newState) {
    // Deep merge to preserve any new properties not in saved state
    Object.keys(newState).forEach(key => {
        if (typeof newState[key] === 'object' && newState[key] !== null && !Array.isArray(newState[key])) {
            gameState[key] = { ...gameState[key], ...newState[key] };
        } else {
            gameState[key] = newState[key];
        }
    });
}

// Function to get current game state (for saving)
export function getGameState() {
    return gameState;
}

// Function to reset statistics
export function resetStats() {
    gameState.stats = {
        wins: 0,
        draws: 0,
        losses: 0,
        cleanSheets: 0,
        comebacks: 0,
        hatTricks: 0,
        highestScoreMatch: 0,
        currentUnbeaten: 0,
        promotions: 0,
        relegationEscapes: 0,
        youthGraduates: 0,
        highestSale: 0,
        sellouts: 0,
        homeWins: 0,
        saturdayMatches: 0
    };
}
