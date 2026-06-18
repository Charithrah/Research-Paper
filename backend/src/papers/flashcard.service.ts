import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from '../entities/flashcard.entity';
import { PapersService } from './papers.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class FlashcardService {
  private readonly logger = new Logger(FlashcardService.name);

  constructor(
    @InjectRepository(Flashcard)
    private readonly flashcardRepository: Repository<Flashcard>,
    private readonly papersService: PapersService,
    private readonly aiService: AiService,
  ) {}

  async getOrGenerateFlashcards(paperId: string): Promise<Flashcard[]> {
    const existingCards = await this.flashcardRepository.find({
      where: { paper: { id: paperId } },
      order: { createdAt: 'ASC' },
    });

    if (existingCards.length > 0) {
      return existingCards;
    }

    const paper = await this.papersService.findOne(paperId);
    this.logger.log(`Generating flashcards for paper ${paperId}...`);

    const prompt = `Based on the following research paper abstract/summary, generate 4 review flashcards. Each flashcard must consist of a conceptual question and a clear, concise answer.

Paper Title: ${paper.title}
Abstract: ${paper.abstract || 'Not available'}
Summary: ${paper.summary || 'Not available'}

Respond ONLY with a valid JSON array of objects. Do not include any markdown wrappers (like \`\`\`json) or other conversational text outside of the JSON. It must match this JSON structure:
[
  {
    "question": "What is ...?",
    "answer": "..."
  }
]`;

    try {
      const response = await this.aiService.generateCompletion(
        prompt,
        'You are an education expert who creates study guides and flashcards from technical text. Respond only in valid JSON arrays.',
      );

      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const cardData = JSON.parse(cleanResponse);

      const savedCards: Flashcard[] = [];
      for (const card of cardData) {
        const flashcard = this.flashcardRepository.create({
          paper: paper,
          question: card.question,
          answer: card.answer,
        });
        savedCards.push(await this.flashcardRepository.save(flashcard));
      }

      return savedCards;
    } catch (err) {
      this.logger.error(
        `Failed to generate flashcards for paper ${paperId}:`,
        err,
      );

      const mockResponse = this.aiService['getMockResponse']('flashcard');
      const cardData = JSON.parse(mockResponse);
      const savedCards: Flashcard[] = [];
      for (const card of cardData) {
        const flashcard = this.flashcardRepository.create({
          paper: paper,
          question: card.question,
          answer: card.answer,
        });
        savedCards.push(await this.flashcardRepository.save(flashcard));
      }
      return savedCards;
    }
  }
}
