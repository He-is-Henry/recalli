"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLevels, Level, ApiError } from "@/lib/api";
import LevelCard from "@/components/LevelCard";
import styles from "./levels.module.css";

export default function LevelsPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLevels()
      .then(setLevels)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load levels",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recalli</h1>
        <p className={styles.subtitle}>Choose a level to begin</p>
      </header>

      {loading && (
        <div className={styles.loadingRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeletonCard}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {levels.map((level) => (
            <LevelCard
              key={level.level}
              level={level}
              onClick={() => router.push(`/play/${level.level}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
