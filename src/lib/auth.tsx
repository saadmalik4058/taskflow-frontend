// lib/auth.tsx — Auth context backed by the same-origin BFF
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import type { UserProfile } from "@/types/api";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionVersion = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = sessionVersion.current;

    authApi
      .me()
      .then(({ user: currentUser }) => {
        if (!cancelled && sessionVersion.current === requestVersion) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (!cancelled && sessionVersion.current === requestVersion) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled && sessionVersion.current === requestVersion) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: currentUser } = await authApi.login({ email, password });
    sessionVersion.current += 1;
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register({ username, email, password });
      const { user: currentUser } = await authApi.login({ email, password });
      sessionVersion.current += 1;
      setUser(currentUser);
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear the client state even if the network request fails.
    }
    sessionVersion.current += 1;
    setUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
