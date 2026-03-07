/**
 * ZATERDAGVOETBAL - Supabase Client
 * Initializes and exports the Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables in Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Multiplayer disabled.');
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : null;

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseAvailable() {
    return supabase !== null;
}
