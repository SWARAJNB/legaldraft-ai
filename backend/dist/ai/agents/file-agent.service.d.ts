import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
export declare class FileAgentService implements AiAgent {
    id: "file";
    name: string;
    description: string;
    examples: string[];
    canHandle(message: string): boolean;
    buildPrompt(request: AiManagerRequest, context: SharedAiContext): Promise<AgentPrompt>;
}
