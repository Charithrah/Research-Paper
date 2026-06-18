import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaperChunk } from '../entities/paper-chunk.entity';
import { Paper } from '../entities/paper.entity';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    @InjectRepository(PaperChunk)
    private chunkRepository: Repository<PaperChunk>,
    private dataSource: DataSource,
  ) {}

  async saveChunks(
    paper: Paper,
    contents: string[],
    embeddings: number[][],
  ): Promise<void> {
    this.logger.log(
      `Saving ${contents.length} chunks with embeddings for paper ${paper.id}...`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(PaperChunk, { paper: { id: paper.id } });

      for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        const embedding = embeddings[i];
        const vectorStr = `[${embedding.join(',')}]`;

        await queryRunner.manager.query(
          `INSERT INTO paper_chunks (id, content, "chunkIndex", embedding, "paperId") 
           VALUES (gen_random_uuid(), $1, $2, $3::vector, $4)`,
          [content, i, vectorStr, paper.id],
        );
      }
      await queryRunner.commitTransaction();
      this.logger.log(`Successfully saved all chunks for paper ${paper.id}.`);
    } catch (err) {
      this.logger.error(`Failed to save chunks for paper ${paper.id}:`, err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async similaritySearch(
    paperId: string,
    queryEmbedding: number[],
    limit = 5,
  ): Promise<any[]> {
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const rawResults = await this.dataSource.query(
      `SELECT id, content, "chunkIndex", (embedding <=> $1::vector) as distance
       FROM paper_chunks
       WHERE "paperId" = $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [vectorStr, paperId, limit],
    );

    return rawResults.map((row: any) => ({
      id: row.id,
      content: row.content,
      chunkIndex: row.chunkIndex,
      distance: parseFloat(row.distance),
    }));
  }
}
