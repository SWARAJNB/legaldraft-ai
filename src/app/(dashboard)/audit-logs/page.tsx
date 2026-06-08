"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  FileText,
  Trash2,
  Edit,
  Archive,
  Upload,
  UserPlus,
  LogIn,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAuditLogs } from "@/lib/mock-data";
import { AuditLog } from "@/types";
import { cn, formatDateTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  CREATED: { icon: FileText, color: "text-emerald-700", bg: "bg-emerald-50" },
  UPDATED: { icon: Edit, color: "text-blue-700", bg: "bg-blue-50" },
  DELETED: { icon: Trash2, color: "text-red-700", bg: "bg-red-50" },
  ARCHIVED: { icon: Archive, color: "text-gray-600", bg: "bg-gray-100" },
  EXPORTED: { icon: Upload, color: "text-orange-700", bg: "bg-orange-50" },
  INVITED: { icon: UserPlus, color: "text-purple-700", bg: "bg-purple-50" },
  ROLE_CHANGED: {
    icon: Shield,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  LOGIN: { icon: LogIn, color: "text-teal-700", bg: "bg-teal-50" },
  LOGOUT: { icon: LogOut, color: "text-slate-600", bg: "bg-slate-100" },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchAction =
      actionFilter === "all" || log.action === actionFilter;
    const matchUser = userFilter === "all" || log.userId === userFilter;
    return matchSearch && matchAction && matchUser;
  });

  const uniqueUsers = [
    ...new Map(
      mockAuditLogs.map((l) => [l.userId, { id: l.userId, name: l.userName }])
    ).values(),
  ];

  const uniqueActions = [...new Set(mockAuditLogs.map((l) => l.action))];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">
            Admin-only · Complete activity history for your firm
          </p>
        </div>
        <Button
          id="export-logs-btn"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => toast.success("Exporting audit logs to CSV...")}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Actions",
            value: mockAuditLogs.length,
            icon: Shield,
            color: "text-purple-700 bg-purple-50",
          },
          {
            label: "Today",
            value: 3,
            icon: Calendar,
            color: "text-blue-700 bg-blue-50",
          },
          {
            label: "Active Users",
            value: uniqueUsers.length,
            icon: User,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Exports",
            value: mockAuditLogs.filter((l) => l.action === "EXPORTED").length,
            icon: Upload,
            color: "text-orange-700 bg-orange-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="audit-search"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40" id="action-filter">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-44" id="user-filter">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" id="audit-logs-table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Action", "Resource", "Details", "IP Address", "Timestamp"].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                        ["IP Address", "Resource"].includes(h) &&
                          "hidden md:table-cell",
                        h === "Details" && "hidden xl:table-cell"
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const config =
                  ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATED;
                return (
                  <tr
                    key={log.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(log.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium">{log.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                          config.bg,
                          config.color
                        )}
                      >
                        <config.icon className="h-3 w-3" />
                        {log.action}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {log.resource} #{log.resourceId.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <p className="text-xs text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {log.ipAddress}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Shield className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No logs found</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {mockAuditLogs.length} entries
          </p>
          <div className="flex gap-1">
            {["1", "2", "3"].map((page) => (
              <button
                key={page}
                className={cn(
                  "h-7 w-7 rounded text-xs font-medium",
                  page === "1"
                    ? "bg-purple-700 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
