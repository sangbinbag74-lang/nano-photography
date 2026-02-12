
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
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
                clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
                // Replace \n with actual newlines if stored as one line string
                privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error", error);
    }
}

export const adminDb = admin.firestore();
