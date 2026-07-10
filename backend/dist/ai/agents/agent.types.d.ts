import { ChatMessage } from '../interfaces/ai-provider.interface';
import { RagCitation } from '../../rag/rag.service';
export type AgentId = 'draft' | 'research' | 'review' | 'file' | 'timeline';
export type AgentMode = 'automatic' | 'manual';
export type AiManagerRequest = {
    tenantId: string;
    userId: string;
    conversationId?: string;
    message: string;
    messages?: {
        role: string;
        content: string;
    }[];
    frontendContext?: Record<string, any>;
    mode?: AgentMode;
    selectedAgent?: AgentId;
};
export type SharedAiContext = {
    tenantId: string;
    userId: string;
    workspace?: Record<string, any>;
    client?: Record<string, any>;
    case?: Record<string, any>;
    timeline: any[];
    tasks: any[];
    notes: any[];
    documents: any[];
    drafts: any[];
    templates: any[];
    conversation: any[];
    knowledgeBase?: {
        documents: any[];
        aiSources: string[];
    };
};
export type AgentExecutionResult = {
    response: string;
    citations?: RagCitation[];
    metadata?: Record<string, any>;
};
export type AgentPrompt = {
    system: string;
    user: string;
    citations?: RagCitation[];
    metadata?: Record<string, any>;
};
export interface AiAgent {
    id: AgentId;
    name: string;
    description: string;
    examples: string[];
    canHandle(message: string): boolean;
    buildPrompt(request: AiManagerRequest, context: SharedAiContext): Promise<AgentPrompt>;
}
export type RegisteredTool = {
    id: string;
    description: string;
    execute: (input: any, context: SharedAiContext) => Promise<any>;
};
export declare function toChatMessages(prompt: AgentPrompt): ChatMessage[];
