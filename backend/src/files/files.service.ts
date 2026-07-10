import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { FileIntelligenceEntity } from './entities/file-intelligence.entity';
import { StorageProvider } from './storage/storage.interface';
import { LocalStorageProvider } from './storage/local.provider';
import { S3StorageProvider } from './storage/s3.provider';
import {
  PdfParseService,
  DocxParseService,
  OcrService,
} from './document-processing/document-processing.services';
import { GeminiProvider } from '../ai/providers/gemini.provider';
import { RagService } from '../rag/rag.service';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_CATEGORIES: Record<string, string[]> = {
  templates: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  drafts: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  exports: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ],
  'profile-images': ['image/jpeg', 'image/png', 'image/gif'],
  attachments: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain',
  ],
};

@Injectable()
export class FilesService implements OnModuleInit {
  private storage: StorageProvider;

  constructor(
    @InjectRepository(FileEntity)
    private filesRepo: Repository<FileEntity>,
    @InjectRepository(FileVersion)
    private versionsRepo: Repository<FileVersion>,
    @InjectRepository(FileIntelligenceEntity)
    private intelligenceRepo: Repository<FileIntelligenceEntity>,
    private pdfParse: PdfParseService,
    private docxParse: DocxParseService,
    private ocrService: OcrService,
    private ragService: RagService,
  ) {}

  onModuleInit() {
    const mode = (process.env.STORAGE_MODE || 'local').toLowerCase();
    this.storage =
      mode === 's3' ? new S3StorageProvider() : new LocalStorageProvider();
    console.log(`  📦  Storage provider: ${mode.toUpperCase()}`);
  }

