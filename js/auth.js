/**
 * ZATERDAGVOETBAL - Auth Module
 * Handles sign up, sign in, sign out, and session management
 */

import { supabase, isSupabaseAvailable } from './supabase.js';

/**
 * Sign up a new user
 */
export async function signUp(email, password, displayName) {
    if (!isSupabaseAvailable()) throw new Error('Multiplayer niet beschikbaar');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName }
        }
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
    if (!isSupabaseAvailable()) throw new Error('Multiplayer niet beschikbaar');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
    if (!isSupabaseAvailable()) return;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
    if (!isSupabaseAvailable()) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

/**
 * Get current user
 */
export async function getUser() {
    if (!isSupabaseAvailable()) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
}

/**
 * Get user profile from profiles table
 */
export async function getProfile(userId) {
    if (!isSupabaseAvailable()) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
    if (!isSupabaseAvailable()) throw new Error('Multiplayer niet beschikbaar');

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback) {
    if (!isSupabaseAvailable()) return { data: { subscription: { unsubscribe: () => {} } } };

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}
