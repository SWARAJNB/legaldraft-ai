"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewAgentService = void 0;
const common_1 = require("@nestjs/common");
const agent_prompts_1 = require("./agent-prompts");
let ReviewAgentService = class ReviewAgentService {
    constructor() {
        this.id = 'review';
        this.name = 'Review Agent';
        this.description = 'Performs contract review, clause analysis, and risk detection.';
        this.examples = ['review', 'risk', 'clause', 'contract analysis', 'liability'];
    }
    canHandle(message) {
        return /\b(review|risk|risks|clause|contract|liability|indemnity|termination|obligation|red flag|analyse|analyze)\b/i.test(message);
    }
    async buildPrompt(request, context) {
        return {
            system: `${agent_prompts_1.AGENT_SYSTEM_BASE}
You are the Review Agent. Identify legal, commercial, drafting, and evidentiary risks. Be precise and actionable.`,
            user: `${(0, agent_prompts_1.contextBlock)(context)}

User Request
${request.message}

Review Agent Instructions
- For contract review, list clause issues, severity, rationale, and suggested revision.
- For risk detection, classify risks as critical, warning, or info.
- For clause analysis, explain enforceability, ambiguity, missing safeguards, and recommended language.
- Use uploaded document intelligence and drafts from context when available.`,
        };
    }
};
exports.ReviewAgentService = ReviewAgentService;
exports.ReviewAgentService = ReviewAgentService = __decorate([
    (0, common_1.Injectable)()
], ReviewAgentService);
//# sourceMappingURL=review-agent.service.js.map