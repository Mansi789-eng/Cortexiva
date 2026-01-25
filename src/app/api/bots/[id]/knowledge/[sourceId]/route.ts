import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string; sourceId: string }>;
}

// GET /api/bots/[id]/knowledge/[sourceId] - Get a single knowledge source
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: botId, sourceId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', user.id)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Get the knowledge source
    const { data: source, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('bot_id', botId)
      .single();

    if (error || !source) {
      return NextResponse.json(
        { error: 'Knowledge source not found' },
        { status: 404 }
      );
    }

    // Get embedding count for this source
    const { count } = await supabase
      .from('embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('source_id', sourceId);

    return NextResponse.json({
      source: {
        ...source,
        embeddingsCount: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/bots/[id]/knowledge/[sourceId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bots/[id]/knowledge/[sourceId] - Delete a knowledge source
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: botId, sourceId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', user.id)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Get the source to check file path
    const { data: source } = await supabase
      .from('knowledge_sources')
      .select('file_path')
      .eq('id', sourceId)
      .eq('bot_id', botId)
      .single();

    // Delete embeddings first
    const { error: embeddingsError } = await supabase
      .from('embeddings')
      .delete()
      .eq('source_id', sourceId);

    if (embeddingsError) {
      console.error('Error deleting embeddings:', embeddingsError);
    }

    // Delete file from storage if exists
    if (source?.file_path) {
      const { error: storageError } = await supabase.storage
        .from('knowledge')
        .remove([source.file_path]);

      if (storageError) {
        console.error('Error deleting file:', storageError);
      }
    }

    // Delete the knowledge source
    const { error } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('id', sourceId)
      .eq('bot_id', botId);

    if (error) {
      console.error('Error deleting source:', error);
      return NextResponse.json(
        { error: 'Failed to delete knowledge source' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/bots/[id]/knowledge/[sourceId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
