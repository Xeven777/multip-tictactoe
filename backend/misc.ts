interface GameState {
  board: string[][];
  players: (string | null)[];
  currentPlayer: string | null;
  winner: string | null | "draw";
  movesMade: number;
}

interface Board {
  [index: number]: string[];
}

interface Games {
  [key: string]: GameState;
}

function checkWinner(board: Board): string | null {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][0] === board[i][2]
    ) {
      return board[i][0];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[0][i] === board[2][i]
    ) {
      return board[0][i];
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  ) {
    return board[0][0];
  }
  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  ) {
    return board[0][2];
  }

  return null; // No winner
}

export { Board, Games, checkWinner };
