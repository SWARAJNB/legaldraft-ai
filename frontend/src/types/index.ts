// ── Barrel re-export ────────────────────────────────────────────────────────
// Re-exports all types so existing `@/types` imports continue to work.

export * from "./auth";
export * from "./templates";
export * from "./drafts";
export * from "./cases";

// ── Shared / cross-cutting types ────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AnalyticsData {
  date: string;
  drafts: number;
  exports: number;
  templates: number;
}

export interface RiskItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  field: string;
}
