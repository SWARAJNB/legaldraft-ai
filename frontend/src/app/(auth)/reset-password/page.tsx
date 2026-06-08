"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });

  const passwordStrength = () => {
    if (!form.newPassword) return 0;
    let score = 0;
    if (form.newPassword.length >= 8) score++;
    if (/[A-Z]/.test(form.newPassword)) score++;
    if (/[0-9]/.test(form.newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(form.newPassword)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    toast.success("Password reset successfully!", {
      description: "You can now log in with your new password.",
    });
    router.push("/login");
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="text-slate-400 text-sm mt-1">
          Choose a strong password for your account
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} id="reset-password-form" className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        i <= strength ? strengthColors[strength] : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Strength:{" "}
                  <span className={cn(
                    "font-medium",
                    strength <= 1 ? "text-red-400" : strength <= 2 ? "text-amber-400" : strength <= 3 ? "text-yellow-400" : "text-emerald-400"
                  )}>
                    {strengthLabels[strength]}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10",
                  form.confirmPassword && form.newPassword !== form.confirmPassword
                    ? "border-red-500/50"
                    : form.confirmPassword && form.newPassword === form.confirmPassword
                    ? "border-emerald-500/50"
                    : ""
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirmPassword && form.newPassword === form.confirmPassword && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          <Button
            id="reset-password-submit"
            type="submit"
            disabled={isLoading || !form.newPassword || !form.confirmPassword}
            className="w-full bg-purple-600 hover:bg-purple-700 h-10 mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          <Link href="/login" id="back-to-login" className="text-purple-400 hover:text-purple-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
