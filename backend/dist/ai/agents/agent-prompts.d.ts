import { SharedAiContext } from './agent.types';
export declare const AGENT_SYSTEM_BASE = "You are part of LegalDraft AI's multi-agent legal assistant for Indian legal workflows.\nUse formal legal drafting standards. Keep outputs practical, structured, and suitable for review by a licensed advocate.\nNever claim to be a lawyer and never present drafts as final legal advice.";
export declare function contextBlock(context: SharedAiContext): string;
