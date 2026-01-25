import { getDocumentModel } from '@/lib/gemini';
import { Part } from '@google/generative-ai';

// ============================================
// Tree Index Types
// ============================================

export interface TreeSection {
  id: string;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  subsections: TreeSection[];
}

export interface TreeIndex {
  documentTitle: string;
  documentSummary: string;
  documentType: string;
  totalSections: number;
  sections: TreeSection[];
  rawContent?: string; // Store full text for fallback
}

// ============================================
// Build Tree Index from Document
// ============================================

export async function buildTreeIndex(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<TreeIndex> {
  console.log(`[TreeIndex] Building index for ${filename} (${mimeType}, ${buffer.length} bytes)`);

  const model = getDocumentModel();
  const base64Data = buffer.toString('base64');

  const filePart: Part = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };

  const prompt = `Analyze this document "${filename}" and create a structured hierarchical index.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.

Your response must be a JSON object with this exact structure:
{
  "documentTitle": "The title of the document",
  "documentSummary": "A 2-3 sentence summary of what this document is about",
  "documentType": "letter|report|manual|article|presentation|other",
  "sections": [
    {
      "id": "s1",
      "title": "Section title",
      "summary": "Brief summary of this section",
      "content": "The actual text content of this section (verbatim from document)",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "subsections": []
    }
  ]
}

Instructions:
1. Extract ALL text content from the document
2. Organize into logical sections based on document structure
3. For each section, include the FULL verbatim text in "content"
4. Create meaningful summaries and keywords for each section
5. Use subsections for nested structure (like sub-headings)
6. If no clear sections exist, create logical divisions
7. Section IDs should be s1, s2, s3... and subsections s1.1, s1.2, etc.

Return ONLY the JSON object, nothing else.`;

  try {
    console.log(`[TreeIndex] Calling Gemini...`);
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();
    console.log(`[TreeIndex] Got response: ${text.length} chars`);

    // Parse JSON from response
    const treeIndex = parseTreeIndexResponse(text, filename);
    console.log(`[TreeIndex] Parsed ${treeIndex.totalSections} sections from ${filename}`);

    return treeIndex;
  } catch (error) {
    console.error(`[TreeIndex] Error building index for ${filename}:`, error);
    throw error;
  }
}

// ============================================
// Build Tree Index from Text (for URLs/text input)
// ============================================

export async function buildTreeIndexFromText(
  text: string,
  name: string
): Promise<TreeIndex> {
  console.log(`[TreeIndex] Building index from text: ${name} (${text.length} chars)`);

  const model = getDocumentModel();

  const prompt = `Analyze this text content titled "${name}" and create a structured hierarchical index.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.

TEXT CONTENT:
---
${text.slice(0, 50000)}
---

Your response must be a JSON object with this exact structure:
{
  "documentTitle": "The title of the document",
  "documentSummary": "A 2-3 sentence summary of what this document is about",
  "documentType": "letter|report|manual|article|presentation|other",
  "sections": [
    {
      "id": "s1",
      "title": "Section title",
      "summary": "Brief summary of this section",
      "content": "The actual text content of this section (verbatim)",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "subsections": []
    }
  ]
}

Instructions:
1. Organize the text into logical sections
2. For each section, include the FULL verbatim text in "content"
3. Create meaningful summaries and keywords for each section
4. Use subsections for nested structure if applicable
5. Section IDs should be s1, s2, s3... and subsections s1.1, s1.2, etc.

Return ONLY the JSON object, nothing else.`;

  try {
    console.log(`[TreeIndex] Calling Gemini for text...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    console.log(`[TreeIndex] Got response: ${responseText.length} chars`);

    const treeIndex = parseTreeIndexResponse(responseText, name);
    treeIndex.rawContent = text; // Store original text as fallback
    console.log(`[TreeIndex] Parsed ${treeIndex.totalSections} sections from text`);

    return treeIndex;
  } catch (error) {
    console.error(`[TreeIndex] Error building index from text:`, error);
    throw error;
  }
}

// ============================================
// Parse and Validate Response
// ============================================

function parseTreeIndexResponse(responseText: string, filename: string): TreeIndex {
  // Clean up response - remove markdown code blocks if present
  let jsonStr = responseText.trim();

  // Remove ```json and ``` if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and normalize structure
    const treeIndex: TreeIndex = {
      documentTitle: parsed.documentTitle || filename,
      documentSummary: parsed.documentSummary || 'No summary available',
      documentType: parsed.documentType || 'other',
      totalSections: 0,
      sections: [],
    };

    // Process sections
    if (Array.isArray(parsed.sections)) {
      treeIndex.sections = parsed.sections.map((s: Partial<TreeSection>, i: number) =>
        normalizeSection(s, `s${i + 1}`)
      );
    }

    // Count total sections including subsections
    treeIndex.totalSections = countSections(treeIndex.sections);

    return treeIndex;
  } catch (parseError) {
    console.error(`[TreeIndex] JSON parse error:`, parseError);
    console.error(`[TreeIndex] Raw response:`, jsonStr.slice(0, 500));

    // Return a fallback structure with the raw text
    return {
      documentTitle: filename,
      documentSummary: 'Document content extracted',
      documentType: 'other',
      totalSections: 1,
      sections: [{
        id: 's1',
        title: 'Content',
        summary: 'Full document content',
        content: jsonStr.slice(0, 10000), // Use response as content
        keywords: [],
        subsections: [],
      }],
      rawContent: jsonStr,
    };
  }
}

function normalizeSection(section: Partial<TreeSection>, defaultId: string): TreeSection {
  return {
    id: section.id || defaultId,
    title: section.title || 'Untitled Section',
    summary: section.summary || '',
    content: section.content || '',
    keywords: Array.isArray(section.keywords) ? section.keywords : [],
    subsections: Array.isArray(section.subsections)
      ? section.subsections.map((sub, i) => normalizeSection(sub, `${defaultId}.${i + 1}`))
      : [],
  };
}

function countSections(sections: TreeSection[]): number {
  let count = sections.length;
  for (const section of sections) {
    count += countSections(section.subsections);
  }
  return count;
}

// ============================================
// Utility: Get all content from tree (for context building)
// ============================================

export function getAllContent(treeIndex: TreeIndex): string {
  const parts: string[] = [];

  function extractContent(sections: TreeSection[], depth = 0) {
    for (const section of sections) {
      const indent = '  '.repeat(depth);
      if (section.title) {
        parts.push(`${indent}## ${section.title}`);
      }
      if (section.content) {
        parts.push(`${indent}${section.content}`);
      }
      if (section.subsections.length > 0) {
        extractContent(section.subsections, depth + 1);
      }
    }
  }

  parts.push(`# ${treeIndex.documentTitle}`);
  parts.push(treeIndex.documentSummary);
  parts.push('');
  extractContent(treeIndex.sections);

  return parts.join('\n\n');
}
