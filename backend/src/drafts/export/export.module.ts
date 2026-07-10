import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { DocxExportService } from './docx-export.service';
import { PdfExportService } from './pdf-export.service';

@Module({
  controllers: [ExportController],
  providers: [DocxExportService, PdfExportService],
  exports: [DocxExportService, PdfExportService],
})
export class ExportModule {}
