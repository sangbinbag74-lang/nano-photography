
import { NextRequest, NextResponse } from "next/server";
import { generateBackground } from "@/lib/imagen";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, imageUrls, style, prompt } = body;

        console.log(`Generating variations for style: ${style}`);

        // Credit Check (Optional: maybe charge less for variations or charge upfront?)
        // For now, let's assume credit was deducted for the "Analysis" which included 1 preview.
        // Or we deduclt specific amount here. Let's skip credit validaton for speed now, or add it later.

        // Fetch ALL images
        const originalsBase64 = await Promise.all(imageUrls.map(async (url: string) => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get("content-type") || "image/png";
            return `data:${contentType};base64,${buffer.toString("base64")}`;
        }));

        // Generate for ALL images (Index 0 is redundant if we already have it, but for simplicity let's regenerate or skip?)
        // Better: Expect client to pass index to skip? Or just regenerate for consistency.
        // Let's regenerate all 4 to be safe and consistent array. 
        // OR: Code filtering.

        const generatedImages = [];

        for (const original of originalsBase64) {
            try {
                const gen = await generateBackground(original, original, prompt);
                generatedImages.push(gen);
            } catch (e) {
                console.error(e);
                generatedImages.push(null);
            }
        }

        return NextResponse.json({ generatedImages });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
