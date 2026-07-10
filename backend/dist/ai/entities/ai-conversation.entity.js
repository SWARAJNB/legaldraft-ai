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
exports.AiConversation = void 0;
const typeorm_1 = require("typeorm");
let AiConversation = class AiConversation {
};
exports.AiConversation = AiConversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiConversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AiConversation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], AiConversation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AiConversation.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_type', type: 'varchar', length: 50, default: 'chat' }),
    __metadata("design:type", String)
], AiConversation.prototype, "sessionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'draft_type', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AiConversation.prototype, "draftType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_step', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AiConversation.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'collected_answers', type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], AiConversation.prototype, "collectedAnswers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], AiConversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_complete', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AiConversation.prototype, "isComplete", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AiConversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AiConversation.prototype, "updatedAt", void 0);
exports.AiConversation = AiConversation = __decorate([
    (0, typeorm_1.Entity)('ai_conversations')
], AiConversation);
//# sourceMappingURL=ai-conversation.entity.js.map