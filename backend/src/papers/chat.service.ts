import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from '../entities/chat-history.entity';
import { PapersService } from './papers.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatRepository: Repository<ChatHistory>,
    private readonly papersService: PapersService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly aiService: AiService,
  ) {}

  async getChatHistory(paperId: string): Promise<ChatHistory[]> {
    return this.chatRepository.find({
      where: { paper: { id: paperId } },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(paperId: string, message: string): Promise<ChatHistory> {
    const paper = await this.papersService.findOne(paperId);

    const userChat = this.chatRepository.create({
      paper: paper,
      role: 'user',
      message: message,
    });
    await this.chatRepository.save(userChat);

    this.logger.log(
      `Generating embedding for user query on paper ${paperId}...`,
    );
    const queryEmbedding = await this.embeddingService.getEmbedding(message);

    this.logger.log('Performing semantic similarity search...');
    const relevantChunks = await this.vectorStoreService.similaritySearch(
      paperId,
      queryEmbedding,
      3,
    );

    const context = relevantChunks
      .map((c) => `[Source Chunk #${c.chunkIndex + 1}]:\n${c.content}`)
      .join('\n\n');

    this.logger.log(
      `Retrieved ${relevantChunks.length} context chunks. Calling Groq...`,
    );

    const systemMessage = `You are a research paper assistant helper. Your job is to answer the user's question using ONLY the provided paper snippets. 

Rules:
- Be strictly grounded: do not make up facts or extrapolate beyond what is stated.
- If the answer cannot be found in the provided text snippets, respond with: "I cannot find the answer in the uploaded paper."
- Add citations indicating which chunk was used (e.g. [Source Chunk #N]) whenever you state a fact from it.
- Keep explanations clear and concise.`;

    const prompt = `User Question: ${message}

Research Paper Snippets (Context):
${context || 'No matching contexts found.'}`;

    let answerText = '';
    try {
      answerText = await this.aiService.generateCompletion(
        prompt,
        systemMessage,
      );
    } catch (err) {
      this.logger.error('Failed to get answer from Groq, falling back:', err);
      answerText = this.aiService['getMockResponse'](message);
    }

    const assistantChat = this.chatRepository.create({
      paper: paper,
      role: 'assistant',
      message: answerText,
      citations: relevantChunks.map((c) => ({
        chunkIndex: c.chunkIndex,
        distance: c.distance,
      })),
    });

    return this.chatRepository.save(assistantChat);
  }
}
