"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import { Loader2 } from "lucide-react";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

    if (!user && !isAuthPath) {
      // Unauthenticated trying to access dashboard/protected pages
      router.replace("/login");
    } else if (user && isAuthPath) {
      // Authenticated trying to access login/auth pages
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  // Show a full-screen loading spinner while determining auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-slate-400 text-xs font-medium">Verifying session...</p>
      </div>
    );
  }

  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Render a loader instead of flashing page components during redirection
  if (!user && !isAuthPath) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (user && isAuthPath) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return <>{children}</>;
}
