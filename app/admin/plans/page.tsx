// app/admin/plans/page.tsx - Plans Management
'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { Search, Eye, Trash2, Calendar, Users, DollarSign, MapPin } from 'lucide-react';

interface Plan {
  id: string;
  user_id: string;
  guest_count: number;
  budget: number;
  venue_type: string;
  season: string;
  plan_data: any;
  created_at: string;
  updated_at: string;
  profiles: {
    email: string;
  } | null;
}

function PlansManagementContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVenue, setFilterVenue] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_plans')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      alert('Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('wedding_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPlans();
      alert('Plan deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVenue = filterVenue === 'all' || plan.venue_type === filterVenue;
    return matchesSearch && matchesVenue;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wedding Plans Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all saved wedding plans
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={filterVenue}
            onChange={(e) => setFilterVenue(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Venue Types</option>
            <option value="beach">Beach</option>
            <option value="villa">Villa</option>
            <option value="resort">Resort</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No plans found
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {plan.profiles?.email || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{plan.guest_count} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>${plan.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{plan.venue_type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{plan.season.replace('-', ' ')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Details</h2>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPlan.profiles?.email || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Guests</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPlan.guest_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${selectedPlan.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Venue Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedPlan.venue_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Season</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedPlan.season.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPlan.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedPlan.plan_data && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Plan Data
                    </p>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(selectedPlan.plan_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlansManagement() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <PlansManagementContent />
    </Suspense>
  );
}



