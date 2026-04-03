"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminGetLevels, LevelWithPattern, ApiError } from "@/lib/api";
import AdminLevelCard from "@/components/AdminLevelCard";
import styles from "./levels.module.css";

export default function AdminLevelsPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<LevelWithPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGetLevels()
      .then(setLevels)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load levels",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Levels</h1>
          <p className={styles.subtitle}>Manage all game levels</p>
        </div>
        <button
          className={styles.newBtn}
          onClick={() => router.push("/admin/levels/new")}
        >
          + New Level
        </button>
      </header>

      {loading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {levels.map((level) => (
            <AdminLevelCard key={level._id} level={level} />
          ))}
        </div>
      )}
    </main>
  );
}
