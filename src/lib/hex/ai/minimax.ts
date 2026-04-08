import { Board } from '../board';
import { Cell, PlayerColor, RED, BLUE } from '../types';
import { DX, DY } from '../constants';

/**
 * Port of MiniMaxPlayer.h
 * MiniMax with Alpha-Beta pruning, Dijkstra-based evaluation,
 * frontier scoring, and centrality-based move ordering.
 */

const WIN_SCORE = 1e6;
const PATH_WEIGHT = 10.0;
const FRONTIER_WEIGHT = 0.5;
const EMPTY_COST = 1.0;
const OPPONENT_COST = 6.0;

const DEFAULT_MAX_DEPTH = 4;

function neighbors(
  row: number,
  col: number,
  boardSize: number
): [number, number][] {
  const dRow = [-1, -1, 0, 0, +1, +1];
  const dCol = [0, +1, -1, +1, -1, 0];
  const result: [number, number][] = [];
  for (let directionIndex = 0; directionIndex < 6; ++directionIndex) {
    const newRow = row + dRow[directionIndex];
    const newCol = col + dCol[directionIndex];
    if (0 <= newRow && newRow < boardSize && 0 <= newCol && newCol < boardSize) {
      result.push([newRow, newCol]);
    }
  }
  return result;
}

function cellCost(
  boardRef: Board,
  playerTypeInput: number,
  row: number,
  col: number
): number {
  const cellValue = boardRef.getGrid(row, col);
  if (cellValue === playerTypeInput) {
    return 0;
  }

  if (cellValue === 0) {
    return EMPTY_COST;
  }
  return OPPONENT_COST;
}

/**
 * Dijkstra shortest-path cost from one edge to the other for a given player.
 * Red: top row (row 0) -> bottom row (row boardSize-1).
 * Blue: left col (col 0) -> right col (col boardSize-1).
 */
function pathCost(boardRef: Board, playerTypeInput: number): number {
  const boardSize = boardRef.getBoardSize();
  const unreachable = Infinity;

  // Distance grid
  const distanceGrid: number[][] = [];
  for (let i = 0; i < boardSize; i++) {
    distanceGrid.push(new Array(boardSize).fill(unreachable));
  }

  // Min-heap via sorted insertion (simple priority queue)
  // Each entry: [distance, row, col]
  // Using a binary heap for performance
  const frontier: [number, number, number][] = [];

  const heapPush = (item: [number, number, number]) => {
    frontier.push(item);
    // Bubble up
    let i = frontier.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (frontier[parent][0] > frontier[i][0]) {
        const tmp = frontier[parent];
        frontier[parent] = frontier[i];
        frontier[i] = tmp;
        i = parent;
      } else {
        break;
      }
    }
  };

  const heapPop = (): [number, number, number] => {
    const top = frontier[0];
    const last = frontier.pop()!;
    if (frontier.length > 0) {
      frontier[0] = last;
      // Bubble down
      let i = 0;
      while (true) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < frontier.length && frontier[left][0] < frontier[smallest][0]) {
          smallest = left;
        }
        if (right < frontier.length && frontier[right][0] < frontier[smallest][0]) {
          smallest = right;
        }
        if (smallest !== i) {
          const tmp = frontier[smallest];
          frontier[smallest] = frontier[i];
          frontier[i] = tmp;
          i = smallest;
        } else {
          break;
        }
      }
    }
    return top;
  };

  const enqueueStart = (row: number, col: number) => {
    const weight = cellCost(boardRef, playerTypeInput, row, col);
    if (!isFinite(weight)) {
      return;
    }
    distanceGrid[row][col] = weight;
    heapPush([weight, row, col]);
  };

  if (playerTypeInput === RED) {
    for (let col = 0; col < boardSize; ++col) {
      enqueueStart(0, col);
    }
  } else {
    for (let row = 0; row < boardSize; ++row) {
      enqueueStart(row, 0);
    }
  }

  while (frontier.length > 0) {
    const current = heapPop();
    const baseDistance = current[0];
    const row = current[1];
    const col = current[2];

    if (baseDistance > distanceGrid[row][col]) {
      continue;
    }

    const nbrs = neighbors(row, col, boardSize);
    for (const [newRow, newCol] of nbrs) {
      const weight = cellCost(boardRef, playerTypeInput, newRow, newCol);
      if (!isFinite(weight)) {
        continue;
      }

      const nextDistance = baseDistance + weight;
      if (nextDistance < distanceGrid[newRow][newCol]) {
        distanceGrid[newRow][newCol] = nextDistance;
        heapPush([nextDistance, newRow, newCol]);
      }
    }
  }

  let bestDistance = unreachable;
  if (playerTypeInput === RED) {
    const targetRow = boardSize - 1;
    for (let col = 0; col < boardSize; ++col) {
      bestDistance = Math.min(bestDistance, distanceGrid[targetRow][col]);
    }
  } else {
    const targetCol = boardSize - 1;
    for (let row = 0; row < boardSize; ++row) {
      bestDistance = Math.min(bestDistance, distanceGrid[row][targetCol]);
    }
  }
  return bestDistance;
}

function frontierScore(boardRef: Board, playerTypeInput: number): number {
  const boardSize = boardRef.getBoardSize();
  const marked: boolean[][] = [];
  for (let i = 0; i < boardSize; i++) {
    marked.push(new Array(boardSize).fill(false));
  }
  let frontierCells = 0;

  for (let row = 0; row < boardSize; ++row) {
    for (let col = 0; col < boardSize; ++col) {
      if (boardRef.getGrid(row, col) !== playerTypeInput) {
        continue;
      }
      const nbrs = neighbors(row, col, boardSize);
      for (const [newRow, newCol] of nbrs) {
        if (boardRef.getGrid(newRow, newCol) === 0 && !marked[newRow][newCol]) {
          marked[newRow][newCol] = true;
          ++frontierCells;
        }
      }
    }
  }

  return frontierCells;
}

