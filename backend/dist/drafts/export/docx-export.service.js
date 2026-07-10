"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxExportService = void 0;
const common_1 = require("@nestjs/common");
let DocxExportService = class DocxExportService {
    async generateFromText(content, title) {
        const PizZip = (await Promise.resolve().then(() => require('pizzip'))).default;
        const Docxtemplater = (await Promise.resolve().then(() => require('docxtemplater'))).default;
        const fs = await Promise.resolve().then(() => require('fs'));
        const path = await Promise.resolve().then(() => require('path'));
        const templatePath = path.join(__dirname, '..', '..', 'templates', 'blank.docx');
        let zip;
        try {
            const templateContent = fs.readFileSync(templatePath);
            zip = new PizZip(templateContent);
        }
        catch {
            return Buffer.from(content, 'utf-8');
        }
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        doc.render({
            title,
            content,
            date: new Date().toLocaleDateString('en-IN'),
        });
        return doc.getZip().generate({ type: 'nodebuffer' });
    }
    async generateFromTemplate(templateBuffer, data) {
        const PizZip = (await Promise.resolve().then(() => require('pizzip'))).default;
        const Docxtemplater = (await Promise.resolve().then(() => require('docxtemplater'))).default;
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        doc.render(data);
        return doc.getZip().generate({ type: 'nodebuffer' });
    }
    async detectPlaceholders(templateBuffer) {
        const PizZip = (await Promise.resolve().then(() => require('pizzip'))).default;
        const zip = new PizZip(templateBuffer);
        const xmlContent = zip.file('word/document.xml')?.asText() || '';
        const regex = /\{([^}]+)\}/g;
        const placeholders = [];
        let match;
        while ((match = regex.exec(xmlContent)) !== null) {
            const name = match[1].trim();
            if (name && !placeholders.includes(name)) {
                placeholders.push(name);
            }
        }
        return placeholders;
    }
};
exports.DocxExportService = DocxExportService;
exports.DocxExportService = DocxExportService = __decorate([
    (0, common_1.Injectable)()
], DocxExportService);
//# sourceMappingURL=docx-export.service.js.map