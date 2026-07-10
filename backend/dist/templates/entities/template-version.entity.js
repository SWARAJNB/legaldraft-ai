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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateVersion = void 0;
const typeorm_1 = require("typeorm");
const template_entity_1 = require("./template.entity");
let TemplateVersion = class TemplateVersion {
};
exports.TemplateVersion = TemplateVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TemplateVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'uuid' }),
    __metadata("design:type", String)
], TemplateVersion.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version_number', type: 'int' }),
    __metadata("design:type", Number)
], TemplateVersion.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TemplateVersion.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preview_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TemplateVersion.prototype, "previewText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], TemplateVersion.prototype, "placeholders", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TemplateVersion.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TemplateVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_entity_1.Template, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", template_entity_1.Template)
], TemplateVersion.prototype, "template", void 0);
exports.TemplateVersion = TemplateVersion = __decorate([
    (0, typeorm_1.Entity)('template_versions')
], TemplateVersion);
//# sourceMappingURL=template-version.entity.js.map