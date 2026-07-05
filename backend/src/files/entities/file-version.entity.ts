import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('file_versions')
export class FileVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_id', type: 'uuid' })
  fileId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 's3_key', type: 'varchar', length: 500 })
  s3Key: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'uploaded_by', type: 'varchar', length: 100 })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => FileEntity, (file) => file.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;
}
