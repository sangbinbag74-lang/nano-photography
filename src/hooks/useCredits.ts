"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase"; // Adjust import path
import { onAuthStateChanged, User } from "firebase/auth";

export function useCredits() {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setCredits(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setCredits(doc.data().credits || 0);
            } else {
                setCredits(0);
            }
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
    }, [user]);

    return { credits, loading };
}
