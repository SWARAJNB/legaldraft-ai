"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const ai_draft_assistant_service_1 = require("./ai-draft-assistant.service");
const ai_conversation_entity_1 = require("./entities/ai-conversation.entity");
const rag_module_1 = require("../rag/rag.module");
const draft_entity_1 = require("../drafts/entities/draft.entity");
const template_entity_1 = require("../templates/entities/template.entity");
const file_entity_1 = require("../files/entities/file.entity");
const file_intelligence_entity_1 = require("../files/entities/file-intelligence.entity");
const ai_agent_registry_service_1 = require("./agents/ai-agent-registry.service");
const ai_context_service_1 = require("./agents/ai-context.service");
const ai_tool_registry_service_1 = require("./agents/ai-tool-registry.service");
const draft_agent_service_1 = require("./agents/draft-agent.service");
const research_agent_service_1 = require("./agents/research-agent.service");
const review_agent_service_1 = require("./agents/review-agent.service");
const file_agent_service_1 = require("./agents/file-agent.service");
const timeline_agent_service_1 = require("./agents/timeline-agent.service");
const ai_manager_service_1 = require("./agents/ai-manager.service");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ai_conversation_entity_1.AiConversation,
                draft_entity_1.Draft,
                template_entity_1.Template,
                file_entity_1.FileEntity,
                file_intelligence_entity_1.FileIntelligenceEntity,
            ]),
            rag_module_1.RagModule,
        ],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            ai_draft_assistant_service_1.AiDraftAssistantService,
            ai_agent_registry_service_1.AiAgentRegistryService,
            ai_context_service_1.AiContextService,
            ai_tool_registry_service_1.AiToolRegistryService,
            draft_agent_service_1.DraftAgentService,
            research_agent_service_1.ResearchAgentService,
            review_agent_service_1.ReviewAgentService,
            file_agent_service_1.FileAgentService,
            timeline_agent_service_1.TimelineAgentService,
            ai_manager_service_1.AiManagerService,
        ],
        exports: [ai_service_1.AiService, ai_manager_service_1.AiManagerService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map