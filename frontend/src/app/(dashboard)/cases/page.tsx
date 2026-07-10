"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  FileText,
  ChevronRight,
  User,
  Clock,
  Scale,
  MapPin,
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  PlusCircle,
  CheckCircle,
  FileCheck,
  AlignLeft,
  FileSpreadsheet,
  Users,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCases } from "@/context/cases/CasesContext";
import { useDrafts } from "@/context/drafts/DraftsContext";
import { Case, TimelineEvent, CaseStatus, CasePriority, TemplateCategory } from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  fetchHearings,
  createHearing,
  updateHearing,
  deleteHearing,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  fetchFileIntelligence,
} from "@/lib/api";
import { toast } from "sonner";

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  closed: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/30",
};

const TIMELINE_TYPE_ICONS: Record<string, string> = {
  filing: "📄",
  hearing: "⚖️",
  draft: "📝",
  order: "📋",
  appeal: "🏛️",
  milestone: "🎯",
  task: "✅",
  note: "📌",
};

const TIMELINE_TYPE_COLORS: Record<string, string> = {
  filing: "bg-blue-100 border-blue-300 dark:bg-blue-950/40 dark:border-blue-900/50",
  hearing: "bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:border-purple-900/50",
  draft: "bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-900/50",
  order: "bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-900/50",
  appeal: "bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-900/50",
  milestone: "bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-900/50",
  task: "bg-teal-100 border-teal-300 dark:bg-teal-950/40 dark:border-teal-900/50",
  note: "bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900/50",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
};

