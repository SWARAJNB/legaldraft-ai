import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
export declare class DraftAgentService implements AiAgent {
    id: "draft";
    name: string;
    description: string;
    examples: string[];
    canHandle(message: string): boolean;
    buildPrompt(request: AiManagerRequest, context: SharedAiContext): Promise<AgentPrompt>;
}
