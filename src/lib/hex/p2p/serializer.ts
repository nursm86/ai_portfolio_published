import type { Cell, PlayerColor } from '@/lib/hex/types';
import type { SerializedGameState } from './protocol';

/**
 * Rebuild the `availableMoves` list from a flat board array.
 * Used after applying a REMOTE_STATE_SYNC where the wire format omits it.
 */
export function rebuildAvailableMoves(board: number[], boardSize: number): Cell[] {
  const moves: Cell[] = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r * boardSize + c] === 0) {
        moves.push({ x: r, y: c, heuristic_p1: 0, heuristic_p2: 0 });
      }
    }
  }
  return moves;
}

export interface SerializeInput {
  boardSize: number;
  board: number[];
  turn: PlayerColor;
  moveHistory: { player: PlayerColor; row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
  winner: PlayerColor | null;
  winningPath: number[];
  gameId: string;
  moveSeq: number;
  scoreboard: Record<string, number>;
  ownerClientId: string;
  ownerName: string;
  ownerColor: PlayerColor;
  joinerClientId: string | null;
  joinerName: string | null;
  surrenderedBy: string | null;
}

export function serializeForWire(input: SerializeInput): SerializedGameState {
  return {
    boardSize: input.boardSize,
    board: [...input.board],
    turn: input.turn,
    moveHistory: [...input.moveHistory],
    lastMove: input.lastMove ? { ...input.lastMove } : null,
    winner: input.winner,
    winningPath: [...input.winningPath],
    gameId: input.gameId,
    moveSeq: input.moveSeq,
    scoreboard: { ...input.scoreboard },
    ownerClientId: input.ownerClientId,
    ownerName: input.ownerName,
    ownerColor: input.ownerColor,
    joinerClientId: input.joinerClientId,
    joinerName: input.joinerName,
    surrenderedBy: input.surrenderedBy,
  };
}

/** Shallow sanity check on an inbound sync payload. */
export function isValidSync(sync: unknown): sync is SerializedGameState {
  if (!sync || typeof sync !== 'object') return false;
  const s = sync as Partial<SerializedGameState>;
  return (
    typeof s.boardSize === 'number' &&
    Array.isArray(s.board) &&
    (s.turn === 1 || s.turn === -1) &&
    typeof s.gameId === 'string' &&
    typeof s.moveSeq === 'number' &&
    Array.isArray(s.moveHistory) &&
    typeof s.ownerClientId === 'string'
  );
}
