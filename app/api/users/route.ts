// app/api/users/route.ts - Users API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// GET - List all users (admin only) or get current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('id'); // Get specific user by ID
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    // If requesting specific user, return that user's profile
    if (userId) {
      // Only admins can view other users, or users can view themselves
      if (!isAdmin && userId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: data
      });
    }
    
    // List all users (admin only)
    if (!isAdmin) {
      // Non-admins can only see their own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: [data],
        count: 1
      });
    }
    
    // Admin can see all users
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { userId, name, isAdmin } = body;
    
    // Check if admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isCurrentUserAdmin = currentProfile?.is_admin === true;
    
    // Determine which user to update
    const targetUserId = userId || user.id;
    
    // Only admins can update other users or change admin status
    if (targetUserId !== user.id && !isCurrentUserAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Only admins can change admin status
    if (isAdmin !== undefined && !isCurrentUserAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can change admin status' },
        { status: 403 }
      );
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name;
    if (isAdmin !== undefined && isCurrentUserAdmin) updateData.is_admin = isAdmin;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}



