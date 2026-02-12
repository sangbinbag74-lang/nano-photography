import { adminDb } from "@/lib/firebase-admin";

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
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-white/60 mt-2">Overview of system health and performance.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={totalUsers.toLocaleString()}
                        description="Registered accounts"
                    />
                    <StatCard
                        title="Total Images"
                        value={totalImages.toLocaleString()}
                        description="Generated via AI"
                    />
                    <StatCard
                        title="Transactions"
                        value={totalTransactions.toLocaleString()}
                        description="Total payments processed"
                    />
                    <StatCard
                        title="System Status"
                        value="Target Normal"
                        description="All systems operational"
                        isGreen
                    />
                </div>

                {/* Future: Revenue Chart */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-96 flex items-center justify-center">
                    <p className="text-white/30">Revenue Chart Coming Soon</p>
                </div>
            </div>
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

function StatCard({ title, value, description, isGreen }: { title: string, value: string, description: string, isGreen?: boolean }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-sm font-medium text-white/50">{title}</h3>
            <div className={`mt-2 text-3xl font-bold tracking-tight ${isGreen ? 'text-green-400' : 'text-white'}`}>
                {value}
            </div>
            <p className="mt-1 text-xs text-white/40">{description}</p>
        </div>
    );
}
