import { Board } from '../board';
import { Cell, PlayerColor, RED, BLUE } from '../types';
import { DX, DY } from '../constants';

/**
 * Port of ComplexHeuristicPlayer.h
 * Complex heuristic AI with win detection, directional scoring,
 * run detection, and weighted offense/defense.
 */

let baseInit = false;

function inside(boardSize: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < boardSize && y < boardSize;
}

function baseValue(boardSize: number, x: number, y: number): number {
  const centerX = (boardSize - 1) / 2.0;
  const centerY = (boardSize - 1) / 2.0;
  const highest = boardSize * 2.0;
  const dist = Math.abs(x - centerX) + Math.abs(y - centerY);
  const base = highest - dist;
  return base < 1.0 ? 1.0 : base;
}

function wouldWinIfPlace(
  board: Board,
  x: number,
  y: number,
  ptype: number
): boolean {
  const boardSize = board.getBoardSize();

  if (!inside(boardSize, x, y)) {
    return false;
  }

  if (board.getGrid(x, y) !== 0) {
    return false;
  }

  const isMine = (i: number, j: number): boolean => {
    const v = board.getGrid(i, j);
    return v === ptype || (i === x && j === y);
  };

  const visited = new Uint8Array(boardSize * boardSize);
  const st: number[] = [];

  if (ptype === RED) {
    // Red: top -> bottom
    for (let c = 0; c < boardSize; ++c) {
      if (isMine(0, c)) {
        const idx = 0 * boardSize + c;
        visited[idx] = 1;
        st.push(idx);
      }
    }
    while (st.length > 0) {
      const idx = st.pop()!;
      const i = Math.floor(idx / boardSize);
      const j = idx % boardSize;

      if (i === boardSize - 1) {
        return true;
      }

      for (let k = 0; k < 6; ++k) {
        const ni = i + DX[k];
        const nj = j + DY[k];

        if (!inside(boardSize, ni, nj)) {
          continue;
        }

        const id2 = ni * boardSize + nj;
        if (!visited[id2] && isMine(ni, nj)) {
          visited[id2] = 1;
          st.push(id2);
        }
      }
    }
  } else {
    // Blue: left -> right
    for (let r = 0; r < boardSize; ++r) {
      if (isMine(r, 0)) {
        const idx = r * boardSize + 0;
        visited[idx] = 1;
        st.push(idx);
      }
    }
    while (st.length > 0) {
      const idx = st.pop()!;
      const i = Math.floor(idx / boardSize);
      const j = idx % boardSize;

      if (j === boardSize - 1) {
        return true;
      }

      for (let k = 0; k < 6; ++k) {
        const ni = i + DX[k];
        const nj = j + DY[k];

        if (!inside(boardSize, ni, nj)) {
          continue;
        }

        const id2 = ni * boardSize + nj;
        if (!visited[id2] && isMine(ni, nj)) {
          visited[id2] = 1;
          st.push(id2);
        }
      }
    }
  }
  return false;
}

