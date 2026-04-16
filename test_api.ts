import { generateAIItinerary } from './services/gemini';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    console.log("Starting test...");
    const result = await generateAIItinerary("Plan a trip to Maldives");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error catched in test script:", error);
  }
}

test();
