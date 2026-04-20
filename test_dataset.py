from datasets import load_dataset
import pandas as pd

try:
    ds = load_dataset("ManikaSaini/zomato-restaurant-recommendation")
    df = ds['train'].to_pandas()
    print("Columns:", df.columns.tolist())
    print("\nSample Data:")
    print(df.head(2))
except Exception as e:
    print(e)
