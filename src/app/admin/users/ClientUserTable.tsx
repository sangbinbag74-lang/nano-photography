
"use client";

import { useState } from "react";
import { adjustUserCredits } from "../actions";
import { MoreHorizontal, Plus, Minus, Ban } from "lucide-react";
import { auth } from "@/lib/firebase"; // To get current admin email
import { useLanguage } from "@/lib/i18n";

export default function ClientUserTable({ initialUsers }: { initialUsers: any[] }) {
    const { t } = useLanguage();
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [creditAmount, setCreditAmount] = useState(0);

    const handleCreditAdjustment = async (userId: string, amount: number) => {
        if (!confirm(`Adjust credits by ${amount}?`)) return;

        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, credits: u.credits + amount } : u));

        const result = await adjustUserCredits(userId, amount, "Manual Adjustment", auth.currentUser?.email || "unknown");
        if (!result.success) {
            alert("Failed to update credits");
            // Revert
            setUsers(users.map(u => u.id === userId ? { ...u, credits: u.credits - amount } : u));
        }
    };

    return (
        <div className="space-y-6">
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
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleCreditAdjustment(user.id, 100)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-green-400"
                                            title={t.admin.actions.add_credits}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCreditAdjustment(user.id, -100)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                            title={t.admin.actions.add_credits} // Should be remove, but using same for now or generic
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
