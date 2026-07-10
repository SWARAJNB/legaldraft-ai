"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Edit,
  Copy,
  FileEdit,
  Download,
  Paperclip,
  CheckCircle,
  FileText,
  Briefcase,
  Users,
  Settings,
  FolderOpen,
  Sparkles,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDrafts } from "@/context/drafts/DraftsContext";
import {
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  renameConversation,
  deleteConversation,
  exportResponseDirect,
  uploadFile,
  fetchFiles,
  fetchWorkspaces,
  fetchCases,
  fetchClients,
  API_BASE_URL,
  type DBConversation
} from "@/lib/api";
import { Case } from "@/types";
import { ClientData } from "@/lib/api";

const PRESET_PROMPTS = [
  { title: "Bail application draft", text: "Draft a comprehensive bail application under Section 439 CrPC for Sessions Court based on sections 420 and 406. Complainant alleges fraud." },
  { title: "Civil Plaint for money recovery", text: "Draft a civil plaint for recovery of money (Rs. 25,00,000) along with 12% interest per annum due to breach of contract." },
  { title: "Divorce petition (Cruelty)", text: "Draft a divorce petition under Section 13(1)(ia) of the Hindu Marriage Act on the grounds of mental and physical cruelty." },
  { title: "Analyze lease agreement", text: "I have uploaded a lease agreement. Please summarize the key liabilities, indemnification terms, lock-in period, and notice period." },
  { title: "Draft legal notice", text: "Draft a legal notice to Builder Corp demanding immediate possession of Flat 304 or complete refund of advance payment with interest." },
];

const AGENTS = [
  { id: "draft", name: "Draft Agent", description: "Generate and improve legal drafts" },
  { id: "research", name: "Research Agent", description: "Search documents and knowledge base" },
  { id: "review", name: "Review Agent", description: "Contract review, clause analysis, and risk detection" },
  { id: "file", name: "File Agent", description: "Analyze uploaded files and document OCR" },
  { id: "timeline", name: "Timeline Agent", description: "Summarize cases, hearing timeline and history" },
];

const MarkdownRenderer = ({ content }: { content: string }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part.split("\n");
          const language = lines[0].replace("```", "").trim();
          const code = lines.slice(1, -1).join("\n");
          return (
            <pre key={index} className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono text-xs my-2">
              <code>{code}</code>
            </pre>
          );
        } else {
          const lines = part.split("\n");
          return lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed && line === "") return <div key={lIdx} className="h-2" />;

            if (trimmed.startsWith("### ")) {
              return <h4 key={lIdx} className="text-sm font-bold text-foreground mt-3 mb-1">{trimmed.replace("### ", "")}</h4>;
            }
            if (trimmed.startsWith("## ")) {
              return <h3 key={lIdx} className="text-base font-bold text-foreground mt-4 mb-2">{trimmed.replace("## ", "")}</h3>;
            }
            if (trimmed.startsWith("# ")) {
              return <h2 key={lIdx} className="text-lg font-bold text-foreground mt-5 mb-2">{trimmed.replace("# ", "")}</h2>;
            }

            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <li key={lIdx} className="ml-4 list-disc text-xs text-muted-foreground my-0.5 pl-1">
                  {renderInlineStyles(trimmed.substring(2))}
                </li>
              );
            }

            const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <li key={lIdx} className="ml-4 list-decimal text-xs text-muted-foreground my-0.5 pl-1">
                  {renderInlineStyles(numMatch[2])}
                </li>
              );
            }

            return (
              <p key={lIdx} className="text-xs text-foreground leading-relaxed my-1">
                {renderInlineStyles(line)}
              </p>
            );
          });
        }
      })}
    </div>
  );
};

const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-purple-700 dark:text-purple-400">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

