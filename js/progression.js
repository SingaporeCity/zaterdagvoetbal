/**
 * ZATERDAGVOETBAL - Progression Module
 * Handles season progression, promotion/relegation, and career advancement
 */

import { DIVISIONS } from './constants.js';
import { random, randomFromArray, getDivision } from './utils.js';

// Season configuration
const SEASON_CONFIG = {
    matchesPerSeason: 14, // 7 home + 7 away in an 8-team league
    teamsPerDivision: 8,
    promotionSpots: 2,
    relegationSpots: 2,
    playoffSpots: { from: 3, to: 6 } // 3rd to 6th play playoffs
};

// Daily login rewards (7-day cycle)
const DAILY_REWARDS = [
    { day: 1, type: 'cash', amount: 100, description: 'Welkom terug!' },
    { day: 2, type: 'cash', amount: 200, description: 'Dag 2 bonus!' },
    { day: 3, type: 'cash', amount: 300, description: 'Halverwege de week!' },
    { day: 4, type: 'cash', amount: 400, description: 'Doorzetten!' },
    { day: 5, type: 'cash', amount: 500, description: 'Bijna weekend!' },
    { day: 6, type: 'cash', amount: 600, description: 'Nog één dag!' },
    { day: 7, type: 'special', amount: 1000, description: 'Week voltooid! Bonus!' }
];

// Manager levels and XP requirements
const MANAGER_LEVELS = [
    { level: 1, xpRequired: 0, title: 'Beginnend Trainer' },
    { level: 2, xpRequired: 100, title: 'Assistent Coach' },
    { level: 3, xpRequired: 300, title: 'Jeugdtrainer' },
    { level: 4, xpRequired: 600, title: 'Trainer B' },
    { level: 5, xpRequired: 1000, title: 'Trainer A' },
    { level: 6, xpRequired: 1500, title: 'Hoofdcoach' },
    { level: 7, xpRequired: 2200, title: 'Ervaren Coach' },
    { level: 8, xpRequired: 3000, title: 'Tacticus' },
    { level: 9, xpRequired: 4000, title: 'Meestertrainer' },
    { level: 10, xpRequired: 5500, title: 'Strategisch Genie' },
    { level: 15, xpRequired: 10000, title: 'Legendarische Coach' },
    { level: 20, xpRequired: 20000, title: 'Voetbalicoon' },
    { level: 25, xpRequired: 35000, title: 'Hall of Famer' },
    { level: 30, xpRequired: 50000, title: 'De Beste Aller Tijden' }
];

// XP rewards for various actions
const XP_REWARDS = {
    matchWin: 50,
    matchDraw: 20,
    matchLoss: 10,
    cleanSheet: 25,
    goalScored: 5,
    promotion: 500,
    title: 1000,
    youthGraduate: 75,
    playerSold: 25,
    stadiumUpgrade: 50,
    achievementUnlocked: 100
};

/**
 * Generate league standings for a division
 */
