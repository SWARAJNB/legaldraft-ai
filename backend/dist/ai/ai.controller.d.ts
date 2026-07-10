import { MessageEvent } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import { AiConversation } from './entities/ai-conversation.entity';
import { ChatDto, GenerateDraftDto, RiskCheckDto, ImproveTextDto, GuidedDraftDto } from './dto/ai.dto';
import { AiManagerService } from './agents/ai-manager.service';
export declare class AiController {
    private readonly aiService;
    private readonly draftAssistant;
    private readonly conversationsRepo;
    private readonly aiManagerService;
    private readonly logger;
    constructor(aiService: AiService, draftAssistant: AiDraftAssistantService, conversationsRepo: Repository<AiConversation>, aiManagerService: AiManagerService);
    private handleAiError;
    chat(dto: ChatDto): Promise<{
        response: string;
        file?: any;
    }>;
    chatStream(dto: ChatDto): Observable<MessageEvent>;
    generateDraft(dto: GenerateDraftDto): Promise<{
        draft: string;
        file?: any;
    }>;
    riskCheck(dto: RiskCheckDto): Promise<{
        risks: any[];
        overallRisk: string;
    }>;
    improveText(dto: ImproveTextDto): Promise<{
        improved_text: string;
    }>;
    knowledgeAnswer(body: {
        question: string;
        workspace_id?: string;
        case_id?: string;
    }, tenantId: string): Promise<{
        response: string;
        citations: import("../rag/rag.service").RagCitation[];
    }>;
    getGuidedDraftTypes(): {
        id: string;
        name: string;
        questionCount: number;
        requiredCount: number;
    }[];
    guidedDraft(dto: GuidedDraftDto, user: {
        id: string;
    }, tenantId: string): Promise<{
        session_id: string;
        status: "in_progress" | "complete";
        current_question?: {
            key: string;
            label: string;
            placeholder: string;
            required: boolean;
            step: number;
            total: number;
        };
        draft?: string;
        progress: number;
    }>;
    getConversations(user: {
        id: string;
    }, tenantId: string): Promise<AiConversation[]>;
    getConversation(id: string, user: {
        id: string;
    }): Promise<AiConversation>;
    createConversation(body: {
        title?: string;
    }, user: {
        id: string;
    }, tenantId: string): Promise<AiConversation>;
    updateConversation(id: string, body: {
        title?: string;
    }, user: {
        id: string;
    }): Promise<AiConversation>;
    deleteConversation(id: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    conversationsChatStream(id: string, body: {
        content: string;
        context?: any;
        mode?: string;
        selectedAgent?: string;
    }, user: {
        id: string;
    }, tenantId: string): Promise<Observable<MessageEvent>>;
}
