from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.phase3_integration import endpoints

app = FastAPI(title="Zomato AI Recommendation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Zomato AI Recommendation Service"}
