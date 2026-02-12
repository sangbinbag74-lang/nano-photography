
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
            <div className="flex items-center gap-4">
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full border border-white/20"
                    />
                ) : (
                    <UserIcon className="w-8 h-8 p-1 rounded-full bg-white/10" />
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-lg"
        >
            <LogIn className="w-4 h-4" />
            Sign in with Google
        </button>
    );
}
