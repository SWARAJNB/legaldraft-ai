"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      await login(form.email);
    } catch (err) {
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 text-sm mt-1">
          Sign in to LegalDraft AI
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4" id="login-form">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-slate-300 text-sm">
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="rajesh@lexfirm.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={cn(
                "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500",
                errors.email && "border-red-500/50"
              )}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-slate-300 text-sm">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500 pr-10",
                  errors.password && "border-red-500/50"
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                id="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="remember-me-toggle"
              onClick={() => setRememberMe(!rememberMe)}
              className={cn(
                "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                rememberMe
                  ? "border-purple-500 bg-purple-500"
                  : "border-white/20 bg-transparent"
              )}
            >
              {rememberMe && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <label
              onClick={() => setRememberMe(!rememberMe)}
              className="text-sm text-slate-400 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <Button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-2 text-xs text-slate-500">
                or continue with
              </span>
            </div>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "login-google",
                label: "Google",
                icon: (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ),
              },
              {
                id: "login-microsoft",
                label: "Microsoft",
                icon: (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M0 0h11v11H0z" />
                    <path fill="#00a4ef" d="M13 0h11v11H13z" />
                    <path fill="#7fba00" d="M0 13h11v11H0z" />
                    <path fill="#ffb900" d="M13 13h11v11H13z" />
                  </svg>
                ),
              },
            ].map((provider) => (
              <button
                key={provider.id}
                type="button"
                id={provider.id}
                onClick={() =>
                  toast.info(`${provider.label} login — coming soon`)
                }
                className="flex items-center justify-center gap-2 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
              >
                {provider.icon}
                {provider.label}
              </button>
            ))}
          </div>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-slate-400 mt-5">
          Don't have an account?{" "}
          <Link
            href="/register"
            id="go-to-register"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs">
        <Shield className="h-3.5 w-3.5" />
        <span>256-bit SSL encrypted · GDPR compliant</span>
      </div>
    </div>
  );
}
