import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('file_intelligence')
export class FileIntelligenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_id', type: 'uuid' })
  fileId: string;

  @Column({ name: 'workspace_id', type: 'varchar', length: 100, nullable: true })
  workspaceId: string;

  @Column({ name: 'client_id', type: 'varchar', length: 100, nullable: true })
  clientId: string;

  @Column({ name: 'case_id', type: 'varchar', length: 100, nullable: true })
  caseId: string;

  @Column({ name: 'conversation_id', type: 'varchar', length: 100, nullable: true })
  conversationId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  classification: string;

  @Column({ name: 'document_title', type: 'varchar', length: 255, nullable: true })
  documentTitle: string;

  @Column({ type: 'text', nullable: true })
  parties: string;

  @Column({ name: 'important_dates', type: 'text', nullable: true })
  importantDates: string;

  @Column({ name: 'clause_headings', type: 'text', nullable: true })
  clauseHeadings: string;

  @Column({ name: 'short_summary', type: 'text', nullable: true })
  shortSummary: string;

  @Column({ name: 'detailed_summary', type: 'text', nullable: true })
  detailedSummary: string;

  @Column({ type: 'text', nullable: true })
  keywords: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;
}
