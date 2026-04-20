"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
import CompactCard from "@/components/CompactCard";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
import { fetchLocalities, fetchRecommendations } from "@/lib/api";
import {
  BudgetTier,
  RatingTier,
  DietaryTag,
  BUDGET_MAP,
  RestaurantRecommendation,
} from "@/types";
import styles from "./page.module.css";

const FEATURED_IMAGES = ["/restaurant-1.png", "/restaurant-2.png"];

export default function Home() {
  // Sidebar state
  const [localities, setLocalities] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>("$$");
  const [selectedRating, setSelectedRating] = useState<RatingTier>("4.0");
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Results state
  const [results, setResults] = useState<RestaurantRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch localities on mount
  useEffect(() => {
    fetchLocalities()
      .then((locs) => {
        setLocalities(locs);
        if (locs.length > 0) setSelectedLocality(locs[0]);
      })
      .catch((err) => {
        console.error("Failed to fetch localities:", err);
        setLocalities(["Banashankari", "Whitefield", "Indiranagar", "Koramangala"]);
        setSelectedLocality("Banashankari");
      });
  }, []);

  const handleDietaryToggle = useCallback((tag: DietaryTag) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedLocality) return;

    setIsLoading(true);
    setError(null);

    // Build additional preferences from dietary + search query
    const prefParts: string[] = [];
    if (selectedDietary.length > 0) {
      prefParts.push(`Dietary: ${selectedDietary.join(", ")}`);
    }
    if (searchQuery.trim()) {
      prefParts.push(searchQuery.trim());
    }
    const additionalPrefs = prefParts.length > 0 ? prefParts.join(". ") : undefined;

    try {
      const recs = await fetchRecommendations({
        locality: selectedLocality,
        budget: BUDGET_MAP[selectedBudget],
        cuisine: undefined,
        min_rating: parseFloat(selectedRating),
        additional_preferences: additionalPrefs || null,
      });

      setResults(recs);
      setSearchContext(
        searchQuery.trim() || `${selectedLocality}, ${selectedBudget} budget, ${selectedRating}+ rating`
      );
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("Failed to get recommendations. Is the backend running?");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocality, selectedBudget, selectedRating, selectedDietary, searchQuery]);

  const handleSearchSubmit = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // Split results: first 2 featured, rest compact
  const featuredResults = results.slice(0, 2);
  const compactResults = results.slice(2);

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <div className={styles.layout}>
        <div className={styles.sidebarColumn}>
          <Sidebar
            localities={localities}
            selectedLocality={selectedLocality}
            onLocalityChange={setSelectedLocality}
            selectedBudget={selectedBudget}
            onBudgetChange={setSelectedBudget}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            selectedDietary={selectedDietary}
            onDietaryToggle={handleDietaryToggle}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        <main className={styles.mainContent} id="results-area">
          {results.length > 0 && (
            <div className={styles.viewToggle}>
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? styles.active : ''}>List View</button>
              <button onClick={() => setViewMode('map')} className={viewMode === 'map' ? styles.active : ''}>Map View</button>
            </div>
          )}
          {viewMode === 'list' && (
            <>
              <HeroSection
                searchContext={searchContext}
                hasResults={results.length > 0}
                isLoading={isLoading}
              />

          {error && (
            <div className={styles.errorBanner} id="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Featured Cards */}
          {featuredResults.length > 0 && (
            <div className={styles.featuredSection}>
              {featuredResults.map((r, i) => (
                <FeaturedCard
                  key={`${r.name}-${i}`}
                  restaurant={r}
                  imageUrl={FEATURED_IMAGES[i % FEATURED_IMAGES.length]}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Compact Cards */}
          {compactResults.length > 0 && (
            <div className={styles.compactGrid}>
              {compactResults.map((r, i) => (
                <CompactCard
                  key={`${r.name}-${i}`}
                  restaurant={r}
                  index={i}
                />
              ))}
            </div>
          )}
            </>
          )}
          {viewMode === 'map' && (
            <div className={styles.mapFull}>
              <Map restaurants={results} />
            </div>
          )}


        </main>
      </div>
    </>
  );
}
