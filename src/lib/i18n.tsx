"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import id from "../locales/id.json";
import en from "../locales/en.json";
import ja from "../locales/ja.json";

export type Language = "id" | "en" | "ja";

const translations: Record<Language, any> = { id, en, ja };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (_path, fallback) => fallback || "",
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus_chat_lang") as Language;
      if (saved && (saved === "id" || saved === "en" || saved === "ja")) {
        setLanguageState(saved);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("nexus_chat_lang", lang);
    } catch {}
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let val: any = translations[language];
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        val = undefined;
        break;
      }
    }
    if (typeof val === "string") return val;

    let enVal: any = translations.en;
    for (const k of keys) {
      if (enVal && typeof enVal === "object" && k in enVal) {
        enVal = enVal[k];
      } else {
        enVal = undefined;
        break;
      }
    }
    if (typeof enVal === "string") return enVal;

    return fallback ?? path;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
