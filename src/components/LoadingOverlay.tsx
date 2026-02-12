
"use client";

import { Scan } from "lucide-react";

export default function LoadingOverlay() {
    return (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
            <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px]" />
            <div className="absolute w-full h-[2px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur text-white px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 shadow-xl">
                    <Scan className="animate-spin-slow w-5 h-5 text-blue-400" />
                    <span className="font-medium tracking-wide">Analysing texture & geometry...</span>
                </div>
            </div>
        </div>
    );
}
