import styles from "./PatternPicker.module.css";

interface Props {
  rows: number;
  cols: number;
  pattern: number[];
  onChange: (pattern: number[]) => void;
}

export default function PatternPicker({
  rows,
  cols,
  pattern,
  onChange,
}: Props) {
  const total = rows * cols;

  const toggle = (index: number) => {
    if (pattern.includes(index)) {
      onChange(pattern.filter((i) => i !== index));
    } else {
      onChange([...pattern, index]);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.tile} ${pattern.includes(i + 1) ? styles.selected : ""}`}
            onClick={() => toggle(i + 1)}
          />
        ))}
      </div>
      <p className={styles.hint}>
        {pattern.length} tile{pattern.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
