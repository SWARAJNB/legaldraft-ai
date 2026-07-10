import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
export declare class TimelineAgentService implements AiAgent {
    id: "timeline";
    name: string;
    description: string;
    examples: string[];
    canHandle(message: string): boolean;
    buildPrompt(request: AiManagerRequest, context: SharedAiContext): Promise<AgentPrompt>;
}
