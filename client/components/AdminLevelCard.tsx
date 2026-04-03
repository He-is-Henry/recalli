import { useRouter } from "next/navigation";
import { LevelWithPattern } from "@/lib/api";
import styles from "./AdminLevelCard.module.css";

interface Props {
  level: LevelWithPattern;
}

export default function AdminLevelCard({ level }: Props) {
  const router = useRouter();
  const [rows, cols] = level.grid;
  const total = rows * cols;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.number}>Level {level.level}</span>
        <span className={styles.grid}>
          {rows}×{cols}
        </span>
      </div>

      <div
        className={styles.miniGrid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`${styles.miniTile} ${level.pattern.includes(i + 1) ? styles.active : ""}`}
          />
        ))}
      </div>

      <p className={styles.story}>{level.story}</p>

      <div className={styles.actions}>
        <button
          className={styles.editBtn}
          onClick={() => router.push(`/admin/levels/${level._id}`)}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
