import { Module } from '@nestjs/common';
import {
  PdfParseService,
  DocxParseService,
  OcrService,
  DocumentMetadataService,
} from './document-processing.services';

@Module({
  providers: [PdfParseService, DocxParseService, OcrService, DocumentMetadataService],
  exports: [PdfParseService, DocxParseService, OcrService, DocumentMetadataService],
})
export class DocumentProcessingModule {}
