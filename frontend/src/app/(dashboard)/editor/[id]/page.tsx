"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Download,
  History,
  Sparkles,
  RefreshCw,
  Wand2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Highlighter,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockDrafts } from "@/lib/mock-data";
import { cn, downloadDraft } from "@/lib/utils";
import { toast } from "sonner";

const SAMPLE_CONTENT = `IN THE COURT OF SESSIONS JUDGE, MUMBAI

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

const AI_ACTIONS = [
  {
    id: "rewrite",
    label: "Rewrite",
    icon: RefreshCw,
    desc: "Rewrite in better legal language",
  },
  {
    id: "improve-tone",
    label: "Improve Legal Tone",
    icon: Wand2,
    desc: "Enhance formality and precision",
  },
  {
    id: "add-arguments",
    label: "Add Legal Arguments",
    icon: MessageSquare,
    desc: "Add supporting legal arguments",
  },
  {
    id: "simplify",
    label: "Simplify Language",
    icon: AlignLeft,
    desc: "Make it clearer and concise",
  },
  {
    id: "expand",
    label: "Expand Section",
    icon: ChevronRight,
    desc: "Add more detail and context",
  },
];

const VERSIONS = [
  { version: 3, date: "Jun 5, 2024 14:30", author: "Priya Mehta", current: true },
  { version: 2, date: "Jun 3, 2024 11:00", author: "Priya Mehta", current: false },
  { version: 1, date: "May 28, 2024 10:00", author: "Priya Mehta", current: false },
];

const RISK_ITEMS = [
  {
    id: "r1",
    severity: "warning" as const,
    title: "Missing Prayer Section",
    desc: "The prayer section should specify the exact relief sought.",
  },
  {
    id: "r2",
    severity: "info" as const,
    title: "Court Name Unclear",
    desc: "Specify the exact Sessions Court jurisdiction.",
  },
];

export default function EditorPage() {
  const params = useParams();
  const draftId = params?.id as string;
  const draft = mockDrafts.find((d) => d.id === draftId) || mockDrafts[0];

  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showRiskChecker, setShowRiskChecker] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showAIContextMenu, setShowAIContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [activeAIAction, setActiveAIAction] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const autoSave = useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1000);
  }, []);

  useEffect(() => {
    setSaveStatus("unsaved");
    const t = setTimeout(autoSave, 2000);
    return () => clearTimeout(t);
  }, [content, autoSave]);

  const handleTextSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selected = target.value.substring(
      target.selectionStart,
      target.selectionEnd
    );
    if (selected.length > 10) {
      setSelectedText(selected);
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowAIContextMenu(true);
    } else {
      setShowAIContextMenu(false);
    }
  };

  const handleAIAction = (actionId: string) => {
    setActiveAIAction(actionId);
    setShowAIContextMenu(false);
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setShowDiffModal(true);
    }, 1800);
  };

  const applyDiff = () => {
    const improved = selectedText.replace(
      /the Applicant/g,
      "the Honourable Applicant/Accused"
    );
    setContent((prev) => prev.replace(selectedText, improved));
    setShowDiffModal(false);
    toast.success("AI suggestion applied!");
  };

  return (
    <div
      className="flex gap-0 h-[calc(100vh-112px)] animate-fade-in -m-6"
      onClick={() => setShowAIContextMenu(false)}
    >
      {/* Version History Panel */}
      {showVersionHistory && (
        <div className="w-64 bg-white border-r border-border flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Version History</span>
            <button
              onClick={() => setShowVersionHistory(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {VERSIONS.map((v) => (
              <div
                key={v.version}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors",
                  v.current && "border-purple-300 bg-purple-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">
                    Version {v.version}
                  </span>
                  {v.current && (
                    <Badge variant="success" className="text-[10px]">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{v.date}</p>
                <p className="text-xs text-muted-foreground">{v.author}</p>
                {!v.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs w-full"
                    onClick={() => {
                      toast.success(`Restored to version ${v.version}`);
                      setShowVersionHistory(false);
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border flex-shrink-0 overflow-x-auto scrollbar-hide bg-white">
          {/* File actions */}
          <Button
            variant="ghost"
            size="sm"
            id="version-history-btn"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={cn(
              "h-8 gap-1 text-xs",
              showVersionHistory && "bg-purple-50 text-purple-700"
            )}
          >
            <History className="h-3.5 w-3.5" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            id="save-draft-btn"
            onClick={() => {
              setSaveStatus("saving");
              setTimeout(() => {
                setSaveStatus("saved");
                toast.success("Draft saved!");
              }, 800);
            }}
            className="h-8 gap-1 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* Format buttons */}
          {[
            { icon: Bold, id: "fmt-bold", title: "Bold" },
            { icon: Italic, id: "fmt-italic", title: "Italic" },
            { icon: Underline, id: "fmt-underline", title: "Underline" },
            { icon: Highlighter, id: "fmt-highlight", title: "Highlight" },
          ].map(({ icon: Icon, id, title }) => (
            <Button
              key={id}
              id={id}
              variant="ghost"
              size="icon-sm"
              title={title}
              className="h-8 w-8"
              onClick={() => toast.info(`${title} formatting applied`)}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* Headings */}
          {[
            { icon: Heading1, id: "fmt-h1", title: "Heading 1" },
            { icon: Heading2, id: "fmt-h2", title: "Heading 2" },
            { icon: Heading3, id: "fmt-h3", title: "Heading 3" },
          ].map(({ icon: Icon, id, title }) => (
            <Button
              key={id}
              id={id}
              variant="ghost"
              size="icon-sm"
              title={title}
              className="h-8 w-8"
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* Lists & Table */}
          {[
            { icon: List, id: "fmt-ul", title: "Bullet List" },
            { icon: ListOrdered, id: "fmt-ol", title: "Numbered List" },
            { icon: Table, id: "fmt-table", title: "Insert Table" },
          ].map(({ icon: Icon, id, title }) => (
            <Button
              key={id}
              id={id}
              variant="ghost"
              size="icon-sm"
              title={title}
              className="h-8 w-8"
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* Align */}
          {[
            { icon: AlignLeft, id: "align-left", title: "Align Left" },
            { icon: AlignCenter, id: "align-center", title: "Align Center" },
            { icon: AlignRight, id: "align-right", title: "Align Right" },
          ].map(({ icon: Icon, id, title }) => (
            <Button
              key={id}
              id={id}
              variant="ghost"
              size="icon-sm"
              title={title}
              className="h-8 w-8"
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {/* Risk Checker */}
            <Button
              id="risk-checker-btn"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
              onClick={() => setShowRiskChecker(true)}
            >
              <Shield className="h-3.5 w-3.5" />
              Risk Check
              <span className="bg-amber-100 text-amber-700 text-[10px] px-1 rounded-full">
                {RISK_ITEMS.length}
              </span>
            </Button>
            <Button
              id="export-pdf-btn"
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs"
              onClick={() => {
                downloadDraft(draft, content);
                toast.success("Document exported successfully!", {
                  description: "File saved to your Downloads folder.",
                });
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Document meta */}
        <div className="px-8 py-2 border-b bg-muted/20 flex items-center gap-4 flex-shrink-0">
          <div>
            <span className="text-sm font-semibold text-foreground">
              {draft.title}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              · {draft.caseNumber} · v{draft.version}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span>{wordCount.toLocaleString()} words</span>
            <div className="flex items-center gap-1">
              {saveStatus === "saved" ? (
                <>
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600">Saved</span>
                </>
              ) : saveStatus === "saving" ? (
                <>
                  <div className="h-3 w-3 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                  <span className="text-purple-600">Saving...</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse-dot" />
                  <span className="text-amber-600">Unsaved changes</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#FAFAFA] to-white px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-premium rounded-xl border border-border overflow-hidden">
              <div className="px-12 py-10">
                <p className="text-xs text-muted-foreground mb-4 text-center">
                  Select any text to access AI editing options
                </p>
                <textarea
                  id="editor-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onMouseUp={handleTextSelect}
                  className="w-full min-h-[600px] text-sm leading-relaxed text-foreground font-serif resize-none outline-none bg-transparent"
                  placeholder="Start typing your legal document..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{Math.ceil(wordCount / 200)} min read</span>
          <span>·</span>
          <span>{draft.category} law</span>
          <span>·</span>
          <span>Assigned to {draft.assignedTo}</span>
        </div>
      </div>

      {/* Right: AI Actions Sidebar */}
      <div className="w-64 bg-white border-l border-border flex-shrink-0 flex flex-col overflow-hidden hidden xl:flex">
        <div className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold">AI Actions</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select text for targeted AI edits
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {AI_ACTIONS.map((action) => (
            <button
              key={action.id}
              id={`ai-action-${action.id}`}
              onClick={() => {
                if (!selectedText) {
                  toast.info("Select some text first to use AI actions");
                  return;
                }
                handleAIAction(action.id);
              }}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:border-purple-300 hover:bg-purple-50/30 transition-all text-left group"
            >
              <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 mt-0.5 flex-shrink-0 transition-colors" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {action.desc}
                </p>
              </div>
            </button>
          ))}

          {isGeneratingAI && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-purple-700">
                  Generating...
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {["Analyzing text", "Applying improvements", "Reviewing tone"].map(
                  (step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      <span className="text-[10px] text-purple-600">
                        {step}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Context Menu (floating) */}
      {showAIContextMenu && (
        <div
          className="fixed z-50 bg-[#0F172A] text-white rounded-xl shadow-xl border border-white/10 py-1 min-w-[180px] animate-fade-in"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y + 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-white/10">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              AI Actions
            </p>
          </div>
          {AI_ACTIONS.map((action) => (
            <button
              key={action.id}
              id={`context-${action.id}`}
              onClick={() => handleAIAction(action.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-white/10 transition-colors text-left"
            >
              <action.icon className="h-3.5 w-3.5 text-purple-400" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Diff Comparison Modal */}
      <Dialog open={showDiffModal} onOpenChange={setShowDiffModal}>
        <DialogContent className="sm:max-w-2xl" id="diff-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Suggestion —{" "}
              {AI_ACTIONS.find((a) => a.id === activeAIAction)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1.5 uppercase tracking-wide">
                Before
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 leading-relaxed font-mono">
                {selectedText ||
                  "the Applicant is a law-abiding citizen of India and has never been involved in any criminal activity prior to the alleged incident."}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-1.5 uppercase tracking-wide">
                After (AI Improved)
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 leading-relaxed font-mono">
                {selectedText
                  ? selectedText.replace(
                      /the Applicant/g,
                      "the Honourable Applicant/Accused"
                    ) +
                    " It is pertinent to note that the Applicant has maintained an impeccable record of civic conduct and social responsibility."
                  : "the Honourable Applicant/Accused has at all material times maintained an exemplary record as a law-abiding citizen of India and has never, prior to the alleged incident, been associated with any criminal proceedings or enquiry whatsoever."}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              id="diff-regenerate-btn"
              onClick={() => {
                setShowDiffModal(false);
                setTimeout(() => {
                  setIsGeneratingAI(true);
                  setTimeout(() => {
                    setIsGeneratingAI(false);
                    setShowDiffModal(true);
                  }, 1500);
                }, 100);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              id="diff-reject-btn"
              onClick={() => setShowDiffModal(false)}
            >
              Reject
            </Button>
            <Button
              size="sm"
              id="diff-accept-btn"
              onClick={applyDiff}
              className="gap-1"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Checker Modal */}
      <Dialog open={showRiskChecker} onOpenChange={setShowRiskChecker}>
        <DialogContent id="risk-checker-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-600" />
              AI Risk Checker
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {RISK_ITEMS.length} potential issues in your document:
            </p>
            {RISK_ITEMS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  item.severity === "warning"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    item.severity === "warning"
                      ? "text-amber-500"
                      : "text-blue-500"
                  )}
                />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700">
                Party names are complete and properly formatted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowRiskChecker(false)}
              id="close-risk-modal"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
