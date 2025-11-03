// app/admin/page.tsx - Admin Dashboard
'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalVenues: number;
  totalPlans: number;
  totalMessages: number;
  recentUsers: any[];
  recentPlans: any[];
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVenues: 0,
    totalPlans: 0,
    totalMessages: 0,
    recentUsers: [],
    recentPlans: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all stats in parallel
      const [usersResult, venuesResult, plansResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('venues').select('*', { count: 'exact' }),
        supabase.from('wedding_plans').select('*', { count: 'exact' }),
        supabase.from('chat_messages').select('*', { count: 'exact' })
      ]);

      // Load recent users (last 5)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent plans (last 5)
      const { data: recentPlans } = await supabase
        .from('wedding_plans')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersResult.count || 0,
        totalVenues: venuesResult.count || 0,
        totalPlans: plansResult.count || 0,
        totalMessages: messagesResult.count || 0,
        recentUsers: recentUsers || [],
        recentPlans: recentPlans || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Venues',
      value: stats.totalVenues,
      icon: Building2,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Wedding Plans',
      value: stats.totalPlans,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Chat Messages',
      value: stats.totalMessages,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+18%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your wedding planning platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Users
          </h2>
          <div className="space-y-4">
            {stats.recentUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No users yet
              </p>
            ) : (
              stats.recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {user.is_admin && (
                    <span className="px-2 py-1 text-xs font-semibold bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded">
                      Admin
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Wedding Plans
          </h2>
          <div className="space-y-4">
            {stats.recentPlans.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No plans yet
              </p>
            ) : (
              stats.recentPlans.map((plan: any) => (
                <div
                  key={plan.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {plan.profiles?.email || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{plan.guest_count} guests</span>
                    <span>${plan.budget.toLocaleString()}</span>
                    <span className="capitalize">{plan.venue_type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}



