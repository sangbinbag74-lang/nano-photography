
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en, Translations } from "@/locales/en";
import { ko } from "@/locales/ko";

type Language = "en" | "ko";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        // 1. Check localStorage
        const saved = localStorage.getItem("language") as Language;
        if (saved && (saved === "en" || saved === "ko")) {
            setLanguage(saved);
            return;
        }

        // 2. Check browser preference
        const browserLang = navigator.language.startsWith("ko") ? "ko" : "en";
        setLanguage(browserLang);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = language === "ko" ? ko : en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
