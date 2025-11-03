// lib/supabase-server.ts - Server-side Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createServerClient(token?: string) {
  const options: any = {};
  
  // If token provided, use it for authentication
  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

// Helper to get user from token
export async function getUserFromToken(token: string) {
  const supabase = createServerClient(token);
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

