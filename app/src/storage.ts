import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FoodEntry {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: string[];
  aiAnalysis?: string;
  isRecommended?: boolean;
}

const STORAGE_KEY = '@food_history';

export const deleteFoodEntry = async (id: string) => {
  try {
    const existingHistory = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existingHistory) return;

    const history: FoodEntry[] = JSON.parse(existingHistory);
    const updatedHistory = history.filter(entry => entry.id !== id);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete food entry:', error);
    throw new Error('Could not delete from device.');
  }
};

export const saveFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'date'>) => {
  try {
    const existingHistory = await AsyncStorage.getItem(STORAGE_KEY);
    const history: FoodEntry[] = existingHistory ? JSON.parse(existingHistory) : [];

    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    history.unshift(newEntry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    return newEntry;
  } catch (error) {
    console.error('Failed to save food entry:', error);
    throw new Error('Could not save to device.');
  }
};

export const getFoodHistory = async (): Promise<FoodEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch(error) {
    console.error('Failed to fetch food history:', error);
    return [];
  }
};

export interface UserProfile {
  name: string; 
  language: string;
  goals: string[];
  activityLevel: string;
  explanationDepth: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  hasOnboarded: boolean;
}

const PROFILE_KEY = '@user_profile';

export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  try {
    const existing = await getUserProfile();
    const updatedProfile = { ...existing, ...profile, hasOnboarded: true };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  } catch (error) {
    console.error('Failed to save profile:', error);
    throw new Error('Could not save profile to device.');
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
};