export function generateStandings(clubName, division, clubPosition = null) {
    const divisionData = getDivision(division);
    const teams = [];

    // Team name pools per division type
    const teamPools = {
        amateur: [
            'Vv De Meeuwen', 'SC Concordia', 'FC Voorwaarts', 'SV Oranje',
            'VV Eendracht', 'SC Victoria', 'FC De Toekomst', 'SV Sparta',
            'VV Olympia', 'SC Hercules', 'FC Amicitia', 'SV Fortuna',
            'VV De Adelaars', 'SC Minerva', 'FC Ons Dorp', 'SV De Sterren'
        ],
        semipro: [
            'FC Groningen Amateurs', 'SC Twente', 'VV Eindhoven',
            'FC Rotterdam Zuid', 'SV Amsterdam Noord', 'VV Den Haag',
            'SC Utrecht City', 'FC Brabant', 'SV Gelderland', 'VV Limburg'
        ],
        pro: [
            'Jong FC Utrecht', 'SC Cambuur', 'FC Emmen', 'VVV Venlo',
            'Roda JC', 'NAC Breda', 'FC Dordrecht', 'Almere City FC'
        ]
    };

    // Select team pool based on division
    let pool;
    if (division >= 5) pool = teamPools.amateur;
    else if (division >= 2) pool = teamPools.semipro;
    else pool = teamPools.pro;

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // Generate 7 opponent teams (8 total including player)
    for (let i = 0; i < SEASON_CONFIG.teamsPerDivision - 1; i++) {
        const teamName = shuffled[i] || `FC Team ${i + 1}`;

        // Generate season stats
        const gamesPlayed = random(0, SEASON_CONFIG.matchesPerSeason);
        const wins = random(0, gamesPlayed);
        const draws = random(0, gamesPlayed - wins);
        const losses = gamesPlayed - wins - draws;

        const goalsFor = wins * random(2, 4) + draws * random(0, 2) + losses * random(0, 1);
        const goalsAgainst = losses * random(2, 4) + draws * random(0, 2) + wins * random(0, 1);

        teams.push({
            name: teamName,
            played: gamesPlayed,
            won: wins,
            drawn: draws,
            lost: losses,
            goalsFor,
            goalsAgainst,
            goalDiff: goalsFor - goalsAgainst,
            points: wins * 3 + draws,
            isPlayer: false
        });
    }

    // Add player's team
    const playerTeam = {
        name: clubName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        isPlayer: true
    };
    teams.push(playerTeam);

    // Sort by points, then goal difference, then goals for
    teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
    });

    // Assign positions
    teams.forEach((team, index) => {
        team.position = index + 1;
    });

    return teams;
}

/**
 * Update standings after a match
 */
export function updateStandings(standings, teamName, goalsFor, goalsAgainst) {
    const team = standings.find(t => t.name === teamName);
    if (!team) return standings;

    team.played++;
    team.goalsFor += goalsFor;
    team.goalsAgainst += goalsAgainst;
    team.goalDiff = team.goalsFor - team.goalsAgainst;

    if (goalsFor > goalsAgainst) {
        team.won++;
        team.points += 3;
    } else if (goalsFor === goalsAgainst) {
        team.drawn++;
        team.points += 1;
    } else {
        team.lost++;
    }

    // Re-sort standings
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
    });

    // Update positions
    standings.forEach((team, index) => {
        team.position = index + 1;
    });

    return standings;
}

/**
 * Simulate AI team matches for the week
 */
export function simulateAIMatches(standings) {
    // Only simulate if some teams haven't played enough
    const playerTeam = standings.find(t => t.isPlayer);
    if (!playerTeam) return standings;

    // Other teams play catch-up matches
    standings.forEach(team => {
        if (team.isPlayer) return;

        // Each AI team plays 1 match per week (sometimes)
        if (Math.random() > 0.7) return; // 30% chance of no match

        // Find a random opponent
        const opponents = standings.filter(t => t.name !== team.name && !t.isPlayer);
        if (opponents.length === 0) return;

        const opponent = randomFromArray(opponents);

        // Simulate simple result based on relative strength (position)
        const strengthDiff = opponent.position - team.position;
        let homeWinChance = 0.4 + (strengthDiff * 0.05);
        homeWinChance = Math.max(0.2, Math.min(0.7, homeWinChance));

        const roll = Math.random();
        let homeGoals, awayGoals;

        if (roll < homeWinChance) {
            // Home win
            homeGoals = random(1, 4);
            awayGoals = random(0, homeGoals - 1);
        } else if (roll < homeWinChance + 0.25) {
            // Draw
            homeGoals = random(0, 3);
            awayGoals = homeGoals;
        } else {
            // Away win
            awayGoals = random(1, 4);
            homeGoals = random(0, awayGoals - 1);
        }

        // Update both teams
        updateStandings(standings, team.name, homeGoals, awayGoals);
        updateStandings(standings, opponent.name, awayGoals, homeGoals);
    });

    return standings;
}

/**
 * Check if season is complete
 */
export function isSeasonComplete(standings) {
    const playerTeam = standings.find(t => t.isPlayer);
    return playerTeam && playerTeam.played >= SEASON_CONFIG.matchesPerSeason;
}

/**
 * Calculate end of season results
 */
