import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 50, nullable: true })
  tenantId: string; // null = system template

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'int', default: 0 })
  fields: number; // number of placeholders detected

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used', type: 'timestamptz', nullable: true })
  lastUsed: Date;

  @Column({ name: 'preview_text', type: 'text', nullable: true })
  previewText: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean; // system templates are read-only

  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared: boolean; // shared with the firm

  @Column({ name: 'file_id', type: 'uuid', nullable: true })
  fileId: string; // reference to uploaded DOCX

  @Column({ type: 'jsonb', nullable: true })
  placeholders: Record<string, string>[]; // detected placeholders from DOCX

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
