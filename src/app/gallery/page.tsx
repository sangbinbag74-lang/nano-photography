
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUserHistory, HistoryItem } from "@/lib/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

export default function GalleryPage() {
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const data = await getUserHistory(currentUser.uid);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to load history", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
                <Link href="/" className="text-blue-400 hover:underline">
                    메인으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
            <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">내 갤러리</h1>
                </div>
                <div className="text-gray-400 text-sm">
                    {history.length}개의 작품
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item) => (
                    <div key={item.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden glass-panel bg-white/5">
                        <img
                            src={item.generatedImage}
                            alt={item.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <span className="text-xs font-bold text-blue-400 uppercase mb-1">{item.style}</span>
                            <p className="text-sm text-gray-200 line-clamp-2 mb-3">{item.prompt}</p>

                            <div className="flex items-center gap-2">
                                <a
                                    href={item.generatedImage}
                                    download={`nano_photo_${item.id}.png`}
                                    className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    다운로드
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <p className="mb-4">아직 생성된 이미지가 없습니다.</p>
                        <Link href="/" className="text-blue-400 hover:underline">
                            새로운 이미지 만들기
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
