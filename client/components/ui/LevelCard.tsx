import { Level } from "@/lib/api";
import styles from "./LevelCard.module.css";
import toast from "react-hot-toast";

interface Props {
  level: Level;
  onClick: () => void;
  canPlay: boolean;
  bestTime: number | null;
}

export default function LevelCard({ level, onClick, canPlay, bestTime }: Props) {
  const [rows, cols] = level.grid || [3, 3];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const cannotPlay = () => {
    toast.error("Please complete previous levels");
  };

  return (
    <button
      className={`${styles.card} ${level.status ? styles[level.status] : ""}`}
      onClick={canPlay ? onClick : cannotPlay}
    >
      <div className={styles.top}>
        <span className={styles.number}>Level {level.level}</span>
        {bestTime !== undefined && bestTime !== null && (
          <span className={styles.bestTimeBadge}>
            ⏱ {formatTime(bestTime)}
          </span>
        )}
        <span className={styles.grid}>
          {rows}×{cols}
        </span>
      </div>

      <p className={styles.story}>{level.story}</p>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {level.audio && <span className={styles.tag}>🔊 Audio</span>}
          {level.video && <span className={styles.tag}>🎬 Video</span>}
        </div>

        {level.status === null && <span className={styles.cta}>Play →</span>}

        {level.status === "won" && (
          <span className={styles.wonBadge}>✓ Completed</span>
        )}

        {level.status === "lost" && (
          <span className={styles.lostBadge}>✕ Failed</span>
        )}

        {level.status === "playing" && (
          <span className={styles.playingBadge}>{level.progress}%</span>
        )}
      </div>

      {level.status === "playing" && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${level.progress}%` }}
          />
        </div>
      )}
    </button>
  );
}