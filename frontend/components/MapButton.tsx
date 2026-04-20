"use client";

import styles from "./MapButton.module.css";

export default function MapButton() {
  return (
    <button className={styles.button} id="btn-view-map" aria-label="View Map">
      <span className={styles.icon}>📍</span>
      View Map
    </button>
  );
}
