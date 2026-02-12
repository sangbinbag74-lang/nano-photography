
"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";

interface ResultViewerProps {
    originalImage: string;
    generatedImage: string;
}

export default function ResultViewer({ originalImage, generatedImage }: ResultViewerProps) {
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
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchend", handleMouseUp);
        document.addEventListener("touchmove", handleTouchMove as any);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("touchend", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove as any);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-2xl aspect-[3/4] mx-auto rounded-2xl overflow-hidden glass-panel select-none touch-none"
        >
            {/* Generated Image (Background) */}
            <img
                src={generatedImage}
                alt="Generated"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Original Image (Foreground, Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={originalImage}
                    alt="Original"
                    className="absolute top-0 left-0 w-[100vw] max-w-2xl h-full object-cover"
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <GripVertical className="w-5 h-5" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white pointer-events-none">
                Original
            </div>
            <div className="absolute top-4 right-4 bg-blue-500/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white pointer-events-none">
                AI Studio
            </div>
        </div>
    );
}
