"use client";

import Image from "next/image";
import styles from "./FeaturedCard.module.css";
import { RestaurantRecommendation } from "@/types";

interface FeaturedCardProps {
  restaurant: RestaurantRecommendation;
  imageUrl: string;
  index: number;
}

function getMatchPercent(rating: number): number {
  return Math.min(Math.round((rating / 5) * 100), 99);
}

function getCostTier(cost: string): string {
  const num = parseFloat(cost.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "$$";
  if (num <= 500) return "$";
  if (num <= 1000) return "$$";
  if (num <= 2000) return "$$$";
  return "$$$$";
}

export default function FeaturedCard({ restaurant, imageUrl, index }: FeaturedCardProps) {
  const matchPct = getMatchPercent(restaurant.rating);
  const costTier = getCostTier(restaurant.cost);
  const cuisineLabel = restaurant.cuisine.split(",")[0].trim().toUpperCase();

  return (
    <div className={styles.card} id={`featured-card-${index}`} style={{ animationDelay: `${0.1 + index * 0.15}s` }}>
      {/* Image */}
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={restaurant.name}
          fill
          className={styles.image}
          sizes="340px"
          priority={index === 0}
        />
        <div className={styles.matchBadge}>{matchPct}% MATCH</div>
      </div>

      {/* Details */}
      <div className={styles.details}>
        <div className={styles.topRow}>
          <h2 className={styles.name}>{restaurant.name}</h2>
          <div className={styles.ratingBadge}>
            {restaurant.rating} <span className={styles.starIcon}>★</span>
          </div>
        </div>

        <div className={styles.meta}>
          <span>{costTier}</span>
          <span className={styles.metaDot} />
          <span>{cuisineLabel}</span>
        </div>

        <div className={styles.whySection}>
          <div className={styles.whyBadge}>Why We Picked This</div>
          <div className={styles.whyText}>
            &ldquo;{restaurant.explanation}&rdquo;
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.bookBtn} id={`book-${index}`}>Book Table</button>
          <button className={styles.bookmarkBtn} id={`bookmark-${index}`} aria-label="Bookmark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
