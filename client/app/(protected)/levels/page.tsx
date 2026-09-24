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

  // Account menu & logout modal states
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        <h1 className={styles.title}>Recalli</h1>

        {user && (
          <div className={styles.userMenuContainer}>
            <button
              className={styles.userMenuTrigger}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <span className={styles.userAvatar}>
                {user.email?.[0]?.toUpperCase() || "U"}
              </span>
              <span className={styles.userEmail}>{user.email}</span>
              <span className={styles.dropdownChevron}>▾</span>
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className={styles.menuBackdrop}
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className={styles.userDropdown}>
                  <div className={styles.userInfoHeader}>
                    <p className={styles.userDropdownEmail}>{user.email}</p>
                    <p className={styles.userDropdownId}>ID: {user._id}</p>
                  </div>
                  <button
                    className={styles.logoutDropdownBtn}
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Logout</h3>
            <p className={styles.modalText}>
              Are you sure you want to log out of Recalli?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.confirmLogoutBtn} onClick={logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}