"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const document_processing_services_1 = require("./document-processing.services");
let DocumentProcessingModule = class DocumentProcessingModule {
};
exports.DocumentProcessingModule = DocumentProcessingModule;
exports.DocumentProcessingModule = DocumentProcessingModule = __decorate([
    (0, common_1.Module)({
        providers: [document_processing_services_1.PdfParseService, document_processing_services_1.DocxParseService, document_processing_services_1.OcrService, document_processing_services_1.DocumentMetadataService],
        exports: [document_processing_services_1.PdfParseService, document_processing_services_1.DocxParseService, document_processing_services_1.OcrService, document_processing_services_1.DocumentMetadataService],
    })
], DocumentProcessingModule);
//# sourceMappingURL=document-processing.module.js.map