'use client';

// app/auth/callback/page.tsx - Handle auth callback in client
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have URL fragments (from email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set session from URL fragments
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            router.push('/?error=auth_error');
            return;
          }

          if (data.session) {
            // Success - redirect to home
            router.push('/');
            return;
          }
        }

        // Check for code parameter (from OAuth redirect)
        const code = searchParams.get('code');
        if (code) {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code:', error);
            router.push('/?error=auth_error');
            return;
          }

          if (data.session) {
            router.push('/');
            return;
          }
        }

        // If no tokens found, redirect to home
        router.push('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/?error=auth_error');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}

