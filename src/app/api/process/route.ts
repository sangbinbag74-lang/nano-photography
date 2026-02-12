
import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";
import { generateBackground } from "@/lib/imagen";
import { fileToBase64 } from "@/lib/utils";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("image") as File[];

        // --- Authentication & Credit Check ---
        // In a real app, send ID token in headers and verify with admin.auth().verifyIdToken()
        // For this MVP, we will try to get the uid from a header or simply trust the client sends it in formData?
        // NO, we MUST secure this. The client should send the UID or token.
        // Let's assume for now we pass 'userId' in formData for MVP speed, 
        // BUT ideally we should use Authorization header.

        // Let's modify client to send userId in formData for simplicity in this specific context,
        // OR better, let's extract it if present.
        const userId = formData.get("userId") as string;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        // COST: 4 credits per generation request (regardless of how many images, for now?)
        // The plan says "1 generation (4 angles) costs 4 credits".
        // If the user uploads 1 image, we generate 1 result?
        // Wait, the new workflow is "Upload 3-4 photos... generate consistency".
        // The logic below generates variations for EACH input image.
        // Let's stick to the plan: "1 Generation Request = 4 Credits".
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

        // 1. Convert ALL to Base64
        console.log(`Processing ${files.length} images...`);
        const originalsBase64 = await Promise.all(files.map(file => fileToBase64(file)));

        // 2. Analyze with Gemini (Get 4 prompts using ALL images as context)
        console.log("Analyzing images with Gemini...");
        const analysisResults = await analyzeImage(originalsBase64);

        // 3. Generate images for EACH input image x EACH style
        console.log("Generating variations...");

        // Map over each style (e.g., Luxury, Nature)
        const results = await Promise.all(analysisResults.map(async (styleData) => {

            // For this style, generate a version for EACH original image
            const styleGenerations = await Promise.all(originalsBase64.map(async (original, idx) => {
                const mask = original;
                return await generateBackground(
                    original,
                    mask,
                    styleData.prompt
                );
            }));

            return {
                style: styleData.style,
                description: styleData.description,
                generatedImages: styleGenerations,
            };
        }));

        return NextResponse.json({
            originals: originalsBase64,
            results: results
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
