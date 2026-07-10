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
var AiManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiManagerService = void 0;
const common_1 = require("@nestjs/common");
const ai_agent_registry_service_1 = require("./ai-agent-registry.service");
const ai_context_service_1 = require("./ai-context.service");
const gemini_provider_1 = require("../providers/gemini.provider");
const agent_types_1 = require("./agent.types");
let AiManagerService = AiManagerService_1 = class AiManagerService {
    constructor(agentRegistry, contextService) {
        this.agentRegistry = agentRegistry;
        this.contextService = contextService;
        this.logger = new common_1.Logger(AiManagerService_1.name);
        this.provider = new gemini_provider_1.GeminiProvider();
    }
    async execute(request) {
        const context = await this.contextService.build(request);
        let agentId = 'draft';
        if (request.mode === 'manual' && request.selectedAgent) {
            agentId = request.selectedAgent;
        }
        else {
            const detectedAgent = this.agentRegistry.detect(request.message);
            agentId = detectedAgent.id;
        }
        const agent = this.agentRegistry.get(agentId);
        if (!agent) {
            throw new Error(`Selected agent '${agentId}' is not registered`);
        }
        this.logger.log(`Executing agent: ${agent.name} (${agent.id}) in mode ${request.mode || 'automatic'}`);
        const prompt = await agent.buildPrompt(request, context);
        const messages = (0, agent_types_1.toChatMessages)(prompt);
        const response = await this.provider.chat(messages);
        return {
            response,
            citations: prompt.citations,
            metadata: prompt.metadata,
            selectedAgentId: agentId,
        };
    }
    async *executeStream(request) {
        try {
            const context = await this.contextService.build(request);
            let agentId = 'draft';
            if (request.mode === 'manual' && request.selectedAgent) {
                agentId = request.selectedAgent;
            }
            else {
                const detectedAgent = this.agentRegistry.detect(request.message);
                agentId = detectedAgent.id;
            }
            const agent = this.agentRegistry.get(agentId);
            if (!agent) {
                throw new Error(`Selected agent '${agentId}' is not registered`);
            }
            this.logger.log(`Streaming execution of agent: ${agent.name} (${agent.id}) in mode ${request.mode || 'automatic'}`);
            yield { selectedAgentId: agentId };
            const prompt = await agent.buildPrompt(request, context);
            const messages = (0, agent_types_1.toChatMessages)(prompt);
            const stream = this.provider.chatStream(messages);
            for await (const token of stream) {
                yield { token, selectedAgentId: agentId };
            }
            yield { done: true, selectedAgentId: agentId };
        }
        catch (err) {
            this.logger.error(`Error in executeStream: ${err.stack}`);
            yield { error: err.message, selectedAgentId: request.selectedAgent || 'draft' };
        }
    }
};
exports.AiManagerService = AiManagerService;
exports.AiManagerService = AiManagerService = AiManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_agent_registry_service_1.AiAgentRegistryService,
        ai_context_service_1.AiContextService])
], AiManagerService);
//# sourceMappingURL=ai-manager.service.js.map