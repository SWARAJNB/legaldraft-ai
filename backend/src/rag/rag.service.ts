import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { FileEntity } from '../files/entities/file.entity';
import { FileIntelligenceEntity } from '../files/entities/file-intelligence.entity';

type RagScope = {
  tenantId: string;
  workspaceId?: string;
  caseId?: string;
};

type RagChunk = {
  id: string;
  fileId: string;
  documentName: string;
  pageNumber: number;
  chunkIndex: number;
  chunk: string;
  embedding: number[];
  workspaceId?: string;
  caseId?: string;
  lastIndexed: string;
};

export type RagCitation = {
  documentName: string;
  pageNumber: number;
  chunk: string;
  confidence: number;
  fileId: string;
  chunkIndex: number;
  source: 'vector' | 'postgres_fts' | 'hybrid';
};

export type KnowledgeBaseDocument = {
  fileId: string;
  documentName: string;
  workspaceId?: string;
  caseId?: string;
  embeddingStatus: 'indexed' | 'pending' | 'empty' | 'failed';
  chunkCount: number;
  lastIndexed?: string;
  aiSources: string[];
};

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private readonly vectorRoot =
    process.env.CHROMA_LOCAL_PATH || join(process.cwd(), 'data', 'chroma');
  private readonly embeddingDimensions = Number(
    process.env.LOCAL_EMBEDDING_DIMENSIONS || 384,
  );

  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepo: Repository<FileEntity>,
    @InjectRepository(FileIntelligenceEntity)
    private readonly intelligenceRepo: Repository<FileIntelligenceEntity>,
  ) {}

  async onModuleInit() {
    await mkdir(this.vectorRoot, { recursive: true });
    this.logger.log(`Local ChromaDB store ready at ${this.vectorRoot}`);
  }

  chunkText(
    text: string,
    chunkSize = 180,
    overlap = 35,
  ): { text: string; index: number; pageNumber: number }[] {
    const normalized = (text || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const pageParts = normalized.split(/\f|(?:\n\s*---\s*page\s+\d+\s*---\s*\n)/i);
    const chunks: { text: string; index: number; pageNumber: number }[] = [];
    let chunkIndex = 0;

    pageParts.forEach((pageText, pageIdx) => {
      const words = pageText.split(/\s+/).filter(Boolean);
      let i = 0;
      while (i < words.length) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim()) {
          chunks.push({
            text: chunk,
            index: chunkIndex,
            pageNumber: pageIdx + 1,
          });
          chunkIndex += 1;
        }
        i += Math.max(1, chunkSize - overlap);
      }
    });

    return chunks;
  }

  generateLocalEmbedding(text: string): number[] {
    const vector = new Array(this.embeddingDimensions).fill(0);
    const tokens = (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
      (token) => token.length > 1,
    );

    for (const token of tokens) {
      const digest = createHash('sha256').update(token).digest();
      const index = digest.readUInt32BE(0) % this.embeddingDimensions;
      const sign = digest[4] % 2 === 0 ? 1 : -1;
      vector[index] += sign * (1 + Math.log(token.length));
    }

    const magnitude =
      Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / magnitude);
  }

  async indexDocument(params: {
    fileId: string;
    tenantId: string;
    documentName: string;
    text: string;
    workspaceId?: string;
    caseId?: string;
  }): Promise<{ status: KnowledgeBaseDocument['embeddingStatus']; chunkCount: number }> {
    await this.deleteDocumentVectors(params.fileId, {
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
      caseId: params.caseId,
    });

    const chunks = this.chunkText(params.text);
    if (chunks.length === 0) {
      return { status: 'empty', chunkCount: 0 };
    }

    const indexedAt = new Date().toISOString();
    const vectorChunks: RagChunk[] = chunks.map((chunk) => ({
      id: `${params.fileId}:${chunk.index}`,
      fileId: params.fileId,
      documentName: params.documentName,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.index,
      chunk: chunk.text,
      embedding: this.generateLocalEmbedding(chunk.text),
      workspaceId: params.workspaceId,
      caseId: params.caseId,
      lastIndexed: indexedAt,
    }));

    const workspaceCollection = this.collectionName({
      tenantId: params.tenantId,
      workspaceId: params.workspaceId,
    });
    await this.writeCollection(
      workspaceCollection,
      await this.mergeCollection(workspaceCollection, vectorChunks, params.fileId),
    );

    if (params.caseId) {
      const caseCollection = this.collectionName({
        tenantId: params.tenantId,
        workspaceId: params.workspaceId,
        caseId: params.caseId,
      });
      await this.writeCollection(
        caseCollection,
        await this.mergeCollection(
          caseCollection,
          vectorChunks,
          params.fileId,
        ),
      );
    }

    return { status: 'indexed', chunkCount: chunks.length };
  }

  async deleteDocumentVectors(fileId: string, scope?: Partial<RagScope>): Promise<void> {
    const names = await this.collectionNames(scope);
    for (const name of names) {
      const chunks = await this.readCollection(name);
      const filtered = chunks.filter((chunk) => chunk.fileId !== fileId);
      if (filtered.length === 0) {
        await rm(this.collectionPath(name), { force: true });
      } else if (filtered.length !== chunks.length) {
        await this.writeCollection(name, filtered);
      }
    }
  }

  async getKnowledgeBase(scope: RagScope): Promise<{
    documents: KnowledgeBaseDocument[];
    aiSources: string[];
    searchPreview: RagCitation[];
  }> {
    const intelligenceRows = await this.intelligenceRepo.find({
      where: scope.workspaceId ? { workspaceId: scope.workspaceId } : {},
      relations: ['file'],
      order: { updatedAt: 'DESC' },
    });

    const documents: KnowledgeBaseDocument[] = [];
    for (const intel of intelligenceRows) {
      const file = intel.file || (await this.filesRepo.findOne({ where: { id: intel.fileId } }));
      const chunks = await this.getDocumentChunks(scope, intel.fileId);
      documents.push({
        fileId: intel.fileId,
        documentName: file?.originalName || intel.documentTitle || 'Untitled document',
        workspaceId: intel.workspaceId || undefined,
        caseId: intel.caseId || undefined,
        embeddingStatus: chunks.length
          ? 'indexed'
          : intel.extractedText
            ? 'pending'
            : 'empty',
        chunkCount: chunks.length,
        lastIndexed: chunks[0]?.lastIndexed,
        aiSources: this.aiSources(intel),
      });
    }

    return {
      documents,
      aiSources: Array.from(
        new Set(documents.flatMap((document) => document.aiSources)),
      ),
      searchPreview: await this.retrieve({
        ...scope,
        question: 'important dates parties clauses summary',
        topK: 5,
      }),
    };
  }

  async retrieve(params: RagScope & { question: string; topK?: number }): Promise<RagCitation[]> {
    const topK = params.topK || 8;
    const queryEmbedding = this.generateLocalEmbedding(params.question);
    const vectorResults = await this.vectorSearch(params, queryEmbedding, topK);
    const ftsResults = await this.postgresFullTextSearch(params, topK);
    const merged = new Map<string, RagCitation>();

    for (const result of [...vectorResults, ...ftsResults]) {
      const key = `${result.fileId}:${result.chunkIndex}`;
      const existing = merged.get(key);
      if (!existing || result.confidence > existing.confidence) {
        merged.set(key, existing ? { ...result, source: 'hybrid' } : result);
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topK);
  }

  buildContext(citations: RagCitation[]): string {
    return citations
      .map(
        (citation, index) =>
          `[${index + 1}] ${citation.documentName}, page ${citation.pageNumber}, confidence ${citation.confidence.toFixed(2)}\n${citation.chunk}`,
      )
      .join('\n\n');
  }

  async buildPrompt(params: RagScope & { question: string; topK?: number }) {
    const citations = await this.retrieve(params);
    const context = this.buildContext(citations);
    return {
      citations,
      prompt: `Use the retrieved legal knowledge base context to answer the question. Cite sources by document name and page number. If the context is insufficient, say so clearly.\n\nQuestion:\n${params.question}\n\nRetrieved Context:\n${context || 'No relevant indexed context found.'}`,
    };
  }

  private async vectorSearch(
    scope: RagScope,
    queryEmbedding: number[],
    topK: number,
  ): Promise<RagCitation[]> {
    const names = await this.collectionNames(scope);
    const chunks = (await Promise.all(names.map((name) => this.readCollection(name))))
      .flat()
      .filter((chunk) => this.chunkInScope(chunk, scope));

    return chunks
      .map((chunk) => ({
        documentName: chunk.documentName,
        pageNumber: chunk.pageNumber,
        chunk: chunk.chunk,
        confidence: this.cosineSimilarity(queryEmbedding, chunk.embedding),
        fileId: chunk.fileId,
        chunkIndex: chunk.chunkIndex,
        source: 'vector' as const,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topK);
  }

  private async postgresFullTextSearch(
    params: RagScope & { question: string },
    topK: number,
  ): Promise<RagCitation[]> {
    try {
      const rows = await this.intelligenceRepo.query(
        `
        SELECT
          fi.file_id as "fileId",
          COALESCE(f.original_name, fi.document_title, 'Untitled document') as "documentName",
          fi.extracted_text as "text",
          ts_rank_cd(to_tsvector('english', COALESCE(fi.extracted_text, '')), websearch_to_tsquery('english', $1)) as rank
        FROM file_intelligence fi
        LEFT JOIN files f ON f.id = fi.file_id
        WHERE
          ($2::varchar IS NULL OR fi.workspace_id = $2)
          AND ($3::varchar IS NULL OR fi.case_id = $3)
          AND to_tsvector('english', COALESCE(fi.extracted_text, '')) @@ websearch_to_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $4
        `,
        [params.question, params.workspaceId || null, params.caseId || null, topK],
      );

      return rows.map((row) => ({
        documentName: row.documentName,
        pageNumber: 1,
        chunk: this.bestSnippet(row.text || '', params.question),
        confidence: Math.min(0.95, Number(row.rank || 0) + 0.55),
        fileId: row.fileId,
        chunkIndex: -1,
        source: 'postgres_fts' as const,
      }));
    } catch (err) {
      this.logger.warn(`PostgreSQL FTS unavailable: ${(err as Error).message}`);
      return [];
    }
  }

  private bestSnippet(text: string, question: string) {
    const chunks = this.chunkText(text, 120, 20);
    if (!chunks.length) return text.slice(0, 1200);
    const query = this.generateLocalEmbedding(question);
    const best = chunks
      .map((chunk) => ({
        text: chunk.text,
        score: this.cosineSimilarity(query, this.generateLocalEmbedding(chunk.text)),
      }))
      .sort((a, b) => b.score - a.score)[0];
    return best.text;
  }

  private async getDocumentChunks(scope: RagScope, fileId: string) {
    const names = await this.collectionNames(scope);
    const chunks = (await Promise.all(names.map((name) => this.readCollection(name)))).flat();
    return chunks.filter((chunk) => chunk.fileId === fileId && this.chunkInScope(chunk, scope));
  }

  private aiSources(intel: FileIntelligenceEntity): string[] {
    return [
      intel.classification,
      ...this.parseJsonArray(intel.keywords),
      ...this.parseJsonArray(intel.tags),
    ].filter(Boolean);
  }

  private parseJsonArray(value?: string): string[] {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let aMag = 0;
    let bMag = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
      dot += a[i] * b[i];
      aMag += a[i] * a[i];
      bMag += b[i] * b[i];
    }
    return Math.max(0, dot / ((Math.sqrt(aMag) || 1) * (Math.sqrt(bMag) || 1)));
  }

  private chunkInScope(chunk: RagChunk, scope: RagScope) {
    return (
      (!scope.workspaceId || chunk.workspaceId === scope.workspaceId) &&
      (!scope.caseId || chunk.caseId === scope.caseId)
    );
  }

  private collectionName(scope: Partial<RagScope>) {
    const workspace = this.slug(scope.workspaceId || 'global');
    const casePart = scope.caseId ? `_case_${this.slug(scope.caseId)}` : '';
    return `tenant_${this.slug(scope.tenantId || 'default')}_workspace_${workspace}${casePart}`;
  }

  private async collectionNames(scope?: Partial<RagScope>) {
    await mkdir(this.vectorRoot, { recursive: true });
    if (!scope?.workspaceId && !scope?.caseId) {
      const prefix = `tenant_${this.slug(scope?.tenantId || 'default')}_`;
      const files = await readdir(this.vectorRoot).catch(() => []);
      const tenantCollections = files
        .filter((file) => file.endsWith('.json') && file.startsWith(prefix))
        .map((file) => file.replace(/\.json$/, ''));
      if (tenantCollections.length) return tenantCollections;
    }

    const names = [
      this.collectionName({
        tenantId: scope?.tenantId,
        workspaceId: scope?.workspaceId,
      }),
    ];
    if (scope?.caseId) {
      names.push(this.collectionName({ ...scope, caseId: scope.caseId }));
    }
    return Array.from(new Set(names));
  }

  private async mergeCollection(
    name: string,
    nextChunks: RagChunk[],
    fileId: string,
  ) {
    const existing = await this.readCollection(name);
    return [...existing.filter((chunk) => chunk.fileId !== fileId), ...nextChunks];
  }

  private async readCollection(name: string): Promise<RagChunk[]> {
    try {
      return JSON.parse(await readFile(this.collectionPath(name), 'utf-8'));
    } catch {
      return [];
    }
  }

  private async writeCollection(name: string, chunks: RagChunk[]) {
    await mkdir(this.vectorRoot, { recursive: true });
    await writeFile(this.collectionPath(name), JSON.stringify(chunks, null, 2), 'utf-8');
  }

  private collectionPath(name: string) {
    return join(this.vectorRoot, `${name}.json`);
  }

  private slug(value: string) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  }
}
