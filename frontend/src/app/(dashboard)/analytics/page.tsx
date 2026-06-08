"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Download, FileText, Users, BarChart3, Calendar } from "lucide-react";
import { mockAnalytics, mockDraftTrends, mockDrafts, mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const PIE_DATA = [
  { name: "Criminal", value: 35, color: "#EF4444" },
  { name: "Civil", value: 28, color: "#3B82F6" },
  { name: "Property", value: 22, color: "#F97316" },
  { name: "Family", value: 15, color: "#EC4899" },
];

const USER_ACTIVITY = [
  { name: "Rajesh Sharma", drafts: 45, exports: 32, sessions: 120 },
  { name: "Priya Mehta", drafts: 38, exports: 28, sessions: 98 },
  { name: "Arjun Kapoor", drafts: 29, exports: 19, sessions: 75 },
  { name: "Vikram Nair", drafts: 18, exports: 12, sessions: 45 },
  { name: "Sneha Patel", drafts: 12, exports: 8, sessions: 30 },
];

const TEMPLATE_USAGE = [
  { name: "Bail Application", uses: 847 },
  { name: "Civil Suit Plaint", uses: 612 },
  { name: "Lease Agreement", uses: 534 },
  { name: "Sale Agreement", uses: 389 },
  { name: "Divorce Petition", uses: 267 },
  { name: "Consumer Complaint", uses: 198 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Legal Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights into your firm's performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32 h-8" id="analytics-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1" id="export-analytics-btn">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Drafts",
            value: "142",
            change: "+12.4%",
            trend: "up",
            icon: FileText,
            color: "text-purple-700 bg-purple-50",
          },
          {
            label: "Total Exports",
            value: "67",
            change: "+8.2%",
            trend: "up",
            icon: Download,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Active Users",
            value: "4",
            change: "0%",
            trend: "neutral",
            icon: Users,
            color: "text-blue-700 bg-blue-50",
          },
          {
            label: "Template Uses",
            value: "1,847",
            change: "+23.1%",
            trend: "up",
            icon: BarChart3,
            color: "text-orange-700 bg-orange-50",
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    kpi.color
                  )}
                >
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Draft Trends Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft Trends (30 Days)</CardTitle>
            <CardDescription>Daily draft activity, exports, and template usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="draft-trends-chart" className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockAnalytics.slice(-14)}
                  margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gDrafts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
                      fontSize: "11px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="drafts"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="url(#gDrafts)"
                    name="Drafts"
                  />
                  <Area
                    type="monotone"
                    dataKey="exports"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#gExports)"
                    name="Exports"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft Categories</CardTitle>
            <CardDescription>Distribution by legal category</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="category-pie-chart" className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {PIE_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Template Usage Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Template Usage</CardTitle>
            <CardDescription>Most used templates this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="template-usage-chart" className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TEMPLATE_USAGE}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="uses" fill="#7C3AED" radius={[0, 3, 3, 0]} name="Uses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User Activity</CardTitle>
            <CardDescription>Individual performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" id="user-activity-list">
              {USER_ACTIVITY.map((user, i) => (
                <div key={user.name} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                        {user.drafts} drafts
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                        style={{
                          width: `${(user.drafts / USER_ACTIVITY[0].drafts) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:block">
                    {user.exports} exports
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Category Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly Draft Volume by Category</CardTitle>
          <CardDescription>6-month breakdown across all legal categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div id="monthly-category-chart" className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockDraftTrends}
                margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="criminal" fill="#EF4444" radius={[3, 3, 0, 0]} name="Criminal" stackId="a" />
                <Bar dataKey="civil" fill="#3B82F6" radius={[0, 0, 0, 0]} name="Civil" stackId="a" />
                <Bar dataKey="property" fill="#F97316" radius={[0, 0, 0, 0]} name="Property" stackId="a" />
                <Bar dataKey="family" fill="#EC4899" radius={[3, 3, 0, 0]} name="Family" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
