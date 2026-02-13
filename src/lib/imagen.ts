
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
        // The Ultimate Fix: Capability Model + Dynamic Mime + Synthetic Mask
        // 1. Model: capability-001 (generate-001 is text-only -> 500 Error).
        // 2. MimeType: Dynamic (Hardcoded PNG caused 'Invalid Argument' for JPEGs).
        // 3. Structure: Flattened (Nested caused errors in capability model).
        // 4. Mask: Synthetic White 1x1 (Required for EDIT_MODE_DEFAULT to work without error).

        const matches = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = matches ? matches[1] : "image/png"; // Fallback if missing
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const modelId = "imagen-3.0-capability-001";
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${location}/publishers/google/models/${modelId}:predict`;

        // 1x1 White PNG Base64 (Standard "Select All" mask for variation)
        const WHITE_MASK_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        const payload = {
            instances: [
                {
                    prompt: prompt,
                    referenceImages: [
                        {
                            referenceType: "REFERENCE_TYPE_RAW",
                            referenceId: 1,
                            referenceImage: {
                                // Flattened structure (Proven Correct for capability-001)
                                bytesBase64Encoded: cleanBase64,
                                mimeType: mimeType // Dynamic MimeType
                            }
                        },
                        {
                            referenceType: "REFERENCE_TYPE_MASK",
                            referenceId: 2,
                            referenceImage: {
                                // Synthetic Mask (Always PNG)
                                bytesBase64Encoded: WHITE_MASK_BASE64,
                                mimeType: "image/png"
                            }
                        }
                    ]
                }
            ],
            parameters: {
                sampleCount: 1,
                // No aspectRatio (Avoid conflict with Base Image)
                editConfig: {
                    baseImageReferenceId: 1,
                    maskReferenceId: 2,
                    editMode: "EDIT_MODE_DEFAULT"
                }
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

