import { pythonFetch } from "./client";
import { Case, TimelineEvent } from "@/types";

export async function fetchCases(workspaceId: string, search?: string, clientId?: string): Promise<Case[]> {
  let url = `cases?workspace_id=${workspaceId}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (clientId) url += `&client_id=${clientId}`;
  const response = await pythonFetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch cases");
  }
  return response.json();
}

export async function createCase(workspaceId: string, data: {
  case_number: string;
  title: string;
  case_type: string;
  court: string;
  judge?: string;
  status: string;
  priority?: string;
  filing_date?: string;
  hearing_date?: string;
  description?: string;
  client_id: string;
}): Promise<Case> {
  const response = await pythonFetch(`cases?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create case");
  }
  return response.json();
}

export async function updateCase(caseId: string, data: Partial<Case>): Promise<Case> {
  const apiData = {
    case_number: data.caseNumber,
    title: data.title,
    case_type: data.category,
    court: data.court,
    judge: (data as any).judge,
    status: data.status,
    priority: (data as any).priority,
    filing_date: data.filingDate,
    hearing_date: data.nextHearing,
    description: data.description,
  };
  
  Object.keys(apiData).forEach(key => (apiData as any)[key] === undefined && delete (apiData as any)[key]);

  const response = await pythonFetch(`cases/${caseId}`, {
    method: "PATCH",
    body: JSON.stringify(apiData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update case");
  }
  return response.json();
}

export async function deleteCase(caseId: string): Promise<void> {
  const response = await pythonFetch(`cases/${caseId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete case");
  }
}

export async function addTimelineEvent(caseId: string, data: {
  title: string;
  description: string;
  date: string;
  type: string;
}): Promise<Case> {
  const response = await pythonFetch(`cases/${caseId}/timeline`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to add timeline event");
  }
  return response.json();
}

export async function linkDraftToCase(caseId: string, draftId: string): Promise<Case> {
  const response = await pythonFetch(`cases/${caseId}/link-draft`, {
    method: "POST",
    body: JSON.stringify({ draft_id: draftId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to link draft");
  }
  return response.json();
}

export async function linkDocumentToCase(caseId: string, documentId: string): Promise<Case> {
  const response = await pythonFetch(`cases/${caseId}/link-document`, {
    method: "POST",
    body: JSON.stringify({ document_id: documentId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to link document");
  }
  return response.json();
}

// Hearings API Client
export async function fetchHearings(caseId: string): Promise<any[]> {
  const response = await pythonFetch(`hearings/case/${caseId}`);
  if (!response.ok) throw new Error("Failed to fetch hearings");
  return response.json();
}

export async function createHearing(data: {
  case_id: string;
  hearing_date: string;
  hearing_time?: string;
  court_name?: string;
  court_hall?: string;
  judge_name?: string;
  purpose?: string;
  notes?: string;
  outcome?: string;
  next_hearing_date?: string;
}): Promise<any> {
  const response = await pythonFetch("hearings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create hearing");
  return response.json();
}

export async function updateHearing(hearingId: string, data: any): Promise<any> {
  const response = await pythonFetch(`hearings/${hearingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update hearing");
  return response.json();
}

export async function deleteHearing(hearingId: string): Promise<void> {
  const response = await pythonFetch(`hearings/${hearingId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete hearing");
}

// Tasks API Client
export async function fetchTasks(caseId: string): Promise<any[]> {
  const response = await pythonFetch(`tasks/case/${caseId}`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
}

export async function createTask(data: {
  case_id: string;
  assigned_to?: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  status: string;
}): Promise<any> {
  const response = await pythonFetch("tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
}

export async function updateTask(taskId: string, data: any): Promise<any> {
  const response = await pythonFetch(`tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await pythonFetch(`tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete task");
}

// Notes API Client
export async function fetchNotes(caseId: string): Promise<any[]> {
  const response = await pythonFetch(`notes/case/${caseId}`);
  if (!response.ok) throw new Error("Failed to fetch notes");
  return response.json();
}

export async function createNote(data: {
  case_id: string;
  title: string;
  content: string;
}): Promise<any> {
  const response = await pythonFetch("notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create note");
  return response.json();
}

export async function updateNote(noteId: string, data: any): Promise<any> {
  const response = await pythonFetch(`notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update note");
  return response.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const response = await pythonFetch(`notes/${noteId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete note");
}
