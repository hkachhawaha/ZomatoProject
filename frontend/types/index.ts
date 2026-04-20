export interface UserPreferences {
  locality: string;
  budget: number;
  cuisine?: string | null;
  min_rating: number;
  additional_preferences?: string | null;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  rating: number;
  cost: string;
  explanation: string;
  latitude?: number;
  longitude?: number;
}

export type BudgetTier = "$" | "$$" | "$$$" | "$$$$";

export type RatingTier = "4.5" | "4.0" | "3.5";

export type DietaryTag = "Vegan" | "Gluten Free" | "Keto Friendly";

export const BUDGET_MAP: Record<BudgetTier, number> = {
  $: 500,
  $$: 1000,
  $$$: 2000,
  $$$$: 5000,
};
