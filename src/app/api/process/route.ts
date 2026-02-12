
import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";
import { generateBackground } from "@/lib/imagen";
import { fileToBase64 } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("image") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        // 1. Convert ALL to Base64
        console.log(`Processing ${files.length} images...`);
        const originalsBase64 = await Promise.all(files.map(file => fileToBase64(file)));

        // 2. Analyze with Gemini (Get 4 prompts using ALL images as context)
        console.log("Analyzing images with Gemini...");
        const analysisResults = await analyzeImage(originalsBase64);

        // 3. Generate images for EACH input image x EACH style
        // If we have N input images and M styles, we generate N*M images.
        // To save resources/time, maybe we limit? 
        // For now, let's assume we want to see the style applied to ALL images.

        console.log("Generating variations...");

        // Map over each style (e.g., Luxury, Nature)
        const results = await Promise.all(analysisResults.map(async (styleData) => {

            // For this style, generate a version for EACH original image
            const styleGenerations = await Promise.all(originalsBase64.map(async (original, idx) => {
                // Determine layout/mask. For now, using original as placeholder/mask logic.
                // In real implementation with segmentation, we would segment each.
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
                generatedImages: styleGenerations, // Array of generated images for this style
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
