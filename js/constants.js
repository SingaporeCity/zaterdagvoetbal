/**
 * ZATERDAGVOETBAL - Constants Module
 * All game data and constants
 */

export const DIVISIONS = [
    { id: 8, name: '6e Klasse', minAttr: 5, maxAttr: 35, avgAttr: 20, budget: 5000, salary: { min: 0, avg: 50, max: 200 }, ticketPrice: 4 },
    { id: 7, name: '5e Klasse', minAttr: 10, maxAttr: 45, avgAttr: 28, budget: 15000, salary: { min: 25, avg: 100, max: 400 }, ticketPrice: 5 },
    { id: 6, name: '4e Klasse', minAttr: 15, maxAttr: 55, avgAttr: 35, budget: 40000, salary: { min: 50, avg: 200, max: 800 }, ticketPrice: 7 },
    { id: 5, name: '3e Klasse', minAttr: 20, maxAttr: 65, avgAttr: 43, budget: 100000, salary: { min: 100, avg: 400, max: 1500 }, ticketPrice: 10 },
    { id: 4, name: '2e Klasse', minAttr: 30, maxAttr: 75, avgAttr: 52, budget: 300000, salary: { min: 200, avg: 800, max: 3000 }, ticketPrice: 12 },
    { id: 3, name: '1e Klasse', minAttr: 40, maxAttr: 82, avgAttr: 61, budget: 1000000, salary: { min: 500, avg: 2000, max: 7500 }, ticketPrice: 15 },
    { id: 2, name: 'Tweede Divisie', minAttr: 50, maxAttr: 88, avgAttr: 69, budget: 5000000, salary: { min: 2000, avg: 7500, max: 25000 }, ticketPrice: 22 },
    { id: 1, name: 'Eerste Divisie', minAttr: 60, maxAttr: 93, avgAttr: 76, budget: 20000000, salary: { min: 7500, avg: 25000, max: 100000 }, ticketPrice: 32 },
    { id: 0, name: 'Eredivisie', minAttr: 70, maxAttr: 99, avgAttr: 84, budget: 100000000, salary: { min: 25000, avg: 100000, max: 500000 }, ticketPrice: 50 }
];

