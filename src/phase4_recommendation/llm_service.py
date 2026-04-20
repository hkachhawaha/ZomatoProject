import json
from pydantic import BaseModel, Field
from typing import List
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from src.phase1_setup.config import settings
from src.phase3_integration.schemas import UserPreferences, RestaurantRecommendation

# Define an output container schema because LLMs usually return a single object
class RecommendationsOutput(BaseModel):
    recommendations: List[RestaurantRecommendation] = Field(
        description="List of top 3 to 5 restaurant recommendations."
    )

def get_fallback_recommendations(candidates: list[dict]) -> list[RestaurantRecommendation]:
    """Fallback if LLM fails: returns the top 3 restaurants based on rating."""
    top_candidates = sorted(candidates, key=lambda x: x.get('Rating', 0), reverse=True)[:3]
    return [
        RestaurantRecommendation(
            name=c.get('Name', 'Unknown'),
            cuisine=c.get('Cuisine', 'Unknown'),
            rating=float(c.get('Rating', 0.0)),
            cost=str(c.get('Cost', '0')),
            explanation="Recommended based on high overall ratings and matching your base criteria."
        ) for c in top_candidates
    ]

def get_recommendations(preferences: UserPreferences, candidates: list[dict]) -> list[RestaurantRecommendation]:
    if not candidates:
        return []
        
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        print("Warning: GROQ_API_KEY is not configured. Falling back to deterministic sorting.")
        return get_fallback_recommendations(candidates)

    try:
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",  # Best for function calling on Groq
            temperature=0.2
        )
        
        structured_llm = llm.with_structured_output(RecommendationsOutput)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert Zomato food concierge. Your goal is to analyze a provided list of candidate restaurants and recommend the top 3 to 5 that best match the user's specific vibe and 'additional preferences'."),
            ("human", """User Profile:
Locality: {locality}
Maximum Budget: ₹{budget} for two
Cuisine: {cuisine}
Min Rating: {min_rating}
Additional Preferences: {additional_preferences}

Candidate Restaurants (JSON):
{candidates}

Instructions:
1. Do NOT hallucinate restaurants. Only pick from the candidate list provided.
2. Rank them based on how well they fit the user's "Additional Preferences". If no specific additional preferences, base it on highest Rating.
3. Provide a highly personalized 2-sentence explanation for why each restaurant fits the user's specific vibe/needs.
""")
        ])
        
        # Prepare context (compress to save tokens)
        candidates_context = json.dumps([{
            "Name": c['Name'],
            "Cuisine": c['Cuisine'],
            "Rating": c['Rating'],
            "Cost": c['Cost'],
            "Dish_Liked": c.get('dish_liked', '')
        } for c in candidates])
        
        chain = prompt | structured_llm
        
        result = chain.invoke({
            "locality": preferences.locality,
            "budget": preferences.budget,
            "cuisine": preferences.cuisine or "Any",
            "min_rating": preferences.min_rating,
            "additional_preferences": preferences.additional_preferences or "None",
            "candidates": candidates_context
        })
        
        # In case the LLM returns an empty list, fallback
        if not result or not result.recommendations:
            return get_fallback_recommendations(candidates)
            
        return result.recommendations

    except Exception as e:
        print(f"LLM Recommendation Error: {e}. Falling back to deterministic sort.")
        return get_fallback_recommendations(candidates)
