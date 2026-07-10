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
const template_version_entity_1 = require("./entities/template-version.entity");
const files_service_1 = require("../files/files.service");
const gemini_provider_1 = require("../ai/providers/gemini.provider");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
let TemplatesService = class TemplatesService {
    constructor(templatesRepo, versionsRepo, filesService) {
        this.templatesRepo = templatesRepo;
        this.versionsRepo = versionsRepo;
        this.filesService = filesService;
    }
    async findAll(tenantId, search, category) {
        const query = this.templatesRepo.createQueryBuilder('t');
        query.where('(t.is_system = :isSystem OR t.tenant_id = :tenantId OR (t.is_shared = :isShared AND t.tenant_id IS NOT NULL))', {
            isSystem: true,
            tenantId: tenantId || 'default',
            isShared: true,
        });
        if (search) {
            query.andWhere('(t.name ILIKE :search OR t.description ILIKE :search)', { search: `%${search}%` });
        }
        if (category && category !== 'all') {
            query.andWhere('t.category = :category', { category });
        }
        query.orderBy('t.usageCount', 'DESC');
        return query.getMany();
    }
    async findById(id) {
        const template = await this.templatesRepo.findOne({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
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
    async uploadTemplate(tenantId, userId, file, name, description) {
        let extractedText = '';
        try {
            extractedText = await this.filesService.extractText(file.buffer, file.mimetype, file.originalname);
        }
        catch (err) {
            extractedText = `Template text extraction failed: ${err.message}`;
        }
        let category = 'other';
        let placeholders = [];
        if (extractedText && !extractedText.startsWith('Template text extraction failed')) {
            try {
                const gemini = new gemini_provider_1.GeminiProvider();
                const prompt = `You are a legal document automation AI. Analyze the following legal document template text.
Template Text:
"${extractedText.slice(0, 12000)}"

Tasks:
1. Automatically classify this template into one of: "criminal", "civil", "property", "family", "corporate", "employment", "other".
2. Identify all placeholders already in curly brackets (e.g. {{Party_Name}}) or brackets [e.g. [COURT_NAME]].
3. Identify additional plain text segments or fields that should become variables/placeholders (e.g. specific names, addresses, dates, or values that change per client/case).
4. For all identified and suggested placeholders, generate structured metadata:
   - name: camelCase, e.g. "complainantName", "filingDate".
   - label: Human-readable label, e.g. "Complainant Name", "Filing Date".
   - type: "text", "date", "number", "boolean", or "options".
   - required: true or false.
   - defaultValue: a sensible placeholder/default text, or empty.
   - description: what this placeholder represents.
   - options: string[] (if type is "options").

Return your analysis as a valid JSON object matching the schema below:
{
  "category": string,
  "placeholders": [
    {
      "name": string,
      "label": string,
      "type": "text" | "date" | "number" | "boolean" | "options",
      "required": boolean,
      "defaultValue": string,
      "description": string,
      "options": string[]
    }
  ]
}
Ensure the response is ONLY valid JSON.`;
                const responseText = await gemini.chat([
                    { role: 'user', content: prompt }
                ], { responseFormat: 'json' });
                const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
                const parsed = JSON.parse(cleanJson);
                category = parsed.category || 'other';
                placeholders = parsed.placeholders || [];
            }
            catch (err) {
                console.error('Gemini template analysis failed', err);
            }
        }
        const fileEntity = await this.filesService.upload(tenantId, 'templates', file.originalname, file.buffer, file.mimetype, userId);
        if (!fileEntity) {
            throw new common_1.BadRequestException('Template file upload failed');
        }
        const template = this.templatesRepo.create({
            name,
            description: description || 'Custom smart template',
            category,
            fields: placeholders.length,
            previewText: extractedText.slice(0, 2000),
            placeholders,
            fileId: fileEntity.id,
            tenantId,
            createdBy: userId,
            isSystem: false,
        });
        const saved = await this.templatesRepo.save(template);
        await this.createVersion(saved.id, fileEntity.id, template.previewText, placeholders, userId);
        return saved;
    }
    async savePlaceholders(templateId, placeholders, userId) {
        const template = await this.findById(templateId);
        template.placeholders = placeholders;
        template.fields = placeholders.length;
        const saved = await this.templatesRepo.save(template);
        await this.createVersion(saved.id, template.fileId, template.previewText, placeholders, userId);
        return saved;
    }
    async createVersion(templateId, fileId, previewText, placeholders, userId) {
        const lastVersion = await this.versionsRepo.findOne({
            where: { templateId },
            order: { versionNumber: 'DESC' },
        });
        const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
        const version = this.versionsRepo.create({
            templateId,
            versionNumber,
            fileId,
            previewText,
            placeholders,
            createdBy: userId,
        });
        return this.versionsRepo.save(version);
    }
    async getVersions(templateId) {
        return this.versionsRepo.find({
            where: { templateId },
            order: { versionNumber: 'DESC' },
        });
    }
    async restoreVersion(templateId, versionNumber, userId) {
        const template = await this.findById(templateId);
        const version = await this.versionsRepo.findOne({
            where: { templateId, versionNumber },
        });
        if (!version)
            throw new common_1.NotFoundException('Template version not found');
        template.fileId = version.fileId;
        template.previewText = version.previewText;
        template.placeholders = version.placeholders;
        template.fields = version.placeholders.length;
        const saved = await this.templatesRepo.save(template);
        await this.createVersion(saved.id, version.fileId, version.previewText, version.placeholders, userId);
        return saved;
    }
    async generateDraft(templateId, tenantId, userId, values) {
        const template = await this.findById(templateId);
        if (!template.fileId)
            throw new common_1.BadRequestException('Template does not have a linked document file');
        const { buffer: fileBuffer } = await this.filesService.downloadContent(template.fileId);
        let outputBuffer;
        try {
            const zip = new PizZip(fileBuffer);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            doc.render(values);
            outputBuffer = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });
        }
        catch (err) {
            throw new common_1.BadRequestException(`Document compilation error: ${err.message}`);
        }
        const filename = `${template.name.replace(/\s+/g, '_')}_Draft_${new Date().toISOString().split('T')[0]}.docx`;
        const draftFile = await this.filesService.upload(tenantId, 'drafts', filename, outputBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', userId);
        template.usageCount += 1;
        template.lastUsed = new Date();
        await this.templatesRepo.save(template);
        return draftFile;
    }
    async askInterviewQuestion(templateId, answers, currentPlaceholder) {
        const template = await this.findById(templateId);
        const placeholders = template.placeholders || [];
        const nextPlaceholder = placeholders.find((p) => answers[p.name] === undefined);
        if (!nextPlaceholder) {
            return { isFinished: true, nextPlaceholder: null, question: '' };
        }
        let question = `Please provide the value for ${nextPlaceholder.label}.`;
        try {
            const gemini = new gemini_provider_1.GeminiProvider();
            const prompt = `You are a helpful, conversational legal assistant. The user is filling out a template named "${template.name}".
The next field we need from them is:
Label: "${nextPlaceholder.label}"
Description: "${nextPlaceholder.description || 'No description provided'}"
Field Type: "${nextPlaceholder.type}"

Generate a single polite, conversational question asking the user for this information. Keep it brief. Do not output anything else.`;
            const response = await gemini.chat([
                { role: 'user', content: prompt }
            ]);
            if (response && response.trim()) {
                question = response.trim();
            }
        }
        catch (err) {
            console.error('Gemini question generation failed', err);
        }
        return {
            isFinished: false,
            nextPlaceholder,
            question,
        };
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
            { name: 'Bail Application', description: 'Standard bail application for sessions court under CrPC Section 439', category: 'criminal', fields: 12, usageCount: 847, previewText: 'IN THE COURT OF SESSIONS JUDGE...', tags: ['bail', 'sessions court', 'CrPC 439'], isFeatured: true, isSystem: true, placeholders: [] },
            { name: 'FIR Quashing Petition', description: 'Petition to quash FIR under Section 482 CrPC before High Court', category: 'criminal', fields: 15, usageCount: 423, previewText: 'IN THE HIGH COURT OF JUDICATURE...', tags: ['FIR', 'quashing', '482 CrPC', 'High Court'], isFeatured: false, isSystem: true, placeholders: [] },
            { name: 'Civil Suit Plaint', description: 'Standard plaint for civil suits including money recovery and injunctions', category: 'civil', fields: 18, usageCount: 612, previewText: 'IN THE COURT OF CIVIL JUDGE...', tags: ['civil suit', 'plaint', 'CPC'], isFeatured: true, isSystem: true, placeholders: [] },
            { name: 'Property Sale Agreement', description: 'Comprehensive sale deed for residential and commercial property transactions', category: 'property', fields: 22, usageCount: 389, previewText: 'THIS AGREEMENT OF SALE is made and entered into...', tags: ['sale deed', 'property', 'real estate'], isFeatured: true, isSystem: true, placeholders: [] },
            { name: 'Divorce Petition (Mutual)', description: 'Mutual consent divorce petition under Section 13B Hindu Marriage Act', category: 'family', fields: 16, usageCount: 267, previewText: 'IN THE COURT OF FAMILY JUDGE...', tags: ['divorce', 'mutual consent', 'HMA 13B'], isFeatured: false, isSystem: true, placeholders: [] },
            { name: 'Lease Agreement', description: 'Commercial and residential lease agreement template', category: 'property', fields: 20, usageCount: 534, previewText: 'THIS LEASE AGREEMENT is made on this...', tags: ['lease', 'rent', 'commercial'], isFeatured: true, isSystem: true, placeholders: [] },
        ];
        for (const tmpl of systemTemplates) {
            const entity = this.templatesRepo.create(tmpl);
            await this.templatesRepo.save(entity);
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __param(1, (0, typeorm_1.InjectRepository)(template_version_entity_1.TemplateVersion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map