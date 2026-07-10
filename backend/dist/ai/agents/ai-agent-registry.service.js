"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentRegistryService = void 0;
const common_1 = require("@nestjs/common");
const draft_agent_service_1 = require("./draft-agent.service");
const research_agent_service_1 = require("./research-agent.service");
const review_agent_service_1 = require("./review-agent.service");
const file_agent_service_1 = require("./file-agent.service");
const timeline_agent_service_1 = require("./timeline-agent.service");
let AiAgentRegistryService = class AiAgentRegistryService {
    constructor(draftAgent, researchAgent, reviewAgent, fileAgent, timelineAgent) {
        this.draftAgent = draftAgent;
        this.researchAgent = researchAgent;
        this.reviewAgent = reviewAgent;
        this.fileAgent = fileAgent;
        this.timelineAgent = timelineAgent;
        this.agents = new Map();
    }
    onModuleInit() {
        [
            this.draftAgent,
            this.researchAgent,
            this.reviewAgent,
            this.fileAgent,
            this.timelineAgent,
        ].forEach((agent) => this.register(agent));
    }
    register(agent) {
        this.agents.set(agent.id, agent);
    }
    get(id) {
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
    detect(message) {
        const matches = Array.from(this.agents.values()).filter((agent) => agent.canHandle(message));
        return matches[0] || this.draftAgent;
    }
};
exports.AiAgentRegistryService = AiAgentRegistryService;
exports.AiAgentRegistryService = AiAgentRegistryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [draft_agent_service_1.DraftAgentService,
        research_agent_service_1.ResearchAgentService,
        review_agent_service_1.ReviewAgentService,
        file_agent_service_1.FileAgentService,
        timeline_agent_service_1.TimelineAgentService])
], AiAgentRegistryService);
//# sourceMappingURL=ai-agent-registry.service.js.map