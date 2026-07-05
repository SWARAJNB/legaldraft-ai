declare class ChatMessageDto {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class ChatDto {
    messages: ChatMessageDto[];
}
export declare class GenerateDraftDto {
    draft_type: string;
    client_info?: string;
    case_details?: string;
    court?: string;
    relief?: string;
}
export declare class RiskCheckDto {
    content: string;
}
export declare class ImproveTextDto {
    text: string;
    action: string;
    context?: string;
}
export declare class GuidedDraftDto {
    session_id?: string;
    draft_type?: string;
    answer?: string;
}
export {};
