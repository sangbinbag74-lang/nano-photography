
"use client";

import { signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { saveUser, verifyUserPhone } from "@/lib/firestore";
import { useState, useEffect } from "react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import PhoneVerificationModal from "./PhoneVerificationModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GoogleLoginButton() {
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [pendingUser, setPendingUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check verification status
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists() && !userSnap.data().isVerified) {
                    setPendingUser(currentUser);
                    setShowVerification(true);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                await saveUser(result.user);

                // Trigger verification Check
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.data()?.isVerified) {
                    setPendingUser(result.user);
                    setShowVerification(true);
                }
            }
        } catch (error: any) {
            console.error("Login failed", error);
            const errorMessage = error?.message || "Unknown error";
            const errorCode = error?.code || "No code";
            alert(`Login Failed: ${errorMessage} (${errorCode})`);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setPendingUser(null);
            setShowVerification(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleVerificationSuccess = async (phoneNumber: string) => {
        if (!pendingUser) return;
        try {
            await verifyUserPhone(pendingUser.uid, phoneNumber);
            // Refresh user state logic if needed, but Firestore listener should handle data updates elsewhere
            alert("Verification Successful! 5 Free credits added.");
            setShowVerification(false);
        } catch (error: any) {
            alert(error.message || "Verification linking failed");
        }
    };

    if (user) {
        return (
            <>
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
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider leading-none mb-0.5">{t.auth.signed_in_as}</span>
                        <span className="text-xs text-white/90 font-medium leading-none truncate max-w-[100px]">{user.displayName}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>

                <PhoneVerificationModal
                    isOpen={showVerification}
                    onClose={() => setShowVerification(false)}
                    onVerified={handleVerificationSuccess}
                />
            </>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="group flex items-center gap-3 px-6 py-2.5 bg-white text-black font-medium text-sm rounded-full hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
        >
            <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="tracking-wide">{t.auth.sign_in_google}</span>
        </button>
    );
}
