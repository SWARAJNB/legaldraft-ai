import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { FileIntelligenceEntity } from './entities/file-intelligence.entity';
import { PdfParseService, DocxParseService, OcrService } from './document-processing/document-processing.services';
import { RagService } from '../rag/rag.service';
export declare class FilesService implements OnModuleInit {
    private filesRepo;
    private versionsRepo;
    private intelligenceRepo;
    private pdfParse;
    private docxParse;
    private ocrService;
    private ragService;
    private storage;
    constructor(filesRepo: Repository<FileEntity>, versionsRepo: Repository<FileVersion>, intelligenceRepo: Repository<FileIntelligenceEntity>, pdfParse: PdfParseService, docxParse: DocxParseService, ocrService: OcrService, ragService: RagService);
    onModuleInit(): void;
    private validateFile;
    extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string>;
    runFileIntelligence(fileId: string, content: Buffer, contentType: string, filename: string, workspaceId?: string, clientId?: string, caseId?: string, conversationId?: string): Promise<FileIntelligenceEntity>;
    getIntelligence(fileId: string): Promise<FileIntelligenceEntity>;
    upload(tenantId: string, category: string, filename: string, content: Buffer, contentType: string, uploadedBy: string, workspaceId?: string, clientId?: string, caseId?: string, conversationId?: string): Promise<FileEntity | null>;
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
