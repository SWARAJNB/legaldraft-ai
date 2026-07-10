import { OnModuleInit } from '@nestjs/common';
import { RagService, RagCitation } from '../rag/rag.service';
export declare class AiService implements OnModuleInit {
    private readonly ragService;
    private readonly logger;
    private provider;
    constructor(ragService: RagService);
    onModuleInit(): void;
    chat(userMessages: {
        role: string;
        content: string;
    }[]): Promise<{
        response: string;
        file?: any;
    }>;
    answerWithKnowledge(params: {
        question: string;
        tenantId: string;
        workspaceId?: string;
        caseId?: string;
    }): Promise<{
        response: string;
        citations: RagCitation[];
    }>;
    chatStream(userMessages: {
        role: string;
        content: string;
    }[]): AsyncIterable<string>;
    generateDraft(params: {
        draft_type: string;
        client_info?: string;
        case_details?: string;
        court?: string;
        relief?: string;
    }): Promise<{
        draft: string;
        file?: any;
    }>;
    riskCheck(content: string): Promise<{
        risks: any[];
        overallRisk: string;
    }>;
    improveText(params: {
        text: string;
        action: string;
        context?: string;
    }): Promise<{
        improved_text: string;
    }>;
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
}
