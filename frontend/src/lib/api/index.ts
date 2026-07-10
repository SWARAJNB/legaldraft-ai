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
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  renameConversation,
  deleteConversation,
  exportResponseDirect,
  type DBConversation,
  type ChatMessage,
  type ChatAIResponse,
  type RiskItem,
  type GeneratedDraftFile,
  type GeneratedDraftResponse,
} from "./ai";

export {
  fetchWorkspaces,
  fetchWorkspaceDetails,
  provisionWorkspace,
  updateWorkspace,
  inviteMember,
  type Workspace,
} from "./workspace";

export {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  type ClientData,
} from "./clients";

export {
  fetchCases,
  createCase,
  updateCase,
  deleteCase,
  addTimelineEvent,
  linkDraftToCase,
  linkDocumentToCase,
  fetchHearings,
  createHearing,
  updateHearing,
  deleteHearing,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./cases";

export {
  fetchDashboardStats,
  type RecentDraft,
  type RecentDocument,
  type RecentClient,
  type RecentCase,
  type DashboardStats,
} from "./dashboard";

export {
  uploadFile,
  fetchFiles,
  deleteFile,
  fetchFileIntelligence,
} from "./files";

export {
  fetchKnowledgeBase,
  searchKnowledgeBase,
  answerFromKnowledgeBase,
  type KnowledgeBaseDocument,
  type KnowledgeBaseSummary,
  type RetrievalResult,
} from "./knowledge-base";

export {
  fetchTemplates,
  fetchTemplateById,
  uploadTemplate,
  savePlaceholders,
  fetchTemplateVersions,
  restoreTemplateVersion,
  generateDraftFromTemplate,
  askInterviewQuestion,
} from "./templates";
