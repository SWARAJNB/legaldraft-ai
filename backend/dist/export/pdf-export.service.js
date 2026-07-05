"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const common_1 = require("@nestjs/common");
let PdfExportService = class PdfExportService {
    async generateFromText(content, title) {
        const lines = content.split('\n');
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
4 0 obj
<< /Length ${this.calculateStreamLength(title, lines)} >>
stream
BT
/F1 14 Tf
72 750 Td
(${this.escapeText(title)}) Tj
/F1 10 Tf
0 -30 Td
${lines.slice(0, 60).map((line) => `(${this.escapeText(line.slice(0, 80))}) Tj 0 -14 Td`).join('\n')}
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;
        return Buffer.from(pdfContent, 'utf-8');
    }
    escapeText(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/[^\x20-\x7E]/g, '');
    }
    calculateStreamLength(title, lines) {
        return 200 + title.length + lines.slice(0, 60).join('').length;
    }
};
exports.PdfExportService = PdfExportService;
exports.PdfExportService = PdfExportService = __decorate([
    (0, common_1.Injectable)()
], PdfExportService);
//# sourceMappingURL=pdf-export.service.js.map