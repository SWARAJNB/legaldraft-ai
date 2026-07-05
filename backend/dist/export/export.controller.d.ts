import { Response } from 'express';
import { DocxExportService } from './docx-export.service';
import { PdfExportService } from './pdf-export.service';
export declare class ExportController {
    private readonly docxExport;
    private readonly pdfExport;
    constructor(docxExport: DocxExportService, pdfExport: PdfExportService);
    exportDocx(draftId: string, res: Response): Promise<void>;
    exportPdf(draftId: string, res: Response): Promise<void>;
}
