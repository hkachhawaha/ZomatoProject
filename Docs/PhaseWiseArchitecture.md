# Comprehensive Phase-Wise Architecture: AI-Powered Restaurant Recommendation System

This document outlines an extensively detailed architectural blueprint and implementation strategy for the Zomato-inspired AI restaurant recommendation service. 

---

## Phase 1: Foundation, Environment Setup, and Project Structure
**Objective:** Establish a robust, scalable project structure, enforce dependency management, and prepare the local environment.

### 1.1 Directory Structure
We will adopt a modular structure to separate concerns (Data, API, LLM logic, Frontend):
```text
zomato_recommendation_system/
├── app/
│   ├── main.py               # FastAPI application entry point
│   ├── api/
│   │   └── endpoints.py      # API routing
│   ├── core/
│   │   └── config.py         # Environment variables and app settings
│   ├── models/
│   │   └── schemas.py        # Pydantic models for API request/response
│   └── services/
│       ├── data_service.py   # Dataset loading and querying logic
│       └── llm_service.py    # LangChain/Groq integration
├── data/
│   ├── raw/                  # Initial downloaded Hugging Face data
│   └── processed/            # Cleaned, fast-load format (e.g., Parquet)
├── frontend/
│   └── app.py                # Streamlit UI
├── tests/
│   └── test_api.py           # Pytest files
├── pyproject.toml / requirements.txt
└── .env                      # Secrets (Not committed to version control)
```

### 1.2 Technology Stack & Libraries
*   **API Framework:** FastAPI (`fastapi`, `uvicorn`) - Chosen for high performance and native Pydantic support.
*   **Data Processing:** Pandas (`pandas`, `pyarrow`) - Chosen for efficient tabular data manipulation.
*   **LLM Orchestration:** Groq API / LangChain (`langchain-groq`) - For ultra-fast structured output generation.
*   **Frontend:** Next.js 16 (`next`, `react`, `typescript`) - Production-grade React framework with App Router, CSS Modules, and `next/image` optimization. *(Legacy: Streamlit was used for initial prototyping.)*
*   **Data Ingestion:** Hugging Face Datasets (`datasets`).

### 1.3 Configuration Management
*   Use `pydantic-settings` to load environment variables from `.env`:
    *   `GROQ_API_KEY`: API key for the Groq LLM.
    *   `DATASET_NAME`: `ManikaSaini/zomato-restaurant-recommendation`.
    *   `MAX_CANDIDATES`: Default `15` (Number of restaurants sent to LLM).

---

## Phase 2: Data Ingestion and Preprocessing Pipeline
**Objective:** Programmatically retrieve the dataset, sanitize it, and store it in an optimized format for ultra-fast, low-latency querying.

### 2.1 Ingestion Strategy
*   Use the `datasets` library to pull data dynamically: `load_dataset("ManikaSaini/zomato-restaurant-recommendation")`.
*   Convert the Hugging Face Dataset object into a Pandas DataFrame for complex transformations.

### 2.2 Data Cleaning & Normalization Rules
*   **Missing Values:** Drop rows where critical fields (`Name`, `Location`, `Cuisine`, `Cost`, `Rating`) are completely missing or unparseable.
*   **Cost Normalization:** 
    *   Extract numeric values from strings like `"₹ 1,500 for two"` into a float.
*   **Rating Normalization:** Convert string ratings (e.g., `"4.2/5"`) to float `4.2`. Handle "NEW" or "-" values by mapping them to `0.0` or dropping them.
*   **Cuisine & Location Formatting:** Lowercase and strip whitespace to ensure robust exact or substring matching later.

### 2.3 Storage and Caching Mechanism
*   Save the fully transformed DataFrame to `data/processed/restaurants.parquet`.
*   *Why Parquet?* It retains data types, is heavily compressed, and loads into memory exponentially faster than CSVs, ensuring the FastAPI startup time is instantaneous.

---

## Phase 3: Integration Layer (Backend API & Data Filtering)
**Objective:** Expose a secure API to receive user preferences, validate them, and perform deterministic hard-filtering on the dataset.

