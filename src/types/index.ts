// Types for LegalDraft AI

export type UserRole = "admin" | "lawyer" | "legal-assistant";

export type DraftStatus =
  | "draft"
  | "in-progress"
  | "review"
  | "finalized"
  | "archived";

export type CaseStatus = "active" | "pending" | "closed";

export type TemplateCategory = "criminal" | "civil" | "property" | "family";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  firm: string;
  createdAt: string;
  lastActive: string;
}

export interface Draft {
  id: string;
  title: string;
  caseNumber: string;
  clientName: string;
  status: DraftStatus;
  category: TemplateCategory;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  version: number;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  fields: number;
  usageCount: number;
  lastUsed: string;
  previewText: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Case {
  id: string;
  caseNumber: string;
  clientName: string;
  clientEmail: string;
  status: CaseStatus;
  category: TemplateCategory;
  assignedLawyer: string;
  court: string;
  filingDate: string;
  nextHearing: string;
  relatedDrafts: string[];
  description: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone";
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
}

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

export interface DraftTrend {
  month: string;
  criminal: number;
  civil: number;
  property: number;
  family: number;
}

export interface RiskItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  field: string;
}

export interface ExtractedCaseData {
  caseNumber?: string;
  parties?: string[];
  dates?: string[];
  legalSections?: string[];
  facts?: string[];
  court?: string;
  filingDate?: string;
}