function evaluate(boardState: Board, maxDepth: number): number {
  const redDistance = pathCost(boardState, RED);
  const blueDistance = pathCost(boardState, BLUE);

  if (!isFinite(redDistance) && !isFinite(blueDistance)) {
    return 0.0;
  }
  if (!isFinite(redDistance)) {
    return -WIN_SCORE / 2.0;
  }
  if (!isFinite(blueDistance)) {
    return WIN_SCORE / 2.0;
  }

  const pathComponent = (blueDistance - redDistance) * PATH_WEIGHT;
  const frontierComponent =
    (frontierScore(boardState, RED) - frontierScore(boardState, BLUE)) *
    FRONTIER_WEIGHT;
  return pathComponent + frontierComponent;
}

function orderMovesByCentrality(
  availableMoves: ReadonlyArray<Cell>,
  boardSize: number
): number[] {
  const moveOrderIndices: number[] = [];
  for (let i = 0; i < availableMoves.length; i++) {
    moveOrderIndices.push(i);
  }

  const center = Math.floor(boardSize / 2);
  moveOrderIndices.sort((indexA, indexB) => {
    const costA =
      Math.abs(availableMoves[indexA].x - center) +
      Math.abs(availableMoves[indexA].y - center);
    const costB =
      Math.abs(availableMoves[indexB].x - center) +
      Math.abs(availableMoves[indexB].y - center);
    return costA - costB;
  });
  return moveOrderIndices;
}

function maxMove(
  boardState: Board,
  searchDepth: number,
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  const plyBonus = maxDepth - searchDepth;
  if (boardState.checkWin(RED) === RED) {
    return WIN_SCORE - plyBonus;
  }
  if (boardState.checkWin(BLUE) === BLUE) {
    return -WIN_SCORE + plyBonus;
  }

  const availableMoves = boardState.getAvailableMoves();
  if (searchDepth === 0 || availableMoves.length === 0) {
    return evaluate(boardState, maxDepth);
  }

  const moveOrderIndices = orderMovesByCentrality(
    availableMoves,
    boardState.getBoardSize()
  );

  let value = -Infinity;
  for (const orderIndex of moveOrderIndices) {
    const childBoard = boardState.clone();
    childBoard.addMove(
      RED,
      availableMoves[orderIndex].x,
      availableMoves[orderIndex].y
    );
    value = Math.max(
      value,
      minMove(childBoard, searchDepth - 1, alpha, beta, maxDepth)
    );
    alpha = Math.max(alpha, value);
    if (value >= beta) {
      break; // beta cut
    }
  }
  return value;
}

function minMove(
  boardState: Board,
  searchDepth: number,
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  const plyBonus = maxDepth - searchDepth;
  if (boardState.checkWin(RED) === RED) {
    return WIN_SCORE - plyBonus;
  }
  if (boardState.checkWin(BLUE) === BLUE) {
    return -WIN_SCORE + plyBonus;
  }

  const availableMoves = boardState.getAvailableMoves();
  if (searchDepth === 0 || availableMoves.length === 0) {
    return evaluate(boardState, maxDepth);
  }

  const moveOrderIndices = orderMovesByCentrality(
    availableMoves,
    boardState.getBoardSize()
  );

  let value = Infinity;
  for (const orderIndex of moveOrderIndices) {
    const childBoard = boardState.clone();
    childBoard.addMove(
      BLUE,
      availableMoves[orderIndex].x,
      availableMoves[orderIndex].y
    );
    value = Math.min(
      value,
      maxMove(childBoard, searchDepth - 1, alpha, beta, maxDepth)
    );
    beta = Math.min(beta, value);
    if (value <= alpha) {
      break; // alpha cut
    }
  }
  return value;
}

export function getMove(
  board: Board,
  playerType: PlayerColor,
  searchMaxDepth: number = DEFAULT_MAX_DEPTH
): { x: number; y: number } | null {
  const availableMoves = board.getAvailableMoves();
  if (availableMoves.length === 0) {
    return null;
  }

  const maxDepth = searchMaxDepth;
  const moveOrderIndices = orderMovesByCentrality(
    availableMoves,
    board.getBoardSize()
  );

  let bestScore = playerType === RED ? -Infinity : Infinity;
  let bestIndex = 0;

  for (const orderIndex of moveOrderIndices) {
    const childBoard = board.clone();
    childBoard.addMove(
      playerType,
      availableMoves[orderIndex].x,
      availableMoves[orderIndex].y
    );
    if (childBoard.checkWin(playerType) === playerType) {
      return {
        x: availableMoves[orderIndex].x,
        y: availableMoves[orderIndex].y,
      };
    }

    let positionScore: number;
    if (playerType === RED) {
      positionScore = minMove(
        childBoard,
        maxDepth - 1,
        -Infinity,
        Infinity,
        maxDepth
      ); // initial alpha beta is infinity.
    } else {
      positionScore = maxMove(
        childBoard,
        maxDepth - 1,
        -Infinity,
        Infinity,
        maxDepth
      );
    }

    if (playerType === RED) {
      if (positionScore > bestScore) {
        bestScore = positionScore;
        bestIndex = orderIndex;
      }
    } else {
      if (positionScore < bestScore) {
        bestScore = positionScore;
        bestIndex = orderIndex;
      }
    }
  }

  return { x: availableMoves[bestIndex].x, y: availableMoves[bestIndex].y };
}
