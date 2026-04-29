import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ConsentContextValue = {
  acceptedPrivacy: boolean;
  setAcceptedPrivacy: (value: boolean) => Promise<void>;
  loading: boolean;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);
const PRIVACY_KEY = "accepted_privacy";

export const ConsentProvider = ({ children }: { children: React.ReactNode }) => {
  const [acceptedPrivacy, setAcceptedPrivacyState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(PRIVACY_KEY);
      setAcceptedPrivacyState(stored === "true");
      setLoading(false);
    };
    load();
  }, []);

  const setAcceptedPrivacy = async (value: boolean) => {
    setAcceptedPrivacyState(value);
    await AsyncStorage.setItem(PRIVACY_KEY, String(value));
  };

  const value = useMemo(
    () => ({ acceptedPrivacy, setAcceptedPrivacy, loading }),
    [acceptedPrivacy, loading]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useConsent = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent doit etre utilise dans ConsentProvider");
  return ctx;
};
