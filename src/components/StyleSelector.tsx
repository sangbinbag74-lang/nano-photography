
"use client";

import { clsx } from "clsx";
import { Sparkles } from "lucide-react";

export interface StyleOption {
    style: string;
    description: string;
    imageUrl?: string; // Pre-generated or placeholder
    isLoading?: boolean;
}

interface StyleSelectorProps {
    options: StyleOption[];
    onSelect?: (style: StyleOption) => void;
}

export default function StyleSelector({ options, onSelect }: StyleSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto mt-8">
            {options.map((option, index) => (
                <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden glass-panel hover:bg-white/5 transition-all duration-300 cursor-pointer"
                    onClick={() => onSelect?.(option)}
                >
                    <div className="aspect-[4/3] relative">
                        {option.imageUrl ? (
                            <img
                                src={option.imageUrl}
                                alt={option.style}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                {option.isLoading ? (
                                    <div className="animate-pulse text-white/30">Generating...</div>
                                ) : (
                                    <Sparkles className="w-8 h-8 text-white/20" />
                                )}
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-4 w-full">
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                                {option.style}
                            </h3>
                            <p className="text-sm text-gray-300 line-clamp-2">
                                {option.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
