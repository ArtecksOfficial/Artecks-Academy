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
import { Globe } from "lucide-react";
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
  const isZh = locale === "zh";

  return (
    <button
      onClick={() => setLocale(isZh ? "en" : "zh")}
      aria-label={isZh ? "Switch to English" : "切換至中文"}
      title={isZh ? "Switch to English" : "切換至中文"}
      className={`flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-700 transition-all shadow-sm ${className}`}
    >
      <Globe size={13} className="flex-shrink-0 opacity-70" />
      <span>{isZh ? "EN" : "中文"}</span>
    </button>
  );
}
