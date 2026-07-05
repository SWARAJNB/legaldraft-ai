// Draft-related types

import { TemplateCategory } from "./templates";

export type DraftStatus =
  | "draft"
  | "in-progress"
  | "review"
  | "finalized"
  | "archived";

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

export interface DraftTrend {
  month: string;
  criminal: number;
  civil: number;
  property: number;
  family: number;
}
