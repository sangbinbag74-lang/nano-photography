import { adminDb } from "@/lib/firebase-admin";
import ClientAdminDashboard from "./ClientAdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    try {
        // Fetch summary stats
        // Total Users
        // Check if adminDb is initialized? 
        // If firebase-admin failed to init, accessing collection might throw.

        const usersSnapshot = await adminDb.collection("users").count().get();
        const totalUsers = usersSnapshot.data().count;

        // Total Transactions
        const transactionsSnapshot = await adminDb.collection("transactions").count().get();
        const totalTransactions = transactionsSnapshot.data().count;

        // Total Generated Images
        const historySnapshot = await adminDb.collection("history").count().get();
        const totalImages = historySnapshot.data().count;

        return (
            <ClientAdminDashboard stats={{ totalUsers, totalTransactions, totalImages }} />
        );
    } catch (error: any) {
        console.error("Dashboard Load Error:", error);
        return (
            <div className="p-8 border border-red-500/50 bg-red-500/10 rounded-xl text-red-200">
                <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
                <p>Failed to load dashboard data. This is usually caused by missing environment variables in production.</p>
                <p className="mt-4 font-mono text-sm bg-black/50 p-4 rounded text-red-300 overflow-x-auto">
                    {error.message || JSON.stringify(error)}
                </p>
                <div className="mt-4 text-sm text-white/50">
                    Please check Vercel Environment Variables:
                    <ul className="list-disc list-inside mt-2">
                        <li>GOOGLE_CLIENT_EMAIL</li>
                        <li>GOOGLE_PRIVATE_KEY</li>
                        <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                    </ul>
                </div>
            </div>
        );
    }
}


