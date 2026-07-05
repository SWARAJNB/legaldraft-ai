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
exports.Template = void 0;
const typeorm_1 = require("typeorm");
let Template = class Template {
};
exports.Template = Template;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Template.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Template.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Template.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Template.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Template.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Template.prototype, "fields", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usage_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Template.prototype, "usageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Template.prototype, "lastUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preview_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Template.prototype, "previewText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Template.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Template.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Template.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_shared', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Template.prototype, "isShared", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Template.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Template.prototype, "placeholders", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Template.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Template.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Template.prototype, "updatedAt", void 0);
exports.Template = Template = __decorate([
    (0, typeorm_1.Entity)('templates')
], Template);
//# sourceMappingURL=template.entity.js.map