import { OnModuleInit } from '@nestjs/common';
import { AiAgent, AgentId } from './agent.types';
import { DraftAgentService } from './draft-agent.service';
import { ResearchAgentService } from './research-agent.service';
import { ReviewAgentService } from './review-agent.service';
import { FileAgentService } from './file-agent.service';
import { TimelineAgentService } from './timeline-agent.service';
export declare class AiAgentRegistryService implements OnModuleInit {
    private readonly draftAgent;
    private readonly researchAgent;
    private readonly reviewAgent;
    private readonly fileAgent;
    private readonly timelineAgent;
    private readonly agents;
    constructor(draftAgent: DraftAgentService, researchAgent: ResearchAgentService, reviewAgent: ReviewAgentService, fileAgent: FileAgentService, timelineAgent: TimelineAgentService);
    onModuleInit(): void;
    register(agent: AiAgent): void;
    get(id: AgentId): AiAgent | undefined;
    list(): {
        id: AgentId;
        name: string;
        description: string;
        examples: string[];
    }[];
    detect(message: string): AiAgent;
}
