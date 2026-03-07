// ZATERDAGVOETBAL - Create League Edge Function
// Creates league + club for creator

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

        const { league_name, club_name } = await req.json()

        // Generate invite code
        const { data: inviteCode } = await supabase.rpc('generate_invite_code')

        // Create league
        const { data: league, error: leagueError } = await supabase
            .from('leagues')
            .insert({
                name: league_name || `Competitie ${inviteCode}`,
                invite_code: inviteCode,
                created_by: user.id,
                status: 'lobby'
            })
            .select()
            .single()

        if (leagueError) throw leagueError

        // Create club for creator
        const { data: club, error: clubError } = await supabase
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

        return new Response(JSON.stringify({ league, club }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
