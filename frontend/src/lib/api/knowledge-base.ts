import { API_BASE_URL, authFetch } from "./client";

export interface KnowledgeBaseDocument {
  fileId: string;
  documentName: string;
  workspaceId?: string;
  caseId?: string;
  embeddingStatus: "indexed" | "pending" | "empty" | "failed";
  chunkCount: number;
  lastIndexed?: string;
  aiSources: string[];
}

export interface RetrievalResult {
  documentName: string;
  pageNumber: number;
  chunk: string;
  confidence: number;
  fileId: string;
  chunkIndex: number;
  source: "vector" | "postgres_fts" | "hybrid";
}

export interface KnowledgeBaseSummary {
  documents: KnowledgeBaseDocument[];
  aiSources: string[];
  searchPreview: RetrievalResult[];
}

export async function fetchKnowledgeBase(params: {
  workspaceId?: string | null;
  caseId?: string | null;
} = {}): Promise<KnowledgeBaseSummary> {
  const query = new URLSearchParams();
  if (params.workspaceId) query.set("workspace_id", params.workspaceId);
  if (params.caseId) query.set("case_id", params.caseId);

  const response = await authFetch(`${API_BASE_URL}/rag/knowledge-base?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch knowledge base");
  }
  return response.json();
}

export async function searchKnowledgeBase(params: {
  question: string;
  workspaceId?: string | null;
  caseId?: string | null;
  topK?: number;
}): Promise<RetrievalResult[]> {
  const response = await authFetch(`${API_BASE_URL}/rag/search`, {
    method: "POST",
    body: JSON.stringify({
      question: params.question,
      workspace_id: params.workspaceId || undefined,
      case_id: params.caseId || undefined,
      top_k: params.topK || 8,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to search knowledge base");
  }
  return response.json();
}

export async function answerFromKnowledgeBase(params: {
  question: string;
  workspaceId?: string | null;
  caseId?: string | null;
}): Promise<{ response: string; citations: RetrievalResult[] }> {
  const response = await authFetch(`${API_BASE_URL}/ai/knowledge-answer`, {
    method: "POST",
    body: JSON.stringify({
      question: params.question,
      workspace_id: params.workspaceId || undefined,
      case_id: params.caseId || undefined,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to answer from knowledge base");
  }
  return response.json();
}
