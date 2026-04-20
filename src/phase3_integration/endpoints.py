from fastapi import APIRouter, HTTPException
from typing import List
from src.phase3_integration.schemas import UserPreferences, RestaurantRecommendation
from src.phase3_integration.filtering import filter_restaurants, get_unique_localities
from src.phase4_recommendation.llm_service import get_recommendations

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/localities", response_model=List[str])
def localities():
    return get_unique_localities()

@router.post("/recommend", response_model=List[RestaurantRecommendation])
def recommend_restaurants(preferences: UserPreferences):
    # Phase 3: Hard Filter
    candidates = filter_restaurants(preferences)
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No restaurants found matching the strict criteria.")
        
    # Phase 4: LLM Reasoning
    recommendations = get_recommendations(preferences, candidates)
    
    return recommendations
