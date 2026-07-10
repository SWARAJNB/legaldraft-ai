import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { FileIntelligenceEntity } from './entities/file-intelligence.entity';
import {
  PdfParseService,
  DocxParseService,
  OcrService,
  DocumentMetadataService,
} from './document-processing/document-processing.services';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileEntity,
      FileVersion,
      FileIntelligenceEntity,
    ]),
    MulterModule.register({
      storage: undefined,
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
    RagModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    PdfParseService,
    DocxParseService,
    OcrService,
    DocumentMetadataService,
  ],
  exports: [FilesService],
})
export class FilesModule {}
