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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
const file_version_entity_1 = require("./entities/file-version.entity");
const file_intelligence_entity_1 = require("./entities/file-intelligence.entity");
const local_provider_1 = require("./storage/local.provider");
const s3_provider_1 = require("./storage/s3.provider");
const document_processing_services_1 = require("./document-processing/document-processing.services");
const gemini_provider_1 = require("../ai/providers/gemini.provider");
const rag_service_1 = require("../rag/rag.service");
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_CATEGORIES = {
    templates: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    drafts: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ],
    exports: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
    ],
    'profile-images': ['image/jpeg', 'image/png', 'image/gif'],
    attachments: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain',
    ],
};
let FilesService = class FilesService {
    constructor(filesRepo, versionsRepo, intelligenceRepo, pdfParse, docxParse, ocrService, ragService) {
        this.filesRepo = filesRepo;
        this.versionsRepo = versionsRepo;
        this.intelligenceRepo = intelligenceRepo;
        this.pdfParse = pdfParse;
        this.docxParse = docxParse;
        this.ocrService = ocrService;
        this.ragService = ragService;
    }
    onModuleInit() {
        const mode = (process.env.STORAGE_MODE || 'local').toLowerCase();
        this.storage =
            mode === 's3' ? new s3_provider_1.S3StorageProvider() : new local_provider_1.LocalStorageProvider();
        console.log(`  📦  Storage provider: ${mode.toUpperCase()}`);
    }
    validateFile(originalName, contentType, fileSize, category) {
        if (fileSize > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed limit of 15MB. Provided: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
        }
        if (!ALLOWED_CATEGORIES[category]) {
            throw new common_1.BadRequestException(`Invalid file category '${category}'. Must be one of: ${Object.keys(ALLOWED_CATEGORIES).join(', ')}`);
        }
        const normalized = contentType.split(';')[0].trim();
        if (!ALLOWED_CATEGORIES[category].includes(normalized)) {
            throw new common_1.BadRequestException(`File format '${contentType}' is not permitted for category '${category}'.`);
        }
    }
    async extractText(buffer, mimeType, filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const normalizedMime = mimeType.split(';')[0].trim();
        if (normalizedMime === 'application/pdf' || ext === 'pdf') {
            return this.pdfParse.extractText(buffer);
        }
        else if (normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            ext === 'docx') {
            return this.docxParse.extractText(buffer);
        }
        else if (normalizedMime === 'text/plain' || ext === 'txt') {
            return buffer.toString('utf-8');
        }
        else if (['image/png', 'image/jpeg', 'image/jpg'].includes(normalizedMime) ||
            ['png', 'jpg', 'jpeg'].includes(ext || '')) {
            return this.ocrService.extractText(buffer, normalizedMime);
        }
        return '';
    }
    async runFileIntelligence(fileId, content, contentType, filename, workspaceId, clientId, caseId, conversationId) {
        let extractedText = '';
        try {
            extractedText = await this.extractText(content, contentType, filename);
        }
        catch (err) {
            console.error(`Text extraction failed for ${filename}`, err);
            extractedText = `Text extraction failed: ${err.message}`;
        }
        let intel = {
            classification: 'Other',
            documentTitle: filename,
            parties: '[]',
            importantDates: '[]',
            clauseHeadings: '[]',
            shortSummary: 'No summary available.',
            detailedSummary: 'No detailed summary available.',
            keywords: '[]',
            tags: '[]',
        };
        if (extractedText && !extractedText.startsWith('Text extraction failed')) {
            try {
                const gemini = new gemini_provider_1.GeminiProvider();
                const prompt = `You are a legal document AI intelligence engine. Analyze the following document text and return a valid JSON object matching the schema below.
Extracted Text:
"${extractedText.slice(0, 15000)}"

JSON Schema:
{
  "classification": "Agreement" | "Contract" | "Legal Notice" | "Affidavit" | "Petition" | "Court Order" | "Evidence" | "Other",
  "documentTitle": string,
  "parties": string[],
  "importantDates": string[] (dates with context, e.g. ["2026-05-12 (Filing Date)"]),
  "clauseHeadings": string[],
  "shortSummary": string,
  "detailedSummary": string,
  "keywords": string[],
  "tags": string[]
}
Ensure the output is ONLY valid JSON, with no markdown tags or trailing symbols outside the JSON.`;
                const responseText = await gemini.chat([
                    { role: 'user', content: prompt }
                ], { responseFormat: 'json' });
                const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
                const parsed = JSON.parse(cleanJson);
                intel = {
                    classification: parsed.classification || 'Other',
                    documentTitle: parsed.documentTitle || filename,
                    parties: JSON.stringify(parsed.parties || []),
                    importantDates: JSON.stringify(parsed.importantDates || []),
                    clauseHeadings: JSON.stringify(parsed.clauseHeadings || []),
                    shortSummary: parsed.shortSummary || 'No summary available.',
                    detailedSummary: parsed.detailedSummary || 'No detailed summary available.',
                    keywords: JSON.stringify(parsed.keywords || []),
                    tags: JSON.stringify(parsed.tags || []),
                };
            }
            catch (err) {
                console.error(`Gemini intelligence extraction failed for ${filename}`, err);
            }
        }
        const intelEntity = this.intelligenceRepo.create({
            fileId,
            workspaceId,
            clientId,
            caseId,
            conversationId,
            classification: intel.classification,
            documentTitle: intel.documentTitle,
            parties: intel.parties,
            importantDates: intel.importantDates,
            clauseHeadings: intel.clauseHeadings,
            shortSummary: intel.shortSummary,
            detailedSummary: intel.detailedSummary,
            keywords: intel.keywords,
            tags: intel.tags,
            extractedText,
        });
        return this.intelligenceRepo.save(intelEntity);
    }
    async getIntelligence(fileId) {
        const intel = await this.intelligenceRepo.findOne({
            where: { fileId },
        });
        if (!intel) {
            throw new common_1.NotFoundException('File intelligence metadata not found');
        }
        return intel;
    }
    async upload(tenantId, category, filename, content, contentType, uploadedBy, workspaceId, clientId, caseId, conversationId) {
        const fileSize = content.length;
        this.validateFile(filename, contentType, fileSize, category);
        const s3Key = await this.storage.uploadFile(tenantId, category, filename, content);
        const existing = await this.filesRepo.findOne({
            where: {
                tenantId,
                fileName: filename,
                fileType: contentType,
            },
            relations: ['versions'],
        });
        let savedFile;
        if (existing) {
            const lastVersion = await this.versionsRepo.findOne({
                where: { fileId: existing.id },
                order: { versionNumber: 'DESC' },
            });
            const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 2;
            existing.fileSize = fileSize;
            existing.s3Key = s3Key;
            existing.uploadedBy = uploadedBy;
            savedFile = await this.filesRepo.save(existing);
            const version = this.versionsRepo.create({
                fileId: existing.id,
                versionNumber: nextVersion,
                s3Key,
                fileSize,
                uploadedBy,
            });
            await this.versionsRepo.save(version);
        }
        else {
            const newFile = this.filesRepo.create({
                tenantId,
                fileName: filename,
                originalName: filename,
                fileType: contentType,
                fileSize,
                s3Key,
                bucketName: this.storage.bucketName || 'local-disk',
                uploadedBy,
            });
            savedFile = await this.filesRepo.save(newFile);
            const v1 = this.versionsRepo.create({
                fileId: newFile.id,
                versionNumber: 1,
                s3Key,
                fileSize,
                uploadedBy,
            });
            await this.versionsRepo.save(v1);
        }
        try {
            const intel = await this.runFileIntelligence(savedFile.id, content, contentType, filename, workspaceId, clientId, caseId, conversationId);
            await this.ragService.indexDocument({
                fileId: savedFile.id,
                tenantId,
                documentName: savedFile.originalName || filename,
                text: intel.extractedText || '',
                workspaceId,
                caseId,
            });
        }
        catch (err) {
            console.error('File intelligence extraction or RAG indexing failed', err);
        }
        return this.filesRepo.findOne({
            where: { id: savedFile.id },
            relations: ['versions'],
        });
    }
    async findByTenant(tenantId) {
        return this.filesRepo.find({
            where: { tenantId },
            relations: ['versions'],
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const file = await this.filesRepo.findOne({
            where: { id },
            relations: ['versions'],
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async delete(id) {
        const file = await this.findById(id);
        await this.storage.deleteFile(file.s3Key);
        await this.ragService.deleteDocumentVectors(file.id, {
            tenantId: file.tenantId,
        });
        await this.filesRepo.remove(file);
        return { message: `File ${file.originalName} has been deleted.` };
    }
    async getDownloadUrl(id) {
        const file = await this.findById(id);
        const url = await this.storage.getPresignedDownloadUrl(file.s3Key);
        return { download_url: url };
    }
    async getPresignedUploadUrl(tenantId, category, filename, expiresIn = 3600) {
        if (!ALLOWED_CATEGORIES[category]) {
            throw new common_1.BadRequestException(`Invalid category: ${category}`);
        }
        return this.storage.getPresignedUploadUrl(tenantId, category, filename, expiresIn);
    }
    async downloadContent(id) {
        const file = await this.findById(id);
        const buffer = await this.storage.downloadFile(file.s3Key);
        return { buffer, file };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.FileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(file_version_entity_1.FileVersion)),
    __param(2, (0, typeorm_1.InjectRepository)(file_intelligence_entity_1.FileIntelligenceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        document_processing_services_1.PdfParseService,
        document_processing_services_1.DocxParseService,
        document_processing_services_1.OcrService,
        rag_service_1.RagService])
], FilesService);
//# sourceMappingURL=files.service.js.map