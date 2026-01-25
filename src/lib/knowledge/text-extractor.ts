import Papa from 'papaparse';
import * as cheerio from 'cheerio';
import yaml from 'js-yaml';
import { extractTextWithGemini } from '@/lib/gemini';

export type SupportedFileType =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'txt'
  | 'md'
  | 'csv'
  | 'json'
  | 'yaml'
  | 'yml'
  | 'html'
  | 'xml'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'gif';

export function getFileType(filename: string): SupportedFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, SupportedFileType> = {
    pdf: 'pdf',
    docx: 'docx',
    doc: 'doc',
    txt: 'txt',
    md: 'md',
    csv: 'csv',
    json: 'json',
    yaml: 'yaml',
    yml: 'yml',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    png: 'png',
    jpg: 'jpg',
    jpeg: 'jpeg',
    webp: 'webp',
    gif: 'gif',
  };
  return typeMap[ext || ''] || null;
}

// Map file types to MIME types for Gemini
function getMimeType(fileType: SupportedFileType): string {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    json: 'application/json',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    html: 'text/html',
    xml: 'application/xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return mimeTypes[fileType] || 'application/octet-stream';
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const fileType = getFileType(filename);

  if (!fileType) {
    throw new Error(`Unsupported file type: ${filename}`);
  }

  switch (fileType) {
    // PDF - Gemini handles directly
    case 'pdf':
      return extractWithGemini(buffer, fileType, filename);

    // Word documents - use mammoth (Gemini doesn't support DOCX)
    case 'docx':
    case 'doc':
      return extractFromWord(buffer);

    // Simple text files - read directly
    case 'txt':
    case 'md':
      return buffer.toString('utf-8');

    // Structured data - parse and format
    case 'csv':
      return extractFromCSV(buffer);
    case 'json':
      return extractFromJSON(buffer);
    case 'yaml':
    case 'yml':
      return extractFromYAML(buffer);

    // HTML/XML - strip tags
    case 'html':
      return extractFromHTML(buffer);
    case 'xml':
      return extractFromXML(buffer);

    // Images - use Gemini Vision
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
      return extractWithGemini(buffer, fileType, filename);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Extract text using Gemini API (supports PDF, images natively)
 */
async function extractWithGemini(
  buffer: Buffer,
  fileType: SupportedFileType,
  filename: string
): Promise<string> {
  try {
    const mimeType = getMimeType(fileType);
    const text = await extractTextWithGemini(buffer, mimeType, filename);
    return text;
  } catch (error) {
    console.error(`Gemini extraction error for ${filename}:`, error);
    throw new Error(
      `Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from Word documents using mammoth
 */
async function extractFromWord(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractFromCSV(buffer: Buffer): string {
  const csvText = buffer.toString('utf-8');
  const result = Papa.parse(csvText, { header: true });

  const rows = result.data as Record<string, string>[];
  return rows
    .map((row) => {
      return Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    })
    .join('\n');
}

function extractFromJSON(buffer: Buffer): string {
  const jsonText = buffer.toString('utf-8');
  const data = JSON.parse(jsonText);
  return JSON.stringify(data, null, 2);
}

function extractFromYAML(buffer: Buffer): string {
  const yamlText = buffer.toString('utf-8');
  const data = yaml.load(yamlText);
  return JSON.stringify(data, null, 2);
}

function extractFromHTML(buffer: Buffer): string {
  const html = buffer.toString('utf-8');
  const $ = cheerio.load(html);
  $('script, style').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

function extractFromXML(buffer: Buffer): string {
  const xml = buffer.toString('utf-8');
  const $ = cheerio.load(xml, { xmlMode: true });
  return $.text().replace(/\s+/g, ' ').trim();
}

export async function extractTextFromURL(url: string): Promise<string> {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  if (contentType.includes('application/json')) {
    const json = await response.json();
    return JSON.stringify(json, null, 2);
  }

  return response.text();
}
