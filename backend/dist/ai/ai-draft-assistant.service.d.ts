import { Repository } from 'typeorm';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiService } from './ai.service';
export declare class AiDraftAssistantService {
    private conversationsRepo;
    private aiService;
    constructor(conversationsRepo: Repository<AiConversation>, aiService: AiService);
    getAvailableDraftTypes(): {
        id: string;
        name: string;
        questionCount: number;
        requiredCount: number;
    }[];
    processGuidedDraft(userId: string, tenantId: string, params: {
        session_id?: string;
        draft_type?: string;
        answer?: string;
    }): Promise<{
        session_id: string;
        status: 'in_progress' | 'complete';
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
}
