import crypto from 'crypto';

export interface ScannedData {
  name?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: string[];
  userProfile?: {
    language?: string;
    goals?: string[];
    activityLevel?: string;
    explanationDepth?: string;
  };
}

export const generateHash = (data: ScannedData): string => {
  const normalizedIngredients = [...data.ingredients]
    .map(i => i.toLowerCase().trim())
    .sort() // Alphabetize so order doesn't break the cache
    .join(',');

  const profile = data.userProfile || {};
  const language = (profile.language || 'English').toLowerCase();
  
  // Sort goals alphabetically so ["Fat Loss", "Muscle"] hashes the same as ["Muscle", "Fat Loss"]
  const goals = [...(profile.goals || [])]
    .sort()
    .join(',')
    .toLowerCase();
    
  const activity = (profile.activityLevel || 'Active').toLowerCase();
  const depth = (profile.explanationDepth || 'Give me some context').toLowerCase();

  const rawString = `${data.calories}-${data.protein_g}-${data.carbs_g}-${data.fat_g}-${normalizedIngredients}-${language}-${goals}-${activity}-${depth}`;

  return crypto.createHash('sha256').update(rawString).digest('hex');
};