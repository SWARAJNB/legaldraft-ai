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
exports.DraftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const draft_entity_1 = require("./entities/draft.entity");
let DraftsService = class DraftsService {
    constructor(draftsRepo) {
        this.draftsRepo = draftsRepo;
    }
    async create(tenantId, userId, dto) {
        const caseNumber = `CAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const wordCount = dto.content
            ? dto.content.trim().split(/\s+/).filter(Boolean).length
            : 0;
        const draft = this.draftsRepo.create({
            tenantId,
            title: dto.title || 'Untitled Draft',
            caseNumber: dto.caseNumber || caseNumber,
            clientName: dto.clientName || '',
            status: dto.status || 'draft',
            category: dto.category || 'criminal',
            assignedTo: dto.assignedTo || '',
            content: dto.content || '',
            wordCount,
            version: 1,
            tags: dto.tags || [dto.category || 'criminal', 'draft'],
            templateId: dto.templateId || undefined,
            createdBy: userId,
        });
        return this.draftsRepo.save(draft);
    }
    async findAll(tenantId) {
        return this.draftsRepo.find({
            where: { tenantId },
            order: { updatedAt: 'DESC' },
        });
    }
    async findById(id) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft)
            throw new common_1.NotFoundException('Draft not found');
        return draft;
    }
    async update(id, dto) {
        const draft = await this.findById(id);
        Object.assign(draft, dto);
        if (dto.content) {
            draft.wordCount = dto.content.trim().split(/\s+/).filter(Boolean).length;
        }
        return this.draftsRepo.save(draft);
    }
    async delete(id) {
        const draft = await this.findById(id);
        await this.draftsRepo.remove(draft);
        return { message: 'Draft deleted successfully' };
    }
};
exports.DraftsService = DraftsService;
exports.DraftsService = DraftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(draft_entity_1.Draft)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DraftsService);
//# sourceMappingURL=drafts.service.js.map