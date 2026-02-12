
import { adminDb } from "@/lib/firebase-admin";
import ClientGalleryGrid from "./ClientGalleryGrid";

export default async function GalleryAdminPage() {
    // Fetch latest images
    const snapshot = await adminDb.collection("history")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

    const images = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Serialize dates
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Content Moderation</h2>
                    <p className="text-white/60">Review and delete generated images.</p>
                </div>
            </div>

            <ClientGalleryGrid initialImages={JSON.parse(JSON.stringify(images))} />
        </div>
    );
}
