"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineAgentService = void 0;
const common_1 = require("@nestjs/common");
const agent_prompts_1 = require("./agent-prompts");
let TimelineAgentService = class TimelineAgentService {
    constructor() {
        this.id = 'timeline';
        this.name = 'Timeline Agent';
        this.description = 'Summarizes case timelines, hearing summaries, and case history.';
        this.examples = ['timeline', 'hearing summary', 'case history', 'chronology'];
    }
    canHandle(message) {
        return /\b(timeline|chronology|hearing|case history|history|events|dates|next hearing|summary for hearing)\b/i.test(message);
    }
    async buildPrompt(request, context) {
        return {
            system: `${agent_prompts_1.AGENT_SYSTEM_BASE}
You are the Timeline Agent. Convert case activity into clear chronologies, hearing briefs, and case history notes.`,
            user: `${(0, agent_prompts_1.contextBlock)(context)}

User Request
${request.message}

Timeline Agent Instructions
- Order events chronologically.
- Highlight upcoming hearings, pending tasks, missing dates, and preparation items.
- For hearing summaries, include facts, procedural posture, issues, documents to carry, and suggested oral points.`,
        };
    }
};
exports.TimelineAgentService = TimelineAgentService;
exports.TimelineAgentService = TimelineAgentService = __decorate([
    (0, common_1.Injectable)()
], TimelineAgentService);
//# sourceMappingURL=timeline-agent.service.js.map