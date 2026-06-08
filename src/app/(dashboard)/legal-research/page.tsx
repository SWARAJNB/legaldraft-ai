"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  RefreshCw,
  BookOpen,
  Scale,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResearchMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

interface Citation {
  id: string;
  title: string;
  citation: string;
  court: string;
  year: number;
  relevance: "high" | "medium";
}

const SAMPLE_CITATIONS: Citation[] = [
  {
    id: "c1",
    title: "Arnesh Kumar vs State of Bihar",
    citation: "AIR 2014 SC 2756",
    court: "Supreme Court of India",
    year: 2014,
    relevance: "high",
  },
  {
    id: "c2",
    title: "D.K. Basu vs State of West Bengal",
    citation: "(1997) 1 SCC 416",
    court: "Supreme Court of India",
    year: 1997,
    relevance: "high",
  },
  {
    id: "c3",
    title: "Satender Kumar Antil vs CBI",
    citation: "(2022) 10 SCC 51",
    court: "Supreme Court of India",
    year: 2022,
    relevance: "medium",
  },
];

const QUICK_QUESTIONS = [
  "What are grounds for bail under Section 439 CrPC?",
  "Latest Supreme Court judgments on property disputes",
  "Child custody laws under Guardians and Wards Act",
  "Consumer protection remedies against builders",
  "Grounds for divorce under Hindu Marriage Act",
];

const RESEARCH_RESPONSES: Record<string, { content: string; hasCitations: boolean }> = {
  default: {
    content:
      "Based on my legal knowledge base, here's what I found:\n\n**Key Legal Principles:**\n1. The Supreme Court has consistently held that bail is the rule and jail is the exception (Sanjay Chandra v. CBI).\n\n2. Under Section 439 CrPC, the Sessions Court has concurrent jurisdiction with the High Court to grant bail for non-bailable offences.\n\n3. Relevant factors for bail consideration:\n   - Nature and gravity of the accusation\n   - Antecedents of the accused\n   - Possibility of the accused fleeing from justice\n   - Safety and security of the community\n\n**Landmark Judgments:**\nI've found 3 highly relevant judgments for your research:",
    hasCitations: true,
  },
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Scale className="h-4 w-4 text-blue-700" />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        Searching legal database...
      </span>
    </div>
  );
}

export default function LegalResearchPage() {
  const [messages, setMessages] = useState<ResearchMessage[]>([
    {
      id: "m0",
      role: "assistant",
      content:
        "Welcome to the Legal Research Assistant!\n\nI can help you with:\n• Finding relevant case law and precedents\n• Explaining legal provisions and sections\n• Identifying legal arguments for your case\n• Researching statutory interpretations\n\nWhat legal question can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = RESEARCH_RESPONSES.default;
      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now()}-res`,
          role: "assistant",
          content: response.content,
          citations: response.hasCitations ? SAMPLE_CITATIONS : undefined,
          timestamp: new Date(),
        },
      ]);
    }, 2500 + Math.random() * 1000);
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-112px)] animate-fade-in">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">Legal Research Assistant</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Powered by Indian Legal Database
                  </p>
                </div>
              </div>
              <Badge variant="info" className="text-[10px]">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
                Database Connected
              </Badge>
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
                    msg.role === "assistant" ? "bg-blue-100" : "bg-slate-200"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Scale className="h-4 w-4 text-blue-700" />
                  ) : (
                    <User className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] space-y-3",
                    msg.role === "user" && "items-end"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-muted/50 text-foreground"
                        : "bg-blue-600 text-white"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-2">
                      {msg.citations.map((citation) => (
                        <div
                          key={citation.id}
                          className="flex items-start gap-3 p-3 bg-white border border-border rounded-xl hover:border-blue-300 transition-colors"
                        >
                          <div
                            className={cn(
                              "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold",
                              citation.relevance === "high"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {citation.relevance === "high" ? "H" : "M"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">
                              {citation.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {citation.citation} · {citation.court} ·{" "}
                              {citation.year}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Save citation"
                              onClick={() =>
                                toast.success("Citation saved!", {
                                  description: citation.citation,
                                })
                              }
                            >
                              <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 px-4 pb-3">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    id={`research-quick-${i}`}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex gap-2">
              <Input
                id="research-input"
                placeholder="Ask a legal question..."
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
                id="research-send-btn"
                size="icon"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="w-64 flex-shrink-0 space-y-4 hidden lg:block">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Research Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Search by Section", icon: Search },
              { label: "Browse Judgments", icon: BookOpen },
              { label: "Bare Acts", icon: FileText },
              { label: "Case Tracker", icon: Scale },
            ].map((tool) => (
              <button
                key={tool.label}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left"
              >
                <tool.icon className="h-4 w-4" />
                {tool.label}
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              📚 Database Coverage
            </p>
            <ul className="space-y-1.5">
              {[
                "Supreme Court — 1950 to present",
                "All High Courts",
                "District Courts (major)",
                "Consumer Forums (NCDRC)",
                "Tribunals & Forums",
              ].map((item, i) => (
                <li
                  key={i}
                  className="text-[10px] text-blue-700/80 flex items-start gap-1"
                >
                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
