// app/admin/login/page.tsx - Admin Login Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Shield, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in (with timeout to prevent infinite loading)
    const checkAuth = async () => {
      const timeout = setTimeout(() => {
        setChecking(false);
      }, 2000); // Max 2 seconds checking
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        clearTimeout(timeout);
        
        // If no user or error, show login form immediately
        if (authError || !user) {
          setChecking(false);
          return;
        }
        
        // Check if user is admin (with timeout)
        const profileTimeout = setTimeout(() => {
          setChecking(false);
        }, 1000);
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          clearTimeout(profileTimeout);
          
          if (!profileError && profile?.is_admin === true) {
            // Already logged in as admin, redirect to dashboard
            router.push('/admin');
            return;
          }
        } catch (profileError) {
          clearTimeout(profileTimeout);
          console.error('Profile check error:', profileError);
          // Continue to show login form
        }
        
        setChecking(false);
      } catch (error) {
        clearTimeout(timeout);
        console.error('Auth check error:', error);
        setChecking(false);
      }
    };
    
    // Add small delay to ensure component is mounted
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before signing in');
        } else {
          setError(signInError.message || 'Error signing in');
        }
        setLoading(false);
        return;
      }

      if (!signInData.user) {
        setError('Failed to sign in. Please try again.');
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        setError('Error checking admin status');
        setLoading(false);
        return;
      }

      if (profile?.is_admin !== true) {
        // Not an admin, sign out and show error
        await supabase.auth.signOut();
        setError('Access denied. You need admin privileges to access this page.');
        setLoading(false);
        return;
      }

      // Success - redirect to admin dashboard
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Only administrators can access this page</p>
        </div>
      </div>
    </div>
  );
}

