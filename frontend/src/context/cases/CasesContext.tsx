"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Case, TimelineEvent, CaseStatus, TemplateCategory } from "@/types";
import { toast } from "sonner";
import {
  fetchCases,
  createCase as apiCreateCase,
  updateCase as apiUpdateCase,
  deleteCase as apiDeleteCase,
  addTimelineEvent as apiAddTimelineEvent,
  linkDraftToCase as apiLinkDraftToCase,
  fetchClients,
  createClient,
  fetchWorkspaces,
  provisionWorkspace
} from "@/lib/api";

interface CasesContextType {
  cases: Case[];
  isLoading: boolean;
  createCase: (caseData: {
    clientName: string;
    clientEmail: string;
    status: CaseStatus;
    category: TemplateCategory;
    assignedLawyer: string;
    court: string;
    filingDate: string;
    nextHearing: string;
    description: string;
  }) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  getCase: (id: string) => Case | undefined;
  addTimelineEvent: (caseId: string, event: {
    title: string;
    description: string;
    date: string;
    type: "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone";
  }) => Promise<TimelineEvent>;
  linkDraftToCase: (caseId: string, draftId: string) => Promise<void>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCases(workspaceId);
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch workspaces & initialize active workspace
  useEffect(() => {
    async function initWorkspace() {
      try {
        const stored = localStorage.getItem("legaldraft_active_workspace");
        if (stored) {
          setActiveWorkspaceId(stored);
          await loadData(stored);
          return;
        }

        // Fetch workspaces
        let list = await fetchWorkspaces();
        if (list.length === 0) {
          const ws = await provisionWorkspace({
            organization_name: "My Law Firm",
            organization_slug: `firm-${Math.floor(1000 + Math.random() * 9000)}`,
            workspace_name: "Default Workspace",
            workspace_slug: "default"
          });
          list = [ws];
        }

        const activeId = list[0].id;
        setActiveWorkspaceId(activeId);
        localStorage.setItem("legaldraft_active_workspace", activeId);
        await loadData(activeId);
      } catch (err) {
        console.error("Workspace init error in CasesContext", err);
        setIsLoading(false);
      }
    }
    initWorkspace();

    // Listen for workspace switches
    const handler = () => {
      const stored = localStorage.getItem("legaldraft_active_workspace");
      if (stored) {
        setActiveWorkspaceId(stored);
        loadData(stored);
      }
    };
    window.addEventListener("workspace-changed", handler);
    return () => window.removeEventListener("workspace-changed", handler);
  }, [loadData]);

  const createCase = async (caseData: {
    clientName: string;
    clientEmail: string;
    status: CaseStatus;
    category: TemplateCategory;
    assignedLawyer: string;
    court: string;
    filingDate: string;
    nextHearing: string;
    description: string;
  }) => {
    if (!activeWorkspaceId) {
      throw new Error("No active workspace selected");
    }

    // Resolve or auto-create client in the database
    let clientsList = await fetchClients(activeWorkspaceId);
    let client = clientsList.find(c =>
      c.email === caseData.clientEmail ||
      c.full_name.toLowerCase() === caseData.clientName.toLowerCase()
    );

    if (!client) {
      client = await createClient(activeWorkspaceId, {
        full_name: caseData.clientName,
        email: caseData.clientEmail || undefined,
        notes: "Auto-created from Case registration."
      });
    }

    const caseNumber = `CAS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase = await apiCreateCase(activeWorkspaceId, {
      case_number: caseNumber,
      title: `${caseData.clientName} - Case`,
      case_type: caseData.category,
      court: caseData.court,
      judge: "Hon. Judge",  // Default or placeholder judge
      status: caseData.status,
      filing_date: caseData.filingDate,
      hearing_date: caseData.nextHearing,
      description: caseData.description,
      client_id: client.id
    });

    setCases((prev) => [newCase, ...prev]);
    toast.success("Case created and saved to database");
    return newCase;
  };

  const getCase = (id: string) => {
    return cases.find((c) => c.id === id);
  };

  const updateCase = async (id: string, updates: Partial<Case>) => {
    try {
      const updatedCase = await apiUpdateCase(id, updates);
      setCases((prev) => prev.map((c) => (c.id === id ? updatedCase : c)));
      toast.success("Case updated in database");
    } catch (err: any) {
      toast.error(err.message || "Failed to update case");
      throw err;
    }
  };

  const deleteCase = async (id: string) => {
    try {
      await apiDeleteCase(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
      toast.success("Case deleted from database");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete case");
      throw err;
    }
  };

  const addTimelineEvent = async (caseId: string, event: {
    title: string;
    description: string;
    date: string;
    type: "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone";
  }) => {
    try {
      const updatedCase = await apiAddTimelineEvent(caseId, event);
      setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCase : c)));
      toast.success("Timeline event added");

      // Return the newly created event from the end of the timeline list
      const sorted = [...updatedCase.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sorted[0];
    } catch (err: any) {
      toast.error(err.message || "Failed to add event");
      throw err;
    }
  };

  const linkDraftToCase = async (caseId: string, draftId: string) => {
    try {
      const updatedCase = await apiLinkDraftToCase(caseId, draftId);
      setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCase : c)));
      toast.success("Draft linked to case");
    } catch (err: any) {
      toast.error(err.message || "Failed to link draft");
      throw err;
    }
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        isLoading,
        createCase,
        updateCase,
        deleteCase,
        getCase,
        addTimelineEvent,
        linkDraftToCase
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (context === undefined) {
    throw new Error("useCases must be used within a CasesProvider");
  }
  return context;
}
