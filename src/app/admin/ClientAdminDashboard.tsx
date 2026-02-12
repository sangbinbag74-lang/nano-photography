"use client";

import { useLanguage } from "@/lib/i18n";

interface DashboardStats {
    totalUsers: number;
    totalTransactions: number;
    totalImages: number;
}

export default function ClientAdminDashboard({ stats }: { stats: DashboardStats }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t.admin.dashboard}</h2>
                <p className="text-white/60 mt-2">{t.admin.stats.status_desc}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t.admin.stats.total_users}
                    value={stats.totalUsers.toLocaleString()}
                    description={t.admin.stats.users_desc}
                />
                <StatCard
                    title={t.admin.stats.total_images}
                    value={stats.totalImages.toLocaleString()}
                    description={t.admin.stats.images_desc}
                />
                <StatCard
                    title={t.admin.stats.total_transactions}
                    value={stats.totalTransactions.toLocaleString()}
                    description={t.admin.stats.transactions_desc}
                />
                <StatCard
                    title={t.admin.stats.system_status}
                    value="Target Normal"
                    description={t.admin.stats.status_desc}
                    isGreen
                />
            </div>

            {/* Future: Revenue Chart */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-96 flex items-center justify-center">
                <p className="text-white/30">{t.admin.stats.revenue_chart}</p>
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
