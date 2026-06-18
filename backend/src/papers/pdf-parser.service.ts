import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';

export interface ExtractedSections {
  title: string;
  abstract: string;
  introduction: string;
  methodology: string;
  results: string;
  conclusion: string;
}

@Injectable()
export class PdfParserService {
  async parsePdf(
    filePath: string,
  ): Promise<{ text: string; sections: ExtractedSections }> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    const dataBuffer = fs.readFileSync(filePath);
    const parse = (pdfParse as any).default || pdfParse;
    const pdfData = await parse(dataBuffer);
    const text = pdfData.text;

    const sections = this.extractSections(text);
    return { text, sections };
  }

  private extractSections(text: string): ExtractedSections {
    const cleanText = text.replace(/\r\n/g, '\n');

    const abstractIndex = this.findSectionIndex(cleanText, ['abstract']);
    const introIndex = this.findSectionIndex(cleanText, [
      'introduction',
      '1. introduction',
      '1 introduction',
    ]);
    const methodIndex = this.findSectionIndex(cleanText, [
      'methodology',
      'methods',
      'method',
      'system model',
      'materials and methods',
      'proposed method',
    ]);
    const resultsIndex = this.findSectionIndex(cleanText, [
      'results',
      'evaluation',
      'experimental results',
      'experiments',
      'discussion',
    ]);
    const conclusionIndex = this.findSectionIndex(cleanText, [
      'conclusion',
      'conclusions',
      'summary and conclusion',
      'future work',
    ]);
    const referencesIndex = this.findSectionIndex(cleanText, [
      'references',
      'bibliography',
      'acknowledgements',
    ]);

    let title = 'Untitled Paper';
    if (abstractIndex !== -1 && abstractIndex < 1500) {
      const titleCandidate = cleanText.substring(0, abstractIndex).trim();
      const lines = titleCandidate
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length > 0) {
        title = lines.slice(0, Math.min(3, lines.length)).join(' ');
      }
    }

    const extractText = (start: number, end: number) => {
      if (start === -1) return '';
      if (end === -1 || end <= start) {
        return cleanText.substring(start).trim();
      }
      return cleanText.substring(start, end).trim();
    };

    const abstract = extractText(
      abstractIndex !== -1 ? abstractIndex + 8 : -1,
      introIndex,
    );

    const introduction = extractText(
      introIndex !== -1 ? introIndex + 12 : -1,
      methodIndex,
    );

    const methodology = extractText(
      methodIndex !== -1 ? methodIndex + 10 : -1,
      resultsIndex,
    );

    const results = extractText(
      resultsIndex !== -1 ? resultsIndex + 7 : -1,
      conclusionIndex,
    );

    const conclusion = extractText(
      conclusionIndex !== -1 ? conclusionIndex + 10 : -1,
      referencesIndex,
    );

    return {
      title: title.length > 250 ? title.substring(0, 247) + '...' : title,
      abstract: abstract || 'Abstract section not explicitly found.',
      introduction:
        introduction || 'Introduction section not explicitly found.',
      methodology: methodology || 'Methodology section not explicitly found.',
      results: results || 'Results section not explicitly found.',
      conclusion: conclusion || 'Conclusion section not explicitly found.',
    };
  }

  private findSectionIndex(text: string, keywords: string[]): number {
    for (const keyword of keywords) {
      const regex = new RegExp(
        `(?:^|\\n)\\s*${this.escapeRegExp(keyword)}\\s*(?:\\n|\\s|$)`,
        'i',
      );
      const match = regex.exec(text);
      if (match) {
        return match.index;
      }
    }
    return -1;
  }

  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
