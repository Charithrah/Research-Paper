import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paper } from '../entities/paper.entity';
import { PaperChunk } from '../entities/paper-chunk.entity';
import { Flashcard } from '../entities/flashcard.entity';
import { ChatHistory } from '../entities/chat-history.entity';
import { PapersService } from './papers.service';
import { PapersController } from './papers.controller';
import { PdfParserService } from './pdf-parser.service';
import { AnalysisService } from './analysis.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { ProcessingService } from './processing.service';
import { ExplanationService } from './explanation.service';
import { EquationService } from './equation.service';
import { FlashcardService } from './flashcard.service';
import { ChatService } from './chat.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paper, PaperChunk, Flashcard, ChatHistory]),
    AiModule,
  ],
  providers: [
    PapersService,
    PdfParserService,
    AnalysisService,
    ChunkingService,
    EmbeddingService,
    VectorStoreService,
    ProcessingService,
    ExplanationService,
    EquationService,
    FlashcardService,
    ChatService,
  ],
  controllers: [PapersController],
  exports: [
    PapersService,
    PdfParserService,
    AnalysisService,
    ChunkingService,
    EmbeddingService,
    VectorStoreService,
    ProcessingService,
    ExplanationService,
    EquationService,
    FlashcardService,
    ChatService,
  ],
})
export class PapersModule {}
