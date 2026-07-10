import { API_BASE_URL, authFetch } from "./client";

export async function uploadFile(file: File, category: string = "attachments"): Promise<any> {
  const token = localStorage.getItem("legaldraft_token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token || ""}`,
      "X-Tenant-ID": "default-tenant",
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to upload file");
  }

  return response.json();
}

export async function fetchFiles(): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/files`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json();
}

export async function deleteFile(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/files/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete file");
  }
}

export async function fetchFileIntelligence(fileId: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/files/${fileId}/intelligence`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch file intelligence");
  }

  return response.json();
}
