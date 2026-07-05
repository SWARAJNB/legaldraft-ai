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
const rxjs_1 = require("rxjs");
const ai_service_1 = require("./ai.service");
const ai_draft_assistant_service_1 = require("./ai-draft-assistant.service");
const ai_dto_1 = require("./dto/ai.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_decorators_1 = require("../auth/decorators/auth.decorators");
let AiController = AiController_1 = class AiController {
    constructor(aiService, draftAssistant) {
        this.aiService = aiService;
        this.draftAssistant = draftAssistant;
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
    getGuidedDraftTypes() {
        return this.draftAssistant.getAvailableDraftTypes();
    }
    guidedDraft(dto, user, tenantId) {
        return this.draftAssistant.processGuidedDraft(user.id, tenantId || 'default', dto);
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
exports.AiController = AiController = AiController_1 = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        ai_draft_assistant_service_1.AiDraftAssistantService])
], AiController);
//# sourceMappingURL=ai.controller.js.map