"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLevels, getMySessions, Level, GameSession, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LevelCard from "@/components/ui/LevelCard";
import HealthcareSection from "@/components/HealthCareSection";
import styles from "./levels.module.css";

export default function LevelsPage() {
  const router = useRouter();
  const { user, logout } = useUser();

  const [levels, setLevels] = useState<Level[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLevelsData() {
      try {
        const [levelsData, sessionsData] = await Promise.all([
          getLevels(),
          getMySessions(),
        ]);
        setLevels(levelsData);
        setSessions(sessionsData);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load levels"
        );
      } finally {
        setLoading(false);
      }
    }

    loadLevelsData();
  }, []);

  const isLevelUnlocked = (levelNum: number): boolean => {
    if (levelNum === 1) return true;
    return sessions.some(
      (s) => s.level === levelNum - 1 && s.status === "won"
    );
  };

  const getBestTimeForLevel = (levelNum: number): number | null => {
    const wonSessions = sessions.filter(
      (s) => s.level === levelNum && s.status === "won" && s.duration != null
    );
    if (wonSessions.length === 0) return null;
    return Math.min(...wonSessions.map((s) => s.duration!));
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Recalli</h1>
            {user && (
              <p className={styles.userBadge}>
                Logged in as <strong>{user.email}</strong> (ID: {user.publicId})
              </p>
            )}
          </div>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <HealthcareSection />

      <section className={styles.levelsSection}>
        <h2 className={styles.sectionTitle}>Select Level</h2>

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
            {levels.map((level) => {
              const canPlay = isLevelUnlocked(level.level);
              const bestTime = getBestTimeForLevel(level.level);

              return (
                <LevelCard
                  key={level._id || level.level}
                  level={level}
                  canPlay={canPlay}
                  bestTime={bestTime}
                  onClick={() => router.push(`/play/${level.level}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}