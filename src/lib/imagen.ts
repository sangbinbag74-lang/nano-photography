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

        const matches = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = matches ? matches[1] : "image/png";
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(cleanBase64, "base64");

        // Generate Dynamic White Mask matching input dimensions
        // This is the ONLY way to satisfy the strict dimension requirement of capability-001.
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1024;
        const height = metadata.height || 1024;

        const maskBuffer = await sharp({
            create: {
                width: width,
                height: height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 255 } // Solid White
            }
        })
            .png()
            .toBuffer();

        const generatedMaskBase64 = maskBuffer.toString("base64");

        const modelId = "imagen-3.0-capability-001";
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${location}/publishers/google/models/${modelId}:predict`;

        const payload = {
            instances: [
                {
                    prompt: prompt,
                    referenceImages: [
                        {
                            referenceType: "REFERENCE_TYPE_RAW",
                            referenceId: 1,
                            referenceImage: {
                                bytesBase64Encoded: cleanBase64,
                                mimeType: mimeType
                            }
                        },
                        {
                            referenceType: "REFERENCE_TYPE_MASK",
                            referenceId: 2,
                            referenceImage: {
                                bytesBase64Encoded: generatedMaskBase64,
                                mimeType: "image/png" // Mask is always PNG
                            }
                        }
                    ]
                }
            ],
            parameters: {
                sampleCount: 1,
                editConfig: {
                    baseImageReferenceId: 1,
                    maskReferenceId: 2,
                    editMode: "EDIT_MODE_DEFAULT"
                },
                negativePrompt: "low quality, text, watermark, blur, deformed, mutation",
            }
        };

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

