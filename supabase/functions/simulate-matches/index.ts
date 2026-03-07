// ZATERDAGVOETBAL - Match Simulation Edge Function
// Runs daily at 20:00 CET via pg_cron
// Simulates all scheduled matches for active leagues

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// MATCH ENGINE (ported from matchEngine.js)
// ============================================

interface TeamStrength {
    attack: number
    defense: number
    midfield: number
    goalkeeper: number
    overall: number
}

interface Player {
    id: string
    name: string
    position: string
    overall: number
    attributes: Record<string, number>
    fitness: number
    lineup_position: number | null
}

interface MatchEvent {
    minute: number
    type: string
    team: 'home' | 'away'
    player?: string
    playerId?: string
    assist?: string
    assistId?: string
    commentary: string
}

interface MatchResult {
    homeScore: number
    awayScore: number
    events: MatchEvent[]
    playerRatings: Record<string, { rating: number; goals: number; assists: number }>
    possession: { home: number; away: number }
    shots: { home: number; away: number }
    shotsOnTarget: { home: number; away: number }
    fouls: { home: number; away: number }
    manOfTheMatchId?: string
}

// Position groups
const POSITION_GROUPS: Record<string, string> = {
    keeper: 'goalkeeper',
    linksback: 'defender', centraleVerdediger: 'defender', rechtsback: 'defender',
    linksMid: 'midfielder', centraleMid: 'midfielder', rechtsMid: 'midfielder',
    linksbuiten: 'attacker', rechtsbuiten: 'attacker', spits: 'attacker'
}

function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function calculateTeamStrength(players: Player[], formation: string, tactics: Record<string, string>): TeamStrength {
    if (!players || players.filter(p => p.lineup_position !== null).length < 11) {
        return { attack: 30, defense: 30, midfield: 30, goalkeeper: 30, overall: 30 }
    }

    let attack = 0, defense = 0, midfield = 0, goalkeeper = 0
    let attackCount = 0, defenseCount = 0, midfieldCount = 0

    const lineupPlayers = players.filter(p => p.lineup_position !== null)
        .sort((a, b) => (a.lineup_position ?? 0) - (b.lineup_position ?? 0))

    lineupPlayers.forEach(player => {
        const group = POSITION_GROUPS[player.position] || 'midfielder'
        const fitnessMultiplier = (player.fitness || 80) / 100
        const strength = player.overall * fitnessMultiplier

        switch (group) {
            case 'goalkeeper': goalkeeper += strength; break
            case 'defender': defense += strength; defenseCount++; break
            case 'midfielder': midfield += strength; midfieldCount++; break
            case 'attacker': attack += strength; attackCount++; break
        }
    })

    // Normalize
    if (defenseCount > 0) defense /= defenseCount
    if (midfieldCount > 0) midfield /= midfieldCount
    if (attackCount > 0) attack /= attackCount

    // Include goalkeeper in defense
    defense = (defense * 3 + goalkeeper) / 4

    const overall = (attack + defense + midfield) / 3

    return {
        attack: Math.round(Math.max(1, Math.min(99, attack))),
        defense: Math.round(Math.max(1, Math.min(99, defense))),
        midfield: Math.round(Math.max(1, Math.min(99, midfield))),
        goalkeeper: Math.round(Math.max(1, Math.min(99, goalkeeper))),
        overall: Math.round(Math.max(1, Math.min(99, overall)))
    }
}

function generateAIStrength(division: number): TeamStrength {
    const divStrengths: Record<number, { base: number; variance: number }> = {
        8: { base: 25, variance: 10 }, 7: { base: 35, variance: 10 }, 6: { base: 45, variance: 10 },
        5: { base: 52, variance: 10 }, 4: { base: 60, variance: 10 }, 3: { base: 68, variance: 10 },
        2: { base: 76, variance: 8 }, 1: { base: 84, variance: 6 }, 0: { base: 90, variance: 5 }
    }
    const s = divStrengths[division] || divStrengths[8]
    const base = s.base + random(-s.variance, s.variance)
    return {
        attack: Math.min(99, base + random(-5, 5)),
        defense: Math.min(99, base + random(-5, 5)),
        midfield: Math.min(99, base + random(-5, 5)),
        goalkeeper: Math.min(99, base + random(-5, 5)),
        overall: Math.min(99, base)
    }
}

