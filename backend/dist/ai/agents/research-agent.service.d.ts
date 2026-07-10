import { RagService } from '../../rag/rag.service';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
export declare class ResearchAgentService implements AiAgent {
    private readonly ragService;
    id: "research";
    name: string;
    description: string;
    examples: string[];
    constructor(ragService: RagService);
    canHandle(message: string): boolean;
    buildPrompt(request: AiManagerRequest, context: SharedAiContext): Promise<AgentPrompt>;
}
