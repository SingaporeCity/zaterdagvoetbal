// ZATERDAGVOETBAL - Join League Edge Function
// Validates invite code, creates club, replaces an AI team if league is full

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceKey)

        // Verify auth
        const authHeader = req.headers.get('Authorization')
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
            global: { headers: { Authorization: authHeader || '' } }
        })
        const { data: { user } } = await anonClient.auth.getUser()
        if (!user) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const { invite_code, club_name } = await req.json()
        if (!invite_code) {
            return new Response(JSON.stringify({ error: 'Invite code verplicht' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Find league
        const { data: league, error: findError } = await supabase
            .from('leagues')
            .select('*')
            .eq('invite_code', invite_code.toUpperCase())
            .single()

        if (findError || !league) {
            return new Response(JSON.stringify({ error: 'Competitie niet gevonden' }), {
                status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Check if already joined
        const { data: existing } = await supabase
            .from('clubs')
            .select('id')
            .eq('league_id', league.id)
            .eq('owner_id', user.id)
            .single()

        if (existing) {
            return new Response(JSON.stringify({ league, club: existing, already_joined: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Count human players
        const { count } = await supabase
            .from('clubs')
            .select('id', { count: 'exact', head: true })
            .eq('league_id', league.id)
            .eq('is_ai', false)

        if ((count || 0) >= league.max_players) {
            return new Response(JSON.stringify({ error: 'Competitie zit vol' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // If league is active, replace an AI team
        let club
        if (league.status === 'active') {
            // Find an AI team to replace
            const { data: aiTeam } = await supabase
                .from('clubs')
                .select('id')
                .eq('league_id', league.id)
                .eq('is_ai', true)
                .limit(1)
                .single()

            if (aiTeam) {
                // Take over the AI team
                const { data: updated, error: updateError } = await supabase
                    .from('clubs')
                    .update({
                        owner_id: user.id,
                        name: club_name || 'FC Nieuw Team',
                        is_ai: false
                    })
                    .eq('id', aiTeam.id)
                    .select()
                    .single()

                if (updateError) throw updateError
                club = updated
            } else {
                return new Response(JSON.stringify({ error: 'Geen plek beschikbaar' }), {
                    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        } else {
            // Lobby: create new club
            const { data: newClub, error: clubError } = await supabase
                .from('clubs')
                .insert({
                    league_id: league.id,
                    owner_id: user.id,
                    name: club_name || 'FC Nieuw Team',
                    is_ai: false,
                    division: league.division
                })
                .select()
                .single()

            if (clubError) throw clubError
            club = newClub
        }

        // Feed entry
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single()

        await supabase.from('league_feed').insert({
            league_id: league.id,
            type: 'join',
            club_id: club.id,
            data: { user_name: profile?.display_name || 'Manager' }
        })

        return new Response(JSON.stringify({ league, club }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
