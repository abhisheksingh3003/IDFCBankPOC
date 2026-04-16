import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

// Read API KEY from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = match ? match[1].trim() : "";

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const result = await genAI.listModels();
    console.log("Available Models:");
    result.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
