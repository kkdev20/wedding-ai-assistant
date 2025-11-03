// lib/db-helpers.ts - Database Helper Functions
import { supabase } from './supabase-browser';

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Return null instead of throwing for better error handling
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  if (error || !data) return false;
  return data.is_admin === true;
}

// Save wedding plan to database
export async function saveWeddingPlanToDB(planData: {
  guestCount: number;
  budget: number;
  venueType: string;
  season: string;
  planData: any;
  step: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Ensure profile exists (create if not exists)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, try to save plan
      }
    }

    const { data, error } = await supabase
      .from('wedding_plans')
      .insert({
        user_id: user.id,
        guest_count: planData.guestCount,
        budget: planData.budget,
        venue_type: planData.venueType,
        season: planData.season,
        plan_data: planData.planData,
        step: planData.step,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving wedding plan:', error);
    throw error;
  }
}

// Load wedding plans from database
export async function loadWeddingPlansFromDB() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('wedding_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Save chat message to database
export async function saveChatMessageToDB(
  role: 'user' | 'assistant',
  content: string,
  context?: any
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // If not logged in, don't save (fallback to localStorage)
      return null;
    }

    // Ensure profile exists (create if not exists)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, try to save message
      }
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role,
        content,
        context: context || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in saveChatMessageToDB:', error);
    return null;
  }
}

// Load chat messages from database
export async function loadChatMessagesFromDB(limit: number = 50) {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
  return data || [];
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database test error:', error);
    return false;
  }
}

// ============================================
// REAL-TIME SYNC FUNCTIONS
// ============================================

/**
 * Setup real-time subscription for wedding plans
 * Listens for INSERT, UPDATE, DELETE on wedding_plans table
 * @param userId - Current user ID
 * @param onInsert - Callback when new plan is inserted
 * @param onUpdate - Callback when plan is updated
 * @param onDelete - Callback when plan is deleted
 * @returns Subscription channel (use .unsubscribe() to cleanup)
 */
export function setupRealtimePlansSubscription(
  userId: string,
  callbacks: {
    onInsert?: (plan: any) => void;
    onUpdate?: (plan: any) => void;
    onDelete?: (planId: string) => void;
  }
) {
  const channel = supabase
    .channel(`wedding_plans:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wedding_plans',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('📡 Real-time plan change:', payload.eventType, payload.new || payload.old);
        
        if (payload.eventType === 'INSERT' && callbacks.onInsert) {
          callbacks.onInsert(payload.new);
        } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
          callbacks.onUpdate(payload.new);
        } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
          callbacks.onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Setup real-time subscription for chat messages
 * Listens for INSERT on chat_messages table
 * @param userId - Current user ID
 * @param onInsert - Callback when new message is inserted
 * @returns Subscription channel (use .unsubscribe() to cleanup)
 */
export function setupRealtimeMessagesSubscription(
  userId: string,
  onInsert: (message: any) => void
) {
  const channel = supabase
    .channel(`chat_messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('📡 Real-time message:', payload.new);
        // Only handle new messages (not our own, avoid duplicates)
        onInsert(payload.new);
      }
    )
    .subscribe();

  return channel;
}

