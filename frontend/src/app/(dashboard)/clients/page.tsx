"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Building,
  Loader2,
  Eye,
  Briefcase,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  fetchWorkspaces,
  provisionWorkspace,
  fetchCases,
  ClientData
} from "@/lib/api";
import { Case } from "@/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [search, setSearch] = useState("");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Form states
  const [form, setForm] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
    address: "",
    company: "",
    notes: ""
  });

  // Resolve active workspace on mount
  useEffect(() => {
    async function initWorkspace() {
      try {
        const stored = localStorage.getItem("legaldraft_active_workspace");
        if (stored) {
          setActiveWorkspaceId(stored);
          return;
        }

        // Fetch from backend
        let list = await fetchWorkspaces();
        if (list.length === 0) {
          // Auto-provision a default workspace
          const ws = await provisionWorkspace({
            organization_name: "My Law Firm",
            organization_slug: `firm-${Math.floor(1000 + Math.random() * 9000)}`,
            workspace_name: "Default Workspace",
            workspace_slug: "default"
          });
          list = [ws];
        }

        const activeId = list[0].id;
        setActiveWorkspaceId(activeId);
        localStorage.setItem("legaldraft_active_workspace", activeId);
      } catch (err) {
        console.error("Workspace init error", err);
      }
    }
    initWorkspace();
  }, []);

  // Fetch clients when workspace is resolved
  useEffect(() => {
    if (!activeWorkspaceId) return;

    async function loadClients() {
      setIsLoading(true);
      try {
        const data = await fetchClients(activeWorkspaceId!);
        setClients(data);
      } catch (err) {
        toast.error("Failed to load clients");
      } finally {
        setIsLoading(false);
      }
    }
    loadClients();
  }, [activeWorkspaceId]);

  const handleViewClient = useCallback(async (client: ClientData) => {
    setSelectedClient(client);
    setIsViewOpen(true);
    setLoadingCases(true);
    try {
      if (activeWorkspaceId) {
        const cases = await fetchCases(activeWorkspaceId, undefined, client.id);
        setClientCases(cases);
      }
    } catch {
      setClientCases([]);
    } finally {
      setLoadingCases(false);
    }
  }, [activeWorkspaceId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name) {
      toast.error("Full Name is required");
      return;
    }

    try {
      const newClient = await createClient(activeWorkspaceId!, {
        full_name: form.full_name,
        mobile_number: form.mobile_number || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined
      });

      setClients((prev) => [newClient, ...prev]);
      setIsAddOpen(false);
      setForm({ full_name: "", mobile_number: "", email: "", address: "", company: "", notes: "" });
      toast.success("Client added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add client");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !form.full_name) return;

    try {
      const updated = await updateClient(selectedClient.id, {
        full_name: form.full_name,
        mobile_number: form.mobile_number || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined
      });

      setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? updated : c)));
      setIsEditOpen(false);
      setSelectedClient(null);
      toast.success("Client details updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      await deleteClient(selectedClient.id);
      setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
      setIsDeleteOpen(false);
      setSelectedClient(null);
      toast.success("Client deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client");
    }
  };

  const filteredClients = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.mobile_number && c.mobile_number.includes(search)) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Client Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your firm's clients and their contact details securely
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ full_name: "", mobile_number: "", email: "", address: "", company: "", notes: "" });
            setIsAddOpen(true);
          }}
          className="gap-1.5 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
          id="add-client-btn"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="client-search"
          placeholder="Search by name, email, mobile, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading clients list...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-border bg-card hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleViewClient(client)}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold">
                        {getInitials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate max-w-[150px] group-hover:text-purple-600 transition-colors">{client.full_name}</h3>
                      {client.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[150px]">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          {client.company}
                        </p>
                      )}
                      {!client.company && (
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{client.id.slice(0, 8)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-purple-600 cursor-pointer"
                      onClick={() => handleViewClient(client)}
                      title="View client"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => {
                        setSelectedClient(client);
                        setForm({
                          full_name: client.full_name,
                          mobile_number: client.mobile_number || "",
                          email: client.email || "",
                          address: client.address || "",
                          company: client.company || "",
                          notes: client.notes || ""
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.mobile_number && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span>{client.mobile_number}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
                {client.notes && (
                  <div className="pt-2.5 border-t border-border/50">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Notes</p>
                    <p className="text-xs text-foreground bg-muted/30 p-2 rounded-lg line-clamp-2 leading-relaxed">
                      {client.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-sm">No clients found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            {search ? "No clients match your search criteria." : "Get started by adding your first client connection."}
          </p>
          {!search && (
            <Button
              onClick={() => setIsAddOpen(true)}
              size="sm"
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
            >
              Add Client Now
            </Button>
          )}
        </div>
      )}

      {/* View Client Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold text-xs">
                  {selectedClient ? getInitials(selectedClient.full_name) : ""}
                </AvatarFallback>
              </Avatar>
              {selectedClient?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-5 pt-2">
              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-3">
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Email</p>
                      <p className="text-sm truncate">{selectedClient.email}</p>
                    </div>
                  </div>
                )}
                {selectedClient.mobile_number && (
                  <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                    <Phone className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Mobile</p>
                      <p className="text-sm">{selectedClient.mobile_number}</p>
                    </div>
                  </div>
                )}
                {selectedClient.company && (
                  <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                    <Building className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Company</p>
                      <p className="text-sm truncate">{selectedClient.company}</p>
                    </div>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Address</p>
                      <p className="text-sm truncate">{selectedClient.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">Notes</p>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Associated Cases */}
              <div className="border-t border-border/50 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Associated Cases
                  </p>
                  <Badge variant="outline" className="text-xs">{clientCases.length}</Badge>
                </div>
                {loadingCases ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  </div>
                ) : clientCases.length > 0 ? (
                  <div className="space-y-2">
                    {clientCases.map((cs) => (
                      <Link href="/cases" key={cs.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group/case">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{cs.title || cs.caseNumber}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">{cs.caseNumber}</span>
                            <Badge variant="outline" className={`text-[10px] ${statusColor(cs.status)}`}>{cs.status}</Badge>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/case:text-purple-600 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No cases associated with this client yet.</p>
                )}
              </div>

              {/* Meta */}
              <div className="border-t border-border/50 pt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Added {new Date(selectedClient.created_at).toLocaleDateString()}
                </span>
                <span className="font-mono">{selectedClient.id.slice(0, 8)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ramesh@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  value={form.mobile_number}
                  onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company / Organization</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Tata Consultancy Services"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full physical office/home address"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Background notes about client or cases..."
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer">
                Save Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit_full_name">Full Name *</Label>
              <Input
                id="edit_full_name"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_mobile_number">Mobile Number</Label>
                <Input
                  id="edit_mobile_number"
                  value={form.mobile_number}
                  onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_company">Company / Organization</Label>
              <Input
                id="edit_company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_address">Address</Label>
              <Input
                id="edit_address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete client <strong className="text-foreground">{selectedClient?.full_name}</strong>?
            This action cannot be undone and will soft-delete client reference.
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
