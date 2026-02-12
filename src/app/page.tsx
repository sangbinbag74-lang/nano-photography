"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import StyleSelector, { StyleOption } from "@/components/StyleSelector";
import ResultViewer from "@/components/ResultViewer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fileToBase64 } from "@/lib/utils";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { History, Sparkles } from "lucide-react";
import { saveToHistory, uploadImage } from "@/lib/firestore";
import { useCredits } from "@/hooks/useCredits";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/lib/i18n";

import PricingModal from "@/components/PricingModal";
import { Plus } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const { credits, loading: creditsLoading } = useCredits();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleImagesSelect = async (files: File[]) => {
    if (!user) {
      alert(t.auth.login_required);
      return;
    }
    if (files.length > 4) {
      alert(t.uploader.limit_alert);
      return;
    }

    const base64s = await Promise.all(files.map(file => fileToBase64(file)));
    setPreviewUrls(base64s);
    startAnalysis(files);
  };

  const handleClear = () => {
    setPreviewUrls([]);
    setResults([]);
    setSelectedResult(null);
    setIsAnalyzing(false);
    setActiveImageIndex(0);
  };

  const startAnalysis = async (files: File[]) => {
    // Client-side credit check
    if (credits !== null && credits < 4) {
      alert(t.uploader.limit_alert || "Insufficient credits. Please top up.");
      setIsPricingOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    try {
      const formData = new FormData();
      if (user) formData.append("userId", user.uid); // Pass userId for server-side check

      files.forEach(file => {
        formData.append("image", file);
      });

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (response.status === 402) {
        alert("Insufficient credits. Please top up.");
        setIsPricingOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      setResults(data.results);

      if (user && data.results.length > 0) {
        const originals = data.originals as string[];
        const originalUrls = await Promise.all(originals.map(async (orig) => {
          const path = `uploads/${user.uid}/${uuidv4()}_original.png`;
          return await uploadImage(orig, path);
        }));

        await Promise.all(data.results.map(async (res: any) => {
          await Promise.all(res.generatedImages.map(async (genImg: string, idx: number) => {
            if (genImg.startsWith("data:")) {
              const genPath = `generations/${user.uid}/${uuidv4()}_${res.style}_${idx}.png`;
              const genUrl = await uploadImage(genImg, genPath);

              await saveToHistory({
                userId: user.uid,
                originalImage: originalUrls[idx],
                generatedImage: genUrl,
                style: res.style,
                prompt: res.description,
              });
            }
          }));
        }));
      }

    } catch (_error) {
      console.error(_error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 backdrop-blur-sm bg-black/30 border-b border-white/5 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shadow-lg shadow-blue-900/20">
            <img src="/logo.svg" alt="Nano Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">
            Nano Photography
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {user && (
            <>
              {/* Credit Display */}
              <div
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsPricingOpen(true)}
              >
                <span className="text-xs text-white/40">CREDITS</span>
                <span className={`text-sm font-bold ${credits !== null && credits < 4 ? 'text-red-500' : 'text-blue-400'}`}>
                  {creditsLoading ? "..." : (credits ?? 0)}
                </span>
              </div>

              <button
                onClick={() => setIsPricingOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                GET CREDITS
              </button>

              <Link
                href="/gallery"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                <History className="w-4 h-4" />
                {t.auth.history}
              </Link>
            </>
          )}
          <GoogleLoginButton />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative pt-32 pb-20 px-4 md:px-0 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">

        {/* State 1: Hero & Upload */}
        {!selectedResult && (
          <div className="w-full flex flex-col items-center animate-fade-in">

            {/* Hero Text */}
            <div className="text-center mb-16 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6 backdrop-blur-md">
                <Sparkles className="w-3 h-3" />
                <span>{t.hero.badge}</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white mb-6 leading-[0.9]">
                {t.hero.title_1} <br />
                <span className="text-gradient font-medium">{t.hero.title_2}</span>
              </h2>
              <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
                {t.hero.description}
              </p>
            </div>

            {/* Upload Zone */}
            <div className="w-full max-w-4xl relative z-20">
              <div className="glass-card rounded-3xl p-2 md:p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-white/20">
                <ImageUploader
                  onImagesSelected={handleImagesSelect}
                  selectedImages={previewUrls}
                  onClear={handleClear}
                />
              </div>

              {/* Scanning Overlay */}
              {isAnalyzing && <LoadingOverlay />}
            </div>

            {!user && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-white/30 text-sm font-light">
                  {t.hero.login_notice}
                </p>
              </div>
            )}

            {/* Style Selector (Only shows after upload/analysis) */}
            {results.length > 0 && (
              <div className="w-full max-w-6xl mt-24 animate-slide-up">
                <div className="flex items-center justify-between mb-8 px-4">
                  <h3 className="text-2xl font-light tracking-tight text-white">{t.style_selector.title}</h3>
                  <div className="h-[1px] bg-white/10 flex-1 ml-8" />
                </div>

                <StyleSelector
                  options={results.map(r => ({
                    style: r.style,
                    description: r.description,
                    imageUrl: r.generatedImages[0]
                  }))}
                  onSelect={(opt) => {
                    const fullRes = results.find(r => r.style === opt.style);
                    setSelectedResult(fullRes);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* State 2: Result Viewer (Immersive Mode) */}
        {selectedResult && previewUrls.length > 0 && (
          <div className="w-full h-full flex flex-col items-center animate-fade-in">
            {/* Top Bar for Result View */}
            <div className="w-full max-w-7xl flex items-center justify-between mb-8 px-4">
              <button
                onClick={() => setSelectedResult(null)}
                className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                  ←
                </div>
                <span className="text-sm font-medium tracking-wide">{t.result_viewer.back}</span>
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-1">{t.result_viewer.selected_style}</span>
                <h2 className="text-2xl font-light tracking-tight text-white">{selectedResult.style}</h2>
              </div>

              <div className="w-[120px]" /> {/* Spacer for centering */}
            </div>

            {/* Angle Switcher (Tabs) */}
            <div className="flex justify-center gap-3 mb-12">
              <div className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex gap-1">
                {previewUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`px-6 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${activeImageIndex === idx
                      ? "bg-white text-black shadow-lg"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {t.result_viewer.angle} {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Viewer */}
            <div className="w-full max-w-6xl px-4 mb-8">
              <ResultViewer
                originalImage={previewUrls[activeImageIndex]}
                generatedImage={selectedResult.generatedImages[activeImageIndex]}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-6 mt-4 pb-20">
              <p className="text-white/40 text-sm font-light max-w-xl text-center leading-relaxed">
                {selectedResult.description}
              </p>

              <div className="flex items-center gap-4">
                <button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium tracking-wide rounded-full transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50 hover:-translate-y-0.5">
                  {t.result_viewer.download}
                </button>
                <button
                  onClick={handleClear}
                  className="h-12 px-8 bg-white/5 hover:bg-white/10 text-white text-sm font-medium tracking-wide rounded-full border border-white/10 transition-all hover:border-white/20"
                >
                  {t.result_viewer.new_project}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={user}
      />
    </main>
  );
}
