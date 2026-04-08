import { Board } from '../board';
import { PlayerColor } from '../types';

/**
 * Port of RandomPlayer.h
 * Picks a random move from the available moves.
 */
export function getMove(
  board: Board,
  playerType: PlayerColor
): { x: number; y: number } | null {
  const avail = board.getAvailableMoves();

  if (avail.length === 0) {
    return null;
  }

  const r = Math.floor(Math.random() * avail.length);
  return { x: avail[r].x, y: avail[r].y };
}
