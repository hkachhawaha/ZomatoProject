import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import streamlit as st
from src.phase3_integration.filtering import filter_restaurants, get_unique_localities
from src.phase4_recommendation.llm_service import get_recommendations
from src.phase3_integration.schemas import UserPreferences

st.set_page_config(page_title="Zomato AI Recommendations", page_icon="🍽️", layout="wide")

st.markdown("""
<style>
    .restaurant-card {
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        border-left: 5px solid #E23744;
    }
    .restaurant-name {
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10px;
    }
    .restaurant-meta {
        font-size: 14px;
        color: #cccccc;
        margin-bottom: 15px;
    }
    .ai-explanation {
        background-color: #2b2b2b;
        padding: 15px;
        border-radius: 8px;
        font-style: italic;
        color: #e0e0e0;
        border-left: 3px solid #f39c12;
    }
</style>
""", unsafe_allow_html=True)

st.title("🍽️ Zomato AI Concierge")
st.markdown("Find the perfect restaurant based on your exact vibe and preferences.")

with st.sidebar:
    st.header("Your Preferences")

    try:
        localities = get_unique_localities()
    except Exception:
        localities = ["Banashankari", "Whitefield", "Indiranagar", "Koramangala",
                      "Jayanagar", "Marathahalli", "BTM", "JP Nagar", "HSR", "Malleshwaram"]

    locality = st.selectbox("Locality", localities)
    budget = st.number_input("Maximum Budget (Cost for two in ₹)", min_value=100.0, max_value=20000.0, value=1500.0, step=100.0)
    cuisine = st.text_input("Cuisine (Optional)", placeholder="e.g., North Indian, Italian")
    min_rating = st.slider("Minimum Rating", min_value=0.0, max_value=5.0, value=4.0, step=0.1)
    st.markdown("---")
    additional_preferences = st.text_area("Additional Preferences", placeholder="e.g., Good for a romantic anniversary date, rooftop seating, pet friendly")
    submit_button = st.button("Find Restaurants", type="primary")

if submit_button:
    with st.spinner("AI is curating your perfect meal..."):
        try:
            preferences = UserPreferences(
                locality=locality,
                budget=budget,
                cuisine=cuisine if cuisine else None,
                min_rating=min_rating,
                additional_preferences=additional_preferences if additional_preferences else None,
            )

            candidates = filter_restaurants(preferences)

            if not candidates:
                st.warning("No restaurants found matching your exact criteria. Try lowering the rating or changing the locality.")
            else:
                recommendations = get_recommendations(preferences, candidates)

                if not recommendations:
                    st.warning("No recommendations returned. Try adjusting your filters.")
                else:
                    st.success(f"Found {len(recommendations)} perfectly matched restaurants!")
                    for r in recommendations:
                        st.markdown(f"""
                        <div class="restaurant-card">
                            <div class="restaurant-name">{r.name}</div>
                            <div class="restaurant-meta">
                                ⭐ {r.rating} &nbsp;|&nbsp; 🍛 {r.cuisine} &nbsp;|&nbsp; 💰 ₹{r.cost}
                            </div>
                            <div class="ai-explanation">
                                🤖 <strong>AI Insight:</strong> {r.explanation}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

        except Exception as e:
            st.error(f"An unexpected error occurred: {e}")
