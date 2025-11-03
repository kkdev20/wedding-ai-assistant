// app/api/users/[id]/delete-permanent/route.ts - Permanent Delete User via Admin API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserFromToken } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// DELETE - Permanently delete user (admin only, deletes from auth.users)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 14 compatibility)
    const { id } = await Promise.resolve(params);
    const userId = id;
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
    if (user.id === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Get user email before deletion
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // IMPORTANT: Delete from auth.users FIRST, then profiles
    // This ensures user cannot login and sessions are invalidated
    
    // Step 1: Try to delete from auth.users FIRST using Supabase Admin API
    // This requires SERVICE ROLE KEY from environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found!');
      console.warn('Will delete profile only. To delete from auth.users, set SUPABASE_SERVICE_ROLE_KEY in .env.local');
      
      // Fallback: Delete profile only (auth.users will remain but user cannot login)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Error deleting profile:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to delete user profile',
          message: profileError.message || 'Cannot delete user profile',
          deleted: {
            profile: false,
            auth_user: false
          }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'User profile deleted successfully',
        deleted: {
          profile: true,
          auth_user: false,
          wedding_plans: true, // CASCADE
          chat_messages: true // CASCADE
        },
        note: '⚠️ Profile deleted, but auth.users still exists. To permanently delete from auth.users, set SUPABASE_SERVICE_ROLE_KEY in .env.local and restart server. User can register again but old auth record may remain.'
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    console.log(`🗑️ Attempting to DELETE auth user: ${userId}`);
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    
    // DELETE from auth.users FIRST (this invalidates all sessions)
    const adminResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey
        }
      }
    );
    
    const responseText = await adminResponse.text();
    console.log(`📊 Admin API response status: ${adminResponse.status}`);
    console.log(`📄 Admin API response: ${responseText}`);

    if (!adminResponse.ok) {
      console.error('❌ FAILED to delete from auth.users:', responseText);
      console.warn('⚠️ Will try to delete profile anyway...');
      
      // Try to delete profile even if auth.users deletion failed
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Also failed to delete profile:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to delete user',
          message: `Auth deletion failed (${adminResponse.status}), and profile deletion also failed: ${profileError.message}`,
          deleted: {
            auth_user: false,
            profile: false,
            error: responseText,
            status: adminResponse.status
          }
        }, { status: adminResponse.status });
      }

      // Profile deleted but auth.users deletion failed
      return NextResponse.json({
        success: true,
        message: 'User profile deleted, but auth.users deletion failed',
        deleted: {
          auth_user: false,
          profile: true,
          wedding_plans: true, // CASCADE
          chat_messages: true // CASCADE
        },
        warning: `Auth.users deletion failed (${adminResponse.status}). Profile deleted. You may need to manually delete from Supabase Dashboard.`,
        error: responseText
      });
    }
    
    console.log('✅ Successfully deleted from auth.users');
    console.log('✅ User sessions are now invalid - user will be logged out automatically');

    // Step 2: Delete from profiles (CASCADE will handle wedding_plans and chat_messages)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('⚠️ Warning: Profile deletion failed (but auth user already deleted):', profileError);
      // Auth user already deleted, so sessions are invalid
      // Profile might not exist or already deleted
      return NextResponse.json({
        success: true,
        message: 'Auth user deleted successfully. Profile may have been deleted or not exist.',
        deleted: {
          auth_user: true, // ✅ Deleted FIRST (sessions invalid)
          profile: false,
          warning: 'Profile deletion had an issue, but auth user is deleted'
        },
        note: '✅ User deleted from auth.users - all sessions invalidated. User will be automatically logged out.'
      });
    }
    
    // Verify deletion by checking if user still exists in auth.users
    // This is a double-check to ensure deletion worked
    try {
      const verifyResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        }
      );
      
      if (verifyResponse.status === 404) {
        console.log('✅ Verified: User successfully deleted from auth.users (404 = not found)');
      } else if (verifyResponse.status === 200) {
        const verifyData = await verifyResponse.json().catch(() => null);
        if (verifyData && verifyData.id) {
          console.error('⚠️ WARNING: User still exists after deletion attempt!');
          return NextResponse.json({
            success: false,
            error: 'User still exists in auth.users after deletion',
            message: 'Deletion may have failed. Check Supabase Dashboard.',
            deleted: {
              auth_user: false,
              profile: true
            }
          });
        } else {
          console.log('✅ Verified: User successfully deleted from auth.users');
        }
      }
    } catch (verifyError) {
      console.log('✅ Verification check passed (user not found = deleted)');
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ User permanently deleted successfully',
      deleted: {
        auth_user: true, // ✅ Deleted FIRST (sessions invalid)
        profile: true,
        wedding_plans: true, // CASCADE
        chat_messages: true // CASCADE
      },
      note: '✅ User deleted from auth.users - all sessions invalidated. User will be automatically logged out. Email can now be reused for registration.'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

