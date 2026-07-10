import { Injectable, OnModuleInit } from '@nestjs/common';
import { AiAgent, AgentId } from './agent.types';
import { DraftAgentService } from './draft-agent.service';
import { ResearchAgentService } from './research-agent.service';
import { ReviewAgentService } from './review-agent.service';
import { FileAgentService } from './file-agent.service';
import { TimelineAgentService } from './timeline-agent.service';

@Injectable()
export class AiAgentRegistryService implements OnModuleInit {
  private readonly agents = new Map<AgentId, AiAgent>();

  constructor(
    private readonly draftAgent: DraftAgentService,
    private readonly researchAgent: ResearchAgentService,
    private readonly reviewAgent: ReviewAgentService,
    private readonly fileAgent: FileAgentService,
    private readonly timelineAgent: TimelineAgentService,
  ) {}

  onModuleInit() {
    [
      this.draftAgent,
      this.researchAgent,
      this.reviewAgent,
      this.fileAgent,
      this.timelineAgent,
    ].forEach((agent) => this.register(agent));
  }

  register(agent: AiAgent) {
    this.agents.set(agent.id, agent);
  }

  get(id: AgentId) {
    return this.agents.get(id);
  }

  list() {
    return Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      examples: agent.examples,
    }));
  }

  detect(message: string): AiAgent {
    const matches = Array.from(this.agents.values()).filter((agent) =>
      agent.canHandle(message),
    );

    return matches[0] || this.draftAgent;
  }
}
