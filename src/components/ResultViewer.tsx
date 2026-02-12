
"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, MoveHorizontal } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ResultViewerProps {
    originalImage: string;
    generatedImage: string;
}

export default function ResultViewer({ originalImage, generatedImage }: ResultViewerProps) {
    const { t } = useLanguage();
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(x, 0), 100));
    };

    const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(x, 0), 100));
    };

    useEffect(() => {
        const up = () => isDragging.current = false;
        document.addEventListener("mouseup", up);
        document.addEventListener("touchend", up);
        return () => {
            document.removeEventListener("mouseup", up);
            document.removeEventListener("touchend", up);
        };
    }, []);

    return (
        <div
            className="w-full relative group select-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove as any}
        >
            <div
                ref={containerRef}
                className="relative w-full aspect-[3/4] md:aspect-[4/3] rounded-3xl overflow-hidden glass-card shadow-2xl shadow-black/50 border border-white/10"
            >
                {/* Generated Image (Right/Background) */}
                <div className="absolute inset-0">
                    <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-full object-cover"
                    />
                    {/* Label */}
                    <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-blue-400 uppercase shadow-lg">
                            {t.result_viewer.ai_label}
                        </div>
                    </div>
                </div>

                {/* Original Image (Left/Foreground, Clipped) */}
                <div
                    className="absolute inset-0 w-full h-full overflow-hidden border-r border-white/20"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img
                        src={originalImage}
                        alt="Original"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        style={{ width: '100vw', maxWidth: 'none' }} // Trick to keep image static while container clips
                    />
                    {/* Label */}
                    <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-white/50 uppercase shadow-lg">
                            {t.result_viewer.original_label}
                        </div>
                    </div>
                </div>

                {/* Slider Handle Line */}
                <div
                    className="absolute top-0 bottom-0 w-[1px] bg-white/50 cursor-ew-resize z-20"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Handle Button */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all duration-300"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                    >
                        <MoveHorizontal className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                </div>
            </div>

            <p className="text-center mt-4 text-xs font-medium tracking-widest text-white/20 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {t.result_viewer.drag_compare}
            </p>
        </div>
    );
}
