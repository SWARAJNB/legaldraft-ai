import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { FilesService } from '../files/files.service';
export declare class TemplatesService {
    private templatesRepo;
    private versionsRepo;
    private filesService;
    constructor(templatesRepo: Repository<Template>, versionsRepo: Repository<TemplateVersion>, filesService: FilesService);
    findAll(tenantId?: string, search?: string, category?: string): Promise<Template[]>;
    findById(id: string): Promise<Template>;
    create(tenantId: string, userId: string, dto: Partial<Template>): Promise<Template>;
    uploadTemplate(tenantId: string, userId: string, file: Express.Multer.File, name: string, description?: string): Promise<Template>;
    savePlaceholders(templateId: string, placeholders: any[], userId: string): Promise<Template>;
    createVersion(templateId: string, fileId: string, previewText: string, placeholders: any[], userId: string): Promise<TemplateVersion>;
    getVersions(templateId: string): Promise<TemplateVersion[]>;
    restoreVersion(templateId: string, versionNumber: number, userId: string): Promise<Template>;
    generateDraft(templateId: string, tenantId: string, userId: string, values: Record<string, any>): Promise<import("../files/entities/file.entity").FileEntity | null>;
    askInterviewQuestion(templateId: string, answers: Record<string, string>, currentPlaceholder?: string): Promise<{
        isFinished: boolean;
        nextPlaceholder: null;
        question: string;
    } | {
        isFinished: boolean;
        nextPlaceholder: Record<string, string>;
        question: string;
    }>;
    incrementUsage(id: string): Promise<void>;
    seedSystemTemplates(): Promise<void>;
}
