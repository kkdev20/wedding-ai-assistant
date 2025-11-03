// app/admin/analytics/page.tsx - Analytics Dashboard
'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { TrendingUp, Users, Building2, FileText, MessageCircle } from 'lucide-react';

function AnalyticsContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalPlans: 0,
    totalMessages: 0,
    activeUsers: 0,
    plansByVenueType: {} as Record<string, number>,
    plansBySeason: {} as Record<string, number>,
    avgBudget: 0,
    avgGuestCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load counts
      const [usersResult, venuesResult, plansResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('venues').select('*', { count: 'exact' }),
        supabase.from('wedding_plans').select('*', { count: 'exact' }),
        supabase.from('chat_messages').select('*', { count: 'exact' })
      ]);

      // Load all plans for detailed analytics
      const { data: allPlans } = await supabase
        .from('wedding_plans')
        .select('*');

      // Calculate analytics
      const plansByVenueType: Record<string, number> = {};
      const plansBySeason: Record<string, number> = {};
      let totalBudget = 0;
      let totalGuests = 0;

      if (allPlans) {
        allPlans.forEach((plan: any) => {
          plansByVenueType[plan.venue_type] = (plansByVenueType[plan.venue_type] || 0) + 1;
          plansBySeason[plan.season] = (plansBySeason[plan.season] || 0) + 1;
          totalBudget += plan.budget;
          totalGuests += plan.guest_count;
        });
      }

      // Active users = users who created at least one plan
      const activeUsersData = { count: allPlans?.length || 0 };

      setStats({
        totalUsers: usersResult.count || 0,
        totalVenues: venuesResult.count || 0,
        totalPlans: plansResult.count || 0,
        totalMessages: messagesResult.count || 0,
        activeUsers: activeUsersData?.count || allPlans?.length || 0,
        plansByVenueType,
        plansBySeason,
        avgBudget: allPlans?.length ? totalBudget / allPlans.length : 0,
        avgGuestCount: allPlans?.length ? totalGuests / allPlans.length : 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Platform statistics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats.activeUsers} active
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Venues</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalVenues}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wedding Plans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalPlans}
              </p>
            </div>
            <FileText className="w-12 h-12 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chat Messages</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalMessages}
              </p>
            </div>
            <MessageCircle className="w-12 h-12 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans by Venue Type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Plans by Venue Type
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.plansByVenueType).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} ({stats.totalPlans > 0 ? Math.round((count / stats.totalPlans) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: `${stats.totalPlans > 0 ? (count / stats.totalPlans) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans by Season */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Plans by Season
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.plansBySeason).map(([season, count]) => (
              <div key={season}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {season.replace('-', ' ')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} ({stats.totalPlans > 0 ? Math.round((count / stats.totalPlans) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${stats.totalPlans > 0 ? (count / stats.totalPlans) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Average Budget
          </h2>
          <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
            ${Math.round(stats.avgBudget).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Average wedding budget across all plans
          </p>
        </div>

        {/* Average Guest Count */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Average Guest Count
          </h2>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(stats.avgGuestCount)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Average number of guests per wedding
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}

