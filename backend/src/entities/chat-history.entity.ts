import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Paper } from './paper.entity';

@Entity('chat_history')
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Paper, (paper) => paper.chatHistory, { onDelete: 'CASCADE' })
  paper!: Paper;

  @Column()
  role!: 'user' | 'assistant';

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  citations!: { chunkIndex: number; distance: number }[] | null; // Stores citation metadata (e.g. chunk indices, quotes)

  @CreateDateColumn()
  createdAt!: Date;
}