function scoreCell(
  board: Board,
  x: number,
  y: number,
  playerType: PlayerColor
): number {
  const boardSize = board.getBoardSize();
  const oppType = -playerType as PlayerColor;

  const WIN_BONUS = 1e6;
  const BLOCK_BONUS = 5e5;
  if (wouldWinIfPlace(board, x, y, playerType)) {
    return WIN_BONUS;
  }
  if (wouldWinIfPlace(board, x, y, oppType)) {
    return BLOCK_BONUS;
  }

  const me = board.getNeighboursCount(playerType, x, y);
  const opponent = board.getNeighboursCount(oppType, x, y);

  let dirScore = 0;
  if (playerType === RED) {
    // Red: top->bottom
    if (inside(boardSize, x - 1, y) && board.getGrid(x - 1, y) === playerType) {
      dirScore += 2;
    }
    if (inside(boardSize, x + 1, y) && board.getGrid(x + 1, y) === playerType) {
      dirScore += 2;
    }
    if (inside(boardSize, x - 1, y + 1) && board.getGrid(x - 1, y + 1) === playerType) {
      dirScore += 1;
    }
    if (inside(boardSize, x + 1, y - 1) && board.getGrid(x + 1, y - 1) === playerType) {
      dirScore += 1;
    }
  } else {
    // Blue: left->right
    if (inside(boardSize, x, y - 1) && board.getGrid(x, y - 1) === playerType) {
      dirScore += 2;
    }
    if (inside(boardSize, x, y + 1) && board.getGrid(x, y + 1) === playerType) {
      dirScore += 2;
    }
    if (inside(boardSize, x - 1, y + 1) && board.getGrid(x - 1, y + 1) === playerType) {
      dirScore += 1;
    }
    if (inside(boardSize, x + 1, y - 1) && board.getGrid(x + 1, y - 1) === playerType) {
      dirScore += 1;
    }
  }

  let runAxis = 0;
  if (playerType === RED) {
    // vertical run for Red
    for (let i = x - 1; inside(boardSize, i, y) && board.getGrid(i, y) === playerType; --i) {
      runAxis++;
    }
    for (let i = x + 1; inside(boardSize, i, y) && board.getGrid(i, y) === playerType; ++i) {
      runAxis++;
    }
  } else {
    // horizontal run for Blue
    for (let j = y - 1; inside(boardSize, x, j) && board.getGrid(x, j) === playerType; --j) {
      runAxis++;
    }
    for (let j = y + 1; inside(boardSize, x, j) && board.getGrid(x, j) === playerType; ++j) {
      runAxis++;
    }
  }

  let me2 = 0;
  let opponent2 = 0;
  const seenF = new Set<number>();
  const seenO = new Set<number>();

  for (let k = 0; k < 6; ++k) {
    const nx = x + DX[k];
    const ny = y + DY[k];
    if (!inside(boardSize, nx, ny)) continue;

    {
      const q = board.getNeighbours(playerType, nx, ny);
      for (const id of q) {
        if (id === x * boardSize + y) continue;
        if (!seenF.has(id)) {
          seenF.add(id);
          me2++;
        }
      }
    }

    {
      const q = board.getNeighbours(oppType, nx, ny);
      for (const id of q) {
        if (id === x * boardSize + y) continue;
        if (!seenO.has(id)) {
          seenO.add(id);
          opponent2++;
        }
      }
    }
  }

  const progress = playerType === RED ? x : y;

  const progressNorm = progress / (boardSize - 1);

  const cx = (boardSize - 1) / 2.0;
  const cy = (boardSize - 1) / 2.0;

  let lane: number;
  if (playerType === RED) {
    const dyc = Math.abs(y - cy);
    lane = 1.0 - dyc / ((boardSize - 1) / 2.0 + 1e-9);
  } else {
    const dxc = Math.abs(x - cx);
    lane = 1.0 - dxc / ((boardSize - 1) / 2.0 + 1e-9);
  }
  if (lane < 0) {
    lane = 0;
  }

  const W_ME = 2.0;
  const W_MERGE = 1.5;
  const W_BLOCK = 2.0;
  const W_CUT = 1.0;
  const W_F2 = 0.8;
  const W_O2 = 0.6;
  const W_DIR = 6.0;
  const W_RUN = 5.0;
  const W_PROG = 8.0;
  const W_LANE = 2.0;

  const base = 1.0;
  const offense =
    W_ME * me +
    (me >= 2 ? W_MERGE : 0.0) +
    W_F2 * me2 +
    W_DIR * dirScore +
    W_RUN * runAxis +
    W_PROG * progressNorm +
    W_LANE * lane;

  const defense =
    W_BLOCK * opponent + (opponent >= 2 ? W_CUT : 0.0) + W_O2 * opponent2;

  return base + offense + defense;
}

function initBase(board: Board): void {
  if (baseInit) {
    return;
  }
  const boardSize = board.getBoardSize();

  const avail = board.getAvailableMovesRef();
  for (const c of avail) {
    const b = baseValue(boardSize, c.x, c.y);
    c.heuristic_p1 = b;
    c.heuristic_p2 = b;
  }
  baseInit = true;
}

export function getMove(
  board: Board,
  playerType: PlayerColor
): { x: number; y: number } | null {
  initBase(board);

  const avail = board.getAvailableMovesRef();

  if (avail.length === 0) {
    return null;
  }

  for (const c of avail) {
    const s = scoreCell(board, c.x, c.y, playerType);
    if (playerType === RED) {
      c.heuristic_p1 = s;
    } else {
      c.heuristic_p2 = s;
    }
  }

  let bestScore = -Infinity;
  let bestX = -1;
  let bestY = -1;

  if (playerType === RED) {
    for (const c of avail) {
      if (c.heuristic_p1 > bestScore) {
        bestScore = c.heuristic_p1;
        bestX = c.x;
        bestY = c.y;
      }
    }
  } else {
    for (const c of avail) {
      if (c.heuristic_p2 > bestScore) {
        bestScore = c.heuristic_p2;
        bestX = c.x;
        bestY = c.y;
      }
    }
  }

  if (bestX === -1) {
    return null;
  }

  return { x: bestX, y: bestY };
}

export function GenerateInitialHeuristic(
  board: Board,
  playerType: PlayerColor
): void {
  const moves = board.getAvailableMovesRef();
  const boardSize = board.getBoardSize();
  let mid = Math.floor(boardSize / 2);

  mid = boardSize % 2 === 0 ? mid - 1 : mid;

  for (const c of moves) {
    if (playerType === RED) {
      if (c.x === mid && c.y === mid) {
        c.heuristic_p1 = 2;
      } else if (c.x === mid && (c.y === mid - 1 || c.y === mid + 1)) {
        c.heuristic_p1 = 1;
      }
    } else {
      if (boardSize % 2 === 0) {
        if (c.x === mid && c.y === mid + 1) {
          c.heuristic_p2 = 2;
        } else if (c.y === mid && (c.y === mid || c.y === mid + 2)) {
          c.heuristic_p2 = 1;
        }
      } else {
        if (c.x === mid && c.y === mid) {
          c.heuristic_p2 = 2;
        } else if (c.y === mid && (c.y === mid - 1 || c.y === mid + 1)) {
          c.heuristic_p2 = 1;
        }
      }
    }
  }
}

/**
 * Reset internal baseInit state (call when starting a new game).
 */
export function resetState(): void {
  baseInit = false;
}
