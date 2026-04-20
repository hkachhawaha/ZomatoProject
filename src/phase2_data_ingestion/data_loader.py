import os
import pandas as pd
import numpy as np
from datasets import load_dataset
from src.phase1_setup.config import settings

PROCESSED_DATA_PATH = "data/processed/restaurants.parquet"

def ingest_and_preprocess_data():
    """
    Downloads dataset from HuggingFace, cleans it, and saves it to a Parquet file.
    """
    print(f"Loading dataset: {settings.DATASET_NAME}")
    ds = load_dataset(settings.DATASET_NAME)
    df = ds['train'].to_pandas()
    
    # 1. Rename columns to match our expected schema
    rename_map = {
        'name': 'Name',
        'location': 'Location',
        'cuisines': 'Cuisine',
        'approx_cost(for two people)': 'Cost',
        'rate': 'Rating'
    }
    df.rename(columns=rename_map, inplace=True)
    
    # Keep only necessary columns
    df = df[['Name', 'Location', 'Cuisine', 'Cost', 'Rating', 'address', 'rest_type', 'dish_liked']]
    
    # 2. Handle missing values
    df.dropna(subset=['Name', 'Location', 'Cuisine', 'Cost', 'Rating'], inplace=True)
    
    # 3. Clean and normalize Rating
    # Ratings are typically "4.1/5" or "NEW" or "-"
    def parse_rating(r):
        if pd.isna(r): return 0.0
        r = str(r).strip()
        if r == 'NEW' or r == '-': return 0.0
        try:
            return float(r.split('/')[0].strip())
        except:
            return 0.0
            
    df['Rating'] = df['Rating'].apply(parse_rating)
    
    # 4. Clean and normalize Cost
    # Cost is usually string with commas like "1,200" or "800"
    def parse_cost(c):
        if pd.isna(c): return 0.0
        c = str(c).replace(',', '').strip()
        try:
            return float(c)
        except:
            return 0.0
            
    df['numeric_cost'] = df['Cost'].apply(parse_cost)
    
    # 5. Create budget tier
    def get_budget_tier(c):
        if c <= 500: return 'low'
        elif c <= 1500: return 'medium'
        else: return 'high'
        
    df['budget_tier'] = df['numeric_cost'].apply(get_budget_tier)
    
    # 6. Normalize Cuisine and Location for matching
    df['Location'] = df['Location'].str.strip()
    df['Cuisine'] = df['Cuisine'].str.strip()
    
    # Save processed dataframe
    os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)
    df.to_parquet(PROCESSED_DATA_PATH, index=False)
    print(f"Data saved to {PROCESSED_DATA_PATH}")

def load_processed_data() -> pd.DataFrame:
    """Loads the preprocessed Parquet file."""
    if not os.path.exists(PROCESSED_DATA_PATH):
        raise FileNotFoundError(f"{PROCESSED_DATA_PATH} not found. Run ingestion first.")
    return pd.read_parquet(PROCESSED_DATA_PATH)
