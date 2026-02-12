"use client";

import { useState, useCallback } from "react";
import { Upload, X, Check, Image as ImageIcon, Plus } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/lib/i18n";

interface ImageUploaderProps {
    onImagesSelected: (files: File[]) => void;
    selectedImages: string[];
    onClear: () => void;
}

export default function ImageUploader({
    onImagesSelected,
    selectedImages,
    onClear,
}: ImageUploaderProps) {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                onImagesSelected(files);
            }
        },
        [onImagesSelected]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                onImagesSelected(files);
            }
        },
        [onImagesSelected]
    );

    if (selectedImages.length > 0) {
        return (
            <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {selectedImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-white/5 hover:border-white/20 transition-all duration-300">
                            <img
                                src={img}
                                alt={`Selected ${idx}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Context Badge */}
                            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-medium tracking-wider px-2 py-1 rounded-full flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                {t.uploader.context_badge} 0{idx + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add more button */}
                    {selectedImages.length < 4 && (
                        <div className="relative aspect-[3/4] rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group backdrop-blur-sm">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                <Plus className="w-5 h-5 text-white/50 group-hover:text-white" />
                            </div>
                            <span className="text-white/40 text-xs font-medium tracking-wider mt-3 group-hover:text-white/70 transition-colors">{t.uploader.add_more}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onClear}
                        className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 text-xs font-medium tracking-widest transition-all duration-300 flex items-center gap-2"
                    >
                        <X className="w-3 h-3" /> {t.uploader.reset}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl border border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden group",
                isDragging
                    ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
            )}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-black/50 group-hover:shadow-blue-900/20 transition-all duration-500">
                        <Upload className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                    {/* Decorative floating elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center animate-bounce delay-100">
                        <ImageIcon className="w-3 h-3 text-white/40" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center animate-bounce delay-300">
                        <Plus className="w-3 h-3 text-white/40" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-lg md:text-xl font-light tracking-tight text-white/90">
                        {t.uploader.drop_title}
                    </p>
                    <p className="text-sm text-white/40 font-light">
                        {t.uploader.drop_subtitle}
                    </p>
                </div>
            </div>

            {/* Bottom Indicator */}
            <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-medium tracking-widest text-white/20 uppercase group-hover:text-blue-400/80 transition-colors duration-500">
                <span className="w-1 h-1 rounded-full bg-current" />
                {t.uploader.drag_support}
                <span className="w-1 h-1 rounded-full bg-current" />
            </div>
        </div>
    );
}
