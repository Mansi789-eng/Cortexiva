export interface Chunk {
  content: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
  };
}

export interface ChunkOptions {
  chunkSize?: number;      // Target characters per chunk
  chunkOverlap?: number;   // Overlap between chunks
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP
  } = options;

  // Clean up the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length <= chunkSize) {
    return [{
      content: cleanedText,
      index: 0,
      metadata: {
        startChar: 0,
        endChar: cleanedText.length,
      },
    }];
  }

  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + chunkSize;

    // Don't exceed text length
    if (endIndex >= cleanedText.length) {
      endIndex = cleanedText.length;
    } else {
      // Try to find a good break point (sentence or paragraph)
      const searchStart = Math.max(startIndex + chunkSize - 200, startIndex);
      const searchText = cleanedText.slice(searchStart, endIndex + 100);

      // Look for paragraph break first
      const paragraphBreak = searchText.lastIndexOf('\n\n');
      if (paragraphBreak !== -1 && paragraphBreak > 100) {
        endIndex = searchStart + paragraphBreak + 2;
      } else {
        // Look for sentence break
        const sentenceBreaks = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
        let bestBreak = -1;

        for (const breakStr of sentenceBreaks) {
          const breakIndex = searchText.lastIndexOf(breakStr);
          if (breakIndex !== -1 && breakIndex > bestBreak) {
            bestBreak = breakIndex;
          }
        }

        if (bestBreak !== -1 && bestBreak > 100) {
          endIndex = searchStart + bestBreak + 2;
        }
      }
    }

    const chunkContent = cleanedText.slice(startIndex, endIndex).trim();

    if (chunkContent.length > 0) {
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        metadata: {
          startChar: startIndex,
          endChar: endIndex,
        },
      });
      chunkIndex++;
    }

    // Move start position with overlap
    startIndex = endIndex - chunkOverlap;

    // Ensure we make progress
    if (startIndex >= cleanedText.length - 50) {
      break;
    }
  }

  return chunks;
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}
