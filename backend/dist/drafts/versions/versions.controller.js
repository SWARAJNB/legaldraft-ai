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
exports.VersionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const versions_service_1 = require("./versions.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorators_1 = require("../../auth/decorators/auth.decorators");
let VersionsController = class VersionsController {
    constructor(versionsService) {
        this.versionsService = versionsService;
    }
    findAll(draftId) {
        return this.versionsService.findByDraftId(draftId);
    }
    create(draftId, dto, user) {
        return this.versionsService.createVersion(draftId, dto.content, user.id, dto.change_note);
    }
    restore(draftId, versionId, user) {
        return this.versionsService.restore(draftId, versionId, user.id);
    }
};
exports.VersionsController = VersionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List version history for a draft' }),
    __param(0, (0, common_1.Param)('draftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save a new version' }),
    __param(0, (0, common_1.Param)('draftId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':versionId/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a previous version (creates new version)' }),
    __param(0, (0, common_1.Param)('draftId')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "restore", null);
exports.VersionsController = VersionsController = __decorate([
    (0, swagger_1.ApiTags)('Versions'),
    (0, common_1.Controller)('drafts/:draftId/versions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [versions_service_1.VersionsService])
], VersionsController);
//# sourceMappingURL=versions.controller.js.map