// ── Barrel re-export ────────────────────────────────────────────────────────
// Re-exports everything so existing `@/lib/api` imports continue to work.

export {
  API_BASE_URL,
  WS_BASE_URL,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  authFetch,
} from "./client";

export {
  registerUser,
  loginUser,
  fetchCurrentUser,
  requestPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithToken,
  type AuthUser,
  type LoginResponse,
} from "./auth";

export {
  chatWithAI,
  generateAIDraft,
  downloadGeneratedFile,
  runAIRiskCheck,
  improveTextWithAI,
  type ChatMessage,
  type ChatAIResponse,
  type RiskItem,
  type GeneratedDraftFile,
  type GeneratedDraftResponse,
} from "./ai";
