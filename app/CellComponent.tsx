"use client";

import { Cell, GameState } from "./game";

type CellComponentProps = {
  gameState: GameState;
  cell: Cell;
  onClick: (e: React.MouseEvent) => void;
  onRightClick: (e: React.MouseEvent) => void;
};

const CellComponent = ({
  gameState,
  cell,
  onClick,
  onRightClick,
}: CellComponentProps) => {
  const isInteractable = !cell.isRevealed && gameState === GameState.InProgress;
  const interActableStyle = isInteractable ? "hover:bg-gray-300" : "";

  return (
    <button
      className={`aspect-square w-8 h-8 bg-blue-300 rounded flex items-center justify-center ${interActableStyle}`}
      onClick={onClick}
          onContextMenu={onRightClick}
    >
      {cell.isFlagged && !cell.isMine && gameState === GameState.Lost ? (
        cell.neighboringMines
      ) : cell.isFlagged ? (
        "🚩"
      ) : !cell.isRevealed ? (
        ""
      ) : cell.isMine && cell.isRevealed ? (
        "💣"
      ) : (
        cell.neighboringMines
      )}
    </button>
  );
};

export default CellComponent;
