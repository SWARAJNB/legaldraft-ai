"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  User,
  Send,
  RefreshCw,
  Copy,
  Sparkles,
  FileEdit,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { chatWithAI, downloadGeneratedFile, generateAIDraft, GeneratedDraftFile } from "@/lib/api";
import { useDrafts } from "@/context/drafts/DraftsContext";
import { TemplateCategory } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  file?: GeneratedDraftFile;
}

const QUICK_PROMPTS = [
  "Draft a bail application for Sessions Court",
  "Create a civil suit plaint for money recovery",
  "Write a divorce petition under HMA Section 13",
  "Prepare a property sale agreement",
  "Draft an injunction application",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m0",
    role: "assistant",
    content:
      "Hello! I'm your AI Legal Draft Assistant. I can help you create professional legal documents using real-time OpenAI drafting.\n\nYou can chat with me about your case, or directly fill out the parameters on the right to generate a draft instantly!",
    timestamp: new Date(),
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3">
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-purple-700" />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const { createDraft } = useDrafts();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Guided / Manual parameters
  const [draftParams, setDraftParams] = useState({
    draftType: "",
    clientInfo: "",
    caseDetails: "",
    court: "",
    relief: "",
  });

  const [generatedDraft, setGeneratedDraft] = useState("");
  const [generatedFile, setGeneratedFile] = useState<GeneratedDraftFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: `m_${Date.now()}_u`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Map existing messages to API format
      const apiMessages = messages.concat(userMsg).map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));

      // Call OpenAI Chat Backend
      const aiResponse = await chatWithAI(apiMessages);

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}_a`,
          role: "assistant",
          content: aiResponse.response,
          timestamp: new Date(),
          file: aiResponse.file,
        },
      ]);

      // Try to parse some info from the conversation if possible to pre-fill inputs
      // We will do a simple heuristic check
      const lowerText = messageText.toLowerCase();
      setDraftParams((prev) => {
        const next = { ...prev };
        if (!next.draftType && (lowerText.includes("bail") || lowerText.includes("plaint") || lowerText.includes("petition") || lowerText.includes("agreement"))) {
          next.draftType = messageText;
        } else if (!next.court && (lowerText.includes("court") || lowerText.includes("forum") || lowerText.includes("tribunal"))) {
          next.court = messageText;
        } else if (!next.clientInfo && (lowerText.includes("client") || lowerText.includes("name is") || lowerText.includes("aged"))) {
          next.clientInfo = messageText;
        } else if (!next.caseDetails && (lowerText.includes("facts") || lowerText.includes("arrested") || lowerText.includes("dispute"))) {
          next.caseDetails = messageText;
        } else if (!next.relief && (lowerText.includes("relief") || lowerText.includes("prayer") || lowerText.includes("seeking"))) {
          next.relief = messageText;
        }
        return next;
      });

    } catch (error: unknown) {
      setIsTyping(false);
      toast.error("Error communicating with AI Assistant", {
        description: getErrorMessage(error, "Failed to fetch response."),
      });
    }
  };

  const handleGenerateDraft = async () => {
    if (!draftParams.draftType.trim()) {
      toast.error("Please enter a Draft Type before generating.");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating professional legal draft using OpenAI...", { duration: 3000 });

    try {
      const draftResult = await generateAIDraft({
        draft_type: draftParams.draftType,
        client_info: draftParams.clientInfo,
        case_details: draftParams.caseDetails,
        court: draftParams.court,
        relief: draftParams.relief,
      });

      setGeneratedDraft(draftResult.draft);
      setGeneratedFile(draftResult.file || null);
      toast.success(draftResult.file ? "Draft and PDF generated successfully!" : "Draft generated successfully!");
    } catch (error: unknown) {
      toast.error("Draft Generation Failed", {
        description: getErrorMessage(error, "Failed to call OpenAI service."),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToEditor = () => {
    if (!generatedDraft) return;

    // Determine category
    const dt = draftParams.draftType.toLowerCase();
    let category: TemplateCategory = "criminal";
    if (dt.includes("property") || dt.includes("sale") || dt.includes("lease")) {
      category = "property";
    } else if (dt.includes("divorce") || dt.includes("marriage") || dt.includes("custody") || dt.includes("maintenance")) {
      category = "family";
    } else if (dt.includes("civil") || dt.includes("suit") || dt.includes("money") || dt.includes("contract")) {
      category = "civil";
    }

    const title = draftParams.draftType || "AI Generated Legal Draft";
    const client = draftParams.clientInfo ? draftParams.clientInfo.split(",")[0] : "AI Client";

    const newDraftObj = createDraft(title, client, category, generatedDraft);
    toast.success("Draft created and loaded in Editor!", {
      description: "Redirecting you now...",
    });
    
    router.push(`/editor/${newDraftObj.id}`);
  };

  const reset = () => {
    setMessages(INITIAL_MESSAGES);
    setDraftParams({
      draftType: "",
      clientInfo: "",
      caseDetails: "",
      court: "",
      relief: "",
    });
    setGeneratedDraft("");
    setGeneratedFile(null);
  };

  const handleDownloadPdf = async (file?: GeneratedDraftFile | null) => {
    const target = file || generatedFile;
    if (!target) return;

    try {
      await downloadGeneratedFile(target);
      toast.success("PDF download started");
    } catch (error: unknown) {
      toast.error("PDF Download Failed", {
        description: getErrorMessage(error, "Unable to download the generated PDF."),
      });
    }
  };

  // Calculate completion percentage based on filled fields
  const filledFieldsCount = Object.values(draftParams).filter(Boolean).length;
  const progressPct = Math.round((filledFieldsCount / 5) * 100);

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in">
      {/* Left: Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">AI Draft Assistant Chat</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Discuss case details and gather facts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px]">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Live OpenAI Connected
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  id="reset-chat-btn"
                  onClick={reset}
                  title="Reset conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                    msg.role === "assistant"
                      ? "bg-purple-100"
                      : "bg-slate-200"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-purple-700" />
                  ) : (
                    <User className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted/50 text-foreground"
                      : "bg-purple-700 text-white"
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.file && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2 text-xs"
                      onClick={() => handleDownloadPdf(msg.file || null)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </Button>
                  )}
                  <p
                    className={cn(
                      "text-[10px] mt-1.5",
                      msg.role === "assistant"
                        ? "text-muted-foreground"
                        : "text-purple-200"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  id={`quick-prompt-${i}`}
                  onClick={() => {
                    setDraftParams(prev => ({ ...prev, draftType: prompt }));
                    sendMessage(prompt);
                  }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex gap-2">
              <Input
                id="ai-chat-input"
                placeholder="Type your message to chat with AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                id="ai-send-btn"
                size="icon"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Draft Inputs + Generation Panel */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        {/* Form parameters */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Draft Context Parameters</CardTitle>
              <Badge className="bg-purple-100 text-purple-700 border-none">{progressPct}% filled</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Draft Type *</label>
              <Input
                value={draftParams.draftType}
                onChange={(e) => setDraftParams({ ...draftParams, draftType: e.target.value })}
                placeholder="e.g., Bail Application, Civil Plaint"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Client Information</label>
              <Input
                value={draftParams.clientInfo}
                onChange={(e) => setDraftParams({ ...draftParams, clientInfo: e.target.value })}
                placeholder="e.g., Rajan Kumar, Aged 34, Mumbai"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Court/Forum</label>
              <Input
                value={draftParams.court}
                onChange={(e) => setDraftParams({ ...draftParams, court: e.target.value })}
                placeholder="e.g., Sessions Court, Mumbai"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Case Facts & Details</label>
              <Textarea
                value={draftParams.caseDetails}
                onChange={(e) => setDraftParams({ ...draftParams, caseDetails: e.target.value })}
                placeholder="Key facts, section numbers, FIR dates..."
                className="text-xs min-h-[60px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Relief/Prayer Sought</label>
              <Input
                value={draftParams.relief}
                onChange={(e) => setDraftParams({ ...draftParams, relief: e.target.value })}
                placeholder="e.g., Grant of regular bail"
                className="h-8 text-xs"
              />
            </div>

            <Button
              id="generate-draft-btn"
              onClick={handleGenerateDraft}
              disabled={isGenerating || !draftParams.draftType}
              className="w-full h-9 mt-2 gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white"
            >
              {isGenerating ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isGenerating ? "Drafting..." : "Generate AI Draft"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Draft Preview */}
        {generatedDraft && (
          <Card className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <CardHeader className="pb-2 flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">AI Draft Preview</CardTitle>
                <div className="flex gap-1">
                  {generatedFile && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDownloadPdf()}
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDraft);
                      toast.success("Copied to clipboard");
                    }}
                    title="Copy draft"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 bg-slate-50 rounded-lg p-3 border text-[10px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap overflow-y-auto scrollbar-thin">
                {generatedDraft}
              </div>
              <Button
                id="send-to-editor-btn"
                className="w-full mt-3 gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                onClick={handleSendToEditor}
              >
                <FileEdit className="h-4 w-4" />
                Open in Document Editor
              </Button>
              {generatedFile && (
                <Button
                  id="download-generated-pdf-btn"
                  variant="outline"
                  className="w-full mt-2 gap-2 text-xs flex-shrink-0"
                  onClick={() => handleDownloadPdf()}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
