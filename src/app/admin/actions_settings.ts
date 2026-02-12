
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

interface SystemSettings {
    maintenanceMode: boolean;
    announcement: string;
    modelName: string;
}

export async function saveSettings(settings: SystemSettings, adminEmail: string) {
    try {
        await adminDb.collection("system").doc("config").set(settings, { merge: true });

        // Log action
        await adminDb.collection("admin_actions").add({
            action: "update_settings",
            settings,
            adminEmail,
            timestamp: new Date()
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to save settings:", error);
        return { success: false, error: "Failed to save settings" };
    }
}