  private validateFile(
    originalName: string,
    contentType: string,
    fileSize: number,
    category: string,
  ) {
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed limit of 15MB. Provided: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
      );
    }

    if (!ALLOWED_CATEGORIES[category]) {
      throw new BadRequestException(
        `Invalid file category '${category}'. Must be one of: ${Object.keys(ALLOWED_CATEGORIES).join(', ')}`,
      );
    }

    // Clean standard mime types check
    const normalized = contentType.split(';')[0].trim();
    if (!ALLOWED_CATEGORIES[category].includes(normalized)) {
      throw new BadRequestException(
        `File format '${contentType}' is not permitted for category '${category}'.`,
      );
    }
  }

  async extractText(
    buffer: Buffer,
    mimeType: string,
    filename: string,
  ): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase();
    const normalizedMime = mimeType.split(';')[0].trim();

    if (normalizedMime === 'application/pdf' || ext === 'pdf') {
      return this.pdfParse.extractText(buffer);
    } else if (
      normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      return this.docxParse.extractText(buffer);
    } else if (normalizedMime === 'text/plain' || ext === 'txt') {
      return buffer.toString('utf-8');
    } else if (
      ['image/png', 'image/jpeg', 'image/jpg'].includes(normalizedMime) ||
      ['png', 'jpg', 'jpeg'].includes(ext || '')
    ) {
      return this.ocrService.extractText(buffer, normalizedMime);
    }

    return '';
  }

  async runFileIntelligence(
    fileId: string,
    content: Buffer,
    contentType: string,
    filename: string,
    workspaceId?: string,
    clientId?: string,
    caseId?: string,
    conversationId?: string,
  ): Promise<FileIntelligenceEntity> {
    let extractedText = '';
    try {
      extractedText = await this.extractText(content, contentType, filename);
    } catch (err) {
      console.error(`Text extraction failed for ${filename}`, err);
      extractedText = `Text extraction failed: ${err.message}`;
    }

    let intel = {
      classification: 'Other',
      documentTitle: filename,
      parties: '[]',
      importantDates: '[]',
      clauseHeadings: '[]',
      shortSummary: 'No summary available.',
      detailedSummary: 'No detailed summary available.',
      keywords: '[]',
      tags: '[]',
    };

    if (extractedText && !extractedText.startsWith('Text extraction failed')) {
      try {
        const gemini = new GeminiProvider();
        const prompt = `You are a legal document AI intelligence engine. Analyze the following document text and return a valid JSON object matching the schema below.
Extracted Text:
"${extractedText.slice(0, 15000)}"

JSON Schema:
{
  "classification": "Agreement" | "Contract" | "Legal Notice" | "Affidavit" | "Petition" | "Court Order" | "Evidence" | "Other",
  "documentTitle": string,
  "parties": string[],
  "importantDates": string[] (dates with context, e.g. ["2026-05-12 (Filing Date)"]),
  "clauseHeadings": string[],
  "shortSummary": string,
  "detailedSummary": string,
  "keywords": string[],
  "tags": string[]
}
Ensure the output is ONLY valid JSON, with no markdown tags or trailing symbols outside the JSON.`;

        const responseText = await gemini.chat([
          { role: 'user', content: prompt }
        ], { responseFormat: 'json' });

        const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        intel = {
          classification: parsed.classification || 'Other',
          documentTitle: parsed.documentTitle || filename,
          parties: JSON.stringify(parsed.parties || []),
          importantDates: JSON.stringify(parsed.importantDates || []),
          clauseHeadings: JSON.stringify(parsed.clauseHeadings || []),
          shortSummary: parsed.shortSummary || 'No summary available.',
          detailedSummary: parsed.detailedSummary || 'No detailed summary available.',
          keywords: JSON.stringify(parsed.keywords || []),
          tags: JSON.stringify(parsed.tags || []),
        };
      } catch (err) {
        console.error(`Gemini intelligence extraction failed for ${filename}`, err);
      }
    }

    const intelEntity = this.intelligenceRepo.create({
      fileId,
      workspaceId,
      clientId,
      caseId,
      conversationId,
      classification: intel.classification,
      documentTitle: intel.documentTitle,
      parties: intel.parties,
      importantDates: intel.importantDates,
      clauseHeadings: intel.clauseHeadings,
      shortSummary: intel.shortSummary,
      detailedSummary: intel.detailedSummary,
      keywords: intel.keywords,
      tags: intel.tags,
      extractedText,
    });

    return this.intelligenceRepo.save(intelEntity);
  }

  async getIntelligence(fileId: string): Promise<FileIntelligenceEntity> {
    const intel = await this.intelligenceRepo.findOne({
      where: { fileId },
    });
    if (!intel) {
      throw new NotFoundException('File intelligence metadata not found');
    }
    return intel;
  }

  async upload(
    tenantId: string,
    category: string,
    filename: string,
    content: Buffer,
    contentType: string,
    uploadedBy: string,
    workspaceId?: string,
    clientId?: string,
    caseId?: string,
    conversationId?: string,
  ) {
    const fileSize = content.length;
    this.validateFile(filename, contentType, fileSize, category);

    const s3Key = await this.storage.uploadFile(
      tenantId,
      category,
      filename,
      content,
    );

    // Check for existing file
    const existing = await this.filesRepo.findOne({
      where: {
        tenantId,
        fileName: filename,
        fileType: contentType,
      },
      relations: ['versions'],
    });

    let savedFile: FileEntity;

    if (existing) {
      // Update existing → new version
      const lastVersion = await this.versionsRepo.findOne({
        where: { fileId: existing.id },
        order: { versionNumber: 'DESC' },
      });

      const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 2;

      existing.fileSize = fileSize;
      existing.s3Key = s3Key;
      existing.uploadedBy = uploadedBy;
      savedFile = await this.filesRepo.save(existing);

      const version = this.versionsRepo.create({
        fileId: existing.id,
        versionNumber: nextVersion,
        s3Key,
        fileSize,
        uploadedBy,
      });
      await this.versionsRepo.save(version);
    } else {
      // New file
      const newFile = this.filesRepo.create({
        tenantId,
        fileName: filename,
        originalName: filename,
        fileType: contentType,
        fileSize,
        s3Key,
        bucketName:
          (this.storage as any).bucketName || 'local-disk',
        uploadedBy,
      });
      savedFile = await this.filesRepo.save(newFile);

      const v1 = this.versionsRepo.create({
        fileId: newFile.id,
        versionNumber: 1,
        s3Key,
        fileSize,
        uploadedBy,
      });
      await this.versionsRepo.save(v1);
    }

    // Run AI Intelligence extraction and index the extracted text for RAG.
    try {
      const intel = await this.runFileIntelligence(
        savedFile.id,
        content,
        contentType,
        filename,
        workspaceId,
        clientId,
        caseId,
        conversationId,
      );
      await this.ragService.indexDocument({
        fileId: savedFile.id,
        tenantId,
        documentName: savedFile.originalName || filename,
        text: intel.extractedText || '',
        workspaceId,
        caseId,
      });
    } catch (err) {
      console.error('File intelligence extraction or RAG indexing failed', err);
    }

    return this.filesRepo.findOne({
      where: { id: savedFile.id },
      relations: ['versions'],
    });
  }

  async findByTenant(tenantId: string) {
    return this.filesRepo.find({
      where: { tenantId },
      relations: ['versions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const file = await this.filesRepo.findOne({
      where: { id },
      relations: ['versions'],
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async delete(id: string) {
    const file = await this.findById(id);
    await this.storage.deleteFile(file.s3Key);
    await this.ragService.deleteDocumentVectors(file.id, {
      tenantId: file.tenantId,
    });
    await this.filesRepo.remove(file);
    return { message: `File ${file.originalName} has been deleted.` };
  }

  async getDownloadUrl(id: string) {
    const file = await this.findById(id);
    const url = await this.storage.getPresignedDownloadUrl(file.s3Key);
    return { download_url: url };
  }

  async getPresignedUploadUrl(
    tenantId: string,
    category: string,
    filename: string,
    expiresIn = 3600,
  ) {
    if (!ALLOWED_CATEGORIES[category]) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }
    return this.storage.getPresignedUploadUrl(
      tenantId,
      category,
      filename,
      expiresIn,
    );
  }

  async downloadContent(id: string): Promise<{ buffer: Buffer; file: FileEntity }> {
    const file = await this.findById(id);
    const buffer = await this.storage.downloadFile(file.s3Key);
    return { buffer, file };
  }
}
