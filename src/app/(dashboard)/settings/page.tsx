"use client";

import React, { useState } from "react";
import {
  Building,
  Bot,
  Shield,
  Bell,
  Save,
  Key,
  Globe,
  Mail,
  Phone,
  Zap,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function SettingRow({
  label,
  description,
  children,
  id,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 border-b border-border/50 last:border-0" id={id}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    draftFinalized: true,
    exportCompleted: true,
    newComment: false,
    templateShared: true,
    hearingReminder: true,
    weeklyReport: false,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved!`);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your firm settings, AI configuration, and preferences
        </p>
      </div>

      <Tabs defaultValue="firm" className="space-y-5">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="firm" id="tab-firm">
            <Building className="h-3.5 w-3.5 mr-1.5" />
            Firm
          </TabsTrigger>
          <TabsTrigger value="ai" id="tab-ai">
            <Bot className="h-3.5 w-3.5 mr-1.5" />
            AI Provider
          </TabsTrigger>
          <TabsTrigger value="security" id="tab-security">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" id="tab-notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Firm Settings */}
        <TabsContent value="firm">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                Firm Settings
              </CardTitle>
              <CardDescription>
                Configure your law firm's profile and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingRow
                id="setting-firm-name"
                label="Firm Name"
                description="Official name as it will appear on documents"
              >
                <Input
                  defaultValue="Lex & Associates"
                  className="w-64"
                  id="firm-name-input"
                />
              </SettingRow>
              <SettingRow
                id="setting-firm-email"
                label="Official Email"
                description="Primary contact email for the firm"
              >
                <Input
                  defaultValue="info@lexassociates.in"
                  type="email"
                  className="w-64"
                  id="firm-email-input"
                />
              </SettingRow>
              <SettingRow
                id="setting-firm-phone"
                label="Phone Number"
              >
                <Input
                  defaultValue="+91 22 4567 8901"
                  className="w-64"
                  id="firm-phone-input"
                />
              </SettingRow>
              <SettingRow
                id="setting-firm-bar"
                label="Bar Council Registration"
                description="Your firm's Bar Council registration number"
              >
                <Input
                  defaultValue="MH/FIRM/2018/001234"
                  className="w-64"
                  id="firm-bar-input"
                />
              </SettingRow>
              <SettingRow
                id="setting-firm-city"
                label="Primary Jurisdiction"
                description="Default city for document headers"
              >
                <Select defaultValue="mumbai">
                  <SelectTrigger className="w-40" id="firm-city-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune"].map(
                      (city) => (
                        <SelectItem key={city} value={city.toLowerCase()}>
                          {city}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                id="setting-autosave"
                label="Auto-save Documents"
                description="Automatically save drafts every 30 seconds"
              >
                <Switch defaultChecked id="autosave-toggle" />
              </SettingRow>
            </CardContent>
            <div className="px-6 pb-5">
              <Button
                id="save-firm-settings"
                onClick={() => handleSave("Firm")}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Firm Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI Provider Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-600" />
                AI Provider Settings
              </CardTitle>
              <CardDescription>
                Configure your AI provider for draft generation and research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingRow
                id="setting-ai-provider"
                label="AI Provider"
                description="Select the AI model to power your legal drafting"
              >
                <Select defaultValue="gemini">
                  <SelectTrigger className="w-52" id="ai-provider-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini Pro</SelectItem>
                    <SelectItem value="gpt4">OpenAI GPT-4</SelectItem>
                    <SelectItem value="claude">Anthropic Claude</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                id="setting-api-key"
                label="API Key"
                description="Your AI provider's API key (encrypted at rest)"
              >
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      defaultValue="gm-api-xxxx-xxxx-xxxx-xxxx"
                      className="w-52 pr-8"
                      id="api-key-input"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </SettingRow>
              <SettingRow
                id="setting-ai-language"
                label="Preferred Language"
                description="Primary language for AI-generated content"
              >
                <Select defaultValue="en-legal">
                  <SelectTrigger className="w-40" id="ai-language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-legal">English (Legal)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                id="setting-ai-risk"
                label="AI Risk Checker"
                description="Automatically check drafts for missing information before export"
              >
                <Switch defaultChecked id="ai-risk-toggle" />
              </SettingRow>
              <SettingRow
                id="setting-ai-citations"
                label="Auto-cite Case Law"
                description="Automatically suggest relevant judgments in research"
              >
                <Switch defaultChecked id="auto-cite-toggle" />
              </SettingRow>
            </CardContent>
            <div className="px-6 pb-5">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  id="test-api-btn"
                  onClick={() => {
                    toast.info("Testing API connection...");
                    setTimeout(
                      () => toast.success("API connection successful! ✓"),
                      1500
                    );
                  }}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Test Connection
                </Button>
                <Button
                  id="save-ai-settings"
                  onClick={() => handleSave("AI Provider")}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save AI Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingRow
                id="setting-2fa"
                label="Two-Factor Authentication"
                description="Require 2FA for all team members"
              >
                <Switch id="2fa-toggle" />
              </SettingRow>
              <SettingRow
                id="setting-session"
                label="Session Timeout"
                description="Automatically log out after inactivity"
              >
                <Select defaultValue="8h">
                  <SelectTrigger className="w-32" id="session-timeout-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                id="setting-ip-whitelist"
                label="IP Whitelist"
                description="Restrict access to specific IP addresses"
              >
                <Switch id="ip-whitelist-toggle" />
              </SettingRow>
              <SettingRow
                id="setting-audit-log"
                label="Enhanced Audit Logging"
                description="Log all user actions including document views"
              >
                <Switch defaultChecked id="audit-log-toggle" />
              </SettingRow>
              <SettingRow
                id="setting-password-policy"
                label="Password Policy"
                description="Minimum password strength requirements"
              >
                <Select defaultValue="strong">
                  <SelectTrigger className="w-32" id="password-policy-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
            <div className="px-6 pb-5">
              <Button
                id="save-security-settings"
                onClick={() => handleSave("Security")}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Security Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose what notifications you receive and how
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                {
                  id: "draftFinalized",
                  label: "Draft Finalized",
                  desc: "When a draft is marked as finalized",
                },
                {
                  id: "exportCompleted",
                  label: "Export Completed",
                  desc: "When a PDF export is ready to download",
                },
                {
                  id: "newComment",
                  label: "New Comment",
                  desc: "When someone comments on your draft",
                },
                {
                  id: "templateShared",
                  label: "Template Shared",
                  desc: "When a template is shared with your account",
                },
                {
                  id: "hearingReminder",
                  label: "Hearing Reminders",
                  desc: "24 hours before a scheduled court hearing",
                },
                {
                  id: "weeklyReport",
                  label: "Weekly Report",
                  desc: "Summary of team activity every Monday morning",
                },
              ].map((notif) => (
                <SettingRow
                  key={notif.id}
                  id={`notif-setting-${notif.id}`}
                  label={notif.label}
                  description={notif.desc}
                >
                  <Switch
                    id={`notif-toggle-${notif.id}`}
                    checked={
                      notifications[notif.id as keyof typeof notifications]
                    }
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [notif.id]: checked,
                      }))
                    }
                  />
                </SettingRow>
              ))}
            </CardContent>
            <div className="px-6 pb-5">
              <Button
                id="save-notification-settings"
                onClick={() => handleSave("Notification")}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Notification Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
