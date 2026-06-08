"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  RefreshCw,
  Copy,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FLOW_STEPS = [
  { id: 1, label: "Draft Type", question: "What type of legal document do you need to draft?" },
  { id: 2, label: "Client Info", question: "Please provide the client's name and basic details." },
  { id: 3, label: "Case Details", question: "Describe the case facts and key details." },
  { id: 4, label: "Court/Forum", question: "Which court or forum will this be filed in?" },
  { id: 5, label: "Relief Sought", question: "What relief or prayer is the client seeking?" },
];

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
      "Hello! I'm your AI Legal Draft Assistant. I'll help you create professional legal documents step by step.\n\nTo get started, tell me:\n• What type of legal document do you need?\n• Or pick a quick option below",
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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDraft, setShowDraft] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    setTimeout(() => {
      setIsTyping(false);
      let response = "";

      if (nextStep >= FLOW_STEPS.length) {
        response =
          "✅ I have all the information I need! I'm now generating your legal document...\n\nThis may take a moment. Click **'Generate Draft'** to proceed.";
        setShowDraft(true);
        setGeneratedDraft(
          `IN THE COURT OF SESSIONS JUDGE\n\nCASE NO: ___/2024\n\nIN THE MATTER OF:\n${userMessage.includes("bail") ? "State vs. [Accused Name]" : "[Petitioner] vs. [Respondent]"}\n\nPETITION/APPLICATION FOR ${userMessage.toUpperCase()}\n\n...The document is being generated based on your inputs...\n\nPRAYER:\nIt is therefore humbly prayed that this Hon'ble Court may be pleased to grant the relief sought herein.\n\n      Respectfully submitted,\n      [Advocate Name]\n      Bar Council No: ___________`
        );
      } else if (nextStep < FLOW_STEPS.length) {
        const step = FLOW_STEPS[nextStep];
        response = `Thank you! I've noted that down.\n\n**Step ${nextStep + 1}/${FLOW_STEPS.length}: ${step.label}**\n\n${step.question}`;
      } else {
        response =
          "Great! Based on what you've told me, I'll now generate your draft. One moment...";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    }, 1500 + Math.random() * 500);
  };

  const sendMessage = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    simulateAIResponse(messageText);
  };

  const reset = () => {
    setMessages(INITIAL_MESSAGES);
    setCurrentStep(0);
    setShowDraft(false);
    setGeneratedDraft("");
  };

  const progressPct = Math.round(
    (Math.min(currentStep, FLOW_STEPS.length) / FLOW_STEPS.length) * 100
  );

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
                  <CardTitle className="text-sm">AI Draft Assistant</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Powered by LegalDraft AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px]">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Online
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

          {/* Quick Prompts (only when at start) */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  id={`quick-prompt-${i}`}
                  onClick={() => sendMessage(prompt)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Generate Draft button */}
          {showDraft && (
            <div className="flex-shrink-0 px-4 pb-3">
              <Button
                id="generate-draft-btn"
                className="w-full gap-2"
                onClick={() =>
                  toast.success("Draft sent to editor!", {
                    description: "Open the Document Editor to review and edit.",
                  })
                }
              >
                <Sparkles className="h-4 w-4" />
                Send Draft to Editor
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex gap-2">
              <Input
                id="ai-chat-input"
                placeholder="Type your message..."
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
            <p className="text-[10px] text-muted-foreground/70 mt-1.5 text-center">
              Press Enter to send · AI responses are for guidance only
            </p>
          </div>
        </Card>
      </div>

      {/* Right: Progress + Draft Panel */}
      <div className="w-72 flex-shrink-0 space-y-4 hidden lg:block">
        {/* Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold text-purple-700">
                  {progressPct}%
                </span>
              </div>
              <Progress value={progressPct} className="h-2" id="draft-progress-bar" />
            </div>
            <div className="space-y-2 mt-2">
              {FLOW_STEPS.map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  {step.id <= currentStep ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : step.id === currentStep + 1 ? (
                    <Circle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      step.id <= currentStep
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generated Draft Preview */}
        {generatedDraft && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated Draft</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  id="copy-draft-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDraft);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-3 border text-[10px] font-mono text-slate-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin">
                {generatedDraft}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-purple-50/50 border-purple-200/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-purple-700 mb-2">
              💡 Tips
            </p>
            <ul className="space-y-1.5">
              {[
                "Be specific about the court name",
                "Include case section numbers",
                "Mention all relevant dates",
                "List all parties clearly",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="text-xs text-purple-700/80 flex items-start gap-1.5"
                >
                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
