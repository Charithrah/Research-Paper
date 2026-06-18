import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { PaperChunk } from './paper-chunk.entity';
import { Flashcard } from './flashcard.entity';
import { ChatHistory } from './chat-history.entity';

@Entity('papers')
export class Paper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  abstract!: string | null;

  @Column({ type: 'text', nullable: true })
  introduction!: string | null;

  @Column({ type: 'text', nullable: true })
  methodology!: string | null;

  @Column({ type: 'text', nullable: true })
  results!: string | null;

  @Column({ type: 'text', nullable: true })
  conclusion!: string | null;

  @Column()
  pdfUrl!: string;

  @Column()
  fileKey!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'text', nullable: true })
  keyContributions!: string | null;

  @Column({ type: 'text', nullable: true })
  findings!: string | null;

  @Column({ type: 'text', nullable: true })
  limitations!: string | null;

  @Column({ type: 'text', nullable: true })
  futureWork!: string | null;

  @ManyToOne(() => User, (user) => user.papers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user!: User | null;

  @OneToMany(() => PaperChunk, (chunk) => chunk.paper)
  chunks!: PaperChunk[];

  @OneToMany(() => Flashcard, (flashcard) => flashcard.paper)
  flashcards!: Flashcard[];

  @OneToMany(() => ChatHistory, (chat) => chat.paper)
  chatHistory!: ChatHistory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
