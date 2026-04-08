export const RED = 1 as const;
export const BLUE = -1 as const;
export const EMPTY = 0 as const;

export type PlayerColor = typeof RED | typeof BLUE;
export type CellValue = typeof RED | typeof BLUE | typeof EMPTY;

export type AIType = 'random' | 'heuristic' | 'complex' | 'montecarlo' | 'minimax';
export type GamePhase = 'setup' | 'playing' | 'thinking' | 'finished';

export interface Cell {
  x: number;
  y: number;
  heuristic_p1: number;
  heuristic_p2: number;
}

export interface HexGameState {
  boardSize: number;
  board: number[];
  availableMoves: Cell[];
  currentPlayer: PlayerColor;
  humanPlayer: PlayerColor;
  aiType: AIType;
  gamePhase: GamePhase;
  winner: PlayerColor | null;
  moveHistory: { player: PlayerColor; row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
}

export type HexAction =
  | { type: 'CONFIGURE'; boardSize: number; aiType: AIType; humanFirst: boolean }
  | { type: 'START_GAME' }
  | { type: 'PLACE_STONE'; row: number; col: number }
  | { type: 'AI_THINKING' }
  | { type: 'AI_MOVE'; row: number; col: number }
  | { type: 'GAME_OVER'; winner: PlayerColor }
  | { type: 'RESET' };

// Worker messages
export interface WorkerRequest {
  type: 'COMPUTE_MOVE';
  board: number[];
  boardSize: number;
  availableMoves: Cell[];
  player: PlayerColor;
  aiType: AIType;
}

export interface WorkerResponse {
  type: 'MOVE_RESULT';
  row: number;
  col: number;
}
