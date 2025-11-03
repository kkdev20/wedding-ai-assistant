// app/auth/callback/route.ts - Handle Supabase auth callbacks
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createServerClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL(`/?error=auth_error`, requestUrl.origin));
    }

    if (data.session) {
      // Success - redirect to home or intended page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If no code or error, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