export const NATIONALITIES = [
    { code: 'NL', name: 'Nederlands', flag: '🇳🇱', bonus: { VER: 3, passing: 5 } },
    { code: 'BE', name: 'Belgisch', flag: '🇧🇪', bonus: { AAN: 4, FYS: 4 } },
    { code: 'DE', name: 'Duits', flag: '🇩🇪', bonus: { FYS: 5, discipline: 3 } },
    { code: 'BR', name: 'Braziliaans', flag: '🇧🇷', bonus: { SNE: 7, VER: -2 } },
    { code: 'AR', name: 'Argentijns', flag: '🇦🇷', bonus: { AAN: 5, passion: 3 } },
    { code: 'ES', name: 'Spaans', flag: '🇪🇸', bonus: { AAN: 5, passing: 5 } },
    { code: 'GB', name: 'Engels', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', bonus: { FYS: 5, heading: 3 } },
    { code: 'FR', name: 'Frans', flag: '🇫🇷', bonus: { SNE: 5, AAN: 3 } },
    { code: 'PT', name: 'Portugees', flag: '🇵🇹', bonus: { SNE: 5, dribbling: 3 } },
    { code: 'IT', name: 'Italiaans', flag: '🇮🇹', bonus: { VER: 5, tactical: 3 } },
    { code: 'PL', name: 'Pools', flag: '🇵🇱', bonus: { FYS: 4, VER: 3 } },
    { code: 'HR', name: 'Kroatisch', flag: '🇭🇷', bonus: { AAN: 5, VER: 2 } },
    { code: 'RS', name: 'Servisch', flag: '🇷🇸', bonus: { FYS: 4, AAN: 3 } },
    { code: 'DK', name: 'Deens', flag: '🇩🇰', bonus: { FYS: 4, teamwork: 3 } },
    { code: 'SE', name: 'Zweeds', flag: '🇸🇪', bonus: { FYS: 5, SNE: 2 } },
    { code: 'NO', name: 'Noors', flag: '🇳🇴', bonus: { FYS: 5, stamina: 3 } },
    { code: 'GH', name: 'Ghanees', flag: '🇬🇭', bonus: { SNE: 5, FYS: 3 } },
    { code: 'NG', name: 'Nigeriaans', flag: '🇳🇬', bonus: { SNE: 5, AAN: 3 } },
    { code: 'CM', name: 'Kameroens', flag: '🇨🇲', bonus: { FYS: 5, SNE: 3 } },
    { code: 'MA', name: 'Marokkaans', flag: '🇲🇦', bonus: { SNE: 5, AAN: 3 } },
    { code: 'TR', name: 'Turks', flag: '🇹🇷', bonus: { passion: 5, AAN: 3 } },
    { code: 'JP', name: 'Japans', flag: '🇯🇵', bonus: { SNE: 5, discipline: 5 } },
    { code: 'KR', name: 'Zuid-Koreaans', flag: '🇰🇷', bonus: { stamina: 5, discipline: 3 } },
    { code: 'US', name: 'Amerikaans', flag: '🇺🇸', bonus: { FYS: 4, SNE: 3 } }
];

export const POSITIONS = {
    keeper: { name: 'Keeper', abbr: 'KEE', color: '#f9a825', group: 'goalkeeper', weights: { REF: 0.45, BAL: 0.30, SNE: 0.15, FYS: 0.10 } },
    linksback: { name: 'Linksback', abbr: 'LB', color: '#2196f3', group: 'defender', weights: { VER: 0.35, SNE: 0.30, FYS: 0.25, AAN: 0.10 } },
    centraleVerdediger: { name: 'Centrale Verdediger', abbr: 'CV', color: '#1976d2', group: 'defender', weights: { VER: 0.45, FYS: 0.35, SNE: 0.15, AAN: 0.05 } },
    rechtsback: { name: 'Rechtsback', abbr: 'RB', color: '#2196f3', group: 'defender', weights: { VER: 0.35, SNE: 0.30, FYS: 0.25, AAN: 0.10 } },
    linksMid: { name: 'Links Middenvelder', abbr: 'LM', color: '#4caf50', group: 'midfielder', weights: { SNE: 0.30, AAN: 0.30, VER: 0.20, FYS: 0.20 } },
    centraleMid: { name: 'Centrale Middenvelder', abbr: 'CM', color: '#4caf50', group: 'midfielder', weights: { VER: 0.30, AAN: 0.30, FYS: 0.20, SNE: 0.20 } },
    rechtsMid: { name: 'Rechts Middenvelder', abbr: 'RM', color: '#4caf50', group: 'midfielder', weights: { SNE: 0.30, AAN: 0.30, VER: 0.20, FYS: 0.20 } },
    linksbuiten: { name: 'Linksbuiten', abbr: 'LW', color: '#9c27b0', group: 'attacker', weights: { SNE: 0.35, AAN: 0.35, FYS: 0.15, VER: 0.15 } },
    rechtsbuiten: { name: 'Rechtsbuiten', abbr: 'RW', color: '#9c27b0', group: 'attacker', weights: { SNE: 0.35, AAN: 0.35, FYS: 0.15, VER: 0.15 } },
    spits: { name: 'Spits', abbr: 'ST', color: '#9c27b0', group: 'attacker', weights: { AAN: 0.45, SNE: 0.25, FYS: 0.20, VER: 0.10 } }
};

export const PLAYER_TAGS = {
    keeper: {
        REF: { name: 'Katachtige Keeper', bonus: { reflexes: 15, diving: 10 } },
        BAL: { name: 'Veilige Keeper', bonus: { catching: 12, positioning: 8 } },
        SNE: { name: 'Sweeper-Keeper', bonus: { saves_outside: 10, rushing: 8 } },
        FYS: { name: 'Kolos-Keeper', bonus: { aerial: 15, intimidation: 10 } }
    },
    linksback: {
        SNE: { name: 'Snelle Back', bonus: { pace: 12, crossing: 8 } },
        VER: { name: 'Defensieve Back', bonus: { tackling: 10, positioning: 8 } },
        AAN: { name: 'Aanvallende Back', bonus: { crossing: 12, assists: 10 } },
        FYS: { name: 'Fysieke Back', bonus: { stamina: 10, strength: 8 } }
    },
    centraleVerdediger: {
        FYS: { name: 'Kolos', bonus: { heading: 15, tackling: 10 } },
        VER: { name: 'Muur', bonus: { positioning: 12, tackling: 8 } },
        SNE: { name: 'Snelle Verdediger', bonus: { pace: 10, interception: 8 } },
        AAN: { name: 'Opbouwende Verdediger', bonus: { passing: 12, longballs: 8 } }
    },
    rechtsback: {
        SNE: { name: 'Snelle Back', bonus: { pace: 12, crossing: 8 } },
        VER: { name: 'Defensieve Back', bonus: { tackling: 10, positioning: 8 } },
        AAN: { name: 'Aanvallende Back', bonus: { crossing: 12, assists: 10 } },
        FYS: { name: 'Fysieke Back', bonus: { stamina: 10, strength: 8 } }
    },
    linksMid: {
        SNE: { name: 'Snelle Vleugelspeler', bonus: { pace: 12, dribbling: 8 } },
        VER: { name: 'Verdedigende Vleugelspeler', bonus: { tackling: 10, positioning: 8 } },
        AAN: { name: 'Aanvallende Vleugelspeler', bonus: { assists: 12, crossing: 10 } },
        FYS: { name: 'Fysieke Vleugelspeler', bonus: { stamina: 12, strength: 8 } }
    },
    centraleMid: {
        VER: { name: 'Destroyer', bonus: { interception: 15, tackling: 10 } },
        FYS: { name: 'Box-to-Box', bonus: { stamina: 10, allround: 8 } },
        SNE: { name: 'Dynamische Middenvelder', bonus: { dribbling: 10, pressing: 8 } },
        AAN: { name: 'Aanvallende Middenvelder', bonus: { shooting: 12, positioning: 8 } }
    },
    rechtsMid: {
        SNE: { name: 'Snelle Vleugelspeler', bonus: { pace: 12, dribbling: 8 } },
        VER: { name: 'Verdedigende Vleugelspeler', bonus: { tackling: 10, positioning: 8 } },
        AAN: { name: 'Aanvallende Vleugelspeler', bonus: { assists: 12, crossing: 10 } },
        FYS: { name: 'Fysieke Vleugelspeler', bonus: { stamina: 12, strength: 8 } }
    },
    linksbuiten: {
        SNE: { name: 'Snelle Vleugelspits', bonus: { pace: 15, counter: 10 } },
        AAN: { name: 'Doelgerichte Buitenspeler', bonus: { finishing: 12, cutting_inside: 8 } },
        FYS: { name: 'Fysieke Buitenspeler', bonus: { strength: 10, heading: 8 } },
        VER: { name: 'Hardwerkende Buitenspeler', bonus: { pressing: 10, tackling: 6 } }
    },
    rechtsbuiten: {
        SNE: { name: 'Snelle Vleugelspits', bonus: { pace: 15, counter: 10 } },
        AAN: { name: 'Doelgerichte Buitenspeler', bonus: { finishing: 12, cutting_inside: 8 } },
        FYS: { name: 'Fysieke Buitenspeler', bonus: { strength: 10, heading: 8 } },
        VER: { name: 'Hardwerkende Buitenspeler', bonus: { pressing: 10, tackling: 6 } }
    },
    spits: {
        FYS: { name: 'Bonkige Spits', bonus: { heading: 15, holdup: 12 } },
        SNE: { name: 'Snelle Spits', bonus: { counter: 15, pace: 10 } },
        AAN: { name: 'Doelpuntenmachine', bonus: { finishing: 18, positioning: 5 } },
        VER: { name: 'Hardwerkende Spits', bonus: { pressing: 12, holdup: 8 } }
    }
};

export const PERSONALITIES = {
    good: ['Leider', 'Professional', 'Loyaal', 'Mentor', 'Perfectionist'],
    neutral: ['Ambitieus', 'Verlegen', 'Einzelganger'],
    bad: ['Feestbeest', 'Lui', 'Arrogant', 'Temperamentvol', 'Geldwolf']
};

export const DUTCH_FIRST_NAMES = [
    'Jan', 'Pieter', 'Henk', 'Klaas', 'Willem', 'Sander', 'Thijs', 'Daan', 'Lars', 'Jesse',
    'Joris', 'Bram', 'Niels', 'Jeroen', 'Martijn', 'Kevin', 'Stefan', 'Dennis', 'Tim', 'Bas',
    'Rick', 'Robin', 'Mark', 'Erik', 'Ruben', 'Tom', 'Mike', 'Jens', 'Frank', 'Wouter',
    'Mohammed', 'Ahmed', 'Youssef', 'Ibrahim', 'Omar', 'Lucas', 'Noah', 'Finn', 'Sem', 'Levi'
];

export const DUTCH_LAST_NAMES = [
    'de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer',
    'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk',
    'Vermeer', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Koster', 'Willems', 'van Leeuwen',
    'El Amrani', 'Özdemir', 'Silva', 'Santos', 'Garcia', 'Martinez', 'Andersen', 'Nielsen'
];

export const TACTICS = {
    mentality: [
        { id: 'defensive', name: 'Verdedigend', icon: '🛡️', effect: { defense: 15, attack: -10 } },
        { id: 'balanced', name: 'Gebalanceerd', icon: '⚖️', effect: { defense: 0, attack: 0 } },
        { id: 'attacking', name: 'Aanvallend', icon: '⚔️', effect: { defense: -10, attack: 15 } },
        { id: 'ultra_attacking', name: 'Ultra Aanvallend', icon: '🔥', effect: { defense: -20, attack: 25 } }
    ],
    pressing: [
        { id: 'low', name: 'Laag Blok', icon: '📉', effect: { stamina: 10, pressing: -15 } },
        { id: 'medium', name: 'Medium Druk', icon: '📊', effect: { stamina: 0, pressing: 0 } },
        { id: 'high', name: 'Hoge Druk', icon: '📈', effect: { stamina: -15, pressing: 20 } },
        { id: 'gegenpressing', name: 'Gegenpressing', icon: '⚡', effect: { stamina: -25, pressing: 30, recovery: 20 } }
    ],
    passingStyle: [
        { id: 'direct', name: 'Direct Spel', icon: '➡️', effect: { longballs: 15, possession: -10 } },
        { id: 'mixed', name: 'Gemengd', icon: '🔀', effect: { longballs: 0, possession: 0 } },
        { id: 'possession', name: 'Balbezit', icon: '🔄', effect: { longballs: -10, possession: 15 } },
        { id: 'tiki_taka', name: 'Tiki-Taka', icon: '🎯', effect: { longballs: -20, possession: 25, requires_tec: 60 } }
    ],
    tempo: [
        { id: 'slow', name: 'Langzaam', icon: '🐢', effect: { control: 10, surprise: -10 } },
        { id: 'normal', name: 'Normaal', icon: '🚶', effect: { control: 0, surprise: 0 } },
        { id: 'fast', name: 'Snel', icon: '🏃', effect: { control: -10, surprise: 15 } },
        { id: 'counter', name: 'Counter', icon: '⚡', effect: { control: -15, surprise: 25, counter: 20 } }
    ],
    width: [
        { id: 'narrow', name: 'Smal', icon: '↔️', effect: { central: 15, wide: -10 } },
        { id: 'normal', name: 'Normaal', icon: '⬜', effect: { central: 0, wide: 0 } },
        { id: 'wide', name: 'Breed', icon: '↕️', effect: { central: -10, wide: 15 } }
    ]
};

export const STAFF_TYPES = {
    fysio: {
        name: 'Fysiotherapeut',
        icon: '🏥',
        description: 'Versnelt herstel van blessures',
        effect: 'Herstel -25%',
        minDivision: 5,
        cost: 500,
        weeklySalary: 150
    },
    scout: {
        name: 'Talentscout',
        icon: '🔭',
        description: 'Verhoogt kans op succesvolle scouts',
        effect: 'Scout +15%',
        minDivision: 5,
        cost: 750,
        weeklySalary: 200
    },
    dokter: {
        name: 'Clubarts',
        icon: '👨‍⚕️',
        description: 'Vermindert kans op blessures',
        effect: 'Blessure -20%',
        minDivision: 5,
        cost: 1000,
        weeklySalary: 250
    }
};

export const ASSISTANT_TRAINERS = {
    attacking: {
        name: 'Aanvallende Assistent',
        icon: '⚔️',
        description: 'Specialist in aanvallend spel',
        effect: '+20% AAN training',
        boostStats: ['AAN'],
        boostAmount: 0.2,
        cost: 300,
        weeklySalary: 100
    },
    defensive: {
        name: 'Verdedigende Assistent',
        icon: '🛡️',
        description: 'Specialist in verdedigend spel',
        effect: '+20% VER training',
        boostStats: ['VER'],
        boostAmount: 0.2,
        cost: 300,
        weeklySalary: 100
    },
    technical: {
        name: 'Aanvalsassistent',
        icon: '⚽',
        description: 'Verbetert aanvallend inzicht',
        effect: '+20% AAN training',
        boostStats: ['AAN'],
        boostAmount: 0.2,
        cost: 400,
        weeklySalary: 120
    },
    physical: {
        name: 'Conditietrainer',
        icon: '💪',
        description: 'Focust op fysieke ontwikkeling',
        effect: '+15% SNE & FYS training',
        boostStats: ['SNE', 'FYS'],
        boostAmount: 0.15,
        cost: 350,
        weeklySalary: 110
    }
};

export const FORMATIONS = {
    '4-4-2': {
        name: '4-4-2 Klassiek',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 15, y: 72, role: 'linksback', name: 'LB' },
            { x: 38, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 62, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 85, y: 72, role: 'rechtsback', name: 'RB' },
            { x: 15, y: 48, role: 'linksbuiten', name: 'LW' },
            { x: 38, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 62, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 85, y: 48, role: 'rechtsbuiten', name: 'RW' },
            { x: 35, y: 24, role: 'spits', name: 'ST' },
            { x: 65, y: 24, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Box-to-Box', 'Snelle Vleugelspits', 'Doelpuntenmachine', 'Bonkige Spits']
    },
    '4-3-3': {
        name: '4-3-3 Aanvallend',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 15, y: 72, role: 'linksback', name: 'LB' },
            { x: 38, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 62, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 85, y: 72, role: 'rechtsback', name: 'RB' },
            { x: 30, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 50, y: 48, role: 'centraleMid', name: 'CM' },
            { x: 70, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 18, y: 26, role: 'linksbuiten', name: 'LW' },
            { x: 50, y: 18, role: 'spits', name: 'ST' },
            { x: 82, y: 26, role: 'rechtsbuiten', name: 'RW' }
        ],
        idealTags: ['Spelmaker', 'Destroyer', 'Snelle Vleugelspits', 'Doelpuntenmachine']
    },
    '4-2-3-1': {
        name: '4-2-3-1',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 15, y: 72, role: 'linksback', name: 'LB' },
            { x: 38, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 62, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 85, y: 72, role: 'rechtsback', name: 'RB' },
            { x: 35, y: 56, role: 'centraleMid', name: 'CM' },
            { x: 65, y: 56, role: 'centraleMid', name: 'CM' },
            { x: 18, y: 36, role: 'linksbuiten', name: 'LW' },
            { x: 50, y: 32, role: 'centraleMid', name: 'CM' },
            { x: 82, y: 36, role: 'rechtsbuiten', name: 'RW' },
            { x: 50, y: 16, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Destroyer', 'Spelmaker', 'Technische Buitenspeler', 'Doelpuntenmachine']
    },
    '3-5-2': {
        name: '3-5-2 Wingbacks',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 30, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 50, y: 78, role: 'centraleVerdediger', name: 'CV' },
            { x: 70, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 8, y: 50, role: 'linksback', name: 'LB' },
            { x: 30, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 50, y: 48, role: 'centraleMid', name: 'CM' },
            { x: 70, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 92, y: 50, role: 'rechtsback', name: 'RB' },
            { x: 35, y: 22, role: 'spits', name: 'ST' },
            { x: 65, y: 22, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Kolos', 'Aanvallende Back', 'Box-to-Box', 'Bonkige Spits']
    },
    '5-3-2': {
        name: '5-3-2 Verdedigend',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 10, y: 68, role: 'linksback', name: 'LB' },
            { x: 30, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 50, y: 78, role: 'centraleVerdediger', name: 'CV' },
            { x: 70, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 90, y: 68, role: 'rechtsback', name: 'RB' },
            { x: 30, y: 48, role: 'centraleMid', name: 'CM' },
            { x: 50, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 70, y: 48, role: 'centraleMid', name: 'CM' },
            { x: 35, y: 22, role: 'spits', name: 'ST' },
            { x: 65, y: 22, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Muur', 'Kolos', 'Destroyer', 'Bonkige Spits']
    },
    '4-1-4-1': {
        name: '4-1-4-1 Holding',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 15, y: 72, role: 'linksback', name: 'LB' },
            { x: 38, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 62, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 85, y: 72, role: 'rechtsback', name: 'RB' },
            { x: 50, y: 58, role: 'centraleMid', name: 'CM' },
            { x: 15, y: 40, role: 'linksbuiten', name: 'LW' },
            { x: 38, y: 44, role: 'centraleMid', name: 'CM' },
            { x: 62, y: 44, role: 'centraleMid', name: 'CM' },
            { x: 85, y: 40, role: 'rechtsbuiten', name: 'RW' },
            { x: 50, y: 18, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Destroyer', 'Spelmaker', 'Snelle Vleugelspits', 'Doelpuntenmachine']
    },
    '3-4-3': {
        name: '3-4-3 Totaal Voetbal',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 30, y: 74, role: 'centraleVerdediger', name: 'CV' },
            { x: 50, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 70, y: 74, role: 'centraleVerdediger', name: 'CV' },
            { x: 10, y: 48, role: 'linksback', name: 'LB' },
            { x: 38, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 62, y: 52, role: 'centraleMid', name: 'CM' },
            { x: 90, y: 48, role: 'rechtsback', name: 'RB' },
            { x: 22, y: 22, role: 'linksbuiten', name: 'LW' },
            { x: 50, y: 18, role: 'spits', name: 'ST' },
            { x: 78, y: 22, role: 'rechtsbuiten', name: 'RW' }
        ],
        idealTags: ['Elegante Verdediger', 'Aanvallende Back', 'Spelmaker', 'Snelle Vleugelspits']
    },
    '4-4-2-diamond': {
        name: '4-4-2 Diamant',
        positions: [
            { x: 50, y: 92, role: 'keeper', name: 'KEE' },
            { x: 15, y: 72, role: 'linksback', name: 'LB' },
            { x: 38, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 62, y: 76, role: 'centraleVerdediger', name: 'CV' },
            { x: 85, y: 72, role: 'rechtsback', name: 'RB' },
            { x: 50, y: 58, role: 'centraleMid', name: 'CM' },
            { x: 28, y: 44, role: 'centraleMid', name: 'CM' },
            { x: 72, y: 44, role: 'centraleMid', name: 'CM' },
            { x: 50, y: 32, role: 'centraleMid', name: 'CM' },
            { x: 35, y: 18, role: 'spits', name: 'ST' },
            { x: 65, y: 18, role: 'spits', name: 'ST' }
        ],
        idealTags: ['Destroyer', 'Box-to-Box', 'Spelmaker', 'Technische Spits']
    }
};

