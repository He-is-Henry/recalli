import Tile, { TileState } from "./Tile";
import styles from "./GameBoard.module.css";

interface Props {
  rows: number;
  cols: number;
  found: number[];
  isLost: boolean;
  onTileClick: (index: number) => Promise<boolean | undefined>;
  warned: number[];
}

export default function GameBoard({
  rows,
  cols,
  found,
  isLost,
  onTileClick,
  warned,
}: Props) {
  const total = rows * cols;

  const getState = (index: number): TileState => {
    if (found.includes(index)) return "correct";
    if (warned.includes(index)) return "warned";
    return "hidden";
  };

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        return (
          <Tile
            key={i}
            index={i + 1}
            state={getState(i + 1)}
            isLost={isLost}
            onClick={onTileClick}
          />
        );
      })}
    </div>
  );
}
