import { UserPreferences, RestaurantRecommendation } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

export async function fetchLocalities(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/localities`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch localities: ${res.status}`);
  }
  return res.json();
}

export async function fetchRecommendations(
  prefs: UserPreferences
): Promise<RestaurantRecommendation[]> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
