
"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import StyleSelector, { StyleOption } from "@/components/StyleSelector";
import ResultViewer from "@/components/ResultViewer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fileToBase64 } from "@/lib/utils";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { saveToHistory, uploadImage } from "@/lib/firestore";
import { v4 as uuidv4 } from "uuid";

export default function Home() {

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]); // New structure
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  // Track which of the uploaded images we are currently viewing in the ResultViewer
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleImagesSelect = async (files: File[]) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    // Limit to 4 images
    if (files.length > 4) {
      alert("최대 4장까지만 업로드 가능합니다.");
      return;
    }

    // setSelectedFiles(files);
    const base64s = await Promise.all(files.map(file => fileToBase64(file)));
    setPreviewUrls(base64s);

    // Auto start analysis
    startAnalysis(files);
  };

  const handleClear = () => {
    // setSelectedFiles([]);
    setPreviewUrls([]);
    setResults([]);
    setSelectedResult(null);
    setIsAnalyzing(false);
    setActiveImageIndex(0);
  };

  const startAnalysis = async (files: File[]) => {
    setIsAnalyzing(true);
    setResults([]); // Clear previous results

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("image", file);
      });

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();

      // Data structure: { originals: string[], results: { style, description, generatedImages: string[] }[] }
      setResults(data.results);

      // Save logic (Simplified for multi-image)
      // Only save if user generates? Actually we generated already.
      // Saving ALL is expensive/slow. Let's do lazy saving or save independent of UI?
      // For MVP Phase 6, let's keep it simple: Save everything.

      if (user && data.results.length > 0) {
        const originals = data.originals as string[];

        // 1. Upload Originals
        const originalUrls = await Promise.all(originals.map(async (orig) => {
          const path = `uploads/${user.uid}/${uuidv4()}_original.png`;
          return await uploadImage(orig, path);
        }));

        // 2. Upload and Save ALL generations
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
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-12 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Nano Photography
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Link
              href="/gallery"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              내 갤러리
            </Link>
          )}
          <GoogleLoginButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl animate-fade-in">

        {/* State 1: Upload / Analysis */}
        {!selectedResult && (
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-balance bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              Studio quality for every angle.
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-lg">
              Upload 3-4 photos of your product. Our AI analyzes the full context to consistency across all angles.
            </p>

            <div className="relative w-full">
              <ImageUploader
                onImagesSelected={handleImagesSelect}
                selectedImages={previewUrls}
                onClear={handleClear}
              />

              {/* Scanning Overlay */}
              {isAnalyzing && <LoadingOverlay />}
            </div>

            {!user && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="text-gray-400 bg-white/5 inline-block px-4 py-2 rounded-full text-sm border border-white/10">
                  🔒 서비스를 이용하려면 위 버튼을 눌러 로그인해주세요.
                </p>
              </div>
            )}

            {/* Style Results Grid */}
            {results.length > 0 && (
              <div className="w-full mt-12 animate-slide-up">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[1px] bg-white/10 flex-1" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Select Style to View All</span>
                  <div className="h-[1px] bg-white/10 flex-1" />
                </div>
                {/* Note: StyleSelector expects imageURL in options. Pick the first generated image for thumbnail. */}
                <StyleSelector
                  options={results.map(r => ({
                    style: r.style,
                    description: r.description,
                    imageUrl: r.generatedImages[0] // Preview with the first result
                  }))}
                  onSelect={(opt) => {
                    // Find full result object
                    const fullRes = results.find(r => r.style === opt.style);
                    setSelectedResult(fullRes);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* State 2: Result Comparison */}
        {selectedResult && previewUrls.length > 0 && (
          <div className="w-full animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to styles
              </button>
              <h2 className="text-2xl font-bold">{selectedResult.style}</h2>
              <div className="w-24" />
            </div>

            {/* Image Switcher (Tabs) */}
            <div className="flex justify-center gap-2 mb-6">
              {previewUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeImageIndex === idx
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                    }`}
                >
                  Angle {idx + 1}
                </button>
              ))}
            </div>

            <ResultViewer
              originalImage={previewUrls[activeImageIndex]}
              generatedImage={selectedResult.generatedImages[activeImageIndex]}
            />

            <div className="mt-8 text-center max-w-2xl mx-auto">
              <p className="text-gray-400 mb-6">{selectedResult.description}</p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                  Download This Angle
                </button>
                <button
                  onClick={handleClear}
                  className="px-8 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
                >
                  New Project
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

