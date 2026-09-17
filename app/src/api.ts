export interface ScannedData {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: string[];
  userProfile?: any;
}

export interface AIAnalysisData {
  sugar_translation: string;
  isRecommended: boolean;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface AnalyzeResponse {
  success: boolean;
  source?: string;
  data?: AIAnalysisData;
  error?: string;
}

// Using your local IPv4 address
const BACKEND_URL = "http://192.168.68.106:3000/api/analyze";

export async function analyzeFood(scannedData: ScannedData): Promise<AIAnalysisData> {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: scannedData }),
  });

  const result: AnalyzeResponse = await response.json();

  if (result.success && result.data) {
    return result.data;
  } else {
    throw new Error(result.error || "Failed to analyze food product.");
  }
}