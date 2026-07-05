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
exports.FileVersion = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileVersion = class FileVersion {
};
exports.FileVersion = FileVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid' }),
    __metadata("design:type", String)
], FileVersion.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version_number', type: 'int' }),
    __metadata("design:type", Number)
], FileVersion.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_key', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], FileVersion.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'int' }),
    __metadata("design:type", Number)
], FileVersion.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], FileVersion.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.FileEntity, (file) => file.versions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.FileEntity)
], FileVersion.prototype, "file", void 0);
exports.FileVersion = FileVersion = __decorate([
    (0, typeorm_1.Entity)('file_versions')
], FileVersion);
//# sourceMappingURL=file-version.entity.js.map