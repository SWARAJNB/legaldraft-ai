"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { mockUsers } from "@/lib/mock-data";
import { User, UserRole } from "@/types";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  lawyer: "Lawyer",
  "legal-assistant": "Legal Assistant",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access — manage users, settings, and all drafts",
  lawyer: "Can create, edit, and finalize drafts and cases",
  "legal-assistant": "Can view and assist with drafts under supervision",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    name: "",
    role: "lawyer" as UserRole,
  });
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
    const user = users.find((u) => u.id === userId);
    toast.success(
      `${user?.name} has been ${user?.isActive ? "deactivated" : "activated"}`
    );
  };

  const handleInvite = () => {
    toast.success(`Invitation sent to ${inviteData.email}`, {
      description: `Invited as ${ROLE_LABELS[inviteData.role]}`,
    });
    setShowInviteModal(false);
    setInviteData({ email: "", name: "", role: "lawyer" });
  };

  const changeRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    const user = users.find((u) => u.id === userId);
    toast.success(`${user?.name}'s role updated to ${ROLE_LABELS[newRole]}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members, roles, and access for Lex & Associates
          </p>
        </div>
        <Button
          id="invite-user-btn"
          onClick={() => setShowInviteModal(true)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-purple-700 bg-purple-50" },
          {
            label: "Active",
            value: users.filter((u) => u.isActive).length,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin").length,
            color: "text-red-700 bg-red-50",
          },
          {
            label: "Lawyers",
            value: users.filter((u) => u.role === "lawyer").length,
            color: "text-blue-700 bg-blue-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="users-search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "admin", "lawyer", "legal-assistant"].map((role) => (
            <button
              key={role}
              id={`role-filter-${role}`}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                roleFilter === role
                  ? "bg-purple-700 text-white"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {role === "all" ? "All" : role === "legal-assistant" ? "Assistants" : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" id="users-table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Role", "Status", "Last Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                        h === "Last Active" && "hidden lg:table-cell"
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(v) => changeRole(user.id, v as UserRole)}
                    >
                      <SelectTrigger
                        className="w-36 h-7 text-xs border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0"
                        id={`role-select-${user.id}`}
                      >
                        <Badge
                          variant={user.role as any}
                          className="text-[10px]"
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {(["admin", "lawyer", "legal-assistant"] as UserRole[]).map(
                          (role) => (
                            <SelectItem key={role} value={role}>
                              <div>
                                <p className="font-medium">
                                  {ROLE_LABELS[role]}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {ROLE_DESCRIPTIONS[role]}
                                </p>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`toggle-user-${user.id}`}
                        checked={user.isActive}
                        onCheckedChange={() => toggleActive(user.id)}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          user.isActive
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(user.lastActive)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          id={`user-actions-${user.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent id="invite-user-modal">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new team member to your firm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                placeholder="e.g., Ananya Krishnan"
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@firm.com"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Assign Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(v) =>
                  setInviteData({ ...inviteData, role: v as UserRole })
                }
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["admin", "lawyer", "legal-assistant"] as UserRole[]).map(
                    (role) => (
                      <SelectItem key={role} value={role}>
                        <div>
                          <p className="font-medium">{ROLE_LABELS[role]}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {ROLE_DESCRIPTIONS[role]}
                          </p>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button
              id="send-invite-btn"
              onClick={handleInvite}
              disabled={!inviteData.email || !inviteData.name}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
