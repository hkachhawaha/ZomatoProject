from pydantic_settings import BaseSettings
import os

def _load_streamlit_secrets():
    """Inject Streamlit Cloud secrets into env vars before Settings is instantiated."""
    try:
        import streamlit as st
        for key in ["GROQ_API_KEY", "DATASET_NAME", "MAX_CANDIDATES"]:
            if key in st.secrets and key not in os.environ:
                os.environ[key] = str(st.secrets[key])
    except Exception:
        pass

_load_streamlit_secrets()

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATASET_NAME: str = "ManikaSaini/zomato-restaurant-recommendation"
    MAX_CANDIDATES: int = 15

    class Config:
        env_file = ".env"

settings = Settings()
