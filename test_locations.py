import pandas as pd
df = pd.read_parquet("data/processed/restaurants.parquet")
print(f"Total unique locations: {df['Location'].nunique()}")
print(df['Location'].unique()[:10])
