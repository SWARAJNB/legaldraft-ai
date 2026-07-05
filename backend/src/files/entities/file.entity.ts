import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { FileVersion } from './file-version.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100 })
  fileType: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 's3_key', type: 'varchar', length: 500 })
  s3Key: string;

  @Column({ name: 'bucket_name', type: 'varchar', length: 100 })
  bucketName: string;

  @Column({ name: 'uploaded_by', type: 'varchar', length: 100 })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => FileVersion, (version) => version.file, {
    cascade: true,
    eager: true,
  })
  versions: FileVersion[];
}
