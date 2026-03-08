/**
 * ZATERDAGVOETBAL - Supabase Client
 * Initializes and exports the Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing — replace with your Supabase project values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://afkcxrspzpevuaefarxq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFma2N4cnNwenBldnVhZWZhcnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDI4MjYsImV4cCI6MjA4ODU3ODgyNn0.G65iuGqxsLipxogsdTVdNaKiwHlYfbCp4AN6FyVzxdI';

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
