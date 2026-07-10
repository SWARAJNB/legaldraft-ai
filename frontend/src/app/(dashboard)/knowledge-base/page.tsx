"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import {
  fetchKnowledgeBase,
  searchKnowledgeBase,
  answerFromKnowledgeBase,
  type KnowledgeBaseSummary,
  type RetrievalResult,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const statusVariant = {
  indexed: "success",
  pending: "warning",
  empty: "secondary",
  failed: "destructive",
} as const;

export default function KnowledgeBasePage() {
  const [summary, setSummary] = useState<KnowledgeBaseSummary | null>(null);
  const [query, setQuery] = useState("Find important dates, parties, and obligations");
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("legaldraft_active_workspace");
    setWorkspaceId(stored);

    const handler = () => setWorkspaceId(localStorage.getItem("legaldraft_active_workspace"));
    window.addEventListener("workspace-changed", handler);
    return () => window.removeEventListener("workspace-changed", handler);
  }, []);

  useEffect(() => {
    async function loadKnowledgeBase() {
      setIsLoading(true);
      try {
        const data = await fetchKnowledgeBase({ workspaceId });
        setSummary(data);
        setResults(data.searchPreview || []);
      } finally {
        setIsLoading(false);
      }
    }
    loadKnowledgeBase();
  }, [workspaceId]);

  const stats = useMemo(() => {
    const documents = summary?.documents || [];
    return {
      indexed: documents.filter((doc) => doc.embeddingStatus === "indexed").length,
      chunks: documents.reduce((sum, doc) => sum + doc.chunkCount, 0),
      sources: summary?.aiSources.length || 0,
      documents: documents.length,
    };
  }, [summary]);

  async function runSearch(includeAnswer = false) {
    if (!query.trim()) return;
    setIsSearching(true);
    setAnswer("");
    try {
      const nextResults = await searchKnowledgeBase({
        question: query,
        workspaceId,
        topK: 8,
      });
      setResults(nextResults);

      if (includeAnswer) {
        const data = await answerFromKnowledgeBase({
          question: query,
          workspaceId,
        });
        setAnswer(data.response);
        setResults(data.citations);
      }
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Indexed workspace documents, AI sources, and hybrid retrieval preview.
          </p>
        </div>
        <Badge variant="outline" className="w-fit font-mono">
          Local ChromaDB
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Indexed Documents", value: stats.indexed, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Total Documents", value: stats.documents, icon: FileText, color: "text-blue-600" },
          { label: "Chunks", value: stats.chunks, icon: Database, color: "text-purple-600" },
          { label: "AI Sources", value: stats.sources, icon: Brain, color: "text-orange-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              </div>
              <item.icon className={cn("h-5 w-5", item.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Indexed Documents
            </CardTitle>
            <CardDescription>Embedding status, chunk count, and last indexed time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 text-left font-medium">Document Name</th>
                    <th className="py-2 text-left font-medium">Embedding Status</th>
                    <th className="py-2 text-right font-medium">Chunk Count</th>
                    <th className="py-2 text-left font-medium">Last Indexed</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Loading knowledge base...
                      </td>
                    </tr>
                  ) : summary?.documents.length ? (
                    summary.documents.map((doc) => (
                      <tr key={doc.fileId} className="border-b last:border-0">
                        <td className="py-3 pr-4 max-w-[320px]">
                          <p className="font-medium text-foreground truncate">{doc.documentName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {doc.caseId || doc.workspaceId || "workspace"}
                          </p>
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant[doc.embeddingStatus]}>
                            {doc.embeddingStatus}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-mono">{doc.chunkCount}</td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {doc.lastIndexed ? new Date(doc.lastIndexed).toLocaleString() : "Not indexed"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No uploaded documents have file intelligence yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Sources
            </CardTitle>
            <CardDescription>Classifications, tags, and extracted keywords</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary?.aiSources.length ? (
                summary.aiSources.slice(0, 28).map((source) => (
                  <Badge key={source} variant="outline" className="max-w-full truncate">
                    {source}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No AI sources available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-600" />
            Search Preview
          </CardTitle>
          <CardDescription>Hybrid PostgreSQL full-text search plus local vector retrieval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask a question about indexed documents"
              className="md:flex-1"
            />
            <Button onClick={() => runSearch(false)} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={() => runSearch(true)} disabled={isSearching}>
              <Brain className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>

          {answer && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                AI Answer
              </p>
              <p className="text-sm leading-6 whitespace-pre-wrap">{answer}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {results.length ? (
              results.map((result) => (
                <div key={`${result.fileId}-${result.chunkIndex}-${result.source}`} className="rounded-lg border p-3 bg-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{result.documentName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Page {result.pageNumber}
                      </p>
                    </div>
                    <Badge variant={result.source === "hybrid" ? "success" : "info"}>
                      {Math.round(result.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground line-clamp-5">{result.chunk}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                    {result.source.replace("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <div className="lg:col-span-2 text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                Retrieval results will appear here after indexing or search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
