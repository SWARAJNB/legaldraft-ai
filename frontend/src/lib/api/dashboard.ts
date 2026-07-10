import { pythonFetch } from "./client";

export interface RecentDraft {
  id: string;
  title: string;
  updated_at: string;
  client_name?: string;
  case_number?: string;
}

export interface RecentDocument {
  id: string;
  name: string;
  mime_type: string;
  created_at: string;
  case_title?: string;
}

export interface RecentClient {
  id: string;
  full_name: string;
  email?: string;
  company?: string;
  created_at: string;
}

export interface RecentCase {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  court: string;
  client_name?: string;
  hearing_date?: string;
  created_at: string;
}

export interface DashboardStats {
  active_clients: number;
  active_cases: number;
  upcoming_hearings: number;
  total_drafts: number;
  recent_drafts: RecentDraft[];
  recent_documents: RecentDocument[];
  recent_clients: RecentClient[];
  recent_cases: RecentCase[];
}

export async function fetchDashboardStats(workspaceId: string): Promise<DashboardStats> {
  const response = await pythonFetch(`dashboard/stats?workspace_id=${workspaceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return response.json();
}
