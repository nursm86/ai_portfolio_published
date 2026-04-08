import { Board } from '../board';
import { PlayerColor, RED, BLUE } from '../types';

/**
 * Port of MonteCarloPlayer.h
 * Monte Carlo Tree Search with UCB1 selection, xorshift32 RNG,
 * warmup + batch simulation phases.
 */

const TIMES = 100;

// Module-level RNG state (seeded once)
let rng_ = ((Date.now() & 0xffffffff) >>> 0) | 1;

function xr_(): number {
  // xorshift32
  let x = rng_ >>> 0;
  x ^= x << 13;
  x = x >>> 0;
  x ^= x >>> 17;
  x = x >>> 0;
  x ^= x << 5;
  x = x >>> 0;
  rng_ = x ? x : 0x9e3779b9;
  return rng_ >>> 0;
}

function expansion(
  player: PlayerColor,
  board: Board,
  stateInit: number,
  selfType: PlayerColor
): number {
  let state = stateInit >>> 0;

  const xr = (): number => {
    let x = state >>> 0;
    x ^= x << 13;
    x = x >>> 0;
    x ^= x >>> 17;
    x = x >>> 0;
    x ^= x << 5;
    x = x >>> 0;
    state = x ? x : 0x9e3779b9;
    return state >>> 0;
  };

  // Copy available moves into a mutable array
  const avail = board.getAvailableMoves();
  const empty: { x: number; y: number }[] = [];
  for (const c of avail) {
    empty.push({ x: c.x, y: c.y });
  }

  let currentPlayer = player;

  while (true) {
    if (empty.length === 0) return 0.5;

    const idx = xr() % empty.length;
    const c = empty[idx];

    // Swap-remove
    empty[idx] = empty[empty.length - 1];
    empty.pop();

    board.addMove(currentPlayer, c.x, c.y);

    const won = board.checkWin(currentPlayer);
    if (won === selfType) return 1.0;
    if (won === -selfType) return 0.0;

    currentPlayer = -currentPlayer as PlayerColor;
  }
}

export function getMove(
  board: Board,
  playerType: PlayerColor
): { x: number; y: number } | null {
  const availableMoves = board.getAvailableMoves();
  if (availableMoves.length === 0) {
    return null;
  }

  const moveCount = availableMoves.length;

  const warmupSimulations = 100;
  const batchSimulations = 100;
  const simulationBudget = TIMES * moveCount;

  const winScores = new Float64Array(moveCount); // initialized to 0.0
  const playCounts = new Int32Array(moveCount);   // initialized to 0
  let totalSimulations = 0;
  const opponent: PlayerColor = playerType === RED ? BLUE : RED;

  // Warmup phase: run warmupRuns simulations for each move
  for (let moveIndex = 0; moveIndex < moveCount; moveIndex++) {
    // this is to test when i was minimizing the times.
    const warmupRuns = warmupSimulations < TIMES ? warmupSimulations : TIMES;
    for (let t = 0; t < warmupRuns; t++) {
      const tempBoard = board.clone();
      tempBoard.addMove(
        playerType,
        availableMoves[moveIndex].x,
        availableMoves[moveIndex].y
      );
      let s = ((rng_ ^ (Math.imul(0x9e3779b9, t + 1))) >>> 0) || 1;
      winScores[moveIndex] += expansion(opponent, tempBoard, s, playerType);
    }
    playCounts[moveIndex] += warmupRuns;
    totalSimulations += warmupRuns * moveCount;
  }

  // UCB1 batch phase
  while (totalSimulations < simulationBudget) {
    let bestUcbValue = -1e18;
    let bestMoveIndex = 0;
    for (let moveIndex = 0; moveIndex < moveCount; moveIndex++) {
      const meanWinRate = playCounts[moveIndex]
        ? winScores[moveIndex] / playCounts[moveIndex]
        : 0.5;
      // Calculating Upper Confidence Bound
      const ucbValue =
        meanWinRate +
        Math.sqrt(
          (2.0 * Math.log(Math.max(1, totalSimulations))) /
            Math.max(1, playCounts[moveIndex])
        );
      if (ucbValue > bestUcbValue) {
        bestUcbValue = ucbValue;
        bestMoveIndex = moveIndex;
      }
    }

    const remaining = simulationBudget - totalSimulations;
    if (remaining <= 0) {
      break;
    }

    const runs = Math.min(batchSimulations, remaining);
    let accScore = 0.0;
    let accPlays = 0;

    for (let t = 0; t < runs; ++t) {
      const tempBoard = board.clone();
      tempBoard.addMove(
        playerType,
        availableMoves[bestMoveIndex].x,
        availableMoves[bestMoveIndex].y
      );
      let s = ((rng_ ^ (Math.imul(0x9e3779b9, t + 1))) >>> 0) || 1;
      accScore += expansion(opponent, tempBoard, s, playerType);
      accPlays += 1;
    }
    winScores[bestMoveIndex] += accScore;
    playCounts[bestMoveIndex] += accPlays;
    totalSimulations += runs;
  }

  // Pick the move with the highest mean win rate
  let bestIndex = 0;
  let bestMean = -1.0;
  for (let moveIndex = 0; moveIndex < moveCount; moveIndex++) {
    const meanWinRate = playCounts[moveIndex]
      ? winScores[moveIndex] / playCounts[moveIndex]
      : 0.0;
    if (meanWinRate > bestMean) {
      bestMean = meanWinRate;
      bestIndex = moveIndex;
    }
  }

  return { x: availableMoves[bestIndex].x, y: availableMoves[bestIndex].y };
}
