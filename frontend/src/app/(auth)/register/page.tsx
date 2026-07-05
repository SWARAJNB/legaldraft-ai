"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Building,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { registerUser } from "@/lib/api";

const STEPS = [
  { id: 1, label: "Firm Info", icon: Building },
  { id: 2, label: "Your Details", icon: User },
  { id: 3, label: "Set Password", icon: Lock },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firmName: "",
    firmCity: "",
    firmSize: "",
    name: "",
    email: "",
    role: "lawyer",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = () => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-500",
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({
        full_name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success("Account created successfully!", {
        description: "Welcome to LegalDraft AI. Please log in.",
      });
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-slate-400 text-sm mt-1">
          Start your 14-day free trial
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                step >= s.id ? "text-white" : "text-slate-500"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  step > s.id
                    ? "bg-purple-600 border-purple-600"
                    : step === s.id
                    ? "border-purple-500 text-purple-400"
                    : "border-slate-600 text-slate-500"
                )}
              >
                {step > s.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  s.id
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-3 transition-all",
                  step > s.id ? "bg-purple-600" : "bg-slate-700"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} id="register-form">
          {/* Step 1: Firm Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-semibold text-white mb-4">
                  Tell us about your firm
                </h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Firm / Practice Name</Label>
                <Input
                  id="firm-name"
                  placeholder="Lex & Associates"
                  value={form.firmName}
                  onChange={(e) =>
                    setForm({ ...form, firmName: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">City / State</Label>
                <Select
                  value={form.firmCity}
                  onValueChange={(v) => setForm({ ...form, firmCity: v })}
                >
                  <SelectTrigger
                    className="bg-white/5 border-white/10 text-white"
                    id="firm-city"
                  >
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Mumbai",
                      "Delhi",
                      "Bangalore",
                      "Chennai",
                      "Kolkata",
                      "Pune",
                      "Hyderabad",
                      "Ahmedabad",
                    ].map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Firm Size</Label>
                <Select
                  value={form.firmSize}
                  onValueChange={(v) => setForm({ ...form, firmSize: v })}
                >
                  <SelectTrigger
                    className="bg-white/5 border-white/10 text-white"
                    id="firm-size"
                  >
                    <SelectValue placeholder="Number of lawyers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Practitioner</SelectItem>
                    <SelectItem value="2-5">2–5 Lawyers</SelectItem>
                    <SelectItem value="6-15">6–15 Lawyers</SelectItem>
                    <SelectItem value="16-50">16–50 Lawyers</SelectItem>
                    <SelectItem value="50+">50+ Lawyers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                id="step1-next"
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 h-10 mt-2"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-semibold text-white mb-4">
                Your personal details
              </h2>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Full Name</Label>
                <Input
                  id="user-name"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Work Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="abc@Gmail.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Your Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger
                    className="bg-white/5 border-white/10 text-white"
                    id="user-role"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin / Managing Partner</SelectItem>
                    <SelectItem value="lawyer">Lawyer / Advocate</SelectItem>
                    <SelectItem value="legal-assistant">Legal Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  id="step2-back"
                  onClick={() => setStep(1)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="button"
                  id="step2-next"
                  onClick={handleNext}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-semibold text-white mb-4">
                Secure your account
              </h2>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Create Password</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Strength indicator */}
                {form.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all",
                            i <= strength
                              ? strengthColors[strength]
                              : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Password strength:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          strength <= 1
                            ? "text-red-400"
                            : strength === 2
                            ? "text-amber-400"
                            : strength === 3
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
                <Label className="text-slate-300 text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-slate-500",
                    form.confirmPassword &&
                      form.password !== form.confirmPassword
                      ? "border-red-500/50"
                      : form.confirmPassword &&
                        form.password === form.confirmPassword
                      ? "border-emerald-500/50"
                      : ""
                  )}
                />
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-500">
                By creating an account, you agree to our{" "}
                <span className="text-purple-400 cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-purple-400 cursor-pointer hover:underline">
                  Privacy Policy
                </span>
                .
              </p>

              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  id="step3-back"
                  onClick={() => setStep(2)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="submit"
                  id="register-submit"
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            id="go-to-login"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
