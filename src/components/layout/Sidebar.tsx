"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Bot,
  Briefcase,
  Library,
  Search,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Scale,
  BarChart3,
  Shield,
  Sparkles,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockCurrentUser } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    group: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        id: "nav-dashboard",
      },
      {
        label: "Drafts",
        href: "/drafts",
        icon: FileText,
        id: "nav-drafts",
        badge: "23",
      },
      {
        label: "Templates",
        href: "/templates",
        icon: BookOpen,
        id: "nav-templates",
      },
      {
        label: "Cases",
        href: "/cases",
        icon: Briefcase,
        id: "nav-cases",
      },
    ],
  },
  {
    group: "AI Tools",
    items: [
      {
        label: "AI Assistant",
        href: "/ai-assistant",
        icon: Bot,
        id: "nav-ai-assistant",
        isNew: true,
      },
      {
        label: "AI Case Analyzer",
        href: "/case-analyzer",
        icon: Sparkles,
        id: "nav-case-analyzer",
        isNew: true,
      },
      {
        label: "Legal Research",
        href: "/legal-research",
        icon: Search,
        id: "nav-legal-research",
      },
      {
        label: "Clause Library",
        href: "/clause-library",
        icon: Library,
        id: "nav-clause-library",
      },
    ],
  },
  {
    group: "Analytics",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        id: "nav-analytics",
      },
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: ClipboardList,
        id: "nav-audit-logs",
        adminOnly: true,
      },
    ],
  },
  {
    group: "Admin",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        id: "nav-users",
        adminOnly: true,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        id: "nav-settings",
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentUser = user || mockCurrentUser;

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#1E293B] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-lg">
            <Scale className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-white font-bold text-sm tracking-tight truncate block">
                LegalDraft
              </span>
              <span className="text-purple-400 text-xs font-medium">AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {navItems.map((group) => (
          <div key={group.group} className="mb-1">
            {!collapsed && (
              <div className="px-4 mb-1">
                <span className="text-[#475569] text-[10px] font-semibold uppercase tracking-widest">
                  {group.group}
                </span>
              </div>
            )}
            {group.items.map((item) => {
              if (
                item.adminOnly &&
                currentUser.role !== "admin"
              ) {
                return null;
              }
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                    active
                      ? "bg-purple-700/20 text-white border border-purple-700/30"
                      : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-500 rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      active ? "text-purple-400" : "text-[#64748B] group-hover:text-[#94A3B8]"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="bg-purple-700/30 text-purple-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.isNew && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
            {!collapsed && <div className="mx-4 my-2 h-px bg-[#1E293B]" />}
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-[#1E293B] p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer mb-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">
                {currentUser.name}
              </p>
              <p className="text-[#64748B] text-[10px] truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          id="sidebar-toggle"
          className="flex items-center justify-center w-full py-2 text-[#475569] hover:text-white hover:bg-[#1E293B] rounded-lg transition-all duration-150"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
