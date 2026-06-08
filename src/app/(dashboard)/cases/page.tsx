"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockCases } from "@/lib/mock-data";
import { Case, TimelineEvent } from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
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
  filing: "bg-blue-100 border-blue-300",
  hearing: "bg-purple-100 border-purple-300",
  draft: "bg-green-100 border-green-300",
  order: "bg-orange-100 border-orange-300",
  appeal: "bg-red-100 border-red-300",
  milestone: "bg-yellow-100 border-yellow-300",
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
    criminal: "text-red-700 bg-red-50",
    civil: "text-blue-700 bg-blue-50",
    property: "text-orange-700 bg-orange-50",
    family: "text-pink-700 bg-pink-50",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 border rounded-xl cursor-pointer transition-all duration-150 hover:shadow-sm",
        isSelected
          ? "border-purple-400 bg-purple-50/50 shadow-sm"
          : "border-border bg-white hover:border-purple-200"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {caseItem.clientName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
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
            catColors[caseItem.category] || "text-slate-600 bg-slate-50"
          )}
        >
          {caseItem.category}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {caseItem.relatedDrafts.length} draft
          {caseItem.relatedDrafts.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4 pl-10">
            <div
              className={cn(
                "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] -translate-x-1/2 bg-white",
                TIMELINE_TYPE_COLORS[event.type] || "bg-gray-100 border-gray-300"
              )}
            >
              {TIMELINE_TYPE_ICONS[event.type]}
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCase, setSelectedCase] = useState<Case>(mockCases[0]);

  const filtered = mockCases.filter((c) => {
    const matchSearch =
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in">
      {/* Left: Case List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Cases ({filtered.length})
          </h2>
          <Button size="sm" id="new-case-btn" className="h-7 text-xs gap-1">
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
            className="pl-9 h-8 text-sm"
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
                "flex-1 py-1 text-xs rounded-lg font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-purple-700 text-white"
                  : "bg-white border border-border text-muted-foreground hover:bg-muted/30"
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
              onClick={() => setSelectedCase(c)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No cases found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Case Detail */}
      {selectedCase && (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          {/* Case Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-foreground">
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
                    className="gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Add Draft
                  </Button>
                  <Button size="sm" id="case-edit-btn" className="gap-1">
                    Edit Case
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

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">
                  Case Description
                </p>
                <p className="text-sm text-foreground">
                  {selectedCase.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Lawyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Assigned Lawyer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Related Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCase.relatedDrafts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCase.relatedDrafts.map((draftId) => (
                      <Link key={draftId} href={`/editor/${draftId}`}>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-700 hover:underline">
                            Draft {draftId.toUpperCase()}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No drafts linked
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Case Timeline</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
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
      )}
    </div>
  );
}
