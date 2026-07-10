import { SharedAiContext } from './agent.types';

export const AGENT_SYSTEM_BASE = `You are part of LegalDraft AI's multi-agent legal assistant for Indian legal workflows.
Use formal legal drafting standards. Keep outputs practical, structured, and suitable for review by a licensed advocate.
Never claim to be a lawyer and never present drafts as final legal advice.`;

export function contextBlock(context: SharedAiContext) {
  return `Shared Context
- Workspace: ${context.workspace?.name || 'Not selected'}
- Client: ${context.client?.name || 'Not selected'}
- Case: ${context.case?.title || 'Not selected'} ${context.case?.number ? `(${context.case.number})` : ''}
- Timeline: ${compact(context.timeline)}
- Tasks: ${compact(context.tasks)}
- Notes: ${compact(context.notes)}
- Documents: ${compact(context.documents)}
- Drafts: ${compact(context.drafts)}
- Templates: ${compact(context.templates)}
- Knowledge Base: ${compact(context.knowledgeBase?.documents || [])}
- Conversation: ${compact(context.conversation)}`;
}

function compact(value: any[]) {
  if (!value?.length) return 'None';
  return JSON.stringify(value.slice(0, 8)).slice(0, 5000);
}