### 3.1 Interface Contracts (Pydantic Models)
Define strict schemas in `app/models/schemas.py`:
```python
class UserPreferences(BaseModel):
    locality: str
    budget: float = Field(ge=0.0)
    cuisine: Optional[str] = None
    min_rating: float = Field(ge=0.0, le=5.0)
    additional_preferences: Optional[str] = None

class RestaurantRecommendation(BaseModel):
    name: str
    cuisine: str
    rating: float
    cost: str
    explanation: str
```

### 3.2 Deterministic Hard-Filtering Logic (`data_service.py`)
Instead of searching thousands of restaurants using the LLM (which is expensive and slow), we filter using Pandas:
1.  **Exact Match:** Filter rows where `df['Location'].str.lower() == request.locality.lower()`.
2.  **Threshold Match:** Filter rows where `df['numeric_cost'] <= request.budget`.
3.  **Threshold Match:** Filter rows where `df['Rating'] >= request.min_rating`.
4.  **Substring Match (Optional):** If `cuisine` is provided, filter rows where `df['Cuisine'].str.contains(request.cuisine, case=False)`.
5.  **Sorting & Truncation:** Sort the resulting DataFrame by `Rating` descending and select the top `MAX_CANDIDATES` (e.g., 15) to prevent exceeding LLM context windows.

### 3.3 Context Preparation
*   Convert the truncated DataFrame into a compact JSON string or Markdown table.
*   Example Context: `[{"Name": "Pizza Hut", "Cuisine": "Italian", "Rating": 4.1, "Cost": "₹ 600"}, ...]`

---

## Phase 4: Recommendation Engine (LLM Reasoning Layer)
**Objective:** Inject the filtered context into the LLM, prompting it to act as an intelligent concierge that selects and justifies the absolute best options based on nuanced human preferences.

### 4.1 Prompt Engineering (`llm_service.py`)
*   **System Prompt:** "You are an expert Zomato food concierge. Your goal is to analyze a provided list of candidate restaurants and recommend the top 3-5 that best match the user's specific vibe and 'additional preferences'."
*   **Human Prompt Configuration:**
    *   *User Profile:* "User wants {cuisine} in {location} with a {budget} budget. Special requests: '{additional_preferences}'."
    *   *Candidates Context:* Insert the structured JSON from Phase 3.
    *   *Instructions:* "Do NOT hallucinate restaurants. Only pick from the provided list. Rank them and write a 2-sentence highly personalized explanation for why each fits their special request."

### 4.2 LLM Invocation & Structured Outputs
*   Use Groq's **Structured Outputs (JSON Mode)** via `pydantic` to enforce the output format.
*   This guarantees the LLM returns an array of `RestaurantRecommendation` objects rather than plain text, preventing parsing errors on the backend.

### 4.3 Resilience and Deterministic Fallback
*   If the LLM API times out, returns an error, or the user's constraints result in 0 matches:
    *   **Fallback Strategy:** Bypass the LLM and return the top 3 restaurants from the hard-filtered list directly, generating a generic explanation: *"Recommended based on high overall ratings in your selected budget."*

---

## Phase 5: Output Display (Next.js Frontend)
**Objective:** Provide a premium, production-grade user interface using Next.js (React) with TypeScript and CSS Modules, faithfully implementing the design mockup and connecting to the FastAPI backend via REST.

### 5.1 Technology Stack
*   **Framework:** Next.js 16 (App Router, Turbopack)
*   **Language:** TypeScript — type-safe API integration with interfaces mirroring Pydantic schemas.
*   **Styling:** CSS Modules + vanilla CSS design tokens — no utility-framework dependency.
*   **Font:** Inter (Google Fonts) via `next/font`.
*   **Images:** `next/image` with optimized static restaurant images.
*   **Mapping:** react-leaflet with marker clustering (react-leaflet-markercluster) for interactive restaurant location visualization.
*   **Communication:** CORS-enabled `fetch()` calls to `http://localhost:8000/api/v1`.

