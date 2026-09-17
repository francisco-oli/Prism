import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateHash, ScannedData } from "../../../utils/fingerprint";
import { db } from "../../../utils/firebase";
import { nutritionSystemPrompt } from "../../../utils/prompts";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const model = "gemini-3.5-flash-lite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scannedData = body.data as ScannedData;
    const cacheKey = generateHash(scannedData);

    const docRef = db.collection("food_cache").doc(cacheKey);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json({
        success: true,
        source: "cache_hit",
        data: docSnap.data(),
      });
    }

const profile = scannedData.userProfile || {};
    const language = profile.language || "English";
    const goals = profile.goals ? profile.goals.join(", ") : "General Health";
    const activity = profile.activityLevel || "Active";
    const depth = profile.explanationDepth || "Give me some context";

    const userPrompt = `
Analyze this food product for a specific user. 

--- USER PROFILE ---
- Language Requested: ${language}
- Primary Goals: ${goals}
- Activity Level: ${activity}
- Preferred Explanation Depth: ${depth}

--- FOOD DATA ---
Food Name: ${// @ts-ignore 
  scannedData.name || "Unknown"}
Calories: ${scannedData.calories}
Protein: ${scannedData.protein_g}g
Carbs: ${scannedData.carbs_g}g
Fat: ${scannedData.fat_g}g
Ingredients: ${scannedData.ingredients.join(", ")}

IMPORTANT INSTRUCTIONS:
1. Write the 'sugar_translation' review entirely in the user's requested Language (${language}).
2. Tailor the review to their specific goals (${goals}) and activity level (${activity}). Does this food help or hurt their goals?
3. Match their preferred explanation depth (${depth}). If they want it simple, be brief. If they want hidden details, get deeply scientific about the ingredients.
`;

    const response = await client.models.generateContent({
      model,
      contents: `${nutritionSystemPrompt}\n\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text;

    if (!jsonText) {
      throw new Error("Gemini returned an empty response.");
    }

    const aiData = JSON.parse(jsonText);

    await docRef.set(aiData);

    return NextResponse.json({
      success: true,
      source: "cache_miss_ai_call",
      data: aiData,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}