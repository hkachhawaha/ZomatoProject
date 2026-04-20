"use client";

import styles from "./GoldCard.module.css";

export default function GoldCard() {
  return (
    <div className={styles.card} id="gold-card">
      <div className={styles.title}>Join Gold AI</div>
      <div className={styles.description}>
        Get hyper-personalized daily meal plans and 30% off deliveries.
      </div>
      <button className={styles.upgradeBtn} id="btn-upgrade-gold">
        Upgrade Now
      </button>
    </div>
  );
}
