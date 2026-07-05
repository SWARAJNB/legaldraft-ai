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
exports.Draft = void 0;
const typeorm_1 = require("typeorm");
let Draft = class Draft {
};
exports.Draft = Draft;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Draft.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Draft.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Draft.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'case_number', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "caseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'draft' }),
    __metadata("design:type", String)
], Draft.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'criminal' }),
    __metadata("design:type", String)
], Draft.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'word_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Draft.prototype, "wordCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Draft.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Draft.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Draft.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Draft.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Draft.prototype, "updatedAt", void 0);
exports.Draft = Draft = __decorate([
    (0, typeorm_1.Entity)('drafts')
], Draft);
//# sourceMappingURL=draft.entity.js.map