
"use client";

import { useState } from "react";
import { deleteImage } from "../actions_gallery";
import { Trash2, ExternalLink } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function ClientGalleryGrid({ initialImages }: { initialImages: any[] }) {
    const [images, setImages] = useState(initialImages);

    const handleDelete = async (id: string, url: string) => {
        if (!confirm("Delete this image permanently?")) return;

        // Optimistic update
        setImages(images.filter(img => img.id !== id));

        const result = await deleteImage(id, url, auth.currentUser?.email || "unknown");
        if (!result.success) {
            alert("Failed to delete");
            // In a real app, revert state or refetch
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
                <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <img
                        src={image.generatedImage || image.originalImage}
                        alt="Generated content"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="text-xs text-white/70 mb-2 line-clamp-2">
                            {image.prompt}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-white/40 font-mono truncate max-w-[80px]">
                                {image.userId}
                            </span>
                            <button
                                onClick={() => handleDelete(image.id, image.generatedImage)}
                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
