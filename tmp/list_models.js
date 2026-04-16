import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

async function listModels() {
  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/VITE_GEMINI_API_KEY=([^\s]+)/);
    const apiKey = match ? match[1] : null;

    if (!apiKey) {
      console.error("API Key not found in .env.local");
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI.listModels();
    console.log("Available Models:");
    result.models.forEach((m) => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    if (error.status === 404) {
        console.error("The listModels endpoint returned 404. This often means the API key is restricted or the version is incompatible.");
    } else {
        console.error("Error listing models:", error);
    }
  }
}

listModels();
