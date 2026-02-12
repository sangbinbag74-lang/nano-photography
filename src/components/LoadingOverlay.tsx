
"use client";

import { Scan } from "lucide-react";

export default function LoadingOverlay() {
    return (
        <div className="absolute inset-0 rounded-3xl overflow-hidden z-20 flex items-center justify-center">
            {/* Dark overlay backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500" />

            {/* Scanning Line */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan" />
            </div>

            {/* Central Badge */}
            <div className="relative glass-card px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl shadow-blue-900/20 border border-white/10 animate-pulse-glow">
                <Scan className="animate-spin-slow w-5 h-5 text-blue-400" />
                <span className="text-sm font-light tracking-widest text-white/90 uppercase">
                    Analyzing Geometry...
                </span>
            </div>
        </div>
    );
}
