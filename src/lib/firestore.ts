
import { ref, uploadString, getDownloadURL } from "firebase/storage";
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
    console.log("Attempting to save user:", user.uid, user.email);
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("User does not exist, creating new user document...");
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                credits: 5, // Default credits
                createdAt: Timestamp.now(),
                lastLogin: Timestamp.now(),
                status: "active",
                roles: ["user"]
            });
            console.log("User created in Firestore successfully.");
        } else {
            console.log("User exists, updating last login...");
            // Update last login
            await setDoc(userRef, {
                lastLogin: Timestamp.now()
            }, { merge: true });
            console.log("User last login updated.");
        }
    } catch (e) {
        console.error("Error saving user to Firestore: ", e);
        throw e; // Re-throw to catch in component
    }
}
