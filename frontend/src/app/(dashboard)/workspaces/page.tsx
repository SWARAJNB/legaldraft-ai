"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  User,
  Calendar,
  FileText,
  Shield,
  Edit,
  Users,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";
import {
  fetchWorkspaces,
  provisionWorkspace,
  updateWorkspace,
  inviteMember,
  Workspace
} from "@/lib/api";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Form states
  const [provisionForm, setProvisionForm] = useState({
    organization_name: "",
    organization_slug: "",
    workspace_name: "",
    workspace_slug: ""
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: ""
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member"
  });

  const [invitedMembers, setInvitedMembers] = useState<{ email: string; role: string; status: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await fetchWorkspaces();
        setWorkspaces(list);

        const stored = localStorage.getItem("legaldraft_active_workspace");
        if (stored && list.some(w => w.id === stored)) {
          setActiveWorkspaceId(stored);
        } else if (list.length > 0) {
          setActiveWorkspaceId(list[0].id);
          localStorage.setItem("legaldraft_active_workspace", list[0].id);
        }
      } catch (err) {
        toast.error("Failed to load workspaces list");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;

  const handleSwitchWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem("legaldraft_active_workspace", id);
    toast.success("Switched active workspace", {
      description: `Active workspace is now set to ${workspaces.find(w => w.id === id)?.name}.`
    });
    // Trigger reloading pages that rely on workspace
    window.dispatchEvent(new Event("workspace-changed"));
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    const { organization_name, organization_slug, workspace_name, workspace_slug } = provisionForm;
    if (!organization_name || !workspace_name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const orgSlug = organization_slug || organization_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const wsSlug = workspace_slug || workspace_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const ws = await provisionWorkspace({
        organization_name,
        organization_slug: orgSlug,
        workspace_name,
        workspace_slug: wsSlug
      });

      setWorkspaces((prev) => [...prev, ws]);
      setIsProvisionOpen(false);
      setProvisionForm({ organization_name: "", organization_slug: "", workspace_name: "", workspace_slug: "" });
      handleSwitchWorkspace(ws.id);
      toast.success("Workspace provisioned successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to provision workspace");
    }
  };

  const handleEditWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId || !editForm.name) return;

    try {
      const updated = await updateWorkspace(activeWorkspaceId, {
        name: editForm.name,
        description: editForm.description || undefined
      });

      setWorkspaces((prev) => prev.map(w => w.id === activeWorkspaceId ? updated : w));
      setIsEditOpen(false);
      toast.success("Workspace updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId || !inviteForm.email) return;

    try {
      await inviteMember(activeWorkspaceId, inviteForm.email, inviteForm.role);
      setInvitedMembers((prev) => [
        { email: inviteForm.email, role: inviteForm.role, status: "pending" },
        ...prev
      ]);
      setIsInviteOpen(false);
      toast.success("Invitation sent successfully", {
        description: `An invite was sent to ${inviteForm.email}.`
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Workspace Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your tenant workspaces, organizations, and firm isolation
          </p>
        </div>
        <Button
          onClick={() => setIsProvisionOpen(true)}
          className="gap-1.5 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading workspace details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Workspace Details */}
          <div className="lg:col-span-2 space-y-6">
            {activeWorkspace ? (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold">{activeWorkspace.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {activeWorkspace.slug}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        Workspace ID: <span className="font-mono text-xs select-all">{activeWorkspace.id}</span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditForm({
                          name: activeWorkspace.name,
                          description: activeWorkspace.description || ""
                        });
                        setIsEditOpen(true);
                      }}
                      className="gap-1 cursor-pointer border-border hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                    <p className="text-sm leading-relaxed text-foreground">
                      {activeWorkspace.description || "No description provided. Click 'Edit Details' to configure workspace description."}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border/50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Created Date</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        <span>{formatDate(activeWorkspace.created_at)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Workspace Owner</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="h-3.5 w-3.5 text-purple-600" />
                        <span className="font-semibold">Firm Admin (You)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Members</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="h-3.5 w-3.5 text-purple-600" />
                        <span>1 active member</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-10 bg-card border rounded-xl">
                <p className="text-muted-foreground">Select or create a workspace to view details</p>
              </div>
            )}

            {/* Simulated Members section for visuals */}
            {activeWorkspace && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        Members ({1 + invitedMembers.length})
                      </CardTitle>
                      <CardDescription>
                        Users assigned access to this workspace and their respective authorization roles
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      id="invite-member-btn"
                      onClick={() => {
                        setInviteForm({ email: "", role: "member" });
                        setIsInviteOpen(true);
                      }}
                      className="h-8 gap-1.5 cursor-pointer bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-700">ME</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">Firm Owner</p>
                        <p className="text-[10px] text-muted-foreground">Administrator</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-700/20 text-purple-300 hover:bg-purple-700/20 text-[10px] border-purple-700/30 font-medium px-2 py-0.5">
                      Owner
                    </Badge>
                  </div>

                  {invitedMembers.map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-border bg-muted/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {getInitials(invite.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate max-w-[180px]">{invite.email}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{invite.status}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-medium px-2 py-0.5 capitalize">
                        {invite.role}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar: list of workspaces to switch */}
          <div>
            <Card className="border-border bg-card h-full">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm">Select Workspace</CardTitle>
                <CardDescription>Switch between your active isolated workspaces</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspaceId;
                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleSwitchWorkspace(ws.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 ${
                        isActive
                          ? "border-purple-400 bg-purple-50/20 dark:border-purple-800 dark:bg-purple-950/10 shadow-sm"
                          : "border-border bg-card hover:border-purple-200 dark:hover:border-purple-900"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">{ws.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{ws.slug}</p>
                      </div>
                      {isActive && <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Provision Workspace Dialog */}
      <Dialog open={isProvisionOpen} onOpenChange={setIsProvisionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Provision Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProvision} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="org_name">Organization Name *</Label>
              <Input
                id="org_name"
                required
                value={provisionForm.organization_name}
                onChange={(e) => setProvisionForm({ ...provisionForm, organization_name: e.target.value })}
                placeholder="e.g. Lex Associates Ltd"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org_slug">Organization Slug (optional)</Label>
              <Input
                id="org_slug"
                value={provisionForm.organization_slug}
                onChange={(e) => setProvisionForm({ ...provisionForm, organization_slug: e.target.value })}
                placeholder="e.g. lex-associates"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws_name">Workspace Name *</Label>
              <Input
                id="ws_name"
                required
                value={provisionForm.workspace_name}
                onChange={(e) => setProvisionForm({ ...provisionForm, workspace_name: e.target.value })}
                placeholder="e.g. Corporate Law Practice"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws_slug">Workspace Slug (optional)</Label>
              <Input
                id="ws_slug"
                value={provisionForm.workspace_slug}
                onChange={(e) => setProvisionForm({ ...provisionForm, workspace_slug: e.target.value })}
                placeholder="e.g. corporate-law"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsProvisionOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Provision Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Workspace Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditWorkspace} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit_ws_name">Workspace Name *</Label>
              <Input
                id="edit_ws_name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_ws_desc">Description</Label>
              <Textarea
                id="edit_ws_desc"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe the scope or purpose of this workspace..."
                rows={4}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Workspace Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite_email">Email Address *</Label>
              <Input
                id="invite_email"
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="colleague@lawfirm.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite_role">Access Role *</Label>
              <select
                id="invite_role"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 text-foreground"
              >
                <option value="member">Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer" id="submit-invite-btn">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
