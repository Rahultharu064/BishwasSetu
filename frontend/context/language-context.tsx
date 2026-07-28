"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ne";

interface LangState {
  lang: Lang;
  toggle: () => void;
  /** Pick the English or Nepali variant of a bilingual field. */
  t: (en: string, ne?: string | null) => string;
}

const LangContext = createContext<LangState | undefined>(undefined);
const KEY = "bs_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Rehydrate from localStorage on mount — client-only, unavailable at SSR.
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem(KEY) as Lang | null)
        : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "en" || saved === "ne") setLang(saved);
  }, []);

  const toggle = () =>
    setLang((prev) => {
      const next = prev === "en" ? "ne" : "en";
      if (typeof window !== "undefined") localStorage.setItem(KEY, next);
      return next;
    });

  const t = (en: string, ne?: string | null) =>
    lang === "ne" && ne ? ne : en;

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangState {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
