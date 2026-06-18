import { Injectable, Logger } from '@nestjs/common';
import { PapersService } from './papers.service';
import { PdfParserService } from './pdf-parser.service';
import { AnalysisService } from './analysis.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    private readonly papersService: PapersService,
    private readonly pdfParserService: PdfParserService,
    private readonly analysisService: AnalysisService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async processPaper(paperId: string): Promise<void> {
    this.logger.log(
      `Starting full processing pipeline for paper ${paperId}...`,
    );
    const paper = await this.papersService.findOne(paperId);

    try {
      // 1. Extract sections
      this.logger.log('Step 1: Extracting text sections from PDF...');
      const { text, sections } = await this.pdfParserService.parsePdf(
        paper.fileKey,
      );

      paper.title = sections.title;
      paper.abstract = sections.abstract;
      paper.introduction = sections.introduction;
      paper.methodology = sections.methodology;
      paper.results = sections.results;
      paper.conclusion = sections.conclusion;
      await this.papersService.save(paper);

      // 2. Perform AI Analysis
      this.logger.log(
        'Step 2: Analyzing paper sections (Summary, Contributions, etc.)...',
      );
      await this.analysisService.analyzePaper(paperId);

      // 3. Chunk text
      this.logger.log('Step 3: Chunking full paper text...');
      const chunks = await this.chunkingService.splitText(text);

      // 4. Generate embeddings
      this.logger.log(
        `Step 4: Generating embeddings for ${chunks.length} chunks...`,
      );
      const embeddings = await this.embeddingService.getEmbeddings(chunks);

      // 5. Store embeddings
      this.logger.log('Step 5: Storing chunks and embeddings in pgvector...');
      await this.vectorStoreService.saveChunks(paper, chunks, embeddings);

      this.logger.log(
        `Processing pipeline completed successfully for paper ${paperId}.`,
      );
    } catch (err) {
      this.logger.error(
        `Processing pipeline failed for paper ${paperId}:`,
        err,
      );
      throw err;
    }
  }
}
