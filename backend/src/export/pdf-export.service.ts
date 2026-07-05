import { Injectable } from '@nestjs/common';

/**
 * PDF export service.
 * Uses LibreOffice headless (Docker) or fallback text-based PDF.
 */
@Injectable()
export class PdfExportService {
  async generateFromText(content: string, title: string): Promise<Buffer> {
    // Simple text-to-PDF generator (fallback when LibreOffice is unavailable)
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

  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable chars
  }

  private calculateStreamLength(title: string, lines: string[]): number {
    // Approximate length
    return 200 + title.length + lines.slice(0, 60).join('').length;
  }
}
