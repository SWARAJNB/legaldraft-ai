import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('draft_versions')
export class DraftVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'draft_id', type: 'uuid' })
  draftId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'saved_by', type: 'varchar', length: 255 })
  savedBy: string;

  @Column({ name: 'change_note', type: 'text', nullable: true })
  changeNote: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
