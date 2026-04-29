import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import { api, setAuthToken } from "../api/client";
import { User } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signInWithEmail: (email: string, fullName?: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    restore();
  }, []);

  const persist = async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const signInWithEmail = async (email: string, fullName?: string) => {
    const response = await api.post("/auth/email", { email, fullName });
    await persist(response.data.token, response.data.user);
  };

  const signInWithApple = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    });

    if (!credential.identityToken) {
      throw new Error("Token Apple introuvable.");
    }

    const response = await api.post("/auth/apple", {
      identityToken: credential.identityToken,
      user: {
        email: credential.email,
        fullName: credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName ?? ""}`.trim()
          : undefined,
        sub: credential.user
      }
    });
    await persist(response.data.token, response.data.user);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  const value = useMemo(
    () => ({ user, token, loading, signInWithEmail, signInWithApple, signOut }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans AuthProvider");
  return ctx;
};
