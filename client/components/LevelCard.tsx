import { Level } from "@/lib/api";
import styles from "./LevelCard.module.css";

interface Props {
  level: Level;
  onClick: () => void;
}

export default function LevelCard({ level, onClick }: Props) {
  const [rows, cols] = level.grid;

  console.log(level);
  return (
    <button
      className={`${styles.card} ${level.status ? styles[level.status] : ""}`}
      onClick={onClick}
    >
      <div className={styles.top}>
        <span className={styles.number}>Level {level.level}</span>
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
