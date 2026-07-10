"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Star,
  Clock,
  Users,
  FileText,
  ArrowRight,
  Filter,
  BookOpen,
  Upload,
  History,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Play,
  ArrowLeft,
  Trash,
  Plus,
  ChevronRight,
  HelpCircle,
  Undo,
  Calendar,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchTemplates,
  fetchTemplateById,
  uploadTemplate,
  savePlaceholders,
  fetchTemplateVersions,
  restoreTemplateVersion,
  generateDraftFromTemplate,
  askInterviewQuestion,
} from "@/lib/api";

const CATEGORIES = ["all", "criminal", "civil", "property", "family", "corporate", "employment", "other"] as const;

const CATEGORY_META = {
  all: { label: "All Templates", color: "bg-slate-100 text-slate-700" },
  criminal: { label: "Criminal", color: "bg-red-50 text-red-700", icon: "⚖️", desc: "FIR, Bail, Charge Sheets" },
  civil: { label: "Civil", color: "bg-blue-50 text-blue-700", icon: "📋", desc: "Plaints, Injunctions, Suits" },
  property: { label: "Property", color: "bg-orange-50 text-orange-700", icon: "🏛️", desc: "Sale Deeds, Leases" },
  family: { label: "Family", color: "bg-pink-50 text-pink-700", icon: "👨‍👩‍👧", desc: "Divorce, Custody, Marriage" },
  corporate: { label: "Corporate", color: "bg-purple-50 text-purple-700", icon: "🏢", desc: "NDA, Incorporation" },
  employment: { label: "Employment", color: "bg-teal-50 text-teal-700", icon: "👔", desc: "Offer Letters, Agreements" },
  other: { label: "Other", color: "bg-slate-50 text-slate-700", icon: "📁", desc: "Miscellaneous Documents" },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Favorites & Recent from localStorage
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<string[]>([]);

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState("preview");

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [analyzingTemplate, setAnalyzingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Placeholder Editor state
  const [editorTemplate, setEditorTemplate] = useState<any | null>(null);
  const [placeholdersList, setPlaceholdersList] = useState<any[]>([]);

  // Use Template & Draft Generation State
  const [activeUseTemplate, setActiveUseTemplate] = useState<any | null>(null);
  const [generationMode, setGenerationMode] = useState<"choice" | "form" | "interview">("choice");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // AI Interview State
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [nextPlaceholder, setNextPlaceholder] = useState<any | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<{ role: "assistant" | "user"; text: string }[]>([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    // Load local storage favorites & recents
    const favs = localStorage.getItem("legaldraft_fav_templates");
    if (favs) setFavorites(JSON.parse(favs));

    const recents = localStorage.getItem("legaldraft_recent_templates");
    if (recents) setRecentTemplates(JSON.parse(recents));

    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
      toast.info("Removed from favorites");
    } else {
      updated = [...favorites, id];
      toast.success("Added to favorites");
    }
    setFavorites(updated);
    localStorage.setItem("legaldraft_fav_templates", JSON.stringify(updated));
  };

  // Add recent template on usage
  const addRecentTemplate = (id: string) => {
    const updated = [id, ...recentTemplates.filter((r) => r !== id)].slice(0, 4);
    setRecentTemplates(updated);
    localStorage.setItem("legaldraft_recent_templates", JSON.stringify(updated));
  };

  // Trigger preview fetch
  const handleOpenPreview = async (template: any) => {
    setPreviewTemplate(template);
    setActivePreviewTab("preview");
    setLoadingVersions(true);
    try {
      const versionsData = await fetchTemplateVersions(template.id);
      setVersions(versionsData);
    } catch (err) {
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restore template version
  const handleRestoreVersion = async (versionNum: number) => {
    if (!previewTemplate) return;
    try {
      const restored = await restoreTemplateVersion(previewTemplate.id, versionNum);
      toast.success(`Successfully restored to Version ${versionNum}`);
      setPreviewTemplate(restored);
      // Reload template list
      const data = await fetchTemplates();
      setTemplates(data);
      // Reload versions
      const versionsData = await fetchTemplateVersions(previewTemplate.id);
      setVersions(versionsData);
    } catch (err: any) {
      toast.error(err.message || "Failed to restore version");
    }
  };

  // Handle custom file upload trigger
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please choose a DOCX template file to upload");
      return;
    }

    setAnalyzingTemplate(true);
    toast.info("AI is analyzing template text & detecting placeholders...");
    try {
      const template = await uploadTemplate(uploadFile, uploadName, uploadDesc);
      toast.success("Template uploaded successfully!");
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadName("");
      setUploadDesc("");

      // Open Placeholder Editor to let user review/verify AI suggestions
      setEditorTemplate(template);
      setPlaceholdersList(template.placeholders || []);
      // Reload listing
      loadTemplates();
    } catch (err: any) {
      toast.error(err.message || "Template upload failed");
    } finally {
      setAnalyzingTemplate(false);
    }
  };

  // Placeholder Save/Confirmation
  const handleSavePlaceholders = async () => {
    if (!editorTemplate) return;
    try {
      const updated = await savePlaceholders(editorTemplate.id, placeholdersList);
      toast.success("Placeholders configurations saved successfully!");
      setEditorTemplate(null);
      loadTemplates();
    } catch (err) {
      toast.error("Failed to save placeholders configurations");
    }
  };

  const handleAddPlaceholderField = () => {
    setPlaceholdersList([
      ...placeholdersList,
      {
        name: `field${placeholdersList.length + 1}`,
        label: `Field ${placeholdersList.length + 1}`,
        type: "text",
        required: true,
        defaultValue: "",
        description: "",
        options: [],
      },
    ]);
  };

  const handleDeletePlaceholderField = (idx: number) => {
    setPlaceholdersList(placeholdersList.filter((_, i) => i !== idx));
  };

  // Start usage flow
  const handleStartUseTemplate = (template: any) => {
    addRecentTemplate(template.id);
    setActiveUseTemplate(template);
    setGenerationMode("choice");
    setFormValues({});
    setInterviewAnswers({});
    setInterviewHistory([
      {
        role: "assistant",
        text: `Hello! I will guide you through compiling details for "${template.name}". How would you like to proceed?`,
      },
    ]);
  };

  // Init Form Mode
  const initFormMode = () => {
    const defaults: Record<string, string> = {};
    activeUseTemplate.placeholders?.forEach((p: any) => {
      defaults[p.name] = p.defaultValue || "";
    });
    setFormValues(defaults);
    setGenerationMode("form");
  };

  // Init Interview mode
  const initInterviewMode = async () => {
    setGenerationMode("interview");
    setLoadingQuestion(true);
    try {
      const response = await askInterviewQuestion(activeUseTemplate.id, {});
      setCurrentQuestion(response.question);
      setNextPlaceholder(response.nextPlaceholder);
      setInterviewHistory([
        {
          role: "assistant",
          text: `Hello! Let's fill out "${activeUseTemplate.name}" together. I will ask you questions one-by-one.`,
        },
        {
          role: "assistant",
          text: response.question,
        },
      ]);
    } catch (err) {
      toast.error("Failed to start AI interview questions");
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Handle conversational answer send
  const handleSendInterviewAnswer = async () => {
    if (!interviewInput.trim()) return;
    const answer = interviewInput.trim();
    const updatedAnswers = { ...interviewAnswers, [nextPlaceholder.name]: answer };
    setInterviewAnswers(updatedAnswers);

    const newHistory = [
      ...interviewHistory,
      { role: "user" as const, text: answer },
    ];
    setInterviewHistory(newHistory);
    setInterviewInput("");

    setLoadingQuestion(true);
    try {
      const response = await askInterviewQuestion(activeUseTemplate.id, updatedAnswers, nextPlaceholder.name);
      if (response.isFinished) {
        toast.info("All details collected successfully! Compiling draft...");
        // Auto trigger compilation
        await compileDraftFromAnswers(updatedAnswers);
      } else {
        setCurrentQuestion(response.question);
        setNextPlaceholder(response.nextPlaceholder);
        setInterviewHistory([
          ...newHistory,
          { role: "assistant" as const, text: response.question },
        ]);
      }
    } catch (err) {
      toast.error("Error retrieving next question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Direct dynamic form compilation
  const handleGenerateFromForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingDraft(true);
    try {
      const draftFile = await generateDraftFromTemplate(activeUseTemplate.id, formValues);
      toast.success(`Draft '${draftFile.fileName}' generated successfully in storage!`);
      setActiveUseTemplate(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to compile document draft");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const compileDraftFromAnswers = async (answers: Record<string, string>) => {
    setGeneratingDraft(true);
    try {
      const draftFile = await generateDraftFromTemplate(activeUseTemplate.id, answers);
      toast.success(`Draft '${draftFile.fileName}' generated successfully via AI Interview!`);
      setActiveUseTemplate(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to compile draft");
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Filter templates list
  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())));
    const matchCat = category === "all" || t.category === category;
    const matchFav = !showFavoritesOnly || favorites.includes(t.id);
    return matchSearch && matchCat && matchFav;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Template Library</h2>
          <p className="text-sm text-muted-foreground">
            Deploy dynamic placeholders templates and compile draft documentation with AI Interview chatbot
          </p>
        </div>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white gap-2 cursor-pointer shadow-md"
          id="upload-template-btn"
        >
          <Upload className="h-4 w-4" />
          Upload Smart Template
        </Button>
      </div>

      {/* Recents templates bar */}
      {recentTemplates.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-2xl border border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            Recently Used Templates
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recentTemplates.map((id) => {
              const tmpl = templates.find((t) => t.id === id);
              if (!tmpl) return null;
              return (
                <div
                  key={id}
                  onClick={() => handleStartUseTemplate(tmpl)}
                  className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-border hover:border-purple-300 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground leading-snug">{tmpl.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{tmpl.category} Law</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = templates.filter((t) => cat === "all" ? true : t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center cursor-pointer shadow-sm min-h-[90px]",
                category === cat
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/15"
                  : "border-border bg-card hover:border-purple-300"
              )}
            >
              <span className="text-xl mb-1">{cat === "all" ? "📂" : (meta as any).icon}</span>
              <span className="font-bold text-xs text-foreground block truncate max-w-full">{meta.label}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{count} files</span>
            </button>
          );
        })}
      </div>

      {/* Search & filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="templates-search"
            placeholder="Search templates, tags, jurisdiction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn("gap-2 h-10 border-border cursor-pointer", showFavoritesOnly && "bg-purple-700 hover:bg-purple-800 text-white")}
        >
          <Star className={cn("h-4 w-4", showFavoritesOnly ? "fill-white" : "text-amber-500")} />
          Favorites Only
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading template library folders...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="templates-grid">
          {filtered.map((template) => {
            const isFav = favorites.includes(template.id);
            return (
              <Card key={template.id} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col bg-card border-border">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900 border-b border-border p-4 flex-shrink-0 relative">
                  <button
                    onClick={(e) => toggleFavorite(template.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white dark:bg-slate-950 border border-border shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Star className={cn("h-3.5 w-3.5", isFav ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                  </button>
                  <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-border/50 shadow-sm font-mono text-[9px] text-muted-foreground leading-relaxed line-clamp-4 min-h-[85px] select-none">
                    {template.previewText || "Template content preview window."}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate text-foreground">{template.name}</CardTitle>
                      <CardDescription className="text-xs mt-1 line-clamp-2 leading-relaxed">{template.description}</CardDescription>
                    </div>
                    <Badge className="flex-shrink-0 text-[9px] uppercase tracking-wide bg-purple-50 hover:bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3 flex-1">
                  <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-purple-600" />
                      {template.fields || 0} fields
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-purple-600" />
                      {template.usageCount || 0} uses
                    </div>
                    {template.lastUsed && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-purple-600" />
                        {formatRelativeTime(template.lastUsed)}
                      </div>
                    )}
                  </div>
                  {template.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-muted-foreground border border-border/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8.5 text-xs font-semibold cursor-pointer border-border"
                    onClick={() => handleOpenPreview(template)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    Preview & History
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8.5 text-xs font-semibold gap-1 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-sm"
                    onClick={() => handleStartUseTemplate(template)}
                  >
                    Use Template
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-card">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-foreground">No Templates Available</p>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Try adjusting your search criteria or category tabs filter.
          </p>
        </div>
      )}

      {/* Upload Custom Template Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Upload Custom Smart Template
            </DialogTitle>
            <DialogDescription>
              Upload Microsoft Word (.docx/.doc) document templates. AI will classify category and build suggested placeholder variables automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="upload-name">Template Name</Label>
              <Input
                id="upload-name"
                required
                placeholder="e.g. Mutual NDAs Contract"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-desc">Description</Label>
              <Textarea
                id="upload-desc"
                placeholder="Provide a brief summary of document purpose..."
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Document Template File (DOCX/DOC)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-muted/10 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-semibold">{uploadFile ? uploadFile.name : "Select template file"}</p>
                <p className="text-[10px] text-muted-foreground mt-1">DOCX, DOC files up to 15MB</p>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={analyzingTemplate}
                className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-sm"
              >
                {analyzingTemplate ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    AI Analyzing...
                  </>
                ) : (
                  "Upload & Process"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review AI Placeholders Editor Dialog */}
      <Dialog open={!!editorTemplate} onOpenChange={() => setEditorTemplate(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Placeholder Variable Configuration
            </DialogTitle>
            <DialogDescription>
              Verify placeholders detected from template. These fields will build the dynamic questionnaires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Detected Placeholders Variables ({placeholdersList.length})
              </span>
              <Button size="sm" variant="outline" onClick={handleAddPlaceholderField} className="h-8 text-xs cursor-pointer border-border">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {placeholdersList.map((p, idx) => (
                <div key={idx} className="p-3 border border-border rounded-xl space-y-2 bg-muted/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Variable Code Name</Label>
                      <Input
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].name = e.target.value;
                          setPlaceholdersList(updated);
                        }}
                        className="h-8 text-xs mt-1"
                        placeholder="e.g. clientName"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Label (Human Readable)</Label>
                      <Input
                        value={p.label}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].label = e.target.value;
                          setPlaceholdersList(updated);
                        }}
                        className="h-8 text-xs mt-1"
                        placeholder="e.g. Client Full Name"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Input Type</Label>
                      <select
                        value={p.type}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].type = e.target.value;
                          setPlaceholdersList(updated);
                        }}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors mt-1 focus-visible:outline-none"
                      >
                        <option value="text">Text Input</option>
                        <option value="date">Date picker</option>
                        <option value="number">Number input</option>
                        <option value="boolean">Boolean Switch</option>
                        <option value="options">Multiple Options select</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Default Value</Label>
                      <Input
                        value={p.defaultValue || ""}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].defaultValue = e.target.value;
                          setPlaceholdersList(updated);
                        }}
                        className="h-8 text-xs mt-1"
                        placeholder="Default field fill text"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Description Guide</Label>
                      <Input
                        value={p.description || ""}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].description = e.target.value;
                          setPlaceholdersList(updated);
                        }}
                        className="h-8 text-xs mt-1"
                        placeholder="Help text for AI interview"
                      />
                    </div>
                  </div>

                  {p.type === "options" && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Dropdown Options (comma separated)</Label>
                      <Input
                        value={p.options ? p.options.join(", ") : ""}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].options = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                          setPlaceholdersList(updated);
                        }}
                        className="h-8 text-xs mt-1"
                        placeholder="Option A, Option B, Option C"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={p.required}
                        onChange={(e) => {
                          const updated = [...placeholdersList];
                          updated[idx].required = e.target.checked;
                          setPlaceholdersList(updated);
                        }}
                        className="rounded border-input text-purple-600 focus:ring-purple-500"
                      />
                      Is field required
                    </label>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeletePlaceholderField(idx)}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1 cursor-pointer"
                    >
                      <Trash className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setEditorTemplate(null)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSavePlaceholders} className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-sm">
              Confirm & Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview & History Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                {previewTemplate?.name}
              </DialogTitle>
              <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 border border-purple-200 capitalize">
                {previewTemplate?.category} law
              </Badge>
            </div>
            <DialogDescription className="text-xs mt-1">
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
            {/* Left preview window */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-xl max-h-[400px] overflow-y-auto scrollbar-thin">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider font-mono">Template File Preview</h4>
              <div className="font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap select-none">
                {previewTemplate?.previewText || "No preview text loaded."}
              </div>
            </div>

            {/* Right details tab pane */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex gap-1 border-b border-border pb-px overflow-x-auto scrollbar-none">
                {[
                  { id: "preview", label: "Placeholders" },
                  { id: "versions", label: "Version History" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id)}
                    className={cn(
                      "px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer",
                      activePreviewTab === tab.id
                        ? "border-purple-600 text-purple-700 dark:text-purple-400 font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 max-h-[350px] overflow-y-auto scrollbar-thin">
                {activePreviewTab === "preview" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Expected Input Variables ({previewTemplate?.placeholders?.length || 0})
                    </span>
                    {previewTemplate?.placeholders && previewTemplate.placeholders.length > 0 ? (
                      <div className="space-y-2">
                        {previewTemplate.placeholders.map((p: any, idx: number) => (
                          <div key={idx} className="p-2 border border-border rounded-lg bg-muted/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{p.label}</span>
                              <Badge variant="outline" className="text-[9px] capitalize">
                                {p.type}
                              </Badge>
                            </div>
                            {p.description && (
                              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No placeholders mapped to this template.</p>
                    )}
                  </div>
                )}

                {activePreviewTab === "versions" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Commit History Log
                    </span>
                    {loadingVersions ? (
                      <div className="flex justify-center py-6">
                        <div className="h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : versions.length > 0 ? (
                      <div className="space-y-2.5">
                        {versions.map((v: any, idx: number) => (
                          <div key={v.id} className="p-3 border border-border rounded-xl bg-muted/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-foreground">Version {v.versionNumber}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                Commited {formatRelativeTime(v.createdAt)}
                              </p>
                              <span className="text-[9px] font-mono text-purple-700 dark:text-purple-400 mt-1 block">
                                {v.placeholders?.length || 0} Placeholder Fields
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestoreVersion(v.versionNumber)}
                              className="h-8 text-xs cursor-pointer border-border gap-1"
                              disabled={v.versionNumber === previewTemplate.placeholders?.length} // or simple check
                            >
                              <Undo className="h-3 w-3" /> Restore
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No version commits saved for this template.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)} className="border-border">
              Close Preview
            </Button>
            <Button
              onClick={() => {
                const temp = previewTemplate;
                setPreviewTemplate(null);
                handleStartUseTemplate(temp);
              }}
              className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-sm gap-1"
            >
              Use Template <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Draft Generation Modal (Smart Form & AI Interview) */}
      <Dialog open={!!activeUseTemplate} onOpenChange={() => setActiveUseTemplate(null)}>
        <DialogContent className={cn("bg-card border-border text-foreground transition-all duration-300", generationMode === "interview" ? "sm:max-w-[650px] max-h-[85vh]" : "sm:max-w-[550px] max-h-[80vh] overflow-y-auto")}>
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {activeUseTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Select draft mode or answer placeholder inputs below.
            </DialogDescription>
          </DialogHeader>

          {/* 1. Mode selection */}
          {generationMode === "choice" && (
            <div className="space-y-4 pt-4">
              <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-sm mx-auto mb-2">
                Choose how you would like to supply data for this template variables to compile the draft file.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={initInterviewMode}
                  className="flex flex-col items-center justify-center p-6 border border-border hover:border-purple-300 rounded-2xl bg-muted/10 transition-colors text-center cursor-pointer group hover:shadow-sm"
                >
                  <MessageSquare className="h-10 w-10 text-purple-600 group-hover:scale-105 transition-transform mb-3" />
                  <span className="text-xs font-bold text-foreground">AI Interview Chatbot</span>
                  <span className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    AI will guide you by asking conversational questions one-by-one.
                  </span>
                </button>

                <button
                  onClick={initFormMode}
                  className="flex flex-col items-center justify-center p-6 border border-border hover:border-purple-300 rounded-2xl bg-muted/10 transition-colors text-center cursor-pointer group hover:shadow-sm"
                >
                  <Play className="h-10 w-10 text-purple-600 group-hover:scale-105 transition-transform mb-3" />
                  <span className="text-xs font-bold text-foreground">Smart Input Form</span>
                  <span className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Fill out a direct dynamic entry questionnaire on a single screen.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Direct Dynamic Form Mode */}
          {generationMode === "form" && (
            <form onSubmit={handleGenerateFromForm} className="space-y-4 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-400 font-semibold cursor-pointer mb-2" onClick={() => setGenerationMode("choice")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to mode select
              </div>

              <div className="space-y-3">
                {activeUseTemplate.placeholders?.map((p: any) => (
                  <div key={p.name} className="space-y-1">
                    <Label htmlFor={`form-field-${p.name}`} className="text-xs font-bold text-foreground">
                      {p.label} {p.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {p.type === "date" ? (
                      <Input
                        id={`form-field-${p.name}`}
                        type="date"
                        required={p.required}
                        value={formValues[p.name] || ""}
                        onChange={(e) => setFormValues({ ...formValues, [p.name]: e.target.value })}
                        className="h-9 text-xs"
                      />
                    ) : p.type === "options" ? (
                      <select
                        id={`form-field-${p.name}`}
                        required={p.required}
                        value={formValues[p.name] || ""}
                        onChange={(e) => setFormValues({ ...formValues, [p.name]: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                      >
                        <option value="">Select option</option>
                        {p.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : p.type === "boolean" ? (
                      <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={formValues[p.name] === "true"}
                          onChange={(e) => setFormValues({ ...formValues, [p.name]: e.target.checked ? "true" : "false" })}
                          className="rounded border-input text-purple-600 focus:ring-purple-500"
                        />
                        {p.description || "Enable this option"}
                      </label>
                    ) : (
                      <Input
                        id={`form-field-${p.name}`}
                        type={p.type === "number" ? "number" : "text"}
                        required={p.required}
                        value={formValues[p.name] || ""}
                        onChange={(e) => setFormValues({ ...formValues, [p.name]: e.target.value })}
                        className="h-9 text-xs"
                        placeholder={p.defaultValue || ""}
                      />
                    )}
                    {p.description && p.type !== "boolean" && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                        {p.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter className="pt-3 border-t border-border mt-4">
                <Button type="button" variant="outline" onClick={() => setActiveUseTemplate(null)} className="border-border">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generatingDraft}
                  className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-sm gap-1"
                >
                  {generatingDraft ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                      Compiling draft...
                    </>
                  ) : (
                    <>
                      Generate Draft <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* 3. Conversational AI Interview Chat Mode */}
          {generationMode === "interview" && (
            <div className="space-y-4 pt-3 flex flex-col h-[550px]">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-400 font-semibold cursor-pointer" onClick={() => setGenerationMode("choice")}>
                  <ArrowLeft className="h-3.5 w-3.5" /> Exit Interview
                </div>
                {/* Progress bar status */}
                {activeUseTemplate.placeholders?.length && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Progress: {Object.keys(interviewAnswers).length} of {activeUseTemplate.placeholders.length} fields
                  </span>
                )}
              </div>

              {/* Progress bar line */}
              {activeUseTemplate.placeholders?.length && (
                <Progress
                  value={(Object.keys(interviewAnswers).length / activeUseTemplate.placeholders.length) * 100}
                  className="h-1"
                />
              )}

              {/* Chat bubbles container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10 border rounded-2xl scrollbar-thin">
                {interviewHistory.map((chat, idx) => (
                  <div key={idx} className={cn("flex", chat.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm",
                      chat.role === "user"
                        ? "bg-purple-700 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-950 border border-border text-foreground rounded-tl-none"
                    )}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {loadingQuestion && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-950 border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat typing block */}
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Input
                  disabled={loadingQuestion || generatingDraft}
                  placeholder={nextPlaceholder ? `Provide value for: ${nextPlaceholder.label}...` : "Type message..."}
                  value={interviewInput}
                  onChange={(e) => setInterviewInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInterviewAnswer()}
                  className="h-10 text-xs flex-1"
                />
                <Button
                  disabled={loadingQuestion || generatingDraft || !interviewInput.trim()}
                  onClick={handleSendInterviewAnswer}
                  className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer h-10 shadow-sm"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
