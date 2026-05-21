import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Force-reset on every module reload (Vite HMR) so model changes take effect immediately
let genAI: any = null;
let model: any = null;

// Clear stale singleton on HMR
if ((import.meta as any).hot) {
  (import.meta as any).hot.dispose(() => {
    genAI = null;
    model = null;
  });
}

const SYSTEM_INSTRUCTION = `
  You are Anya, a premium AI travel assistant for IDFC First Bank.
  
  SPEED_PRIORITY: Output JSON immediately. Minimal reasoning.
  BREVITY_RULE: Be extremely concise. Max 2 short, direct sentences. No flowery greetings or filler.
  LANGUAGE: ALL responses MUST be in English.
  PERSONALITY: Empathetic, premium. Acknowledge family relations naturally.

  MANDATORY DISCOVERY PHASES (DO NOT skip and strictly ask one question at a time):
  1. **Location** (Source & Destination)
  2. **Dates** (Trigger 'showCalendar'. Resolve relative dates like "next week")
  3. **Travelers & Ages** (Acknowledge relations. IF the count is unclear, trigger 'showPassengerStepper'. If kids are mentioned, trigger 'showAgeInput' ONLY if their ages haven't been provided.)
  4. **Origin & Budget** (Ask about budget range and home city. Trigger 'quickReplies' for budget, e.g., Value/Mid-range/Premium/No Limit)
  5. **Trip Pace** (Trigger 'quickReplies' for Relaxed/Balanced/Packed)
  6. **Companion A Interests** (Ask specifically about one person mentioned, e.g., "What does your daughter enjoy?")
  7. **Companion B Interests** (Ask about another person, e.g., "What experiences are important for your wife?")
  8. **Must-Visits** (Are there specific places or experiences they already have in mind?)
  9. **Logistics & Extras** (Hotel style, transfers, tickets, restaurant types)

  GATHERING RULES (CRITICAL):
  - STRICTLY ASK ONLY ONE QUESTION AT A TIME. DO NOT ask multiple things in one message.
  - Set 'itineraryItems' to [] in EVERY response until ALL 9 PHASES ARE COMPLETE.
  - DO NOT say "I'm ready" or generate a partial plan. Keep gathering info.
  - **Inline UI (GenUI)**: When asking for dates, travelers, or ages, set the corresponding 'show...' flags. This will trigger an interactive tool in the chat.
  - **Information Inference**: ALWAYS try to infer information from the conversation history or **USER_PROFILE** (if provided) before asking.
    - If the user's budget style or pace preference is in the USER_PROFILE, SKIP phases 4 (budget) and 5 (pace) unless they contradict the current request.
    - For Travelers: Count EVERY person mentioned. "Me, my wife and my daughter" = 3. "Me and my husband" = 2. "Me, my partner and our 3 kids" = 5.
    - If family relations are mentioned (son, daughter, child, wife, husband), acknowledge them warmly.
    - If the user says "we are 4", travelers = 4.
    - If kids are mentioned, separate them into the 'travelerBreakdown'.
    - For Dates: Use "Today's Date" (provided in the prompt) as the absolute reference. If the user says "next Monday", calculate the exact YYYY-MM-DD.
    - Only set 'showPassengerStepper', 'showCalendar', or 'showAgeInput' to true when ACTIVELY requesting that specific information.
  - If information is inferred from the profile or history, acknowledge it naturally and move to the next missing piece of info.
  - If the user provides info for multiple phases at once, move to the next missing phase.
  - TRACK which phases are complete using the conversation history and profile. Never re-ask for information already provided.

  PHASE TRACKING (check the PHASE_STATUS provided in each prompt):
  - Phase 1 complete if: destination mentioned
  - Phase 2 complete if: dates or duration mentioned
  - Phase 3 complete if: traveler count and ages clear
  - Phase 4 complete if: origin city and budget mentioned
  - Phase 5 complete if: pace preference mentioned
  - Phase 6 complete if: first companion interests mentioned
  - Phase 7 complete if: second companion interests mentioned (skip if solo traveler)
  - Phase 8 complete if: must-visit places mentioned or user says none
  - Phase 9 complete if: hotel style and extras preferences mentioned

  QUICK REPLIES (CRITICAL):
  - Whenever you ask a discovery question (Phases 1-9), you MUST provide 2-3 standard, helpful 'quickReplies'.
  - These should be the most likely responses or meaningful options.
  - Examples:
    - Phase 4 (Budget): [{"label": "Value", "value": "value"}, {"label": "Mid-range", "value": "midrange"}, {"label": "Premium", "value": "premium"}]
    - Phase 5 (Pace): [{"label": "Relaxed", "value": "relaxed"}, {"label": "Balanced", "value": "balanced"}, {"label": "Packed", "value": "packed"}]
    - Phase 9 (Hotels): [{"label": "Modern", "value": "modern"}, {"label": "Historic", "value": "historic"}, {"label": "Resort", "value": "resort"}]

  GENERATION RULES (ONLY after Phase 9 is complete):
  - Generate full plan (Flight, Hotel, Activities, Transfers, Essentials).
  - FULL COVERAGE: Items for EVERY day. Include return flight on last day.
  - DEB_TAILORING: Use the specific interests gathered (names, places, styles) for activity variety.
  SAFETY_RULE: 🛡️ STRICTLY FORBIDDEN to generate any content (text or image keywords) related to nudity, violence, abuse, drugs, or illegal activities. ALL descriptions must be professional, high-end, and family-safe.
  
  - IMAGES: Use 'keyword:topic-city' format. DO NOT generate full URLs.
    - Be EXTREMELY SPECIFIC with keywords to ensure unique images.
    - For Transfers: 'keyword:private-chauffeur-black-sedan-paris-night'.
    - For Activities: 'keyword:louvre-pyramid-sunset-museum-tour'.
    - For Flight: 'keyword:luxury-airline-business-class-flatbed-seat'.
    - For Hotels: 'keyword:modern-minimalist-hotel-lobby-dubai'.
  
  REALISTIC PRICING GUIDELINES (in INR):
  - International Flights (Middle East/Asia/America/Europe): INR 60,000 - 2,50,000 per person.
  - Short-haul Flights: INR 15,000 - 45,000 per person.
  - Premium Hotels: INR 45,000 - 1,80,000 per night.
  - Elite Activities: INR 5,000 - 90,000 per experience.
  - Airport Transfers (Private): INR 4,000 - 15,000.
  - Essentials (Insurance): INR 3,000 - 9,000.

  - For Activities: {Type} • {Duration} • {Time Slot}
    - Example: Experience • 4 hours • Morning
  
  - **ALTERNATIVES (CRITICAL)**: For every itinerary item, you MUST generate a set of alternatives:
    - For 'flight': Generate 'flightAlternatives' (at least 4 options including the primary one).
    - For 'hotel': Generate 'hotelAlternatives' (at least 4 options including the primary one).
    - For 'activity': Generate 'activityAlternatives' (at least 6 options including the primary one).
    - Each alternative must match the schema for that type.
  
  - **BOOKABLE VS INFORMATIONAL (CRITICAL)**: 
    - If an activity is a paid experience that requires booking (e.g., Museum Tour, Spa Day, Private Cruise), assign a realistic price > 0.
    - If an activity is a general suggestion or a free public attraction (e.g., "Explore Old Dubai Souks", "Window shopping at Dubai Mall", "Evening stroll at Trevi Fountain"), set the **price to 0**. 
    - Items with price 0 will be displayed as informational itinerary markers and will NOT be bookable by the user.
  
  - **DAY DESCRIPTIONS (CRITICAL)**: For EVERY day in the trip, generate a 'dayDescriptions' entry with:
    - 'dayGroup': Must match the itineraryItems dayGroup exactly (e.g., 'Day 1')
    - 'theme': A catchy title for the day (e.g., 'Arrival in London + easy first evening')
    - 'description': 1-2 sentences explaining why the day is structured this way
    - 'inclusions': Array of 3-6 key experiences/sights included in this day
    - 'whyThisWorks': A thoughtful 1-2 sentence explanation of why this day's plan suits the travelers
    - 'diningTips': Array of 2-3 recommended restaurants for this day. Each restaurant should have a 'name', 'type' (cuisine), 'description' (concise 1-sentence highlight), 'priceRange' ('$', '$$', or '$$$'), and 'imageKeyword' (e.g., 'keyword:ristorante-roma').
  - Also generate 'tripSummary': A 2-3 sentence paragraph summarizing the whole trip.
  - Also generate 'advanceBookItems': Array of items that should be booked in advance with ticket details.

  Output ONLY valid JSON matching the schema exactly.
`;

