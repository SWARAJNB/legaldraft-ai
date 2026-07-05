import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import { ChatDto, GenerateDraftDto, RiskCheckDto, ImproveTextDto, GuidedDraftDto } from './dto/ai.dto';
export declare class AiController {
    private readonly aiService;
    private readonly draftAssistant;
    private readonly logger;
    constructor(aiService: AiService, draftAssistant: AiDraftAssistantService);
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
}