export default function EnterpriseAIWorkspace() {
  const router = useRouter();
  const { drafts, createDraft } = useDrafts();

  // Conversations history states
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Multi-Agent states
  const [agentMode, setAgentMode] = useState<"automatic" | "manual">("automatic");
  const [selectedAgent, setSelectedAgent] = useState<string>("draft");
  const [activeAgentId, setActiveAgentId] = useState<string>("draft");

  // Context awareness auto-fetched states
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<{ name: string } | null>(null);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [activeClient, setActiveClient] = useState<ClientData | null>(null);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  // Dialog states
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [convToRename, setConvToRename] = useState<string | null>(null);

  // Attachment upload states
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load context details
  useEffect(() => {
    async function loadWorkspaceAndContext() {
      try {
        const stored = localStorage.getItem("legaldraft_active_workspace");
        if (stored) {
          setActiveWorkspaceId(stored);

          // Get workspace details
          const list = await fetchWorkspaces();
          const match = list.find((w: any) => w.id === stored);
          if (match) setWorkspaceInfo({ name: match.name });

          // Fetch recent cases
          const casesList = await fetchCases(stored);
          if (casesList.length > 0) setActiveCase(casesList[0]);

          // Fetch recent clients
          const clientsList = await fetchClients(stored);
          if (clientsList.length > 0) setActiveClient(clientsList[0]);

          // Fetch recent uploaded files
          const filesList = await fetchFiles();
          setRecentFiles(filesList.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load workspace context", err);
      }
    }
    loadWorkspaceAndContext();
  }, []);

  // Fetch conversation histories
  const loadConversations = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
        setMessages(data[0].messages);
      }
    } catch (err) {
      toast.error("Failed to load conversation history");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [activeConvId]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Sync messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    const match = conversations.find((c) => c.id === activeConvId);
    if (match) {
      setMessages(match.messages);
    } else {
      // Fetch details from backend
      fetchConversationDetails(activeConvId)
        .then((data) => {
          setMessages(data.messages);
        })
        .catch(() => {
          toast.error("Failed to load chat details");
        });
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // CRUD handlers
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation("New Chat");
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
      toast.success("Created new chat thread");
    } catch {
      toast.error("Failed to create new chat");
    }
  };

  const handleRenameChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convToRename || !renameTitle.trim()) return;

    try {
      await renameConversation(convToRename, renameTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convToRename ? { ...c, title: renameTitle.trim() } : c))
      );
      setIsRenameOpen(false);
      setConvToRename(null);
      toast.success("Chat renamed successfully");
    } catch {
      toast.error("Failed to rename chat");
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      toast.success("Deleted chat thread");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  // Attachment helper
  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info("Uploading file into context...");
    try {
      const uploaded = await uploadFile(file, "attachments");
      setAttachedFile(file);
      setRecentFiles((prev) => [uploaded, ...prev].slice(0, 5));
      toast.success(`Attached '${file.name}' into chat context`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Stream send message handler
  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    let convId = activeConvId;
    if (!convId) {
      try {
        const newConv = await createConversation(messageText.slice(0, 30) + "...");
        convId = newConv.id;
        setActiveConvId(convId);
        setConversations((prev) => [newConv, ...prev]);
      } catch {
        toast.error("Failed to initialize conversation session");
        return;
      }
    }

    // Append user message immediately
    const userMessage = {
      role: "user",
      content: attachedFile
        ? `[Attached File: ${attachedFile.name}]\n\n${messageText}`
        : messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFile(null);
    setIsTyping(true);

    const token = localStorage.getItem("legaldraft_token");
    try {
      // Assemble context awareness details
      const contextPayload = {
        workspaceName: workspaceInfo?.name,
        clientName: activeClient?.full_name,
        caseNumber: activeCase?.caseNumber,
        caseTitle: activeCase?.title,
        activeDraftTitle: drafts.length > 0 ? drafts[0].title : undefined,
        documents: recentFiles.map((f) => f.originalName),
      };

      const response = await fetch(
        `${API_BASE_URL}/ai/conversations/${convId}/messages/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
            "X-Tenant-ID": "default-tenant",
          },
          body: JSON.stringify({
            content: userMessage.content,
            context: contextPayload,
            mode: agentMode,
            selectedAgent: selectedAgent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Server responded with error stream");
      }

      setIsTyping(false);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Unable to read stream body");

      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      // Append assistant empty message to start filling
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: new Date().toISOString() },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.selectedAgentId) {
                setActiveAgentId(data.selectedAgentId);
              }
              if (data.done) {
                // Done
              } else if (data.token) {
                accumulated += data.token;
                setMessages((prev) => {
                  const next = [...prev];
                  if (next.length > 0 && next[next.length - 1].role === "assistant") {
                    next[next.length - 1].content = accumulated;
                  }
                  return next;
                });
              } else if (data.error) {
                toast.error(data.error);
              }
            } catch {
              // Ignore parser errors due to chunk splits
            }
          }
        }
      }

      // Sync conversations titles and details from database
      const refreshedList = await fetchConversations();
      setConversations(refreshedList);
    } catch (err) {
      setIsTyping(false);
      toast.error("Failed to stream AI response");
    }
  };

  // Actions
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied response text to clipboard");
  };

  const handleSaveAsDraft = async (text: string) => {
    try {
      const saved = createDraft("AI Generated Draft", activeClient?.full_name || "General Client", "criminal", text);
      toast.success("AI response saved as draft!", {
        description: `Draft "${saved.title}" has been created.`,
      });
    } catch {
      toast.error("Failed to save draft");
    }
  };

  const handleInsertIntoEditor = (text: string) => {
    const saved = createDraft("AI Inserted Draft", activeClient?.full_name || "General Client", "criminal", text);
    toast.success("Redirecting to document editor...");
    router.push(`/editor/${saved.id}`);
  };

  const handleExport = async (type: 'docx' | 'pdf', content: string) => {
    toast.info(`Preparing ${type.toUpperCase()} file download...`);
    try {
      await exportResponseDirect(type, content, activeConvId ? (conversations.find(c => c.id === activeConvId)?.title || "AI_Draft") : "AI_Draft");
      toast.success(`Download of ${type.toUpperCase()} complete`);
    } catch (err: any) {
      toast.error(err.message || `Failed to export response as ${type.toUpperCase()}`);
    }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in text-foreground">
      {/* Col 1: Chat History & Threads Panel */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3 bg-card border border-border rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-1 flex-shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Conversations
          </h2>
          <Button
            onClick={handleNewChat}
            size="icon"
            className="h-6 w-6 rounded-md bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
            title="Start new chat thread"
            id="new-chat-btn"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Conversations Lists */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5">
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-1.5">
              <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
              <p className="text-[10px] text-muted-foreground">Loading history...</p>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={cn(
                  "p-2.5 rounded-lg border text-xs flex items-center justify-between group cursor-pointer transition-colors",
                  c.id === activeConvId
                    ? "border-purple-400 bg-purple-50/40 dark:border-purple-800 dark:bg-purple-950/15"
                    : "border-transparent bg-transparent hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                  <p className="font-medium truncate max-w-[120px]">{c.title || "Untitled Chat"}</p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConvToRename(c.id);
                      setRenameTitle(c.title || "");
                      setIsRenameOpen(true);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(c.id, e)}
                    className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground border border-dashed rounded-lg">
              No previous chats found.
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Active Chat panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border/60 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold truncate max-w-xs">
                {activeConvId
                  ? conversations.find((c) => c.id === activeConvId)?.title || "Active Chat Session"
                  : "General AI Assistant"}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>Workspace Context Aware</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="text-purple-600 font-semibold dark:text-purple-400">
                  Active Agent: {AGENTS.find(a => a.id === activeAgentId)?.name || "Draft Agent"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                onClick={() => {
                  setAgentMode("automatic");
                }}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                  agentMode === "automatic"
                    ? "bg-purple-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Auto
              </button>
              <button
                onClick={() => {
                  setAgentMode("manual");
                }}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                  agentMode === "manual"
                    ? "bg-purple-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Manual
              </button>
            </div>

            {agentMode === "manual" && (
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  setActiveAgentId(e.target.value);
                }}
                className="bg-card border border-border rounded-lg px-2.5 py-1 text-[10px] font-semibold text-foreground outline-none focus:border-purple-500 cursor-pointer max-w-[120px]"
              >
                {AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
              <Bot className="h-12 w-12 text-purple-600 animate-pulse mb-3" />
              <h4 className="text-sm font-semibold">AI Legal Draft Assistant</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                Start by typing your query below or choosing a preset prompt. The AI automatically references cases, clients, and files in this workspace.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                  m.role === "assistant" ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300" : "bg-slate-200 text-slate-700"
                )}
              >
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="max-w-[75%]">
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 border",
                    m.role === "assistant"
                      ? "bg-muted/15 border-border text-foreground shadow-sm"
                      : "bg-purple-700 border-purple-800 text-white shadow-md shadow-purple-900/10"
                  )}
                >
                  {m.role === "assistant" ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    <div className="text-xs whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>

                {/* Actions below Assistant responses */}
                {m.role === "assistant" && m.content && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopyText(m.content)}
                      title="Copy content"
                      className="h-6 text-[10px] text-muted-foreground hover:text-purple-600 gap-1.5 cursor-pointer px-1.5 rounded"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleSaveAsDraft(m.content)}
                      title="Save response as a new draft"
                      className="h-6 text-[10px] text-muted-foreground hover:text-purple-600 gap-1.5 cursor-pointer px-1.5 rounded"
                    >
                      <FileEdit className="h-3 w-3" />
                      Save Draft
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleInsertIntoEditor(m.content)}
                      title="Load in Document Editor"
                      className="h-6 text-[10px] text-muted-foreground hover:text-purple-600 gap-1.5 cursor-pointer px-1.5 rounded"
                    >
                      <Plus className="h-3 w-3" />
                      Insert into Editor
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleExport("docx", m.content)}
                      title="Export DOCX"
                      className="h-6 text-[10px] text-muted-foreground hover:text-purple-600 gap-1.5 cursor-pointer px-1.5 rounded"
                    >
                      <Download className="h-3 w-3" />
                      DOCX
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleExport("pdf", m.content)}
                      title="Export PDF"
                      className="h-6 text-[10px] text-muted-foreground hover:text-purple-600 gap-1.5 cursor-pointer px-1.5 rounded"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 p-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-purple-700 animate-bounce" />
              </div>
              <div className="flex gap-1 items-center mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached preview */}
        {attachedFile && (
          <div className="px-4 py-2 bg-purple-50/50 border-t border-purple-200/50 flex items-center justify-between text-xs text-purple-700 dark:bg-purple-950/20 dark:text-purple-300">
            <span className="flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              Attached: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              id="chat-file-input"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleFileAttach}
              disabled={uploading}
              title="Attach document/PDF to context"
              className="border-border cursor-pointer flex-shrink-0 text-muted-foreground hover:text-foreground"
              id="attach-file-btn"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Input
              id="ai-workspace-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything, draft legal forms, or analyze uploaded PDFs..."
              className="bg-card border-border flex-1"
            />
            <Button
              id="ai-workspace-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() && !attachedFile}
              className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Col 3: Side Controls (Workspace Context, Prompts, Recent Files) */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-thin p-1">
        {/* Workspace Context awareness */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-purple-600" />
              AI Workspace Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1.5 text-xs">
            <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><Settings className="h-3 w-3" /> Workspace:</span>
                <span className="font-semibold text-foreground truncate max-w-[120px]">{workspaceInfo?.name || "Default"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/50">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><Users className="h-3 w-3" /> Client:</span>
                <span className="font-semibold text-foreground truncate max-w-[120px]">{activeClient?.full_name || "None"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/50">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><Briefcase className="h-3 w-3" /> Case:</span>
                <span className="font-semibold text-foreground truncate max-w-[120px]" title={activeCase?.title}>{activeCase?.title || "None"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/50">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><FileText className="h-3 w-3" /> Latest Draft:</span>
                <span className="font-semibold text-foreground truncate max-w-[120px]">{drafts.length > 0 ? drafts[0].title : "None"}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * The system prompt includes these entities automatically. All Gemini queries will be workspace-aware.
            </p>
          </CardContent>
        </Card>

        {/* Saved Prompts */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Saved Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1.5">
            {PRESET_PROMPTS.map((p, i) => (
              <button
                key={i}
                id={`saved-prompt-${i}`}
                onClick={() => setInput(p.text)}
                className="w-full text-left p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/40 transition-colors text-xs text-foreground font-medium truncate cursor-pointer block"
              >
                {p.title}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-purple-600" />
              Recent Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-1.5">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/5 hover:border-purple-200 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate max-w-[120px] text-foreground">{file.originalName}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{(file.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-semibold flex-shrink-0">
                    {file.fileType.split("/")[1] || "file"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-4">
                No attachments uploaded in this workspace.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RENAME CHAT DIALOG */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Chat Thread</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameChat}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label htmlFor="rename_title_input" className="text-xs font-semibold text-muted-foreground">New Title</label>
                <Input
                  id="rename_title_input"
                  required
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  placeholder="e.g. Land sale discussion"
                  className="bg-card border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Title
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
