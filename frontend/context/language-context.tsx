"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STRINGS, type StringKey } from "@/lib/i18n";

export type Lang = "en" | "ne";

interface LangState {
  lang: Lang;
  toggle: () => void;
  /** Pick the English or Nepali variant of a bilingual field. */
  t: (en: string, ne?: string | null) => string;
  /**
   * Look up a static UI string from lib/i18n.ts's dictionary. Optional
   * `vars` fills `{placeholder}` tokens in the translated string (e.g.
   * "Pay {amount}"). Falls back to the English copy if a key is missing —
   * never throws, so partially-translated pages still render.
   */
  tr: (key: StringKey, vars?: Record<string, string | number>) => string;
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

  // The root layout can only ever render `lang="en"` at SSR time (language
  // lives in localStorage, not on the server) — keep the attribute honest
  // for screen readers and browser translation tools once we know better.
  useEffect(() => {
    document.documentElement.lang = lang === "ne" ? "ne" : "en";
  }, [lang]);

  const toggle = () =>
    setLang((prev) => {
      const next = prev === "en" ? "ne" : "en";
      if (typeof window !== "undefined") localStorage.setItem(KEY, next);
      return next;
    });

  const t = (en: string, ne?: string | null) =>
    lang === "ne" && ne ? ne : en;

  const tr = (key: StringKey, vars?: Record<string, string | number>) => {
    const entry = STRINGS[key];
    let str: string = entry ? (lang === "ne" ? entry.ne : entry.en) : key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return (
    <LangContext.Provider value={{ lang, toggle, t, tr }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangState {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
