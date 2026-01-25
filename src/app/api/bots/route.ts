import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { defaultBotConfig } from '@/lib/types/database';
import { checkBotLimit } from '@/lib/limits';

// POST /api/bots - Create a new bot
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, department, description, config } = body;

    // Validate required fields
    if (!name || !department) {
      return NextResponse.json(
        { error: 'Name and department are required' },
        { status: 400 }
      );
    }

    // Check bot limit based on user's tier
    const limitCheck = await checkBotLimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, limit: limitCheck.limit, current: limitCheck.current },
        { status: 403 }
      );
    }

    // Create bot with merged config
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        user_id: user.id,
        name,
        department,
        description: description || null,
        config: { ...defaultBotConfig, ...config },
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bot:', error);
      return NextResponse.json(
        { error: 'Failed to create bot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/bots - List all bots for the current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all bots for this user
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bots' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bots });
  } catch (error) {
    console.error('Error in GET /api/bots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
