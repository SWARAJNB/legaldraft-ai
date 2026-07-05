// Auth-related types

export type UserRole = "admin" | "lawyer" | "legal-assistant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  firm: string;
  createdAt: string;
  lastActive: string;
}
