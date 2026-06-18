import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  splitText(
    text: string,
    chunkSize = 1000,
    chunkOverlap = 200,
  ): Promise<string[]> {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = startIndex + chunkSize;
      if (endIndex >= text.length) {
        chunks.push(text.substring(startIndex).trim());
        break;
      }

      const lastSpace = text.lastIndexOf(' ', endIndex);
      const lastNewline = text.lastIndexOf('\n', endIndex);
      let splitIndex = Math.max(lastSpace, lastNewline);

      if (splitIndex <= startIndex) {
        splitIndex = endIndex;
      }

      chunks.push(text.substring(startIndex, splitIndex).trim());
      startIndex = splitIndex - chunkOverlap;
      if (startIndex < 0) {
        startIndex = splitIndex;
      }
    }
    return Promise.resolve(chunks.filter((c) => c.length > 0));
  }
}
