"use client";

import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  searchContext: string | null;
  hasResults: boolean;
  isLoading: boolean;
}

export default function HeroSection({ searchContext, hasResults, isLoading }: HeroSectionProps) {
  if (isLoading) {
    return (
      <div className={styles.hero}>
        <div className={styles.badge}>
          <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          AI SCOUTING IN PROGRESS
        </div>
        <h1 className={styles.headline}>
          Finding your perfect <span className={styles.headlineAccent}>match...</span>
        </h1>
        <div className={styles.loadingContainer}>
          <div className={`${styles.loadingCard} skeleton`} />
          <div style={{ display: "flex", gap: "var(--space-md)" }}>
            <div className={`${styles.loadingSmall} skeleton`} style={{ flex: 1 }} />
            <div className={`${styles.loadingSmall} skeleton`} style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!hasResults && !searchContext) {
    return (
      <div className={styles.hero}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <div className={styles.emptyTitle}>Ready to discover your next meal?</div>
          <div className={styles.emptyDescription}>
            Set your preferences in the sidebar and let our AI Scout find the perfect restaurants for you.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.hero} id="hero-section">
      <div className={styles.badge}>
        <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        AI SCOUTING COMPLETE
      </div>
      <h1 className={styles.headline}>
        Curated for your <span className={styles.headlineAccent}>mood.</span>
      </h1>
      {searchContext && (
        <p className={styles.contextBlurb}>
          Based on your recent search for &ldquo;{searchContext}&rdquo;
        </p>
      )}
    </div>
  );
}
