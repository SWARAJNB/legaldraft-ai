import { pythonFetch } from "./client";

export interface ClientData {
  id: string;
  full_name: string;
  mobile_number?: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchClients(workspaceId: string, search?: string): Promise<ClientData[]> {
  let url = `clients?workspace_id=${workspaceId}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await pythonFetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  return response.json();
}

export async function createClient(workspaceId: string, data: {
  full_name: string;
  mobile_number?: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
}): Promise<ClientData> {
  const response = await pythonFetch(`clients?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create client");
  }
  return response.json();
}

export async function updateClient(clientId: string, data: {
  full_name?: string;
  mobile_number?: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
}): Promise<ClientData> {
  const response = await pythonFetch(`clients/${clientId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update client");
  }
  return response.json();
}

export async function deleteClient(clientId: string): Promise<void> {
  const response = await pythonFetch(`clients/${clientId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete client");
  }
}