const SCHEMA: any = {
  description: "Travel itinerary and curation data",
  type: SchemaType.OBJECT,
  properties: {
    aiMessage: {
      type: SchemaType.STRING,
      description: "A friendly message from Anya describing the trip highlights or asking the next discovery question."
    },
    itineraryItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: {
            type: SchemaType.STRING,
            enum: ["flight", "hotel", "activity", "transfer", "insurance", "essentials"]
          },
          title: { type: SchemaType.STRING },
          subtitle: { type: SchemaType.STRING, description: "Strictly follow `{A} • {B} • {C}` pattern." },
          price: { type: SchemaType.NUMBER },
          image: { type: SchemaType.STRING },
          badge: { type: SchemaType.STRING },
          dayGroup: { type: SchemaType.STRING, description: "e.g., 'Day 1', 'Day 2', or 'Trip Essentials'" },
          billingType: { type: SchemaType.STRING, enum: ["business", "personal"] },
          flightAlternatives: {
            type: SchemaType.ARRAY,
            description: "At least 4 flight options. Only for type 'flight'.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                airline: { type: SchemaType.STRING },
                airlineLogo: { type: SchemaType.STRING },
                departureTime: { type: SchemaType.STRING },
                arrivalTime: { type: SchemaType.STRING },
                price: { type: SchemaType.NUMBER },
                duration: { type: SchemaType.STRING },
                originIata: { type: SchemaType.STRING },
                destinationIata: { type: SchemaType.STRING }
              },
              required: ["id", "airline", "airlineLogo", "departureTime", "arrivalTime", "price", "duration", "originIata", "destinationIata"]
            }
          },
          hotelAlternatives: {
            type: SchemaType.ARRAY,
            description: "At least 4 hotel options. Only for type 'hotel'.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                name: { type: SchemaType.STRING },
                rating: { type: SchemaType.NUMBER },
                imageUrl: { type: SchemaType.STRING },
                pricePerNight: { type: SchemaType.NUMBER },
                description: { type: SchemaType.STRING },
                address: { type: SchemaType.STRING }
              },
              required: ["id", "name", "rating", "imageUrl", "pricePerNight", "description"]
            }
          },
          activityAlternatives: {
            type: SchemaType.ARRAY,
            description: "At least 6 activity options. Only for type 'activity'.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                name: { type: SchemaType.STRING },
                duration: { type: SchemaType.STRING },
                price: { type: SchemaType.NUMBER },
                imageUrl: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING }
              },
              required: ["id", "name", "duration", "price", "imageUrl", "category"]
            }
          }
        },
        required: ["id", "type", "title", "subtitle", "price", "image"]
      }
    },
    dayDescriptions: {
      type: SchemaType.ARRAY,
      description: "Rich narrative content for each day. Generate one entry per day when producing the final itinerary. Leave as empty array during discovery phases.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          dayGroup: { type: SchemaType.STRING, description: "Must match itineraryItems dayGroup, e.g., 'Day 1'" },
          theme: { type: SchemaType.STRING, description: "Catchy day title, e.g., 'Arrival in London + easy first evening'" },
          description: { type: SchemaType.STRING, description: "1-2 sentence overview of the day" },
          inclusions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3-6 key experiences/sights included"
          },
          whyThisWorks: { type: SchemaType.STRING, description: "1-2 sentences explaining why this day suits the travelers" },
          diningTips: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING, description: "Specific restaurant name" },
                description: { type: SchemaType.STRING, description: "1-sentence highlight" },
                type: { type: SchemaType.STRING, description: "Cuisine or style, e.g., 'Italian', 'Fine Dining'" },
                priceRange: { type: SchemaType.STRING, description: "Price level: '$' (Cheap), '$$' (Budget), '$$$' (Expensive)" },
                imageKeyword: { type: SchemaType.STRING, description: "Keyword for image search, e.g., 'keyword:ristorante-roma'" }
              },
              required: ["name", "type", "description", "priceRange", "imageKeyword"]
            },
            description: "2-3 recommended restaurants"
          }
        },
        required: ["dayGroup", "theme", "description", "inclusions", "whyThisWorks", "diningTips"]
      }
    },
    tripSummary: { type: SchemaType.STRING, description: "2-3 sentence paragraph summarizing the complete trip. Empty during discovery." },
    advanceBookItems: {
      type: SchemaType.ARRAY,
      description: "Items that should be booked in advance. Empty during discovery.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          item: { type: SchemaType.STRING, description: "Name of the item to book" },
          detail: { type: SchemaType.STRING, description: "Booking detail or tip" }
        },
        required: ["item", "detail"]
      }
    },
    tripName: { type: SchemaType.STRING },
    destinationName: { type: SchemaType.STRING },
    startDate: { type: SchemaType.STRING },
    endDate: { type: SchemaType.STRING },
    travelers: { type: SchemaType.NUMBER },
    travelerBreakdown: {
      type: SchemaType.OBJECT,
      properties: {
        adults: { type: SchemaType.NUMBER },
        children: { type: SchemaType.NUMBER }
      },
      description: "Breakdown of travelers if mentioned."
    },
    origin: { type: SchemaType.STRING },
    quickReplies: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING }
        },
        required: ["label", "value"]
      }
    },
    showCalendar: { type: SchemaType.BOOLEAN, description: "Set to true ONLY when asking for travel dates." },
    showAgeInput: { type: SchemaType.BOOLEAN, description: "Set to true ONLY when specifically asking for children's ages." },
    showPassengerStepper: { type: SchemaType.BOOLEAN, description: "Set to true ONLY when asking for traveler counts." }
  },
  required: ["aiMessage", "itineraryItems", "dayDescriptions", "tripName", "destinationName", "showCalendar", "showAgeInput", "showPassengerStepper"]
};

