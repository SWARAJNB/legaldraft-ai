import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileEntity } from '../files/entities/file.entity';
import { FileIntelligenceEntity } from '../files/entities/file-intelligence.entity';
type RagScope = {
    tenantId: string;
    workspaceId?: string;
    caseId?: string;
};
export type RagCitation = {
    documentName: string;
    pageNumber: number;
    chunk: string;
    confidence: number;
    fileId: string;
    chunkIndex: number;
    source: 'vector' | 'postgres_fts' | 'hybrid';
};
export type KnowledgeBaseDocument = {
    fileId: string;
    documentName: string;
    workspaceId?: string;
    caseId?: string;
    embeddingStatus: 'indexed' | 'pending' | 'empty' | 'failed';
    chunkCount: number;
    lastIndexed?: string;
    aiSources: string[];
};
export declare class RagService implements OnModuleInit {
    private readonly filesRepo;
    private readonly intelligenceRepo;
    private readonly logger;
    private readonly vectorRoot;
    private readonly embeddingDimensions;
    constructor(filesRepo: Repository<FileEntity>, intelligenceRepo: Repository<FileIntelligenceEntity>);
    onModuleInit(): Promise<void>;
    chunkText(text: string, chunkSize?: number, overlap?: number): {
        text: string;
        index: number;
        pageNumber: number;
    }[];
    generateLocalEmbedding(text: string): number[];
    indexDocument(params: {
        fileId: string;
        tenantId: string;
        documentName: string;
        text: string;
        workspaceId?: string;
        caseId?: string;
    }): Promise<{
        status: KnowledgeBaseDocument['embeddingStatus'];
        chunkCount: number;
    }>;
    deleteDocumentVectors(fileId: string, scope?: Partial<RagScope>): Promise<void>;
    getKnowledgeBase(scope: RagScope): Promise<{
        documents: KnowledgeBaseDocument[];
        aiSources: string[];
        searchPreview: RagCitation[];
    }>;
    retrieve(params: RagScope & {
        question: string;
        topK?: number;
    }): Promise<RagCitation[]>;
    buildContext(citations: RagCitation[]): string;
    buildPrompt(params: RagScope & {
        question: string;
        topK?: number;
    }): Promise<{
        citations: RagCitation[];
        prompt: string;
    }>;
    private vectorSearch;
    private postgresFullTextSearch;
    private bestSnippet;
    private getDocumentChunks;
    private aiSources;
    private parseJsonArray;
    private cosineSimilarity;
    private chunkInScope;
    private collectionName;
    private collectionNames;
    private mergeCollection;
    private readCollection;
    private writeCollection;
    private collectionPath;
    private slug;
}
export {};
