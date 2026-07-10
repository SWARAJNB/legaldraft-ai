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
var AiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const ai_service_1 = require("./ai.service");
const ai_draft_assistant_service_1 = require("./ai-draft-assistant.service");
const ai_conversation_entity_1 = require("./entities/ai-conversation.entity");
const ai_dto_1 = require("./dto/ai.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_decorators_1 = require("../auth/decorators/auth.decorators");
const ai_manager_service_1 = require("./agents/ai-manager.service");
const permissions_guard_1 = require("../auth/rbac/permissions.guard");
const permission_decorator_1 = require("../auth/rbac/permission.decorator");
const permissions_1 = require("../auth/rbac/permissions");
let AiController = AiController_1 = class AiController {
    constructor(aiService, draftAssistant, conversationsRepo, aiManagerService) {
        this.aiService = aiService;
        this.draftAssistant = draftAssistant;
        this.conversationsRepo = conversationsRepo;
        this.aiManagerService = aiManagerService;
        this.logger = new common_1.Logger(AiController_1.name);
    }
    handleAiError(err, context) {
        const message = err?.message || 'Unknown AI error';
        this.logger.error(`AI ${context} failed: ${message}`);
        if (message.includes('API key') || message.includes('Incorrect API key') || message.includes('apiKey')) {
            throw new common_1.HttpException(`AI service authentication failed. Please check the API key configuration. (${context})`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
            throw new common_1.HttpException(`AI service rate limit reached. Please try again in a moment.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (message.includes('model') && message.includes('not found')) {
            throw new common_1.HttpException(`AI model not available. Please check the model configuration.`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        throw new common_1.HttpException(`AI service error: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async chat(dto) {
        try {
            return await this.aiService.chat(dto.messages);
        }
        catch (err) {
            this.handleAiError(err, 'chat');
        }
    }
    chatStream(dto) {
        const subject = new rxjs_1.Subject();
        (async () => {
            try {
                const stream = this.aiService.chatStream(dto.messages);
                for await (const token of stream) {
                    subject.next({ data: JSON.stringify({ token }) });
                }
                subject.next({
                    data: JSON.stringify({ done: true }),
                });
                subject.complete();
            }
            catch (err) {
                subject.next({
                    data: JSON.stringify({
                        error: err.message,
                    }),
                });
                subject.complete();
            }
        })();
        return subject.asObservable();
    }
    async generateDraft(dto) {
        try {
            return await this.aiService.generateDraft(dto);
        }
        catch (err) {
            this.handleAiError(err, 'generate-draft');
        }
    }
    async riskCheck(dto) {
        try {
            return await this.aiService.riskCheck(dto.content);
        }
        catch (err) {
            this.handleAiError(err, 'risk-check');
        }
    }
    async improveText(dto) {
        try {
            return await this.aiService.improveText(dto);
        }
        catch (err) {
            this.handleAiError(err, 'improve-text');
        }
    }
    async knowledgeAnswer(body, tenantId) {
        try {
            return await this.aiService.answerWithKnowledge({
                question: body.question,
                tenantId: tenantId || 'default-tenant',
                workspaceId: body.workspace_id,
                caseId: body.case_id,
            });
        }
        catch (err) {
            this.handleAiError(err, 'knowledge-answer');
        }
    }
    getGuidedDraftTypes() {
        return this.draftAssistant.getAvailableDraftTypes();
    }
    guidedDraft(dto, user, tenantId) {
        return this.draftAssistant.processGuidedDraft(user.id, tenantId || 'default', dto);
    }
    async getConversations(user, tenantId) {
        try {
            return await this.conversationsRepo.find({
                where: {
                    userId: user.id,
                    tenantId: tenantId || 'default',
                    sessionType: 'chat',
                },
                order: { updatedAt: 'DESC' },
            });
        }
        catch (err) {
            this.handleAiError(err, 'getConversations');
        }
    }
    async getConversation(id, user) {
        try {
            const conv = await this.conversationsRepo.findOne({
                where: { id, userId: user.id },
            });
            if (!conv) {
                throw new common_1.HttpException('Conversation not found', common_1.HttpStatus.NOT_FOUND);
            }
            return conv;
        }
        catch (err) {
            this.handleAiError(err, 'getConversation');
        }
    }
    async createConversation(body, user, tenantId) {
        try {
            const conv = this.conversationsRepo.create({
                userId: user.id,
                tenantId: tenantId || 'default',
                sessionType: 'chat',
                draftType: '',
                currentStep: 0,
                collectedAnswers: {},
                messages: [],
                isComplete: false,
                title: body.title || 'New Chat',
            });
            return await this.conversationsRepo.save(conv);
        }
        catch (err) {
            this.handleAiError(err, 'createConversation');
        }
    }
    async updateConversation(id, body, user) {
        try {
            const conv = await this.conversationsRepo.findOne({
                where: { id, userId: user.id },
            });
            if (!conv) {
                throw new common_1.HttpException('Conversation not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (body.title) {
                conv.title = body.title;
            }
            return await this.conversationsRepo.save(conv);
        }
        catch (err) {
            this.handleAiError(err, 'updateConversation');
        }
    }
    async deleteConversation(id, user) {
        try {
            const conv = await this.conversationsRepo.findOne({
                where: { id, userId: user.id },
            });
            if (!conv) {
                throw new common_1.HttpException('Conversation not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.conversationsRepo.remove(conv);
            return { message: 'Conversation deleted successfully' };
        }
        catch (err) {
            this.handleAiError(err, 'deleteConversation');
        }
    }
    async conversationsChatStream(id, body, user, tenantId) {
        const conv = await this.conversationsRepo.findOne({
            where: { id, userId: user.id },
        });
        if (!conv) {
            throw new common_1.HttpException('Conversation not found', common_1.HttpStatus.NOT_FOUND);
        }
        const userMsg = {
            role: 'user',
            content: body.content,
            timestamp: new Date().toISOString(),
        };
        conv.messages.push(userMsg);
        await this.conversationsRepo.save(conv);
        const subject = new rxjs_1.Subject();
        (async () => {
            try {
                const historyMessages = conv.messages.slice(0, -1).map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                const stream = this.aiManagerService.executeStream({
                    tenantId: tenantId || 'default-tenant',
                    userId: user.id,
                    conversationId: id,
                    message: body.content,
                    messages: historyMessages,
                    frontendContext: body.context,
                    mode: body.mode,
                    selectedAgent: body.selectedAgent,
                });
                let assistantContent = '';
                for await (const chunk of stream) {
                    if (chunk.token) {
                        assistantContent += chunk.token;
                    }
                    subject.next({ data: JSON.stringify(chunk) });
                }
                const assistantMsg = {
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date().toISOString(),
                };
                conv.messages.push(assistantMsg);
                await this.conversationsRepo.save(conv);
                subject.next({
                    data: JSON.stringify({ done: true }),
                });
                subject.complete();
            }
            catch (err) {
                subject.next({
                    data: JSON.stringify({
                        error: err.message,
                    }),
                });
                subject.complete();
            }
        })();
        return subject.asObservable();
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send chat messages to AI and get a response' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.ChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('chat/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream chat response via SSE' }),
    (0, common_1.Sse)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.ChatDto]),
    __metadata("design:returntype", rxjs_1.Observable)
], AiController.prototype, "chatStream", null);
__decorate([
    (0, common_1.Post)('generate-draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a complete legal draft from parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.GenerateDraftDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateDraft", null);
__decorate([
    (0, common_1.Post)('risk-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a draft for legal risks' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.RiskCheckDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "riskCheck", null);
__decorate([
    (0, common_1.Post)('improve-text'),
    (0, swagger_1.ApiOperation)({ summary: 'Improve selected text with AI' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.ImproveTextDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "improveText", null);
__decorate([
    (0, common_1.Post)('knowledge-answer'),
    (0, swagger_1.ApiOperation)({ summary: 'Answer a question using the RAG knowledge base pipeline' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "knowledgeAnswer", null);
__decorate([
    (0, common_1.Get)('guided-draft/types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available draft types for guided drafting' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getGuidedDraftTypes", null);
__decorate([
    (0, common_1.Post)('guided-draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Start or continue a guided draft Q&A session' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.GuidedDraftDto, Object, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "guidedDraft", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all chat conversations for user' }),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single conversation by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new conversation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Put)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update conversation properties' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a conversation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream conversation chat response via SSE' }),
    (0, common_1.Sse)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "conversationsChatStream", null);
exports.AiController = AiController = AiController_1 = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_1.Permission.AI),
    (0, swagger_1.ApiBearerAuth)(),
    __param(2, (0, typeorm_1.InjectRepository)(ai_conversation_entity_1.AiConversation)),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        ai_draft_assistant_service_1.AiDraftAssistantService,
        typeorm_2.Repository,
        ai_manager_service_1.AiManagerService])
], AiController);
//# sourceMappingURL=ai.controller.js.map