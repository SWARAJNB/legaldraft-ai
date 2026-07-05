"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginUser,
  fetchCurrentUser,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  type AuthUser,
} from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map the backend AuthUser shape to the frontend User shape. */
function toUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.full_name,
    email: authUser.email,
    role: authUser.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate existing token on mount
  useEffect(() => {
    const validateSession = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const authUser = await fetchCurrentUser();
        const mappedUser = toUser(authUser);
        setUser(mappedUser);
        localStorage.setItem("legaldraft_session", JSON.stringify(mappedUser));
      } catch {
        // Token is invalid or expired — clear everything
        removeStoredToken();
        localStorage.removeItem("legaldraft_session");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);

      // Store the JWT token
      setStoredToken(response.access_token);

      // Map and store user
      const mappedUser = toUser(response.user);
      localStorage.setItem("legaldraft_session", JSON.stringify(mappedUser));
      setUser(mappedUser);

      toast.success("Logged in successfully!", {
        description: `Welcome back, ${mappedUser.name}.`,
      });
      router.replace("/dashboard");
    } catch (error) {
      // Re-throw so the login page can display the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    removeStoredToken();
    localStorage.removeItem("legaldraft_session");
    setUser(null);
    toast.success("Logged out successfully", {
      description: "You have been signed out.",
    });
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