function getModel() {
  const API_KEY =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== "undefined" ? process.env.VITE_GEMINI_API_KEY : "") ||
    "";

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];

    model = genAI.getGenerativeModel({
      // gemini-2.5-flash — latest, fastest flash model with excellent multi-turn chat.
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        maxOutputTokens: 8192,
        temperature: 0.3,
      },
      safetySettings,
    });
  }
  return model;
}

/**
 * Converts internal chat history into the format Gemini expects.
 *
 * KEY FIX: Model turns send the FULL JSON response (not just aiMessage text).
 * This ensures the model can see its own structured state across turns — which
 * phases are complete, what destination/dates/travelers were already set, etc.
 * Without this, the model loses track of context and re-asks questions.
 */
function buildGeminiHistory(history: any[]): { role: string; parts: { text: string }[] }[] {
  const result: { role: string; parts: { text: string }[] }[] = [];

  for (const msg of history) {
    if (msg.sender === "user") {
      const text = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (text.trim()) {
        result.push({ role: "user", parts: [{ text }] });
      }
    } else if (msg.sender === "ai") {
      // Send the full JSON state so the model sees its own structured output
      // and can track which phases are complete.
      let aiText = "";
      if (msg.value) {
        // msg.value contains the full JSON response string
        aiText = msg.value;
      } else if (typeof msg.content === "string") {
        aiText = msg.content;
      }

      if (aiText.trim()) {
        result.push({ role: "model", parts: [{ text: aiText }] });
      }
    }
  }

  return result;
}

