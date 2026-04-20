import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.phase3_integration.schemas import UserPreferences
from src.phase3_integration.endpoints import recommend_restaurants

def test_backend():
    print("=== Testing Backend (Phase 4 LLM Integration) ===\n")
    
    # Case 1: Standard search
    pref1 = UserPreferences(
        locality="Banashankari",
        budget=1500.0,
        cuisine="North Indian",
        min_rating=4.0,
        additional_preferences="Good for a romantic dinner with nice ambiance."
    )
    
    print(f"Test Case 1: {pref1.locality}, {pref1.budget}, {pref1.cuisine}")
    try:
        results = recommend_restaurants(pref1)
        for i, r in enumerate(results, 1):
            print(f"{i}. {r.name} ({r.rating}) - {r.cost}")
            print(f"   Reason: {r.explanation}\n")
    except Exception as e:
        print(f"Error: {e}\n")

    # Case 2: Different location and budget
    pref2 = UserPreferences(
        locality="Whitefield",
        budget=4000.0,
        cuisine="Continental",
        min_rating=4.2,
        additional_preferences="Rooftop seating preferred"
    )
    
    print(f"Test Case 2: {pref2.locality}, {pref2.budget}, {pref2.cuisine}")
    try:
        results = recommend_restaurants(pref2)
        for i, r in enumerate(results, 1):
            print(f"{i}. {r.name} ({r.rating}) - {r.cost}")
            print(f"   Reason: {r.explanation}\n")
    except Exception as e:
        print(f"Error: {e}\n")

if __name__ == "__main__":
    test_backend()
