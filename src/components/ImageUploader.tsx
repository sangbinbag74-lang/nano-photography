
"use client";


import { useState, useCallback } from "react";
import { Upload, X, Check } from "lucide-react";
import { clsx } from "clsx";

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
            <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {selectedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden glass-panel shadow-lg group">
                            <img
                                src={img}
                                alt={`Selected ${idx}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay indicating it's part of the context */}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Context #{idx + 1}
                            </div>
                        </div>
                    ))}
                    
                    {/* Add more button */}
                    <div className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center justify-center cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-6 h-6 text-white/50" />
                        <span className="text-white/50 text-xs mt-2">Add more</span>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button
                        onClick={onClear}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Clear All
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
                "relative w-full max-w-md aspect-[3/4] mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group",
                isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
            )}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4 text-white/50 group-hover:text-white transition-colors">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium">Drop 3-4 product photos</p>
                    <p className="text-sm">or click to browse</p>
                </div>
            </div>
        </div>
    );
}

