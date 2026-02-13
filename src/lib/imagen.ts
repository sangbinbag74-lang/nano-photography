
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
        // Strategy: Revert to Imagen 2 (Stable)
        // Imagen 3 models are rejecting the input with 'Invalid Argument' or 'Internal Error'.
        // We switch to 'imagegeneration@006' (Imagen 2) which is more permissive and robust for variations.

        const matches = imageBase64.match(/^data:(image\/\w+);base64,/);
        // Clean Base64 (Remove header)
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const modelId = "imagegeneration@006"; // Imagen 2
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${location}/publishers/google/models/${modelId}:predict`;

        const payload = {
            instances: [
                {
                    prompt: prompt,
                    image: {
                        bytesBase64Encoded: cleanBase64
                        // Imagen 2 infers mimeType or ignores it, commonly just bytes.
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
                // Imagen 2 parameters
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