### 5.2 Directory Structure
```text
frontend/
├── app/
│   ├── layout.tsx          # Root layout (Google Fonts, SEO metadata)
│   ├── page.tsx            # Main page (state management, API calls, component assembly)
│   ├── page.module.css     # Page layout styles
│   └── globals.css         # Design system tokens & base styles
├── components/
│   ├── Header.tsx          # Top navbar (logo, AI Scout search bar, notifications, profile)
│   ├── Sidebar.tsx         # Filter panel (location, budget, rating, dietary, Gold AI card)
│   ├── HeroSection.tsx     # "Curated for your mood." hero with states (empty/loading/results)
│   ├── FeaturedCard.tsx    # Large restaurant card (image + match % + AI explanation)
│   ├── CompactCard.tsx     # Compact card for additional results (icon + blurb + rating)
│   ├── GoldCard.tsx        # "Join Gold AI" promotional card
│   ├── MapButton.tsx       # Floating "View Map" button
│   └── *.module.css        # Co-located CSS Modules for each component
├── lib/
│   └── api.ts              # API client (fetchLocalities, fetchRecommendations)
└── types/
    └── index.ts            # TypeScript interfaces (UserPreferences, RestaurantRecommendation, BudgetTier, etc.)
```

### 5.3 UI Layout
*   **Header:** "Zomato AI" brand logo (red), centered AI Scout search bar with placeholder text, notification bell + profile avatar.
*   **Sidebar (Left Panel — sticky, scrollable):**
    *   **Location:** `<select>` dropdown with 📍 pin icon, dynamically populated from `/api/v1/localities`.
    *   **Budget:** 4-button toggle group (`$`, `$$`, `$$$`, `$$$$`) mapping to numeric values (500, 1000, 2000, 5000).
    *   **Min. Rating:** Radio group with options 4.5+ (AI Verified), 4.0+, 3.5+.
    *   **Dietary Preference:** Chip toggles (Vegan, Gluten Free, Keto Friendly) — sent as `additional_preferences`.
    *   **Find Restaurants:** Primary CTA button triggering the recommendation flow.
    *   **Gold AI Card:** Promotional card at sidebar bottom.
*   **Main Content:**
    *   **HeroSection:** "AI SCOUTING COMPLETE" badge, "Curated for your *mood*." headline with gradient italic accent, contextual search blurb. Three states: empty, loading (skeleton shimmer), and results-ready.
    *   **Featured Cards (top 2):** Large image with match % badge overlay, restaurant name, price tier + cuisine metadata, star rating badge, "WHY WE PICKED THIS" AI explanation section, "Book Table" CTA + bookmark icon.
    *   **Compact Cards (results 3+):** Grid of smaller cards with cuisine icon, name, truncated AI blurb, cost tier, and rating pill.
*   **Floating Action:** "📍 View Map" button fixed to bottom-right corner.

### 5.4 Design System Highlights
*   **Brand Red:** `#E23744` (primary), `rgba(226,55,68,0.08)` (light background).
*   **Match Badge:** Dark green `#1B5E20` with translucent backdrop blur.
*   **Shadows:** Multi-tier system — `sm`, `md`, `lg`, `card`, `hover` — for depth hierarchy.
*   **Animations:** `fadeInUp` entrance for cards (staggered delay), `shimmer` for loading skeletons, `pulse` for loading states.
*   **Responsive:** Sidebar collapses to top on `≤1024px` viewports.

### 5.5 State Management
*   All state managed via React `useState` hooks in the root `page.tsx` (client component).
*   Localities fetched on mount via `useEffect`.
*   Dietary tags and search bar query combined into `additional_preferences` for the API call.
*   Results split: first 2 → FeaturedCards, remainder → CompactCards grid.

### 5.6 Legacy Frontend
*   The original Streamlit frontend (`src/phase5_frontend/app.py`) is retained for reference but is superseded by the Next.js implementation.

---