function selectScorer(players: Player[]): Player | null {
    const valid = players.filter(p => p.lineup_position !== null)
    if (valid.length === 0) return null

    const weights = valid.map(p => {
        let w = 1
        const group = POSITION_GROUPS[p.position]
        if (group === 'attacker') w += 4
        else if (group === 'midfielder') w += 2
        w += (p.attributes?.AAN || 50) / 25
        return w
    })

    const total = weights.reduce((a, b) => a + b, 0)
    let roll = Math.random() * total
    for (let i = 0; i < valid.length; i++) {
        roll -= weights[i]
        if (roll <= 0) return valid[i]
    }
    return valid[0]
}

function selectAssister(players: Player[], scorer: Player | null): Player | null {
    const valid = players.filter(p => p.lineup_position !== null && p.id !== scorer?.id)
    if (valid.length === 0) return null

    const weights = valid.map(p => {
        let w = 1
        const group = POSITION_GROUPS[p.position]
        if (group === 'midfielder') w += 3
        else if (group === 'attacker') w += 2
        w += (p.attributes?.SNE || 50) / 30
        return w
    })

    const total = weights.reduce((a, b) => a + b, 0)
    let roll = Math.random() * total
    for (let i = 0; i < valid.length; i++) {
        roll -= weights[i]
        if (roll <= 0) return valid[i]
    }
    return valid[0]
}

function simulateMatch(
    homeStrength: TeamStrength,
    awayStrength: TeamStrength,
    homePlayers: Player[] | null,
    awayPlayers: Player[] | null
): MatchResult {
    const result: MatchResult = {
        homeScore: 0,
        awayScore: 0,
        events: [],
        playerRatings: {},
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 }
    }

    // Home advantage
    const adjHome = { ...homeStrength, attack: homeStrength.attack + 3, defense: homeStrength.defense + 3 }

    // Possession
    const totalMid = adjHome.midfield + awayStrength.midfield
    result.possession.home = Math.round((adjHome.midfield / totalMid) * 100)
    result.possession.away = 100 - result.possession.home

    // Init player ratings
    const allHomePlayers = homePlayers?.filter(p => p.lineup_position !== null) || []
    const allAwayPlayers = awayPlayers?.filter(p => p.lineup_position !== null) || []

    for (const p of [...allHomePlayers, ...allAwayPlayers]) {
        result.playerRatings[p.id] = { rating: 6.0 + (Math.random() - 0.5), goals: 0, assists: 0 }
    }

    // Generate key minutes
    const keyMinutes: number[] = []
    for (let i = 1; i <= 90; i++) {
        if (Math.random() < 0.35) keyMinutes.push(i)
    }
    while (keyMinutes.length < 15) {
        const m = random(1, 90)
        if (!keyMinutes.includes(m)) keyMinutes.push(m)
    }
    keyMinutes.sort((a, b) => a - b)

    for (const minute of keyMinutes) {
        const isHome = Math.random() * 100 < result.possession.home
        const strength = isHome ? adjHome : awayStrength
        const opposing = isHome ? awayStrength : adjHome
        const team: 'home' | 'away' = isHome ? 'home' : 'away'
        const players = isHome ? allHomePlayers : allAwayPlayers

        const attackChance = strength.attack / (strength.attack + opposing.defense) * 100
        if (Math.random() * 100 < attackChance) {
            const shotRoll = Math.random() * 100
            const goalChance = (strength.attack / 2) + random(-10, 10)

            if (shotRoll < goalChance * 0.3) {
                // GOAL
                const scorer = players.length > 0 ? selectScorer(players) : null
                const assister = players.length > 0 && Math.random() > 0.4 ? selectAssister(players, scorer) : null

                if (team === 'home') result.homeScore++
                else result.awayScore++
                result.shots[team]++
                result.shotsOnTarget[team]++

                if (scorer?.id && result.playerRatings[scorer.id]) {
                    result.playerRatings[scorer.id].goals++
                    result.playerRatings[scorer.id].rating += 1.0
                }
                if (assister?.id && result.playerRatings[assister.id]) {
                    result.playerRatings[assister.id].assists++
                    result.playerRatings[assister.id].rating += 0.5
                }

                result.events.push({
                    minute, type: 'goal', team,
                    player: scorer?.name || 'Speler', playerId: scorer?.id,
                    assist: assister?.name, assistId: assister?.id,
                    commentary: `${minute}' GOAL! ${scorer?.name || 'Speler'} scoort! ${result.homeScore}-${result.awayScore}`
                })
            } else if (shotRoll < goalChance * 0.6) {
                result.shots[team]++
                result.shotsOnTarget[team]++
                result.events.push({
                    minute, type: 'shot_saved', team,
                    commentary: `${minute}' Redding van de keeper!`
                })
            } else if (shotRoll < goalChance) {
                result.shots[team]++
                result.events.push({
                    minute, type: 'shot_missed', team,
                    commentary: `${minute}' Schot naast!`
                })
            }
        }

        // Fouls
        if (Math.random() < 0.08) {
            result.fouls[team]++
            if (Math.random() < 0.25) {
                const cardType = Math.random() < 0.05 ? 'red_card' : 'yellow_card'
                const fouler = players.length > 0 ? randomFromArray(players.filter(p => p.lineup_position !== null)) : null
                result.events.push({
                    minute, type: cardType, team,
                    player: fouler?.name || 'Speler', playerId: fouler?.id,
                    commentary: `${minute}' ${cardType === 'red_card' ? 'Rode' : 'Gele'} kaart voor ${fouler?.name || 'Speler'}!`
                })
                if (fouler?.id && result.playerRatings[fouler.id]) {
                    result.playerRatings[fouler.id].rating -= cardType === 'red_card' ? 2.0 : 0.5
                }
            }
        }
    }

    // Clamp ratings and find MOTM
    let bestRating = 0
    for (const [id, data] of Object.entries(result.playerRatings)) {
        data.rating = Math.max(4.0, Math.min(10.0, data.rating))
        if (data.rating > bestRating) {
            bestRating = data.rating
            result.manOfTheMatchId = id
        }
    }

    return result
}

