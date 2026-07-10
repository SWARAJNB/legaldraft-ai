"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
const file_entity_1 = require("./entities/file.entity");
const file_version_entity_1 = require("./entities/file-version.entity");
const file_intelligence_entity_1 = require("./entities/file-intelligence.entity");
const document_processing_services_1 = require("./document-processing/document-processing.services");
const rag_module_1 = require("../rag/rag.module");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                file_entity_1.FileEntity,
                file_version_entity_1.FileVersion,
                file_intelligence_entity_1.FileIntelligenceEntity,
            ]),
            platform_express_1.MulterModule.register({
                storage: undefined,
                limits: { fileSize: 15 * 1024 * 1024 },
            }),
            rag_module_1.RagModule,
        ],
        controllers: [files_controller_1.FilesController],
        providers: [
            files_service_1.FilesService,
            document_processing_services_1.PdfParseService,
            document_processing_services_1.DocxParseService,
            document_processing_services_1.OcrService,
            document_processing_services_1.DocumentMetadataService,
        ],
        exports: [files_service_1.FilesService],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map