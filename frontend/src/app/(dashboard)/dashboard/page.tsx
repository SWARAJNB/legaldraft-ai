"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  Download,
  ArrowUpRight,
  Plus,
  Bot,
  Upload,
  Briefcase,
  Search,
  Clock,
  AlertCircle,
  Users,
  Scale,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  dashboardStats,
  recentActivity,
  mockAnalytics,
  mockDraftTrends,
} from "@/lib/mock-data";
import { useDrafts } from "@/context/drafts/DraftsContext";
import { useAuth } from "@/context/auth/AuthContext";
import { WS_BASE_URL, fetchDashboardStats, fetchWorkspaces, provisionWorkspace } from "@/lib/api";
import { toast } from "sonner";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
  id,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
  id: string;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="w-full"
  >
    <Card
      id={id}
      className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card text-foreground cursor-pointer"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  {trend}
                </span>
              </div>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-md shadow-black/10",
              color
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const activityTypeConfig = {
  finalized: { color: "text-emerald-600", bg: "bg-emerald-50" },
  updated: { color: "text-blue-600", bg: "bg-blue-50" },
  created: { color: "text-purple-600", bg: "bg-purple-50" },
  exported: { color: "text-orange-600", bg: "bg-orange-50" },
  archived: { color: "text-gray-500", bg: "bg-gray-100" },
};

const STATUS_COLORS = {
  active: "bg-emerald-55 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
  pending: "bg-amber-55 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
  closed: "bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
};

const CHART_COLORS = {
  criminal: "#EF4444",
  civil: "#3B82F6",
  property: "#F97316",
  family: "#EC4899",
};

