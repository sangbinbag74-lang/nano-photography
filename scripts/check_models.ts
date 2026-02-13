
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("GOOGLE_API_KEY not found in .env");
    process.exit(1);
}

// We will use raw fetch to be 100% sure what the API returns, 
// as SDK might wrap/filter things.
async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        const fs = require('fs');
        if (data.models) {
            fs.writeFileSync('models.json', JSON.stringify(data.models, null, 2));
            console.log("Models written to models.json");
        } else {
            console.log("No models found in response:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
