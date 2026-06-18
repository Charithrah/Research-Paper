import { Injectable, BadRequestException } from '@nestjs/common';
import { PapersService } from './papers.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ExplanationService {
  constructor(
    private readonly papersService: PapersService,
    private readonly aiService: AiService,
  ) {}

  async explainSection(
    paperId: string,
    section: string,
    mode: 'beginner' | 'intermediate' | 'expert',
  ): Promise<string> {
    const paper = await this.papersService.findOne(paperId);

    const sectionKey = section.toLowerCase().trim();
    const validSections = [
      'abstract',
      'introduction',
      'methodology',
      'results',
      'conclusion',
    ];

    if (!validSections.includes(sectionKey)) {
      throw new BadRequestException(
        `Invalid section: ${section}. Must be one of: ${validSections.join(', ')}`,
      );
    }

    const sectionContent = (paper as any)[sectionKey];
    if (!sectionContent || sectionContent.trim().length === 0) {
      return `No content was extracted for the ${section} section of this paper.`;
    }

    let systemMessage = '';
    let userPrompt = '';

    if (mode === 'beginner') {
      systemMessage =
        'You are an educational tutor who explains complex scientific concepts to a 10-year-old child. Use simple words, analogies, and short sentences. Avoid academic jargon entirely.';
      userPrompt = `Explain this section of a research paper in very simple language for a beginner.

Section name: ${section}
Content:
${sectionContent}`;
    } else if (mode === 'intermediate') {
      systemMessage =
        'You are a science communicator who explains academic papers to high school students or college freshmen. Use clear language, define key terms, and explain the intuition behind the concepts.';
      userPrompt = `Explain this section of a research paper in simple, clear language with moderate detail.

Section name: ${section}
Content:
${sectionContent}`;
    } else {
      systemMessage =
        'You are an expert research reviewer. Provide a highly precise, technical breakdown of the academic text, highlighting methodological details, statistical significance, and architectural nuance.';
      userPrompt = `Provide a detailed technical explanation of this section of a research paper.

Section name: ${section}
Content:
${sectionContent}`;
    }

    return this.aiService.generateCompletion(userPrompt, systemMessage);
  }
}
