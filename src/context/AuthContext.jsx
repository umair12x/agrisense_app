import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import storageService from "../services/storageService";

const LOCAL_SESSIONS_KEY = "assistant_local_sessions";
const LOCAL_MESSAGES_KEY = "assistant_current_messages";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrate = useCallback(async () => {
    try {
      const savedToken = await storageService.getItem("token");
      const savedUser = await storageService.getItem("user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await storageService.setItem("token", userToken);
    await storageService.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    await storageService.removeItem("token");
    await storageService.removeItem("user");
    await storageService.removeItem(LOCAL_MESSAGES_KEY);
    await storageService.removeItem(LOCAL_SESSIONS_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isHydrated, login, logout, hydrate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
