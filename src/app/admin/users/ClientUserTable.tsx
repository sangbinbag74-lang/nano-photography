
"use client";

import { useState } from "react";
import { adjustUserCredits } from "../actions";
import { MoreHorizontal, Plus, Minus, Ban } from "lucide-react";
import { auth } from "@/lib/firebase"; // To get current admin email
import { useLanguage } from "@/lib/i18n";

export default function ClientUserTable({ initialUsers }: { initialUsers: any[] }) {
    const { t } = useLanguage();
    const [users, setUsers] = useState(initialUsers);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [creditAmount, setCreditAmount] = useState<string>("");
    const [creditReason, setCreditReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openCreditModal = (userId: string) => {
        setSelectedUserId(userId);
        setCreditAmount("");
        setCreditReason("");
        setIsModalOpen(true);
    };

    const handleCreditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !creditAmount || !creditReason) return;

        const amount = parseInt(creditAmount);
        if (isNaN(amount)) return;

        setIsSubmitting(true);

        // Optimistic update
        setUsers(users.map(u => u.id === selectedUserId ? { ...u, credits: u.credits + amount } : u));

        const result = await adjustUserCredits(selectedUserId, amount, creditReason, auth.currentUser?.email || "unknown");

        if (!result.success) {
            alert(t.admin.credit_modal.error);
            // Revert
            setUsers(users.map(u => u.id === selectedUserId ? { ...u, credits: u.credits - amount } : u));
        } else {
            alert(t.admin.credit_modal.success);
            setIsModalOpen(false);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{t.admin.users}</h2>
                    <p className="text-white/60">{t.admin.users_desc}</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/50">
                        <tr>
                            <th className="p-4 font-medium">{t.admin.table.email}</th>
                            <th className="p-4 font-medium">{t.admin.table.credits}</th>
                            <th className="p-4 font-medium">{t.admin.table.status}</th>
                            <th className="p-4 font-medium">{t.admin.table.created}</th>
                            <th className="p-4 font-medium text-right">{t.admin.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-white">{user.email}</div>
                                    <div className="text-xs text-white/40 font-mono">{user.id}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-lg">{user.credits}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {user.status === 'banned' ? t.admin.status.banned : t.admin.status.active}
                                    </span>
                                </td>
                                <td className="p-4 text-white/40">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => openCreditModal(user.id)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {t.admin.actions.add_credits}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Credit Adjustment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{t.admin.credit_modal.title}</h3>
                        <form onSubmit={handleCreditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">
                                    {t.admin.credit_modal.amount_label}
                                </label>
                                <input
                                    type="number"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    placeholder={t.admin.credit_modal.amount_placeholder}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">
                                    {t.admin.credit_modal.reason_label}
                                </label>
                                <input
                                    type="text"
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder={t.admin.credit_modal.reason_placeholder}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                                >
                                    {t.admin.credit_modal.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Processing..." : t.admin.credit_modal.confirm}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
