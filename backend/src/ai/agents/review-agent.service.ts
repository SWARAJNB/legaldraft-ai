import { Injectable } from '@nestjs/common';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
import { AGENT_SYSTEM_BASE, contextBlock } from './agent-prompts';

@Injectable()
export class ReviewAgentService implements AiAgent {
  id = 'review' as const;
  name = 'Review Agent';
  description = 'Performs contract review, clause analysis, and risk detection.';
  examples = ['review', 'risk', 'clause', 'contract analysis', 'liability'];

  canHandle(message: string): boolean {
    return /\b(review|risk|risks|clause|contract|liability|indemnity|termination|obligation|red flag|analyse|analyze)\b/i.test(message);
  }

  async buildPrompt(
    request: AiManagerRequest,
    context: SharedAiContext,
  ): Promise<AgentPrompt> {
    return {
      system: `${AGENT_SYSTEM_BASE}
You are the Review Agent. Identify legal, commercial, drafting, and evidentiary risks. Be precise and actionable.`,
      user: `${contextBlock(context)}

User Request
${request.message}

Review Agent Instructions
- For contract review, list clause issues, severity, rationale, and suggested revision.
- For risk detection, classify risks as critical, warning, or info.
- For clause analysis, explain enforceability, ambiguity, missing safeguards, and recommended language.
- Use uploaded document intelligence and drafts from context when available.`,
    };
  }
}
