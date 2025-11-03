// app/admin/layout.tsx - Admin Layout
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  BarChart3,
  MessageCircle,
  LogOut,
  Settings,
  Menu,
  X,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { isAdmin } from '@/lib/db-helpers';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Skip auth check if we're on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const checkAuth = async () => {
    try {
      // Skip auth check if on login page
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }
      
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error || !currentUser) {
        console.log('No user found, redirecting to admin login');
        // Redirect to admin login page
        router.push('/admin/login');
        return;
      }

      setUser(currentUser);
      console.log('User found:', currentUser.email);

      // Check if user profile exists and is admin
      try {
        // First check if profile exists - get full profile to debug
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, is_admin, created_at')
          .eq('id', currentUser.id)
          .single();

        console.log('Profile query result:', { profile, profileError });

        if (profileError) {
          console.error('Profile error details:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          setIsAdminUser(false);
          setLoading(false);
          return;
        }

        if (!profile) {
          console.error('Profile not found for user:', currentUser.id);
          setIsAdminUser(false);
          setLoading(false);
          return;
        }

        console.log('Profile found:', {
          id: profile.id,
          email: profile.email,
          is_admin: profile.is_admin,
          is_admin_type: typeof profile.is_admin,
          is_admin_strict: profile.is_admin === true,
          is_admin_loose: profile.is_admin == true,
          is_admin_string: profile.is_admin === 'true',
          is_admin_number: profile.is_admin === 1
        });

        // Check admin status - handle various formats (boolean, string, number)
        const isAdminValue = profile.is_admin;
        const isAdminCheck = isAdminValue === true || 
                           isAdminValue === 'true' || 
                           isAdminValue === 1 ||
                           String(isAdminValue).toLowerCase() === 'true';

        console.log('Admin check result:', {
          raw_value: isAdminValue,
          type: typeof isAdminValue,
          isAdminCheck: isAdminCheck,
          strict_true: isAdminValue === true,
          string_true: isAdminValue === 'true',
          number_one: isAdminValue === 1
        });

        if (!isAdminCheck) {
          console.log('❌ User is NOT admin. Raw value:', isAdminValue, 'Type:', typeof isAdminValue);
          setIsAdminUser(false);
          setLoading(false);
          // Redirect to admin login if not admin
          router.push('/admin/login');
          return;
        }

        setIsAdminUser(true);
        setLoading(false);
        console.log('✅ Admin access granted!');
        return; // Exit early on success
      } catch (adminError: any) {
        console.error('Error checking admin status:', adminError);
        // Show error but don't redirect - let user see the error
        setIsAdminUser(false);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      // Redirect to admin login if error
      router.push('/admin/login');
      setIsAdminUser(false);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Don't render layout wrapper for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const recheckAdmin = async () => {
    setLoading(true);
    await checkAuth();
  };

  if (!isAdminUser && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need admin privileges to access this page.
          </p>
          
          {user && (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                  <strong>Logged in as:</strong> {user.email}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  If you just set admin status in Supabase, click &quot;Refresh Access&quot; below.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                To become an admin, run this SQL in Supabase Dashboard:
              </p>
              <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm mb-4 text-left max-w-md overflow-x-auto">
                UPDATE profiles<br/>
                SET is_admin = true<br/>
                WHERE email = &apos;{user.email}&apos;;
              </code>
            </>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={recheckAdmin}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Refresh Access
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go to Home
            </button>
          </div>

          <div className="mt-6 text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="font-semibold mb-2">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you saved the change in Supabase</li>
              <li>Check browser console (F12) for errors</li>
              <li>Verify &quot;is_admin&quot; is exactly &quot;true&quot; (not null)</li>
              <li>Try clicking &quot;Refresh Access&quot; after setting admin</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/venues', icon: Building2, label: 'Venues' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/plans', icon: FileText, label: 'Plans' },
    { href: '/admin/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/admin/content', icon: BookOpen, label: 'Content' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  Admin Panel
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${active
                          ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

