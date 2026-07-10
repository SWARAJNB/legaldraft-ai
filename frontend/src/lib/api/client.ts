// ── API Base URLs ────────────────────────────────────────────────────────────

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined"
  ? (window.location.hostname === "localhost" ? "http://localhost:8000" : `${window.location.protocol}//${window.location.hostname}:8000`)
  : "http://localhost:8000");

export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || (typeof window !== "undefined"
  ? (window.location.hostname === "localhost" ? "ws://localhost:8000" : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:8000`)
  : "ws://localhost:8000");


// ── Token management ────────────────────────────────────────────────────────

const TOKEN_KEY = "legaldraft_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}


// ── Authenticated fetch helper ──────────────────────────────────────────────

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-ID": "default-tenant",
    "X-User-Email": "anonymous",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // If we receive a 401, the token is invalid/expired — clear it
  if (response.status === 401) {
    removeStoredToken();
    localStorage.removeItem("legaldraft_session");
  }

  return response;
}

export const PYTHON_API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || (typeof window !== "undefined"
  ? (window.location.hostname === "localhost" ? "http://localhost:8082/api/v1" : `${window.location.protocol}//${window.location.hostname}:8082/api/v1`)
  : "http://localhost:8082/api/v1");

export async function pythonFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const separator = path.startsWith("/") ? "" : "/";
  const url = `${PYTHON_API_BASE_URL}${separator}${path}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    removeStoredToken();
    localStorage.removeItem("legaldraft_session");
  }

  return response;
}
