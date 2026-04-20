"use client";

import styles from "./Header.module.css";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  return (
    <header className={styles.header} id="app-header">
      <div className={styles.logo}>
        Zomato <span>AI</span>
      </div>

      <div className={styles.searchContainer}>
        <input
          id="ai-scout-search"
          type="text"
          className={styles.searchInput}
          placeholder="Ask AI Scout for a place..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit();
          }}
        />
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      <div className={styles.headerActions}>
        <button className={styles.iconButton} aria-label="Notifications" id="btn-notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className={styles.avatar} id="btn-profile">
          H
        </div>
      </div>
    </header>
  );
}
