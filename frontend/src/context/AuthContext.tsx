"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedSession = localStorage.getItem("legaldraft_session");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("legaldraft_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: "usr_1",
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email: email,
      role: "admin",
    };
    
    localStorage.setItem("legaldraft_session", JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    toast.success("Logged in successfully!", { description: "Welcome back to LegalDraft AI." });
    router.replace("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("legaldraft_session");
    setUser(null);
    toast.success("Logged out successfully", { description: "You have been signed out." });
    router.replace("/login");
  };

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
