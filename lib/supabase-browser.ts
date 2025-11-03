// lib/supabase-browser.ts - Browser-only Supabase client
// This file should ONLY be imported in client components ('use client')

let supabaseInstance: any = null;

function getSupabaseClient() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    // Return a mock object for SSR
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'SSR not supported' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'SSR not supported' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) })
      })
    };
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    // Use synchronous import for browser
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Create client with fallback to empty strings if env vars not available
    supabaseInstance = supabaseUrl && supabaseAnonKey
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
      : createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Return mock for error cases
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client error' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Client error' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) })
      })
    };
  }

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Export createClient function for dynamic imports
export function createClient() {
  return getSupabaseClient();
}

