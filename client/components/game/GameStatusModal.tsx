import styles from "./GameStatusModal.module.css";

interface Props {
  status: "won" | "lost";
  level: number;
  onRestart: () => void;
  onLevels: () => void;
  onNextLevel: () => void;
  onReview: () => void;
  phase: string;
}

export default function GameStatusModal({
  status,
  level,
  onRestart,
  onLevels,
  onNextLevel,
  onReview,
  phase,
}: Props) {
  const isWon = status === "won";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div
          className={`${styles.iconGrid} ${isWon ? styles.iconWon : styles.iconLost}`}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={styles.iconTile}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>

        <h2 className={styles.heading}>
          {isWon
            ? phase === "reviewed"
              ? "Pattern reviewed"
              : "Pattern Found"
            : "Pattern Lost"}
        </h2>

        <p className={styles.sub}>
          {isWon
            ? `You uncovered every tile on level ${level}.`
            : `The pattern on level ${level} got the better of you.`}
        </p>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onRestart}>
            Try Again
          </button>
          <button className={styles.secondaryBtn} onClick={onLevels}>
            All Levels
          </button>
          {isWon && (
            <>
              <button className={styles.secondaryBtn} onClick={onNextLevel}>
                Next level ({level + 1})
              </button>
              <button className={styles.secondaryBtn} onClick={onReview}>
                Review this level {phase === "reviewed" && "again"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
