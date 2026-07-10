import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Draft } from '../../drafts/entities/draft.entity';
import { Template } from '../../templates/entities/template.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { FileIntelligenceEntity } from '../../files/entities/file-intelligence.entity';
import { RagService } from '../../rag/rag.service';
import { AiManagerRequest, SharedAiContext } from './agent.types';

@Injectable()
export class AiContextService {
  constructor(
    @InjectRepository(Draft)
    private readonly draftsRepo: Repository<Draft>,
    @InjectRepository(Template)
    private readonly templatesRepo: Repository<Template>,
    @InjectRepository(FileEntity)
    private readonly filesRepo: Repository<FileEntity>,
    @InjectRepository(FileIntelligenceEntity)
    private readonly intelligenceRepo: Repository<FileIntelligenceEntity>,
    private readonly ragService: RagService,
  ) {}

  async build(request: AiManagerRequest): Promise<SharedAiContext> {
    const frontend = request.frontendContext || {};
    const workspaceId = frontend.workspaceId || frontend.activeWorkspaceId;
    const caseId = frontend.caseId || frontend.activeCaseId;

    const [drafts, templates, files, intelligence, knowledgeBase] =
      await Promise.all([
        this.draftsRepo.find({
          where: { tenantId: request.tenantId },
          order: { updatedAt: 'DESC' },
          take: 8,
        }),
        this.templatesRepo.find({
          where: [{ tenantId: request.tenantId }, { tenantId: IsNull() }],
          order: { updatedAt: 'DESC' },
          take: 8,
        }),
        this.filesRepo.find({
          where: { tenantId: request.tenantId },
          order: { createdAt: 'DESC' },
          take: 8,
        }),
        this.intelligenceRepo.find({
          where: workspaceId ? { workspaceId } : {},
          order: { updatedAt: 'DESC' },
          take: 8,
        }),
        this.ragService
          .getKnowledgeBase({
            tenantId: request.tenantId,
            workspaceId,
            caseId,
          })
          .catch(() => ({ documents: [], aiSources: [], searchPreview: [] })),
      ]);

    return {
      tenantId: request.tenantId,
      userId: request.userId,
      workspace: {
        id: workspaceId,
        name: frontend.workspaceName,
      },
      client: {
        id: frontend.clientId,
        name: frontend.clientName,
      },
      case: {
        id: caseId,
        title: frontend.caseTitle,
        number: frontend.caseNumber,
        court: frontend.court,
        nextHearing: frontend.nextHearing,
      },
      timeline: frontend.timeline || [],
      tasks: frontend.tasks || [],
      notes: frontend.notes || [],
      documents: [
        ...(frontend.documents || []).map((name: string) => ({ name })),
        ...files.map((file) => ({
          id: file.id,
          name: file.originalName,
          type: file.fileType,
          size: file.fileSize,
        })),
        ...intelligence.map((item) => ({
          id: item.fileId,
          title: item.documentTitle,
          classification: item.classification,
          summary: item.shortSummary,
          keywords: item.keywords,
        })),
      ].slice(0, 16),
      drafts: [
        ...(frontend.drafts || []),
        ...drafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          status: draft.status,
          category: draft.category,
          clientName: draft.clientName,
          caseNumber: draft.caseNumber,
          preview: (draft.content || '').slice(0, 1200),
        })),
      ].slice(0, 12),
      templates: [
        ...(frontend.templates || []),
        ...templates.map((template) => ({
          id: template.id,
          name: template.name,
          category: template.category,
          description: template.description,
          preview: template.previewText,
          placeholders: template.placeholders,
        })),
      ].slice(0, 12),
      conversation: request.messages || [],
      knowledgeBase: {
        documents: knowledgeBase.documents || [],
        aiSources: knowledgeBase.aiSources || [],
      },
    };
  }

  format(context: SharedAiContext): string {
    return `Workspace: ${context.workspace?.name || 'Not selected'}
Client: ${context.client?.name || 'Not selected'}
Case: ${context.case?.title || 'Not selected'} ${context.case?.number ? `(${context.case.number})` : ''}
Timeline: ${this.compact(context.timeline)}
Tasks: ${this.compact(context.tasks)}
Notes: ${this.compact(context.notes)}
Documents: ${this.compact(context.documents)}
Drafts: ${this.compact(context.drafts)}
Templates: ${this.compact(context.templates)}
Knowledge Base: ${this.compact(context.knowledgeBase?.documents || [])}
Conversation: ${this.compact(context.conversation)}`;
  }

  private compact(value: any[]) {
    if (!value?.length) return 'None';
    return JSON.stringify(value.slice(0, 8)).slice(0, 6000);
  }
}
