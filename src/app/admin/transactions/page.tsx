
import { adminDb } from "@/lib/firebase-admin";

export default async function TransactionsPage() {
    // Fetch latest transactions
    const snapshot = await adminDb.collection("transactions")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

    const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Serialize dates
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Transactions</h2>
                    <p className="text-white/60">Payment history and revenue log.</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/50">
                        <tr>
                            <th className="p-4 font-medium">Transaction ID</th>
                            <th className="p-4 font-medium">User ID</th>
                            <th className="p-4 font-medium">Amount</th>
                            <th className="p-4 font-medium">Credits</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-xs text-white/60">{tx.transactionId || tx.id}</td>
                                <td className="p-4 font-mono text-xs text-white/60">{tx.uid}</td>
                                <td className="p-4 font-medium">
                                    {tx.amount} {tx.currency}
                                </td>
                                <td className="p-4 text-green-400">+{tx.creditsAdded}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="p-4 text-white/40">
                                    {new Date(tx.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
