"use client";

import styles from "./Sidebar.module.css";
import GoldCard from "./GoldCard";
import { BudgetTier, RatingTier, DietaryTag, BUDGET_MAP } from "@/types";

interface SidebarProps {
  localities: string[];
  selectedLocality: string;
  onLocalityChange: (val: string) => void;
  selectedBudget: BudgetTier;
  onBudgetChange: (val: BudgetTier) => void;
  selectedRating: RatingTier;
  onRatingChange: (val: RatingTier) => void;
  selectedDietary: DietaryTag[];
  onDietaryToggle: (tag: DietaryTag) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const budgetTiers: BudgetTier[] = ["$", "$$", "$$$", "$$$$"];
const ratingOptions: { value: RatingTier; label: string; sub?: string }[] = [
  { value: "4.5", label: "4.5+", sub: "(AI Verified)" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
];
const dietaryTags: DietaryTag[] = ["Vegan", "Gluten Free", "Keto Friendly"];

export default function Sidebar({
  localities,
  selectedLocality,
  onLocalityChange,
  selectedBudget,
  onBudgetChange,
  selectedRating,
  onRatingChange,
  selectedDietary,
  onDietaryToggle,
  onSubmit,
  isLoading,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar} id="filters-sidebar">
      {/* Location */}
      <div>
        <div className={styles.sectionLabel}>Location</div>
        <div className={styles.locationSelector}>
          <span className={styles.locationPin}>📍</span>
          <select
            id="select-locality"
            className={styles.locationInput}
            value={selectedLocality}
            onChange={(e) => onLocalityChange(e.target.value)}
          >
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className={styles.sectionLabel}>Budget</div>
        <div className={styles.budgetGroup}>
          {budgetTiers.map((tier) => (
            <button
              key={tier}
              id={`budget-${tier.length}`}
              className={selectedBudget === tier ? styles.budgetBtnActive : styles.budgetBtn}
              onClick={() => onBudgetChange(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <div className={styles.sectionLabel}>Min. Rating</div>
        <div className={styles.ratingGroup}>
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className={styles.ratingOption}
              id={`rating-${opt.value}`}
            >
              <div className={selectedRating === opt.value ? styles.radioOuterActive : styles.radioOuter}>
                <div className={selectedRating === opt.value ? styles.radioInnerActive : styles.radioInner} />
              </div>
              <span className={styles.ratingLabel}>{opt.label}</span>
              {opt.sub && <span className={styles.ratingSubLabel}>{opt.sub}</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div>
        <div className={styles.sectionLabel}>Dietary Preference</div>
        <div className={styles.chipGroup}>
          {dietaryTags.map((tag) => (
            <button
              key={tag}
              id={`diet-${tag.toLowerCase().replace(/\s/g, "-")}`}
              className={selectedDietary.includes(tag) ? styles.chipActive : styles.chip}
              onClick={() => onDietaryToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Find Button */}
      <button
        id="btn-find-restaurants"
        className={isLoading ? styles.findButtonLoading : styles.findButton}
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? "AI is scouting..." : "Find Restaurants"}
      </button>

      <GoldCard />
    </aside>
  );
}
