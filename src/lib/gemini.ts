import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Configuration
// ============================================

// Set USE_VERTEX_AI=true in .env for EU data residency
const USE_VERTEX_AI = process.env.USE_VERTEX_AI === 'true';

// Vertex AI config (EU region)
const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'europe-west4'; // Netherlands

// Model names
export const DOCUMENT_MODEL = 'gemini-2.0-flash';
export const CHAT_MODEL = 'gemini-2.0-flash';

// ============================================
// Vercel Credentials Setup
// ============================================

// For Vercel: Write JSON credentials to temp file if provided as env var
function setupVertexCredentials(): void {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // Write credentials to /tmp (Vercel's writable directory)
      const credentialsPath = path.join('/tmp', 'gcp-credentials.json');
      fs.writeFileSync(credentialsPath, credentialsJson);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      console.log('[Gemini] Vertex AI credentials configured from JSON env var');
    } catch (error) {
      console.error('[Gemini] Failed to write credentials file:', error);
    }
  }
}

// Setup credentials before initializing Vertex AI
if (USE_VERTEX_AI) {
  setupVertexCredentials();
}

// ============================================
// Provider Initialization (Lazy)
// ============================================

// Google AI (default - simpler setup)
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Vertex AI (EU compliant) - lazy initialization to pick up env changes
let _vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI | null {
  if (!USE_VERTEX_AI || !VERTEX_PROJECT) return null;

  if (!_vertexAI) {
    // Re-run credentials setup to ensure fresh env vars are used
    setupVertexCredentials();
    _vertexAI = new VertexAI({ project: VERTEX_PROJECT, location: VERTEX_LOCATION });
    console.log(`[Gemini] Initialized Vertex AI (${VERTEX_LOCATION})`);
  }
  return _vertexAI;
}

console.log(`[Gemini] Provider: ${USE_VERTEX_AI ? `Vertex AI (${VERTEX_LOCATION})` : 'Google AI'}`);

// ============================================
// Unified Model Interface
// ============================================

interface GenerativeModel {
  generateContent(request: unknown): Promise<{ response: { text: () => string } }>;
  startChat(config?: unknown): {
    sendMessage(message: string): Promise<{ response: { text: () => string } }>;
  };
}

function getModel(modelName: string): GenerativeModel {
  const vertexAI = getVertexAI();
  if (USE_VERTEX_AI && vertexAI) {
    // Vertex AI model
    const model = vertexAI.getGenerativeModel({ model: modelName });
    return {
      generateContent: async (request: unknown) => {
        // Convert array format [prompt, filePart] to Vertex AI format
        let vertexRequest: Parameters<typeof model.generateContent>[0];

        if (Array.isArray(request)) {
          // Convert array to Vertex AI contents format
          const parts = request.map((item) => {
            if (typeof item === 'string') {
              return { text: item };
            } else if (item && typeof item === 'object' && 'inlineData' in item) {
              return { inlineData: (item as { inlineData: { mimeType: string; data: string } }).inlineData };
            }
            return item;
          });
          vertexRequest = {
            contents: [{ role: 'user', parts }],
          };
        } else if (typeof request === 'string') {
          // Simple string prompt
          vertexRequest = {
            contents: [{ role: 'user', parts: [{ text: request }] }],
          };
        } else {
          // Already in correct format
          vertexRequest = request as Parameters<typeof model.generateContent>[0];
        }

        const result = await model.generateContent(vertexRequest);
        const response = await result.response;
        return {
          response: {
            text: () => {
              const candidate = response.candidates?.[0];
              if (candidate?.content?.parts?.[0]) {
                return (candidate.content.parts[0] as { text: string }).text || '';
              }
              return '';
            },
          },
        };
      },
      startChat: (config?: unknown) => {
        const chat = model.startChat(config as Parameters<typeof model.startChat>[0]);
        return {
          sendMessage: async (message: string) => {
            const result = await chat.sendMessage(message);
            const response = await result.response;
            return {
              response: {
                text: () => {
                  const candidate = response.candidates?.[0];
                  if (candidate?.content?.parts?.[0]) {
                    return (candidate.content.parts[0] as { text: string }).text || '';
                  }
                  return '';
                },
              },
            };
          },
        };
      },
    };
  } else {
    // Google AI model (default)
    const model = googleAI.getGenerativeModel({ model: modelName });
    return {
      generateContent: async (request: unknown) => {
        const result = await model.generateContent(request as Parameters<typeof model.generateContent>[0]);
        return {
          response: {
            text: () => result.response.text(),
          },
        };
      },
      startChat: (config?: unknown) => {
        const chat = model.startChat(config as Parameters<typeof model.startChat>[0]);
        return {
          sendMessage: async (message: string) => {
            const result = await chat.sendMessage(message);
            return {
              response: {
                text: () => result.response.text(),
              },
            };
          },
        };
      },
    };
  }
}

// Get model instances
export function getDocumentModel(): GenerativeModel {
  return getModel(DOCUMENT_MODEL);
}

export function getChatModel(): GenerativeModel {
  return getModel(CHAT_MODEL);
}

// ============================================
// Document Extraction
// ============================================

export async function extractTextWithGemini(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  console.log(`[Gemini] Starting extraction for ${filename} (${mimeType}, ${buffer.length} bytes)`);

  const model = getDocumentModel();
  const base64Data = buffer.toString('base64');

  const prompt = `Extract ALL text content from this document "${filename}".

Instructions:
- Extract every piece of text visible in the document
- Preserve the structure: headings, paragraphs, lists, tables
- For tables, format them in a readable way
- Include any text from headers, footers, captions
- If there are multiple pages, process all of them
- Do NOT summarize - extract the actual text verbatim
- Do NOT add commentary - just return the extracted text`;

  const request = USE_VERTEX_AI
    ? {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } },
          ],
        }],
      }
    : [prompt, { inlineData: { mimeType, data: base64Data } } as Part];

  try {
    console.log(`[Gemini] Calling generateContent...`);
    const result = await model.generateContent(request);
    const text = result.response.text();
    console.log(`[Gemini] Successfully extracted ${text.length} chars from ${filename}`);
    return text;
  } catch (error) {
    console.error(`[Gemini] API error for ${filename}:`, error);
    throw error;
  }
}

// ============================================
// Chat Functions
// ============================================

export async function chatWithGemini(
  message: string,
  context: string,
  systemPrompt: string,
  history: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<string> {
  const model = getChatModel();

  const fullPrompt = `${systemPrompt}

## Knowledge Base Context:
${context || 'No specific context available.'}

## User Question:
${message}

## Instructions:
- Answer based on the provided context
- If the context doesn't contain relevant information, say so
- Be helpful, accurate, and concise
- Cite specific information from the context when possible`;

  const chatConfig = USE_VERTEX_AI
    ? {
        history: history.map((msg) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      }
    : {
        history: history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      };

  const chat = model.startChat(chatConfig);
  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}

export async function simpleChatWithGemini(
  message: string,
  systemPrompt: string
): Promise<string> {
  const model = getChatModel();

  const prompt = `${systemPrompt}

User: ${message}`;

  const request = USE_VERTEX_AI
    ? { contents: [{ role: 'user', parts: [{ text: prompt }] }] }
    : prompt;

  const result = await model.generateContent(request);
  return result.response.text();
}
