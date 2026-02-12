
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function adjustUserCredits(userId: string, amount: number, reason: string, adminEmail: string) {
    if (!userId || !amount) {
        throw new Error("Missing required fields");
    }

    try {
        await adminDb.runTransaction(async (t) => {
            const userRef = adminDb.collection("users").doc(userId);
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const currentCredits = userDoc.data()?.credits || 0;
            const newCredits = currentCredits + amount;

            t.update(userRef, { credits: newCredits });

            // Log the admin action
            const actionRef = adminDb.collection("admin_actions").doc();
            t.set(actionRef, {
                action: "adjust_credits",
                targetUserId: userId,
                amount,
                reason,
                adminEmail,
                timestamp: new Date(),
            });
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to adjust credits:", error);
        return { success: false, error: "Failed to adjust credits" };
    }
}

export async function banUser(userId: string, reason: string, adminEmail: string) {
    // Implementation for banning user
    try {
        await adminDb.collection("users").doc(userId).update({
            status: "banned",
            banReason: reason,
            bannedBy: adminEmail,
            bannedAt: new Date()
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to ban user:", error);
        return { success: false, error: "Failed to ban user" };
    }
}
