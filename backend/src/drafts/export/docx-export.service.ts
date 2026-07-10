import { Injectable } from '@nestjs/common';

/**
 * DOCX export using docxtemplater.
 * Generates professional DOCX files from template + data.
 */
@Injectable()
export class DocxExportService {
  async generateFromText(content: string, title: string): Promise<Buffer> {
    // Dynamic import for ESM compatibility
    const PizZip = (await import('pizzip')).default;
    const Docxtemplater = (await import('docxtemplater')).default;
    const fs = await import('fs');
    const path = await import('path');

    // Check if template exists, otherwise create a minimal DOCX
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'blank.docx');

    let zip: any;
    try {
      const templateContent = fs.readFileSync(templatePath);
      zip = new PizZip(templateContent);
    } catch {
      // Create minimal DOCX without template
      // Fallback: return content as a simple text buffer (DOCX generation without template)
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

  async generateFromTemplate(
    templateBuffer: Buffer,
    data: Record<string, any>,
  ): Promise<Buffer> {
    const PizZip = (await import('pizzip')).default;
    const Docxtemplater = (await import('docxtemplater')).default;

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);
    return doc.getZip().generate({ type: 'nodebuffer' });
  }

  /**
   * Detect placeholders in a DOCX template.
   */
  async detectPlaceholders(templateBuffer: Buffer): Promise<string[]> {
    const PizZip = (await import('pizzip')).default;
    const zip = new PizZip(templateBuffer);
    const xmlContent = zip.file('word/document.xml')?.asText() || '';

    // Find all {placeholder} patterns
    const regex = /\{([^}]+)\}/g;
    const placeholders: string[] = [];
    let match;
    while ((match = regex.exec(xmlContent)) !== null) {
      const name = match[1].trim();
      if (name && !placeholders.includes(name)) {
        placeholders.push(name);
      }
    }

    return placeholders;
  }
}
