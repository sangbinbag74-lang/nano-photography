
import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(base64: string, path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        // Ensure base64 string is properly formatted for uploadString
        // If it already has data_url prefix, use it directly. 
        // If it's raw base64, usually uploadString handles 'base64' format, 
        // but 'data_url' is safer if the string includes "data:image/..."

        await uploadString(storageRef, base64, 'data_url');
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (e) {
        console.error("Error uploading image: ", e);
        throw e;
    }
}

export async function uploadFile(file: File, path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (e) {
        console.error("Error uploading file: ", e);
        throw e;
    }
}

export interface HistoryItem {
    id?: string;
    userId: string;
    originalImage: string; // Base64 or URL
    generatedImage: string; // Base64 or URL
    style: string;
    prompt: string;
    createdAt: Timestamp;
}

export async function saveToHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
    try {
        const docRef = await addDoc(collection(db, "history"), {
            ...item,
            createdAt: Timestamp.now(),
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}

export async function getUserHistory(userId: string): Promise<HistoryItem[]> {
    try {
        const q = query(
            collection(db, "history"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const history: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as HistoryItem);
        });
        return history;
    } catch (e) {
        console.error("Error getting documents: ", e);
        // If index is missing, it might throw. Handle gracefully or log.
        return [];
    }
}

export async function saveUser(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                credits: 0, // Default 0 (requires verification for +5)
                createdAt: Timestamp.now(),
                lastLogin: Timestamp.now(),
                status: "active",
                roles: ["user"]
            });
            console.log("User created in Firestore");
        } else {
            // Update last login
            await setDoc(userRef, {
                lastLogin: Timestamp.now()
            }, { merge: true });
        }
    } catch (e) {
        console.error("Error saving user: ", e);
    }
}

export async function verifyUserPhone(userId: string, phoneNumber: string) {
    try {
        const userRef = doc(db, "users", userId);

        // Check if phone number is already used by another user
        const q = query(collection(db, "users"), where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(q);

        // Filter out self-match if re-verifying
        const duplicates = querySnapshot.docs.filter(doc => doc.id !== userId);

        if (duplicates.length > 0) {
            throw new Error("Phone number already linked to another account.");
        }

        const userSnap = await getDoc(userRef);
        const currentCredits = userSnap.data()?.credits || 0;
        const isAlreadyVerified = userSnap.data()?.isVerified || false;

        // Give +5 credits only if first time verifying
        const newCredits = isAlreadyVerified ? currentCredits : currentCredits + 5;

        await setDoc(userRef, {
            phoneNumber: phoneNumber,
            isVerified: true,
            credits: newCredits
        }, { merge: true });

        console.log("User verified:", userId);
        return { success: true };
    } catch (e: any) {
        console.error("Error verifying user: ", e);
        throw e;
    }
}
