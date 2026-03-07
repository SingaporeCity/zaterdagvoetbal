// ZATERDAGVOETBAL - Buy Player Edge Function
// Atomic transfer via PostgreSQL execute_transfer() function

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

        // Get auth user from request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Verify JWT
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
            global: { headers: { Authorization: authHeader } }
        })
        const { data: { user }, error: authError } = await anonClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const { listing_id, club_id } = await req.json()
        if (!listing_id || !club_id) {
            return new Response(JSON.stringify({ error: 'listing_id en club_id verplicht' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Execute atomic transfer via RPC
        const { data, error } = await supabase.rpc('execute_transfer', {
            p_listing_id: listing_id,
            p_buyer_club_id: club_id,
            p_buyer_user_id: user.id
        })

        if (error) throw error

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
