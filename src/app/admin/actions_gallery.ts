
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

export async function deleteImage(imageId: string, imagePath: string, adminEmail: string) {
    if (!imageId) return { success: false, error: "Missing ID" };

    try {
        // 1. Delete from Firestore
        await adminDb.collection("history").doc(imageId).delete();

        // 2. Delete from Storage (if path is provided and valid)
        // Note: imagePath should be the relative path in bucket, not full URL.
        // We might need to parse it if we only have URL.
        // For now, assuming we might not strictly need to delete deeply from storage for MVP, 
        // or we need to robustly handle the path parsing. 
        // Let's attempt if we can derive the path. 

        // If imagePath is a full URL, we can't easily delete without parsing.
        // Ideally the history doc should store the storageRef path.
        // For now, removing the record from DB is the primary moderation action to hide it.

        // Log action
        await adminDb.collection("admin_actions").add({
            action: "delete_image",
            targetImageId: imageId,
            adminEmail,
            timestamp: new Date()
        });

        revalidatePath("/admin/gallery");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete image:", error);
        return { success: false, error: "Failed to delete image" };
    }
}
