import { AiAgentRegistryService } from './ai-agent-registry.service';
import { AiContextService } from './ai-context.service';
import { AiManagerRequest, AgentExecutionResult, AgentId } from './agent.types';
export declare class AiManagerService {
    private readonly agentRegistry;
    private readonly contextService;
    private readonly logger;
    private provider;
    constructor(agentRegistry: AiAgentRegistryService, contextService: AiContextService);
    execute(request: AiManagerRequest): Promise<AgentExecutionResult & {
        selectedAgentId: AgentId;
    }>;
    executeStream(request: AiManagerRequest): AsyncGenerator<{
        token?: string;
        selectedAgentId: AgentId;
        done?: boolean;
        error?: string;
    }>;
}
