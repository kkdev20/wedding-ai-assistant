// components/AuthButton.tsx - Simple Auth UI Component
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { User, LogIn, LogOut, UserPlus } from 'lucide-react';

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in browser
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check if Supabase is properly initialized
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      setLoading(false);
      return;
    }

    let subscription: any = null;

    try {
      // Check current session
      supabase.auth.getSession().then(({ data: { session }, error }: any) => {
        if (error) {
          console.error('Auth error:', error);
          setLoading(false);
          return;
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((error: any) => {
        console.error('Auth session error:', error);
        setLoading(false);
      });

      // Listen for auth changes
      const authChangeResult = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
      });

      subscription = authChangeResult?.data?.subscription;
    } catch (error) {
      console.error('Error setting up auth:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setError('Supabase not configured. Please check environment variables.');
      return;
    }
    
    try {
      // Get current origin (production or localhost)
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'https://wedding-ai-assistant-7zmpmv4jt-kkdev20s-projects.vercel.app/auth/callback';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        // Provide helpful error messages
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('Password')) {
          setError('Password must be at least 6 characters long.');
        } else if (error.message.includes('email')) {
          setError('Email invalid or already in use. Please use a different email or sign in.');
        } else {
          setError(error.message || 'Error signing up. Please try again.');
          console.error('Full error details:', {
            message: error.message,
            status: error.status,
            name: error.name
          });
        }
        return;
      }
      
      if (data.user) {
        console.log('✅ Signup successful:', data.user.id);
        setShowAuthModal(false);
        const userEmail = email.trim();
        setEmail('');
        setPassword('');
        setName('');
        
        // Check if email confirmation is required
        const needsConfirmation = !data.session && data.user.email_confirmed_at === null;
        
        if (needsConfirmation) {
          // Show success message with email confirmation info
          alert(
            '✅ Pendaftaran berhasil!\n\n' +
            'Silakan periksa email Anda (' + userEmail + ') untuk mengaktifkan akun.\n\n' +
            'Klik link aktivasi di email untuk mengaktifkan akun Anda. Setelah itu, Anda bisa langsung login.\n\n' +
            'Jika email tidak muncul, cek folder spam Anda.'
          );
        } else {
          // Auto-confirmed, can login immediately
          alert(
            '✅ Pendaftaran berhasil!\n\n' +
            'Akun Anda sudah aktif. Silakan login dengan email dan password Anda.'
          );
        }
      } else {
        console.warn('⚠️ Signup returned no user data');
        setError('Signup completed but user data not returned. Please try signing in.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setError('Supabase not configured. Please check environment variables.');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Provide helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials or sign up first.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.');
        } else {
          setError(error.message || 'Error signing in. Please try again.');
        }
        return;
      }
      
      if (data.user) {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      return;
    }
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className={`p-2 rounded-lg ${className}`}>
        <div className="w-5 h-5 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className={`p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600 flex items-center gap-2 ${className}`}
        title="Sign In"
      >
        <LogIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Sign In</span>
      </button>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setError(null);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm text-rose-600 dark:text-rose-400 hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

