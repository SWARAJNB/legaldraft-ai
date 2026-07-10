"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAgentService = void 0;
const common_1 = require("@nestjs/common");
const agent_prompts_1 = require("./agent-prompts");
let FileAgentService = class FileAgentService {
    constructor() {
        this.id = 'file';
        this.name = 'File Agent';
        this.description = 'Analyzes uploaded files, OCR output, metadata, and classification.';
        this.examples = ['uploaded file', 'ocr', 'metadata', 'classification', 'extract'];
    }
    canHandle(message) {
        return /\b(file|document|upload|uploaded|ocr|metadata|classify|classification|extract|scan|pdf|image)\b/i.test(message);
    }
    async buildPrompt(request, context) {
        return {
            system: `${agent_prompts_1.AGENT_SYSTEM_BASE}
You are the File Agent. Explain uploaded document intelligence, OCR findings, extracted metadata, classification, parties, dates, clauses, and tags.`,
            user: `${(0, agent_prompts_1.contextBlock)(context)}

User Request
${request.message}

File Agent Instructions
- Use file intelligence and document summaries from context.
- If OCR or extraction appears unavailable, say what should be re-uploaded or re-indexed.
- Return classification, key metadata, extracted facts, and next recommended action.`,
        };
    }
};
exports.FileAgentService = FileAgentService;
exports.FileAgentService = FileAgentService = __decorate([
    (0, common_1.Injectable)()
], FileAgentService);
//# sourceMappingURL=file-agent.service.js.map