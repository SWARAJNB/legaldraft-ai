import { OnModuleInit } from '@nestjs/common';
export declare class RagService implements OnModuleInit {
    private readonly logger;
    private isAvailable;
    onModuleInit(): Promise<void>;
    chunkText(text: string, chunkSize?: number, overlap?: number): {
        text: string;
        index: number;
    }[];
    storeEmbeddings(documentId: string, chunks: {
        text: string;
        index: number;
    }[], embeddings: number[][]): Promise<void>;
    searchSimilar(queryEmbedding: number[], topK?: number): Promise<{
        text: string;
        score: number;
        documentId: string;
    }[]>;
}
