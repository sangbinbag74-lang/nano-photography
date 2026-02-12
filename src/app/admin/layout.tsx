
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase"; // Shared firebase auth instance
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { LayoutDashboard, Users, Images, CreditCard, Settings, LogOut, Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Check if email is in the allowed list
                // Fetch the list from an API route or check against a hardcoded list exposed via env
                // Note: deeply secure checks should happen on server actions/API routes too.
                // For layout protection, we use client-side check for UX.

                // We need a way to check env var on client safely, or call a server action.
                // Let's call a server action or simple API to verify admin status to avoid exposing all admin emails to client.
                checkAdminStatus(currentUser.email).then((isAdmin) => {
                    if (isAdmin) {
                        setIsAuthorized(true);
                    } else {
                        router.push("/"); // Redirect unauthorized
                    }
                    setLoading(false);
                });
            } else {
                router.push("/"); // Redirect unauthenticated
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Don't verify anything while redirecting
    }

    return (
        <div className="flex h-screen bg-black text-white selection:bg-white/20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        Nano Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/admin/users" icon={Users} label="Users" />
                    <NavItem href="/admin/gallery" icon={Images} label="Gallery" />
                    <NavItem href="/admin/transactions" icon={CreditCard} label="Transactions" />
                    <NavItem href="/admin/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-white/40">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-grid-white/[0.02]">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 group"
        >
            <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            {label}
        </Link>
    );
}

// Helper to check admin status
// In a real app, this should be a Server Action or API call
async function checkAdminStatus(email: string | null | undefined) {
    if (!email) return false;
    try {
        const response = await fetch('/api/admin/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return data.isAdmin;
    } catch (e) {
        console.error("Failed to check admin status", e);
        return false;
    }
}
