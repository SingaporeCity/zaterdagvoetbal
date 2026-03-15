/**
 * ZATERDAGVOETBAL - Achievements Module
 * Track and unlock achievements for long-term goals
 * 200 achievements: 100 Speler (playerXP) + 100 Manager (managerXP)
 */

// Achievement categories
const CATEGORIES = {
    MATCHES: 'matches',
    GOALS: 'goals',
    SEASON: 'season',
    CLUB: 'club',
    PLAYERS: 'players',
    STADIUM: 'stadium',
    SPECIAL: 'special'
};

// Division names for locked achievement descriptions
const DIVISION_NAMES = ['Eredivisie', 'Eerste Divisie', 'Tweede Divisie', '1e Klasse', '2e Klasse', '3e Klasse', '4e Klasse', '5e Klasse', '6e Klasse'];

// All achievements in the game (200 total)
const ACHIEVEMENTS = {

    // ================================================================
    // SPELER — MATCHES (35) — playerXP
    // ================================================================
    firstMatch: {
        id: 'firstMatch',
        name: 'Debuut',
        description: 'Speel je eerste wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 15 },
        check: (state) => (state.stats?.myPlayerMatches || 0) >= 1,
        progress: { value: (state) => state.stats?.myPlayerMatches || 0, target: 1 }
    },
    secondMatch: {
        id: 'secondMatch',
        name: 'Dat Ging Best',
        description: 'Speel je tweede wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 10 },
        check: (state) => (state.stats?.myPlayerMatches || 0) >= 2,
        progress: { value: (state) => state.stats?.myPlayerMatches || 0, target: 2 }
    },
    fiveMatches: {
        id: 'fiveMatches',
        name: 'Vaste Klant',
        description: 'Speel 5 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 20 },
        check: (state) => (state.stats?.myPlayerMatches || 0) >= 5,
        progress: { value: (state) => state.stats?.myPlayerMatches || 0, target: 5 }
    },
    tenMatches: {
        id: 'tenMatches',
        name: 'Debuutseizoen',
        description: 'Speel 10 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 25 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 10,
        progress: { value: (state) => state.club.stats?.totalMatches || 0, target: 10 }
    },
    twentyFiveMatches: {
        id: 'twentyFiveMatches',
        name: 'Halve Competitie',
        description: 'Speel 25 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 40 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 25,
        progress: { value: (state) => state.club.stats?.totalMatches || 0, target: 25 }
    },
    fiftyMatches: {
        id: 'fiftyMatches',
        name: 'Routinier',
        description: 'Speel 50 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 60 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 50,
        progress: { value: (state) => state.club.stats?.totalMatches || 0, target: 50 }
    },
    hundredMatches: {
        id: 'hundredMatches',
        name: 'Clubicoon',
        description: 'Speel 100 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏟️',
        reward: { playerXP: 150 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 100,
        progress: { value: (state) => state.club.stats?.totalMatches || 0, target: 100 }
    },
    twoHundredMatches: {
        id: 'twoHundredMatches',
        name: 'Eeuwige Trouw',
        description: 'Speel 200 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏟️',
        reward: { playerXP: 250 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 200,
        progress: { value: (state) => state.club.stats?.totalMatches || 0, target: 200 }
    },
    firstWin: {
        id: 'firstWin',
        name: 'Eerste Overwinning',
        description: 'Win je eerste wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '🏆',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.wins || 0) >= 1,
        progress: { value: (state) => state.stats?.wins || 0, target: 1 }
    },
    fiveWins: {
        id: 'fiveWins',
        name: 'Vijf Vingers',
        description: 'Win 5 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '✋',
        reward: { playerXP: 30 },
        check: (state) => (state.stats?.wins || 0) >= 5,
        progress: { value: (state) => state.stats?.wins || 0, target: 5 }
    },
    tenWins: {
        id: 'tenWins',
        name: 'Winnende Hand',
        description: 'Win 10 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🎖️',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.wins || 0) >= 10,
        progress: { value: (state) => state.stats?.wins || 0, target: 10 }
    },
    twentyFiveWins: {
        id: 'twentyFiveWins',
        name: 'Halve Beker',
        description: 'Win 25 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏅',
        reward: { playerXP: 60 },
        check: (state) => (state.stats?.wins || 0) >= 25,
        progress: { value: (state) => state.stats?.wins || 0, target: 25 }
    },
    fiftyWins: {
        id: 'fiftyWins',
        name: 'Winnaar',
        description: 'Win 50 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏅',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.wins || 0) >= 50,
        progress: { value: (state) => state.stats?.wins || 0, target: 50 }
    },
    hundredWins: {
        id: 'hundredWins',
        name: 'Meester',
        description: 'Win 100 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '👑',
        reward: { playerXP: 250 },
        check: (state) => (state.stats?.wins || 0) >= 100,
        progress: { value: (state) => state.stats?.wins || 0, target: 100 }
    },
    threeWinsInRow: {
        id: 'threeWinsInRow',
        name: 'Op Dreef',
        description: 'Win 3 wedstrijden op rij',
        category: CATEGORIES.MATCHES,
        icon: '🔥',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.currentWinStreak || 0) >= 3,
        progress: { value: (state) => state.stats?.currentWinStreak || 0, target: 3 }
    },
    fiveWinsInRow: {
        id: 'fiveWinsInRow',
        name: 'Onstuitbaar',
        description: 'Win 5 wedstrijden op rij',
        category: CATEGORIES.MATCHES,
        icon: '💪',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.currentWinStreak || 0) >= 5,
        progress: { value: (state) => state.stats?.currentWinStreak || 0, target: 5 }
    },
    tenWinsInRow: {
        id: 'tenWinsInRow',
        name: 'Niet Te Stoppen',
        description: 'Win 10 wedstrijden op rij',
        category: CATEGORIES.MATCHES,
        icon: '💪',
        reward: { playerXP: 150 },
        check: (state) => (state.stats?.bestWinStreak || 0) >= 10,
        progress: { value: (state) => state.stats?.bestWinStreak || 0, target: 10 }
    },
    unbeatenRun: {
        id: 'unbeatenRun',
        name: 'Ongeslagen',
        description: 'Blijf 5 wedstrijden ongeslagen',
        category: CATEGORIES.MATCHES,
        icon: '🛡️',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.currentUnbeaten || 0) >= 5,
        progress: { value: (state) => state.stats?.currentUnbeaten || 0, target: 5 }
    },
    tenUnbeaten: {
        id: 'tenUnbeaten',
        name: 'Muur Van Staal',
        description: '10 wedstrijden ongeslagen',
        category: CATEGORIES.MATCHES,
        icon: '🛡️',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.bestUnbeaten || 0) >= 10,
        progress: { value: (state) => state.stats?.bestUnbeaten || 0, target: 10 }
    },
    cleanSheet: {
        id: 'cleanSheet',
        name: 'De Nul',
        description: 'Houd je doel schoon',
        category: CATEGORIES.MATCHES,
        icon: '🧤',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 1,
        progress: { value: (state) => state.stats?.cleanSheets || 0, target: 1 }
    },
    fiveCleanSheets: {
        id: 'fiveCleanSheets',
        name: 'Betonvloer',
        description: '5x de nul gehouden',
        category: CATEGORIES.MATCHES,
        icon: '🧤',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 5,
        progress: { value: (state) => state.stats?.cleanSheets || 0, target: 5 }
    },
    tenCleanSheets: {
        id: 'tenCleanSheets',
        name: 'Verdedigingswall',
        description: '10x de nul gehouden',
        category: CATEGORIES.MATCHES,
        icon: '🧱',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 10,
        progress: { value: (state) => state.stats?.cleanSheets || 0, target: 10 }
    },
    comeback: {
        id: 'comeback',
        name: 'Comeback King',
        description: 'Win een wedstrijd na achterstand',
        category: CATEGORIES.MATCHES,
        icon: '🔄',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.comebacks || 0) >= 1,
        progress: { value: (state) => state.stats?.comebacks || 0, target: 1 }
    },
    neverGiveUp: {
        id: 'neverGiveUp',
        name: 'Nooit Opgeven',
        description: 'Maak 5 comebacks',
        category: CATEGORIES.MATCHES,
        icon: '💪',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.comebacks || 0) >= 5,
        progress: { value: (state) => state.stats?.comebacks || 0, target: 5 }
    },
    homeKing: {
        id: 'homeKing',
        name: 'Thuiskoning',
        description: 'Win 10 thuiswedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏠',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.homeWins || 0) >= 10,
        progress: { value: (state) => state.stats?.homeWins || 0, target: 10 }
    },
    awayWarrior: {
        id: 'awayWarrior',
        name: 'Buitenbeentje',
        description: 'Win 10 uitwedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🚌',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.awayWins || 0) >= 10,
        progress: { value: (state) => state.stats?.awayWins || 0, target: 10 }
    },
    bigWin3: {
        id: 'bigWin3',
        name: 'Kijk Ze Gaan',
        description: 'Win met 3+ verschil',
        category: CATEGORIES.MATCHES,
        icon: '💥',
        reward: { playerXP: 40 },
        check: (state) => (state.stats?.bigWins || 0) >= 1
    },
    bigWin4: {
        id: 'bigWin4',
        name: 'Deklansen',
        description: 'Win met 4+ verschil',
        category: CATEGORIES.MATCHES,
        icon: '💥',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.bigWins4 || 0) >= 1
    },
    bigWin5: {
        id: 'bigWin5',
        name: 'Sloopkogel',
        description: 'Win met 5+ verschil',
        category: CATEGORIES.MATCHES,
        icon: '💥',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.bigWins5 || 0) >= 1
    },
    tenDraws: {
        id: 'tenDraws',
        name: 'Puntendeler',
        description: '10 gelijke spelen',
        category: CATEGORIES.MATCHES,
        icon: '🤝',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.draws || 0) >= 10,
        progress: { value: (state) => state.stats?.draws || 0, target: 10 }
    },
    firstLoss: {
        id: 'firstLoss',
        name: 'Het ligt aan de scheids',
        description: 'Verlies je eerste wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '📉',
        reward: { playerXP: 10 },
        check: (state) => (state.stats?.losses || 0) >= 1,
        progress: { value: (state) => state.stats?.losses || 0, target: 1 }
    },
    tenLosses: {
        id: 'tenLosses',
        name: 'Ervaring Opdoen',
        description: '10 keer verloren',
        category: CATEGORIES.MATCHES,
        icon: '📉',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.losses || 0) >= 10,
        progress: { value: (state) => state.stats?.losses || 0, target: 10 }
    },
    drawSpecialist: {
        id: 'drawSpecialist',
        name: 'Gelijkspel Specialist',
        description: '5 gelijkspelen op rij',
        category: CATEGORIES.MATCHES,
        icon: '🤝',
        hidden: true,
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.drawStreak || 0) >= 5,
        progress: { value: (state) => state.stats?.drawStreak || 0, target: 5 }
    },
    lossStreak5: {
        id: 'lossStreak5',
        name: 'Vrije Val',
        description: '5 nederlagen op rij',
        category: CATEGORIES.MATCHES,
        icon: '📉',
        hidden: true,
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.lossStreak || 0) >= 5,
        progress: { value: (state) => state.stats?.lossStreak || 0, target: 5 }
    },
    saturdayTen: {
        id: 'saturdayTen',
        name: 'Zaterdagvoetballer',
        description: 'Speel 10 zaterdagwedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '📅',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.saturdayMatches || 0) >= 10,
        progress: { value: (state) => state.stats?.saturdayMatches || 0, target: 10 }
    },

    // ================================================================
    // SPELER — GOALS (25) — playerXP
    // ================================================================
    firstGoal: {
        id: 'firstGoal',
        name: 'Eerste Doelpunt',
        description: 'Je team scoort voor het eerst',
        category: CATEGORIES.GOALS,
        icon: '⚽',
        reward: { playerXP: 15 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 1,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 1 }
    },
    tenGoals: {
        id: 'tenGoals',
        name: 'Doelpuntenmaker',
        description: '10 teamgoals',
        category: CATEGORIES.GOALS,
        icon: '⚽',
        reward: { playerXP: 30 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 10,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 10 }
    },
    fiftyGoals: {
        id: 'fiftyGoals',
        name: 'Doelpuntenfabriek',
        description: '50 teamgoals',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 75 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 50,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 50 }
    },
    hundredGoals: {
        id: 'hundredGoals',
        name: 'Goaltjesdief',
        description: '100 teamgoals',
        category: CATEGORIES.GOALS,
        icon: '💯',
        reward: { playerXP: 150 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 100,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 100 }
    },
    twoHundredGoals: {
        id: 'twoHundredGoals',
        name: 'Topscorer Aller Tijden',
        description: '200 teamgoals',
        category: CATEGORIES.GOALS,
        icon: '👑',
        reward: { playerXP: 250 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 200,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 200 }
    },
    fiveHundredGoals: {
        id: 'fiveHundredGoals',
        name: 'Doelpuntenfestival',
        description: '500 teamgoals',
        category: CATEGORIES.GOALS,
        icon: '🎆',
        reward: { playerXP: 250 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 500,
        progress: { value: (state) => state.club.stats?.totalGoals || 0, target: 500 }
    },
    firstMyGoal: {
        id: 'firstMyGoal',
        name: 'Mijn Eerste!',
        description: 'Je speler scoort z\'n eerste goal',
        category: CATEGORIES.GOALS,
        icon: '⚽',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.myPlayerGoals || 0) >= 1,
        progress: { value: (state) => state.stats?.myPlayerGoals || 0, target: 1 }
    },
    fiveMyGoals: {
        id: 'fiveMyGoals',
        name: 'Scherp Schot',
        description: '5 goals met je speler',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 40 },
        check: (state) => (state.stats?.myPlayerGoals || 0) >= 5,
        progress: { value: (state) => state.stats?.myPlayerGoals || 0, target: 5 }
    },
    tenMyGoals: {
        id: 'tenMyGoals',
        name: 'Afmaker',
        description: '10 goals met je speler',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 60 },
        check: (state) => (state.stats?.myPlayerGoals || 0) >= 10,
        progress: { value: (state) => state.stats?.myPlayerGoals || 0, target: 10 }
    },
    twentyFiveMyGoals: {
        id: 'twentyFiveMyGoals',
        name: 'Doelpuntenmachine',
        description: '25 goals met je speler',
        category: CATEGORIES.GOALS,
        icon: '🔥',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.myPlayerGoals || 0) >= 25,
        progress: { value: (state) => state.stats?.myPlayerGoals || 0, target: 25 }
    },
    fiftyMyGoals: {
        id: 'fiftyMyGoals',
        name: 'Levende Legende',
        description: '50 goals met je speler',
        category: CATEGORIES.GOALS,
        icon: '👑',
        reward: { playerXP: 200 },
        check: (state) => (state.stats?.myPlayerGoals || 0) >= 50,
        progress: { value: (state) => state.stats?.myPlayerGoals || 0, target: 50 }
    },
    firstAssist: {
        id: 'firstAssist',
        name: 'Aangever',
        description: 'Je eerste assist',
        category: CATEGORIES.GOALS,
        icon: '🤝',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.myPlayerAssists || 0) >= 1,
        progress: { value: (state) => state.stats?.myPlayerAssists || 0, target: 1 }
    },
    fiveAssists: {
        id: 'fiveAssists',
        name: 'Broodjes Bakker',
        description: '5 assists',
        category: CATEGORIES.GOALS,
        icon: '🍞',
        reward: { playerXP: 40 },
        check: (state) => (state.stats?.myPlayerAssists || 0) >= 5,
        progress: { value: (state) => state.stats?.myPlayerAssists || 0, target: 5 }
    },
    tenAssists: {
        id: 'tenAssists',
        name: 'Creatieveling',
        description: '10 assists',
        category: CATEGORIES.GOALS,
        icon: '🎨',
        reward: { playerXP: 60 },
        check: (state) => (state.stats?.myPlayerAssists || 0) >= 10,
        progress: { value: (state) => state.stats?.myPlayerAssists || 0, target: 10 }
    },
    twentyFiveAssists: {
        id: 'twentyFiveAssists',
        name: 'Regisseur',
        description: '25 assists',
        category: CATEGORIES.GOALS,
        icon: '🎬',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.myPlayerAssists || 0) >= 25,
        progress: { value: (state) => state.stats?.myPlayerAssists || 0, target: 25 }
    },
    hatTrick: {
        id: 'hatTrick',
        name: 'Hattrick Held',
        description: 'Hattrick in een wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🎩',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.hatTricks || 0) >= 1,
        progress: { value: (state) => state.stats?.hatTricks || 0, target: 1 }
    },
    threeHatTricks: {
        id: 'threeHatTricks',
        name: 'Hattrick Koning',
        description: '3 hattricks',
        category: CATEGORIES.GOALS,
        icon: '🎩',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.hatTricks || 0) >= 3,
        progress: { value: (state) => state.stats?.hatTricks || 0, target: 3 }
    },
    fiveGoalsMatch: {
        id: 'fiveGoalsMatch',
        name: 'Kansenregen',
        description: '5 teamgoals in 1 wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🌧️',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.highestScoreMatch || 0) >= 5
    },
    sevenGoalsMatch: {
        id: 'sevenGoalsMatch',
        name: 'Doelpuntenfestijn',
        description: '7 goals in 1 wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.highestScoreMatch || 0) >= 7
    },
    scoreTen: {
        id: 'scoreTen',
        name: 'Dubbelcijfers',
        description: '10+ goals in 1 wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        hidden: true,
        reward: { playerXP: 150 },
        check: (state) => (state.stats?.highestScoreMatch || 0) >= 10
    },
    goalMachine: {
        id: 'goalMachine',
        name: 'Goalmachine',
        description: '25 teamgoals in 1 seizoen',
        category: CATEGORIES.GOALS,
        icon: '🔥',
        hidden: true,
        reward: { playerXP: 150 },
        check: (state) => {
            const history = state.matchHistory || [];
            const seasonGoals = history
                .filter(h => h.season === state.season)
                .reduce((sum, m) => sum + (m.playerScore || 0), 0);
            return seasonGoals >= 25;
        }
    },
    firstGoalAndAssist: {
        id: 'firstGoalAndAssist',
        name: 'Compleet Pakket',
        description: 'Goal + assist in 1 wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🎁',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.myGoalAndAssist || 0) >= 1,
        progress: { value: (state) => state.stats?.myGoalAndAssist || 0, target: 1 }
    },
    goalDrought: {
        id: 'goalDrought',
        name: 'Droogteperiode',
        description: '5 wedstrijden zonder te scoren',
        category: CATEGORIES.GOALS,
        icon: '🏜️',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.goalDrought || 0) >= 5,
        progress: { value: (state) => state.stats?.goalDrought || 0, target: 5 }
    },
    goalEveryMatch: {
        id: 'goalEveryMatch',
        name: 'Altijd Raak',
        description: '5 op rij scoren (team)',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.scoringStreak || 0) >= 5,
        progress: { value: (state) => state.stats?.scoringStreak || 0, target: 5 }
    },
    hundredGoalsAgainst: {
        id: 'hundredGoalsAgainst',
        name: 'Mandje Van De Buren',
        description: '100 tegengoals',
        category: CATEGORIES.GOALS,
        icon: '🧺',
        hidden: true,
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.goalsAgainst || 0) >= 100,
        progress: { value: (state) => state.stats?.goalsAgainst || 0, target: 100 }
    },

    // ================================================================
    // SPELER — SEASON (20) — playerXP
    // ================================================================
    surviveRelegation: {
        id: 'surviveRelegation',
        name: 'Op Het Nippertje',
        description: 'Ontsnap aan degradatie',
        category: CATEGORIES.SEASON,
        icon: '😅',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.relegationEscapes || 0) >= 1,
        progress: { value: (state) => state.stats?.relegationEscapes || 0, target: 1 }
    },
    almostRelegation: {
        id: 'almostRelegation',
        name: 'Degradatiespook',
        description: '3x ontsnapt aan degradatie',
        category: CATEGORIES.SEASON,
        icon: '😱',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.relegationEscapes || 0) >= 3,
        progress: { value: (state) => state.stats?.relegationEscapes || 0, target: 3 }
    },
    twoSeasons: {
        id: 'twoSeasons',
        name: 'Tweede Seizoen',
        description: 'Bereik seizoen 2',
        category: CATEGORIES.SEASON,
        icon: '📅',
        reward: { playerXP: 15 },
        check: (state) => (state.season || 1) >= 2,
        progress: { value: (state) => state.season || 1, target: 2 }
    },
    fiveSeasons: {
        id: 'fiveSeasons',
        name: 'Veteraan',
        description: 'Bereik seizoen 5',
        category: CATEGORIES.SEASON,
        icon: '📅',
        reward: { playerXP: 50 },
        check: (state) => (state.season || 1) >= 5,
        progress: { value: (state) => state.season || 1, target: 5 }
    },
    tenSeasons: {
        id: 'tenSeasons',
        name: 'Clublegende',
        description: 'Bereik seizoen 10',
        category: CATEGORIES.SEASON,
        icon: '🏛️',
        reward: { playerXP: 250 },
        check: (state) => (state.season || 1) >= 10,
        progress: { value: (state) => state.season || 1, target: 10 }
    },
    twentySeasons: {
        id: 'twentySeasons',
        name: 'Onsterfelijk',
        description: 'Bereik seizoen 20',
        category: CATEGORIES.SEASON,
        icon: '🏛️',
        reward: { playerXP: 500 },
        check: (state) => (state.season || 1) >= 20,
        progress: { value: (state) => state.season || 1, target: 20 }
    },
    perfectSeason: {
        id: 'perfectSeason',
        name: 'Perfect Seizoen',
        description: 'Win alle wedstrijden in een seizoen',
        category: CATEGORIES.SEASON,
        icon: '🏆',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => state.stats?.perfectSeason === true
    },
    noLoss: {
        id: 'noLoss',
        name: 'Onverslaanbaar',
        description: 'Heel seizoen niet verloren',
        category: CATEGORIES.SEASON,
        icon: '🛡️',
        hidden: true,
        reward: { playerXP: 200 },
        check: (state) => {
            const history = state.matchHistory || [];
            const seasonHistory = history.filter(h => h.season === state.season);
            return seasonHistory.length >= 14 && seasonHistory.every(m => m.resultType !== 'loss');
        }
    },
    yoyo: {
        id: 'yoyo',
        name: 'Jojo Club',
        description: 'Promoveer en degradeer in 2 seizoenen',
        category: CATEGORIES.SEASON,
        icon: '🪀',
        hidden: true,
        reward: { playerXP: 50 },
        check: (state) => state.stats?.yoyoClub === true
    },
    worstSeason: {
        id: 'worstSeason',
        name: 'Karakterbouwend Jaar',
        description: 'Eindig laatste in de stand',
        category: CATEGORIES.SEASON,
        icon: '😔',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => state.stats?.lastPlace === true
    },
    weekendVoetballer: {
        id: 'weekendVoetballer',
        name: 'Weekendvoetballer',
        description: 'Speel op zaterdag',
        category: CATEGORIES.SEASON,
        icon: '📅',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.saturdayMatches || 0) >= 1
    },
    trouweSupporter: {
        id: 'trouweSupporter',
        name: 'Trouwe Supporter',
        description: '7 dagen streak',
        category: CATEGORIES.SEASON,
        icon: '❤️',
        reward: { playerXP: 100 },
        check: (state) => (state.dailyRewards?.streak || 0) >= 7,
        progress: { value: (state) => state.dailyRewards?.streak || 0, target: 7 }
    },
    twoWeekStreak: {
        id: 'twoWeekStreak',
        name: 'Fanatiekeling',
        description: '14 dagen streak',
        category: CATEGORIES.SEASON,
        icon: '🔥',
        reward: { playerXP: 150 },
        check: (state) => (state.dailyRewards?.streak || 0) >= 14,
        progress: { value: (state) => state.dailyRewards?.streak || 0, target: 14 }
    },
    monthStreak: {
        id: 'monthStreak',
        name: 'Maandheld',
        description: '30 dagen streak',
        category: CATEGORIES.SEASON,
        icon: '🔥',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => (state.dailyRewards?.streak || 0) >= 30,
        progress: { value: (state) => state.dailyRewards?.streak || 0, target: 30 }
    },
    earlyBird: {
        id: 'earlyBird',
        name: 'Vroege Vogel',
        description: 'Speel voor 9 uur \'s ochtends',
        category: CATEGORIES.SEASON,
        icon: '🐦',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => new Date().getHours() < 9
    },
    midnight: {
        id: 'midnight',
        name: 'Nachtbraker',
        description: 'Speel na middernacht',
        category: CATEGORIES.SEASON,
        icon: '🌙',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => state.stats?.playedAtMidnight === true
    },
    topHalf: {
        id: 'topHalf',
        name: 'Bovenin Meedoen',
        description: 'Eindig in bovenste helft',
        category: CATEGORIES.SEASON,
        icon: '📊',
        reward: { playerXP: 40 },
        check: (state) => (state.stats?.topHalfFinish || 0) >= 1
    },
    runnerUp: {
        id: 'runnerUp',
        name: 'Net Niet',
        description: '2e worden',
        category: CATEGORIES.SEASON,
        icon: '🥈',
        reward: { playerXP: 60 },
        check: (state) => (state.stats?.runnerUp || 0) >= 1
    },
    lastDayPromotion: {
        id: 'lastDayPromotion',
        name: 'Hartaanval',
        description: 'Promoveer op de laatste speeldag',
        category: CATEGORIES.SEASON,
        icon: '💓',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => state.stats?.lastDayPromotion === true
    },
    comebackSeason: {
        id: 'comebackSeason',
        name: 'Opgestaan',
        description: 'Promoveer na degradatie',
        category: CATEGORIES.SEASON,
        icon: '🔄',
        hidden: true,
        reward: { playerXP: 150 },
        check: (state) => state.stats?.comebackPromotion === true
    },

    // ================================================================
    // SPELER — SPECIAL (20) — playerXP
    // ================================================================
    derdeHelft: {
        id: 'derdeHelft',
        name: 'Derde Helft',
        description: '10 comebacks gemaakt',
        category: CATEGORIES.SPECIAL,
        icon: '🍺',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.comebacks || 0) >= 10,
        progress: { value: (state) => state.stats?.comebacks || 0, target: 10 }
    },
    kantinedienst: {
        id: 'kantinedienst',
        name: 'Kantinedienst',
        description: 'Kantine op niveau 3',
        category: CATEGORIES.SPECIAL,
        icon: '🍟',
        reward: { playerXP: 50 },
        check: (state) => state.stadium.kantine === 'kantine_3'
    },
    lokaleHeld: {
        id: 'lokaleHeld',
        name: 'Lokale Held',
        description: '20 thuiswinsten',
        category: CATEGORIES.SPECIAL,
        icon: '🏠',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.homeWins || 0) >= 20,
        progress: { value: (state) => state.stats?.homeWins || 0, target: 20 }
    },
    centurion: {
        id: 'centurion',
        name: 'Centurion',
        description: '100 clean sheets',
        category: CATEGORIES.SPECIAL,
        icon: '💯',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 100,
        progress: { value: (state) => state.stats?.cleanSheets || 0, target: 100 }
    },
    ironDefense: {
        id: 'ironDefense',
        name: 'IJzeren Defensie',
        description: '5 clean sheets op rij',
        category: CATEGORIES.SPECIAL,
        icon: '🧱',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.cleanSheetStreak || 0) >= 5,
        progress: { value: (state) => state.stats?.cleanSheetStreak || 0, target: 5 }
    },
    silentAssassin: {
        id: 'silentAssassin',
        name: 'Stille Moordenaar',
        description: '5x winst met 1-0',
        category: CATEGORIES.SPECIAL,
        icon: '🤫',
        hidden: true,
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.oneNilWins || 0) >= 5,
        progress: { value: (state) => state.stats?.oneNilWins || 0, target: 5 }
    },
    dedicatedManager: {
        id: 'dedicatedManager',
        name: 'Perfectionistisch',
        description: 'Alle dagelijkse taken afgevinkt',
        category: CATEGORIES.SPECIAL,
        icon: '📋',
        hidden: true,
        reward: { playerXP: 50 },
        check: (state) => {
            const tasks = state.dailyTasks || [];
            return tasks.length > 0 && tasks.every(t => t.completed);
        }
    },
    firstTraining: {
        id: 'firstTraining',
        name: 'Ballen Trappen',
        description: 'Eerste individuele training',
        category: CATEGORIES.SPECIAL,
        icon: '⚽',
        reward: { playerXP: 15 },
        check: (state) => (state.stats?.trainingSessions || 0) >= 1,
        progress: { value: (state) => state.stats?.trainingSessions || 0, target: 1 }
    },
    tenTrainings: {
        id: 'tenTrainings',
        name: 'Vaste Trainingspartner',
        description: '10 trainingen',
        category: CATEGORIES.SPECIAL,
        icon: '🏋️',
        reward: { playerXP: 40 },
        check: (state) => (state.stats?.trainingSessions || 0) >= 10,
        progress: { value: (state) => state.stats?.trainingSessions || 0, target: 10 }
    },
    fiftyTrainings: {
        id: 'fiftyTrainings',
        name: 'Zweetdruppels',
        description: '50 trainingen',
        category: CATEGORIES.SPECIAL,
        icon: '💦',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.trainingSessions || 0) >= 50,
        progress: { value: (state) => state.stats?.trainingSessions || 0, target: 50 }
    },
    playerLevelUp: {
        id: 'playerLevelUp',
        name: 'Upgrade',
        description: 'Je speler bereikt level 2',
        category: CATEGORIES.SPECIAL,
        icon: '⬆️',
        reward: { playerXP: 25 },
        check: (state) => {
            const level = state.myPlayer?.level || 1;
            return level >= 2;
        }
    },
    playerLevel5: {
        id: 'playerLevel5',
        name: 'Talent In Bloei',
        description: 'Level 5 bereikt',
        category: CATEGORIES.SPECIAL,
        icon: '🌸',
        reward: { playerXP: 50 },
        check: (state) => {
            const level = state.myPlayer?.level || 1;
            return level >= 5;
        }
    },
    playerLevel10: {
        id: 'playerLevel10',
        name: 'Volwassen Voetballer',
        description: 'Level 10 bereikt',
        category: CATEGORIES.SPECIAL,
        icon: '🌟',
        reward: { playerXP: 100 },
        check: (state) => {
            const level = state.myPlayer?.level || 1;
            return level >= 10;
        }
    },
    overallUp: {
        id: 'overallUp',
        name: 'E\u00e9n Ster Beter',
        description: 'Je speler krijgt een ster erbij',
        category: CATEGORIES.SPECIAL,
        icon: '⭐',
        reward: { playerXP: 50 },
        check: (state) => state.stats?.myPlayerStarsUp === true
    },
    topScorerLeague: {
        id: 'topScorerLeague',
        name: 'Clubtopscorer',
        description: 'Meeste goals in je team',
        category: CATEGORIES.SPECIAL,
        icon: '🥇',
        reward: { playerXP: 100 },
        check: (state) => {
            if (!state.myPlayer) return false;
            const mp = state.players?.find(p => p && p.id === 'myplayer');
            if (!mp) return false;
            const mpGoals = mp.goals || 0;
            if (mpGoals === 0) return false;
            return state.players.every(p => !p || p.id === 'myplayer' || (p.goals || 0) <= mpGoals);
        }
    },
    motmFirst: {
        id: 'motmFirst',
        name: 'Ster Van De Wedstrijd',
        description: 'Eerste man of the match',
        category: CATEGORIES.SPECIAL,
        icon: '⭐',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.myPlayerMotm || 0) >= 1,
        progress: { value: (state) => state.stats?.myPlayerMotm || 0, target: 1 }
    },
    motmFive: {
        id: 'motmFive',
        name: 'Vaste Uitblinker',
        description: '5x man of the match',
        category: CATEGORIES.SPECIAL,
        icon: '⭐',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.myPlayerMotm || 0) >= 5,
        progress: { value: (state) => state.stats?.myPlayerMotm || 0, target: 5 }
    },
    motmTen: {
        id: 'motmTen',
        name: 'Onbetwiste Ster',
        description: '10x man of the match',
        category: CATEGORIES.SPECIAL,
        icon: '🌟',
        reward: { playerXP: 150 },
        check: (state) => (state.stats?.myPlayerMotm || 0) >= 10,
        progress: { value: (state) => state.stats?.myPlayerMotm || 0, target: 10 }
    },
    playAllPositions: {
        id: 'playAllPositions',
        name: 'Alleskunner',
        description: '4+ posities gespeeld',
        category: CATEGORIES.SPECIAL,
        icon: '🔄',
        hidden: true,
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.uniquePositions?.length || 0) >= 4,
        progress: { value: (state) => state.stats?.uniquePositions?.length || 0, target: 4 }
    },
    maxEnergy: {
        id: 'maxEnergy',
        name: 'Fris Als Een Hoentje',
        description: 'Win met 100% energie',
        category: CATEGORIES.SPECIAL,
        icon: '💪',
        reward: { playerXP: 25 },
        check: (state) => state.stats?.energy100Win === true
    },

    // ================================================================
    // MANAGER — CLUB (40) — managerXP
    // ================================================================
    skipTutorial: {
        id: 'skipTutorial',
        name: 'Ik Kan Echt Alles Zelf',
        description: 'Skip de rondleiding',
        category: CATEGORIES.CLUB,
        icon: '🏃',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => state.stats?.skippedTutorial === true
    },
    completeTutorial: {
        id: 'completeTutorial',
        name: 'Hou Me Bij De Hand Vast',
        description: 'Voltooi de rondleiding',
        category: CATEGORIES.CLUB,
        icon: '🤝',
        hidden: true,
        reward: { managerXP: 50 },
        check: (state) => state.stats?.completedTutorial === true
    },
    skippedTutorialHalfway: {
        id: 'skippedTutorialHalfway',
        name: 'Man Man Man',
        description: 'Skip halverwege de rondleiding',
        category: CATEGORIES.CLUB,
        icon: '🤦',
        hidden: true,
        reward: { managerXP: 10 },
        check: (state) => state.stats?.skippedTutorialHalfway === true
    },
    firstSponsor: {
        id: 'firstSponsor',
        name: 'Geef me brood b*tch',
        description: 'Teken je eerste sponsor',
        category: CATEGORIES.CLUB,
        icon: '🤝',
        reward: { managerXP: 25 },
        check: (state) => {
            const sponsors = state.sponsors || {};
            return Object.values(sponsors).some(s => s && s.name) || !!state.sponsor;
        }
    },
    fullSponsors: {
        id: 'fullSponsors',
        name: 'Sponsormagneet',
        description: 'Alle sponsorplekken bezet',
        category: CATEGORIES.CLUB,
        icon: '💼',
        reward: { managerXP: 100 },
        check: (state) => {
            return state.sponsor && state.sponsorSlots?.bord;
        }
    },
    fiveHundredK: {
        id: 'fiveHundredK',
        name: 'Halve Ton',
        description: '\u20ac500k budget',
        category: CATEGORIES.CLUB,
        icon: '💰',
        reward: { managerXP: 50 },
        check: (state) => state.club.budget >= 500000
    },
    millionaire: {
        id: 'millionaire',
        name: 'Miljonair',
        description: '\u20ac1M budget',
        category: CATEGORIES.CLUB,
        icon: '💰',
        reward: { managerXP: 100 },
        check: (state) => state.club.budget >= 1000000
    },
    fiveMillion: {
        id: 'fiveMillion',
        name: 'Vetpot',
        description: '\u20ac5M budget',
        category: CATEGORIES.CLUB,
        icon: '💎',
        reward: { managerXP: 200 },
        check: (state) => state.club.budget >= 5000000
    },
    tenMillion: {
        id: 'tenMillion',
        name: 'Tycoon',
        description: '\u20ac10M budget',
        category: CATEGORIES.CLUB,
        icon: '💎',
        reward: { managerXP: 250 },
        check: (state) => state.club.budget >= 10000000
    },
    highReputation: {
        id: 'highReputation',
        name: 'Bekende Club',
        description: '50 reputatie',
        category: CATEGORIES.CLUB,
        icon: '⭐',
        reward: { managerXP: 50 },
        check: (state) => state.club.reputation >= 50
    },
    topReputation: {
        id: 'topReputation',
        name: 'Topclub',
        description: '90 reputatie',
        category: CATEGORIES.CLUB,
        icon: '🌟',
        reward: { managerXP: 250 },
        check: (state) => state.club.reputation >= 90
    },
    hundredReputation: {
        id: 'hundredReputation',
        name: 'Topclub van NL',
        description: '100 reputatie',
        category: CATEGORIES.CLUB,
        icon: '⭐',
        reward: { managerXP: 250 },
        check: (state) => state.club.reputation >= 100
    },
    promotion: {
        id: 'promotion',
        name: 'Kampioen!',
        description: 'Eerste promotie',
        category: CATEGORIES.CLUB,
        icon: '⬆️',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.promotions || 0) >= 1,
        progress: { value: (state) => state.stats?.promotions || 0, target: 1 }
    },
    twoPromotions: {
        id: 'twoPromotions',
        name: 'Tweemaal Prijs',
        description: '2 promoties',
        category: CATEGORIES.CLUB,
        icon: '⬆️',
        reward: { managerXP: 150 },
        check: (state) => (state.stats?.promotions || 0) >= 2,
        progress: { value: (state) => state.stats?.promotions || 0, target: 2 }
    },
    backToBack: {
        id: 'backToBack',
        name: 'Back-to-Back',
        description: '2 promoties op rij',
        category: CATEGORIES.CLUB,
        icon: '🔄',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.consecutivePromotions || 0) >= 2,
        progress: { value: (state) => state.stats?.consecutivePromotions || 0, target: 2 }
    },
    threePromotions: {
        id: 'threePromotions',
        name: 'Stijgende Ster',
        description: '3 promoties',
        category: CATEGORIES.CLUB,
        icon: '🌟',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.promotions || 0) >= 3,
        progress: { value: (state) => state.stats?.promotions || 0, target: 3 }
    },
    fivePromotions: {
        id: 'fivePromotions',
        name: 'Liftboy',
        description: '5 promoties',
        category: CATEGORIES.CLUB,
        icon: '🛗',
        reward: { managerXP: 500 },
        check: (state) => (state.stats?.promotions || 0) >= 5,
        progress: { value: (state) => state.stats?.promotions || 0, target: 5 }
    },
    title: {
        id: 'title',
        name: 'Landskampioen',
        description: 'Win de Eredivisie',
        category: CATEGORIES.CLUB,
        icon: '🏆',
        reward: { managerXP: 250 },
        check: (state) => (state.club.stats?.titles || 0) >= 1,
        progress: { value: (state) => state.club.stats?.titles || 0, target: 1 }
    },
    threeTitles: {
        id: 'threeTitles',
        name: 'Dynastie',
        description: '3 landstitels',
        category: CATEGORIES.CLUB,
        icon: '👑',
        reward: { managerXP: 500 },
        check: (state) => (state.club.stats?.titles || 0) >= 3,
        progress: { value: (state) => state.club.stats?.titles || 0, target: 3 }
    },
    secondDivision: {
        id: 'secondDivision',
        name: 'Tweede Divisie',
        description: 'Bereik divisie 3+',
        category: CATEGORIES.CLUB,
        icon: '🥈',
        reward: { managerXP: 150 },
        check: (state) => state.club.division <= 3
    },
    topFlight: {
        id: 'topFlight',
        name: 'De Top Bereikt',
        description: 'Bereik Eredivisie',
        category: CATEGORIES.CLUB,
        icon: '🏛️',
        reward: { managerXP: 500 },
        check: (state) => state.club.division === 0
    },
    moneyball: {
        id: 'moneyball',
        name: 'Moneyball',
        description: 'Promoveer met laagste budget',
        category: CATEGORIES.CLUB,
        icon: '🎬',
        hidden: true,
        reward: { managerXP: 150 },
        check: (state) => state.stats?.moneyballPromotion === true
    },
    bigSpender: {
        id: 'bigSpender',
        name: 'Grote Spender',
        description: '\u20ac500k in 1 seizoen uitgegeven',
        category: CATEGORIES.CLUB,
        icon: '💸',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.seasonSpending || 0) >= 500000
    },
    firstTransfer: {
        id: 'firstTransfer',
        name: 'Nieuwe Aanwinst',
        description: 'Koop eerste speler',
        category: CATEGORIES.CLUB,
        icon: '🛒',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.totalTransfers || 0) >= 1,
        progress: { value: (state) => state.stats?.totalTransfers || 0, target: 1 }
    },
    fiveTransfers: {
        id: 'fiveTransfers',
        name: 'Draaideurbeid',
        description: '5 transfers',
        category: CATEGORIES.CLUB,
        icon: '🚪',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.totalTransfers || 0) >= 5,
        progress: { value: (state) => state.stats?.totalTransfers || 0, target: 5 }
    },
    tenTransfers: {
        id: 'tenTransfers',
        name: 'Transfervrij',
        description: '10 transfers',
        category: CATEGORIES.CLUB,
        icon: '🚪',
        reward: { managerXP: 75 },
        check: (state) => (state.stats?.totalTransfers || 0) >= 10,
        progress: { value: (state) => state.stats?.totalTransfers || 0, target: 10 }
    },
    twentyFiveTransfers: {
        id: 'twentyFiveTransfers',
        name: 'Transfer Tycoon',
        description: '25 transfers',
        category: CATEGORIES.CLUB,
        icon: '🏦',
        reward: { managerXP: 150 },
        check: (state) => (state.stats?.totalTransfers || 0) >= 25,
        progress: { value: (state) => state.stats?.totalTransfers || 0, target: 25 }
    },
    firstScout: {
        id: 'firstScout',
        name: 'Speurwerk',
        description: 'Eerste scoutmissie',
        category: CATEGORIES.CLUB,
        icon: '🔍',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.totalScoutMissions || 0) >= 1,
        progress: { value: (state) => state.stats?.totalScoutMissions || 0, target: 1 }
    },
    fiveScouts: {
        id: 'fiveScouts',
        name: 'Spionnetje',
        description: '5 scoutmissies',
        category: CATEGORIES.CLUB,
        icon: '🕵️',
        reward: { managerXP: 40 },
        check: (state) => (state.stats?.totalScoutMissions || 0) >= 5,
        progress: { value: (state) => state.stats?.totalScoutMissions || 0, target: 5 }
    },
    twentyFiveScouts: {
        id: 'twentyFiveScouts',
        name: 'Talentenjager',
        description: '25 scoutmissies',
        category: CATEGORIES.CLUB,
        icon: '🎯',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.totalScoutMissions || 0) >= 25,
        progress: { value: (state) => state.stats?.totalScoutMissions || 0, target: 25 }
    },
    hireFirstStaff: {
        id: 'hireFirstStaff',
        name: 'Eerste Medewerker',
        description: 'Neem eerste staflid aan',
        category: CATEGORIES.CLUB,
        icon: '👤',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.staffHired || 0) >= 1,
        progress: { value: (state) => state.stats?.staffHired || 0, target: 1 }
    },
    hireFourStaff: {
        id: 'hireFourStaff',
        name: 'Technische Staf Compleet',
        description: '4 stafleden',
        category: CATEGORIES.CLUB,
        icon: '👥',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.staffHired || 0) >= 4,
        progress: { value: (state) => state.stats?.staffHired || 0, target: 4 }
    },
    fireStaff: {
        id: 'fireStaff',
        name: 'Bedankt Voor De Dienst',
        description: 'Ontsla een staflid',
        category: CATEGORIES.CLUB,
        icon: '👋',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.staffFired || 0) >= 1
    },
    almostBroke: {
        id: 'almostBroke',
        name: 'Bijna Failliet',
        description: 'Minder dan \u20ac100 budget',
        category: CATEGORIES.CLUB,
        icon: '💸',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => state.club.budget < 100 && state.club.budget >= 0
    },
    sellPlayer: {
        id: 'sellPlayer',
        name: 'Kassa!',
        description: 'Verkoop een speler',
        category: CATEGORIES.CLUB,
        icon: '💰',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.totalSales || 0) >= 1,
        progress: { value: (state) => state.stats?.totalSales || 0, target: 1 }
    },
    fiveSales: {
        id: 'fiveSales',
        name: 'Uitverkoop',
        description: '5 verkopen',
        category: CATEGORIES.CLUB,
        icon: '🏷️',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.totalSales || 0) >= 5,
        progress: { value: (state) => state.stats?.totalSales || 0, target: 5 }
    },
    divisionChampion: {
        id: 'divisionChampion',
        name: 'Divisiekampioen',
        description: 'Eindig bovenaan',
        category: CATEGORIES.CLUB,
        icon: '🥇',
        reward: { managerXP: 75 },
        check: (state) => (state.stats?.champion || 0) >= 1,
        progress: { value: (state) => state.stats?.champion || 0, target: 1 }
    },
    threeChampions: {
        id: 'threeChampions',
        name: 'Kampioenenverzamelaar',
        description: '3x kampioen',
        category: CATEGORIES.CLUB,
        icon: '🏆',
        reward: { managerXP: 150 },
        check: (state) => (state.stats?.champion || 0) >= 3,
        progress: { value: (state) => state.stats?.champion || 0, target: 3 }
    },
    budgetPositive: {
        id: 'budgetPositive',
        name: 'Zwarte Cijfers',
        description: 'Eindig seizoen met winst',
        category: CATEGORIES.CLUB,
        icon: '📈',
        reward: { managerXP: 25 },
        check: (state) => state.stats?.budgetPositive === true
    },

    // ================================================================
    // MANAGER — PLAYERS (30) — managerXP
    // ================================================================
    youthGraduate: {
        id: 'youthGraduate',
        name: 'Kweekvijver',
        description: 'Eerste jeugddoorstromer',
        category: CATEGORIES.PLAYERS,
        icon: '🌱',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 1,
        progress: { value: (state) => state.stats?.youthGraduates || 0, target: 1 }
    },
    fiveYouthGrads: {
        id: 'fiveYouthGrads',
        name: 'Jeugdopleiding',
        description: '5 jeugddoorstromers',
        category: CATEGORIES.PLAYERS,
        icon: '🏫',
        reward: { managerXP: 75 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 5,
        progress: { value: (state) => state.stats?.youthGraduates || 0, target: 5 }
    },
    tenYouthGraduates: {
        id: 'tenYouthGraduates',
        name: 'Jeugdacademie',
        description: '10 jeugddoorstromers',
        category: CATEGORIES.PLAYERS,
        icon: '🏫',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 10,
        progress: { value: (state) => state.stats?.youthGraduates || 0, target: 10 }
    },
    twentyYouthGrads: {
        id: 'twentyYouthGrads',
        name: 'Jeugdopleider',
        description: '20 jeugddoorstromers',
        category: CATEGORIES.PLAYERS,
        icon: '🎓',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 20,
        progress: { value: (state) => state.stats?.youthGraduates || 0, target: 20 }
    },
    topScorer: {
        id: 'topScorer',
        name: 'Topscorer',
        description: 'Speler met 20+ goals',
        category: CATEGORIES.PLAYERS,
        icon: '🥇',
        reward: { managerXP: 50 },
        check: (state) => state.players.some(p => (p.goals || 0) >= 20)
    },
    topScorer50: {
        id: 'topScorer50',
        name: 'Goalgetter',
        description: 'Speler met 50+ goals',
        category: CATEGORIES.PLAYERS,
        icon: '🥇',
        reward: { managerXP: 100 },
        check: (state) => state.players.some(p => (p.goals || 0) >= 50)
    },
    starPlayer: {
        id: 'starPlayer',
        name: 'Sterspeler',
        description: 'Speler ALG 80+',
        category: CATEGORIES.PLAYERS,
        icon: '⭐',
        reward: { managerXP: 100 },
        check: (state) => state.players.some(p => p.overall >= 80)
    },
    legendPlayer: {
        id: 'legendPlayer',
        name: 'Legende',
        description: 'Speler ALG 90+',
        category: CATEGORIES.PLAYERS,
        icon: '👑',
        reward: { managerXP: 250 },
        check: (state) => state.players.some(p => p.overall >= 90)
    },
    fullSquad: {
        id: 'fullSquad',
        name: 'Volledige Selectie',
        description: '22 spelers',
        category: CATEGORIES.PLAYERS,
        icon: '👥',
        reward: { managerXP: 50 },
        check: (state) => state.players.length >= 22,
        progress: { value: (state) => state.players?.length || 0, target: 22 }
    },
    squadDepth: {
        id: 'squadDepth',
        name: 'Brede Selectie',
        description: '25+ spelers',
        category: CATEGORIES.PLAYERS,
        icon: '👥',
        reward: { managerXP: 75 },
        check: (state) => state.players.length >= 25,
        progress: { value: (state) => state.players?.length || 0, target: 25 }
    },
    bigSale: {
        id: 'bigSale',
        name: 'Grote Verkoop',
        description: 'Verkoop \u20ac50k+',
        category: CATEGORIES.PLAYERS,
        icon: '💸',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.highestSale || 0) >= 50000
    },
    goodTransfer: {
        id: 'goodTransfer',
        name: 'Transferkoning',
        description: 'Verkoop \u20ac100k+',
        category: CATEGORIES.PLAYERS,
        icon: '💸',
        reward: { managerXP: 75 },
        check: (state) => (state.stats?.highestSale || 0) >= 100000
    },
    hugeSale: {
        id: 'hugeSale',
        name: 'Jackpot',
        description: 'Verkoop \u20ac200k+',
        category: CATEGORIES.PLAYERS,
        icon: '🎰',
        reward: { managerXP: 150 },
        check: (state) => (state.stats?.highestSale || 0) >= 200000
    },
    youthArmy: {
        id: 'youthArmy',
        name: 'Jeugdleger',
        description: '5 jeugdspelers in selectie',
        category: CATEGORIES.PLAYERS,
        icon: '🌱',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => (state.players || []).filter(p => p.isFromYouth || p.fromYouth).length >= 5
    },
    youthStar: {
        id: 'youthStar',
        name: 'Wonderkind',
        description: 'Jeugdspeler ALG 85+',
        category: CATEGORIES.PLAYERS,
        icon: '⭐',
        hidden: true,
        reward: { managerXP: 250 },
        check: (state) => state.players.some(p => (p.isFromYouth || p.fromYouth) && p.overall >= 85)
    },
    superStar: {
        id: 'superStar',
        name: 'Superster',
        description: 'Speler gem. attr 90+',
        category: CATEGORIES.PLAYERS,
        icon: '🌟',
        reward: { managerXP: 250 },
        check: (state) => state.players.some(p => {
            const attrs = p.attributes || {};
            const vals = Object.values(attrs).filter(v => typeof v === 'number');
            return vals.length > 0 && (vals.reduce((a, b) => a + b, 0) / vals.length) >= 90;
        })
    },
    fiveStarPlayer: {
        id: 'fiveStarPlayer',
        name: 'Vijfsterrenspeler',
        description: 'Speler met 5\u2605 potentieel',
        category: CATEGORIES.PLAYERS,
        icon: '⭐',
        reward: { managerXP: 250 },
        check: (state) => state.players.some(p => (p.stars || 0) >= 5)
    },
    playerImproved: {
        id: 'playerImproved',
        name: 'Doorbraak',
        description: 'Speler +5 ALG groei',
        category: CATEGORIES.PLAYERS,
        icon: '📈',
        reward: { managerXP: 40 },
        check: (state) => state.players.some(p => (p.overallGrowth || 0) >= 5)
    },
    oldFaithful: {
        id: 'oldFaithful',
        name: 'Oude Getrouwe',
        description: 'Speler 5+ seizoenen',
        category: CATEGORIES.PLAYERS,
        icon: '🧓',
        reward: { managerXP: 75 },
        check: (state) => state.players.some(p => (p.seasonsAtClub || 0) >= 5)
    },
    allPositionsFilled: {
        id: 'allPositionsFilled',
        name: 'Elke Positie Bezet',
        description: 'Alle posities 2+ spelers',
        category: CATEGORIES.PLAYERS,
        icon: '✅',
        reward: { managerXP: 100 },
        check: (state) => {
            const groups = { goalkeeper: 0, defender: 0, midfielder: 0, attacker: 0 };
            state.players.forEach(p => {
                const pos = p.position || '';
                if (pos === 'GK') groups.goalkeeper++;
                else if (['CB', 'LB', 'RB'].includes(pos)) groups.defender++;
                else if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)) groups.midfielder++;
                else if (['ST', 'CF', 'LW', 'RW'].includes(pos)) groups.attacker++;
            });
            return Object.values(groups).every(c => c >= 2);
        }
    },
    scoutExact: {
        id: 'scoutExact',
        name: 'Perfecte Scouting',
        description: 'Scout 100% nauwkeurig',
        category: CATEGORIES.PLAYERS,
        icon: '🎯',
        reward: { managerXP: 40 },
        check: (state) => (state.stats?.exactScout || 0) >= 1,
        progress: { value: (state) => state.stats?.exactScout || 0, target: 1 }
    },
    tenExactScouts: {
        id: 'tenExactScouts',
        name: 'Talentspotter',
        description: '10 perfecte rapporten',
        category: CATEGORIES.PLAYERS,
        icon: '🎯',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.exactScout || 0) >= 10,
        progress: { value: (state) => state.stats?.exactScout || 0, target: 10 }
    },
    rejectPlayer: {
        id: 'rejectPlayer',
        name: 'Bedankt, Volgende',
        description: 'Wijs gescoute speler af',
        category: CATEGORIES.PLAYERS,
        icon: '👎',
        reward: { managerXP: 15 },
        check: (state) => (state.stats?.rejected || 0) >= 1
    },
    signScoutedPlayer: {
        id: 'signScoutedPlayer',
        name: 'Aangenomen',
        description: 'Contracteer gescoute speler',
        category: CATEGORIES.PLAYERS,
        icon: '📝',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.signedScouted || 0) >= 1
    },
    cheapTransfer: {
        id: 'cheapTransfer',
        name: 'Koopje',
        description: 'Koop speler < \u20ac200',
        category: CATEGORIES.PLAYERS,
        icon: '🏷️',
        reward: { managerXP: 25 },
        check: (state) => state.stats?.cheapTransfer === true
    },
    expensiveTransfer: {
        id: 'expensiveTransfer',
        name: 'Grote Vis',
        description: 'Koop speler \u20ac1M+',
        category: CATEGORIES.PLAYERS,
        icon: '🐋',
        reward: { managerXP: 200 },
        check: (state) => state.stats?.expensiveTransfer === true
    },
    releasePlayer: {
        id: 'releasePlayer',
        name: 'Vrije Voeten',
        description: 'Geef vrije transfer',
        category: CATEGORIES.PLAYERS,
        icon: '🕊️',
        reward: { managerXP: 15 },
        check: (state) => (state.stats?.released || 0) >= 1
    },
    captainAppointed: {
        id: 'captainAppointed',
        name: 'Ik ben de baas hier',
        description: 'Maak jezelf aanvoerder',
        category: CATEGORIES.PLAYERS,
        icon: '\u00a9',
        reward: { managerXP: 15 },
        check: (state) => state.specialists?.captain === 'myplayer'
    },
    penaltyTaker: {
        id: 'penaltyTaker',
        name: 'Strafschopnemer',
        description: 'Wijs strafschopnemer aan',
        category: CATEGORIES.PLAYERS,
        icon: '🥅',
        reward: { managerXP: 15 },
        check: (state) => !!state.specialists?.penaltyTaker
    },
    cornerTaker: {
        id: 'cornerTaker',
        name: 'Cornernemer',
        description: 'Wijs cornernemer aan',
        category: CATEGORIES.PLAYERS,
        icon: '🚩',
        reward: { managerXP: 15 },
        check: (state) => !!state.specialists?.cornerTaker
    },

    // ================================================================
    // MANAGER — STADIUM (30) — managerXP
    // ================================================================
    firstUpgrade: {
        id: 'firstUpgrade',
        name: 'Eerste Verbetering',
        description: 'Eerste stadionverbetering',
        category: CATEGORIES.STADIUM,
        icon: '🔧',
        reward: { managerXP: 25 },
        check: (state) => {
            const s = state.stadium;
            return s.capacity > 200 ||
                s.tribune !== 'tribune_1' ||
                s.grass !== 'grass_0' ||
                s.training !== 'train_1' ||
                s.medical !== 'med_0' ||
                s.academy !== 'acad_1' ||
                s.scouting !== 'scout_0' ||
                s.kantine !== 'kantine_0' ||
                s.sponsoring !== 'sponsor_0' ||
                s.perszaal !== 'pers_0' ||
                s.lighting !== null;
        }
    },
    buildKantine: {
        id: 'buildKantine',
        name: 'Biertje?',
        description: 'Bouw de kantine',
        category: CATEGORIES.STADIUM,
        icon: '🍺',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.kantine && state.stadium.kantine !== 'kantine_0'
    },
    buildTraining: {
        id: 'buildTraining',
        name: 'Trainingsveld',
        description: 'Bouw trainingsveld',
        category: CATEGORIES.STADIUM,
        icon: '🏃',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.training && state.stadium.training !== 'train_1'
    },
    buildMedical: {
        id: 'buildMedical',
        name: 'Dokter In Huis',
        description: 'Bouw medische staf',
        category: CATEGORIES.STADIUM,
        icon: '🏥',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.medical && state.stadium.medical !== 'med_0'
    },
    buildAcademy: {
        id: 'buildAcademy',
        name: 'Jeugdacademie Gebouwd',
        description: 'Bouw jeugdacademie',
        category: CATEGORIES.STADIUM,
        icon: '🎓',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.academy && state.stadium.academy !== 'acad_1'
    },
    buildScouting: {
        id: 'buildScouting',
        name: 'Uitkijktoren',
        description: 'Bouw scoutingscentrum',
        category: CATEGORIES.STADIUM,
        icon: '🔭',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.scouting && state.stadium.scouting !== 'scout_0'
    },
    thousandSeats: {
        id: 'thousandSeats',
        name: 'Volle Bak',
        description: '1.000 stoelen',
        category: CATEGORIES.STADIUM,
        icon: '🎉',
        reward: { managerXP: 50 },
        check: (state) => state.stadium.capacity >= 1000,
        progress: { value: (state) => state.stadium?.capacity || 0, target: 1000 }
    },
    fiveThousandSeats: {
        id: 'fiveThousandSeats',
        name: 'Mini-stadion',
        description: '5.000 stoelen',
        category: CATEGORIES.STADIUM,
        icon: '🏟️',
        reward: { managerXP: 100 },
        check: (state) => state.stadium.capacity >= 5000,
        progress: { value: (state) => state.stadium?.capacity || 0, target: 5000 }
    },
    tenThousandSeats: {
        id: 'tenThousandSeats',
        name: 'Echt Stadion',
        description: '10.000 stoelen',
        category: CATEGORIES.STADIUM,
        icon: '🏟️',
        reward: { managerXP: 150 },
        check: (state) => state.stadium.capacity >= 10000,
        progress: { value: (state) => state.stadium?.capacity || 0, target: 10000 }
    },
    hugeStadium: {
        id: 'hugeStadium',
        name: 'Mega Stadion',
        description: '20.000 stoelen',
        category: CATEGORIES.STADIUM,
        icon: '🏛️',
        reward: { managerXP: 250 },
        check: (state) => state.stadium.capacity >= 20000,
        progress: { value: (state) => state.stadium?.capacity || 0, target: 20000 }
    },
    stadiumFull: {
        id: 'stadiumFull',
        name: 'Uitverkocht',
        description: 'Eerste uitverkocht',
        category: CATEGORIES.STADIUM,
        icon: '🏟️',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.sellouts || 0) >= 1,
        progress: { value: (state) => state.stats?.sellouts || 0, target: 1 }
    },
    selloutTen: {
        id: 'selloutTen',
        name: 'Stamppot Publiek',
        description: '10 uitverkocht',
        category: CATEGORIES.STADIUM,
        icon: '🎫',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.sellouts || 0) >= 10,
        progress: { value: (state) => state.stats?.sellouts || 0, target: 10 }
    },
    fullFacilities: {
        id: 'fullFacilities',
        name: 'Compleet Complex',
        description: 'Alle faciliteiten max',
        category: CATEGORIES.STADIUM,
        icon: '🏢',
        reward: { managerXP: 250 },
        check: (state) => hasAllFacilitiesLevel3(state)
    },
    upgradeTribune: {
        id: 'upgradeTribune',
        name: 'Mooiere Stoelen',
        description: 'Tribune upgraden',
        category: CATEGORIES.STADIUM,
        icon: '💺',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.tribune && state.stadium.tribune !== 'tribune_1'
    },
    maxTribune: {
        id: 'maxTribune',
        name: 'Eredivisie-tribune',
        description: 'Tribune maximaal',
        category: CATEGORIES.STADIUM,
        icon: '💺',
        reward: { managerXP: 150 },
        check: (state) => state.stadium.tribune === 'tribune_5' || state.stadium.tribune === 'tribune_6'
    },
    upgradeGrass: {
        id: 'upgradeGrass',
        name: 'Geen Modder Meer',
        description: 'Veld verbeteren',
        category: CATEGORIES.STADIUM,
        icon: '🌿',
        reward: { managerXP: 25 },
        check: (state) => state.stadium.grass && state.stadium.grass !== 'grass_0'
    },
    maxGrass: {
        id: 'maxGrass',
        name: 'Wimbledon-gras',
        description: 'Veld maximaal',
        category: CATEGORIES.STADIUM,
        icon: '🌿',
        reward: { managerXP: 100 },
        check: (state) => state.stadium.grass === 'grass_3' || state.stadium.grass === 'grass_4'
    },
    buildHoreca: {
        id: 'buildHoreca',
        name: 'Frituurtje',
        description: 'Eerste horeca',
        category: CATEGORIES.STADIUM,
        icon: '🍟',
        reward: { managerXP: 25 },
        check: (state) => (state.stadium.horeca?.length || 0) >= 1
    },
    fullHoreca: {
        id: 'fullHoreca',
        name: 'Cateringbedrijf',
        description: 'Alle horeca gebouwd',
        category: CATEGORIES.STADIUM,
        icon: '🍽️',
        reward: { managerXP: 100 },
        check: (state) => (state.stadium.horeca?.length || 0) >= 3,
        progress: { value: (state) => state.stadium?.horeca?.length || 0, target: 3 }
    },
    buildFanshop: {
        id: 'buildFanshop',
        name: 'Sjaalverkoop',
        description: 'Eerste fanshop',
        category: CATEGORIES.STADIUM,
        icon: '🧣',
        reward: { managerXP: 25 },
        check: (state) => (state.stadium.fanshop?.length || 0) >= 1
    },
    fullFanshop: {
        id: 'fullFanshop',
        name: 'Merchandising King',
        description: 'Alle fanshop gebouwd',
        category: CATEGORIES.STADIUM,
        icon: '👕',
        reward: { managerXP: 100 },
        check: (state) => (state.stadium.fanshop?.length || 0) >= 3,
        progress: { value: (state) => state.stadium?.fanshop?.length || 0, target: 3 }
    },
    fiveUpgrades: {
        id: 'fiveUpgrades',
        name: 'Bouwvakker',
        description: '5 verbeteringen',
        category: CATEGORIES.STADIUM,
        icon: '🔨',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.stadiumUpgrades || 0) >= 5,
        progress: { value: (state) => state.stats?.stadiumUpgrades || 0, target: 5 }
    },
    tenUpgrades: {
        id: 'tenUpgrades',
        name: 'Aannemer',
        description: '10 verbeteringen',
        category: CATEGORIES.STADIUM,
        icon: '🏗️',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.stadiumUpgrades || 0) >= 10,
        progress: { value: (state) => state.stats?.stadiumUpgrades || 0, target: 10 }
    },
    twentyUpgrades: {
        id: 'twentyUpgrades',
        name: 'Projectontwikkelaar',
        description: '20 verbeteringen',
        category: CATEGORIES.STADIUM,
        icon: '🏗️',
        reward: { managerXP: 200 },
        check: (state) => (state.stats?.stadiumUpgrades || 0) >= 20,
        progress: { value: (state) => state.stats?.stadiumUpgrades || 0, target: 20 }
    },
    lightingUpgrade: {
        id: 'lightingUpgrade',
        name: 'Laat Er Licht Zijn',
        description: 'Verlichting installeren',
        category: CATEGORIES.STADIUM,
        icon: '💡',
        reward: { managerXP: 50 },
        check: (state) => state.stadium.lighting !== null
    },
    parkingUpgrade: {
        id: 'parkingUpgrade',
        name: 'Parkeerplek',
        description: 'Parkeerplaats aanleggen',
        category: CATEGORIES.STADIUM,
        icon: '🅿️',
        reward: { managerXP: 25 },
        check: (state) => (state.stadium.parking?.length || 0) >= 1
    },
    allFacilitiesBuilt: {
        id: 'allFacilitiesBuilt',
        name: 'Alles Op Z\'n Plek',
        description: 'Alle faciliteittypes gebouwd',
        category: CATEGORIES.STADIUM,
        icon: '✅',
        reward: { managerXP: 150 },
        check: (state) => {
            const s = state.stadium;
            return s.training !== 'train_1' &&
                s.medical !== 'med_0' &&
                s.academy !== 'acad_1' &&
                s.scouting !== 'scout_0' &&
                s.kantine !== 'kantine_0';
        }
    },
    threeConstructions: {
        id: 'threeConstructions',
        name: 'Druk Druk Druk',
        description: '3 bouwprojecten voltooid',
        category: CATEGORIES.STADIUM,
        icon: '🚧',
        reward: { managerXP: 40 },
        check: (state) => (state.stats?.stadiumUpgrades || 0) >= 3,
        progress: { value: (state) => state.stats?.stadiumUpgrades || 0, target: 3 }
    },
    tenConstructions: {
        id: 'tenConstructions',
        name: 'Bob De Bouwer',
        description: 'VIP-lounge gebouwd',
        category: CATEGORIES.STADIUM,
        icon: '🚧',
        reward: { managerXP: 100 },
        check: (state) => (state.stadium.vip?.length || 0) >= 1
    },
    fiftyKStadium: {
        id: 'fiftyKStadium',
        name: 'Geldverslinder',
        description: '\u20ac50k aan stadion besteed',
        category: CATEGORIES.STADIUM,
        icon: '💸',
        reward: { managerXP: 75 },
        check: (state) => (state.stats?.stadiumSpending || 0) >= 50000
    },

    // ================================================================
    // MANAGER — SPECIAL (11) — managerXP
    // ================================================================
    joseMourinho: {
        id: 'joseMourinho',
        name: 'I am Jose Mourinho',
        description: 'Speel een wedstrijd met 0% tactische bekendheid',
        category: CATEGORIES.SPECIAL,
        icon: '🧠',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => state.stats?.playedZeroDrive === true
    },
    rinusMichels: {
        id: 'rinusMichels',
        name: 'Rinus Michels zei dat het kon',
        description: 'Zet een speler op een verkeerde positie in de opstelling',
        category: CATEGORIES.SPECIAL,
        icon: '🔀',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.placedWrongPosition === true
    },
    slechtGokje: {
        id: 'slechtGokje',
        name: 'Hmm, dat was een slecht gokje',
        description: 'Koop een speler van de transfermarkt die slecht blijkt te zijn',
        category: CATEGORIES.SPECIAL,
        icon: '🎰',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => state.stats?.boughtBadPlayer === true
    },
    louterUpside: {
        id: 'louterUpside',
        name: 'Kweekvijver',
        description: 'Upgrade je jeugdacademie',
        category: CATEGORIES.SPECIAL,
        icon: '🎓',
        reward: { managerXP: 25 },
        check: (state) => {
            const acad = state.stadium?.academy || 'acad_1';
            const level = parseInt(acad.split('_')[1]) || 1;
            return level >= 2;
        }
    },
    thanksFrans: {
        id: 'thanksFrans',
        name: 'Dit noem je nou echte vrienden',
        description: 'Klik op het Bugs-tabblad',
        category: CATEGORIES.SPECIAL,
        icon: '🐛',
        hidden: true,
        reward: { managerXP: 10 },
        check: (state) => state.stats?.visitedBugsTab === true
    },
    lycurgusLegende: {
        id: 'lycurgusLegende',
        name: 'Lycurgus Legende',
        description: 'Kies Vishandel Smit als shirtsponsor',
        category: CATEGORIES.SPECIAL,
        icon: '🐟',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.choseVishandelSmit === true
    },
    halloDavid: {
        id: 'halloDavid',
        name: 'Hallo David',
        description: 'Budget zakt onder \u20ac1.000',
        category: CATEGORIES.SPECIAL,
        icon: '💸',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => state.stats?.budgetBelow1000 === true
    },
    ikNoemJouMessi: {
        id: 'ikNoemJouMessi',
        name: 'Ik noem jou\u2026. Messi',
        description: 'Contracteer een speler met minstens \u00bd ster potentieel',
        category: CATEGORIES.SPECIAL,
        icon: '⭐',
        reward: { managerXP: 20 },
        check: (state) => state.stats?.signedHighPotential === true
    },
    watIsEenScout: {
        id: 'watIsEenScout',
        name: 'Wat is een scout?',
        description: 'Contracteer een speler zonder te scouten',
        category: CATEGORIES.SPECIAL,
        icon: '🔍',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.signedUnscouted === true
    },
    vaderTeleurgesteld: {
        id: 'vaderTeleurgesteld',
        name: 'Wat zal je vader teleurgesteld zijn',
        description: 'Ontsla een jeugdspeler',
        category: CATEGORIES.SPECIAL,
        icon: '😢',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.dismissedYouth === true
    },
    pardonOpa: {
        id: 'pardonOpa',
        name: 'Pardon opa, mensen proberen te voetballen',
        description: 'Ontsla een speler ouder dan 45',
        category: CATEGORIES.SPECIAL,
        icon: '👴',
        hidden: true,
        reward: { managerXP: 20 },
        check: (state) => state.stats?.firedOldPlayer === true
    },
    alsofVerstand: {
        id: 'alsofVerstand',
        name: 'You are smart, got it',
        description: 'Pas je formatie aan',
        category: CATEGORIES.SPECIAL,
        icon: '📋',
        reward: { managerXP: 15 },
        check: (state) => state.stats?.changedFormation === true
    },
    tevredenKlant: {
        id: 'tevredenKlant',
        name: 'En weer een tevreden klant',
        description: 'Kies intimico als shirtsponsor',
        category: CATEGORIES.SPECIAL,
        icon: '👔',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => state.sponsor?.id === 'intimico'
    },
    lafaard: {
        id: 'lafaard',
        name: 'Lafaard',
        description: 'Zet de tactiek op Zeer Verdedigend',
        category: CATEGORIES.SPECIAL,
        icon: '🐔',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.usedZeerVerdedigend === true
    },
    dezeManSnapt: {
        id: 'dezeManSnapt',
        name: 'Deze man snapt het',
        description: 'Zet de tactiek op Leeroy Jenkins',
        category: CATEGORIES.SPECIAL,
        icon: '⚔️',
        hidden: true,
        reward: { managerXP: 15 },
        check: (state) => state.stats?.usedLeeroy === true
    },
    ditVoeltAlsWerk: {
        id: 'ditVoeltAlsWerk',
        name: 'Louter Upside',
        description: 'Bekijk de financiën',
        category: CATEGORIES.SPECIAL,
        icon: '📊',
        hidden: true,
        reward: { managerXP: 10 },
        check: (state) => state.stats?.visitedFinances === true
    },
    loveYouFrans: {
        id: 'loveYouFrans',
        name: 'Muchas Bedankt',
        description: 'Verstuur een bugreport',
        category: CATEGORIES.SPECIAL,
        icon: '💌',
        hidden: true,
        reward: { managerXP: 20 },
        check: (state) => state.stats?.submittedBugReport === true
    }
};

