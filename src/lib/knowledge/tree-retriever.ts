import { getChatModel } from '@/lib/gemini';
import { createServiceClient } from '@/lib/supabase/service';
import { TreeIndex, TreeSection, getAllContent } from './tree-indexer';

// ============================================
// Types
// ============================================

export interface RelevantSection {
  documentTitle: string;
  sectionId: string;
  sectionTitle: string;
  content: string;
  summary: string;
  relevanceScore: number;
  sourceName: string;
}

export interface RetrievalResult {
  reasoning: string;
  relevantSections: RelevantSection[];
  totalDocuments: number;
}

// ============================================
// Reasoning-Based Retrieval
// ============================================

export async function searchWithReasoning(
  query: string,
  botId: string,
  confidenceThreshold: number = 70
): Promise<RetrievalResult> {
  console.log(`[Retriever] Searching for: "${query}" in bot ${botId}`);

  const supabase = createServiceClient();

  // Get all knowledge sources with tree indexes for this bot
  const { data: sources, error } = await supabase
    .from('knowledge_sources')
    .select('id, name, tree_index, content')
    .eq('bot_id', botId)
    .eq('status', 'completed');

  if (error) {
    console.error('[Retriever] Error fetching sources:', error);
    return {
      reasoning: 'Error fetching knowledge sources',
      relevantSections: [],
      totalDocuments: 0,
    };
  }

  if (!sources || sources.length === 0) {
    console.log('[Retriever] No knowledge sources found');
    return {
      reasoning: 'No knowledge sources available',
      relevantSections: [],
      totalDocuments: 0,
    };
  }

  console.log(`[Retriever] Found ${sources.length} knowledge sources`);

  // Build document summaries for Gemini to reason over
  const documentSummaries = sources.map((source, i) => {
    const treeIndex = source.tree_index as TreeIndex | null;
    if (treeIndex) {
      return {
        index: i,
        name: source.name,
        title: treeIndex.documentTitle,
        summary: treeIndex.documentSummary,
        type: treeIndex.documentType,
        sections: treeIndex.sections.map(s => ({
          id: s.id,
          title: s.title,
          summary: s.summary,
          keywords: s.keywords,
        })),
      };
    }
    // Fallback for sources without tree_index
    return {
      index: i,
      name: source.name,
      title: source.name,
      summary: source.content?.slice(0, 500) || 'No content',
      type: 'other',
      sections: [],
    };
  });

  // Use Gemini to reason about which sections are relevant
  const model = getChatModel();

  const prompt = `You are a retrieval assistant. Given a user query and document summaries, identify the most relevant sections.

USER QUERY: "${query}"

AVAILABLE DOCUMENTS:
${JSON.stringify(documentSummaries, null, 2)}

TASK:
1. Analyze the user's query to understand what information they need
2. Review each document's summary and sections
3. Identify which specific sections are most likely to contain the answer
4. Rank them by relevance

Return ONLY valid JSON with this structure:
{
  "reasoning": "Brief explanation of why you selected these sections",
  "relevantSections": [
    {
      "documentIndex": 0,
      "sectionId": "s1",
      "relevanceScore": 0.95
    }
  ]
}

Rules:
- Return up to 5 most relevant sections
- relevanceScore should be 0.0 to 1.0
- If no sections seem relevant, return empty array
- Return ONLY JSON, no markdown`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse the response
    let parsed;
    try {
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      console.error('[Retriever] Failed to parse Gemini response');
      // Fallback: return all content from first source
      return fallbackRetrieval(sources);
    }

    // Build full relevant sections with content
    const relevantSections: RelevantSection[] = [];

    for (const match of parsed.relevantSections || []) {
      const source = sources[match.documentIndex];
      if (!source) continue;

      const treeIndex = source.tree_index as TreeIndex | null;
      if (!treeIndex) continue;

      // Find the section by ID
      const section = findSectionById(treeIndex.sections, match.sectionId);
      if (section) {
        relevantSections.push({
          documentTitle: treeIndex.documentTitle,
          sectionId: section.id,
          sectionTitle: section.title,
          content: section.content,
          summary: section.summary,
          relevanceScore: match.relevanceScore || 0.8,
          sourceName: source.name,
        });
      }
    }

    // Convert threshold from 0-100 to 0-1 and filter sections
    const threshold = confidenceThreshold / 100;
    const filteredSections = relevantSections.filter(
      section => section.relevanceScore >= threshold
    );

    console.log(`[Retriever] Found ${relevantSections.length} relevant sections, ${filteredSections.length} above threshold ${confidenceThreshold}%`);

    return {
      reasoning: parsed.reasoning || 'Sections selected based on relevance',
      relevantSections: filteredSections,
      totalDocuments: sources.length,
    };
  } catch (error) {
    console.error('[Retriever] Gemini error:', error);
    return fallbackRetrieval(sources);
  }
}

// ============================================
// Helper Functions
// ============================================

function findSectionById(sections: TreeSection[], id: string): TreeSection | null {
  for (const section of sections) {
    if (section.id === id) return section;
    if (section.subsections.length > 0) {
      const found = findSectionById(section.subsections, id);
      if (found) return found;
    }
  }
  return null;
}

function fallbackRetrieval(sources: Array<{ name: string; tree_index: unknown; content: string | null }>): RetrievalResult {
  // Fallback: return content from all sources
  const relevantSections: RelevantSection[] = [];

  for (const source of sources.slice(0, 3)) {
    const treeIndex = source.tree_index as TreeIndex | null;
    if (treeIndex && treeIndex.sections.length > 0) {
      // Add first few sections from each document
      for (const section of treeIndex.sections.slice(0, 2)) {
        relevantSections.push({
          documentTitle: treeIndex.documentTitle,
          sectionId: section.id,
          sectionTitle: section.title,
          content: section.content,
          summary: section.summary,
          relevanceScore: 0.5,
          sourceName: source.name,
        });
      }
    } else if (source.content) {
      // Use raw content as fallback
      relevantSections.push({
        documentTitle: source.name,
        sectionId: 'raw',
        sectionTitle: 'Content',
        content: source.content.slice(0, 3000),
        summary: 'Document content',
        relevanceScore: 0.5,
        sourceName: source.name,
      });
    }
  }

  return {
    reasoning: 'Fallback retrieval - returning available content',
    relevantSections,
    totalDocuments: sources.length,
  };
}

// ============================================
// Build Context from Retrieval Results
// ============================================

export function buildContextFromResults(results: RetrievalResult): string {
  if (results.relevantSections.length === 0) {
    return '';
  }

  const contextParts = results.relevantSections.map(section => {
    return `[Source: ${section.sourceName}]
## ${section.sectionTitle}
${section.content}`;
  });

  return contextParts.join('\n\n---\n\n');
}

// ============================================
// Get all content from a bot's knowledge base
// ============================================

export async function getAllKnowledgeContent(botId: string): Promise<string> {
  const supabase = createServiceClient();

  const { data: sources, error } = await supabase
    .from('knowledge_sources')
    .select('name, tree_index, content')
    .eq('bot_id', botId)
    .eq('status', 'completed');

  if (error || !sources || sources.length === 0) {
    return '';
  }

  const allContent: string[] = [];

  for (const source of sources) {
    const treeIndex = source.tree_index as TreeIndex | null;
    if (treeIndex) {
      allContent.push(getAllContent(treeIndex));
    } else if (source.content) {
      allContent.push(`# ${source.name}\n\n${source.content}`);
    }
  }

  return allContent.join('\n\n---\n\n');
}
