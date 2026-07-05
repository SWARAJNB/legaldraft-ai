"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Case, TimelineEvent, CaseStatus, TemplateCategory } from "@/types";
import { mockCases } from "@/lib/mock-data";

interface CasesContextType {
  cases: Case[];
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
  }) => Case;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  getCase: (id: string) => Case | undefined;
  addTimelineEvent: (caseId: string, event: {
    title: string;
    description: string;
    date: string;
    type: "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone";
  }) => TimelineEvent;
  linkDraftToCase: (caseId: string, draftId: string) => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCases = localStorage.getItem("legaldraft_cases");
    if (savedCases) {
      try {
        setCases(JSON.parse(savedCases));
      } catch (e) {
        setCases(mockCases);
      }
    } else {
      setCases(mockCases);
      localStorage.setItem("legaldraft_cases", JSON.stringify(mockCases));
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (newCases: Case[]) => {
    setCases(newCases);
    localStorage.setItem("legaldraft_cases", JSON.stringify(newCases));
  };

  const createCase = (caseData: {
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
    const newId = `c_${Date.now()}`;
    const caseNumber = `CAS-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const newObj: Case = {
      ...caseData,
      id: newId,
      caseNumber,
      relatedDrafts: [],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          date: caseData.filingDate || new Date().toISOString(),
          title: "Case Registered",
          description: `Case registered in database at ${caseData.court || "court"}.`,
          type: "filing"
        }
      ]
    };

    const updated = [newObj, ...cases];
    saveToStorage(updated);
    return newObj;
  };

  const getCase = (id: string) => {
    return cases.find((c) => c.id === id);
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    const updatedCases = cases.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
        };
      }
      return c;
    });
    saveToStorage(updatedCases);
  };

  const deleteCase = (id: string) => {
    const updatedCases = cases.filter((c) => c.id !== id);
    saveToStorage(updatedCases);
  };

  const addTimelineEvent = (caseId: string, event: {
    title: string;
    description: string;
    date: string;
    type: "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone";
  }) => {
    const newEvent: TimelineEvent = {
      id: `tl_${Date.now()}`,
      ...event
    };

    const updatedCases = cases.map((c) => {
      if (c.id === caseId) {
        return {
          ...c,
          timeline: [newEvent, ...c.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      }
      return c;
    });

    saveToStorage(updatedCases);
    return newEvent;
  };

  const linkDraftToCase = (caseId: string, draftId: string) => {
    const updatedCases = cases.map((c) => {
      if (c.id === caseId) {
        if (!c.relatedDrafts.includes(draftId)) {
          return {
            ...c,
            relatedDrafts: [...c.relatedDrafts, draftId]
          };
        }
      }
      return c;
    });
    saveToStorage(updatedCases);
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
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
