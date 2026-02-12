
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // For local development or Vercel, use environment variables
    // You need to set these in .env or Vercel dashboard
    // const serviceAccount = JSON.parse(
    //    process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string
    // );

    // OR simplify for now by checking if we have credentials
    // Note: In a real Vercel deploy, you must set GOOGLE_PRIVATE_KEY etc.

    try {
        const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            console.error("Missing Firebase Admin credentials");
            throw new Error("Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error", error);
        // Do not throw here to avoid crashing the whole import, 
        // but usages of adminDb will likely fail if init failed.
    }
}

export const adminDb = admin.firestore();
