"use client";

import React, { useState } from "react";
import {
  Search,
  Star,
  Clock,
  Users,
  FileText,
  ArrowRight,
  Filter,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { mockTemplates } from "@/lib/mock-data";
import { Template } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["all", "criminal", "civil", "property", "family"] as const;

const CATEGORY_META = {
  all: { label: "All Templates", color: "bg-slate-100 text-slate-700" },
  criminal: {
    label: "Criminal",
    color: "bg-red-50 text-red-700",
    icon: "⚖️",
    desc: "FIR, Bail, Charge Sheets",
  },
  civil: {
    label: "Civil",
    color: "bg-blue-50 text-blue-700",
    icon: "📋",
    desc: "Plaints, Injunctions, Suits",
  },
  property: {
    label: "Property",
    color: "bg-orange-50 text-orange-700",
    icon: "🏛️",
    desc: "Sale Deeds, Leases, Disputes",
  },
  family: {
    label: "Family",
    color: "bg-pink-50 text-pink-700",
    icon: "👨‍👩‍👧",
    desc: "Divorce, Custody, Marriage",
  },
};

function TemplateCard({
  template,
  onPreview,
  onUse,
}: {
  template: Template;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
}) {
  const catMeta =
    CATEGORY_META[template.category] || CATEGORY_META.criminal;

  return (
    <Card className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Preview area */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-border px-4 pt-4 pb-2 flex-shrink-0">
        {template.isFeatured && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
              Featured
            </span>
          </div>
        )}
        <div className="bg-white rounded-lg p-3 border border-border/50 shadow-sm font-mono text-[9px] text-muted-foreground leading-relaxed line-clamp-4 min-h-[80px]">
          {template.previewText}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-snug">
              {template.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Badge variant={template.category as any} className="flex-shrink-0 text-[10px]">
            {catMeta.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {template.fields} fields
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.usageCount.toLocaleString()} uses
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(template.lastUsed)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => onPreview(template)}
          id={`preview-template-${template.id}`}
        >
          Preview
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs gap-1"
          onClick={() => onUse(template)}
          id={`use-template-${template.id}`}
        >
          Use Template
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = mockTemplates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
    const matchCat = category === "all" || t.category === category;
    return matchSearch && matchCat;
  });

  const handleUseTemplate = (template: Template) => {
    toast.success("Creating draft from template...", {
      description: `Template: ${template.name}`,
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Template Library</h2>
          <p className="text-sm text-muted-foreground">
            {mockTemplates.length} professional legal templates ready to use
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["criminal", "civil", "property", "family"] as const).map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = mockTemplates.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              id={`category-card-${cat}`}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                category === cat
                  ? "border-purple-700 bg-purple-50"
                  : "border-border bg-white hover:border-purple-300"
              )}
            >
              <span className="text-2xl">{(meta as any).icon}</span>
              <span className="font-semibold text-sm">{meta.label}</span>
              <span className="text-xs text-muted-foreground">
                {(meta as any).desc}
              </span>
              <span className="text-xs font-medium text-purple-700 mt-1">
                {count} templates
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="templates-search"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-tab-${cat}`}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                category === cat
                  ? "bg-purple-700 text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          id="templates-grid"
        >
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={setPreviewTemplate}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No templates found
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Try a different search or category
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog
          open={!!previewTemplate}
          onOpenChange={() => setPreviewTemplate(null)}
        >
          <DialogContent className="sm:max-w-2xl" id="template-preview-modal">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <Badge variant={previewTemplate.category as any}>
                  {previewTemplate.category}
                </Badge>
              </div>
              <DialogDescription>
                {previewTemplate.description}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-slate-50 rounded-xl p-4 border font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap min-h-[200px] max-h-64 overflow-y-auto scrollbar-thin">
              {previewTemplate.previewText}
              {"\n\n"}IN THE MATTER OF PETITION NO: ____/2024
              {"\n\nPETITIONER: [Client Name]\nRESPONDENT: [Opposing Party]\n\nFACTS OF THE CASE:\n1. That the Petitioner is a law-abiding citizen...\n2. That on [Date], the following events occurred...\n\nPRAYER:\nIn view of the aforesaid facts and circumstances, it is most humbly prayed that this Hon'ble Court may be pleased to...\n\n      (Advocate for Petitioner)\n      Bar Council No: _________"}
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{previewTemplate.fields} form fields</span>
              <span>·</span>
              <span>
                {previewTemplate.usageCount.toLocaleString()} times used
              </span>
              <span>·</span>
              <span className="capitalize">{previewTemplate.category} law</span>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                id="use-previewed-template"
                onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
