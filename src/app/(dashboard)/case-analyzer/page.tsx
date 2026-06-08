"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  Calendar,
  Users,
  Scale,
  Hash,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FileSearch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExtractedCaseData } from "@/types";
import { toast } from "sonner";

const EXTRACTION_STEPS = [
  "Uploading document...",
  "Parsing document structure...",
  "Extracting party names...",
  "Identifying legal sections...",
  "Extracting key dates...",
  "Analyzing case facts...",
  "Generating summary...",
  "Complete!",
];

const SAMPLE_EXTRACTED: ExtractedCaseData = {
  caseNumber: "CR/2024/1042",
  parties: ["State of Maharashtra (Prosecution)", "Rajan Kumar (Accused)"],
  dates: ["May 15, 2024 — Incident Date", "May 18, 2024 — Arrest Date", "May 28, 2024 — Remand Period End"],
  legalSections: ["IPC Section 420 (Cheating)", "IPC Section 406 (Criminal Breach of Trust)", "IPC Section 34 (Acts done by several persons)"],
  facts: [
    "Accused allegedly collected ₹25 lakhs from complainant for business investment",
    "Funds were not invested as promised and the accused failed to return the amount",
    "FIR registered at Andheri Police Station on May 15, 2024",
    "Accused was arrested on May 18, 2024",
  ],
  court: "Sessions Court, Mumbai",
  filingDate: "May 28, 2024",
};

type ExtractStep = "idle" | "extracting" | "done";

export default function CaseAnalyzerPage() {
  const [step, setStep] = useState<ExtractStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [currentExtractStep, setCurrentExtractStep] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedCaseData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const simulateExtraction = (file: File) => {
    setUploadedFile(file);
    setStep("extracting");
    setExtractionProgress(0);
    setCurrentExtractStep(0);

    let progress = 0;
    let stepIndex = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      stepIndex = Math.floor((progress / 100) * EXTRACTION_STEPS.length);

      setExtractionProgress(Math.min(progress, 100));
      setCurrentExtractStep(
        Math.min(stepIndex, EXTRACTION_STEPS.length - 1)
      );

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStep("done");
          setExtracted(SAMPLE_EXTRACTED);
        }, 500);
      }
    }, 250);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateExtraction(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateExtraction(file);
  };

  const reset = () => {
    setStep("idle");
    setUploadedFile(null);
    setExtractionProgress(0);
    setExtracted(null);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Case Analyzer</h2>
          <p className="text-sm text-muted-foreground">
            Upload FIR, PDF, Complaint, or Court Order — AI extracts all case data
            automatically
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {step === "idle" && (
        <Card>
          <CardContent className="p-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer",
                dragOver
                  ? "border-purple-500 bg-purple-50"
                  : "border-border hover:border-purple-300 hover:bg-muted/20"
              )}
              onClick={() => fileRef.current?.click()}
              id="file-drop-zone"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileInput}
                id="file-input"
              />
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                Drop your document here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF, Word, and text files up to 50MB
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {["FIR", "Complaint", "Court Order", "Chargesheet", "Affidavit"].map(
                  (type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  )
                )}
              </div>
              <Button
                className="mt-6 gap-2"
                id="upload-document-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                <FileText className="h-4 w-4" />
                Choose Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Progress */}
      {step === "extracting" && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileSearch className="h-7 w-7 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-base font-semibold">Analyzing Document</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {uploadedFile?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    {EXTRACTION_STEPS[currentExtractStep]}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {Math.round(extractionProgress)}%
                  </span>
                </div>
                <Progress value={extractionProgress} id="extraction-progress" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {EXTRACTION_STEPS.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {i < currentExtractStep ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    ) : i === currentExtractStep ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        i <= currentExtractStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.replace("...", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data */}
      {step === "done" && extracted && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">
                Extraction Complete — {uploadedFile?.name}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                id="re-analyze-btn"
                onClick={reset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Analyze Another
              </Button>
              <Button
                size="sm"
                id="auto-fill-draft-btn"
                className="gap-2"
                onClick={() =>
                  toast.success("Draft form auto-filled!", {
                    description: "All extracted data has been populated",
                  })
                }
              >
                <Sparkles className="h-4 w-4" />
                Auto-fill Draft
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case Number & Court */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4 text-purple-600" />
                  Case Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Case Number</p>
                  <p className="text-sm font-mono font-semibold mt-0.5">
                    {extracted.caseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Court</p>
                  <p className="text-sm font-semibold mt-0.5">{extracted.court}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Filing Date</p>
                  <p className="text-sm font-semibold mt-0.5">
                    {extracted.filingDate}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Parties Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {extracted.parties?.map((party, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs">{party}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legal Sections */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-red-600" />
                  Legal Sections Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {extracted.legalSections?.map((section, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-700">{section}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {extracted.dates?.map((date, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
                      <p className="text-xs">{date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facts */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Extracted Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {extracted.facts?.map((fact, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700">{fact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
