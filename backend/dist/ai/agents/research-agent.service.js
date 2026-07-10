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
exports.ResearchAgentService = void 0;
const common_1 = require("@nestjs/common");
const rag_service_1 = require("../../rag/rag.service");
const agent_prompts_1 = require("./agent-prompts");
let ResearchAgentService = class ResearchAgentService {
    constructor(ragService) {
        this.ragService = ragService;
        this.id = 'research';
        this.name = 'Research Agent';
        this.description = 'Searches RAG and the Knowledge Base, then returns citations.';
        this.examples = ['research', 'find documents', 'citation', 'knowledge base', 'precedent'];
    }
    canHandle(message) {
        return /\b(research|search|find|citation|citations|knowledge base|kb|rag|source|precedent|case law)\b/i.test(message);
    }
    async buildPrompt(request, context) {
        const citations = await this.ragService.retrieve({
            tenantId: context.tenantId,
            workspaceId: context.workspace?.id,
            caseId: context.case?.id,
            question: request.message,
            topK: 8,
        });
        return {
            citations,
            metadata: { citationCount: citations.length },
            system: `${agent_prompts_1.AGENT_SYSTEM_BASE}
You are the Research Agent. Ground your answer in retrieved workspace documents and Knowledge Base sources. Always cite document name, page number, and confidence when sources are available.`,
            user: `${(0, agent_prompts_1.contextBlock)(context)}

Retrieved Sources
${this.ragService.buildContext(citations) || 'No matching RAG sources were found.'}

User Request
${request.message}

Research Agent Instructions
- Answer from retrieved context first.
- Return a concise findings section followed by citations.
- If evidence is insufficient, say what is missing.`,
        };
    }
};
exports.ResearchAgentService = ResearchAgentService;
exports.ResearchAgentService = ResearchAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rag_service_1.RagService])
], ResearchAgentService);
//# sourceMappingURL=research-agent.service.js.map