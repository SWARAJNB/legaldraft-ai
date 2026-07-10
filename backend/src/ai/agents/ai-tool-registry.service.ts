import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RagService } from '../../rag/rag.service';
import { Template } from '../../templates/entities/template.entity';
import { Draft } from '../../drafts/entities/draft.entity';
import { RegisteredTool, SharedAiContext } from './agent.types';

@Injectable()
export class AiToolRegistryService implements OnModuleInit {
  private readonly tools = new Map<string, RegisteredTool>();

  constructor(
    private readonly ragService: RagService,
    @InjectRepository(Template)
    private readonly templatesRepo: Repository<Template>,
    @InjectRepository(Draft)
    private readonly draftsRepo: Repository<Draft>,
  ) {}

  onModuleInit() {
    this.register({
      id: 'search_documents',
      description: 'Search workspace and case documents using hybrid RAG.',
      execute: (input, context) =>
        this.ragService.retrieve({
          tenantId: context.tenantId,
          workspaceId: context.workspace?.id,
          caseId: context.case?.id,
          question: input.question,
          topK: input.topK || 8,
        }),
    });

    this.register({
      id: 'search_templates',
      description: 'Search available drafting templates.',
      execute: async (input, context) =>
        this.templatesRepo.find({
          where: { tenantId: context.tenantId },
          order: { updatedAt: 'DESC' },
          take: input.limit || 8,
        }),
    });

    this.register({
      id: 'search_cases',
      description: 'Search the active workspace case context.',
      execute: async (_input, context) => ({
        activeCase: context.case,
        timeline: context.timeline,
        tasks: context.tasks,
        notes: context.notes,
      }),
    });

    this.register({
      id: 'generate_draft',
      description: 'Prepare draft-generation inputs for the selected agent.',
      execute: async (input, context) => ({
        draftType: input.draftType,
        client: context.client,
        case: context.case,
        templates: context.templates,
      }),
    });

    this.register({
      id: 'export_pdf',
      description: 'Placeholder tool contract for PDF export.',
      execute: async () => ({ supported: true, route: '/export/pdf/direct' }),
    });

    this.register({
      id: 'export_docx',
      description: 'Placeholder tool contract for DOCX export.',
      execute: async () => ({ supported: true, route: '/export/docx/direct' }),
    });
  }

  register(tool: RegisteredTool) {
    this.tools.set(tool.id, tool);
  }

  get(id: string) {
    return this.tools.get(id);
  }

  list() {
    return Array.from(this.tools.values()).map(({ id, description }) => ({
      id,
      description,
    }));
  }

  async run(id: string, input: any, context: SharedAiContext) {
    const tool = this.get(id);
    if (!tool) {
      throw new Error(`AI tool '${id}' is not registered`);
    }
    return tool.execute(input, context);
  }
}
