import { RagService } from './rag.service';
export declare class RagController {
    private readonly ragService;
    constructor(ragService: RagService);
    getKnowledgeBase(tenantId: string, workspaceId?: string, caseId?: string): Promise<{
        documents: import("./rag.service").KnowledgeBaseDocument[];
        aiSources: string[];
        searchPreview: import("./rag.service").RagCitation[];
    }>;
    search(tenantId: string, body: {
        question: string;
        workspace_id?: string;
        case_id?: string;
        top_k?: number;
    }): Promise<import("./rag.service").RagCitation[]>;
}
