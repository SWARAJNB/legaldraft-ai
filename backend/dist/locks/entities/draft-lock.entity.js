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
exports.DraftLock = void 0;
const typeorm_1 = require("typeorm");
let DraftLock = class DraftLock {
};
exports.DraftLock = DraftLock;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'draft_id', type: 'uuid' }),
    __metadata("design:type", String)
], DraftLock.prototype, "draftId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], DraftLock.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], DraftLock.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'acquired_at' }),
    __metadata("design:type", Date)
], DraftLock.prototype, "acquiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DraftLock.prototype, "expiresAt", void 0);
exports.DraftLock = DraftLock = __decorate([
    (0, typeorm_1.Entity)('draft_locks')
], DraftLock);
//# sourceMappingURL=draft-lock.entity.js.map