// ============================================
// MAIN HANDLER
// ============================================

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceKey)

        // Find all active leagues where it's match time
        const { data: leagues, error: leagueError } = await supabase
            .from('leagues')
            .select('*')
            .eq('status', 'active')

        if (leagueError) throw leagueError
        if (!leagues || leagues.length === 0) {
            return new Response(JSON.stringify({ message: 'No active leagues' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        let totalMatches = 0

        for (const league of leagues) {
            const currentWeek = league.week
            const currentSeason = league.season

            // Get unplayed matches for this week
            const { data: matches } = await supabase
                .from('schedule')
                .select('*')
                .eq('league_id', league.id)
                .eq('season', currentSeason)
                .eq('week', currentWeek)
                .eq('played', false)

            if (!matches || matches.length === 0) {
                // No matches this week — advance to next week or end season
                const maxWeek = 14 // 8 teams × 2 - 2 rounds
                if (currentWeek >= maxWeek) {
                    // Season end — handle in season-end function
                    await handleSeasonEnd(supabase, league)
                } else {
                    await supabase
                        .from('leagues')
                        .update({ week: currentWeek + 1 })
                        .eq('id', league.id)
                }
                continue
            }

            for (const match of matches) {
                // Get players for both clubs
                const [homePlayersRes, awayPlayersRes, homeClubRes, awayClubRes] = await Promise.all([
                    supabase.from('players').select('*').eq('club_id', match.home_club_id),
                    supabase.from('players').select('*').eq('club_id', match.away_club_id),
                    supabase.from('clubs').select('tactics, formation, is_ai, division').eq('id', match.home_club_id).single(),
                    supabase.from('clubs').select('tactics, formation, is_ai, division').eq('id', match.away_club_id).single()
                ])

                const homePlayers = homePlayersRes.data || []
                const awayPlayers = awayPlayersRes.data || []
                const homeClub = homeClubRes.data
                const awayClub = awayClubRes.data

                // Auto-select best 11 for clubs without lineup set
                autoSelectLineup(homePlayers)
                autoSelectLineup(awayPlayers)

                // Calculate strengths
                const homeStrength = homeClub?.is_ai
                    ? generateAIStrength(homeClub.division || league.division)
                    : calculateTeamStrength(homePlayers, homeClub?.formation || '4-4-2', homeClub?.tactics || {})

                const awayStrength = awayClub?.is_ai
                    ? generateAIStrength(awayClub.division || league.division)
                    : calculateTeamStrength(awayPlayers, awayClub?.formation || '4-4-2', awayClub?.tactics || {})

                // Simulate
                const result = simulateMatch(
                    homeStrength, awayStrength,
                    homeClub?.is_ai ? null : homePlayers,
                    awayClub?.is_ai ? null : awayPlayers
                )

                // Write match result
                await supabase.from('match_results').insert({
                    league_id: league.id,
                    schedule_id: match.id,
                    season: currentSeason,
                    week: currentWeek,
                    home_club_id: match.home_club_id,
                    away_club_id: match.away_club_id,
                    home_score: result.homeScore,
                    away_score: result.awayScore,
                    match_data: {
                        events: result.events,
                        playerRatings: result.playerRatings,
                        possession: result.possession,
                        shots: result.shots,
                        shotsOnTarget: result.shotsOnTarget,
                        fouls: result.fouls,
                        manOfTheMatchId: result.manOfTheMatchId
                    }
                })

                // Mark schedule as played
                await supabase.from('schedule').update({ played: true }).eq('id', match.id)

                // Update standings for home team
                await updateStandings(supabase, league.id, currentSeason, match.home_club_id, result.homeScore, result.awayScore)
                // Update standings for away team
                await updateStandings(supabase, league.id, currentSeason, match.away_club_id, result.awayScore, result.homeScore)

                // Update player stats (goals, assists, morale, fitness)
                await updatePlayerStats(supabase, homePlayers, result, 'home')
                await updatePlayerStats(supabase, awayPlayers, result, 'away')

                // Feed
                await supabase.from('league_feed').insert({
                    league_id: league.id,
                    type: 'result',
                    data: {
                        home_club_id: match.home_club_id,
                        away_club_id: match.away_club_id,
                        home_score: result.homeScore,
                        away_score: result.awayScore,
                        week: currentWeek
                    }
                })

                totalMatches++
            }

            // After all matches, advance week
            const maxWeek = 14
            if (currentWeek >= maxWeek) {
                await handleSeasonEnd(supabase, league)
            } else {
                await supabase
                    .from('leagues')
                    .update({ week: currentWeek + 1 })
                    .eq('id', league.id)
            }
        }

        return new Response(JSON.stringify({ success: true, matchesSimulated: totalMatches }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

// ============================================
// HELPERS
// ============================================

function autoSelectLineup(players: Player[]) {
    const hasLineup = players.some(p => p.lineup_position !== null)
    if (hasLineup) return

    // Sort by overall descending, pick best 11
    const sorted = [...players].sort((a, b) => b.overall - a.overall)
    sorted.slice(0, 11).forEach((p, idx) => {
        p.lineup_position = idx
    })
}

async function updateStandings(
    supabase: any, leagueId: string, season: number,
    clubId: string, goalsFor: number, goalsAgainst: number
) {
    const won = goalsFor > goalsAgainst ? 1 : 0
    const drawn = goalsFor === goalsAgainst ? 1 : 0
    const lost = goalsFor < goalsAgainst ? 1 : 0
    const points = won * 3 + drawn

    // Use upsert-like update
    const { data: existing } = await supabase
        .from('standings')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('club_id', clubId)
        .single()

    if (existing) {
        await supabase.from('standings').update({
            played: existing.played + 1,
            won: existing.won + won,
            drawn: existing.drawn + drawn,
            lost: existing.lost + lost,
            goals_for: existing.goals_for + goalsFor,
            goals_against: existing.goals_against + goalsAgainst,
            points: existing.points + points
        }).eq('id', existing.id)
    }

    // Re-calculate positions for the league
    const { data: allStandings } = await supabase
        .from('standings')
        .select('id, points, goals_for, goals_against')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false })

    if (allStandings) {
        for (let i = 0; i < allStandings.length; i++) {
            await supabase.from('standings').update({ position: i + 1 }).eq('id', allStandings[i].id)
        }
    }
}

async function updatePlayerStats(supabase: any, players: Player[], result: MatchResult, team: 'home' | 'away') {
    const won = team === 'home' ? result.homeScore > result.awayScore : result.awayScore > result.homeScore
    const drew = result.homeScore === result.awayScore

    for (const player of players) {
        if (player.lineup_position === null) continue
        const rating = result.playerRatings[player.id]
        if (!rating) continue

        let moraleDelta = won ? 5 : drew ? 1 : -3
        if (rating.rating >= 8.0) moraleDelta += 3
        else if (rating.rating < 5.5) moraleDelta -= 2

        await supabase.from('players').update({
            goals: (player as any).goals + rating.goals,
            assists: (player as any).assists + rating.assists,
            morale: Math.max(20, Math.min(100, ((player as any).morale || 70) + moraleDelta)),
            fitness: Math.max(50, ((player as any).fitness || 90) - random(5, 15)),
            energy: Math.max(30, ((player as any).energy || 80) - random(10, 25)),
            matches_together: ((player as any).matches_together || 0) + 1
        }).eq('id', player.id)
    }
}

async function handleSeasonEnd(supabase: any, league: any) {
    // Get final standings
    const { data: standings } = await supabase
        .from('standings')
        .select('*, clubs(name, is_ai, owner_id)')
        .eq('league_id', league.id)
        .eq('season', league.season)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false })

    if (!standings) return

    // Feed: season end
    const champion = standings[0]
    await supabase.from('league_feed').insert({
        league_id: league.id,
        type: 'season_end',
        club_id: champion?.club_id,
        data: {
            season: league.season,
            champion: champion?.clubs?.name || 'Onbekend',
            standings: standings.map((s: any) => ({
                name: s.clubs?.name, points: s.points, position: s.position
            }))
        }
    })

    // Start new season
    const newSeason = league.season + 1

    // Create new standings
    const { data: clubs } = await supabase
        .from('clubs')
        .select('id')
        .eq('league_id', league.id)

    if (clubs) {
        for (let i = 0; i < clubs.length; i++) {
            await supabase.from('standings').insert({
                league_id: league.id,
                season: newSeason,
                club_id: clubs[i].id,
                position: i + 1
            })
        }

        // Generate new schedule
        await generateScheduleServer(supabase, league.id, newSeason, clubs.map((c: any) => c.id))
    }

    // Age players
    await supabase.rpc('age_league_players', { p_league_id: league.id })

    // Update league
    await supabase.from('leagues').update({
        season: newSeason,
        week: 1
    }).eq('id', league.id)
}

async function generateScheduleServer(supabase: any, leagueId: string, season: number, clubIds: string[]) {
    const n = clubIds.length
    const rounds = (n - 1) * 2
    const matches: any[] = []

    for (let round = 0; round < rounds; round++) {
        const week = round + 1
        for (let i = 0; i < Math.floor(n / 2); i++) {
            let home = (round + i) % (n - 1)
            let away = (n - 1 - i + round) % (n - 1)
            if (i === 0) away = n - 1

            if (round >= n - 1) {
                matches.push({ league_id: leagueId, season, week, home_club_id: clubIds[away], away_club_id: clubIds[home] })
            } else {
                matches.push({ league_id: leagueId, season, week, home_club_id: clubIds[home], away_club_id: clubIds[away] })
            }
        }
    }

    const batchSize = 50
    for (let i = 0; i < matches.length; i += batchSize) {
        await supabase.from('schedule').insert(matches.slice(i, i + batchSize))
    }
}
