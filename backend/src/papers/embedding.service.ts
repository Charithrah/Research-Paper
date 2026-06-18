import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor: any = null;

  async onModuleInit() {
    this.logger.log(
      'Initializing local vector embedding model (all-MiniLM-L6-v2)...',
    );
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
      );
      this.logger.log('Embedding model successfully loaded.');
    } catch (err) {
      this.logger.error('Failed to initialize local embedding model:', err);
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!this.extractor) {
      this.logger.warn(
        'Embedding model not ready. Generating random dummy embedding for development.',
      );
      return Array.from({ length: 384 }, () => Math.random() - 0.5);
    }
    try {
      const output = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });
      return Array.from(output.data);
    } catch (err) {
      this.logger.error(
        `Error generating embedding for text: ${text.substring(0, 30)}...`,
        err,
      );
      return Array.from({ length: 384 }, () => Math.random() - 0.5);
    }
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      embeddings.push(await this.getEmbedding(text));
    }
    return embeddings;
  }
}