## Phase 6: Testing, Refinement, and Deployment
**Objective:** Harden the application against edge cases, ensure code quality, and prepare the system for production-like deployment.

### 6.1 Testing Strategy (Pytest)
*   **Unit Tests (`test_data_service.py`):** Assert that the DataFrame cleaning logic correctly maps "₹ 1500" to "Medium/High" budget tiers. Assert that hard-filtering returns correct counts.
*   **API Tests (`test_api.py`):** Use `fastapi.testclient.TestClient` to mock requests to `/recommend` and assert 200 OK responses and proper schema validation.
*   **LLM Mocking:** Mock the Groq API calls during CI/CD to prevent incurring costs and to test the fallback logic simulating an API failure.

### 6.2 Containerization (Docker)
Create a `Dockerfile` for easy deployment:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
*(Optionally, use docker-compose to spin up the FastAPI backend and Streamlit frontend together).*

### 6.3 Logging and Observability
*   Implement Python's `logging` module in FastAPI.
*   Log critical metrics: Size of dataset after hard-filtering (to detect over-filtering), LLM latency, and LLM token usage.

### 6.4 Production Deployment

#### Overview

| Service | Platform | URL Pattern |
|---|---|---|
| Backend (Streamlit App) | Streamlit Community Cloud | `https://<app-name>.streamlit.app` |
| Frontend (Next.js) | Vercel | `https://<project-name>.vercel.app` |

---

#### Backend → Streamlit Community Cloud

The backend Streamlit app (`src/phase5_frontend/app.py`) is deployed on [Streamlit Community Cloud](https://streamlit.io/cloud), which natively supports Python apps with zero infrastructure management.

**Pre-deployment steps:**
1. Ensure `requirements.txt` is at the project root (already present).
2. Add `GROQ_API_KEY` as a **Secret** in the Streamlit Cloud dashboard under *App Settings → Secrets*:
    ```toml
    GROQ_API_KEY = "your-groq-api-key"
    ```
3. Confirm the FastAPI backend URL used inside `app.py` is updated to point to the production API host (not `localhost:8000`).

**Deploy steps:**
1. Push the repository to GitHub.
2. Go to [share.streamlit.io](https://share.streamlit.io) → *New app*.
3. Select the repository, branch (`main`), and set the **Main file path** to `src/phase5_frontend/app.py`.
4. Click **Deploy**.

**Notes:**
*   Streamlit Community Cloud does **not** host the FastAPI server — the FastAPI backend must be deployed separately (e.g., Render or Railway) and the Streamlit app configured to call its public URL.
*   The `data/processed/restaurants.parquet` file must be committed to the repository so it is available at runtime on Streamlit Cloud.
*   Cold starts may add a few seconds of latency on the free tier.

---

#### Frontend → Vercel

The Next.js frontend (`frontend/`) is deployed on [Vercel](https://vercel.com), the recommended platform for Next.js.

**Pre-deployment steps:**
1. Replace the hardcoded backend URL in [frontend/lib/api.ts](../frontend/lib/api.ts):
    ```ts
    // Before
    const BASE_URL = "http://localhost:8000/api/v1";

    // After
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";
    ```
2. Update CORS in [src/phase1_setup/main.py](../src/phase1_setup/main.py) to allow the Vercel domain:
    ```python
    allow_origins=[
        "http://localhost:3000",
        "https://<your-project>.vercel.app",
    ]
    ```

**Deploy steps:**
1. Go to [vercel.com/new](https://vercel.com/new) → Import the GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Add the environment variable in *Project Settings → Environment Variables*:
    ```
    NEXT_PUBLIC_API_BASE = https://<your-fastapi-host>/api/v1
    ```
4. Click **Deploy**. Vercel auto-detects Next.js and applies optimal build settings.

**Notes:**
*   Vercel runs `npm run build` automatically on each push to the configured branch.
*   The `NEXT_PUBLIC_` prefix exposes the variable to the browser bundle — do **not** use this prefix for secrets.
*   Preview deployments are created automatically for every pull request, enabling easy staging reviews.
