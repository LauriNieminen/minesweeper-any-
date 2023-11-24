"use client";
import { useState } from "react";

import {
  createCoordinateKey,
  action,
  flag,
  GameState,
  MinesweeperGame,
  initializeGame,
} from "./game";
import CellComponent from "./CellComponent";

export default function Home() {
  const [boardSize, setBoardSize] = useState(10);
  const numMines = Math.floor(boardSize * boardSize * 0.2);
  const [game, setGame] = useState<MinesweeperGame>(() =>
    initializeGame(boardSize, boardSize, numMines)
  );

  const [turnCount, setTurnCount] = useState(0);

  const handleLeftClick = (e: React.MouseEvent, x: number, y: number) => {
    console.log("left click", x, y);
    e.preventDefault();
    const newGame = action(x, y, game);
    setGame(newGame);
    console.log(game);
    setTurnCount(turnCount + 1);
  };

  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    console.log("right click", x, y);
    e.preventDefault();
    const newGame = flag(x, y, game);
    setGame(newGame);
    console.log(game);
    setTurnCount(turnCount + 1);
  };

  const rows = Array.from({ length: game.height }, (_, y) => y);
  const cols = Array.from({ length: game.width }, (_, x) => x);

  console.log(game);

  // dirty workaround to avoid configuring tailwind to support dynamic grid-template-columns
  const colsStyle = {
    gridTemplateColumns: `repeat(${game.width}, minmax(0, 1fr))`,
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col gap-6">
        <h2 className="mb-2 p-2 text-2xl text-center">Minesweeper</h2>
        <div style={colsStyle} className={`grid gap-x-1 gap-y-1 w-fit `}>
          {rows.map((y) =>
            cols.map((x) => {
              const coordinate = createCoordinateKey(x, y);
              return (
                <CellComponent
                  key={coordinate}
                  gameState={game.state}
                  cell={game.board[coordinate]}
                  onClick={(e) => handleLeftClick(e, x, y)}
                  onRightClick={(e) => handleRightClick(e, x, y)}
                />
              );
            })
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <p>mines: {numMines}</p>
            <p>flags remaining: {game.flagsRemaining}</p>
          </div>
          <button
            className="h-10 rounded-lg bg-slate-400 hover:bg-slate-300 p-2"
            onClick={() => setGame(initializeGame(boardSize, boardSize, numMines))}
          >
            Reset
          </button>

          {game.state === GameState.Won && <p>You won!</p>}
          {game.state === GameState.Lost && <p>You lost!</p>}

          <p>Choose the difficulty:</p>
          <div className="flex flex-row gap-2">
            {[8, 10, 15].map((size) => (
              <button
                className="h-10 rounded-lg bg-slate-400 hover:bg-slate-300 p-2"
                key={size}
                onClick={() => {
                  setBoardSize(size);
                  setGame(
                    initializeGame(size, size, Math.floor(size * size * 0.2))
                  );
                }}
              >
                {size} x {size} board
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
