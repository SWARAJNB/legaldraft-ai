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
exports.GuidedDraftDto = exports.ImproveTextDto = exports.RiskCheckDto = exports.GenerateDraftDto = exports.ChatDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ChatMessageDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['system', 'user', 'assistant'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
class ChatDto {
}
exports.ChatDto = ChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChatMessageDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], ChatDto.prototype, "messages", void 0);
class GenerateDraftDto {
}
exports.GenerateDraftDto = GenerateDraftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of legal draft' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "draft_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Client information' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "client_info", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Case facts and details' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "case_details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Court or forum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "court", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relief/prayer sought' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "relief", void 0);
class RiskCheckDto {
}
exports.RiskCheckDto = RiskCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Draft content to analyze for risks' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RiskCheckDto.prototype, "content", void 0);
class ImproveTextDto {
}
exports.ImproveTextDto = ImproveTextDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Selected text to improve' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImproveTextDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Improvement action',
        enum: [
            'rewrite',
            'improve_legal_tone',
            'add_legal_arguments',
            'simplify',
            'expand',
            'fix_grammar',
        ],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImproveTextDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional context for the AI' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImproveTextDto.prototype, "context", void 0);
class GuidedDraftDto {
}
exports.GuidedDraftDto = GuidedDraftDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Existing session ID to continue' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuidedDraftDto.prototype, "session_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Draft type (for new sessions)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuidedDraftDto.prototype, "draft_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User answer to current question' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuidedDraftDto.prototype, "answer", void 0);
//# sourceMappingURL=ai.dto.js.map