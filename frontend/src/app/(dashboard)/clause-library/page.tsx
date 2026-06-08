"use client";

import React, { useState } from "react";
import {
  Search,
  Copy,
  Plus,
  Library,
  FileText,
  Tag,
  TrendingUp,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockClauses } from "@/lib/mock-data";
import { Clause } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Dispute Resolution",
  "General",
  "Confidentiality",
  "Liability",
  "Jurisdiction",
  "Termination",
];

function ClauseCard({
  clause,
  onCopy,
}: {
  clause: Clause;
  onCopy: (c: Clause) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(clause);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm leading-snug">{clause.title}</CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] flex-shrink-0 capitalize"
          >
            {clause.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-purple-300">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {clause.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {clause.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground flex items-center gap-0.5"
            >
              <Tag className="h-2 w-2" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{clause.usageCount.toLocaleString()} uses</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-7 text-xs gap-1 transition-all",
              copied && "border-emerald-300 text-emerald-700 bg-emerald-50"
            )}
            onClick={handleCopy}
            id={`copy-clause-${clause.id}`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Clause
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClauseLibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = mockClauses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  const handleCopy = (clause: Clause) => {
    navigator.clipboard.writeText(clause.content);
    toast.success("Clause copied to clipboard!", {
      description: clause.title,
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Clause Library</h2>
          <p className="text-sm text-muted-foreground">
            {mockClauses.length} standard legal clauses ready to insert
          </p>
        </div>
        <Button id="add-clause-btn" className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Add Clause
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Clauses",
            value: mockClauses.length,
            icon: Library,
            color: "bg-purple-50 text-purple-700",
          },
          {
            label: "Categories",
            value: CATEGORIES.length - 1,
            icon: Tag,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Most Used",
            value: "Governing Law",
            icon: TrendingUp,
            color: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Total Uses",
            value: mockClauses
              .reduce((acc, c) => acc + c.usageCount, 0)
              .toLocaleString(),
            icon: FileText,
            color: "bg-orange-50 text-orange-700",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="clause-search"
            placeholder="Search clauses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`clause-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                category === cat
                  ? "bg-purple-700 text-white"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Grid */}
      {filtered.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          id="clauses-grid"
        >
          {filtered.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} onCopy={handleCopy} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Library className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No clauses found
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Try a different search term or category
          </p>
        </div>
      )}
    </div>
  );
}
