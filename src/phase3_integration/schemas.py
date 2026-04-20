from pydantic import BaseModel, Field
from typing import Optional, Literal

class UserPreferences(BaseModel):
    locality: str
    budget: float = Field(ge=0.0)
    cuisine: Optional[str] = None
    min_rating: float = Field(ge=0.0, le=5.0)
    additional_preferences: Optional[str] = None

class RestaurantRecommendation(BaseModel):
    name: str
    cuisine: str
    rating: float
    cost: str
    explanation: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
