export type Coordinate = string; // Format: "x-y", e.g., "3-4"

export type Cell = {
  x: number;
  y: number;
  isRevealed: boolean;
  isFlagged: boolean;
  isMine: boolean;
  neighboringMines: number;
};

export type Board = {
  [coordinate in Coordinate]: Cell;
};

export enum GameState {
  InProgress,
  Won,
  Lost,
}

export type MinesweeperGame = {
  board: Board;
  state: GameState;
  mineCount: number;
  flagsRemaining: number;
  elapsedTime: number; // in seconds
  width: number; // Board width
  height: number; // Board height
};

// Helper function to create a coordinate key from x and y values
export function createCoordinateKey(x: number, y: number): Coordinate {
  return `${x}-${y}`;
}

// Helper function to parse a coordinate key into x and y values
function parseCoordinateKey(coordinate: Coordinate): { x: number; y: number } {
  const [x, y] = coordinate.split("-").map(Number);
  return { x, y };
}

export function initializeBoard(
  width: number,
  height: number,
  mineCount: number
): Board {
  // Create an empty board
  let board: Board = {};

  // Initialize all cells without mines
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinate = createCoordinateKey(x, y);
      board[coordinate] = {
        x: x,
        y: y,
        isRevealed: false,
        isFlagged: false,
        isMine: false,
        neighboringMines: 0,
      };
    }
  }

  // Randomly place mines
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    let coordinate = createCoordinateKey(x, y);

    if (!board[coordinate].isMine) {
      board[coordinate].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighboring mines for each cell
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const coordinate = createCoordinateKey(x, y);
      board[coordinate].neighboringMines = countNeighboringMines(
        x,
        y,
        board,
        width,
        height
      );
    }
  }

  return board;
}

// Assuming the previous definitions are in scope

export function initializeGame(
  width: number,
  height: number,
  mineCount: number
): MinesweeperGame {
  const board = initializeBoard(width, height, mineCount);
  return {
    board,
    state: GameState.InProgress,
    mineCount,
    flagsRemaining: mineCount,
    elapsedTime: 0,
    width,
    height,
  };
}

function countNeighboringFlags(
  x: number,
  y: number,
  board: Board,
  width: number,
  height: number
): number {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const neighborCoord = createCoordinateKey(nx, ny);
        if (board[neighborCoord].isFlagged) {
          count++;
        }
      }
    }
  }
  return count;
}

function countNeighboringMines(
  x: number,
  y: number,
  board: Board,
  width: number,
  height: number
): number {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the cell itself
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const neighborCoord = createCoordinateKey(nx, ny);
        if (board[neighborCoord].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}

const revealAllMines = (board: Board): Board => {
  return Object.values(board).reduce((newBoard, cell) => {
    newBoard[cell.x + "-" + cell.y] = {
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    };
    return newBoard;
  }, {} as Board);
};

const isWon = (game: MinesweeperGame): boolean => {
  const unrevealedCells = Object.values(game.board).filter(
    (cell) => !cell.isRevealed
  );
  return (
    unrevealedCells.length === game.mineCount && game.state !== GameState.Lost
  );
};

export const flag = (
  x: number,
  y: number,
  game: MinesweeperGame
): MinesweeperGame => {
  let newGame = { ...game };
  const coordinate = createCoordinateKey(x, y);

  if (newGame.state !== GameState.InProgress) {
    return newGame;
  }

  if (newGame.board[coordinate].isRevealed) {
    return newGame;
  }

  newGame.board[coordinate].isFlagged = !newGame.board[coordinate].isFlagged;

  if (newGame.board[coordinate].isFlagged) {
    newGame.flagsRemaining--;
  } else {
    newGame.flagsRemaining++;
  }

  return newGame;
};

export const action = (
  x: number,
  y: number,
  game: MinesweeperGame
): MinesweeperGame => {
  let newGame = { ...game };
  const coordinate = createCoordinateKey(x, y);

  if (newGame.state !== GameState.InProgress) {
    return newGame;
  }

  if (newGame.board[coordinate].isRevealed) {
    if (
      countNeighboringFlags(
        x,
        y,
        newGame.board,
        newGame.width,
        newGame.height
      ) === newGame.board[coordinate].neighboringMines
    ) {
      const { x, y } = parseCoordinateKey(coordinate);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (
            nx >= 0 &&
            nx < newGame.width &&
            ny >= 0 &&
            ny < newGame.height &&
            !(dx === 0 && dy === 0) &&
            !newGame.board[createCoordinateKey(nx, ny)].isRevealed &&
            !newGame.board[createCoordinateKey(nx, ny)].isFlagged
          ) {
            newGame = action(nx, ny, newGame);
          }
        }
      }
    }

    return newGame;
  }

  if (newGame.board[coordinate].isMine) {
    newGame.state = GameState.Lost;
    newGame.board = revealAllMines(newGame.board);
    return newGame;
  }

  newGame.board[coordinate].isRevealed = true;

  if (newGame.board[coordinate].neighboringMines === 0) {
    const { x, y } = parseCoordinateKey(coordinate);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          nx < newGame.width &&
          ny >= 0 &&
          ny < newGame.height &&
          !(dx === 0 && dy === 0)
        ) {
          newGame = action(nx, ny, newGame);
        }
      }
    }
  }

  if (isWon(newGame)) {
    newGame.state = GameState.Won;
  }

  return newGame;
};
