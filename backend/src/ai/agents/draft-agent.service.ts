import { Injectable } from '@nestjs/common';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
import { AGENT_SYSTEM_BASE, contextBlock } from './agent-prompts';

@Injectable()
export class DraftAgentService implements AiAgent {
  id = 'draft' as const;
  name = 'Draft Agent';
  description = 'Generates legal drafts, improves existing drafts, and uses templates.';
  examples = ['draft', 'petition', 'notice', 'agreement', 'improve draft', 'template'];

  canHandle(message: string): boolean {
    return /\b(draft|petition|notice|agreement|affidavit|plaint|application|reply|improve|rewrite|template)\b/i.test(message);
  }

  async buildPrompt(
    request: AiManagerRequest,
    context: SharedAiContext,
  ): Promise<AgentPrompt> {
    return {
      system: `${AGENT_SYSTEM_BASE}
You are the Draft Agent. Generate complete, court-ready or transaction-ready legal drafts when requested. If improving text, preserve meaning while improving legal structure, tone, and citations. Prefer available templates from context when they fit.`,
      user: `${contextBlock(context)}

User Request
${request.message}

Draft Agent Instructions
- Use templates from shared context when relevant.
- Include title, parties, facts/background, legal grounds/clauses, prayer/relief, signature and verification blocks when appropriate.
- If required facts are missing, use clear placeholders like [___].
- If asked to improve a draft, return the improved text first and a short change note after.`,
    };
  }
}
