// Case-related types

import { TemplateCategory } from "./templates";

export type CaseStatus = "active" | "pending" | "closed";
export type CasePriority = "high" | "medium" | "low";

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  status: CaseStatus;
  priority: CasePriority;
  category: TemplateCategory;
  assignedLawyer: string;
  court: string;
  judge?: string;
  filingDate: string;
  nextHearing: string;
  relatedDrafts: string[];
  relatedFiles?: string[];
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

export interface ExtractedCaseData {
  caseNumber?: string;
  parties?: string[];
  dates?: string[];
  legalSections?: string[];
  facts?: string[];
  court?: string;
  filingDate?: string;
}
