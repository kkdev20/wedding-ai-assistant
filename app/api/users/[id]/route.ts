// app/api/users/[id]/route.ts - Delete User API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserFromToken } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// DELETE - Delete a user (admin only, deletes from auth.users)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Prevent self-deletion
    if (user.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Get user email before deletion for logging
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email, is_admin')
      .eq('id', params.id)
      .single();
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete from profiles first (cascade will handle wedding_plans and chat_messages)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete user profile' },
        { status: 500 }
      );
    }
    
    // Note: Deleting from auth.users requires service role key
    // Since we're using anon key, we can't directly delete from auth.users
    // The profile and related data are deleted, but auth user remains
    // To fully delete auth user, would need to use Supabase Admin API with service role key
    // For now, we'll just delete the profile and related data
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      note: 'Profile and related data deleted. Auth user account may still exist in auth.users (requires service role key to delete).'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

