// app/api/messages/route.ts - Chat Messages API
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// GET - List all messages for current user (or all if admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) throw authError;
      
      if (user) {
        // Check if admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        const isAdmin = profile?.is_admin === true;
        
        // If admin, get all messages; otherwise, get user's messages only
        let query = supabase
          .from('chat_messages')
          .select(`
            *,
            profiles:user_id (
              email,
              name
            )
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Get total count
        let countQuery = supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true });
        
        if (!isAdmin) {
          countQuery = countQuery.eq('user_id', user.id);
        }
        
        const { count } = await countQuery;
        
        return NextResponse.json({
          success: true,
          data: data || [],
          count: count || 0,
          limit,
          offset
        });
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Create a new message
export async function POST(request: NextRequest) {
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
    const { role, content, context } = body;
    
    // Validate required fields
    if (!role || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: role and content' },
        { status: 400 }
      );
    }
    
    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be "user" or "assistant"' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: role,
        content: content,
        context: context || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create message' },
      { status: 500 }
    );
  }
}



