"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  FileEdit,
  Archive,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  CheckSquare,
  FileText,
  SortAsc,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDrafts } from "@/context/drafts/DraftsContext";
import { Draft } from "@/types";
import { cn, formatRelativeTime, downloadDraft } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "finalized", label: "Finalized" },
  { value: "archived", label: "Archived" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "criminal", label: "Criminal" },
  { value: "civil", label: "Civil" },
  { value: "property", label: "Property" },
  { value: "family", label: "Family" },
];

function StatusBadge({ status }: { status: Draft["status"] }) {
  const labels: Record<Draft["status"], string> = {
    draft: "Draft",
    "in-progress": "In Progress",
    review: "Under Review",
    finalized: "Finalized",
    archived: "Archived",
  };
  return (
    <Badge variant={status as any} className="text-[11px] capitalize">
      {labels[status]}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: Draft["category"] }) {
  const labels: Record<Draft["category"], string> = {
    criminal: "Criminal",
    civil: "Civil",
    property: "Property",
    family: "Family",
  };
  return (
    <Badge variant={category as any} className="text-[11px]">
      {labels[category]}
    </Badge>
  );
}

export default function DraftsPage() {
  const { drafts, createDraft, deleteDraft } = useDrafts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDraft, setNewDraft] = useState({
    title: "",
    clientName: "",
    category: "criminal",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("create") === "true") {
        setShowCreateModal(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const filtered = drafts.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || d.status === statusFilter;
    const matchCat =
      categoryFilter === "all" || d.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const toggleSelect = (id: string) => {
    setSelectedDrafts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedDrafts.length === filtered.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(filtered.map((d) => d.id));
    }
  };

  const handleCreate = () => {
    const created = createDraft(newDraft.title, newDraft.clientName, newDraft.category as any);
    toast.success("Draft created successfully!", {
      description: created.title || "New draft",
    });
    setShowCreateModal(false);
    setNewDraft({ title: "", clientName: "", category: "criminal" });
  };

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setSelectedDrafts((prev) => prev.filter((x) => x !== id));
    toast.success("Draft deleted successfully!");
  };

  const statusCounts = {
    all: drafts.length,
    "in-progress": drafts.filter((d) => d.status === "in-progress").length,
    review: drafts.filter((d) => d.status === "review").length,
    finalized: drafts.filter((d) => d.status === "finalized").length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            All Drafts
          </h2>
          <p className="text-sm text-muted-foreground">
            {drafts.length} total drafts across all categories
          </p>
        </div>
        <Button
          id="create-draft-btn"
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Draft
        </Button>
      </div>

      {/* Status quick filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All", count: statusCounts.all },
          {
            key: "in-progress",
            label: "In Progress",
            count: statusCounts["in-progress"],
          },
          { key: "review", label: "Review", count: statusCounts.review },
          {
            key: "finalized",
            label: "Finalized",
            count: statusCounts.finalized,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            id={`status-tab-${tab.key}`}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              statusFilter === tab.key
                ? "bg-purple-700 text-white"
                : "bg-white border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                statusFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="drafts-search"
            placeholder="Search by title, client, case number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36" id="category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedDrafts.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">
              {selectedDrafts.length} selected
            </span>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" id="drafts-table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 w-8">
                  <button
                    onClick={toggleAll}
                    id="select-all-drafts"
                    className="h-4 w-4 rounded border-2 border-border flex items-center justify-center hover:border-purple-700 transition-colors"
                  >
                    {selectedDrafts.length === filtered.length &&
                      filtered.length > 0 && (
                        <div className="h-2 w-2 bg-purple-700 rounded-sm" />
                      )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Updated
                </th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((draft) => (
                <tr
                  key={draft.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/20 transition-colors",
                    selectedDrafts.includes(draft.id) && "bg-purple-50/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(draft.id)}
                      className="h-4 w-4 rounded border-2 border-border flex items-center justify-center hover:border-purple-700 transition-colors"
                    >
                      {selectedDrafts.includes(draft.id) && (
                        <div className="h-2 w-2 bg-purple-700 rounded-sm" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <Link href={`/editor/${draft.id}`}>
                        <p className="text-sm font-medium text-foreground hover:text-purple-700 transition-colors line-clamp-1">
                          {draft.title}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {draft.caseNumber} · v{draft.version} ·{" "}
                        {draft.wordCount.toLocaleString()} words
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-foreground">{draft.clientName}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <CategoryBadge category={draft.category} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={draft.status} />
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <p className="text-sm text-muted-foreground">
                      {draft.assignedTo}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(draft.updatedAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          id={`draft-actions-${draft.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/editor/${draft.id}`} className="flex items-center gap-2">
                            <FileEdit className="h-4 w-4" />
                            Edit Draft
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          downloadDraft(draft);
                          toast.success("Document exported successfully!", {
                            description: "File saved to your Downloads folder.",
                          });
                        }} className="cursor-pointer">
                          <Download className="h-4 w-4" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(draft.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No drafts found
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {drafts.length} drafts
          </p>
          <div className="flex gap-1">
            {["1", "2", "3"].map((page) => (
              <button
                key={page}
                className={cn(
                  "h-7 w-7 rounded text-xs font-medium transition-colors",
                  page === "1"
                    ? "bg-purple-700 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Create Draft Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md" id="create-draft-modal">
          <DialogHeader>
            <DialogTitle>Create New Draft</DialogTitle>
            <DialogDescription>
              Start a new legal document draft. You can select a template or
              start from scratch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="draft-title">Draft Title</Label>
              <Input
                id="draft-title"
                placeholder="e.g., Bail Application — State vs. John Doe"
                value={newDraft.title}
                onChange={(e) =>
                  setNewDraft({ ...newDraft, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="draft-client">Client Name</Label>
              <Input
                id="draft-client"
                placeholder="Client name"
                value={newDraft.clientName}
                onChange={(e) =>
                  setNewDraft({ ...newDraft, clientName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="draft-category">Category</Label>
              <Select
                value={newDraft.category}
                onValueChange={(v) =>
                  setNewDraft({ ...newDraft, category: v })
                }
              >
                <SelectTrigger id="draft-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button id="confirm-create-draft" onClick={handleCreate}>
              Create Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
