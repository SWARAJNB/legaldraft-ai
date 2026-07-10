import { Injectable } from '@nestjs/common';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
import { AGENT_SYSTEM_BASE, contextBlock } from './agent-prompts';

@Injectable()
export class FileAgentService implements AiAgent {
  id = 'file' as const;
  name = 'File Agent';
  description = 'Analyzes uploaded files, OCR output, metadata, and classification.';
  examples = ['uploaded file', 'ocr', 'metadata', 'classification', 'extract'];

  canHandle(message: string): boolean {
    return /\b(file|document|upload|uploaded|ocr|metadata|classify|classification|extract|scan|pdf|image)\b/i.test(message);
  }

  async buildPrompt(
    request: AiManagerRequest,
    context: SharedAiContext,
  ): Promise<AgentPrompt> {
    return {
      system: `${AGENT_SYSTEM_BASE}
You are the File Agent. Explain uploaded document intelligence, OCR findings, extracted metadata, classification, parties, dates, clauses, and tags.`,
      user: `${contextBlock(context)}

User Request
${request.message}

File Agent Instructions
- Use file intelligence and document summaries from context.
- If OCR or extraction appears unavailable, say what should be re-uploaded or re-indexed.
- Return classification, key metadata, extracted facts, and next recommended action.`,
    };
  }
}
