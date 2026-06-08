"use client";

import React from "react";
import Link from "next/link";
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
  <Card
    id={id}
    className="relative overflow-hidden hover:shadow-md transition-shadow duration-200"
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
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            color
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const activityTypeConfig = {
  finalized: { color: "text-emerald-600", bg: "bg-emerald-50" },
  updated: { color: "text-blue-600", bg: "bg-blue-50" },
  created: { color: "text-purple-600", bg: "bg-purple-50" },
  exported: { color: "text-orange-600", bg: "bg-orange-50" },
  archived: { color: "text-gray-500", bg: "bg-gray-100" },
};

const CHART_COLORS = {
  criminal: "#EF4444",
  civil: "#3B82F6",
  property: "#F97316",
  family: "#EC4899",
};

export default function DashboardPage() {
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
                Good morning, Rajesh! 👋
              </h2>
              <p className="text-purple-200 mt-1 text-sm">
                You have{" "}
                <span className="text-white font-semibold">23 drafts</span> in
                progress and{" "}
                <span className="text-white font-semibold">3 hearings</span>{" "}
                this week.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                id="dashboard-new-draft-btn"
                size="sm"
                className="bg-white/20 hover:bg-white/30 border border-white/20 text-white backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Draft
              </Button>
              <Button
                id="dashboard-ai-btn"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Bot className="h-4 w-4 mr-1" />
                AI Assistant
              </Button>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              {
                label: "Total Drafts",
                value: dashboardStats.totalDrafts,
                icon: "📄",
              },
              {
                label: "Active Cases",
                value: dashboardStats.activeCases,
                icon: "⚖️",
              },
              {
                label: "Team Members",
                value: dashboardStats.totalUsers,
                icon: "👥",
              },
              {
                label: "This Month",
                value: `${dashboardStats.monthlyExports} exports`,
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
          id="stat-total-drafts"
          title="Total Drafts"
          value={dashboardStats.totalDrafts}
          subtitle="All time"
          icon={FileText}
          trend="+12% from last month"
          color="bg-purple-700"
        />
        <StatCard
          id="stat-in-progress"
          title="In Progress"
          value={dashboardStats.inProgress}
          subtitle="Active drafts"
          icon={Clock}
          color="bg-blue-600"
        />
        <StatCard
          id="stat-finalized"
          title="Finalized"
          value={dashboardStats.finalized}
          subtitle="Ready to export"
          icon={CheckCircle2}
          trend="+5 this week"
          color="bg-emerald-600"
        />
        <StatCard
          id="stat-exports"
          title="Monthly Exports"
          value={dashboardStats.monthlyExports}
          subtitle="June 2024"
          icon={Download}
          trend="+8% from May"
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

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card>
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
                color: "bg-purple-50 text-purple-700",
                href: "/drafts",
              },
              {
                id: "qa-ai-assist",
                label: "AI Draft Assistant",
                desc: "Generate with AI guidance",
                icon: Bot,
                color: "bg-blue-50 text-blue-700",
                href: "/ai-assistant",
              },
              {
                id: "qa-upload",
                label: "Analyze Document",
                desc: "Extract case data from FIR/PDF",
                icon: Upload,
                color: "bg-orange-50 text-orange-700",
                href: "/case-analyzer",
              },
              {
                id: "qa-research",
                label: "Legal Research",
                desc: "Ask legal questions with AI",
                icon: Search,
                color: "bg-emerald-50 text-emerald-700",
                href: "/legal-research",
              },
            ].map((action) => (
              <Link key={action.id} href={action.href}>
                <div
                  id={action.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
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
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Link href="/audit-logs">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  View all
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" id="recent-activity-list">
              {recentActivity.map((activity) => {
                const config =
                  activityTypeConfig[
                    activity.type as keyof typeof activityTypeConfig
                  ] || activityTypeConfig.updated;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span
                          className={cn("font-medium text-xs", config.color)}
                        >
                          {activity.action}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {activity.resource}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                        config.bg,
                        config.color
                      )}
                    >
                      {activity.type}
                    </span>
                  </div>
                );
              })}
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
            color: "text-purple-700",
          },
          {
            id: "progress-cases",
            label: "Case Resolution Rate",
            value: 58,
            color: "text-blue-600",
          },
          {
            id: "progress-exports",
            label: "Monthly Export Target",
            value: 78,
            color: "text-emerald-600",
          },
        ].map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <span className={cn("text-sm font-bold", item.color)}>
                  {item.value}%
                </span>
              </div>
              <Progress value={item.value} className="h-1.5" id={item.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
