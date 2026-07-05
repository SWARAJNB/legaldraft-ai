import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drafts')
export class Draft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ name: 'case_number', type: 'varchar', length: 100, nullable: true })
  caseNumber: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255, nullable: true })
  clientName: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft | in-progress | review | finalized | archived

  @Column({ type: 'varchar', length: 50, default: 'criminal' })
  category: string; // criminal | civil | property | family

  @Column({ name: 'assigned_to', type: 'varchar', length: 255, nullable: true })
  assignedTo: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'word_count', type: 'int', default: 0 })
  wordCount: number;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
