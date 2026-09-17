export interface FoodMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  sugar_g: number;
  fat_g: number;
}

export interface UserProfile {
  goal: "Weight Loss" | "Muscle Gain" | "Endurance" | "General Health";
  restrictions: string[];
}

export function analyzeFood(macros: FoodMacros, user: UserProfile) {
  const insights: string[] = [];
  let isRecommended = true;

  // RULE 1: High Sugar Warning for Weight Loss
  if (user.goal === "Weight Loss" && macros.sugar_g > 10) {
    insights.push("High sugar content may spike insulin and stall fat loss.");
    isRecommended = false;
  }

  // RULE 2: High Protein for Muscle Gain
  if (user.goal === "Muscle Gain" && macros.protein_g >= 15) {
    insights.push("Excellent protein density for muscle synthesis.");
  }

  if (insights.length === 0) {
    insights.push("This food has a neutral impact on your specific goals.");
  }

  return {
    isRecommended,
    insights
  };
}