from app.schemas import ScannedData

SYSTEM_PROMPT = """
You are an expert nutritionist API. You strictly output valid JSON.

Return a JSON object with exactly these keys:
- "sugar_translation" (string): A short, educational explanation of the ingredients or nutritional profile.
- "isRecommended" (boolean): True if this is a generally healthy choice, false otherwise.
- "calories" (number): The calories.
- "protein_g" (number): The protein in grams.
- "carbs_g" (number): The carbs in grams.
- "fat_g" (number): The fat in grams.

IMPORTANT:
If the input macros are provided (not 0), output those exact numbers back.
If they are exactly 0 (which means the user only provided the food name), you MUST estimate the typical macros for a standard, average serving size of this food.

--- EXAMPLES ---

Input:
Food Name: Unknown
Calories: 250, Protein: 2g, Carbs: 40g, Fat: 5g, Ingredients: Sugar, Water, Maltodextrin
Output:
{
  "sugar_translation": "This product relies heavily on refined sugar and maltodextrin, a highly processed carbohydrate.",
  "isRecommended": false,
  "calories": 250,
  "protein_g": 2,
  "carbs_g": 40,
  "fat_g": 5
}

Input:
Food Name: Apple
Calories: 0, Protein: 0g, Carbs: 0g, Fat: 0g, Ingredients: Apple
Output:
{
  "sugar_translation": "Apples contain natural sugars (fructose) but are packed with fiber, which slows absorption and prevents rapid blood sugar spikes.",
  "isRecommended": true,
  "calories": 95,
  "protein_g": 0,
  "carbs_g": 25,
  "fat_g": 0
}
"""


def build_user_prompt(data: ScannedData) -> str:
    profile = data.userProfile
    language = (profile and profile.language) or "English"
    goals = ", ".join(profile.goals) if profile and profile.goals else "General Health"
    activity = (profile and profile.activityLevel) or "Active"
    depth = (profile and profile.explanationDepth) or "Give me some context"

    return f"""
Analyze this food product for a specific user.

--- USER PROFILE ---
- Language Requested: {language}
- Primary Goals: {goals}
- Activity Level: {activity}
- Preferred Explanation Depth: {depth}

--- FOOD DATA ---
Food Name: {data.name or "Unknown"}
Calories: {data.calories:g}
Protein: {data.protein_g:g}g
Carbs: {data.carbs_g:g}g
Fat: {data.fat_g:g}g
Ingredients: {", ".join(data.ingredients)}

IMPORTANT INSTRUCTIONS:
1. Write the 'sugar_translation' review entirely in the user's requested Language ({language}).
2. Tailor the review to their specific goals ({goals}) and activity level ({activity}). Does this food help or hurt their goals?
3. Match their preferred explanation depth ({depth}). If they want it simple, be brief. If they want hidden details, get deeply scientific about the ingredients.
"""