export function calculateSeasonResults(standings, currentDivision) {
    const playerTeam = standings.find(t => t.isPlayer);
    if (!playerTeam) return null;

    const position = playerTeam.position;
    const result = {
        position,
        points: playerTeam.points,
        goalsFor: playerTeam.goalsFor,
        goalsAgainst: playerTeam.goalsAgainst,
        won: playerTeam.won,
        drawn: playerTeam.drawn,
        lost: playerTeam.lost,
        isChampion: position === 1,
        promoted: false,
        relegated: false,
        playoffs: false,
        newDivision: currentDivision
    };

    // Check promotion (top 2)
    if (position <= SEASON_CONFIG.promotionSpots && currentDivision > 0) {
        result.promoted = true;
        result.newDivision = currentDivision - 1;
    }
    // Check relegation (bottom 2)
    else if (position > SEASON_CONFIG.teamsPerDivision - SEASON_CONFIG.relegationSpots && currentDivision < 8) {
        result.relegated = true;
        result.newDivision = currentDivision + 1;
    }
    // Check playoffs (3rd to 6th)
    else if (position >= SEASON_CONFIG.playoffSpots.from && position <= SEASON_CONFIG.playoffSpots.to) {
        result.playoffs = true;
    }

    return result;
}

/**
 * Start a new season
 */
export function startNewSeason(gameState) {
    const seasonResult = calculateSeasonResults(gameState.standings, gameState.club.division);

    // Update division if promoted/relegated
    if (seasonResult) {
        gameState.club.division = seasonResult.newDivision;

        // Update club stats
        if (seasonResult.isChampion) {
            gameState.club.stats.titles = (gameState.club.stats.titles || 0) + 1;
        }
        if (seasonResult.newDivision < gameState.club.stats.highestDivision) {
            gameState.club.stats.highestDivision = seasonResult.newDivision;
        }
    }

    // Increment season
    gameState.season++;
    gameState.week = 1;

    // Generate new standings
    gameState.standings = generateStandings(
        gameState.club.name,
        gameState.club.division
    );

    // Age all players
    gameState.players.forEach(player => {
        player.age++;
        // Reset seasonal stats
        player.goals = 0;
        player.assists = 0;
    });

    // Age youth players
    if (gameState.youthPlayers) {
        gameState.youthPlayers.forEach(player => {
            player.age++;
        });
    }

    // Adjust budget based on new division
    const divisionData = getDivision(gameState.club.division);
    if (divisionData) {
        // Budget increases with promotion, decreases with relegation
        const budgetMultiplier = seasonResult?.promoted ? 1.5 : (seasonResult?.relegated ? 0.8 : 1.1);
        gameState.club.budget = Math.round(gameState.club.budget * budgetMultiplier);
    }

    // Reset settings changed flag
    gameState.club.settingsChangedThisSeason = false;

    return seasonResult;
}

/**
 * Check and claim daily login reward
 */
export function checkDailyReward(gameState) {
    const now = Date.now();
    const today = new Date(now).toDateString();

    // Initialize daily rewards if not exists
    if (!gameState.dailyRewards) {
        gameState.dailyRewards = {
            lastLogin: null,
            lastClaimDate: null,
            streak: 0
        };
    }

    const lastClaimDate = gameState.dailyRewards.lastClaimDate;

    // Already claimed today
    if (lastClaimDate === today) {
        return { alreadyClaimed: true, streak: gameState.dailyRewards.streak };
    }

    // Check if streak continues (yesterday) or resets
    const yesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString();
    if (lastClaimDate === yesterday) {
        gameState.dailyRewards.streak++;
    } else if (lastClaimDate !== null) {
        // Streak broken
        gameState.dailyRewards.streak = 1;
    } else {
        // First time
        gameState.dailyRewards.streak = 1;
    }

    // Cap streak at 7 (cycle repeats)
    const streakDay = ((gameState.dailyRewards.streak - 1) % 7) + 1;
    const reward = DAILY_REWARDS[streakDay - 1];

    // Apply reward
    if (reward.type === 'cash') {
        gameState.club.budget += reward.amount;
    } else if (reward.type === 'special') {
        gameState.club.budget += reward.amount;
        // Could add special items, players, etc.
    }

    // Update claim date
    gameState.dailyRewards.lastClaimDate = today;
    gameState.dailyRewards.lastLogin = now;

    return {
        claimed: true,
        streak: gameState.dailyRewards.streak,
        streakDay,
        reward
    };
}

