import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import { AiConversation } from './entities/ai-conversation.entity';
import { RagModule } from '../rag/rag.module';
import { Draft } from '../drafts/entities/draft.entity';
import { Template } from '../templates/entities/template.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FileIntelligenceEntity } from '../files/entities/file-intelligence.entity';

// Agents and Registries
import { AiAgentRegistryService } from './agents/ai-agent-registry.service';
import { AiContextService } from './agents/ai-context.service';
import { AiToolRegistryService } from './agents/ai-tool-registry.service';
import { DraftAgentService } from './agents/draft-agent.service';
import { ResearchAgentService } from './agents/research-agent.service';
import { ReviewAgentService } from './agents/review-agent.service';
import { FileAgentService } from './agents/file-agent.service';
import { TimelineAgentService } from './agents/timeline-agent.service';
import { AiManagerService } from './agents/ai-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiConversation,
      Draft,
      Template,
      FileEntity,
      FileIntelligenceEntity,
    ]),
    RagModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiDraftAssistantService,
    AiAgentRegistryService,
    AiContextService,
    AiToolRegistryService,
    DraftAgentService,
    ResearchAgentService,
    ReviewAgentService,
    FileAgentService,
    TimelineAgentService,
    AiManagerService,
  ],
  exports: [AiService, AiManagerService],
})
export class AiModule {}
