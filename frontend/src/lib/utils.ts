import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `CAS-${year}-${num}`;
}

export const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  finalized: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-red-50 text-red-700 border-red-200",
} as const;

export const ROLE_COLORS = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  lawyer: "bg-blue-50 text-blue-700 border-blue-200",
  "legal-assistant": "bg-teal-50 text-teal-700 border-teal-200",
} as const;

export function downloadDraft(
  draft: { title: string; caseNumber: string; category: string; version: number },
  textContent?: string
) {
  const content =
    textContent ||
    `LEGAL DRAFT DOCUMENT
====================
Title: ${draft.title}
Case Number: ${draft.caseNumber}
Category: ${draft.category.toUpperCase()}
Version: v${draft.version}
Date Generated: ${new Date().toLocaleDateString()}

----------------------------------------------------------------------
This is a certified legal document draft prepared using LegalDraft AI.

IN THE SESSIONS COURT OF INDIA
In the matter of: ${draft.title} (${draft.caseNumber})

The applicant prays that the reliefs be granted in the interest of justice.
----------------------------------------------------------------------
Disclaimer: This is a generated legal draft mockup.
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Format file name
  const cleanTitle = draft.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.download = `${cleanTitle}.txt`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
