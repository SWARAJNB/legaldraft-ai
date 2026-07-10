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
exports.LocksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const draft_lock_entity_1 = require("./entities/draft-lock.entity");
const LOCK_DURATION_MINUTES = 30;
let LocksService = class LocksService {
    constructor(locksRepo) {
        this.locksRepo = locksRepo;
    }
    async acquireLock(draftId, userId, userName) {
        await this.locksRepo.delete({ expiresAt: (0, typeorm_2.LessThan)(new Date()) });
        const existing = await this.locksRepo.findOne({ where: { draftId } });
        if (existing) {
            if (existing.userId === userId) {
                existing.expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
                return this.locksRepo.save(existing);
            }
            throw new common_1.ConflictException({
                message: 'Draft is currently being edited by another user',
                lockedBy: existing.userName,
                lockedAt: existing.acquiredAt,
                expiresAt: existing.expiresAt,
            });
        }
        const lock = this.locksRepo.create({
            draftId,
            userId,
            userName,
            expiresAt: new Date(Date.now() + LOCK_DURATION_MINUTES * 60000),
        });
        return this.locksRepo.save(lock);
    }
    async releaseLock(draftId, userId) {
        const lock = await this.locksRepo.findOne({ where: { draftId, userId } });
        if (!lock) {
            throw new common_1.NotFoundException('No active lock found for this draft');
        }
        await this.locksRepo.remove(lock);
        return { message: 'Lock released' };
    }
    async getLockStatus(draftId) {
        await this.locksRepo.delete({ expiresAt: (0, typeorm_2.LessThan)(new Date()) });
        const lock = await this.locksRepo.findOne({ where: { draftId } });
        return { locked: !!lock, lock: lock || null };
    }
};
exports.LocksService = LocksService;
exports.LocksService = LocksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(draft_lock_entity_1.DraftLock)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LocksService);
//# sourceMappingURL=locks.service.js.map