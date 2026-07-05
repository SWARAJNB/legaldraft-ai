"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The password reset flow is now handled entirely within /forgot-password
 * (email → OTP → new password — all in one page).
 * This page redirects to that flow for any direct visits.
 */
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/forgot-password");
  }, [router]);

  return (
    <div className="flex items-center justify-center text-slate-400 text-sm">
      Redirecting to password reset...
    </div>
  );
}
