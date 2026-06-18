import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Paper } from './paper.entity';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Paper, (paper) => paper.flashcards, { onDelete: 'CASCADE' })
  paper!: Paper;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
