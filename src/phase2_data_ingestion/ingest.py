import sys
import os

# Add the project root to sys.path so we can import 'src' module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.phase2_data_ingestion.data_loader import ingest_and_preprocess_data

if __name__ == "__main__":
    print("Starting data ingestion phase...")
    ingest_and_preprocess_data()
    print("Phase 2 data ingestion complete.")
