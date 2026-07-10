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
exports.RagController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const rag_service_1 = require("./rag.service");
let RagController = class RagController {
    constructor(ragService) {
        this.ragService = ragService;
    }
    getKnowledgeBase(tenantId, workspaceId, caseId) {
        return this.ragService.getKnowledgeBase({
            tenantId: tenantId || 'default-tenant',
            workspaceId,
            caseId,
        });
    }
    search(tenantId, body) {
        return this.ragService.retrieve({
            tenantId: tenantId || 'default-tenant',
            workspaceId: body.workspace_id,
            caseId: body.case_id,
            question: body.question,
            topK: body.top_k || 8,
        });
    }
};
exports.RagController = RagController;
__decorate([
    (0, common_1.Get)('knowledge-base'),
    (0, swagger_1.ApiOperation)({ summary: 'Get indexed knowledge base documents and source status' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('workspace_id')),
    __param(2, (0, common_1.Query)('case_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RagController.prototype, "getKnowledgeBase", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Run hybrid retrieval over PostgreSQL FTS and local ChromaDB vectors' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RagController.prototype, "search", null);
exports.RagController = RagController = __decorate([
    (0, swagger_1.ApiTags)('RAG'),
    (0, common_1.Controller)('rag'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [rag_service_1.RagService])
], RagController);
//# sourceMappingURL=rag.controller.js.map