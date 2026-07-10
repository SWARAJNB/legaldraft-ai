"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_SYSTEM_BASE = void 0;
exports.contextBlock = contextBlock;
exports.AGENT_SYSTEM_BASE = `You are part of LegalDraft AI's multi-agent legal assistant for Indian legal workflows.
Use formal legal drafting standards. Keep outputs practical, structured, and suitable for review by a licensed advocate.
Never claim to be a lawyer and never present drafts as final legal advice.`;
function contextBlock(context) {
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
function compact(value) {
    if (!value?.length)
        return 'None';
    return JSON.stringify(value.slice(0, 8)).slice(0, 5000);
}
//# sourceMappingURL=agent-prompts.js.map