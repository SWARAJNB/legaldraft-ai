import { pythonFetch } from "./client";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id?: string;
  created_at: string;
  organization_id: string;
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const response = await pythonFetch("workspaces");
  if (!response.ok) {
    throw new Error("Failed to fetch workspaces");
  }
  return response.json();
}

export async function fetchWorkspaceDetails(workspaceId: string): Promise<Workspace> {
  const response = await pythonFetch(`workspaces/${workspaceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch workspace details");
  }
  return response.json();
}

export async function provisionWorkspace(data: {
  organization_name: string;
  organization_slug: string;
  workspace_name: string;
  workspace_slug: string;
}): Promise<Workspace> {
  const response = await pythonFetch("workspaces/provision", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to provision workspace");
  }
  return response.json();
}

export async function updateWorkspace(workspaceId: string, data: {
  name?: string;
  description?: string;
}): Promise<Workspace> {
  const response = await pythonFetch(`workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update workspace");
  }
  return response.json();
}

export interface Invitation {
  id: string;
  email: string;
  workspace_id: string;
  role: string;
  invited_by: string;
  token: string;
  status: string;
  expires_at: string;
}

export async function inviteMember(workspaceId: string, email: string, role: string = "member"): Promise<Invitation> {
  const response = await pythonFetch(`workspaces/${workspaceId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to invite member");
  }
  return response.json();
}
