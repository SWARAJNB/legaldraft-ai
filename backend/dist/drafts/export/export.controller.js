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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const docx_export_service_1 = require("./docx-export.service");
const pdf_export_service_1 = require("./pdf-export.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/rbac/permissions.guard");
const permission_decorator_1 = require("../../auth/rbac/permission.decorator");
const permissions_1 = require("../../auth/rbac/permissions");
let ExportController = class ExportController {
    constructor(docxExport, pdfExport) {
        this.docxExport = docxExport;
        this.pdfExport = pdfExport;
    }
    async exportDocx(draftId, body, res) {
        const content = body.content || 'Draft content placeholder';
        const title = body.title || 'Legal Draft';
        const buffer = await this.docxExport.generateFromText(content, title);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`,
        });
        res.send(buffer);
    }
    async exportPdf(draftId, body, res) {
        const content = body.content || 'Draft content placeholder';
        const title = body.title || 'Legal Draft';
        const buffer = await this.pdfExport.generateFromText(content, title);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`,
        });
        res.send(buffer);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)('docx/:draftId'),
    (0, swagger_1.ApiOperation)({ summary: 'Export draft as DOCX' }),
    __param(0, (0, common_1.Param)('draftId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportDocx", null);
__decorate([
    (0, common_1.Post)('pdf/:draftId'),
    (0, swagger_1.ApiOperation)({ summary: 'Export draft as PDF' }),
    __param(0, (0, common_1.Param)('draftId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportPdf", null);
exports.ExportController = ExportController = __decorate([
    (0, swagger_1.ApiTags)('Export'),
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_1.Permission.EXPORT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [docx_export_service_1.DocxExportService,
        pdf_export_service_1.PdfExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map