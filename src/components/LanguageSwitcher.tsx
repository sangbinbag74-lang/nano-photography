
"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${language === "en"
                        ? "bg-white text-black shadow-lg"
                        : "text-white/40 hover:text-white"
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage("ko")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${language === "ko"
                        ? "bg-white text-black shadow-lg"
                        : "text-white/40 hover:text-white"
                    }`}
            >
                KO
            </button>
        </div>
    );
}
