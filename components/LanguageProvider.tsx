"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import en from "../locales/en.json";
import jp from "../locales/jp.json";
import { getLang, setLang } from "../utils/localStorage";

type Translations = typeof en;
const resources: Record<"en" | "jp", Translations> = { en, jp };

interface LangContextProps {
  lang: "en" | "jp";
  t: (key: keyof Translations) => string;
  switchLang: (lang: "en" | "jp") => void;
}

const LangContext = createContext<LangContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<"en" | "jp">("en");

  useEffect(() => {
    const saved = getLang();
    setLangState(saved);
  }, []);

  const switchLang = (l: "en" | "jp") => {
    setLangState(l);
    setLang(l);
  };

  const t = (key: keyof Translations) => {
    return resources[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LangContext);
  if (!context)
    throw new Error("useTranslation must be used within LanguageProvider");
  return context;
}
