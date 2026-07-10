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
exports.AiContextService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const draft_entity_1 = require("../../drafts/entities/draft.entity");
const template_entity_1 = require("../../templates/entities/template.entity");
const file_entity_1 = require("../../files/entities/file.entity");
const file_intelligence_entity_1 = require("../../files/entities/file-intelligence.entity");
const rag_service_1 = require("../../rag/rag.service");
let AiContextService = class AiContextService {
    constructor(draftsRepo, templatesRepo, filesRepo, intelligenceRepo, ragService) {
        this.draftsRepo = draftsRepo;
        this.templatesRepo = templatesRepo;
        this.filesRepo = filesRepo;
        this.intelligenceRepo = intelligenceRepo;
        this.ragService = ragService;
    }
    async build(request) {
        const frontend = request.frontendContext || {};
        const workspaceId = frontend.workspaceId || frontend.activeWorkspaceId;
        const caseId = frontend.caseId || frontend.activeCaseId;
        const [drafts, templates, files, intelligence, knowledgeBase] = await Promise.all([
            this.draftsRepo.find({
                where: { tenantId: request.tenantId },
                order: { updatedAt: 'DESC' },
                take: 8,
            }),
            this.templatesRepo.find({
                where: [{ tenantId: request.tenantId }, { tenantId: (0, typeorm_2.IsNull)() }],
                order: { updatedAt: 'DESC' },
                take: 8,
            }),
            this.filesRepo.find({
                where: { tenantId: request.tenantId },
                order: { createdAt: 'DESC' },
                take: 8,
            }),
            this.intelligenceRepo.find({
                where: workspaceId ? { workspaceId } : {},
                order: { updatedAt: 'DESC' },
                take: 8,
            }),
            this.ragService
                .getKnowledgeBase({
                tenantId: request.tenantId,
                workspaceId,
                caseId,
            })
                .catch(() => ({ documents: [], aiSources: [], searchPreview: [] })),
        ]);
        return {
            tenantId: request.tenantId,
            userId: request.userId,
            workspace: {
                id: workspaceId,
                name: frontend.workspaceName,
            },
            client: {
                id: frontend.clientId,
                name: frontend.clientName,
            },
            case: {
                id: caseId,
                title: frontend.caseTitle,
                number: frontend.caseNumber,
                court: frontend.court,
                nextHearing: frontend.nextHearing,
            },
            timeline: frontend.timeline || [],
            tasks: frontend.tasks || [],
            notes: frontend.notes || [],
            documents: [
                ...(frontend.documents || []).map((name) => ({ name })),
                ...files.map((file) => ({
                    id: file.id,
                    name: file.originalName,
                    type: file.fileType,
                    size: file.fileSize,
                })),
                ...intelligence.map((item) => ({
                    id: item.fileId,
                    title: item.documentTitle,
                    classification: item.classification,
                    summary: item.shortSummary,
                    keywords: item.keywords,
                })),
            ].slice(0, 16),
            drafts: [
                ...(frontend.drafts || []),
                ...drafts.map((draft) => ({
                    id: draft.id,
                    title: draft.title,
                    status: draft.status,
                    category: draft.category,
                    clientName: draft.clientName,
                    caseNumber: draft.caseNumber,
                    preview: (draft.content || '').slice(0, 1200),
                })),
            ].slice(0, 12),
            templates: [
                ...(frontend.templates || []),
                ...templates.map((template) => ({
                    id: template.id,
                    name: template.name,
                    category: template.category,
                    description: template.description,
                    preview: template.previewText,
                    placeholders: template.placeholders,
                })),
            ].slice(0, 12),
            conversation: request.messages || [],
            knowledgeBase: {
                documents: knowledgeBase.documents || [],
                aiSources: knowledgeBase.aiSources || [],
            },
        };
    }
    format(context) {
        return `Workspace: ${context.workspace?.name || 'Not selected'}
Client: ${context.client?.name || 'Not selected'}
Case: ${context.case?.title || 'Not selected'} ${context.case?.number ? `(${context.case.number})` : ''}
Timeline: ${this.compact(context.timeline)}
Tasks: ${this.compact(context.tasks)}
Notes: ${this.compact(context.notes)}
Documents: ${this.compact(context.documents)}
Drafts: ${this.compact(context.drafts)}
Templates: ${this.compact(context.templates)}
Knowledge Base: ${this.compact(context.knowledgeBase?.documents || [])}
Conversation: ${this.compact(context.conversation)}`;
    }
    compact(value) {
        if (!value?.length)
            return 'None';
        return JSON.stringify(value.slice(0, 8)).slice(0, 6000);
    }
};
exports.AiContextService = AiContextService;
exports.AiContextService = AiContextService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(draft_entity_1.Draft)),
    __param(1, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __param(2, (0, typeorm_1.InjectRepository)(file_entity_1.FileEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(file_intelligence_entity_1.FileIntelligenceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        rag_service_1.RagService])
], AiContextService);
//# sourceMappingURL=ai-context.service.js.map