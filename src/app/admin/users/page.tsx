import { adminDb } from "@/lib/firebase-admin";
import { adjustUserCredits } from "../actions";
import ClientUserTable from "./ClientUserTable";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    // Fetch all users
    // For large scale, we need cursor-based pagination.
    // implementing simple limit of 50 for now.
    const snapshot = await adminDb.collection("users")
        .orderBy("createdAt", "desc") // Assuming createdAt exists, if not might need to fallback
        .limit(50)
        .get();

    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || "No Email",
        credits: doc.data().credits || 0,
        createdAt: doc.data().createdAt?.toDate().toISOString() || "Unknown",
        lastActive: doc.data().lastLogin?.toDate().toISOString() || "Unknown",
        status: doc.data().status || "active",
        ...doc.data()
    }));

    return (
        <div className="space-y-6">
            <ClientUserTable initialUsers={JSON.parse(JSON.stringify(users))} />
        </div>
    );
}

