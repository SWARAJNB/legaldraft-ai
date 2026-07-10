import { Injectable } from '@nestjs/common';
import { AiAgent, AiManagerRequest, AgentPrompt, SharedAiContext } from './agent.types';
import { AGENT_SYSTEM_BASE, contextBlock } from './agent-prompts';

@Injectable()
export class TimelineAgentService implements AiAgent {
  id = 'timeline' as const;
  name = 'Timeline Agent';
  description = 'Summarizes case timelines, hearing summaries, and case history.';
  examples = ['timeline', 'hearing summary', 'case history', 'chronology'];

  canHandle(message: string): boolean {
    return /\b(timeline|chronology|hearing|case history|history|events|dates|next hearing|summary for hearing)\b/i.test(message);
  }

  async buildPrompt(
    request: AiManagerRequest,
    context: SharedAiContext,
  ): Promise<AgentPrompt> {
    return {
      system: `${AGENT_SYSTEM_BASE}
You are the Timeline Agent. Convert case activity into clear chronologies, hearing briefs, and case history notes.`,
      user: `${contextBlock(context)}

User Request
${request.message}

Timeline Agent Instructions
- Order events chronologically.
- Highlight upcoming hearings, pending tasks, missing dates, and preparation items.
- For hearing summaries, include facts, procedural posture, issues, documents to carry, and suggested oral points.`,
    };
  }
}
