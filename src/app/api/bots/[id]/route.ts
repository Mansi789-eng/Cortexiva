import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/bots/[id] - Get a single bot by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the bot (RLS ensures user can only see their own bots)
    const { data: bot, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bot });
  } catch (error) {
    console.error('Error in GET /api/bots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/bots/[id] - Update a bot
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const { name, department, description, config, status } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (department !== undefined) updateData.department = department;
    if (description !== undefined) updateData.description = description;
    if (config !== undefined) updateData.config = config;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update the bot (RLS ensures user can only update their own bots)
    const { data: bot, error } = await supabase
      .from('bots')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bot:', error);
      return NextResponse.json(
        { error: 'Failed to update bot' },
        { status: 500 }
      );
    }

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bot });
  } catch (error) {
    console.error('Error in PATCH /api/bots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bots/[id] - Delete a bot
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete associated data first (embeddings, knowledge_sources)
    // Embeddings will cascade delete from knowledge_sources
    const { error: sourceError } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('bot_id', id);

    if (sourceError) {
      console.error('Error deleting knowledge sources:', sourceError);
    }

    // Delete chats
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('bot_id', id);

    if (chatError) {
      console.error('Error deleting chats:', chatError);
    }

    // Delete the bot (RLS ensures user can only delete their own bots)
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bot:', error);
      return NextResponse.json(
        { error: 'Failed to delete bot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/bots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