export default function DashboardPage() {
  const { drafts } = useDrafts();
  const { user } = useAuth();
  const [activities, setActivities] = useState(recentActivity);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const totalDraftsCount = drafts.length;
  const inProgressCount = drafts.filter((d) => d.status === "in-progress").length;
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Initialize and listen to active workspace changes
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
        console.error("Workspace init error on dashboard", err);
      }
    }
    initWorkspace();

    const handler = () => {
      const stored = localStorage.getItem("legaldraft_active_workspace");
      if (stored) {
        setActiveWorkspaceId(stored);
      }
    };
    window.addEventListener("workspace-changed", handler);
    return () => window.removeEventListener("workspace-changed", handler);
  }, []);

  // Fetch stats when active workspace is resolved
  useEffect(() => {
    if (!activeWorkspaceId) return;

    async function loadStats() {
      setIsLoadingStats(true);
      try {
        const data = await fetchDashboardStats(activeWorkspaceId!);
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, [activeWorkspaceId]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWS = () => {
      setWsStatus("connecting");
      try {
        socket = new WebSocket(`${WS_BASE_URL}/ws`);

        socket.onopen = () => {
          setWsStatus("connected");
          console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "activity" && data.data) {
              setActivities((prev) => {
                // Check if activity already exists
                if (prev.some((act) => act.id === data.data.id)) return prev;
                // Prepend new activity and slice to keep recent items
                return [data.data, ...prev].slice(0, 7);
              });
              toast.info(`Activity Update: ${data.data.user} ${data.data.action} ${data.data.resource}`);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        socket.onclose = () => {
          setWsStatus("disconnected");
          console.log("WebSocket connection closed. Reconnecting in 5s...");
          reconnectTimeout = setTimeout(connectWS, 5000);
        };

        socket.onerror = (err) => {
          console.error("WebSocket error:", err);
          socket?.close();
        };
      } catch (err) {
        console.error("Error setting up WebSocket:", err);
        setWsStatus("disconnected");
        reconnectTimeout = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#4C1D95] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-400 rounded-full translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Good morning, {user?.name ? user.name.split(" ")[0] : "User"}! 👋
              </h2>
              <p className="text-purple-200 mt-1 text-sm">
                You have{" "}
                <span className="text-white font-semibold">{stats?.total_drafts || 0} drafts</span> in
                progress and{" "}
                <span className="text-white font-semibold">{stats?.upcoming_hearings || 0} hearings</span>{" "}
                this week.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/drafts?create=true">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    id="dashboard-new-draft-btn"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Draft
                  </Button>
                </motion.div>
              </Link>
              <Link href="/ai-assistant">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    id="dashboard-ai-btn"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    AI Assistant
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              {
                label: "Total Drafts",
                value: stats?.total_drafts || 0,
                icon: "📄",
              },
              {
                label: "Active Cases",
                value: stats?.active_cases || 0,
                icon: "⚖️",
              },
              {
                label: "Active Clients",
                value: stats?.active_clients || 0,
                icon: "👥",
              },
              {
                label: "Upcoming Hearings",
                value: stats?.upcoming_hearings || 0,
                icon: "📊",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
              >
                <div className="text-lg">{m.icon}</div>
                <div className="text-xl font-bold mt-1">{m.value}</div>
                <div className="text-purple-200 text-xs">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-active-cases"
          title="Active Cases"
          value={stats?.active_cases || 0}
          subtitle="Disputes under management"
          icon={Briefcase}
          color="bg-purple-700"
        />
        <StatCard
          id="stat-active-clients"
          title="Active Clients"
          value={stats?.active_clients || 0}
          subtitle="Total active contacts"
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          id="stat-upcoming-hearings"
          title="Upcoming Hearings"
          value={stats?.upcoming_hearings || 0}
          subtitle="Next hearings scheduled"
          icon={Clock}
          color="bg-emerald-600"
        />
        <StatCard
          id="stat-total-drafts"
          title="Total Drafts"
          value={stats?.total_drafts || 0}
          subtitle="Drafts in workspace"
          icon={FileText}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart - Draft Trends */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Draft Activity</CardTitle>
                <CardDescription>
                  Last 30 days — drafts, exports, and templates
                </CardDescription>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div id="draft-activity-chart" className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockAnalytics.slice(-14)}
                  margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorDrafts"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#7C3AED"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#7C3AED"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorExports"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10B981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10B981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    tickFormatter={(v) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="drafts"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="url(#colorDrafts)"
                    name="Drafts"
                  />
                  <Area
                    type="monotone"
                    dataKey="exports"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#colorExports)"
                    name="Exports"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
            <CardDescription>Monthly draft breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="category-chart" className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockDraftTrends.slice(-4)}
                  margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar
                    dataKey="criminal"
                    fill="#EF4444"
                    radius={[3, 3, 0, 0]}
                    name="Criminal"
                  />
                  <Bar
                    dataKey="civil"
                    fill="#3B82F6"
                    radius={[3, 3, 0, 0]}
                    name="Civil"
                  />
                  <Bar
                    dataKey="property"
                    fill="#F97316"
                    radius={[3, 3, 0, 0]}
                    name="Property"
                  />
                  <Bar
                    dataKey="family"
                    fill="#EC4899"
                    radius={[3, 3, 0, 0]}
                    name="Family"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Workflows Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Case Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Widget 1: Upcoming Hearings */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-purple-600" />
                Upcoming Hearings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {stats?.upcoming_hearings_list && stats.upcoming_hearings_list.length > 0 ? (
                stats.upcoming_hearings_list.map((h: any) => (
                  <div key={h.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 font-mono">
                        {new Date(h.hearing_date).toLocaleDateString()}
                      </span>
                      {h.hearing_time && (
                        <span className="text-[9px] text-muted-foreground font-mono">{h.hearing_time}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{h.case_title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{h.court_name || "Court N/A"}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No upcoming hearings
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 2: Pending Tasks */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {stats?.pending_tasks_list && stats.pending_tasks_list.length > 0 ? (
                stats.pending_tasks_list.map((t: any) => (
                  <div key={t.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <p className="text-xs font-semibold text-foreground truncate flex-1">{t.title}</p>
                      <Badge variant="outline" className={cn("text-[8px] px-1 py-0 capitalize", PRIORITY_COLORS[t.priority])}>
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="truncate max-w-[100px]">{t.case_title}</span>
                      {t.due_date && <span className="font-mono">Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No pending tasks
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 3: Recent Activities */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {stats?.recent_activities_list && stats.recent_activities_list.length > 0 ? (
                stats.recent_activities_list.map((act: any) => (
                  <div key={act.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="font-semibold text-foreground truncate">{act.user_name}</span>
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-foreground font-medium leading-normal">{act.details || act.action}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No recent activities
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 4: Recently Updated Cases */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                Recently Updated Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {stats?.recently_updated_cases_list && stats.recently_updated_cases_list.length > 0 ? (
                stats.recently_updated_cases_list.map((c: any) => (
                  <div key={c.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground truncate flex-1">{c.title}</p>
                      <Badge variant="outline" className={cn("text-[8px] px-1 py-0 capitalize", (STATUS_COLORS as any)[c.status] || STATUS_COLORS.active)}>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                      <span className="truncate max-w-[100px]">{c.court}</span>
                      <span>{new Date(c.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No cases updated recently
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                id: "qa-new-draft",
                label: "Create New Draft",
                desc: "Start from scratch or template",
                icon: Plus,
                color: "bg-purple-50 text-purple-700 dark:bg-purple-950/25 dark:text-purple-400",
                href: "/drafts",
              },
              {
                id: "qa-ai-assist",
                label: "AI Draft Assistant",
                desc: "Generate with AI guidance",
                icon: Bot,
                color: "bg-blue-50 text-blue-700 dark:bg-blue-950/25 dark:text-blue-400",
                href: "/ai-assistant",
              },
              {
                id: "qa-upload",
                label: "Analyze Document",
                desc: "Extract case data from FIR/PDF",
                icon: Upload,
                color: "bg-orange-50 text-orange-700 dark:bg-orange-950/25 dark:text-orange-400",
                href: "/case-analyzer",
              },
              {
                id: "qa-research",
                label: "Legal Research",
                desc: "Ask legal questions with AI",
                icon: Search,
                color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400",
                href: "/legal-research",
              },
            ].map((action) => (
              <Link key={action.id} href={action.href}>
                <motion.div
                  id={action.id}
                  whileHover={{ x: 6, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border"
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      action.color
                    )}
                  >
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-50 group-hover:opacity-100" />
                </motion.div>
              </Link>
            ))}
          </CardContent>
        </Card>
        {/* Recent Workspace Updates */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Recent Workspace Updates
                </CardTitle>
                <CardDescription>Live feed of drafts, cases, clients and documents</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    wsStatus === "connected" ? "bg-emerald-400" : wsStatus === "connecting" ? "bg-amber-400" : "bg-red-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-1.5 w-1.5",
                    wsStatus === "connected" ? "bg-emerald-500" : wsStatus === "connecting" ? "bg-amber-500" : "bg-red-500"
                  )}></span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                  {wsStatus === "connected" ? "Syncing Live" : wsStatus === "connecting" ? "Connecting..." : "Offline"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Drafts */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-purple-600" />
                  Recent Drafts
                </h4>
                {stats?.recent_drafts?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recent_drafts.map((draft: any) => (
                      <div key={draft.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate text-foreground">{draft.title}</p>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize px-1 py-0 flex-shrink-0">
                            Draft
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[100px]">{draft.client_name || "General Client"}</span>
                          <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No drafts found.
                  </div>
                )}
              </div>

              {/* Recent Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-purple-600" />
                  Recent Documents
                </h4>
                {stats?.recent_documents?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recent_documents.map((doc: any) => (
                      <div key={doc.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate text-foreground">{doc.name}</p>
                          <Badge variant="outline" className="text-[9px] font-mono uppercase px-1 py-0 flex-shrink-0">
                            {doc.mime_type.split("/")[1] || "File"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[100px]">{doc.case_title || "Unlinked Case"}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No documents uploaded.
                  </div>
                )}
              </div>

              {/* Recent Clients */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                  Recent Clients
                </h4>
                {stats?.recent_clients?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recent_clients.map((client: any) => (
                      <div key={client.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate text-foreground">{client.full_name}</p>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize px-1 py-0 flex-shrink-0">
                            Client
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[120px]">{client.company || client.email || "No company"}</span>
                          <span>{new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No clients found.
                  </div>
                )}
              </div>

              {/* Recent Cases */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                  Recent Cases
                </h4>
                {stats?.recent_cases?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recent_cases.map((cs: any) => (
                      <div key={cs.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex flex-col gap-1 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate text-foreground">{cs.title || cs.case_number}</p>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize px-1 py-0 flex-shrink-0">
                            Case
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[120px]">{cs.client_name || "General Case"}</span>
                          <span>{new Date(cs.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No cases found.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            id: "progress-drafts",
            label: "Draft Completion Rate",
            value: 63,
            color: "text-purple-700 dark:text-purple-400",
            bg: "bg-purple-700 dark:bg-purple-500",
          },
          {
            id: "progress-cases",
            label: "Case Resolution Rate",
            value: 58,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-600 dark:bg-blue-500",
          },
          {
            id: "progress-exports",
            label: "Monthly Export Target",
            value: 78,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-600 dark:bg-emerald-500",
          },
        ].map((item) => (
          <Card key={item.id} className="border-border bg-card text-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <span className={cn("text-sm font-bold", item.color)}>
                  {item.value}%
                </span>
              </div>
              <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn("h-full rounded-full", item.bg)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