export const STADIUM_UPGRADES = {
    tribunes: [
        { id: 'tribune_1', name: 'Houten Bankjes', capacity: 200, cost: 0, buildTime: 0, maintenance: 10, required: 0 },
        { id: 'tribune_2', name: 'Betonnen Tribune', capacity: 500, cost: 15000, buildTime: 7, maintenance: 25, required: 0 },
        { id: 'tribune_3', name: 'Tribune met Dak', capacity: 1000, cost: 35000, buildTime: 14, maintenance: 50, required: 500 },
        { id: 'tribune_4', name: 'Overdekte Tribune', capacity: 2000, cost: 100000, buildTime: 21, maintenance: 100, required: 1000 },
        { id: 'tribune_5', name: 'Dubbele Tribune', capacity: 4000, cost: 250000, buildTime: 30, maintenance: 200, required: 2000 },
        { id: 'tribune_6', name: 'Hoefijzer Stadion', capacity: 6000, cost: 450000, buildTime: 45, maintenance: 350, required: 4000 },
        { id: 'tribune_7', name: 'Modern Stadion', capacity: 10000, cost: 800000, buildTime: 60, maintenance: 500, required: 6000 },
        { id: 'tribune_8', name: 'Professioneel Stadion', capacity: 18000, cost: 2000000, buildTime: 90, maintenance: 900, required: 10000 },
        { id: 'tribune_9', name: 'Groot Stadion', capacity: 30000, cost: 5000000, buildTime: 120, maintenance: 1500, required: 18000 },
        { id: 'tribune_10', name: 'Arena', capacity: 45000, cost: 12000000, buildTime: 180, maintenance: 3000, required: 30000 },
        { id: 'tribune_11', name: 'Super Arena', capacity: 55000, cost: 25000000, buildTime: 240, maintenance: 5000, required: 45000 },
        { id: 'tribune_12', name: 'Nationaal Stadion', capacity: 70000, cost: 50000000, buildTime: 365, maintenance: 8000, required: 55000 }
    ],
    grass: [
        { id: 'grass_0', name: 'Basis Grasveld', effect: 'Standaard veldslijtage', cost: 0, buildTime: 0, required: 0 },
        { id: 'grass_1', name: 'Onderhouden Gras', effect: '-20% veldslijtage', cost: 5000, buildTime: 3, required: 0 },
        { id: 'grass_2', name: 'Semi-Pro Gras', effect: '-40% veldslijtage, +5% passing', cost: 20000, buildTime: 7, required: 1000 },
        { id: 'grass_3', name: 'Professioneel Gras', effect: '-60% veldslijtage, +10% passing', cost: 75000, buildTime: 14, required: 4000 },
        { id: 'grass_4', name: 'Hybride Gras', effect: '-80% veldslijtage, +15% passing', cost: 200000, buildTime: 21, required: 10000 },
        { id: 'grass_5', name: 'Stadium Turf', effect: 'Geen slijtage, +20% passing', cost: 500000, buildTime: 30, required: 25000 }
    ],
    horeca: [
        { id: 'horeca_1', name: 'Koffiekar', income: 0.20, cost: 1000, buildTime: 1, required: 0 },
        { id: 'horeca_2', name: 'Frietkraam', income: 0.50, cost: 5000, buildTime: 3, required: 0 },
        { id: 'horeca_3', name: 'Drankstand', income: 0.40, cost: 3000, buildTime: 2, required: 0 },
        { id: 'horeca_4', name: 'Bierkraam', income: 0.80, cost: 8000, buildTime: 5, required: 500 },
        { id: 'horeca_5', name: 'Snackbar', income: 1.20, cost: 15000, buildTime: 7, required: 500 },
        { id: 'horeca_6', name: 'Hamburger Stand', income: 1.00, cost: 12000, buildTime: 5, required: 1000 },
        { id: 'horeca_7', name: 'Pizza Corner', income: 1.30, cost: 18000, buildTime: 7, required: 2000 },
        { id: 'horeca_8', name: 'Restaurant Basis', income: 2.50, cost: 50000, buildTime: 14, required: 2000 },
        { id: 'horeca_9', name: 'Food Court', income: 3.00, cost: 150000, buildTime: 21, required: 6000 },
        { id: 'horeca_10', name: 'Premium Restaurant', income: 5.00, cost: 300000, buildTime: 30, required: 10000 },
        { id: 'horeca_11', name: 'Michelin Restaurant', income: 8.00, cost: 750000, buildTime: 45, required: 30000 },
        { id: 'horeca_12', name: 'Hospitality Village', income: 12.00, cost: 1500000, buildTime: 60, required: 45000 }
    ],
    fanshop: [
        { id: 'shop_1', name: 'Verkooptafel', income: 0.20, cost: 1000, buildTime: 1, required: 0 },
        { id: 'shop_2', name: 'Merchandise Kraam', income: 0.30, cost: 2000, buildTime: 1, required: 0 },
        { id: 'shop_3', name: 'Kleine Fanshop', income: 0.80, cost: 10000, buildTime: 5, required: 500 },
        { id: 'shop_4', name: 'Fanshop Standaard', income: 1.50, cost: 35000, buildTime: 10, required: 2000 },
        { id: 'shop_5', name: 'Grote Fanshop', income: 2.50, cost: 100000, buildTime: 20, required: 6000 },
        { id: 'shop_6', name: 'Megastore', income: 4.00, cost: 300000, buildTime: 35, required: 18000 },
        { id: 'shop_7', name: 'Flagship Store', income: 6.00, cost: 750000, buildTime: 45, required: 30000 },
        { id: 'shop_8', name: 'Online Shop', dailyIncome: 500, cost: 50000, buildTime: 7, required: 2000 },
        { id: 'shop_9', name: 'Webshop Premium', dailyIncome: 2000, cost: 200000, buildTime: 14, required: 10000 },
        { id: 'shop_10', name: 'E-Commerce Platform', dailyIncome: 8000, cost: 800000, buildTime: 30, required: 30000 }
    ],
    vip: [
        { id: 'vip_1', name: 'Business Seats', capacity: 30, pricePerSeat: 20, cost: 50000, buildTime: 14, required: 2000 },
        { id: 'vip_2', name: 'Business Seats+', capacity: 60, pricePerSeat: 25, cost: 100000, buildTime: 21, required: 4000 },
        { id: 'vip_3', name: 'Skybox Klein', capacity: 15, pricePerSeat: 60, cost: 150000, buildTime: 21, required: 6000 },
        { id: 'vip_4', name: 'Skybox Standaard', capacity: 30, pricePerSeat: 75, cost: 300000, buildTime: 30, required: 10000 },
        { id: 'vip_5', name: 'Skybox Premium', capacity: 50, pricePerSeat: 100, cost: 500000, buildTime: 35, required: 18000 },
        { id: 'vip_6', name: 'Executive Lounge', capacity: 80, pricePerSeat: 125, cost: 800000, buildTime: 45, required: 25000 },
        { id: 'vip_7', name: 'VIP Village', capacity: 150, pricePerSeat: 175, cost: 1500000, buildTime: 60, required: 35000 },
        { id: 'vip_8', name: 'Platinum Lounge', capacity: 200, pricePerSeat: 250, cost: 3000000, buildTime: 75, required: 45000 },
        { id: 'vip_9', name: 'Directors Box', capacity: 50, pricePerSeat: 500, cost: 5000000, buildTime: 90, required: 55000 }
    ],
    parking: [
        { id: 'parking_1', name: 'Grasveld', capacity: 50, pricePerCar: 1, cost: 2000, buildTime: 2, required: 0 },
        { id: 'parking_2', name: 'Gravel Parkeren', capacity: 100, pricePerCar: 2, cost: 10000, buildTime: 5, required: 500 },
        { id: 'parking_3', name: 'Verhard Terrein', capacity: 200, pricePerCar: 3, cost: 25000, buildTime: 10, required: 1000 },
        { id: 'parking_4', name: 'Parkeerplaats Klein', capacity: 400, pricePerCar: 4, cost: 75000, buildTime: 20, required: 4000 },
        { id: 'parking_5', name: 'Parkeerplaats Groot', capacity: 800, pricePerCar: 5, cost: 200000, buildTime: 30, required: 10000 },
        { id: 'parking_6', name: 'Parkeergarage', capacity: 1500, pricePerCar: 7, cost: 500000, buildTime: 60, required: 20000 },
        { id: 'parking_7', name: 'Multi-Parkeergarage', capacity: 3000, pricePerCar: 8, cost: 1200000, buildTime: 90, required: 35000 },
        { id: 'parking_8', name: 'VIP Parking', capacity: 200, pricePerCar: 25, cost: 400000, buildTime: 30, required: 20000 }
    ],
    lighting: [
        { id: 'light_1', name: 'Bouwlampen', effect: 'avond', cost: 10000, buildTime: 3, required: 500 },
        { id: 'light_2', name: 'Basis Verlichting', effect: 'avond+', cost: 30000, buildTime: 14, required: 1000 },
        { id: 'light_3', name: 'Lichtmasten', effect: '+10% sfeer', cost: 80000, buildTime: 21, required: 4000 },
        { id: 'light_4', name: 'Pro Verlichting', effect: '+15% sfeer, TV', cost: 200000, buildTime: 30, required: 10000 },
        { id: 'light_5', name: 'Stadion Verlichting', effect: '+20% sfeer, HD', cost: 500000, buildTime: 45, required: 25000 },
        { id: 'light_6', name: 'LED Systeem', effect: '+25% sfeer, 4K, -30% energie', cost: 1000000, buildTime: 60, required: 40000 }
    ],
    training: [
        { id: 'train_1', name: 'Grasveld', multiplier: 1.0, maxAttr: 50, cost: 0, buildTime: 0, required: 0 },
        { id: 'train_2', name: 'Amateur Veld', multiplier: 1.2, maxAttr: 60, cost: 25000, buildTime: 14, required: 0 },
        { id: 'train_3', name: 'Semi-Pro Complex', multiplier: 1.4, maxAttr: 70, cost: 75000, buildTime: 21, required: 1000 },
        { id: 'train_4', name: 'Professioneel Complex', multiplier: 1.6, maxAttr: 80, cost: 200000, buildTime: 30, required: 4000 },
        { id: 'train_5', name: 'Elite Complex', multiplier: 1.8, maxAttr: 90, cost: 500000, buildTime: 45, required: 10000 },
        { id: 'train_6', name: 'Wereldklasse Complex', multiplier: 2.0, maxAttr: 99, cost: 1000000, buildTime: 60, required: 25000 }
    ],
    medical: [
        { id: 'med_1', name: 'Geen', effect: '+50% blessureduur', cost: 0, buildTime: 0, required: 0 },
        { id: 'med_2', name: 'EHBO Post', effect: 'standaard', cost: 10000, buildTime: 3, required: 0 },
        { id: 'med_3', name: 'Fysiotherapeut', effect: '-15% blessureduur', cost: 35000, buildTime: 7, required: 500 },
        { id: 'med_4', name: 'Medische Kamer', effect: '-25% blessureduur', cost: 100000, buildTime: 14, required: 2000 },
        { id: 'med_5', name: 'Medisch Centrum', effect: '-35% duur, -10% kans', cost: 300000, buildTime: 21, required: 6000 },
        { id: 'med_6', name: 'Elite Faciliteit', effect: '-50% duur, -20% kans', cost: 750000, buildTime: 30, required: 18000 },
        { id: 'med_7', name: 'Sportmedisch Instituut', effect: '-60% duur, -30% kans', cost: 1500000, buildTime: 45, required: 35000 }
    ],
    academy: [
        { id: 'acad_1', name: 'Geen', youthPerMonth: 0, maxOverall: 0, cost: 0, buildTime: 0, required: 0 },
        { id: 'acad_2', name: 'Jeugdteam', youthPerMonth: 0.5, maxOverall: 40, cost: 25000, buildTime: 14, required: 500 },
        { id: 'acad_3', name: 'Basis Academie', youthPerMonth: 1, maxOverall: 50, cost: 50000, buildTime: 30, required: 2000 },
        { id: 'acad_4', name: 'Ontwikkelde Academie', youthPerMonth: 2, maxOverall: 60, cost: 150000, buildTime: 45, required: 6000 },
        { id: 'acad_5', name: 'Pro Academie', youthPerMonth: 3, maxOverall: 70, cost: 400000, buildTime: 60, required: 15000 },
        { id: 'acad_6', name: 'Elite Academie', youthPerMonth: 4, maxOverall: 80, cost: 1000000, buildTime: 90, required: 30000 },
        { id: 'acad_7', name: 'Wereldklasse Academie', youthPerMonth: 5, maxOverall: 90, cost: 2500000, buildTime: 120, required: 50000 }
    ],
    scouting: [
        { id: 'scout_1', name: 'Geen', range: 'lokaal', info: 'overall', cost: 0, buildTime: 0, required: 0 },
        { id: 'scout_2', name: 'Lokale Scout', range: 'regio', info: '3 attributen', cost: 15000, buildTime: 5, required: 0 },
        { id: 'scout_3', name: 'Regionale Scouts', range: 'Nederland', info: 'alle attributen', cost: 50000, buildTime: 10, required: 1000 },
        { id: 'scout_4', name: 'Nationale Scouts', range: 'Benelux', info: '+ persoonlijkheid', cost: 150000, buildTime: 20, required: 4000 },
        { id: 'scout_5', name: 'Europese Scouts', range: 'Europa', info: '+ potentieel', cost: 400000, buildTime: 30, required: 15000 },
        { id: 'scout_6', name: 'Wereldwijde Scouts', range: 'Wereld', info: 'alles', cost: 1000000, buildTime: 45, required: 35000 }
    ],
    sponsoring: [
        { id: 'sponsor_1', name: 'Geen', dailyIncome: 0, cost: 0, buildTime: 0, required: 0 },
        { id: 'sponsor_2', name: 'Reclamebord Langs Veld', dailyIncome: 50, cost: 5000, buildTime: 3, required: 0 },
        { id: 'sponsor_3', name: 'Meerdere Reclameborden', dailyIncome: 150, cost: 20000, buildTime: 7, required: 500 },
        { id: 'sponsor_4', name: 'LED Borden', dailyIncome: 400, cost: 75000, buildTime: 14, required: 2000 },
        { id: 'sponsor_5', name: 'Shirtsponsor', dailyIncome: 1000, cost: 200000, buildTime: 21, required: 6000 },
        { id: 'sponsor_6', name: 'Hoofdsponsor Pakket', dailyIncome: 2500, cost: 500000, buildTime: 30, required: 15000 },
        { id: 'sponsor_7', name: 'Naamrechten Stadion', dailyIncome: 8000, cost: 2000000, buildTime: 60, required: 35000 }
    ],
    kantine: [
        { id: 'kantine_1', name: 'Geen', effect: 'geen bonus', cost: 0, buildTime: 0, required: 0 },
        { id: 'kantine_2', name: 'Picknicktafel', effect: '+2% morale', cost: 3000, buildTime: 2, required: 0 },
        { id: 'kantine_3', name: 'Basis Kantine', effect: '+5% morale', cost: 15000, buildTime: 7, required: 500 },
        { id: 'kantine_4', name: 'Moderne Kantine', effect: '+8% morale', cost: 50000, buildTime: 14, required: 2000 },
        { id: 'kantine_5', name: 'Luxe Kantine', effect: '+12% morale', cost: 150000, buildTime: 21, required: 6000 },
        { id: 'kantine_6', name: 'Restaurant Kwaliteit', effect: '+15% morale, +5% fitness', cost: 400000, buildTime: 30, required: 15000 }
    ],
    perszaal: [
        { id: 'pers_1', name: 'Geen', effect: 'geen bonus', cost: 0, buildTime: 0, required: 0 },
        { id: 'pers_2', name: 'Interview Hoek', effect: '+1 reputatie/week', cost: 10000, buildTime: 5, required: 500 },
        { id: 'pers_3', name: 'Kleine Perszaal', effect: '+2 reputatie/week', cost: 40000, buildTime: 10, required: 2000 },
        { id: 'pers_4', name: 'Media Kamer', effect: '+4 reputatie/week', cost: 120000, buildTime: 21, required: 6000 },
        { id: 'pers_5', name: 'Professionele Perszaal', effect: '+6 reputatie/week', cost: 300000, buildTime: 30, required: 15000 },
        { id: 'pers_6', name: 'Broadcast Studio', effect: '+10 reputatie/week, TV bonus', cost: 750000, buildTime: 45, required: 30000 }
    ],
    hotel: [
        { id: 'hotel_1', name: 'Geen', effect: 'geen bonus', cost: 0, buildTime: 0, required: 0 },
        { id: 'hotel_2', name: 'Slaapzaal', effect: '+3% fitness recovery', cost: 25000, buildTime: 14, required: 2000 },
        { id: 'hotel_3', name: 'Basis Kamers', effect: '+5% fitness recovery', cost: 80000, buildTime: 21, required: 6000 },
        { id: 'hotel_4', name: 'Comfort Suites', effect: '+8% fitness recovery', cost: 200000, buildTime: 30, required: 15000 },
        { id: 'hotel_5', name: 'Luxe Appartementen', effect: '+12% fitness recovery', cost: 500000, buildTime: 45, required: 25000 },
        { id: 'hotel_6', name: 'Vijfsterren Resort', effect: '+15% fitness, +5% morale', cost: 1500000, buildTime: 60, required: 40000 }
    ]
};

