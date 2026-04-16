import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.VITE_GEMINI_API_KEY || "";

async function listModels() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const models = await genAI.listModels();
  console.log("Available Models:");
  for (const model of models.models) {
    console.log(model.name);
  }
}

listModels().catch(console.error);
