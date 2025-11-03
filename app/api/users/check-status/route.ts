// app/api/users/check-status/route.ts - Check User Email Confirmation Status
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserFromToken } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// POST - Check email confirmation status for multiple users (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { user, error: authError } = await getUserFromToken(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if admin
    const supabase = createServerClient(token);
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userIds } = body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: userIds array required' },
        { status: 400 }
      );
    }
    
    // Use RPC function to check email confirmation status
    // Since we can't directly query auth.users, we'll create a function
    const statuses: Record<string, boolean> = {};
    
    // Try to get confirmation status via RPC function
    for (const userId of userIds) {
      try {
        const { data, error } = await supabase.rpc('check_user_email_confirmed', {
          user_id: userId
        });
        
        if (!error && data !== null) {
          statuses[userId] = data as boolean;
        } else {
          // Default to false if function doesn't exist or error
          statuses[userId] = false;
        }
      } catch (error) {
        // If RPC function doesn't exist, default to false
        statuses[userId] = false;
      }
    }
    
    return NextResponse.json({
      success: true,
      statuses
    });
  } catch (error: any) {
    console.error('Error checking user statuses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check user statuses' },
      { status: 500 }
    );
  }
}



