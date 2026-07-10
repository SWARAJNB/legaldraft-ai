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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const templates_service_1 = require("./templates.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_decorators_1 = require("../auth/decorators/auth.decorators");
let TemplatesController = class TemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    findAll(tenantId, search, category) {
        return this.templatesService.findAll(tenantId, search, category);
    }
    upload(file, tenantId, user, name, description) {
        return this.templatesService.uploadTemplate(tenantId || 'default', user.id, file, name, description);
    }
    findById(id) {
        return this.templatesService.findById(id);
    }
    savePlaceholders(id, body, user) {
        return this.templatesService.savePlaceholders(id, body.placeholders, user.id);
    }
    getVersions(id) {
        return this.templatesService.getVersions(id);
    }
    restoreVersion(id, versionNumber, user) {
        return this.templatesService.restoreVersion(id, parseInt(versionNumber, 10), user.id);
    }
    generateDraft(id, tenantId, user, values) {
        return this.templatesService.generateDraft(id, tenantId || 'default', user.id, values);
    }
    askInterviewQuestion(id, body) {
        return this.templatesService.askInterviewQuestion(id, body.answers, body.currentPlaceholder);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all templates (system + tenant)' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a DOCX/DOC template file' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Body)('name')),
    __param(4, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/placeholders'),
    (0, swagger_1.ApiOperation)({ summary: 'Save manual placeholders confirmation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "savePlaceholders", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template version history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)(':id/versions/:versionNumber/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a template version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionNumber')),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Post)(':id/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a smart draft from template' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "generateDraft", null);
__decorate([
    (0, common_1.Post)(':id/interview'),
    (0, swagger_1.ApiOperation)({ summary: 'Ask AI Interview question' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "askInterviewQuestion", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Templates'),
    (0, common_1.Controller)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map