from typing import List, Optional

from pydantic import BaseModel


class UserProfile(BaseModel):
    language: Optional[str] = None
    goals: Optional[List[str]] = None
    activityLevel: Optional[str] = None
    explanationDepth: Optional[str] = None


class ScannedData(BaseModel):
    name: Optional[str] = None
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    ingredients: List[str]
    userProfile: Optional[UserProfile] = None


class AnalyzeRequest(BaseModel):
    data: ScannedData
