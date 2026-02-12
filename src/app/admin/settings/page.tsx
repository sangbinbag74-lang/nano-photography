
import { adminDb } from "@/lib/firebase-admin";
import ClientSettingsForm from "./ClientSettingsForm";

export default async function SettingsPage() {
    // Fetch current settings
    const doc = await adminDb.collection("system").doc("config").get();
    const settings = doc.exists ? doc.data() : {
        maintenanceMode: false,
        announcement: "",
        modelName: "gemini-1.5-flash"
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold">System Settings</h2>
                <p className="text-white/60">Configure global application behavior.</p>
            </div>

            <ClientSettingsForm initialSettings={JSON.parse(JSON.stringify(settings))} />
        </div>
    );
}
