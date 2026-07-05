export declare class Template {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    category: string;
    fields: number;
    usageCount: number;
    lastUsed: Date;
    previewText: string;
    tags: string[];
    isFeatured: boolean;
    isSystem: boolean;
    isShared: boolean;
    fileId: string;
    placeholders: Record<string, string>[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
