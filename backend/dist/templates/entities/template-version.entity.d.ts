import { Template } from './template.entity';
export declare class TemplateVersion {
    id: string;
    templateId: string;
    versionNumber: number;
    fileId: string;
    previewText: string;
    placeholders: any[];
    createdBy: string;
    createdAt: Date;
    template: Template;
}
