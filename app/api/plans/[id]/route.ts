// app/api/plans/[id]/route.ts - Single Wedding Plan API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// GET - Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    // Get plan
    let query = supabase
      .from('wedding_plans')
      .select(`
        *,
        profiles:user_id (
          email,
          name
        )
      `)
      .eq('id', params.id)
      .single();
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Check ownership (unless admin)
    if (!isAdmin && data.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT - Update a plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check ownership first
    const { data: existingPlan } = await supabase
      .from('wedding_plans')
      .select('user_id')
      .eq('id', params.id)
      .single();
    
    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    if (!isAdmin && existingPlan.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Only update provided fields
    if (body.guestCount !== undefined) updateData.guest_count = body.guestCount;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.venueType !== undefined) updateData.venue_type = body.venueType;
    if (body.season !== undefined) updateData.season = body.season;
    if (body.planData !== undefined) updateData.plan_data = body.planData;
    if (body.step !== undefined) updateData.step = body.step;
    
    const { data, error } = await supabase
      .from('wedding_plans')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check ownership first
    const { data: existingPlan } = await supabase
      .from('wedding_plans')
      .select('user_id')
      .eq('id', params.id)
      .single();
    
    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    if (!isAdmin && existingPlan.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const { error } = await supabase
      .from('wedding_plans')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete plan' },
      { status: 500 }
    );
  }
}



