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
exports.FileEntity = void 0;
const typeorm_1 = require("typeorm");
const file_version_entity_1 = require("./file-version.entity");
let FileEntity = class FileEntity {
};
exports.FileEntity = FileEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], FileEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], FileEntity.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], FileEntity.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_type', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], FileEntity.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'int' }),
    __metadata("design:type", Number)
], FileEntity.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_key', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], FileEntity.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bucket_name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], FileEntity.prototype, "bucketName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], FileEntity.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => file_version_entity_1.FileVersion, (version) => version.file, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], FileEntity.prototype, "versions", void 0);
exports.FileEntity = FileEntity = __decorate([
    (0, typeorm_1.Entity)('files')
], FileEntity);
//# sourceMappingURL=file.entity.js.map