export const TRAINING_TYPES = {
    attack: {
        name: 'Aanvalstrainer',
        icon: '⚽',
        sessions: [
            { id: 'shooting', name: 'Schieten', primary: 'AAN', primaryGain: 0.8, secondary: 'SNE', secondaryGain: 0.2, injury: 2 },
            { id: 'finishing', name: 'Afwerken', primary: 'AAN', primaryGain: 1.0, secondary: null, secondaryGain: 0, injury: 2 },
            { id: 'heading_attack', name: 'Koppen (Aanval)', primary: 'AAN', primaryGain: 0.6, secondary: 'FYS', secondaryGain: 0.3, injury: 3 },
            { id: 'positioning', name: 'Positioneren', primary: 'AAN', primaryGain: 0.5, secondary: 'SNE', secondaryGain: 0.3, injury: 1 }
        ]
    },
    midfield: {
        name: 'Middenveldtrainer',
        icon: '🎯',
        sessions: [
            { id: 'passing', name: 'Passen', primary: 'AAN', primaryGain: 0.8, secondary: 'VER', secondaryGain: 0.2, injury: 1 },
            { id: 'dribbling', name: 'Dribbelen', primary: 'SNE', primaryGain: 0.7, secondary: 'AAN', secondaryGain: 0.3, injury: 2 },
            { id: 'ball_control', name: 'Balcontrole', primary: 'AAN', primaryGain: 0.5, secondary: 'SNE', secondaryGain: 0.4, injury: 1 },
            { id: 'vision', name: 'Overzicht', primary: 'VER', primaryGain: 0.5, secondary: 'AAN', secondaryGain: 0.4, injury: 0 }
        ]
    },
    defense: {
        name: 'Verdedigingstrainer',
        icon: '🛡️',
        sessions: [
            { id: 'tackling', name: 'Tackelen', primary: 'VER', primaryGain: 0.8, secondary: 'FYS', secondaryGain: 0.2, injury: 4 },
            { id: 'marking', name: 'Dekken', primary: 'VER', primaryGain: 0.7, secondary: 'SNE', secondaryGain: 0.2, injury: 2 },
            { id: 'heading_defense', name: 'Koppen (Verdediging)', primary: 'VER', primaryGain: 0.6, secondary: 'FYS', secondaryGain: 0.4, injury: 3 },
            { id: 'interception', name: 'Onderscheppen', primary: 'VER', primaryGain: 0.6, secondary: 'SNE', secondaryGain: 0.3, injury: 2 }
        ]
    },
    goalkeeper: {
        name: 'Keeperstrainer',
        icon: '🧤',
        sessions: [
            { id: 'reflexes', name: 'Reflexen', primary: 'VER', primaryGain: 0.8, secondary: 'SNE', secondaryGain: 0.3, injury: 2, keeperOnly: true },
            { id: 'positioning_gk', name: 'Positie Kiezen', primary: 'VER', primaryGain: 0.6, secondary: 'SNE', secondaryGain: 0.2, injury: 1, keeperOnly: true },
            { id: 'diving', name: 'Duiken', primary: 'SNE', primaryGain: 0.7, secondary: 'FYS', secondaryGain: 0.3, injury: 3, keeperOnly: true },
            { id: 'distribution', name: 'Uittrappen', primary: 'AAN', primaryGain: 0.6, secondary: 'FYS', secondaryGain: 0.2, injury: 1, keeperOnly: true }
        ]
    },
    fitness: {
        name: 'Fitnesstrainer',
        icon: '💪',
        sessions: [
            { id: 'stamina', name: 'Conditie', primary: 'FYS', primaryGain: 0.8, secondary: 'SNE', secondaryGain: 0.2, injury: 3 },
            { id: 'strength', name: 'Kracht', primary: 'FYS', primaryGain: 1.0, secondary: null, secondaryGain: 0, injury: 5 },
            { id: 'speed', name: 'Snelheid', primary: 'SNE', primaryGain: 0.8, secondary: 'FYS', secondaryGain: 0.2, injury: 4 },
            { id: 'agility', name: 'Wendbaarheid', primary: 'SNE', primaryGain: 0.6, secondary: 'FYS', secondaryGain: 0.3, injury: 3 }
        ]
    }
};

// Helper function to get position group
export function getPositionGroup(position) {
    return POSITIONS[position]?.group || 'midfielder';
}
