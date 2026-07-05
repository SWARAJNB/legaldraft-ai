"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Case, TimelineEvent, CaseStatus, TemplateCategory } from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  closed: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/30",
};

const TIMELINE_TYPE_ICONS = {
  filing: "📄",
  hearing: "⚖️",
  draft: "📝",
  order: "📋",
  appeal: "🏛️",
  milestone: "🎯",
};

const TIMELINE_TYPE_COLORS = {
  filing: "bg-blue-100 border-blue-300 dark:bg-blue-950/40 dark:border-blue-900/50",
  hearing: "bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:border-purple-900/50",
  draft: "bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-900/50",
  order: "bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-900/50",
  appeal: "bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-900/50",
  milestone: "bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-900/50",
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
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
            catColors[caseItem.category] || "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20"
          )}
        >
          {caseItem.category}
        </span>
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

  // Modals state
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isEditCaseOpen, setIsEditCaseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDraftOpen, setIsAddDraftOpen] = useState(false);

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

  // Default selection to first case when list loads
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0] || null;

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Action Handlers
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseForm.clientName || !newCaseForm.court) return;

    const newObj = createCase({
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
  };

  const handleEditCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !editForm.clientName || !editForm.court) return;

    updateCase(selectedCase.id, {
      ...editForm,
      filingDate: new Date(editForm.filingDate).toISOString(),
      nextHearing: new Date(editForm.nextHearing).toISOString(),
    });

    setIsEditCaseOpen(false);
  };

  const handleDeleteCase = () => {
    if (!selectedCase) return;
    deleteCase(selectedCase.id);
    setIsDeleteOpen(false);
    setSelectedCaseId(null);
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newEventForm.title || !newEventForm.description) return;

    addTimelineEvent(selectedCase.id, {
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
  };

  const handleLinkDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedDraftIdToLink) return;

    linkDraftToCase(selectedCase.id, selectedDraftIdToLink);
    setIsAddDraftOpen(false);
    setSelectedDraftIdToLink("");
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in text-foreground">
      {/* Left: Case List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Header */}
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

        {/* Search */}
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

        {/* Status filter */}
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

        {/* Case Cards */}
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
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          {/* Case Header */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-foreground truncate max-w-md">
                      {selectedCase.clientName}
                    </h2>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border capitalize",
                        STATUS_COLORS[selectedCase.status]
                      )}
                    >
                      {selectedCase.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedCase.caseNumber}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    id="case-add-draft-btn"
                    onClick={() => setIsAddDraftOpen(true)}
                    className="gap-1 cursor-pointer border-border hover:bg-muted text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Link Draft
                  </Button>
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
                        description: selectedCase.description,
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  {
                    label: "Court",
                    value: selectedCase.court,
                    icon: Scale,
                  },
                  {
                    label: "Category",
                    value: selectedCase.category,
                    icon: Briefcase,
                  },
                  {
                    label: "Filed On",
                    value: formatDate(selectedCase.filingDate),
                    icon: Calendar,
                  },
                  {
                    label: "Next Hearing",
                    value: formatDate(selectedCase.nextHearing),
                    icon: Clock,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium capitalize">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedCase.description && (
                <div className="mt-4 pt-4 border-t border-border">
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

          {/* Assigned Lawyer & Related Drafts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Related Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCase.relatedDrafts && selectedCase.relatedDrafts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCase.relatedDrafts.map((draftId) => {
                      const matchedDraft = drafts.find(d => d.id === draftId);
                      return (
                        <Link key={draftId} href={`/editor/${draftId}`}>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-purple-700 dark:text-purple-400 hover:underline truncate max-w-[180px]">
                              {matchedDraft ? matchedDraft.title : `Draft ${draftId.toUpperCase()}`}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 text-center">
                    <p className="text-sm text-muted-foreground">No drafts linked</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddDraftOpen(true)}
                      className="text-xs text-purple-700 dark:text-purple-400 hover:underline mt-1 h-7 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Link draft now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
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
            <DialogTitle>Edit Case Record</DialogTitle>
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

      {/* Delete Case Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Case Record
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Are you sure you want to delete the case record for{" "}
              <span className="font-bold text-foreground">{selectedCase?.clientName}</span>?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All linked timeline events will be deleted. Linked drafts will remain but will be unlinked.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCase}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Timeline Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Add Timeline Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTimelineEvent}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-xs font-semibold">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  placeholder="e.g. Bail Application Hearing"
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="event-type" className="text-xs font-semibold">Event Type</Label>
                  <select
                    id="event-type"
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value as any })}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  >
                    <option value="filing">Filing</option>
                    <option value="hearing">Hearing</option>
                    <option value="draft">Draft</option>
                    <option value="order">Order</option>
                    <option value="appeal">Appeal</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-desc" className="text-xs font-semibold">Description</Label>
                <Textarea
                  id="event-desc"
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  placeholder="Brief details about what happened or is scheduled..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                  required
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
            <DialogTitle>Link Existing Draft</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkDraft}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-draft-select" className="text-xs font-semibold">Select Draft</Label>
                <select
                  id="link-draft-select"
                  value={selectedDraftIdToLink}
                  onChange={(e) => setSelectedDraftIdToLink(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
                  required
                >
                  <option value="">Choose a draft to link...</option>
                  {drafts
                    .filter((d) => !selectedCase?.relatedDrafts?.includes(d.id))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.id.toUpperCase()})
                      </option>
                    ))}
                </select>
                {drafts.filter((d) => !selectedCase?.relatedDrafts?.includes(d.id)).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No other drafts available to link. Create a draft first.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDraftOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedDraftIdToLink}
                className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
              >
                Link Draft
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
