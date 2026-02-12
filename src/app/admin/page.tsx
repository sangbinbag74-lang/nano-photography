
import { adminDb } from "@/lib/firebase-admin";

export default async function AdminDashboardPage() {
    // Fetch summary stats
    // Note: getCount() is more efficient for large collections if available in Node SDK, 
    // but standard list list might be heavy. For now we use standard queries or count aggregations.

    // Total Users
    const usersSnapshot = await adminDb.collection("users").count().get();
    const totalUsers = usersSnapshot.data().count;

    // Total Transactions Revenue (Approximation for MVP - fetching all might be heavy later)
    // Ideally use an aggregation query or keep a running counter in a 'stats' doc.
    // For now, let's just count transactions.
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
