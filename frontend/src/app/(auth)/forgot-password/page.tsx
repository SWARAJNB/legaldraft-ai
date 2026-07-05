"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  requestPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithToken,
} from "@/lib/api";

type Step = "email" | "otp" | "password" | "success";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTP state – 6 individual digit inputs
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password state
  const [resetToken, setResetToken] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Resend countdown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ── Step 1: Request OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    try {
      const result = await requestPasswordOtp(email);
      console.info(
        `[LegalDraft AI] Password reset OTP for ${email}: ${result.otp} (expires in 5 minutes)`
      );
      setStep("otp");
      setResendCooldown(60);
      toast.success("OTP sent!", {
        description: "Check the frontend console for your 6-digit code.",
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);

    try {
      const result = await requestPasswordOtp(email);
      console.info(
        `[LegalDraft AI] New password reset OTP for ${email}: ${result.otp} (expires in 5 minutes)`
      );
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success("New OTP sent!", {
        description: "Check the frontend console for the fresh 6-digit code.",
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP input handlers ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otpDigits];
    updated[index] = value.slice(-1); // take only last char
    setOtpDigits(updated);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);
    // Focus the next empty or last
    const nextEmpty = updated.findIndex((d) => !d);
    otpRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  const otpComplete = otpDigits.every((d) => d !== "");

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpComplete) return;
    setIsLoading(true);
    const otp = otpDigits.join("");

    try {
      const result = await verifyPasswordOtp(email, otp);
      setResetToken(result.reset_token);
      setStep("password");
      toast.success("OTP verified!", {
        description: "Now set your new password.",
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Invalid OTP"));
      // Shake animation via brief re-render
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password strength ────────────────────────────────────────────────────
  const passwordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  // ── Step 3: Set new password ─────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);

    try {
      await resetPasswordWithToken(resetToken, newPassword);
      setStep("success");
      toast.success("Password reset successfully!", {
        description: "You can now log in with your new password.",
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Password reset failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step indicator ───────────────────────────────────────────────────────
  const steps = [
    { id: "email", label: "Email", num: 1 },
    { id: "otp", label: "Verify", num: 2 },
    { id: "password", label: "Reset", num: 3 },
  ];

  const currentStepIndex = step === "success" ? 3 : steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-sm mx-auto">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {step === "email" && "Reset password"}
          {step === "otp" && "Verify your identity"}
          {step === "password" && "Set new password"}
          {step === "success" && "All done!"}
        </h1>
        <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
          {step === "email" && "Enter your email and we'll send a 6-digit OTP"}
          {step === "otp" && `Enter the 6-digit code sent to ${email}`}
          {step === "password" && "Choose a strong password for your account"}
          {step === "success" && "Your password has been reset successfully"}
        </p>
      </div>

      {/* Step progress indicator */}
      {step !== "success" && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < currentStepIndex
                    ? "bg-emerald-500 text-white"
                    : i === currentStepIndex
                    ? "bg-purple-600 text-white ring-2 ring-purple-400/50 ring-offset-2 ring-offset-[#0F172A]"
                    : "bg-white/10 text-slate-500"
                )}
              >
                {i < currentStepIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 rounded-full transition-all duration-500",
                    i < currentStepIndex ? "bg-emerald-500" : "bg-white/10"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* ── STEP 1: EMAIL ── */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} id="forgot-password-form" className="space-y-4">
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
                  autoFocus
                  required
                />
              </div>
            </div>
            <Button
              id="send-otp-btn"
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-purple-600 hover:bg-purple-700 h-10 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send OTP
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        )}

        {/* ── STEP 2: OTP VERIFICATION ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} id="verify-otp-form" className="space-y-5">
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm text-center block">
                Enter 6-digit OTP
              </Label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    id={`otp-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className={cn(
                      "w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-white/5 text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
                      "transition-all duration-200",
                      digit
                        ? "border-purple-500/50"
                        : "border-white/10 hover:border-white/20"
                    )}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-slate-500">
                Check your <span className="text-purple-400 font-medium">frontend console</span> for the OTP
              </p>
            </div>

            <Button
              id="verify-otp-btn"
              type="submit"
              disabled={isLoading || !otpComplete}
              className="w-full bg-purple-600 hover:bg-purple-700 h-10 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              Verify OTP
            </Button>

            {/* Resend row */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-slate-500">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className={cn(
                  "text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer",
                  resendCooldown > 0
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-purple-400 hover:text-purple-300"
                )}
              >
                <RefreshCw className="h-3 w-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: NEW PASSWORD ── */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} id="reset-password-form" className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColors[strength] : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Strength:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        strength <= 1
                          ? "text-red-400"
                          : strength <= 2
                          ? "text-amber-400"
                          : strength <= 3
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      )}
                    >
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10",
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500/50"
                      : confirmPassword && newPassword === confirmPassword
                      ? "border-emerald-500/50"
                      : ""
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </p>
              )}
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              id="reset-password-submit"
              type="submit"
              disabled={
                isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword
              }
              className="w-full bg-purple-600 hover:bg-purple-700 h-10 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Reset Password
            </Button>
          </form>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div className="text-center space-y-5">
            <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-1">
                Your password has been updated for
              </p>
              <p className="text-sm text-white font-semibold">{email}</p>
            </div>
            <Button
              id="go-to-login-btn"
              onClick={() => router.push("/login")}
              className="w-full bg-purple-600 hover:bg-purple-700 h-10 cursor-pointer"
            >
              Go to Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Back to login */}
        {step !== "success" && (
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
        )}
      </div>
    </div>
  );
}
