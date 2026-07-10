import { API_BASE_URL, authFetch } from "./client";

export async function fetchTemplates(search?: string, category?: string): Promise<any[]> {
  let url = `${API_BASE_URL}/templates`;
  const params: string[] = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  const response = await authFetch(url, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

export async function fetchTemplateById(id: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/templates/${id}`, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch template details");
  return response.json();
}

export async function uploadTemplate(file: File, name: string, description?: string): Promise<any> {
  const token = localStorage.getItem("legaldraft_token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  if (description) formData.append("description", description);

  const response = await fetch(`${API_BASE_URL}/templates/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token || ""}`,
      "X-Tenant-ID": "default-tenant",
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to upload template");
  }

  return response.json();
}

export async function savePlaceholders(templateId: string, placeholders: any[]): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/templates/${templateId}/placeholders`, {
    method: "POST",
    body: JSON.stringify({ placeholders }),
  });

  if (!response.ok) throw new Error("Failed to save placeholders");
  return response.json();
}

export async function fetchTemplateVersions(templateId: string): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/templates/${templateId}/versions`, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Failed to fetch template version history");
  return response.json();
}

export async function restoreTemplateVersion(templateId: string, versionNumber: number): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/templates/${templateId}/versions/${versionNumber}/restore`, {
    method: "POST",
  });

  if (!response.ok) throw new Error("Failed to restore template version");
  return response.json();
}

export async function generateDraftFromTemplate(templateId: string, values: Record<string, any>): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/templates/${templateId}/generate`, {
    method: "POST",
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to generate draft from template");
  }

  return response.json();
}

export async function askInterviewQuestion(
  templateId: string,
  answers: Record<string, string>,
  currentPlaceholder?: string,
): Promise<{ isFinished: boolean; nextPlaceholder: any; question: string }> {
  const response = await authFetch(`${API_BASE_URL}/templates/${templateId}/interview`, {
    method: "POST",
    body: JSON.stringify({ answers, currentPlaceholder }),
  });

  if (!response.ok) throw new Error("Failed to get next interview question");
  return response.json();
}
