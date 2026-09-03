"use client";
// ─── Language Context ─────────────────────────────────────────────────────────
// Provides locale state + t() translation helper throughout the app.
// Persists locale choice to localStorage across sessions.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { dictionaries, type Locale, type DictionaryKey } from "./dictionaries";

const STORAGE_KEY = "artecks-academy-locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "zh",
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") setLocaleState(stored);
    } catch {}
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: DictionaryKey): string => dictionaries[locale][key] ?? key,
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  return (
    <button
      onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${className}`}
      aria-label="Toggle language"
    >
      {locale === "zh" ? "EN" : "中文"}
    </button>
  );
}
