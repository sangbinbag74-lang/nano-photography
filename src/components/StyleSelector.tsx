
"use client";

import { clsx } from "clsx";
import { Sparkles, ArrowRight } from "lucide-react";

import { useLanguage } from "@/lib/i18n";

export interface StyleOption {
    style: string;
    description: string;
    imageUrl?: string;
    isLoading?: boolean;
}

interface StyleSelectorProps {
    options: StyleOption[];
    onSelect?: (style: StyleOption) => void;
}

export default function StyleSelector({ options, onSelect }: StyleSelectorProps) {
    const { t } = useLanguage();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto pb-20 px-4">
            {options.map((option, index) => (
                <div
                    key={index}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
                    onClick={() => onSelect?.(option)}
                >
                    {/* Background Image Container */}
                    <div className="aspect-[16/10] relative overflow-hidden bg-white/5">
                        {option.imageUrl ? (
                            <img
                                src={option.imageUrl}
                                alt={option.style}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {option.isLoading ? (
                                    <div className="animate-pulse flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-xs text-white/30 uppercase tracking-widest">Generating...</span>
                                    </div>
                                ) : (
                                    <Sparkles className="w-8 h-8 text-white/10" />
                                )}
                            </div>
                        )}

                        {/* Cinematic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Hover Overlay for 'Explore' */}
                        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content on top */}
                    <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start gap-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        {/* Style Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-white/90 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            {option.style}
                        </div>

                        {/* Description */}
                        <p className="text-white/60 text-sm font-light leading-relaxed line-clamp-2 max-w-[90%] group-hover:text-white/90 transition-colors">
                            {option.description}
                        </p>

                        {/* CTA Arrow */}
                        <div className="mt-2 flex items-center gap-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0 text-xs font-bold tracking-widest uppercase">
                            Explore Variation <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Active Border Glow */}
                    <div className="absolute inset-0 border border-white/5 rounded-3xl group-hover:border-white/20 transition-colors pointer-events-none" />
                </div>
            ))}
        </div>
    );
}
