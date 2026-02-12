
"use client";

import { signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function GoogleLoginButton() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please inspect console.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-4 p-1 pr-2 rounded-full glass border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300">
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full border border-white/10"
                    />
                ) : (
                    <UserIcon className="w-8 h-8 p-1.5 rounded-full bg-white/10 text-white/70" />
                )}
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider leading-none mb-0.5">Signed in as</span>
                    <span className="text-xs text-white/90 font-medium leading-none truncate max-w-[100px]">{user.displayName}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="group flex items-center gap-3 px-6 py-2.5 bg-white text-black font-medium text-sm rounded-full hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
        >
            <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="tracking-wide">Sign in</span>
        </button>
    );
}
