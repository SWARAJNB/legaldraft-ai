"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftAgentService = void 0;
const common_1 = require("@nestjs/common");
const agent_prompts_1 = require("./agent-prompts");
let DraftAgentService = class DraftAgentService {
    constructor() {
        this.id = 'draft';
        this.name = 'Draft Agent';
        this.description = 'Generates legal drafts, improves existing drafts, and uses templates.';
        this.examples = ['draft', 'petition', 'notice', 'agreement', 'improve draft', 'template'];
    }
    canHandle(message) {
        return /\b(draft|petition|notice|agreement|affidavit|plaint|application|reply|improve|rewrite|template)\b/i.test(message);
    }
    async buildPrompt(request, context) {
        return {
            system: `${agent_prompts_1.AGENT_SYSTEM_BASE}
You are the Draft Agent. Generate complete, court-ready or transaction-ready legal drafts when requested. If improving text, preserve meaning while improving legal structure, tone, and citations. Prefer available templates from context when they fit.`,
            user: `${(0, agent_prompts_1.contextBlock)(context)}

User Request
${request.message}

Draft Agent Instructions
- Use templates from shared context when relevant.
- Include title, parties, facts/background, legal grounds/clauses, prayer/relief, signature and verification blocks when appropriate.
- If required facts are missing, use clear placeholders like [___].
- If asked to improve a draft, return the improved text first and a short change note after.`,
        };
    }
};
exports.DraftAgentService = DraftAgentService;
exports.DraftAgentService = DraftAgentService = __decorate([
    (0, common_1.Injectable)()
], DraftAgentService);
//# sourceMappingURL=draft-agent.service.js.map