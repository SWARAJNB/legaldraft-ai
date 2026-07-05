"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PdfParseService_1, DocxParseService_1, OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentMetadataService = exports.OcrService = exports.DocxParseService = exports.PdfParseService = void 0;
const common_1 = require("@nestjs/common");
let PdfParseService = PdfParseService_1 = class PdfParseService {
    constructor() {
        this.logger = new common_1.Logger(PdfParseService_1.name);
    }
    async extractText(buffer) {
        const pdfParse = (await Promise.resolve().then(() => require('pdf-parse'))).default;
        const result = await pdfParse(buffer);
        this.logger.log(`Extracted ${result.text.length} chars from PDF (${result.numpages} pages)`);
        return result.text;
    }
};
exports.PdfParseService = PdfParseService;
exports.PdfParseService = PdfParseService = PdfParseService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfParseService);
let DocxParseService = DocxParseService_1 = class DocxParseService {
    constructor() {
        this.logger = new common_1.Logger(DocxParseService_1.name);
    }
    async extractText(buffer) {
        const mammoth = await Promise.resolve().then(() => require('mammoth'));
        const result = await mammoth.extractRawText({ buffer });
        this.logger.log(`Extracted ${result.value.length} chars from DOCX`);
        return result.value;
    }
    async extractHtml(buffer) {
        const mammoth = await Promise.resolve().then(() => require('mammoth'));
        const result = await mammoth.convertToHtml({ buffer });
        return result.value;
    }
};
exports.DocxParseService = DocxParseService;
exports.DocxParseService = DocxParseService = DocxParseService_1 = __decorate([
    (0, common_1.Injectable)()
], DocxParseService);
let OcrService = OcrService_1 = class OcrService {
    constructor() {
        this.logger = new common_1.Logger(OcrService_1.name);
    }
    async extractText(buffer, mimeType) {
        const { createWorker } = await Promise.resolve().then(() => require('tesseract.js'));
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(buffer);
        await worker.terminate();
        this.logger.log(`OCR extracted ${data.text.length} chars from image`);
        return data.text;
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
let DocumentMetadataService = class DocumentMetadataService {
    extractEntities(text) {
        const caseNumbers = [
            ...new Set((text.match(/(?:CAS|FIR|CRL\.?|CIV\.?|WP|SLP|MA)[\s\-\.]*(?:No\.?\s*)?[\d\/\-]+(?:\/\d{4})?/gi) || [])),
        ];
        const dates = [
            ...new Set((text.match(/\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}/g) || [])),
        ];
        const legalSections = [
            ...new Set((text.match(/(?:Section|Sec\.?|S\.?)\s*\d+[A-Za-z]?(?:\s*(?:read with|r\/w|and|,)\s*(?:Section|Sec\.?|S\.?)\s*\d+[A-Za-z]?)*/gi) || [])),
        ];
        const parties = [];
        const vsMatch = text.match(/([A-Z][a-zA-Z\s\.]+)\s+(?:vs\.?|versus|v\.)\s+([A-Z][a-zA-Z\s\.]+)/);
        if (vsMatch) {
            parties.push(vsMatch[1].trim(), vsMatch[2].trim());
        }
        return { caseNumbers, dates, legalSections, parties };
    }
};
exports.DocumentMetadataService = DocumentMetadataService;
exports.DocumentMetadataService = DocumentMetadataService = __decorate([
    (0, common_1.Injectable)()
], DocumentMetadataService);
//# sourceMappingURL=document-processing.services.js.map