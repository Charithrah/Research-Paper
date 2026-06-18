import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paper } from './paper.entity';

@Entity('paper_chunks')
export class PaperChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Paper, (paper) => paper.chunks, { onDelete: 'CASCADE' })
  paper!: Paper;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  chunkIndex!: number;

  @Column({
    type: 'vector',
    length: 384, // 384 dimensions for all-MiniLM-L6-v2 embeddings
    nullable: true,
  })
  embedding!: string | number[];
}
