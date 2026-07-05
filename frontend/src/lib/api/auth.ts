import { API_BASE_URL, authFetch } from "./client";


// ── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}


// ── Auth API functions ──────────────────────────────────────────────────────

export async function registerUser(data: {
  full_name: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || "Registration failed");
  }
  return result;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || "Login failed");
  }
  return result;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await authFetch(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error("Session expired or invalid");
  }

  return response.json();
}


// ── Auth: Forgot Password Flow ─────────────────────────────────────────────

export async function requestPasswordOtp(email: string): Promise<{ message: string; otp: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to send OTP");
  }
  return { message: data.message, otp: data.otp };
}

export async function verifyPasswordOtp(email: string, otp: string): Promise<{ message: string; reset_token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "OTP verification failed");
  }
  return data;
}

export async function resetPasswordWithToken(reset_token: string, new_password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token, new_password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Password reset failed");
  }
  return data.message;
}
