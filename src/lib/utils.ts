
export async function removeBackground(file: File): Promise<string> {
    // TODO: Integrate with a background removal API (e.g., remove.bg or specialized model)
    // For MVP, we might skip this or use a placeholder if no API key is provided.

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
