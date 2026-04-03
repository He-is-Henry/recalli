import styles from "./Tile.module.css";

export type TileState = "hidden" | "correct" | "warned";

interface Props {
  index: number;
  state: TileState;
  isLost: boolean;
  onClick: (index: number) => void;
}

export default function Tile({ index, state, isLost, onClick }: Props) {
  const handleClick = () => {
    if (state === "correct") return;
    if (isLost) return;
    onClick(index);
  };

  return (
    <button
      className={`${styles.tile} ${styles[state]} ${isLost ? styles.lost : ""}`}
      onClick={handleClick}
      aria-label={`Tile ${index + 1}`}
    />
  );
}
