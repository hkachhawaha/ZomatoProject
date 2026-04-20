"use client";

import styles from "./CompactCard.module.css";
import { RestaurantRecommendation } from "@/types";

interface CompactCardProps {
  restaurant: RestaurantRecommendation;
  index: number;
}

function getCostTier(cost: string): string {
  const num = parseFloat(cost.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "$$";
  if (num <= 500) return "$";
  if (num <= 1000) return "$$";
  if (num <= 2000) return "$$$";
  return "$$$$";
}

const cuisineIcons: Record<string, string> = {
  italian: "🍝",
  chinese: "🥢",
  indian: "🍛",
  north: "🍛",
  south: "🥘",
  japanese: "🍣",
  mexican: "🌮",
  thai: "🍜",
  default: "🍴",
};

function getCuisineIcon(cuisine: string): string {
  const lower = cuisine.toLowerCase();
  for (const [key, icon] of Object.entries(cuisineIcons)) {
    if (lower.includes(key)) return icon;
  }
  return cuisineIcons.default;
}

export default function CompactCard({ restaurant, index }: CompactCardProps) {
  const costTier = getCostTier(restaurant.cost);
  const cuisineLabel = restaurant.cuisine.split(",").slice(0, 2).join(" • ").toUpperCase();
  const icon = getCuisineIcon(restaurant.cuisine);

  // Truncate explanation to ~120 chars
  const shortExplanation =
    restaurant.explanation.length > 120
      ? restaurant.explanation.slice(0, 117) + "..."
      : restaurant.explanation;

  return (
    <div className={styles.card} id={`compact-card-${index}`} style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
      <div className={styles.topRow}>
        <div className={styles.nameGroup}>
          <div className={styles.name}>{restaurant.name}</div>
          <div className={styles.cuisineLabel}>{cuisineLabel}</div>
        </div>
        <div className={styles.icon}>{icon}</div>
      </div>

      <div className={styles.explanation}>&ldquo;{shortExplanation}&rdquo;</div>

      <div className={styles.bottomRow}>
        <span className={styles.costTier}>{costTier}</span>
        <span className={styles.ratingPill}>{restaurant.rating} Rating</span>
      </div>
    </div>
  );
}