/**
 * Helper function to check all facilities at level 3
 */
function hasAllFacilitiesLevel3(state) {
    const facilities = ['training', 'medical', 'academy', 'scouting'];
    return facilities.every(f => {
        const value = state.stadium[f];
        return value && value.endsWith('_3');
    });
}

/**
 * Initialize achievements state
 */
export function initAchievements() {
    const achievements = {};
    for (const id of Object.keys(ACHIEVEMENTS)) {
        achievements[id] = {
            unlocked: false,
            unlockedAt: null
        };
    }
    return achievements;
}

/**
 * Check all achievements and return newly unlocked ones
 */
export function checkAchievements(gameState) {
    if (!gameState.achievements) {
        gameState.achievements = initAchievements();
    }

    const newlyUnlocked = [];

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        // Skip already unlocked
        if (gameState.achievements[id]?.unlocked) continue;

        // Skip division-locked achievements
        if (achievement.minDivision !== undefined && (gameState.club?.division || 8) > achievement.minDivision) continue;

        // Check if achievement condition is met
        try {
            if (achievement.check(gameState)) {
                // Unlock achievement
                gameState.achievements[id] = {
                    unlocked: true,
                    unlockedAt: Date.now()
                };

                newlyUnlocked.push({
                    ...achievement,
                    id
                });
            }
        } catch (error) {
            console.error(`Error checking achievement ${id}:`, error);
        }
    }

    return newlyUnlocked;
}

