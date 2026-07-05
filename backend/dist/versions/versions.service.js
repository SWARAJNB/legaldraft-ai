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
exports.VersionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const draft_version_entity_1 = require("./entities/draft-version.entity");
let VersionsService = class VersionsService {
    constructor(versionsRepo) {
        this.versionsRepo = versionsRepo;
    }
    async findByDraftId(draftId) {
        return this.versionsRepo.find({
            where: { draftId },
            order: { versionNumber: 'DESC' },
        });
    }
    async createVersion(draftId, content, savedBy, changeNote) {
        const lastVersion = await this.versionsRepo.findOne({
            where: { draftId },
            order: { versionNumber: 'DESC' },
        });
        const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 1;
        const version = this.versionsRepo.create({
            draftId,
            versionNumber: nextVersion,
            content,
            savedBy,
            changeNote: changeNote || `Version ${nextVersion}`,
        });
        return this.versionsRepo.save(version);
    }
    async restore(draftId, versionId, savedBy) {
        const version = await this.versionsRepo.findOne({ where: { id: versionId, draftId } });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        return this.createVersion(draftId, version.content, savedBy, `Restored from version ${version.versionNumber}`);
    }
    async compareVersions(draftId, versionA, versionB) {
        const a = await this.versionsRepo.findOne({ where: { id: versionA, draftId } });
        const b = await this.versionsRepo.findOne({ where: { id: versionB, draftId } });
        if (!a || !b)
            throw new common_1.NotFoundException('Version not found');
        return { versionA: a, versionB: b };
    }
};
exports.VersionsService = VersionsService;
exports.VersionsService = VersionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(draft_version_entity_1.DraftVersion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VersionsService);
//# sourceMappingURL=versions.service.js.map