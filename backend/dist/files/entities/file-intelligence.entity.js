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
exports.FileIntelligenceEntity = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileIntelligenceEntity = class FileIntelligenceEntity {
};
exports.FileIntelligenceEntity = FileIntelligenceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid' }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workspace_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'case_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "caseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "classification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_title', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "documentTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "parties", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'important_dates', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "importantDates", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clause_headings', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "clauseHeadings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'short_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "shortSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detailed_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "detailedSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extracted_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileIntelligenceEntity.prototype, "extractedText", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileIntelligenceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FileIntelligenceEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => file_entity_1.FileEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.FileEntity)
], FileIntelligenceEntity.prototype, "file", void 0);
exports.FileIntelligenceEntity = FileIntelligenceEntity = __decorate([
    (0, typeorm_1.Entity)('file_intelligence')
], FileIntelligenceEntity);
//# sourceMappingURL=file-intelligence.entity.js.map