/**
 * Get achievement by ID
 */
export function getAchievement(id) {
    return ACHIEVEMENTS[id];
}

/**
 * Get all achievements with their unlock status
 */
export function getAllAchievements(gameState) {
    const result = [];

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        const entry = {
            ...achievement,
            id,
            unlocked: gameState.achievements?.[id]?.unlocked || false,
            unlockedAt: gameState.achievements?.[id]?.unlockedAt || null
        };

        // Compute progress for achievements with numeric targets
        if (achievement.progress && !entry.unlocked) {
            try {
                const current = Math.min(achievement.progress.value(gameState), achievement.progress.target);
                entry.progressCurrent = current;
                entry.progressTarget = achievement.progress.target;
            } catch (e) {
                // Ignore errors in progress computation
            }
        }

        result.push(entry);
    }

    return result;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(gameState, category) {
    return getAllAchievements(gameState).filter(a => a.category === category);
}

/**
 * Get achievement progress stats
 */
export function getAchievementStats(gameState) {
    const all = getAllAchievements(gameState);
    const unlocked = all.filter(a => a.unlocked);

    const byCategory = {};
    for (const category of Object.values(CATEGORIES)) {
        const categoryAchievements = all.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => a.unlocked);
        byCategory[category] = {
            total: categoryAchievements.length,
            unlocked: categoryUnlocked.length,
            progress: categoryAchievements.length > 0
                ? Math.round((categoryUnlocked.length / categoryAchievements.length) * 100)
                : 0
        };
    }

    return {
        total: all.length,
        unlocked: unlocked.length,
        progress: Math.round((unlocked.length / all.length) * 100),
        byCategory
    };
}

/**
 * Get recently unlocked achievements
 */
export function getRecentAchievements(gameState, limit = 5) {
    return getAllAchievements(gameState)
        .filter(a => a.unlocked && a.unlockedAt)
        .sort((a, b) => b.unlockedAt - a.unlockedAt)
        .slice(0, limit);
}

export { ACHIEVEMENTS, CATEGORIES, DIVISION_NAMES };