/**
 * Builds a comprehensive phase-tracking summary from the full conversation.
 * Scans ALL AI responses to build a cumulative picture of what's been gathered.
 * This is injected into every user prompt so the model has a clear checklist.
 */
function buildPhaseTracker(history: any[]): string {
  // Accumulate state from all AI responses
  const state: Record<string, any> = {};
  const userMessages: string[] = [];

  for (const msg of history) {
    if (msg.sender === "ai" && msg.value) {
      try {
        const parsed = JSON.parse(msg.value);
        // Merge non-empty fields into cumulative state
        if (parsed.destinationName) state.destinationName = parsed.destinationName;
        if (parsed.startDate) state.startDate = parsed.startDate;
        if (parsed.endDate) state.endDate = parsed.endDate;
        if (parsed.travelers) state.travelers = parsed.travelers;
        if (parsed.origin) state.origin = parsed.origin;
        if (parsed.tripName) state.tripName = parsed.tripName;
      } catch { /* ignore parse errors */ }
    } else if (msg.sender === "user") {
      const text = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (text.trim()) userMessages.push(text);
    }
  }

  // Build a comprehensive status report
  const lines: string[] = ["PHASE_STATUS (do NOT re-ask for completed phases):"];

  // Phase 1: Location
  if (state.destinationName) {
    lines.push(`  ✅ Phase 1 (Location): COMPLETE — Destination: ${state.destinationName}`);
  } else {
    lines.push(`  ❌ Phase 1 (Location): INCOMPLETE — ask for destination`);
  }

  // Phase 2: Dates
  if (state.startDate && state.endDate) {
    lines.push(`  ✅ Phase 2 (Dates): COMPLETE — ${state.startDate} to ${state.endDate}`);
  } else {
    lines.push(`  ❌ Phase 2 (Dates): INCOMPLETE`);
  }

  // Phase 3: Travelers
  if (state.travelers) {
    lines.push(`  ✅ Phase 3 (Travelers): COMPLETE — ${state.travelers} travelers`);
  } else {
    lines.push(`  ❌ Phase 3 (Travelers): INCOMPLETE`);
  }

  // Phase 4: Origin & Budget
  if (state.origin) {
    lines.push(`  ✅ Phase 4 (Origin): COMPLETE — Origin: ${state.origin}`);
  } else {
    lines.push(`  ❌ Phase 4 (Origin & Budget): INCOMPLETE`);
  }

  // Phases 5-9: These are tracked by conversation content, not structured state
  // We'll note all user messages so the model can check them
  if (userMessages.length > 0) {
    lines.push(`\nUSER RESPONSES SO FAR (${userMessages.length} messages):`);
    userMessages.forEach((m, i) => lines.push(`  ${i + 1}. "${m}"`));
  }

  return lines.join("\n") + "\n\n";
}

