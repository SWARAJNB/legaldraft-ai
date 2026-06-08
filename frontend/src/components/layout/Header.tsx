"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  CheckCheck,
} from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockCurrentUser, mockNotifications } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/drafts": "Draft Management",
  "/templates": "Template Library",
  "/cases": "Case Management",
  "/ai-assistant": "AI Draft Assistant",
  "/legal-research": "Legal Research",
  "/clause-library": "Clause Library",
  "/analytics": "Legal Analytics",
  "/audit-logs": "Audit Logs",
  "/users": "User Management",
  "/settings": "Settings",
  "/case-analyzer": "AI Case Analyzer",
};

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout, user } = useAuth();
  
  const currentUser = user || mockCurrentUser;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([key]) =>
      pathname.startsWith(key)
    )?.[1] || "LegalDraft AI";

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const notifTypeColors = {
    success: "text-emerald-500",
    info: "text-blue-500",
    warning: "text-amber-500",
    error: "text-red-500",
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 transition-all duration-300",
        sidebarCollapsed ? "left-[68px]" : "left-[240px]"
      )}
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="header-search"
            placeholder="Search drafts, cases..."
            className="pl-9 w-56 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-purple-700"
          />
        </div>

        {/* New Draft Button */}
        <Button size="sm" id="header-new-draft-btn" className="h-8 gap-1.5 hidden sm:flex">
          <Plus className="h-3.5 w-3.5" />
          New Draft
        </Button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-purple-700 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold">Notifications</span>
                <button
                  onClick={markAllRead}
                  className="text-xs text-purple-700 hover:text-purple-800 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer",
                      !notif.isRead && "bg-purple-50/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                          !notif.isRead
                            ? "bg-purple-600"
                            : "bg-transparent"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatRelativeTime(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t">
                <button className="text-xs text-purple-700 hover:text-purple-800 w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="user-menu-btn"
              type="button"
              className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium hidden sm:block text-foreground">
                {currentUser.name.split(" ")[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium text-xs">{currentUser.name}</p>
                <p className="text-muted-foreground text-[10px] font-normal">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem id="user-profile-menu-item" className="cursor-pointer">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem id="user-settings-menu-item" className="cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="user-logout-menu-item"
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
