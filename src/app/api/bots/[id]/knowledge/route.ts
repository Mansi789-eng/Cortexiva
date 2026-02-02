import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getFileType } from '@/lib/knowledge/text-extractor';
import { buildTreeIndex, buildTreeIndexFromText, getAllContent } from '@/lib/knowledge/tree-indexer';
import { v4 as uuidv4 } from 'uuid';
import { checkKnowledgeSourceLimit } from '@/lib/limits';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain',
  md: 'text/markdown',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

// POST /api/bots/[id]/knowledge - Add knowledge source
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: botId } = await params;
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

    // Check knowledge source limit
    const limitCheck = await checkKnowledgeSourceLimit(supabase, botId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, limit: limitCheck.limit, current: limitCheck.current },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const fileType = getFileType(file.name);
      if (!fileType) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}` },
          { status: 400 }
        );
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const filePath = `${user.id}/${botId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('knowledge')
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        );
      }

      // Create knowledge source record
      const { data: source, error: sourceError } = await supabase
        .from('knowledge_sources')
        .insert({
          bot_id: botId,
          type: 'file',
          name: file.name,
          file_path: filePath,
          status: 'processing',
          metadata: {
            size: file.size,
            mimeType: file.type,
            fileType,
            progress: 10,
            step: 'Building index...',
          },
        })
        .select()
        .single();

      if (sourceError) {
        console.error('Source creation error:', sourceError);
        return NextResponse.json(
          { error: 'Failed to create knowledge source' },
          { status: 500 }
        );
      }

      // Read file buffer and process
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || MIME_TYPES[fileExt] || 'application/octet-stream';

      // Process with tree indexing (synchronous)
      await processFileWithTreeIndex(source.id, fileBuffer, mimeType, file.name);

      // Fetch updated source
      const { data: updatedSource } = await supabase
        .from('knowledge_sources')
        .select('*')
        .eq('id', source.id)
        .single();

      return NextResponse.json({ source: updatedSource }, { status: 201 });
    }

    // Handle JSON body (URL or text)
    const body = await request.json();
    const { type, name, url, content } = body;

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      );
    }

    if (type === 'url' && !url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (type === 'text' && !content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Create knowledge source record
    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .insert({
        bot_id: botId,
        type,
        name,
        url: type === 'url' ? url : null,
        content: type === 'text' ? content : null,
        status: 'processing',
        metadata: {
          progress: 10,
          step: 'Building index...',
        },
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Source creation error:', sourceError);
      return NextResponse.json(
        { error: 'Failed to create knowledge source' },
        { status: 500 }
      );
    }

    // Process text/URL with tree indexing
    if (type === 'url') {
      // For URLs, we need to fetch content first
      processURLWithTreeIndex(source.id, url, name);
    } else if (type === 'text') {
      processTextWithTreeIndex(source.id, content, name);
    }

    // Return immediately with processing status
    return NextResponse.json({
      source: {
        ...source,
        status: 'processing',
        metadata: { ...source.metadata, progress: 10 }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bots/[id]/knowledge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/bots/[id]/knowledge - List knowledge sources
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: botId } = await params;
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

    // Get knowledge sources
    const { data: sources, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge sources' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error in GET /api/bots/[id]/knowledge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// Tree Index Processing Functions
// ============================================

// Process file upload with tree indexing
async function processFileWithTreeIndex(
  sourceId: string,
  buffer: Buffer,
  mimeType: string,
  filename: string
) {
  const supabase = createServiceClient();

  try {
    console.log(`[TreeIndex] Processing file: ${filename}`);

    // Update progress
    await supabase.from('knowledge_sources').update({
      status: 'processing',
      metadata: { progress: 30, step: 'Analyzing document...' },
    }).eq('id', sourceId);

    // Build tree index directly from document
    console.log(`[TreeIndex] Building tree index...`);
    const treeIndex = await buildTreeIndex(buffer, mimeType, filename);
    console.log(`[TreeIndex] Created index with ${treeIndex.totalSections} sections`);

    // Update progress
    await supabase.from('knowledge_sources').update({
      status: 'processing',
      metadata: { progress: 80, step: 'Storing index...' },
    }).eq('id', sourceId);

    // Get full content for preview
    const fullContent = getAllContent(treeIndex);

    // Store tree index in knowledge_sources
    const { error: updateError } = await supabase.from('knowledge_sources').update({
      status: 'completed',
      content: fullContent.slice(0, 10000), // Store preview
      tree_index: treeIndex,
      metadata: {
        progress: 100,
        step: 'Completed',
        sectionsCount: treeIndex.totalSections,
        documentType: treeIndex.documentType,
        indexMethod: 'tree', // Mark as using tree indexing
      },
    }).eq('id', sourceId);

    if (updateError) {
      console.error('[TreeIndex] Error storing index:', updateError);
      throw new Error('Failed to store tree index');
    }

    console.log(`[TreeIndex] Successfully indexed: ${filename}`);
  } catch (error) {
    console.error('[TreeIndex] Processing error:', error);
    await supabase.from('knowledge_sources').update({
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Processing failed',
      metadata: { progress: 0, step: 'Failed' },
    }).eq('id', sourceId);
  }
}

// Process URL with tree indexing
async function processURLWithTreeIndex(
  sourceId: string,
  url: string,
  name: string
) {
  const supabase = createServiceClient();

  try {
    console.log(`[TreeIndex] Processing URL: ${url}`);

    // Update progress
    await supabase.from('knowledge_sources').update({
      status: 'processing',
      metadata: { progress: 20, step: 'Fetching URL...' },
    }).eq('id', sourceId);

    // Fetch URL content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    const text = await response.text();
    console.log(`[TreeIndex] Fetched ${text.length} chars from URL`);

    // Update progress
    await supabase.from('knowledge_sources').update({
      status: 'processing',
      metadata: { progress: 50, step: 'Building index...' },
    }).eq('id', sourceId);

    // Build tree index from text
    const treeIndex = await buildTreeIndexFromText(text, name);
    console.log(`[TreeIndex] Created index with ${treeIndex.totalSections} sections`);

    // Get full content for preview
    const fullContent = getAllContent(treeIndex);

    // Store tree index
    await supabase.from('knowledge_sources').update({
      status: 'completed',
      content: fullContent.slice(0, 10000),
      tree_index: treeIndex,
      metadata: {
        progress: 100,
        step: 'Completed',
        sectionsCount: treeIndex.totalSections,
        documentType: treeIndex.documentType,
        indexMethod: 'tree',
      },
    }).eq('id', sourceId);

    console.log(`[TreeIndex] Successfully indexed URL: ${name}`);
  } catch (error) {
    console.error('[TreeIndex] URL processing error:', error);
    await supabase.from('knowledge_sources').update({
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Processing failed',
      metadata: { progress: 0, step: 'Failed' },
    }).eq('id', sourceId);
  }
}

// Process text with tree indexing
async function processTextWithTreeIndex(
  sourceId: string,
  content: string,
  name: string
) {
  const supabase = createServiceClient();

  try {
    console.log(`[TreeIndex] Processing text: ${name} (${content.length} chars)`);

    // Update progress
    await supabase.from('knowledge_sources').update({
      status: 'processing',
      metadata: { progress: 30, step: 'Building index...' },
    }).eq('id', sourceId);

    // Build tree index from text
    const treeIndex = await buildTreeIndexFromText(content, name);
    console.log(`[TreeIndex] Created index with ${treeIndex.totalSections} sections`);

    // Get full content for preview
    const fullContent = getAllContent(treeIndex);

    // Store tree index
    await supabase.from('knowledge_sources').update({
      status: 'completed',
      content: fullContent.slice(0, 10000),
      tree_index: treeIndex,
      metadata: {
        progress: 100,
        step: 'Completed',
        sectionsCount: treeIndex.totalSections,
        documentType: treeIndex.documentType,
        indexMethod: 'tree',
      },
    }).eq('id', sourceId);

    console.log(`[TreeIndex] Successfully indexed text: ${name}`);
  } catch (error) {
    console.error('[TreeIndex] Text processing error:', error);
    await supabase.from('knowledge_sources').update({
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Processing failed',
      metadata: { progress: 0, step: 'Failed' },
    }).eq('id', sourceId);
  }
}
