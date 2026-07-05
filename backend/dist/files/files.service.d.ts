import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
export declare class FilesService implements OnModuleInit {
    private filesRepo;
    private versionsRepo;
    private storage;
    constructor(filesRepo: Repository<FileEntity>, versionsRepo: Repository<FileVersion>);
    onModuleInit(): void;
    private validateFile;
    upload(tenantId: string, category: string, filename: string, content: Buffer, contentType: string, uploadedBy: string): Promise<FileEntity | null>;
    findByTenant(tenantId: string): Promise<FileEntity[]>;
    findById(id: string): Promise<FileEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getDownloadUrl(id: string): Promise<{
        download_url: string;
    }>;
    getPresignedUploadUrl(tenantId: string, category: string, filename: string, expiresIn?: number): Promise<{
        url: string;
        fields: Record<string, any>;
    }>;
    downloadContent(id: string): Promise<{
        buffer: Buffer;
        file: FileEntity;
    }>;
}
