// app/api/plans/route.ts - Wedding Plans API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// GET - List all plans for current user (or all if admin)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { getUserFromToken } = await import('@/lib/supabase-server');
    const { user, error: authError } = await getUserFromToken(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = createServerClient(token);
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.is_admin === true;
    
    // If admin, get all plans; otherwise, get user's plans only
    let query = supabase
      .from('wedding_plans')
      .select(`
        *,
        profiles:user_id (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - Create a new wedding plan
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
    
    const { getUserFromToken } = await import('@/lib/supabase-server');
    const { user, error: authError } = await getUserFromToken(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = createServerClient(token);
    
    const body = await request.json();
    const { guestCount, budget, venueType, season, planData, step } = body;
    
    // Validate required fields
    if (!guestCount || !budget || !venueType || !season || !planData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('wedding_plans')
      .insert({
        user_id: user.id,
        guest_count: guestCount,
        budget: budget,
        venue_type: venueType,
        season: season,
        plan_data: planData,
        step: step || 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}