/**
 * Get manager level from XP
 */
export function getManagerLevel(xp) {
    let currentLevel = MANAGER_LEVELS[0];

    for (const level of MANAGER_LEVELS) {
        if (xp >= level.xpRequired) {
            currentLevel = level;
        } else {
            break;
        }
    }

    // Find next level
    const nextLevel = MANAGER_LEVELS.find(l => l.xpRequired > xp);

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        xp,
        xpToNext: nextLevel ? nextLevel.xpRequired - xp : 0,
        nextLevel: nextLevel?.level || currentLevel.level,
        progress: nextLevel
            ? (xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)
            : 1
    };
}

/**
 * Award XP for an action
 */
export function awardXP(gameState, action, amount = null) {
    // Initialize manager XP if not exists
    if (!gameState.manager) {
        gameState.manager = { xp: 0, level: 1 };
    }

    const xpAmount = amount || XP_REWARDS[action] || 0;
    const oldLevel = getManagerLevel(gameState.manager.xp);

    gameState.manager.xp += xpAmount;

    const newLevel = getManagerLevel(gameState.manager.xp);

    return {
        xpGained: xpAmount,
        totalXP: gameState.manager.xp,
        leveledUp: newLevel.level > oldLevel.level,
        oldLevel: oldLevel.level,
        newLevel: newLevel.level,
        newTitle: newLevel.title
    };
}

/**
 * Get season schedule
 */
export function getSeasonSchedule(standings, week) {
    const teams = standings.map(t => t.name);
    const playerTeam = standings.find(t => t.isPlayer)?.name;

    // Generate round-robin schedule
    const schedule = [];
    const numTeams = teams.length;
    const rounds = (numTeams - 1) * 2; // Home and away

    for (let round = 0; round < rounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < numTeams / 2; i++) {
            const home = (round + i) % (numTeams - 1);
            let away = (numTeams - 1 - i + round) % (numTeams - 1);

            if (i === 0) {
                away = numTeams - 1;
            }

            // Swap home/away for second half of season
            if (round >= numTeams - 1) {
                roundMatches.push({ home: teams[away], away: teams[home] });
            } else {
                roundMatches.push({ home: teams[home], away: teams[away] });
            }
        }
        schedule.push(roundMatches);
    }

    return schedule;
}

/**
 * Get next opponent for the player
 */
export function getNextOpponent(standings, week) {
    const schedule = getSeasonSchedule(standings, week);
    const playerTeam = standings.find(t => t.isPlayer);

    if (!playerTeam || week > schedule.length) return null;

    const roundMatches = schedule[week - 1];
    const playerMatch = roundMatches.find(
        m => m.home === playerTeam.name || m.away === playerTeam.name
    );

    if (!playerMatch) return null;

    const isHome = playerMatch.home === playerTeam.name;
    const opponentName = isHome ? playerMatch.away : playerMatch.home;
    const opponent = standings.find(t => t.name === opponentName);

    return {
        name: opponentName,
        position: opponent?.position || 4,
        isHome
    };
}

/**
 * Get promotion/relegation zone info
 */
export function getZoneInfo(position) {
    if (position <= SEASON_CONFIG.promotionSpots) {
        return { zone: 'promotion', color: '#4caf50', label: 'Promotie' };
    } else if (position <= SEASON_CONFIG.playoffSpots.to) {
        return { zone: 'playoff', color: '#ff9800', label: 'Play-offs' };
    } else if (position > SEASON_CONFIG.teamsPerDivision - SEASON_CONFIG.relegationSpots) {
        return { zone: 'relegation', color: '#f44336', label: 'Degradatie' };
    }
    return { zone: 'safe', color: '#9e9e9e', label: '' };
}

export { DAILY_REWARDS, MANAGER_LEVELS, XP_REWARDS, SEASON_CONFIG };
