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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const template_entity_1 = require("./entities/template.entity");
let TemplatesService = class TemplatesService {
    constructor(templatesRepo) {
        this.templatesRepo = templatesRepo;
    }
    async findAll(tenantId) {
        const query = this.templatesRepo.createQueryBuilder('t');
        query.where('t.is_system = :isSystem', { isSystem: true });
        if (tenantId) {
            query.orWhere('t.tenant_id = :tenantId', { tenantId });
            query.orWhere('t.is_shared = :isShared AND t.tenant_id IS NOT NULL', { isShared: true });
        }
        query.orderBy('t.usage_count', 'DESC');
        return query.getMany();
    }
    async findById(id) {
        return this.templatesRepo.findOne({ where: { id } });
    }
    async create(tenantId, userId, dto) {
        const template = this.templatesRepo.create({
            ...dto,
            tenantId,
            createdBy: userId,
            isSystem: false,
        });
        return this.templatesRepo.save(template);
    }
    async incrementUsage(id) {
        const template = await this.findById(id);
        if (template) {
            template.usageCount += 1;
            template.lastUsed = new Date();
            await this.templatesRepo.save(template);
        }
    }
    async seedSystemTemplates() {
        const count = await this.templatesRepo.count({ where: { isSystem: true } });
        if (count > 0)
            return;
        const systemTemplates = [
            { name: 'Bail Application', description: 'Standard bail application for sessions court under CrPC Section 439', category: 'criminal', fields: 12, usageCount: 847, previewText: 'IN THE COURT OF SESSIONS JUDGE...', tags: ['bail', 'sessions court', 'CrPC 439'], isFeatured: true, isSystem: true },
            { name: 'FIR Quashing Petition', description: 'Petition to quash FIR under Section 482 CrPC before High Court', category: 'criminal', fields: 15, usageCount: 423, previewText: 'IN THE HIGH COURT OF JUDICATURE...', tags: ['FIR', 'quashing', '482 CrPC', 'High Court'], isFeatured: false, isSystem: true },
            { name: 'Civil Suit Plaint', description: 'Standard plaint for civil suits including money recovery and injunctions', category: 'civil', fields: 18, usageCount: 612, previewText: 'IN THE COURT OF CIVIL JUDGE...', tags: ['civil suit', 'plaint', 'CPC'], isFeatured: true, isSystem: true },
            { name: 'Property Sale Agreement', description: 'Comprehensive sale deed for residential and commercial property transactions', category: 'property', fields: 22, usageCount: 389, previewText: 'THIS AGREEMENT OF SALE is made and entered into...', tags: ['sale deed', 'property', 'real estate'], isFeatured: true, isSystem: true },
            { name: 'Divorce Petition (Mutual)', description: 'Mutual consent divorce petition under Section 13B Hindu Marriage Act', category: 'family', fields: 16, usageCount: 267, previewText: 'IN THE COURT OF FAMILY JUDGE...', tags: ['divorce', 'mutual consent', 'HMA 13B'], isFeatured: false, isSystem: true },
            { name: 'Lease Agreement', description: 'Commercial and residential lease agreement template', category: 'property', fields: 20, usageCount: 534, previewText: 'THIS LEASE AGREEMENT is made on this...', tags: ['lease', 'rent', 'commercial'], isFeatured: true, isSystem: true },
            { name: 'Consumer Complaint', description: 'Consumer complaint before District Consumer Forum under Consumer Protection Act 2019', category: 'civil', fields: 14, usageCount: 198, previewText: 'BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION...', tags: ['consumer', 'NCDRC', 'Consumer Protection Act'], isFeatured: false, isSystem: true },
            { name: 'Child Custody Petition', description: 'Petition for child custody under Guardians and Wards Act 1890', category: 'family', fields: 13, usageCount: 156, previewText: 'IN THE COURT OF DISTRICT JUDGE (FAMILY COURT)...', tags: ['custody', 'guardianship', 'family court'], isFeatured: false, isSystem: true },
        ];
        for (const tmpl of systemTemplates) {
            const entity = this.templatesRepo.create(tmpl);
            await this.templatesRepo.save(entity);
        }
        console.log(`  📋  Seeded ${systemTemplates.length} system templates`);
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map