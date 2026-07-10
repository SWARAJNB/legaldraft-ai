import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    findAll(tenantId: string): Promise<import("./entities/file.entity").FileEntity[]>;
    upload(file: Express.Multer.File, tenantId: string, user: {
        id: string;
    }, category: string, workspaceId?: string, clientId?: string, caseId?: string, conversationId?: string): Promise<import("./entities/file.entity").FileEntity | null>;
    findById(id: string): Promise<import("./entities/file.entity").FileEntity>;
    getIntelligence(id: string): Promise<import("./entities/file-intelligence.entity").FileIntelligenceEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getDownloadUrl(id: string): Promise<{
        download_url: string;
    }>;
    download(id: string, res: Response): Promise<StreamableFile>;
    getPresignedUpload(tenantId: string, body: {
        filename: string;
        category: string;
        expires_in?: number;
    }): Promise<{
        url: string;
        fields: Record<string, any>;
    }>;
}
