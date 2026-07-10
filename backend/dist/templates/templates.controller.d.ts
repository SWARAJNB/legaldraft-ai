import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(tenantId: string, search?: string, category?: string): Promise<import("./entities/template.entity").Template[]>;
    upload(file: Express.Multer.File, tenantId: string, user: {
        id: string;
    }, name: string, description?: string): Promise<import("./entities/template.entity").Template>;
    findById(id: string): Promise<import("./entities/template.entity").Template>;
    savePlaceholders(id: string, body: {
        placeholders: any[];
    }, user: {
        id: string;
    }): Promise<import("./entities/template.entity").Template>;
    getVersions(id: string): Promise<import("./entities/template-version.entity").TemplateVersion[]>;
    restoreVersion(id: string, versionNumber: string, user: {
        id: string;
    }): Promise<import("./entities/template.entity").Template>;
    generateDraft(id: string, tenantId: string, user: {
        id: string;
    }, values: Record<string, any>): Promise<import("../files/entities/file.entity").FileEntity | null>;
    askInterviewQuestion(id: string, body: {
        answers: Record<string, string>;
        currentPlaceholder?: string;
    }): Promise<{
        isFinished: boolean;
        nextPlaceholder: null;
        question: string;
    } | {
        isFinished: boolean;
        nextPlaceholder: Record<string, string>;
        question: string;
    }>;
}
