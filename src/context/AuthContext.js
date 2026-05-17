import React, { createContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildApiError, parseApiResponse, resolveApiBaseUrl } from "../services/api";

export const AuthContext = createContext();

const API_BASE = resolveApiBaseUrl();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama açılışında token'ı kontrol et
  const bootstrapAsync = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem("authToken");
      const savedUser = await AsyncStorage.getItem("authUser");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Uygulama başlangıcında çalıştır
  React.useEffect(() => {
    bootstrapAsync();
  }, [bootstrapAsync]);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || !data?.ok) {
        throw buildApiError(data, "Registration failed");
      }

      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("authUser", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || !data?.ok) {
        throw buildApiError(data, "Login failed");
      }

      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("authUser", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authUser");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isSignedIn: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
