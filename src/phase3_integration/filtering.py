from src.phase1_setup.config import settings
from src.phase2_data_ingestion.data_loader import load_processed_data

def get_unique_localities() -> list[str]:
    """Returns a sorted list of all unique localities in the dataset."""
    df = load_processed_data()
    localities = df['Location'].dropna().unique().tolist()
    return sorted(localities)

def filter_restaurants(preferences) -> list[dict]:
    """
    Hard-filters the dataset based on UserPreferences and returns a list of candidate dicts.
    """
    df = load_processed_data()
    
    # Exact match for locality (which corresponds to 'Location' in dataset)
    mask = df['Location'].str.lower() == preferences.locality.lower()
    
    # Maximum threshold match for budget
    mask &= df['numeric_cost'] <= preferences.budget
    
    # Threshold match for rating
    mask &= df['Rating'] >= preferences.min_rating
    
    # Substring match for cuisine (optional)
    if preferences.cuisine:
        mask &= df['Cuisine'].str.contains(preferences.cuisine, case=False, na=False)
        
    filtered_df = df[mask].copy()
    
    # Sort by rating and truncate
    filtered_df = filtered_df.sort_values(by='Rating', ascending=False).head(settings.MAX_CANDIDATES)
    
    return filtered_df.to_dict('records')
