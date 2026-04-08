import { Board } from '../board';
import { Cell, PlayerColor, RED, BLUE } from '../types';
import { DX, DY } from '../constants';

/**
 * Port of BasicHeuristicPlayer.h
 * Distance-based heuristic AI.
 */

let last_half = -1;

export function getMove(
  board: Board,
  playerType: PlayerColor
): { x: number; y: number } | null {
  if (board.isBoardFull()) {
    return null;
  }

  const moves = board.getAvailableMovesRef();
  if (moves.length === 0) {
    return null;
  }
  const boardSize = board.getBoardSize();

  if (moves.length < boardSize * boardSize - 1) {
    recalculateHeuristic(board, playerType);
  }

  let best = -Infinity;
  let bx = -1;
  let by = -1;

  if (playerType === RED) {
    // Red uses heuristic_p1
    for (const c of moves) {
      if (c.heuristic_p1 > best) {
        best = c.heuristic_p1;
        bx = c.x;
        by = c.y;
      }
    }
  } else {
    // Blue uses heuristic_p2
    for (const c of moves) {
      if (c.heuristic_p2 > best) {
        best = c.heuristic_p2;
        bx = c.x;
        by = c.y;
      }
    }
  }

  if (bx < 0) {
    return null;
  }

  if (playerType === RED) {
    last_half = bx > Math.floor(board.getBoardSize() / 2) ? 1 : 0;
  } else {
    last_half = by > Math.floor(board.getBoardSize() / 2) ? 1 : 0;
  }

  return { x: bx, y: by };
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

function whichEdgeReached(board: Board, playerType: PlayerColor): number {
  const n = board.getBoardSize();
  let minEdge = false;
  let maxEdge = false;

  if (playerType === RED) {
    for (let y = 0; y < n; ++y) {
      if (board.getGrid(0, y) === playerType) {
        minEdge = true;
      }
      if (board.getGrid(n - 1, y) === playerType) {
        maxEdge = true;
      }
    }
  } else {
    for (let x = 0; x < n; ++x) {
      if (board.getGrid(x, 0) === playerType) {
        minEdge = true;
      }
      if (board.getGrid(x, n - 1) === playerType) {
        maxEdge = true;
      }
    }
  }

  if (minEdge && maxEdge) {
    return 2; // for both edge
  }

  if (minEdge) {
    return 0;
  }

  if (maxEdge) {
    return 1;
  }

  return -1; // none
}

function DistanceToEdge(
  board: Board,
  startX: number,
  startY: number,
  pType: number,
  playerType: PlayerColor
): number {
  const boardSize = board.getBoardSize();
  const mid = Math.floor(boardSize / 2);
  const INF = 10e8;
  const points = boardSize * 100;

  let targetEdge = 0;
  let vertical = true;

  if (pType === RED) {
    vertical = true;
    if (startX >= mid) {
      targetEdge = boardSize - 1;
    }
  } else {
    vertical = false;
    if (startY >= mid) {
      targetEdge = boardSize - 1;
    }
  }

  // BFS distance grid
  const dist: number[][] = [];
  for (let i = 0; i < boardSize; i++) {
    dist.push(new Array(boardSize).fill(INF));
  }

  const queue: [number, number][] = [];

  const startVal = board.getGrid(startX, startY);
  if (!(startVal === 0 || startVal === pType)) {
    return INF;
  }

  dist[startX][startY] = 0;
  queue.push([startX, startY]);
  let head = 0;

  while (head < queue.length) {
    const x = queue[head][0];
    const y = queue[head][1];
    head++;

    if (vertical) {
      if (x === targetEdge) {
        // playerType === pType means "this is our own type"
        if (playerType === pType) {
          if (dist[x][y] === 0) {
            return 1e6;
          } else if (dist[x][y] === 1) {
            return 1e5;
          } else if (dist[x][y] === 2) {
            return 1e4;
          }
        }

        return points - dist[x][y];
      }
    } else {
      if (y === targetEdge) {
        if (playerType === pType) {
          if (dist[x][y] === 0) {
            return 1e6;
          } else if (dist[x][y] === 1) {
            return 1e5;
          } else if (dist[x][y] === 2) {
            return 1e4;
          }
        }

        return points - dist[x][y];
      }
    }

    for (let k = 0; k < 6; ++k) {
      const nx = x + DX[k];
      const ny = y + DY[k];

      if (nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize) {
        const v = board.getGrid(nx, ny);
        if (v === 0 || v === pType) {
          if (dist[nx][ny] > dist[x][y] + 1) {
            dist[nx][ny] = dist[x][y] + 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return -INF;
}

function recalculateHeuristic(board: Board, playerType: PlayerColor): void {
  const moves = board.getAvailableMovesRef();
  const boardSize = board.getBoardSize();
  const mid = Math.floor(boardSize / 2);
  const INF = 10e8;
  const ALT_BONUS = 10e3;

  // This can be improved by using a global variable. and checking once.
  const sideReached = whichEdgeReached(board, playerType); // -1 none, 0 min edge, 1 max edge

  const oppType = -playerType as PlayerColor;

  for (const c of moves) {
    c.heuristic_p1 = 0;
    c.heuristic_p2 = 0;

    const x = c.x;
    const y = c.y;

    if (playerType === RED) {
      if (sideReached === 0 && c.x < mid) {
        continue;
      }
      if (sideReached === 1 && c.x > mid) {
        continue;
      }

      const neighbourCount = board.getNeighboursCount(playerType, x, y);
      let score = 0.0;

      if (neighbourCount > 0) {
        score += 150.0;
        score += DistanceToEdge(board, x, y, playerType, playerType);

        if (sideReached === -1) {
          // if no side is reached then give alternate bias.
          const thisHalf = x > mid ? 1 : 0;
          if (last_half !== -1 && thisHalf !== last_half) {
            score += ALT_BONUS;
          }
        }
      } else {
        score = 0;
      }

      const oppNeighbourCount = board.getNeighboursCount(oppType, x, y);
      if (oppNeighbourCount > 0) {
        const baselineOppPath = DistanceToEdge(board, x, y, oppType, playerType);

        const w_def = 0.6;
        const w_adj = 5.0;

        const defenceScore = Math.max(0, baselineOppPath);

        score += w_def * defenceScore - w_adj * oppNeighbourCount;
      }

      c.heuristic_p1 = score;
    } else {
      if (sideReached === 0 && c.y < mid) {
        continue;
      }
      if (sideReached === 1 && c.y > mid) {
        continue;
      }

      const neighbourCount = board.getNeighboursCount(playerType, x, y);
      let score = 0.0;

      if (neighbourCount > 0) {
        score += 150.0;
        score += DistanceToEdge(board, x, y, playerType, playerType);

        if (sideReached === -1) {
          const thisHalf = y > mid ? 1 : 0;
          if (last_half !== -1 && thisHalf !== last_half) {
            score += ALT_BONUS;
          }
        }
      } else {
        score = 0;
      }

      const oppNeighbourCount = board.getNeighboursCount(oppType, x, y);
      if (oppNeighbourCount > 0) {
        const baselineOppPath = DistanceToEdge(board, x, y, oppType, playerType);

        const w_def = 0.6;
        const w_adj = 8.0;

        const defenceScore = Math.max(0, baselineOppPath);

        score += w_def * defenceScore - w_adj * oppNeighbourCount;
      }

      c.heuristic_p2 = score;
    }
  }
}
