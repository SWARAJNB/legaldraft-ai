"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scale, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {sent ? "Check your email" : "Reset password"}
        </h1>
        <p className="text-slate-400 text-sm mt-1 text-center">
          {sent
            ? `We sent a reset link to ${email}`
            : "Enter your email and we'll send a reset link"}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-300">
              Please check your email inbox for the password reset link. The
              link will expire in 30 minutes.
            </p>
            <Button
              id="resend-email-btn"
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
              onClick={() => {
                toast.success("Reset link resent!");
              }}
            >
              Resend Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="forgot-password-form" className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-slate-300 text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pl-10"
                />
              </div>
            </div>
            <Button
              id="send-reset-btn"
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-purple-600 hover:bg-purple-700 h-10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send Reset Link
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        )}

        <div className="flex items-center justify-center mt-5">
          <Link
            href="/login"
            id="back-to-login"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