export async function generateAIItinerary(userPrompt: string, history: any[] = [], user?: any | null) {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const currentModel = getModel();

      // Build clean history for Gemini (model turns = full JSON state)
      const geminiHistory = buildGeminiHistory(history);

      // Comprehensive phase-tracking summary
      const phaseTracker = buildPhaseTracker(history);

      const chat = currentModel.startChat({ history: geminiHistory });

      const today = new Date().toDateString();
      const profileStr = user ? `USER_PROFILE: ${JSON.stringify(user)}\n` : '';
      const contextualPrompt = `Today's Date: ${today}.\n${profileStr}${phaseTracker}User: ${userPrompt}`;

      console.time("Gemini Latency");
      console.log(`[Gemini] Attempt ${attempt + 1}, history turns: ${geminiHistory.length}, prompt length: ${contextualPrompt.length}`);
      const result = await chat.sendMessage(contextualPrompt);
      const response = await result.response;
      console.timeEnd("Gemini Latency");

      // Safety block check
      if (response.promptFeedback?.blockReason) {
        console.warn("Prompt blocked by safety:", response.promptFeedback);
        throw new Error("BLOCKED_BY_SAFETY");
      }

      const text = response.text();
      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }

      // Attempt parse with progressive fallback
      return parseJsonResponse(text);
    } catch (error: any) {
      lastError = error;
      const msg = error.message?.toLowerCase() ?? "";

      // Don't retry on non-transient errors
      if (msg.includes("quota") || msg.includes("429")) throw new Error("QUOTA_EXCEEDED");
      if (msg.includes("404") || msg.includes("not found")) throw new Error("MODEL_NOT_FOUND");
      if (msg.includes("blocked_by_safety")) throw error;

      // Retry on transient errors (network, 500, parse failures)
      if (attempt < maxRetries) {
        const backoff = (attempt + 1) * 1000;
        console.warn(`[Gemini] Attempt ${attempt + 1} failed (${error.message}), retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
    }
  }

  console.error("Gemini API Error after retries:", lastError);
  throw lastError;
}

function parseJsonResponse(text: string): any {
  // 1. Direct parse
  try {
    return JSON.parse(text.trim());
  } catch (_) { /* fall through */ }

  // 2. Extract from markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) { /* fall through */ }
  }

  // 3. Extract outermost { ... }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(text.substring(first, last + 1).trim());
    } catch (_) { /* fall through */ }
  }

  console.error("All JSON parse attempts failed. Raw response:", text);
  throw new Error("FAILED_TO_PARSE_AI_RESPONSE");
}