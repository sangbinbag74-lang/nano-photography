
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
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
