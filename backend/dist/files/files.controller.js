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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_decorators_1 = require("../auth/decorators/auth.decorators");
const permissions_guard_1 = require("../auth/rbac/permissions.guard");
const permission_decorator_1 = require("../auth/rbac/permission.decorator");
const permissions_1 = require("../auth/rbac/permissions");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    findAll(tenantId) {
        if (!tenantId)
            throw new common_1.BadRequestException('Missing X-Tenant-ID header.');
        return this.filesService.findByTenant(tenantId);
    }
    async upload(file, tenantId, user, category, workspaceId, clientId, caseId, conversationId) {
        if (!file)
            throw new common_1.BadRequestException('No file provided.');
        if (!tenantId)
            throw new common_1.BadRequestException('Missing X-Tenant-ID header.');
        if (!category)
            throw new common_1.BadRequestException('Missing category field.');
        return this.filesService.upload(tenantId, category, file.originalname, file.buffer, file.mimetype, user.id, workspaceId, clientId, caseId, conversationId);
    }
    findById(id) {
        return this.filesService.findById(id);
    }
    getIntelligence(id) {
        return this.filesService.getIntelligence(id);
    }
    delete(id) {
        return this.filesService.delete(id);
    }
    getDownloadUrl(id) {
        return this.filesService.getDownloadUrl(id);
    }
    async download(id, res) {
        const { buffer, file } = await this.filesService.downloadContent(id);
        res.set({
            'Content-Type': file.fileType,
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
        });
        return new common_1.StreamableFile(buffer);
    }
    getPresignedUpload(tenantId, body) {
        if (!tenantId)
            throw new common_1.BadRequestException('Missing X-Tenant-ID header.');
        return this.filesService.getPresignedUploadUrl(tenantId, body.category, body.filename, body.expires_in || 3600);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all uploaded files' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file to tenant storage' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Body)('category')),
    __param(4, (0, common_1.Body)('workspace_id')),
    __param(5, (0, common_1.Body)('client_id')),
    __param(6, (0, common_1.Body)('case_id')),
    __param(7, (0, common_1.Body)('conversation_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/intelligence'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file AI intelligence details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getIntelligence", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a file' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pre-signed download URL' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download file content directly' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('presigned-upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pre-signed upload URL' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getPresignedUpload", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_1.Permission.DOCUMENT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map