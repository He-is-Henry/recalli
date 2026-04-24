"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  startSession,
  clickTile,
  restartSession,
  GameSession,
  ApiError,
  reviewSession,
  ReviewResult,
} from "@/lib/api";
import GameBoard from "@/components/GameBoard";
import GameStatusModal from "@/components/GameStatusModal";
import styles from "./play.module.css";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const level = Number(params.level);

  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<
    "clue" | "playing" | "reviewing" | "reviewed"
  >("clue");
  const [clueOpen, setClueOpen] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [warned, setWarned] = useState<number[]>([]);

  const triggerWarn = (index: number) => {
    setWarned((prev) => [...prev, index]);

    setTimeout(() => {
      setWarned((prev) => prev.filter((i) => i !== index));
    }, 3000);
  };
  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await startSession(level);
      setSession(data);
      // If resuming a session already in progress, skip clue screen
      if (data.status !== "playing" || data.found.length > 0) {
        setPhase("playing");
      } else {
        setPhase("clue");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load level");
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleTileClick = async (boxIndex: number) => {
    if (phase === "reviewing") return;
    if (!session || clicking) return;
    setClicking(true);
    try {
      const result = await clickTile(level, boxIndex);
      const isWrong =
        result.status !== "won" && !result.found.includes(boxIndex);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              found: result.found,
              status: result.status,
            }
          : prev,
      );

      if (isWrong) triggerWarn(boxIndex);
      return isWrong;
    } catch (err) {
      console.log(err);
      // tile click errors are non-fatal, session state is source of truth
    } finally {
      setClicking(false);
    }
  };

  const handleRestart = async () => {
    try {
      await restartSession(level);
      await loadSession();
      setPhase("clue");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restart");
    }
  };

  const handleReviewTileClick = async (
    click: ReviewResult["clicks"][number],
  ) => {
    if (!click) return;

    if (click.correct) {
      setSession((prev) =>
        prev ? { ...prev, found: [...prev.found, click.boxIndex] } : prev,
      );
    }

    if (!click.correct) triggerWarn(click.boxIndex);

    return !click.correct;
  };

  const handleReview = async () => {
    try {
      const res = await reviewSession(level);
      setPhase("reviewing");

      setSession((prev) => (prev ? { ...prev, found: [] } : prev));
      setWarned([]);
      let i: number = 0;

      const playNext = () => {
        console.log(i);
        console.log(res.clicks);
        if (i >= res.clicks.length) {
          return setPhase("reviewed");
        }

        const click = res.clicks[i];
        handleReviewTileClick(click);
        i++;
        setTimeout(playNext, 1500);
      };
      playNext();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to review");
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loaderGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={styles.loaderTile}
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>{error}</p>
        <button
          className={styles.backBtn}
          onClick={() => router.push("/levels")}
        >
          Back to Levels
        </button>
      </main>
    );
  }

  if (!session) return null;

  // Clue / pre-game screen
  if (phase === "clue") {
    return (
      <main className={styles.main}>
        <div className={styles.clueScreen}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/levels")}
          >
            ← Levels
          </button>

          <span className={styles.levelBadge}>Level {level}</span>
          <h1 className={styles.clueHeading}>Read the clue</h1>
          <p className={styles.storyText}>{session.story}</p>

          {session.audio && (
            <audio className={styles.audio} controls src={session.audio} />
          )}

          {session.video && (
            <video className={styles.video} controls src={session.video} />
          )}

          <button
            className={styles.beginBtn}
            onClick={() => setPhase("playing")}
          >
            Begin →
          </button>
        </div>
      </main>
    );
  }

  // Game screen
  return (
    <main className={styles.main}>
      {session.status !== "playing" && phase !== "reviewing" && (
        <GameStatusModal
          status={session.status as "won" | "lost"}
          level={level}
          onRestart={handleRestart}
          onLevels={() => router.push("/levels")}
          onNextLevel={() => router.push(`/play/${level + 1}`)}
          onReview={handleReview}
          phase={phase}
        />
      )}

      <div className={styles.gameHeader}>
        <button
          className={styles.backBtn}
          onClick={() => router.push("/levels")}
        >
          ← Levels
        </button>

        <span className={styles.levelBadge}>Level {level}</span>
      </div>

      {/* Collapsible clue */}
      <div className={styles.clueCollapsible}>
        <button
          className={styles.clueToggle}
          onClick={() => setClueOpen((v) => !v)}
        >
          {clueOpen ? "Hide clue ↑" : "Show clue ↓"}
        </button>
        {clueOpen && (
          <div className={styles.clueDropdown}>
            <p className={styles.storyText}>{session.story}</p>
            {session.audio && (
              <audio controls src={session.audio} className={styles.audio} />
            )}
            {session.video && (
              <video controls src={session.video} className={styles.video} />
            )}
          </div>
        )}
      </div>

      <div className={styles.boardWrapper}>
        <GameBoard
          rows={session.grid[0]}
          cols={session.grid[1]}
          found={session.found}
          isLost={session.status === "lost"}
          onTileClick={handleTileClick}
          warned={warned}
        />
      </div>

      <p className={styles.progress}>
        {session.found.length} / {session.totalCorrect} found
      </p>
    </main>
  );
}
