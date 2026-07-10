import { Injectable } from '@nestjs/common';
import { RagService } from '../../rag/rag.service';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
import { AGENT_SYSTEM_BASE, contextBlock } from './agent-prompts';

@Injectable()
export class ResearchAgentService implements AiAgent {
  id = 'research' as const;
  name = 'Research Agent';
  description = 'Searches RAG and the Knowledge Base, then returns citations.';
  examples = ['research', 'find documents', 'citation', 'knowledge base', 'precedent'];

  constructor(private readonly ragService: RagService) {}

  canHandle(message: string): boolean {
    return /\b(research|search|find|citation|citations|knowledge base|kb|rag|source|precedent|case law)\b/i.test(message);
  }

  async buildPrompt(
    request: AiManagerRequest,
    context: SharedAiContext,
  ): Promise<AgentPrompt> {
    const citations = await this.ragService.retrieve({
      tenantId: context.tenantId,
      workspaceId: context.workspace?.id,
      caseId: context.case?.id,
      question: request.message,
      topK: 8,
    });

    return {
      citations,
      metadata: { citationCount: citations.length },
      system: `${AGENT_SYSTEM_BASE}
You are the Research Agent. Ground your answer in retrieved workspace documents and Knowledge Base sources. Always cite document name, page number, and confidence when sources are available.`,
      user: `${contextBlock(context)}

Retrieved Sources
${this.ragService.buildContext(citations) || 'No matching RAG sources were found.'}

User Request
${request.message}

Research Agent Instructions
- Answer from retrieved context first.
- Return a concise findings section followed by citations.
- If evidence is insufficient, say what is missing.`,
    };
  }
}
