import { API_BASE_URL, authFetch } from "./client";


// ── AI Types ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatAIResponse {
  response: string;
  file?: GeneratedDraftFile;
}

export interface RiskItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  desc: string;
}

export interface GeneratedDraftFile {
  file_id: string;
  file_name: string;
  file_type: string;
  download_url: string;
}

export interface GeneratedDraftResponse {
  draft: string;
  file?: GeneratedDraftFile;
}


// ── AI API functions ────────────────────────────────────────────────────────

export async function chatWithAI(messages: ChatMessage[]): Promise<ChatAIResponse> {
  const response = await authFetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to communicate with AI Assistant backend");
  }

  const data = await response.json();
  return {
    response: data.response,
    file: data.file_id && data.download_url ? {
      file_id: data.file_id,
      file_name: data.file_name || "legal-draft.pdf",
      file_type: data.file_type || "application/pdf",
      download_url: data.download_url,
    } : undefined,
  };
}

export async function generateAIDraft(params: {
  draft_type: string;
  client_info: string;
  case_details: string;
  court: string;
  relief: string;
}): Promise<GeneratedDraftResponse> {
  const response = await authFetch(`${API_BASE_URL}/ai/generate-draft`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to generate AI draft");
  }

  const data = await response.json();
  return {
    draft: data.draft,
    file: data.file_id && data.download_url ? {
      file_id: data.file_id,
      file_name: data.file_name || "legal-draft.pdf",
      file_type: data.file_type || "application/pdf",
      download_url: data.download_url,
    } : undefined,
  };
}

export async function downloadGeneratedFile(file: GeneratedDraftFile): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}${file.download_url}`, {
    method: "GET",
    headers: {
      "X-Tenant-ID": "default-tenant",
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to download generated file");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.file_name || "legal-draft.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function runAIRiskCheck(content: string): Promise<RiskItem[]> {
  const response = await authFetch(`${API_BASE_URL}/ai/risk-check`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to perform AI risk check");
  }

  const data = await response.json();
  return data.risks;
}

export async function improveTextWithAI(text: string, action: string): Promise<string> {
  const response = await authFetch(`${API_BASE_URL}/ai/improve-text`, {
    method: "POST",
    body: JSON.stringify({ text, action }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to improve text with AI");
  }

  const data = await response.json();
  return data.improved_text;
}
