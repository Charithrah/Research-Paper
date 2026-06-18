import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Paper } from './entities/paper.entity';
import { PaperChunk } from './entities/paper-chunk.entity';
import { Flashcard } from './entities/flashcard.entity';
import { ChatHistory } from './entities/chat-history.entity';
import { PapersModule } from './papers/papers.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'researchease'),
        entities: [User, Paper, PaperChunk, Flashcard, ChatHistory],
        synchronize: true, // Note: Set to false in production, but true here to auto-create tables
      }),
    }),
    TypeOrmModule.forFeature([User, Paper, PaperChunk, Flashcard, ChatHistory]),
    PapersModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('Ensuring pgvector extension exists in the database...');
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('pgvector extension ensured.');

      console.log(
        'Ensuring HNSW vector index on paper_chunks(embedding) exists...',
      );
      await this.dataSource.query(
        `CREATE INDEX IF NOT EXISTS paper_chunks_embedding_hnsw_idx ON paper_chunks USING hnsw (embedding vector_cosine_ops);`,
      );
      console.log('HNSW vector index ensured.');
    } catch (err) {
      console.error('Failed to initialize database extensions/indexes:', err);
    }
  }
}
