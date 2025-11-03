// app/admin/users/page.tsx - Users Management
'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { Search, Shield, ShieldOff, UserX, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
  email_confirmed?: boolean;
}

function UsersManagementContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    let profiles: any[] = [];
    try {
      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      profiles = profilesData || [];

      // Load auth users to get email confirmation status
      // Note: We need to use RPC function or fetch from API since we can't directly query auth.users
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let usersWithStatus: User[] = profiles || [];

      // Since auto-confirm is enabled, all users should be confirmed
      // But we'll try to check via RPC function if available
      if (profiles && profiles.length > 0) {
        if (token) {
          try {
            // Try to get confirmation status via RPC function
            const statusPromises = profiles.map(async (profile: any) => {
              try {
                const { data, error } = await supabase.rpc('check_user_email_confirmed', {
                  user_id: profile.id
                });
                return {
                  id: profile.id,
                  confirmed: !error && data === true
                };
              } catch (error) {
                // If RPC function doesn't exist, assume confirmed (auto-confirm is on)
                return {
                  id: profile.id,
                  confirmed: true
                };
              }
            });

            const statusResults = await Promise.all(statusPromises);
            const statusMap = statusResults.reduce((acc, result) => {
              acc[result.id] = result.confirmed;
              return acc;
            }, {} as Record<string, boolean>);

            usersWithStatus = profiles.map((profile: any) => {
              const confirmed = statusMap[profile.id] ?? true; // Default to true since auto-confirm is on
              return {
                ...profile,
                email_confirmed: confirmed
              };
            });
            
            console.log('Users with status loaded:', usersWithStatus.length);
          } catch (apiError) {
            console.error('Error fetching user statuses:', apiError);
            // Default all to confirmed since auto-confirm is enabled
            usersWithStatus = profiles.map((profile: any) => ({
              ...profile,
              email_confirmed: true
            }));
          }
        } else {
          // No token, assume all confirmed (auto-confirm is on)
          usersWithStatus = profiles.map((profile: any) => ({
            ...profile,
            email_confirmed: true
          }));
        }
      }

      setUsers(usersWithStatus);
      console.log('Total users loaded:', usersWithStatus.length);
    } catch (error) {
      console.error('Error loading users:', error);
      // Set users anyway with default confirmed status
      const defaultUsers = (profiles || []).map((profile: any) => ({
        ...profile,
        email_confirmed: true
      }));
      setUsers(defaultUsers);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
      alert(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin successfully!`);
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      alert('Error updating admin status: ' + (error.message || 'Unknown error'));
    }
  };

  const confirmUser = async (userId: string) => {
    try {
      // Call SQL function via Supabase RPC to confirm email
      const { data, error } = await supabase.rpc('confirm_user_email', { 
        user_id: userId 
      });

      if (error) {
        throw new Error(error.message);
      }

      loadUsers();
      alert('User email confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming user:', error);
      alert('Error confirming user: ' + (error.message || 'Unknown error') + '\n\nNote: Make sure to run AUTO_CONFIRM_EMAIL.sql in Supabase to enable this feature.');
    }
  };

  const deleteUser = async (userId: string, userEmail: string, isAdmin: boolean) => {
    // Prevent self-deletion
    if (currentUserId && userId === currentUserId) {
      alert('You cannot delete your own account!');
      return;
    }

    // Confirm deletion
    const confirmMessage = isAdmin
      ? `⚠️ WARNING: Are you sure you want to delete ADMIN user ${userEmail}?\n\nThis will permanently delete:\n- User account\n- All wedding plans\n- All chat messages\n\n⚠️ This action cannot be undone!`
      : `Are you sure you want to delete user ${userEmail}?\n\nThis will permanently delete:\n- User account\n- All wedding plans\n- All chat messages\n\nThis action cannot be undone!`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Delete user - this will cascade delete from profiles, wedding_plans, chat_messages
      // because of ON DELETE CASCADE in database schema
      
      // Get session token for API call
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Error: No authentication token. Please login again.');
        return;
      }

      console.log('🗑️ Deleting user:', userId);

      // Try permanent delete via API endpoint (deletes from auth.users too)
      const response = await fetch(`/api/users/${userId}/delete-permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Delete response status:', response.status);

      let result;
      try {
        const responseText = await response.text();
        console.log('📄 Delete response:', responseText);
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error(`Failed to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || `Server error (${response.status})`;
        console.error('❌ Delete failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Delete successful:', result);

      // If API call succeeds, refresh user list
      await loadUsers();
      
      if (result.deleted?.auth_user && result.deleted?.profile) {
        alert(`✅ User ${userEmail} permanently deleted!\n\n✅ Deleted:\n- Authentication (auth.users)\n- Profile\n- All wedding plans\n- All chat messages\n\nUser can now register again with the same email address.`);
      } else if (result.deleted?.profile) {
        alert(`⚠️ User ${userEmail} profile deleted.\n\n✅ Deleted:\n- Profile\n- All wedding plans (CASCADE)\n- All chat messages (CASCADE)\n\n⚠️ Note: auth.users still exists. To permanently delete from auth.users:\n1. Get service role key from Supabase Dashboard\n2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local\n3. Restart dev server\n\nUser can register again, but old auth record may remain.`);
      } else {
        alert(`✅ User ${userEmail} deleted successfully!`);
      }
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      const errorMessage = error.message || 'Unknown error';
      
      // Show detailed error message
      let userMessage = `Error deleting user: ${errorMessage}`;
      
      if (errorMessage.includes('Service role key')) {
        userMessage += '\n\n🔧 Solution:\n1. Get service role key from Supabase Dashboard\n2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local\n3. Restart dev server';
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
        userMessage += '\n\n🔧 Make sure you are logged in as admin.';
      } else if (errorMessage.includes('not found')) {
        userMessage += '\n\n🔧 User may have already been deleted. Refresh the page.';
      }
      
      alert(userMessage);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage users and admin permissions
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                      {user.name && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email_confirmed === false ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                          <XCircle className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        {user.email_confirmed === false && (
                          <button
                            onClick={() => confirmUser(user.id)}
                            className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                            title="Confirm user email"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                            user.is_admin
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
                          }`}
                          title={user.is_admin ? 'Remove admin' : 'Make admin'}
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="w-4 h-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Make Admin
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.email, user.is_admin)}
                          disabled={currentUserId === user.id}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                            currentUserId === user.id
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                          }`}
                          title={currentUserId === user.id ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {users.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {users.filter(u => u.is_admin).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Regular Users</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {users.filter(u => !u.is_admin).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UsersManagement() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <UsersManagementContent />
    </Suspense>
  );
}

