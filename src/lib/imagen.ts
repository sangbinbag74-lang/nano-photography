import sharp from "sharp";
import { GoogleAuth } from "google-auth-library";

const GOOGLE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// Service Account Credentials
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"); // Fix newlines if escaped

export async function generateBackground(
    imageBase64: string,
    maskBase64: string,
    prompt: string,
    _aspectRatio: string = "3:4"
): Promise<string> {
    if (!GOOGLE_PROJECT_ID) {
        console.error("Missing GOOGLE_PROJECT_ID");
        return imageBase64;
    }

    try {
        console.log("Authenticating with Google Cloud...");

        const auth = new GoogleAuth({
            credentials: {
                client_email: GOOGLE_CLIENT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY,
            },
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        if (!token) {
            throw new Error("Failed to generate Access Token");
        }

        console.log("Calling Imagen 3 API via Vertex AI...");

        const location = "us-central1";
        // Use a stable model version. 'imagegeneration@006' is Imagen 2. 
        // For Imagen 3, we might need 'imagen-3.0-generate-001' if available or check specific docs.
        // Falling back to 'imagegeneration@006' (Imagen 2) as it's widely available on Vertex, 
        // or trying the new model ID if user has allowlist access.
        // Final Strategy: Sharp + Capability-001 + Dynamic Mask
        // 1. Problem: 'capability-001' requires a mask that MATCHES the input image dimensions.
        //    (1x1 mask caused 'Invalid Argument').
        //    (No mask caused 'Invalid editConfig').
        // 2. Solution: Use 'sharp' to read input dimensions and generate a perfect White Mask.
        // 3. Model: capability-001 (Correct model).
        // 4. MimeType: Dynamic (Correct data format).

        // Final Strategy: v1beta1 Endpoint + Generate-001 + Subject Reference
        // 1. Imagen 3 features (Subject Ref) require 'v1beta1' API version (Preview).
        //    Using 'v1' caused "Invalid Argument" because the field was not recognized.
        // 2. We use 'imagen-3.0-generate-001' which supports background generation via Subject Ref.
        // 3. We Add 'subjectDescription' which is required for REFERENCE_TYPE_SUBJECT.

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const inputBuffer = Buffer.from(cleanBase64, "base64");

        const sharpImage = sharp(inputBuffer);

        // 1. Resize Input (Force 1024x1024 with white padding) & Force PNG
        // Imagen 3 Subject Reference requires 1:1 aspect ratio (square) input.
        const processedInputBuffer = await sharpImage
            .resize({
                width: 1024,
                height: 1024,
                fit: "contain",
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toBuffer();

        const processedInputBase64 = processedInputBuffer.toString("base64");

        // NO Mask required for 'generate-001' subject reference

        const modelId = "imagen-3.0-generate-001";
        // CRITICAL: Must use v1beta1 for Reference Images
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${GOOGLE_PROJECT_ID}/locations/${location}/publishers/google/models/${modelId}:predict`;

        const safePrompt = prompt || "A high quality image of the subject"; // Fallback to prevent 400 error

        const payload = {
            instances: [
                {
                    prompt: safePrompt,
                    referenceImages: [
                        {
                            referenceType: "REFERENCE_TYPE_SUBJECT",
                            referenceId: 1,
                            referenceImage: {
                                bytesBase64Encoded: processedInputBase64,
                                mimeType: "image/png"
                            },
                            subjectDescription: "The main product or object shown in this image" // Updated to prevent 400 INVALID_ARGUMENT
                        }
                    ]
                }
            ],
            parameters: {
                sampleCount: 1,
                priority: "sampleCount", // Optional but good for v1beta1
                negativePrompt: "low quality, text, watermark, blur, deformed, mutation"
                // aspectRatio: "3:4" // Removing this as it conflicts with Subject Reference (must use default 1:1)
            }
        };

        console.log("Imagen Payload:", JSON.stringify({
            ...payload,
            instances: payload.instances.map(inst => ({
                ...inst,
                referenceImages: inst.referenceImages?.map(ref => ({
                    ...ref,
                    referenceImage: {
                        ...ref.referenceImage,
                        bytesBase64Encoded: "(BASE64_STRING_TRUNCATED)" // Don't log full base64
                    }
                }))
            }))
        }, null, 2));

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Imagen API Error:", errorText);
            throw new Error(`Imagen API Failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const generatedBase64 = data.predictions?.[0]?.bytesBase64Encoded;

        if (generatedBase64) {
            return `data:image/png;base64,${generatedBase64}`;
        }

        throw new Error("No image generated");

    } catch (error: any) {
        console.error("Failed to generate background:", error);
        throw new Error(`Image generation failed: ${error.message || error}`);
    }
}

