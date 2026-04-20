import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from src.phase1_setup.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

def test_groq_connection():
    print("Testing Groq LLM Connection...")
    print(f"API Key found: {'Yes' if settings.GROQ_API_KEY else 'No'}")
    
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        print("Error: Valid GROQ_API_KEY is not set in .env")
        return
        
    try:
        # Initialize Groq client
        # Llama-3-8b-8192 is a fast and standard model on Groq
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama3-8b-8192"
        )
        
        tests = [
            "Hi, what model are you?",
            "What is 2+2?",
            "Name a popular cuisine in India."
        ]
        
        for i, prompt in enumerate(tests, 1):
            print(f"\n--- Test {i} ---")
            print(f"Prompt: {prompt}")
            
            response = llm.invoke([HumanMessage(content=prompt)])
            print(f"Response: {response.content.strip()}")
            
        print("\nAll tests passed! LLM is properly connected.")
            
    except Exception as e:
        print(f"\nFailed to connect or get response: {e}")

if __name__ == "__main__":
    test_groq_connection()
