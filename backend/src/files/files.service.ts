import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { StorageProvider } from './storage/storage.interface';
import { LocalStorageProvider } from './storage/local.provider';
import { S3StorageProvider } from './storage/s3.provider';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_CATEGORIES: Record<string, string[]> = {
  templates: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  drafts: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  exports: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ],
  'profile-images': ['image/jpeg', 'image/png', 'image/gif'],
  attachments: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
};

@Injectable()
export class FilesService implements OnModuleInit {
  private storage: StorageProvider;

  constructor(
    @InjectRepository(FileEntity)
    private filesRepo: Repository<FileEntity>,
    @InjectRepository(FileVersion)
    private versionsRepo: Repository<FileVersion>,
  ) {}

  onModuleInit() {
    const mode = (process.env.STORAGE_MODE || 'local').toLowerCase();
    this.storage =
      mode === 's3' ? new S3StorageProvider() : new LocalStorageProvider();
    console.log(`  📦  Storage provider: ${mode.toUpperCase()}`);
  }

  private validateFile(
    originalName: string,
    contentType: string,
    fileSize: number,
    category: string,
  ) {
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed limit of 15MB. Provided: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
      );
    }

    if (!ALLOWED_CATEGORIES[category]) {
      throw new BadRequestException(
        `Invalid file category '${category}'. Must be one of: ${Object.keys(ALLOWED_CATEGORIES).join(', ')}`,
      );
    }

    if (!ALLOWED_CATEGORIES[category].includes(contentType)) {
      throw new BadRequestException(
        `File format '${contentType}' is not permitted for category '${category}'.`,
      );
    }
  }

  async upload(
    tenantId: string,
    category: string,
    filename: string,
    content: Buffer,
    contentType: string,
    uploadedBy: string,
  ) {
    const fileSize = content.length;
    this.validateFile(filename, contentType, fileSize, category);

    const s3Key = await this.storage.uploadFile(
      tenantId,
      category,
      filename,
      content,
    );

    // Check for existing file
    const existing = await this.filesRepo.findOne({
      where: {
        tenantId,
        fileName: filename,
        fileType: contentType,
      },
      relations: ['versions'],
    });

    if (existing) {
      // Update existing → new version
      const lastVersion = await this.versionsRepo.findOne({
        where: { fileId: existing.id },
        order: { versionNumber: 'DESC' },
      });

      const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 2;

      existing.fileSize = fileSize;
      existing.s3Key = s3Key;
      existing.uploadedBy = uploadedBy;
      await this.filesRepo.save(existing);

      const version = this.versionsRepo.create({
        fileId: existing.id,
        versionNumber: nextVersion,
        s3Key,
        fileSize,
        uploadedBy,
      });
      await this.versionsRepo.save(version);

      return this.filesRepo.findOne({
        where: { id: existing.id },
        relations: ['versions'],
      });
    }

    // New file
    const newFile = this.filesRepo.create({
      tenantId,
      fileName: filename,
      originalName: filename,
      fileType: contentType,
      fileSize,
      s3Key,
      bucketName:
        (this.storage as any).bucketName || 'local-disk',
      uploadedBy,
    });
    await this.filesRepo.save(newFile);

    const v1 = this.versionsRepo.create({
      fileId: newFile.id,
      versionNumber: 1,
      s3Key,
      fileSize,
      uploadedBy,
    });
    await this.versionsRepo.save(v1);

    return this.filesRepo.findOne({
      where: { id: newFile.id },
      relations: ['versions'],
    });
  }

  async findByTenant(tenantId: string) {
    return this.filesRepo.find({
      where: { tenantId },
      relations: ['versions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const file = await this.filesRepo.findOne({
      where: { id },
      relations: ['versions'],
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async delete(id: string) {
    const file = await this.findById(id);
    await this.storage.deleteFile(file.s3Key);
    await this.filesRepo.remove(file);
    return { message: `File ${file.originalName} has been deleted.` };
  }

  async getDownloadUrl(id: string) {
    const file = await this.findById(id);
    const url = await this.storage.getPresignedDownloadUrl(file.s3Key);
    return { download_url: url };
  }

  async getPresignedUploadUrl(
    tenantId: string,
    category: string,
    filename: string,
    expiresIn = 3600,
  ) {
    if (!ALLOWED_CATEGORIES[category]) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }
    return this.storage.getPresignedUploadUrl(
      tenantId,
      category,
      filename,
      expiresIn,
    );
  }

  async downloadContent(id: string): Promise<{ buffer: Buffer; file: FileEntity }> {
    const file = await this.findById(id);
    const buffer = await this.storage.downloadFile(file.s3Key);
    return { buffer, file };
  }
}
