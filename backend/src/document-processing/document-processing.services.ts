import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfParseService {
  private readonly logger = new Logger(PdfParseService.name);

  async extractText(buffer: Buffer): Promise<string> {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    this.logger.log(`Extracted ${result.text.length} chars from PDF (${result.numpages} pages)`);
    return result.text;
  }
}

@Injectable()
export class DocxParseService {
  private readonly logger = new Logger(DocxParseService.name);

  async extractText(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    this.logger.log(`Extracted ${result.value.length} chars from DOCX`);
    return result.value;
  }

  async extractHtml(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  }
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    this.logger.log(`OCR extracted ${data.text.length} chars from image`);
    return data.text;
  }
}

@Injectable()
export class DocumentMetadataService {
  /**
   * Extract entities from parsed text using regex patterns.
   */
  extractEntities(text: string): {
    caseNumbers: string[];
    dates: string[];
    legalSections: string[];
    parties: string[];
  } {
    const caseNumbers = [
      ...new Set(
        (text.match(/(?:CAS|FIR|CRL\.?|CIV\.?|WP|SLP|MA)[\s\-\.]*(?:No\.?\s*)?[\d\/\-]+(?:\/\d{4})?/gi) || []),
      ),
    ];

    const dates = [
      ...new Set(
        (text.match(/\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}/g) || []),
      ),
    ];

    const legalSections = [
      ...new Set(
        (text.match(/(?:Section|Sec\.?|S\.?)\s*\d+[A-Za-z]?(?:\s*(?:read with|r\/w|and|,)\s*(?:Section|Sec\.?|S\.?)\s*\d+[A-Za-z]?)*/gi) || []),
      ),
    ];

    // Basic party extraction (names between "vs" or "versus")
    const parties: string[] = [];
    const vsMatch = text.match(/([A-Z][a-zA-Z\s\.]+)\s+(?:vs\.?|versus|v\.)\s+([A-Z][a-zA-Z\s\.]+)/);
    if (vsMatch) {
      parties.push(vsMatch[1].trim(), vsMatch[2].trim());
    }

    return { caseNumbers, dates, legalSections, parties };
  }
}
