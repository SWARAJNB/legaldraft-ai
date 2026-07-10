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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiToolRegistryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rag_service_1 = require("../../rag/rag.service");
const template_entity_1 = require("../../templates/entities/template.entity");
const draft_entity_1 = require("../../drafts/entities/draft.entity");
let AiToolRegistryService = class AiToolRegistryService {
    constructor(ragService, templatesRepo, draftsRepo) {
        this.ragService = ragService;
        this.templatesRepo = templatesRepo;
        this.draftsRepo = draftsRepo;
        this.tools = new Map();
    }
    onModuleInit() {
        this.register({
            id: 'search_documents',
            description: 'Search workspace and case documents using hybrid RAG.',
            execute: (input, context) => this.ragService.retrieve({
                tenantId: context.tenantId,
                workspaceId: context.workspace?.id,
                caseId: context.case?.id,
                question: input.question,
                topK: input.topK || 8,
            }),
        });
        this.register({
            id: 'search_templates',
            description: 'Search available drafting templates.',
            execute: async (input, context) => this.templatesRepo.find({
                where: { tenantId: context.tenantId },
                order: { updatedAt: 'DESC' },
                take: input.limit || 8,
            }),
        });
        this.register({
            id: 'search_cases',
            description: 'Search the active workspace case context.',
            execute: async (_input, context) => ({
                activeCase: context.case,
                timeline: context.timeline,
                tasks: context.tasks,
                notes: context.notes,
            }),
        });
        this.register({
            id: 'generate_draft',
            description: 'Prepare draft-generation inputs for the selected agent.',
            execute: async (input, context) => ({
                draftType: input.draftType,
                client: context.client,
                case: context.case,
                templates: context.templates,
            }),
        });
        this.register({
            id: 'export_pdf',
            description: 'Placeholder tool contract for PDF export.',
            execute: async () => ({ supported: true, route: '/export/pdf/direct' }),
        });
        this.register({
            id: 'export_docx',
            description: 'Placeholder tool contract for DOCX export.',
            execute: async () => ({ supported: true, route: '/export/docx/direct' }),
        });
    }
    register(tool) {
        this.tools.set(tool.id, tool);
    }
    get(id) {
        return this.tools.get(id);
    }
    list() {
        return Array.from(this.tools.values()).map(({ id, description }) => ({
            id,
            description,
        }));
    }
    async run(id, input, context) {
        const tool = this.get(id);
        if (!tool) {
            throw new Error(`AI tool '${id}' is not registered`);
        }
        return tool.execute(input, context);
    }
};
exports.AiToolRegistryService = AiToolRegistryService;
exports.AiToolRegistryService = AiToolRegistryService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __param(2, (0, typeorm_1.InjectRepository)(draft_entity_1.Draft)),
    __metadata("design:paramtypes", [rag_service_1.RagService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AiToolRegistryService);
//# sourceMappingURL=ai-tool-registry.service.js.map