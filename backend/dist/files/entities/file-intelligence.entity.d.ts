import { FileEntity } from './file.entity';
export declare class FileIntelligenceEntity {
    id: string;
    fileId: string;
    workspaceId: string;
    clientId: string;
    caseId: string;
    conversationId: string;
    classification: string;
    documentTitle: string;
    parties: string;
    importantDates: string;
    clauseHeadings: string;
    shortSummary: string;
    detailedSummary: string;
    keywords: string;
    tags: string;
    extractedText: string;
    createdAt: Date;
    updatedAt: Date;
    file: FileEntity;
}
