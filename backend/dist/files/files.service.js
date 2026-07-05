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
const local_provider_1 = require("./storage/local.provider");
const s3_provider_1 = require("./storage/s3.provider");
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
    ],
};
let FilesService = class FilesService {
    constructor(filesRepo, versionsRepo) {
        this.filesRepo = filesRepo;
        this.versionsRepo = versionsRepo;
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
        if (!ALLOWED_CATEGORIES[category].includes(contentType)) {
            throw new common_1.BadRequestException(`File format '${contentType}' is not permitted for category '${category}'.`);
        }
    }
    async upload(tenantId, category, filename, content, contentType, uploadedBy) {
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
        if (existing) {
            const lastVersion = await this.versionsRepo.findOne({
                where: { fileId: existing.id },
                order: { versionNumber: 'DESC' },
            });
            const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 2;
            existing.fileSize = fileSize;
            existing.s3Key = s3Key;
            existing.uploadedBy = uploadedBy;
            await this.filesRepo.save(existing);
            const version = this.versionsRepo.create({
                fileId: existing.id,
                versionNumber: nextVersion,
                s3Key,
                fileSize,
                uploadedBy,
            });
            await this.versionsRepo.save(version);
            return this.filesRepo.findOne({
                where: { id: existing.id },
                relations: ['versions'],
            });
        }
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
        await this.filesRepo.save(newFile);
        const v1 = this.versionsRepo.create({
            fileId: newFile.id,
            versionNumber: 1,
            s3Key,
            fileSize,
            uploadedBy,
        });
        await this.versionsRepo.save(v1);
        return this.filesRepo.findOne({
            where: { id: newFile.id },
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map