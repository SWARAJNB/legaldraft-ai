export declare class AiConversation {
    id: string;
    title: string;
    userId: string;
    tenantId: string;
    sessionType: string;
    draftType: string;
    currentStep: number;
    collectedAnswers: Record<string, any>;
    messages: {
        role: string;
        content: string;
        timestamp: string;
    }[];
    isComplete: boolean;
    createdAt: Date;
    updatedAt: Date;
}