function CaseCard({
  caseItem,
  isSelected,
  onClick,
}: {
  caseItem: Case;
  isSelected: boolean;
  onClick: () => void;
}) {
  const catColors: Record<string, string> = {
    criminal: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20",
    civil: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
    property: "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20",
    family: "text-pink-700 bg-pink-50 dark:text-pink-400 dark:bg-pink-950/20",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 border rounded-xl cursor-pointer transition-all duration-150 hover:shadow-sm",
        isSelected
          ? "border-purple-400 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-950/10 shadow-sm"
          : "border-border bg-card hover:border-purple-200 dark:hover:border-purple-900"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {caseItem.clientName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {caseItem.caseNumber}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize",
            STATUS_COLORS[caseItem.status]
          )}
        >
          {caseItem.status}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Scale className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{caseItem.court}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>Next: {formatDate(caseItem.nextHearing)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{caseItem.assignedLawyer}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
              catColors[caseItem.category] || "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20"
            )}
          >
            {caseItem.category}
          </span>
          {caseItem.priority && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize border",
                PRIORITY_COLORS[caseItem.priority] || PRIORITY_COLORS.medium
              )}
            >
              {caseItem.priority}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {caseItem.relatedDrafts?.length || 0} draft
          {(caseItem.relatedDrafts?.length || 0) !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">No events logged yet.</p>;
  }
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-10">
            <div
              className={cn(
                "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] -translate-x-1/2 bg-card",
                TIMELINE_TYPE_COLORS[event.type] || "bg-gray-100 border-gray-300"
              )}
            >
              {TIMELINE_TYPE_ICONS[event.type] || "🔹"}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {event.title}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(event.date)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CasesPage() {
  const { cases, createCase, updateCase, deleteCase, addTimelineEvent, linkDraftToCase } = useCases();
  const { drafts } = useDrafts();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Workflow lists state
  const [hearingsList, setHearingsList] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isEditCaseOpen, setIsEditCaseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDraftOpen, setIsAddDraftOpen] = useState(false);

  // Workflow CRUD Modals
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false);
  const [isEditHearingOpen, setIsEditHearingOpen] = useState(false);
  const [isDeleteHearingOpen, setIsDeleteHearingOpen] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState<any>(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // File Intelligence states
  const [selectedFileIdForDetails, setSelectedFileIdForDetails] = useState<string | null>(null);
  const [fileIntel, setFileIntel] = useState<any>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelActiveTab, setIntelActiveTab] = useState("summary");

  useEffect(() => {
    if (!selectedFileIdForDetails) {
      setFileIntel(null);
      return;
    }

    async function loadIntel() {
      setLoadingIntel(true);
      try {
        const data = await fetchFileIntelligence(selectedFileIdForDetails!);
        setFileIntel(data);
        setIntelActiveTab("summary");
      } catch (err) {
        toast.error("Failed to load file intelligence details");
        setFileIntel(null);
      } finally {
        setLoadingIntel(false);
      }
    }

    loadIntel();
  }, [selectedFileIdForDetails]);

  // Forms state
  const [newCaseForm, setNewCaseForm] = useState({
    clientName: "",
    clientEmail: "",
    status: "active" as CaseStatus,
    category: "criminal" as TemplateCategory,
    assignedLawyer: "Priya Mehta",
    court: "",
    filingDate: new Date().toISOString().split("T")[0],
    nextHearing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "",
  });

  const [editForm, setEditForm] = useState({
    clientName: "",
    clientEmail: "",
    status: "active" as CaseStatus,
    category: "criminal" as TemplateCategory,
    assignedLawyer: "",
    court: "",
    filingDate: "",
    nextHearing: "",
    description: "",
  });

  const [newEventForm, setNewEventForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "hearing" as "filing" | "hearing" | "draft" | "order" | "appeal" | "milestone",
  });

  const [selectedDraftIdToLink, setSelectedDraftIdToLink] = useState("");

  // Workflow forms
  const [newHearingForm, setNewHearingForm] = useState({
    hearing_date: new Date().toISOString().split("T")[0],
    hearing_time: "10:30 AM",
    court_name: "",
    court_hall: "",
    judge_name: "",
    purpose: "",
    notes: "",
    outcome: "",
    next_hearing_date: "",
  });
  const [editHearingForm, setEditHearingForm] = useState({
    hearing_date: "",
    hearing_time: "",
    court_name: "",
    court_hall: "",
    judge_name: "",
    purpose: "",
    notes: "",
    outcome: "",
    next_hearing_date: "",
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: new Date().toISOString().split("T")[0],
    status: "pending",
  });
  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    status: "pending",
  });

  const [newNoteForm, setNewNoteForm] = useState({
    title: "",
    content: "",
  });
  const [editNoteForm, setEditNoteForm] = useState({
    title: "",
    content: "",
  });

  // Default selection to first case when list loads
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0] || null;

  const loadCaseWorkflows = useCallback(async (caseId: string) => {
    try {
      const [hData, tData, nData] = await Promise.all([
        fetchHearings(caseId),
        fetchTasks(caseId),
        fetchNotes(caseId),
      ]);
      setHearingsList(hData);
      setTasksList(tData);
      setNotesList(nData);
    } catch {
      // Silently fall back to empty list on error
    }
  }, []);

  useEffect(() => {
    if (selectedCase?.id) {
      loadCaseWorkflows(selectedCase.id);
      setActiveTab("overview");
    }
  }, [selectedCase?.id, loadCaseWorkflows]);

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Action Handlers
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseForm.clientName || !newCaseForm.court) return;

    try {
      const newObj = await createCase({
        ...newCaseForm,
        filingDate: new Date(newCaseForm.filingDate).toISOString(),
        nextHearing: new Date(newCaseForm.nextHearing).toISOString(),
      });

      setIsNewCaseOpen(false);
      setSelectedCaseId(newObj.id);
      setNewCaseForm({
        clientName: "",
        clientEmail: "",
        status: "active",
        category: "criminal",
        assignedLawyer: "Priya Mehta",
        court: "",
        filingDate: new Date().toISOString().split("T")[0],
        nextHearing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !editForm.clientName || !editForm.court) return;

    try {
      await updateCase(selectedCase.id, {
        ...editForm,
        filingDate: new Date(editForm.filingDate).toISOString(),
        nextHearing: new Date(editForm.nextHearing).toISOString(),
      });
      setIsEditCaseOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCase = async () => {
    if (!selectedCase) return;
    try {
      await deleteCase(selectedCase.id);
      setIsDeleteOpen(false);
      setSelectedCaseId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newEventForm.title || !newEventForm.description) return;

    try {
      await addTimelineEvent(selectedCase.id, {
        ...newEventForm,
        date: new Date(newEventForm.date).toISOString(),
      });

      setIsAddEventOpen(false);
      setNewEventForm({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        type: "hearing",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedDraftIdToLink) return;

    try {
      await linkDraftToCase(selectedCase.id, selectedDraftIdToLink);
      setIsAddDraftOpen(false);
      setSelectedDraftIdToLink("");
    } catch (err) {
      console.error(err);
    }
  };

  // Hearings CRUD handlers
  const handleCreateHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await createHearing({
        case_id: selectedCase.id,
        hearing_date: new Date(newHearingForm.hearing_date).toISOString(),
        hearing_time: newHearingForm.hearing_time || undefined,
        court_name: newHearingForm.court_name || undefined,
        court_hall: newHearingForm.court_hall || undefined,
        judge_name: newHearingForm.judge_name || undefined,
        purpose: newHearingForm.purpose || undefined,
        notes: newHearingForm.notes || undefined,
        outcome: newHearingForm.outcome || undefined,
        next_hearing_date: newHearingForm.next_hearing_date ? new Date(newHearingForm.next_hearing_date).toISOString() : undefined,
      });
      setIsAddHearingOpen(false);
      toast.success("Hearing scheduled successfully");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create hearing");
    }
  };

  const handleUpdateHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedHearing) return;
    try {
      await updateHearing(selectedHearing.id, {
        hearing_date: new Date(editHearingForm.hearing_date).toISOString(),
        hearing_time: editHearingForm.hearing_time,
        court_name: editHearingForm.court_name,
        court_hall: editHearingForm.court_hall,
        judge_name: editHearingForm.judge_name,
        purpose: editHearingForm.purpose,
        notes: editHearingForm.notes,
        outcome: editHearingForm.outcome,
        next_hearing_date: editHearingForm.next_hearing_date ? new Date(editHearingForm.next_hearing_date).toISOString() : null,
      });
      setIsEditHearingOpen(false);
      setSelectedHearing(null);
      toast.success("Hearing details updated");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update hearing");
    }
  };

  const handleDeleteHearing = async () => {
    if (!selectedCase || !selectedHearing) return;
    try {
      await deleteHearing(selectedHearing.id);
      setIsDeleteHearingOpen(false);
      setSelectedHearing(null);
      toast.success("Hearing deleted");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete hearing");
    }
  };

  // Tasks CRUD handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await createTask({
        case_id: selectedCase.id,
        title: newTaskForm.title,
        description: newTaskForm.description || undefined,
        priority: newTaskForm.priority,
        due_date: newTaskForm.due_date ? new Date(newTaskForm.due_date).toISOString() : undefined,
        status: newTaskForm.status,
      });
      setIsAddTaskOpen(false);
      setNewTaskForm({ title: "", description: "", priority: "medium", due_date: new Date().toISOString().split("T")[0], status: "pending" });
      toast.success("Task assigned successfully");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedTask) return;
    try {
      await updateTask(selectedTask.id, {
        title: editTaskForm.title,
        description: editTaskForm.description,
        priority: editTaskForm.priority,
        due_date: editTaskForm.due_date ? new Date(editTaskForm.due_date).toISOString() : null,
        status: editTaskForm.status,
      });
      setIsEditTaskOpen(false);
      setSelectedTask(null);
      toast.success("Task updated");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    if (!selectedCase) return;
    try {
      const nextStatus = task.status === "completed" ? "pending" : "completed";
      await updateTask(task.id, { status: nextStatus });
      toast.success(`Task marked as ${nextStatus}`);
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedCase || !selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setIsDeleteTaskOpen(false);
      setSelectedTask(null);
      toast.success("Task deleted");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  // Notes CRUD handlers
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await createNote({
        case_id: selectedCase.id,
        title: newNoteForm.title,
        content: newNoteForm.content,
      });
      setIsAddNoteOpen(false);
      setNewNoteForm({ title: "", content: "" });
      toast.success("Note added successfully");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedNote) return;
    try {
      await updateNote(selectedNote.id, {
        title: editNoteForm.title,
        content: editNoteForm.content,
      });
      setIsEditNoteOpen(false);
      setSelectedNote(null);
      toast.success("Note updated");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedCase || !selectedNote) return;
    try {
      await deleteNote(selectedNote.id);
      setIsDeleteNoteOpen(false);
      setSelectedNote(null);
      toast.success("Note deleted");
      loadCaseWorkflows(selectedCase.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "hearings", label: "Hearings" },
    { id: "tasks", label: "Tasks" },
    { id: "notes", label: "Notes" },
    { id: "documents", label: "Documents" },
    { id: "drafts", label: "Drafts" },
  ];

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in text-foreground">
      {/* Left: Case List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Cases ({filtered.length})
          </h2>
          <Button
            onClick={() => setIsNewCaseOpen(true)}
            size="sm"
            id="new-case-btn"
            className="h-7 text-xs gap-1 cursor-pointer bg-purple-700 hover:bg-purple-800 text-white"
          >
            <Plus className="h-3 w-3" />
            New Case
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="cases-search"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm bg-card border-border"
          />
        </div>

        <div className="flex gap-1.5">
          {["all", "active", "pending", "closed"].map((s) => (
            <button
              key={s}
              id={`case-filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex-1 py-1 text-xs rounded-lg font-medium capitalize transition-colors cursor-pointer",
                statusFilter === s
                  ? "bg-purple-700 text-white"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5">
          {filtered.map((c) => (
            <CaseCard
              key={c.id}
              caseItem={c}
              isSelected={selectedCase?.id === c.id}
              onClick={() => setSelectedCaseId(c.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
              <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No cases found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Case Detail */}
      {selectedCase ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-1">
          {/* Case Header */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-bold text-foreground truncate max-w-md">
                      {selectedCase.title || selectedCase.clientName}
                    </h2>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border capitalize",
                        STATUS_COLORS[selectedCase.status]
                      )}
                    >
                      {selectedCase.status}
                    </span>
                    {selectedCase.priority && (
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full border capitalize",
                          PRIORITY_COLORS[selectedCase.priority] || PRIORITY_COLORS.medium
                        )}
                      >
                        {selectedCase.priority} priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedCase.caseNumber}
                  </p>
                  {selectedCase.clientName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: {selectedCase.clientName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    id="case-edit-btn"
                    onClick={() => {
                      setEditForm({
                        clientName: selectedCase.clientName,
                        clientEmail: selectedCase.clientEmail || "",
                        status: selectedCase.status,
                        category: selectedCase.category,
                        assignedLawyer: selectedCase.assignedLawyer,
                        court: selectedCase.court,
                        filingDate: selectedCase.filingDate ? selectedCase.filingDate.split("T")[0] : "",
                        nextHearing: selectedCase.nextHearing ? selectedCase.nextHearing.split("T")[0] : "",
                        description: selectedCase.description || "",
                      });
                      setIsEditCaseOpen(true);
                    }}
                    className="gap-1 cursor-pointer border-border hover:bg-muted text-foreground"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit Case
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    id="case-delete-btn"
                    onClick={() => setIsDeleteOpen(true)}
                    className="gap-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Workflow Tabs Selector */}
          <div className="flex gap-1 border-b border-border pb-px overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-700 dark:text-purple-400 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Court", value: selectedCase.court, icon: Scale },
                        { label: "Category", value: selectedCase.category, icon: Briefcase },
                        { label: "Filed On", value: formatDate(selectedCase.filingDate), icon: Calendar },
                        { label: "Next Hearing", value: formatDate(selectedCase.nextHearing), icon: Clock },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm font-medium capitalize truncate">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedCase.description && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">
                          Case Description
                        </p>
                        <p className="text-sm text-foreground">
                          {selectedCase.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lawyer Card */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Assigned Lawyer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {getInitials(selectedCase.assignedLawyer)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {selectedCase.assignedLawyer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedCase.category.charAt(0).toUpperCase() +
                            selectedCase.category.slice(1)}{" "}
                          Law Specialist
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "timeline" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Case Timeline</CardTitle>
                    <Button
                      onClick={() => setIsAddEventOpen(true)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 cursor-pointer text-purple-700 dark:text-purple-400 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                      Add Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Timeline events={selectedCase.timeline} />
                </CardContent>
              </Card>
            )}

            {activeTab === "hearings" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Case Hearings</CardTitle>
                    <Button
                      onClick={() => {
                        setNewHearingForm({
                          hearing_date: new Date().toISOString().split("T")[0],
                          hearing_time: "10:30 AM",
                          court_name: selectedCase.court,
                          court_hall: "",
                          judge_name: "",
                          purpose: "",
                          notes: "",
                          outcome: "",
                          next_hearing_date: "",
                        });
                        setIsAddHearingOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 cursor-pointer text-purple-700 dark:text-purple-400 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                      Schedule Hearing
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hearingsList.length > 0 ? (
                    hearingsList.map((h) => (
                      <div key={h.id} className="p-3.5 border border-border bg-muted/5 rounded-xl hover:border-purple-200 transition-all flex justify-between items-start gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-semibold border-purple-200 text-purple-700 dark:text-purple-400">
                              {new Date(h.hearing_date).toLocaleDateString()}
                            </Badge>
                            {h.hearing_time && (
                              <span className="text-[10px] text-muted-foreground font-medium font-mono">{h.hearing_time}</span>
                            )}
                            {h.purpose && (
                              <span className="text-xs font-semibold text-foreground italic">({h.purpose})</span>
                            )}
                          </div>
                          <p className="text-xs text-foreground font-medium flex items-center gap-1">
                            <Scale className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            {h.court_name || "N/A"} {h.court_hall ? `(Hall: ${h.court_hall})` : ""}
                          </p>
                          {h.judge_name && (
                            <p className="text-[10px] text-muted-foreground">Judge: {h.judge_name}</p>
                          )}
                          {h.notes && (
                            <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/50 max-w-lg mt-1 italic">
                              "{h.notes}"
                            </p>
                          )}
                          {h.outcome && (
                            <p className="text-xs text-emerald-600 font-medium">Outcome: {h.outcome}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedHearing(h);
                              setEditHearingForm({
                                hearing_date: h.hearing_date.split("T")[0],
                                hearing_time: h.hearing_time || "",
                                court_name: h.court_name || "",
                                court_hall: h.court_hall || "",
                                judge_name: h.judge_name || "",
                                purpose: h.purpose || "",
                                notes: h.notes || "",
                                outcome: h.outcome || "",
                                next_hearing_date: h.next_hearing_date ? h.next_hearing_date.split("T")[0] : "",
                              });
                              setIsEditHearingOpen(true);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHearing(h);
                              setIsDeleteHearingOpen(true);
                            }}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No hearings scheduled for this case.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "tasks" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Pending Tasks</CardTitle>
                    <Button
                      onClick={() => {
                        setNewTaskForm({
                          title: "",
                          description: "",
                          priority: "medium",
                          due_date: new Date().toISOString().split("T")[0],
                          status: "pending",
                        });
                        setIsAddTaskOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 cursor-pointer text-purple-700 dark:text-purple-400 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {tasksList.length > 0 ? (
                    tasksList.map((t) => (
                      <div key={t.id} className="p-3 border border-border bg-muted/10 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={t.status === "completed"}
                            onChange={() => handleToggleTaskStatus(t)}
                            className="mt-1 h-3.5 w-3.5 rounded border-border text-purple-700 focus:ring-purple-700 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className={cn(
                              "text-xs font-semibold text-foreground truncate",
                              t.status === "completed" && "line-through text-muted-foreground/60"
                            )}>
                              {t.title}
                            </p>
                            {t.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md">{t.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border",
                                PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium
                              )}>
                                {t.priority}
                              </span>
                              {t.due_date && (
                                <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium font-mono">
                                  <Clock className="h-2.5 w-2.5" />
                                  Due: {new Date(t.due_date).toLocaleDateString()}
                                </span>
                              )}
                              {t.status === "completed" && t.completed_at && (
                                <span className="text-[9px] text-emerald-600 flex items-center gap-1 font-semibold">
                                  <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                                  Completed {new Date(t.completed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setEditTaskForm({
                                title: t.title,
                                description: t.description || "",
                                priority: t.priority,
                                due_date: t.due_date ? t.due_date.split("T")[0] : "",
                                status: t.status,
                              });
                              setIsEditTaskOpen(true);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsDeleteTaskOpen(true);
                            }}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No tasks pending for this case.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "notes" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Case Notes & Files</CardTitle>
                    <Button
                      onClick={() => {
                        setNewNoteForm({ title: "", content: "" });
                        setIsAddNoteOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 cursor-pointer text-purple-700 dark:text-purple-400 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notesList.length > 0 ? (
                    notesList.map((n) => (
                      <div key={n.id} className="p-3.5 border border-border bg-muted/10 rounded-xl hover:border-purple-200 transition-colors flex justify-between items-start gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {n.content}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-medium pt-1">
                            Logged on {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedNote(n);
                              setEditNoteForm({
                                title: n.title,
                                content: n.content,
                              });
                              setIsEditNoteOpen(true);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNote(n);
                              setIsDeleteNoteOpen(true);
                            }}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No case notes added yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "documents" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Linked Documents</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedCase.relatedFiles?.length || 0} Files
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Documents are automatically uploaded and indexed within the case workspace. Click on a file card below to view summaries, clauses, metadata, parties, and AI Insights.
                  </p>
                  <div className="mt-3.5 space-y-2">
                    {selectedCase.relatedFiles && selectedCase.relatedFiles.length > 0 ? (
                      selectedCase.relatedFiles.map((docId: string) => (
                        <div
                          key={docId}
                          onClick={() => setSelectedFileIdForDetails(docId)}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/10 hover:border-purple-200 transition-colors cursor-pointer group"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-purple-600 flex-shrink-0 group-hover:scale-105 transition-transform" />
                          <span className="text-xs font-semibold truncate text-foreground flex-1 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                            Document ID: {docId.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            View AI Insights &rarr;
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                        No documents linked to this case.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "drafts" && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Related Case Drafts</CardTitle>
                    <Button
                      onClick={() => setIsAddDraftOpen(true)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 cursor-pointer text-purple-700 dark:text-purple-400 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                      Link Draft
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCase.relatedDrafts && selectedCase.relatedDrafts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {selectedCase.relatedDrafts.map((draftId) => {
                        const matchedDraft = drafts.find(d => d.id === draftId);
                        return (
                          <Link key={draftId} href={`/editor/${draftId}`}>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/10 hover:border-purple-200 transition-colors cursor-pointer group">
                              <FileCheck className="h-4 w-4 text-purple-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-foreground hover:underline truncate flex-1">
                                {matchedDraft ? matchedDraft.title : `Draft ${draftId.toUpperCase()}`}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-purple-600 transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No drafts linked.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-card border border-border rounded-xl">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-2 animate-pulse" />
          <p className="text-lg font-semibold">Select or Create a Case</p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Choose a case from the list on the left to see the details, or create a new one to get started.
          </p>
          <Button
            onClick={() => setIsNewCaseOpen(true)}
            className="mt-4 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Case Record
          </Button>
        </div>
      )}

      {/* MODALS */}

      {/* New Case Dialog */}
      <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Create New Case Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCase}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-client-name" className="text-xs font-semibold">Client Name</Label>
                  <Input
                    id="new-client-name"
                    value={newCaseForm.clientName}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, clientName: e.target.value })}
                    placeholder="e.g. Rajan Kumar"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-client-email" className="text-xs font-semibold">Client Email</Label>
                  <Input
                    id="new-client-email"
                    type="email"
                    value={newCaseForm.clientEmail}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, clientEmail: e.target.value })}
                    placeholder="rajan@example.com"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-category" className="text-xs font-semibold">Category</Label>
                  <select
                    id="new-category"
                    value={newCaseForm.category}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, category: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                    <option value="property">Property</option>
                    <option value="family">Family</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-status" className="text-xs font-semibold">Status</Label>
                  <select
                    id="new-status"
                    value={newCaseForm.status}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, status: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-lawyer" className="text-xs font-semibold">Assigned Lawyer</Label>
                  <select
                    id="new-lawyer"
                    value={newCaseForm.assignedLawyer}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, assignedLawyer: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rajesh Sharma">Rajesh Sharma</option>
                    <option value="Arjun Kapoor">Arjun Kapoor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-court" className="text-xs font-semibold">Court / Forum</Label>
                  <Input
                    id="new-court"
                    value={newCaseForm.court}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, court: e.target.value })}
                    placeholder="e.g. Sessions Court, Mumbai"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-filing-date" className="text-xs font-semibold">Filing Date</Label>
                  <Input
                    id="new-filing-date"
                    type="date"
                    value={newCaseForm.filingDate}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, filingDate: e.target.value })}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-next-hearing" className="text-xs font-semibold">Next Hearing Date</Label>
                  <Input
                    id="new-next-hearing"
                    type="date"
                    value={newCaseForm.nextHearing}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, nextHearing: e.target.value })}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-desc" className="text-xs font-semibold">Case Description</Label>
                <Textarea
                  id="new-desc"
                  value={newCaseForm.description}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, description: e.target.value })}
                  placeholder="Summary of charge sheet, claims, or contract dispute details..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewCaseOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Case
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={isEditCaseOpen} onOpenChange={setIsEditCaseOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Case Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCase}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-client-name" className="text-xs font-semibold">Client Name</Label>
                  <Input
                    id="edit-client-name"
                    value={editForm.clientName}
                    onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                    placeholder="e.g. Rajan Kumar"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-client-email" className="text-xs font-semibold">Client Email</Label>
                  <Input
                    id="edit-client-email"
                    type="email"
                    value={editForm.clientEmail}
                    onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                    placeholder="rajan@example.com"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-xs font-semibold">Category</Label>
                  <select
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                    <option value="property">Property</option>
                    <option value="family">Family</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-xs font-semibold">Status</Label>
                  <select
                    id="edit-status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lawyer" className="text-xs font-semibold">Assigned Lawyer</Label>
                  <select
                    id="edit-lawyer"
                    value={editForm.assignedLawyer}
                    onChange={(e) => setEditForm({ ...editForm, assignedLawyer: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rajesh Sharma">Rajesh Sharma</option>
                    <option value="Arjun Kapoor">Arjun Kapoor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-court" className="text-xs font-semibold">Court / Forum</Label>
                  <Input
                    id="edit-court"
                    value={editForm.court}
                    onChange={(e) => setEditForm({ ...editForm, court: e.target.value })}
                    placeholder="e.g. Sessions Court, Mumbai"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-filing-date" className="text-xs font-semibold">Filing Date</Label>
                  <Input
                    id="edit-filing-date"
                    type="date"
                    value={editForm.filingDate}
                    onChange={(e) => setEditForm({ ...editForm, filingDate: e.target.value })}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-next-hearing" className="text-xs font-semibold">Next Hearing Date</Label>
                  <Input
                    id="edit-next-hearing"
                    type="date"
                    value={editForm.nextHearing}
                    onChange={(e) => setEditForm({ ...editForm, nextHearing: e.target.value })}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-xs font-semibold">Case Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Summary details..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditCaseOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Case Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Confirm Delete Case</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete this case record? All related drafts, documents, timeline events, and notes logs linked specifically to this case will be soft-deleted. This action is irreversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleDeleteCase} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Delete Case Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Log Timeline Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTimelineEvent}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-xs font-semibold">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  placeholder="e.g. Rejoinder Filed"
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type" className="text-xs font-semibold">Event Type</Label>
                  <select
                    id="event-type"
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="filing">Filing / Application</option>
                    <option value="hearing">Court Hearing</option>
                    <option value="draft">Draft Generated</option>
                    <option value="order">Order / Judgement</option>
                    <option value="appeal">Appeal Filed</option>
                    <option value="milestone">Other Milestone</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date" className="text-xs font-semibold">Event Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-desc" className="text-xs font-semibold">Event Details</Label>
                <Textarea
                  id="event-desc"
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  placeholder="Describe what occurred, outcomes, or notes..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Add Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Draft Dialog */}
      <Dialog open={isAddDraftOpen} onOpenChange={setIsAddDraftOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Link Draft to Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkDraft}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-draft-select" className="text-xs font-semibold">Select Draft</Label>
                <select
                  id="link-draft-select"
                  value={selectedDraftIdToLink}
                  onChange={(e) => setSelectedDraftIdToLink(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  required
                >
                  <option value="">-- Choose Draft --</option>
                  {drafts.filter(d => !selectedCase.relatedDrafts?.includes(d.id)).map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDraftOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedDraftIdToLink} className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Link Draft
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE HEARING DIALOG */}
      <Dialog open={isAddHearingOpen} onOpenChange={setIsAddHearingOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Schedule Hearing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateHearing}>
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-date-input" className="text-xs font-semibold">Hearing Date</Label>
                  <Input
                    id="hearing-date-input"
                    type="date"
                    required
                    value={newHearingForm.hearing_date}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, hearing_date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-time-input" className="text-xs font-semibold">Hearing Time</Label>
                  <Input
                    id="hearing-time-input"
                    placeholder="e.g. 10:30 AM"
                    value={newHearingForm.hearing_time}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, hearing_time: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-court-input" className="text-xs font-semibold">Court Name</Label>
                  <Input
                    id="hearing-court-input"
                    placeholder="Court / Forum"
                    value={newHearingForm.court_name}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, court_name: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-hall-input" className="text-xs font-semibold">Court Hall / Room</Label>
                  <Input
                    id="hearing-hall-input"
                    placeholder="Room / Hall Number"
                    value={newHearingForm.court_hall}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, court_hall: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-judge-input" className="text-xs font-semibold">Judge Name</Label>
                  <Input
                    id="hearing-judge-input"
                    placeholder="Judge Name"
                    value={newHearingForm.judge_name}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, judge_name: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hearing-purpose-input" className="text-xs font-semibold">Purpose of Listing</Label>
                  <Input
                    id="hearing-purpose-input"
                    placeholder="e.g. Admission, Argument"
                    value={newHearingForm.purpose}
                    onChange={(e) => setNewHearingForm({ ...newHearingForm, purpose: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hearing-notes-input" className="text-xs font-semibold">Adjournment Notes</Label>
                <Textarea
                  id="hearing-notes-input"
                  placeholder="Notes, steps to perform, or listing details..."
                  value={newHearingForm.notes}
                  onChange={(e) => setNewHearingForm({ ...newHearingForm, notes: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[60px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddHearingOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Schedule Hearing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT HEARING DIALOG */}
      <Dialog open={isEditHearingOpen} onOpenChange={setIsEditHearingOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Hearing Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateHearing}>
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-date" className="text-xs font-semibold">Hearing Date</Label>
                  <Input
                    id="edit-hearing-date"
                    type="date"
                    required
                    value={editHearingForm.hearing_date}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, hearing_date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-time" className="text-xs font-semibold">Hearing Time</Label>
                  <Input
                    id="edit-hearing-time"
                    value={editHearingForm.hearing_time}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, hearing_time: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-court" className="text-xs font-semibold">Court Name</Label>
                  <Input
                    id="edit-hearing-court"
                    value={editHearingForm.court_name}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, court_name: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-hall" className="text-xs font-semibold">Court Hall / Room</Label>
                  <Input
                    id="edit-hearing-hall"
                    value={editHearingForm.court_hall}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, court_hall: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-judge" className="text-xs font-semibold">Judge Name</Label>
                  <Input
                    id="edit-hearing-judge"
                    value={editHearingForm.judge_name}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, judge_name: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-purpose" className="text-xs font-semibold">Purpose of Listing</Label>
                  <Input
                    id="edit-hearing-purpose"
                    value={editHearingForm.purpose}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, purpose: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-hearing-notes" className="text-xs font-semibold">Notes</Label>
                <Textarea
                  id="edit-hearing-notes"
                  value={editHearingForm.notes}
                  onChange={(e) => setEditHearingForm({ ...editHearingForm, notes: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-outcome" className="text-xs font-semibold">Outcome / Order</Label>
                  <Input
                    id="edit-hearing-outcome"
                    value={editHearingForm.outcome}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, outcome: e.target.value })}
                    className="bg-background border-border text-foreground"
                    placeholder="Outcome of today's hearing"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-hearing-next" className="text-xs font-semibold">Next Hearing Date</Label>
                  <Input
                    id="edit-hearing-next"
                    type="date"
                    value={editHearingForm.next_hearing_date}
                    onChange={(e) => setEditHearingForm({ ...editHearingForm, next_hearing_date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditHearingOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE HEARING DIALOG */}
      <Dialog open={isDeleteHearingOpen} onOpenChange={setIsDeleteHearingOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Cancel / Delete Hearing</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel and delete this scheduled court listing? This will update the case records and timeline.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteHearingOpen(false)} className="border-border">
              Keep Listing
            </Button>
            <Button onClick={handleDeleteHearing} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Cancel Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD TASK DIALOG */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Add Pending Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-title-input" className="text-xs font-semibold">Task Title</Label>
                <Input
                  id="task-title-input"
                  required
                  placeholder="e.g. Review complainant's rejoinder"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="task-priority-input" className="text-xs font-semibold">Priority</Label>
                  <select
                    id="task-priority-input"
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-due-input" className="text-xs font-semibold">Due Date</Label>
                  <Input
                    id="task-due-input"
                    type="date"
                    value={newTaskForm.due_date}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, due_date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-desc-input" className="text-xs font-semibold">Description</Label>
                <Textarea
                  id="task-desc-input"
                  placeholder="Provide sub-tasks, notes, or research items required..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[60px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Assign Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Task Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-task-title" className="text-xs font-semibold">Task Title</Label>
                <Input
                  id="edit-task-title"
                  required
                  value={editTaskForm.title}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-task-priority" className="text-xs font-semibold">Priority</Label>
                  <select
                    id="edit-task-priority"
                    value={editTaskForm.priority}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-task-due" className="text-xs font-semibold">Due Date</Label>
                  <Input
                    id="edit-task-due"
                    type="date"
                    value={editTaskForm.due_date}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, due_date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-task-status" className="text-xs font-semibold">Status</Label>
                  <select
                    id="edit-task-status"
                    value={editTaskForm.status}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-task-desc" className="text-xs font-semibold">Description</Label>
                <Textarea
                  id="edit-task-desc"
                  value={editTaskForm.description}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[60px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditTaskOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE TASK DIALOG */}
      <Dialog open={isDeleteTaskOpen} onOpenChange={setIsDeleteTaskOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this pending task? This will remove it from the case workflow records.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTaskOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD NOTE DIALOG */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Add Case Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNote}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="note-title-input" className="text-xs font-semibold">Note Title</Label>
                <Input
                  id="note-title-input"
                  required
                  placeholder="e.g. Client consultation facts"
                  value={newNoteForm.title}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, title: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note-content-input" className="text-xs font-semibold">Note Content</Label>
                <Textarea
                  id="note-content-input"
                  required
                  placeholder="Write the case updates, claim analysis details, or reminders..."
                  value={newNoteForm.content}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, content: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddNoteOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT NOTE DIALOG */}
      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Case Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateNote}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-note-title" className="text-xs font-semibold">Note Title</Label>
                <Input
                  id="edit-note-title"
                  required
                  value={editNoteForm.title}
                  onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-note-content" className="text-xs font-semibold">Note Content</Label>
                <Textarea
                  id="edit-note-content"
                  required
                  value={editNoteForm.content}
                  onChange={(e) => setEditNoteForm({ ...editNoteForm, content: e.target.value })}
                  className="bg-background border-border text-foreground min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditNoteOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE NOTE DIALOG */}
      <Dialog open={isDeleteNoteOpen} onOpenChange={setIsDeleteNoteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Case Note</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this case note? This action is irreversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteNoteOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Details / AI File Intelligence Dialog */}
      <Dialog open={!!selectedFileIdForDetails} onOpenChange={(open) => !open && setSelectedFileIdForDetails(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="h-5 w-5 text-purple-600" />
              {fileIntel?.documentTitle || "Document AI Intelligence"}
            </DialogTitle>
          </DialogHeader>

          {loadingIntel ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Running Document Text Extraction & AI Analysis...</p>
            </div>
          ) : fileIntel ? (
            <div className="space-y-4 pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200">
                  Classification: {fileIntel.classification || "Other"}
                </Badge>
                {fileIntel.workspaceId && (
                  <span className="text-[10px] text-muted-foreground font-medium font-mono">Workspace Linked</span>
                )}
                {fileIntel.caseId && (
                  <span className="text-[10px] text-muted-foreground font-medium font-mono">Case Linked</span>
                )}
              </div>

              <div className="flex gap-1 border-b border-border pb-px overflow-x-auto scrollbar-none">
                {[
                  { id: "summary", label: "Summary" },
                  { id: "metadata", label: "Metadata" },
                  { id: "parties", label: "Parties" },
                  { id: "dates", label: "Dates" },
                  { id: "clauses", label: "Clauses" },
                  { id: "insights", label: "AI Insights" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setIntelActiveTab(tab.id)}
                    className={cn(
                      "px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap",
                      intelActiveTab === tab.id
                        ? "border-purple-600 text-purple-700 dark:text-purple-400 font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                {intelActiveTab === "summary" && (
                  <div className="space-y-4">
                    <div className="p-4 border border-purple-100 dark:border-purple-950 bg-purple-50/10 dark:bg-purple-950/5 rounded-xl">
                      <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1.5">Brief Summary</h4>
                      <p className="text-sm leading-relaxed font-medium text-foreground">{fileIntel.shortSummary}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Detailed Analysis</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border whitespace-pre-wrap">
                        {fileIntel.detailedSummary}
                      </p>
                    </div>
                  </div>
                )}

                {intelActiveTab === "metadata" && (
                  <Card className="border-border bg-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Original Document Title</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">{fileIntel.documentTitle}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Document Type / Classification</p>
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mt-0.5">{fileIntel.classification}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Workspace ID</p>
                          <p className="text-xs font-mono text-foreground mt-0.5 truncate">{fileIntel.workspaceId || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Case ID</p>
                          <p className="text-xs font-mono text-foreground mt-0.5 truncate">{fileIntel.caseId || "N/A"}</p>
                        </div>
                      </div>

                      {fileIntel.keywords && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-[10px] text-muted-foreground mb-1.5">Document Keywords</p>
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(fileIntel.keywords || "[]").map((kw: string) => (
                              <Badge key={kw} variant="outline" className="text-[9px] capitalize">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {fileIntel.tags && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-[10px] text-muted-foreground mb-1.5">AI Classification Tags</p>
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(fileIntel.tags || "[]").map((tag: string) => (
                              <Badge key={tag} className="text-[9px] bg-purple-100 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {intelActiveTab === "parties" && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Primary Parties Extracted</h4>
                    {JSON.parse(fileIntel.parties || "[]").length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {JSON.parse(fileIntel.parties || "[]").map((party: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/10">
                            <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-foreground">{party}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No primary parties explicitly identified by the model.</p>
                    )}
                  </div>
                )}

                {intelActiveTab === "dates" && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Key Dates & Deadlines</h4>
                    {JSON.parse(fileIntel.importantDates || "[]").length > 0 ? (
                      <div className="space-y-2">
                        {JSON.parse(fileIntel.importantDates || "[]").map((dateStr: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/10">
                            <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-foreground">{dateStr}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No important dates highlighted in the document.</p>
                    )}
                  </div>
                )}

                {intelActiveTab === "clauses" && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Key Clause Headings</h4>
                    {JSON.parse(fileIntel.clauseHeadings || "[]").length > 0 ? (
                      <div className="space-y-2">
                        {JSON.parse(fileIntel.clauseHeadings || "[]").map((clause: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/10">
                            <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-foreground">{clause}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No key clause headings extracted.</p>
                    )}
                  </div>
                )}

                {intelActiveTab === "insights" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Extracted Raw Text Preview</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {fileIntel.extractedText ? fileIntel.extractedText.length : 0} characters
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-4 border border-border bg-muted/20 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground scrollbar-thin">
                      {fileIntel.extractedText || "No raw text extracted."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">No AI Insights Available</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                We couldn't load the AI intelligence record. This file may not have been processed yet or is of an unsupported format.
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border mt-4">
            <Button onClick={() => setSelectedFileIdForDetails(null)} className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
              Close Panel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
