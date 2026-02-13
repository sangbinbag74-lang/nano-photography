"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function verifyUserPhoneAction(userId: string, phoneNumber: string) {
    if (!userId || !phoneNumber) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Check for duplicates
        const usersRef = adminDb.collection("users");
        const duplicateQuery = await usersRef.where("phoneNumber", "==", phoneNumber).get();

        // Filter out self-match
        const duplicates = duplicateQuery.docs.filter(doc => doc.id !== userId);

        if (duplicates.length > 0) {
            return { success: false, error: "Phone number already linked to another account." };
        }

        await adminDb.runTransaction(async (t) => {
            const userRef = usersRef.doc(userId);
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const currentCredits = userData?.credits || 0;
            const isAlreadyVerified = userData?.isVerified || false;

            // Give +5 credits only if first time verifying
            if (!isAlreadyVerified) {
                const newCredits = currentCredits + 5;

                t.update(userRef, {
                    phoneNumber: phoneNumber,
                    isVerified: true,
                    credits: newCredits,
                    verifiedAt: new Date()
                });

                // Log the credit transaction
                const transactionRef = adminDb.collection("transactions").doc();
                t.set(transactionRef, {
                    userId,
                    amount: 5,
                    type: "bonus",
                    description: "Phone Verification Bonus",
                    createdAt: new Date()
                });
            } else {
                // Just update phone number if re-verifying (though usually blocked by UI)
                t.update(userRef, {
                    phoneNumber: phoneNumber,
                    verifiedAt: new Date()
                });
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Server verification error:", error);
        return { success: false, error: error.message || "Verification failed on server" };
    }
}
