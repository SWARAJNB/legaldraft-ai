"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Draft, TemplateCategory, DraftStatus } from "@/types";
import { mockDrafts } from "@/lib/mock-data";

interface DraftsContextType {
  drafts: Draft[];
  createDraft: (title: string, clientName: string, category: TemplateCategory, customContent?: string) => Draft;
  getDraft: (id: string) => Draft | undefined;
  getDraftContent: (id: string) => string;
  updateDraftContent: (id: string, newContent: string) => void;
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
}

const DraftsContext = createContext<DraftsContextType | undefined>(undefined);

const SAMPLE_CONTENT_BAIL = `IN THE COURT OF SESSIONS JUDGE, MUMBAI

BAIL APPLICATION NO. ___/2024

IN THE MATTER OF:
State of Maharashtra ... PROSECUTION
                vs.
Rajan Kumar, S/o Suresh Kumar, Aged 34 years,
R/o: 42, Marine Drive, Mumbai - 400 002 ... ACCUSED/APPLICANT

APPLICATION FOR BAIL UNDER SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973

MOST RESPECTFULLY SUBMITTED:

1. That the Applicant is a law-abiding citizen of India and has never been involved in any criminal activity prior to the alleged incident.

2. That the Applicant was arrested on 15th May 2024 in connection with FIR No. 234/2024 registered at Andheri Police Station under Sections 420, 406, and 34 of the Indian Penal Code, 1860.

3. That the allegations against the Applicant are false, frivolous, and based on a motivated complaint by the complainant who has personal enmity with the Applicant.

4. That the Applicant has deep roots in the community, has a family consisting of spouse and two minor children who are completely dependent on him, and there is no possibility of him absconding from justice.

5. That the charge-sheet has not been filed and further detention of the Applicant in judicial custody is unwarranted and unnecessary.

PRAYER:

It is, therefore, most humbly prayed that this Hon'ble Court may be pleased to:

(a) Release the Applicant on bail on such terms and conditions as this Hon'ble Court may deem fit and proper; and

(b) Pass such other and further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.

                                                    Respectfully submitted,

Place: Mumbai                                      (Priya Mehta)
Date:                                              Advocate for Applicant
                                                   Bar Council No.: MH/12345/2019`;

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedDrafts = localStorage.getItem("legaldraft_drafts");
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        setDrafts(mockDrafts);
      }
    } else {
      setDrafts(mockDrafts);
      localStorage.setItem("legaldraft_drafts", JSON.stringify(mockDrafts));
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (newDrafts: Draft[]) => {
    setDrafts(newDrafts);
    localStorage.setItem("legaldraft_drafts", JSON.stringify(newDrafts));
  };

  const createDraft = (title: string, clientName: string, category: TemplateCategory, customContent?: string) => {
    const newId = `d_${Date.now()}`;
    const newObj: Draft = {
      id: newId,
      title: title || `Untitled ${category} draft`,
      caseNumber: `CAS-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName || "General Client",
      status: "draft" as DraftStatus,
      category: category,
      assignedTo: "Rajesh Sharma",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: customContent ? customContent.split(/\s+/).filter(Boolean).length : 284,
      version: 1,
      tags: [category, "draft"]
    };

    const updated = [newObj, ...drafts];
    saveToStorage(updated);

    // Set initial content in localStorage
    const contentKey = `draft_content_${newId}`;
    localStorage.setItem(contentKey, customContent || SAMPLE_CONTENT_BAIL);

    return newObj;
  };

  const getDraft = (id: string) => {
    return drafts.find((d) => d.id === id);
  };

  const getDraftContent = (id: string) => {
    const contentKey = `draft_content_${id}`;
    const localContent = localStorage.getItem(contentKey);
    if (localContent) return localContent;
    return SAMPLE_CONTENT_BAIL;
  };

  const updateDraftContent = (id: string, newContent: string) => {
    const contentKey = `draft_content_${id}`;
    localStorage.setItem(contentKey, newContent);

    // Update draft metadata (word count and updated time)
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    const updatedDrafts = drafts.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          wordCount: words,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    saveToStorage(updatedDrafts);
  };

  const updateDraft = (id: string, updates: Partial<Draft>) => {
    const updatedDrafts = drafts.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    saveToStorage(updatedDrafts);
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter((d) => d.id !== id);
    saveToStorage(updatedDrafts);
    localStorage.removeItem(`draft_content_${id}`);
  };

  return (
    <DraftsContext.Provider
      value={{
        drafts,
        createDraft,
        getDraft,
        getDraftContent,
        updateDraftContent,
        updateDraft,
        deleteDraft,
      }}
    >
      {children}
    </DraftsContext.Provider>
  );
}

export function useDrafts() {
  const context = useContext(DraftsContext);
  if (context === undefined) {
    throw new Error("useDrafts must be used within a DraftsProvider");
  }
  return context;
}
