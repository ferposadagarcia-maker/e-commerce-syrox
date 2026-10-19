"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearSession,
  getServerSnapshot,
  getSessionSnapshot,
  subscribeToSession,
  writeSession,
  type DemoSession,
} from "@/lib/auth";

interface AuthContextValue {
  session: DemoSession | null;
  ready: boolean;
  login: (email: string) => DemoSession;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSnapshot,
  );

  const login = useCallback((email: string) => writeSession(email), []);
  const logout = useCallback(() => clearSession(), []);

  const value = useMemo(
    () => ({ session, ready: true, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
