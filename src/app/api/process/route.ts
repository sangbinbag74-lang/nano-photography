
import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";
import { generateBackground } from "@/lib/imagen";
import { fileToBase64 } from "@/lib/utils";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, imageUrls } = body;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 });
        }

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        // COST: 4 credits per generation request
        const CREDIT_COST = 4;

        // Run Transaction to Check & Deduct Credits
        const userRef = adminDb.collection("users").doc(userId);

        try {
            await adminDb.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                const currentCredits = userDoc.exists ? (userDoc.data()?.credits || 0) : 0;

                if (currentCredits < CREDIT_COST) {
                    throw new Error("INSUFFICIENT_CREDITS");
                }

                t.update(userRef, { credits: currentCredits - CREDIT_COST });

                // Optional: Log usage
                const logRef = adminDb.collection("credit_logs").doc();
                t.set(logRef, {
                    uid: userId,
                    amount: -CREDIT_COST,
                    type: "generation",
                    createdAt: new Date()
                });
            });
        } catch (e: any) {
            if (e.message === "INSUFFICIENT_CREDITS") {
                return NextResponse.json({ error: "Insufficient credits", code: "insufficient_credits" }, { status: 402 });
            }
            throw e;
        }

        // --- Logic Continues ---

        // 1. Fetch Images from URLs and Convert to Base64
        console.log(`Fetching ${imageUrls.length} images from URLs...`);
        const originalsBase64 = await Promise.all(imageUrls.map(async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get("content-type") || "image/png";
            return `data:${contentType};base64,${buffer.toString("base64")}`;
        }));

        // 2. Analyze with Gemini (Get 4 prompts using ALL images as context)
        console.log("Analyzing images with Gemini...");
        const analysisResults = await analyzeImage(originalsBase64);

        // 3. Return Text-Only Options (No Image Generation yet)
        const results = analysisResults.map(styleData => ({
            style: styleData.style,
            description: styleData.description,
            generatedImages: [] // Empty initially
        }));

        return NextResponse.json({
            originals: imageUrls,
            results: results
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
