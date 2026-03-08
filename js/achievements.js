/**
 * ZATERDAGVOETBAL - Achievements Module
 * Track and unlock achievements for long-term goals
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

// All achievements in the game
const ACHIEVEMENTS = {
    // ================================================
    // MATCH ACHIEVEMENTS (all playerXP)
    // ================================================
    firstMatch: {
        id: 'firstMatch',
        name: 'Debuut',
        description: 'Speel je eerste wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 15 },
        check: (state) => (state.club?.stats?.totalMatches || 0) >= 1
    },
    firstWin: {
        id: 'firstWin',
        name: 'Eerste Overwinning',
        description: 'Win je eerste wedstrijd',
        category: CATEGORIES.MATCHES,
        icon: '🏆',
        reward: { playerXP: 25 },
        check: (state) => state.club.stats.totalMatches > 0 && hasWonMatch(state)
    },
    tenMatches: {
        id: 'tenMatches',
        name: 'Debuutseizoen',
        description: 'Speel 10 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '⚽',
        reward: { playerXP: 25 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 10
    },
    tenWins: {
        id: 'tenWins',
        name: 'Routinier',
        description: 'Win 10 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🎖️',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.wins || 0) >= 10
    },
    threeWinsInRow: {
        id: 'threeWinsInRow',
        name: 'Op Dreef',
        description: 'Win 3 wedstrijden op rij',
        category: CATEGORIES.MATCHES,
        icon: '🔥',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.currentWinStreak || 0) >= 3
    },
    unbeatenRun: {
        id: 'unbeatenRun',
        name: 'Ongeslagen',
        description: 'Blijf 5 wedstrijden ongeslagen',
        category: CATEGORIES.MATCHES,
        icon: '🛡️',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.currentUnbeaten || 0) >= 5
    },
    cleanSheet: {
        id: 'cleanSheet',
        name: 'De Nul',
        description: 'Houd je doel schoon',
        category: CATEGORIES.MATCHES,
        icon: '🧤',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 1
    },
    fiveWinsInRow: {
        id: 'fiveWinsInRow',
        name: 'Onstuitbaar',
        description: 'Win 5 wedstrijden op rij',
        category: CATEGORIES.MATCHES,
        icon: '💪',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.currentWinStreak || 0) >= 5
    },
    tenCleanSheets: {
        id: 'tenCleanSheets',
        name: 'Verdedigingswall',
        description: 'Houd 10 keer je doel schoon',
        category: CATEGORIES.MATCHES,
        icon: '🧱',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.cleanSheets || 0) >= 10
    },
    comeback: {
        id: 'comeback',
        name: 'Comeback King',
        description: 'Win een wedstrijd na achterstand',
        category: CATEGORIES.MATCHES,
        icon: '🔄',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.comebacks || 0) >= 1
    },
    neverGiveUp: {
        id: 'neverGiveUp',
        name: 'Nooit Opgeven',
        description: 'Maak 5 comebacks',
        category: CATEGORIES.MATCHES,
        icon: '💪',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.comebacks || 0) >= 5
    },
    fiftyWins: {
        id: 'fiftyWins',
        name: 'Winnaar',
        description: 'Win 50 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏅',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.wins || 0) >= 50
    },
    hundredMatches: {
        id: 'hundredMatches',
        name: 'Clubicoon',
        description: 'Speel 100 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏟️',
        reward: { playerXP: 150 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 100
    },
    hundredWins: {
        id: 'hundredWins',
        name: 'Meester',
        description: 'Win 100 wedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '👑',
        reward: { playerXP: 250 },
        check: (state) => (state.stats?.wins || 0) >= 100
    },
    homeKing: {
        id: 'homeKing',
        name: 'Thuiskoning',
        description: 'Win 10 thuiswedstrijden',
        category: CATEGORIES.MATCHES,
        icon: '🏠',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.homeWins || 0) >= 10
    },
    tenDraws: {
        id: 'tenDraws',
        name: 'Puntendeler',
        description: '10 gelijke spelen',
        category: CATEGORIES.MATCHES,
        icon: '🤝',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.draws || 0) >= 10
    },

    // ================================================
    // GOAL ACHIEVEMENTS (all playerXP)
    // ================================================
    firstGoal: {
        id: 'firstGoal',
        name: 'Eerste Doelpunt',
        description: 'Scoor je eerste doelpunt',
        category: CATEGORIES.GOALS,
        icon: '⚽',
        reward: { playerXP: 25 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 1
    },
    tenGoals: {
        id: 'tenGoals',
        name: 'Doelpuntenmaker',
        description: 'Scoor 10 doelpunten',
        category: CATEGORIES.GOALS,
        icon: '⚽',
        reward: { playerXP: 50 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 10
    },
    hatTrick: {
        id: 'hatTrick',
        name: 'Hattrick Held',
        description: 'Een speler scoort een hattrick',
        category: CATEGORIES.GOALS,
        icon: '🎩',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.hatTricks || 0) >= 1
    },
    fiftyGoals: {
        id: 'fiftyGoals',
        name: 'Doelpuntenfabriek',
        description: 'Scoor 50 doelpunten',
        category: CATEGORIES.GOALS,
        icon: '🎯',
        reward: { playerXP: 75 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 50
    },
    fiveGoalsMatch: {
        id: 'fiveGoalsMatch',
        name: 'Kansenregen',
        description: 'Scoor 5+ doelpunten in één wedstrijd',
        category: CATEGORIES.GOALS,
        icon: '🌧️',
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.highestScoreMatch || 0) >= 5
    },
    threeHatTricks: {
        id: 'threeHatTricks',
        name: 'Hattrick Koning',
        description: 'Maak 3 hattricks',
        category: CATEGORIES.GOALS,
        icon: '🎩',
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.hatTricks || 0) >= 3
    },
    hundredGoals: {
        id: 'hundredGoals',
        name: 'Goaltjesdief',
        description: 'Scoor 100 doelpunten',
        category: CATEGORIES.GOALS,
        icon: '💯',
        reward: { playerXP: 150 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 100
    },
    twoHundredGoals: {
        id: 'twoHundredGoals',
        name: 'Topscorer Aller Tijden',
        description: 'Scoor 200 doelpunten',
        category: CATEGORIES.GOALS,
        icon: '👑',
        reward: { playerXP: 250 },
        check: (state) => (state.club.stats?.totalGoals || 0) >= 200
    },
    goalMachine: {
        id: 'goalMachine',
        name: 'Goalmachine',
        description: '25 doelpunten in 1 seizoen',
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

    // ================================================
    // SEASON ACHIEVEMENTS (mix playerXP & managerXP)
    // ================================================
    surviveRelegation: {
        id: 'surviveRelegation',
        name: 'Op Het Nippertje',
        description: 'Ontsnap aan degradatie (eindig 6e)',
        category: CATEGORIES.SEASON,
        icon: '😅',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.relegationEscapes || 0) >= 1
    },
    fiveSeasons: {
        id: 'fiveSeasons',
        name: 'Veteraan',
        description: '5 seizoenen gespeeld',
        category: CATEGORIES.SEASON,
        icon: '📅',
        reward: { playerXP: 50 },
        check: (state) => (state.season || 1) >= 5
    },
    tenSeasons: {
        id: 'tenSeasons',
        name: 'Clublegende',
        description: '10 seizoenen gespeeld',
        category: CATEGORIES.SEASON,
        icon: '🏛️',
        reward: { playerXP: 250 },
        check: (state) => (state.season || 1) >= 10
    },
    promotion: {
        id: 'promotion',
        name: 'Kampioen!',
        description: 'Promoveer naar een hogere divisie',
        category: CATEGORIES.SEASON,
        icon: '⬆️',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.promotions || 0) >= 1
    },
    backToBack: {
        id: 'backToBack',
        name: 'Back-to-Back',
        description: '2 promoties op rij',
        category: CATEGORIES.SEASON,
        icon: '🔄',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.consecutivePromotions || 0) >= 2
    },
    threePromotions: {
        id: 'threePromotions',
        name: 'Stijgende Ster',
        description: 'Promoveer 3 keer',
        category: CATEGORIES.SEASON,
        icon: '🌟',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.promotions || 0) >= 3
    },
    title: {
        id: 'title',
        name: 'Landskampioen',
        description: 'Word kampioen van je divisie',
        category: CATEGORIES.SEASON,
        icon: '🏆',
        reward: { managerXP: 250 },
        check: (state) => (state.club.stats?.titles || 0) >= 1
    },
    threeTitles: {
        id: 'threeTitles',
        name: 'Dynastie',
        description: 'Win 3 kampioenschappen',
        category: CATEGORIES.SEASON,
        icon: '👑',
        reward: { managerXP: 500 },
        check: (state) => (state.club.stats?.titles || 0) >= 3
    },
    secondDivision: {
        id: 'secondDivision',
        name: 'Tweede Divisie',
        description: 'Bereik de Tweede Divisie',
        category: CATEGORIES.SEASON,
        icon: '🥈',
        reward: { managerXP: 150 },
        check: (state) => state.club.division <= 3
    },
    topFlight: {
        id: 'topFlight',
        name: 'De Top Bereikt',
        description: 'Bereik de Eredivisie',
        category: CATEGORIES.SEASON,
        icon: '🏛️',
        reward: { managerXP: 500 },
        minDivision: 4,
        check: (state) => state.club.division === 0
    },
    yoyo: {
        id: 'yoyo',
        name: 'Jojo Club',
        description: 'Promoveer en degradeer in opeenvolgende seizoenen',
        category: CATEGORIES.SEASON,
        icon: '🪀',
        hidden: true,
        reward: { playerXP: 50 },
        check: (state) => state.stats?.yoyoClub === true
    },

    // ================================================
    // CLUB ACHIEVEMENTS (all managerXP)
    // ================================================
    firstSponsor: {
        id: 'firstSponsor',
        name: 'Eerste Sponsor',
        description: 'Sluit een sponsordeal',
        category: CATEGORIES.CLUB,
        icon: '🤝',
        reward: { managerXP: 25 },
        check: (state) => {
            const sponsors = state.sponsors || {};
            return Object.values(sponsors).some(s => s && s.name);
        }
    },
    fullSponsors: {
        id: 'fullSponsors',
        name: 'Sponsormagneet',
        description: 'Shirt- en bordsponsor tegelijk',
        category: CATEGORIES.CLUB,
        icon: '💼',
        reward: { managerXP: 100 },
        minDivision: 6,
        check: (state) => {
            return state.sponsor && state.sponsorSlots?.bord;
        }
    },
    fiveHundredK: {
        id: 'fiveHundredK',
        name: 'Halve Ton',
        description: 'Heb €500.000 op de bank',
        category: CATEGORIES.CLUB,
        icon: '💰',
        reward: { managerXP: 50 },
        check: (state) => state.club.budget >= 500000
    },
    millionaire: {
        id: 'millionaire',
        name: 'Miljonair',
        description: 'Heb €1.000.000 op de bank',
        category: CATEGORIES.CLUB,
        icon: '💰',
        reward: { managerXP: 100 },
        minDivision: 5,
        check: (state) => state.club.budget >= 1000000
    },
    tenMillion: {
        id: 'tenMillion',
        name: 'Tycoon',
        description: 'Heb €10.000.000 op de bank',
        category: CATEGORIES.CLUB,
        icon: '💎',
        reward: { managerXP: 250 },
        minDivision: 4,
        check: (state) => state.club.budget >= 10000000
    },
    // fiftyReputation REMOVED — duplicate of highReputation
    highReputation: {
        id: 'highReputation',
        name: 'Bekende Club',
        description: 'Bereik 50 reputatie',
        category: CATEGORIES.CLUB,
        icon: '⭐',
        reward: { managerXP: 50 },
        minDivision: 6,
        check: (state) => state.club.reputation >= 50
    },
    topReputation: {
        id: 'topReputation',
        name: 'Topclub',
        description: 'Bereik 90 reputatie',
        category: CATEGORIES.CLUB,
        icon: '🌟',
        reward: { managerXP: 250 },
        minDivision: 5,
        check: (state) => state.club.reputation >= 90
    },
    hundredReputation: {
        id: 'hundredReputation',
        name: 'Topclub van Nederland',
        description: 'Bereik 100 reputatie',
        category: CATEGORIES.CLUB,
        icon: '⭐',
        reward: { managerXP: 250 },
        minDivision: 4,
        check: (state) => state.club.reputation >= 100
    },

    // ================================================
    // PLAYER ACHIEVEMENTS (all managerXP)
    // ================================================
    youthGraduate: {
        id: 'youthGraduate',
        name: 'Kweekvijver',
        description: 'Laat een jeugdspeler doorstromen',
        category: CATEGORIES.PLAYERS,
        icon: '🌱',
        reward: { managerXP: 25 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 1
    },
    tenYouthGraduates: {
        id: 'tenYouthGraduates',
        name: 'Jeugdopleiding',
        description: 'Laat 10 jeugdspelers doorstromen',
        category: CATEGORIES.PLAYERS,
        icon: '🏫',
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 10
    },
    twentyYouthGrads: {
        id: 'twentyYouthGrads',
        name: 'Jeugdopleider',
        description: 'Laat 20 jeugdspelers doorstromen',
        category: CATEGORIES.PLAYERS,
        icon: '🎓',
        reward: { managerXP: 250 },
        check: (state) => (state.stats?.youthGraduates || 0) >= 20
    },
    topScorer: {
        id: 'topScorer',
        name: 'Topscorer',
        description: 'Heb een speler met 20+ goals in een seizoen',
        category: CATEGORIES.PLAYERS,
        icon: '🥇',
        reward: { managerXP: 50 },
        check: (state) => state.players.some(p => (p.goals || 0) >= 20)
    },
    starPlayer: {
        id: 'starPlayer',
        name: 'Sterspeler',
        description: 'Heb een speler met 80+ overall',
        category: CATEGORIES.PLAYERS,
        icon: '⭐',
        reward: { managerXP: 100 },
        minDivision: 6,
        check: (state) => state.players.some(p => p.overall >= 80)
    },
    legendPlayer: {
        id: 'legendPlayer',
        name: 'Legende',
        description: 'Heb een speler met 90+ overall',
        category: CATEGORIES.PLAYERS,
        icon: '👑',
        reward: { managerXP: 250 },
        minDivision: 5,
        check: (state) => state.players.some(p => p.overall >= 90)
    },
    superStar: {
        id: 'superStar',
        name: 'Superster',
        description: 'Heb een speler met 90+ gemiddeld',
        category: CATEGORIES.PLAYERS,
        icon: '🌟',
        reward: { managerXP: 250 },
        minDivision: 5,
        check: (state) => state.players.some(p => {
            const attrs = p.attributes || {};
            const vals = Object.values(attrs).filter(v => typeof v === 'number');
            return vals.length > 0 && (vals.reduce((a, b) => a + b, 0) / vals.length) >= 90;
        })
    },
    fullSquad: {
        id: 'fullSquad',
        name: 'Volledige Selectie',
        description: 'Heb 22 spelers in je selectie',
        category: CATEGORIES.PLAYERS,
        icon: '👥',
        reward: { managerXP: 50 },
        check: (state) => state.players.length >= 22
    },
    bigSale: {
        id: 'bigSale',
        name: 'Kassa!',
        description: 'Verkoop een speler voor €50.000+',
        category: CATEGORIES.PLAYERS,
        icon: '💸',
        reward: { managerXP: 50 },
        minDivision: 6,
        check: (state) => (state.stats?.highestSale || 0) >= 50000
    },
    goodTransfer: {
        id: 'goodTransfer',
        name: 'Transferkoning',
        description: 'Verkoop een speler voor €100.000+',
        category: CATEGORIES.PLAYERS,
        icon: '💸',
        reward: { managerXP: 75 },
        minDivision: 5,
        check: (state) => (state.stats?.highestSale || 0) >= 100000
    },
    hugeSale: {
        id: 'hugeSale',
        name: 'Jackpot',
        description: 'Verkoop een speler voor €200.000+',
        category: CATEGORIES.PLAYERS,
        icon: '🎰',
        reward: { managerXP: 150 },
        minDivision: 5,
        check: (state) => (state.stats?.highestSale || 0) >= 200000
    },

    // ================================================
    // STADIUM ACHIEVEMENTS (all managerXP)
    // ================================================
    thousandSeats: {
        id: 'thousandSeats',
        name: 'Volle Bak',
        description: '1.000 stoeltjes in je stadion',
        category: CATEGORIES.STADIUM,
        icon: '🎉',
        reward: { managerXP: 50 },
        check: (state) => state.stadium.capacity >= 1000
    },
    // bigStadium REMOVED — duplicate of fiveThousandSeats
    fiveThousandSeats: {
        id: 'fiveThousandSeats',
        name: 'Mini-stadion',
        description: '5.000 capaciteit bereikt',
        category: CATEGORIES.STADIUM,
        icon: '🏟️',
        reward: { managerXP: 100 },
        minDivision: 6,
        check: (state) => state.stadium.capacity >= 5000
    },
    hugeStadium: {
        id: 'hugeStadium',
        name: 'Mega Stadion',
        description: 'Bereik 20.000 stadioncapaciteit',
        category: CATEGORIES.STADIUM,
        icon: '🏛️',
        reward: { managerXP: 250 },
        minDivision: 5,
        check: (state) => state.stadium.capacity >= 20000
    },
    stadiumFull: {
        id: 'stadiumFull',
        name: 'Uitverkocht',
        description: 'Vul je stadion volledig',
        category: CATEGORIES.STADIUM,
        icon: '🏟️',
        reward: { managerXP: 50 },
        check: (state) => (state.stats?.sellouts || 0) >= 1
    },
    fullFacilities: {
        id: 'fullFacilities',
        name: 'Compleet Complex',
        description: 'Upgrade alle faciliteiten naar niveau 3',
        category: CATEGORIES.STADIUM,
        icon: '🏢',
        reward: { managerXP: 250 },
        check: (state) => hasAllFacilitiesLevel3(state)
    },
    firstUpgrade: {
        id: 'firstUpgrade',
        name: 'Eerste Verbetering',
        description: 'Eerste stadion-upgrade',
        category: CATEGORIES.STADIUM,
        icon: '🔧',
        hidden: true,
        reward: { managerXP: 25 },
        check: (state) => {
            const s = state.stadium;
            // Compare against initial defaults from state.js
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

    // ================================================
    // SPECIAL ACHIEVEMENTS (playerXP)
    // ================================================
    derdeHelft: {
        id: 'derdeHelft',
        name: 'Derde Helft',
        description: 'Speel 50 wedstrijden (ervaar de echte clubcultuur)',
        category: CATEGORIES.SPECIAL,
        icon: '🍺',
        reward: { playerXP: 50 },
        check: (state) => (state.club.stats?.totalMatches || 0) >= 50
    },
    kantinedienst: {
        id: 'kantinedienst',
        name: 'Kantinedienst',
        description: 'Upgrade de kantine naar niveau 3',
        category: CATEGORIES.SPECIAL,
        icon: '🍟',
        reward: { playerXP: 50 },
        check: (state) => state.stadium.kantine === 'kantine_3'
    },
    trouweSupporter: {
        id: 'trouweSupporter',
        name: 'Trouwe Supporter',
        description: 'Log 7 dagen achter elkaar in',
        category: CATEGORIES.SPECIAL,
        icon: '❤️',
        reward: { playerXP: 100 },
        check: (state) => (state.dailyRewards?.streak || 0) >= 7
    },
    weekendVoetballer: {
        id: 'weekendVoetballer',
        name: 'Weekendvoetballer',
        description: 'Speel een wedstrijd op zaterdag',
        category: CATEGORIES.SPECIAL,
        icon: '📅',
        reward: { playerXP: 25 },
        check: (state) => (state.stats?.saturdayMatches || 0) >= 1
    },
    saturdayTen: {
        id: 'saturdayTen',
        name: 'Zaterdagspeler',
        description: 'Speel 10 wedstrijden op zaterdag',
        category: CATEGORIES.SPECIAL,
        icon: '⚽',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.saturdayMatches || 0) >= 10
    },
    lokaleHeld: {
        id: 'lokaleHeld',
        name: 'Lokale Held',
        description: 'Win 10 thuiswedstrijden',
        category: CATEGORIES.SPECIAL,
        icon: '🏠',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.homeWins || 0) >= 10
    },
    selloutTen: {
        id: 'selloutTen',
        name: 'Uitverkocht!',
        description: '10x een uitverkocht stadion',
        category: CATEGORIES.SPECIAL,
        icon: '🎫',
        reward: { playerXP: 50 },
        check: (state) => (state.stats?.sellouts || 0) >= 10
    },

    // Hidden special achievements
    perfectSeason: {
        id: 'perfectSeason',
        name: 'Perfect Seizoen',
        description: 'Win alle wedstrijden in een seizoen',
        category: CATEGORIES.SPECIAL,
        icon: '🏆',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => state.stats?.perfectSeason === true
    },
    scoreTen: {
        id: 'scoreTen',
        name: 'Doelpuntenfestijn',
        description: 'Scoor 10+ doelpunten in één wedstrijd',
        category: CATEGORIES.SPECIAL,
        icon: '🎯',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.highestScoreMatch || 0) >= 10
    },
    midnight: {
        id: 'midnight',
        name: 'Nachtbraker',
        description: 'Speel om middernacht',
        category: CATEGORIES.SPECIAL,
        icon: '🌙',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => state.stats?.playedAtMidnight === true
    },
    almostRelegation: {
        id: 'almostRelegation',
        name: 'Degradatiespook',
        description: 'Ontsnap 3x aan degradatie',
        category: CATEGORIES.SPECIAL,
        icon: '😱',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.relegationEscapes || 0) >= 3
    },
    youthStar: {
        id: 'youthStar',
        name: 'Wonderkind',
        description: 'Train een jeugdspeler naar 85+ overall',
        category: CATEGORIES.SPECIAL,
        icon: '⭐',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => state.players.some(p => p.fromYouth && p.overall >= 85)
    },
    noLoss: {
        id: 'noLoss',
        name: 'Onverslaanbaar',
        description: 'Heel seizoen ongeslagen',
        category: CATEGORIES.SPECIAL,
        icon: '🛡️',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => {
            const history = state.matchHistory || [];
            const seasonHistory = history.filter(h => h.season === state.season);
            return seasonHistory.length >= 14 && seasonHistory.every(m => m.resultType !== 'loss');
        }
    },
    centurion: {
        id: 'centurion',
        name: 'Centurion',
        description: '100 zeges behaald',
        category: CATEGORIES.SPECIAL,
        icon: '💯',
        hidden: true,
        reward: { playerXP: 250 },
        check: (state) => (state.stats?.wins || 0) >= 100
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

    // New hidden achievements
    earlyBird: {
        id: 'earlyBird',
        name: 'Vroege Vogel',
        description: 'Speel voor 9 uur \'s ochtends',
        category: CATEGORIES.SPECIAL,
        icon: '🐦',
        hidden: true,
        reward: { playerXP: 25 },
        check: (state) => new Date().getHours() < 9
    },
    drawSpecialist: {
        id: 'drawSpecialist',
        name: 'Gelijkspel Specialist',
        description: '5 gelijkspelen op rij',
        category: CATEGORIES.MATCHES,
        icon: '🤝',
        hidden: true,
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.drawStreak || 0) >= 5
    },
    silentAssassin: {
        id: 'silentAssassin',
        name: 'Stille Moordenaar',
        description: 'Win 5 wedstrijden met 1-0',
        category: CATEGORIES.MATCHES,
        icon: '🤫',
        hidden: true,
        reward: { playerXP: 75 },
        check: (state) => (state.stats?.oneNilWins || 0) >= 5
    },
    youthArmy: {
        id: 'youthArmy',
        name: 'Jeugdleger',
        description: '5+ jeugdspelers in selectie',
        category: CATEGORIES.PLAYERS,
        icon: '🌱',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => (state.players || []).filter(p => p.isFromYouth || p.fromYouth).length >= 5
    },
    ironDefense: {
        id: 'ironDefense',
        name: 'IJzeren Defensie',
        description: '5 clean sheets op rij',
        category: CATEGORIES.MATCHES,
        icon: '🧱',
        hidden: true,
        reward: { playerXP: 100 },
        check: (state) => (state.stats?.cleanSheetStreak || 0) >= 5
    },
    bigSpender: {
        id: 'bigSpender',
        name: 'Grote Spender',
        description: 'Geef €500k+ uit aan transfers in 1 seizoen',
        category: CATEGORIES.CLUB,
        icon: '💸',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => (state.stats?.seasonSpending || 0) >= 500000
    },
    moneyball: {
        id: 'moneyball',
        name: 'Moneyball',
        description: 'Promoveer met het laagste budget',
        category: CATEGORIES.SEASON,
        icon: '🎬',
        hidden: true,
        reward: { managerXP: 150 },
        check: (state) => state.stats?.moneyballPromotion === true
    },
    skipTutorial: {
        id: 'skipTutorial',
        name: 'Ik Kan Echt Alles Zelf',
        description: 'Sla de rondleiding over',
        category: CATEGORIES.SPECIAL,
        icon: '🏃',
        hidden: true,
        reward: { managerXP: 100 },
        check: (state) => state.stats?.skippedTutorial === true
    },
    completeTutorial: {
        id: 'completeTutorial',
        name: 'Hou Me Bij De Hand Vast',
        description: 'Voltooi de rondleiding',
        category: CATEGORIES.SPECIAL,
        icon: '🤝',
        hidden: true,
        reward: { managerXP: 50 },
        check: (state) => state.stats?.completedTutorial === true
    },
    skippedTutorialHalfway: {
        id: 'skippedTutorialHalfway',
        name: 'Man Man Man',
        description: 'Neem dan gewoon geen rondleiding',
        category: CATEGORIES.SPECIAL,
        icon: '🤦',
        hidden: true,
        reward: { managerXP: 10 },
        check: (state) => state.stats?.skippedTutorialHalfway === true
    }
};

/**
 * Helper function to check if player has won a match
 */
function hasWonMatch(state) {
    return (state.stats?.wins || 0) >= 1;
}

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
        result.push({
            ...achievement,
            id,
            unlocked: gameState.achievements?.[id]?.unlocked || false,
            unlockedAt: gameState.achievements?.[id]?.unlockedAt || null
        });
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
