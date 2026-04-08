'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import HexBoard from './HexBoard';
import HexControls from './HexControls';
import HexStatusBar from './HexStatusBar';

import { Board } from '@/lib/hex/board';
import {
  RED,
  BLUE,
  type AIType,
  type GamePhase,
  type HexGameState,
  type PlayerColor,
  type Cell,
} from '@/lib/hex/types';

// Import AI functions
import { getMove as getRandomMove } from '@/lib/hex/ai/random';
import { getMove as getHeuristicMove } from '@/lib/hex/ai/heuristic';
import { getMove as getComplexMove } from '@/lib/hex/ai/complex-heuristic';
import { getMove as getMonteCarloMove } from '@/lib/hex/ai/monte-carlo';
import { getMove as getMinimaxMove } from '@/lib/hex/ai/minimax';

interface State {
  boardSize: number;
  board: number[];
  availableMoves: Cell[];
  turn: PlayerColor;
  humanPlayer: PlayerColor;
  aiType: AIType;
  gamePhase: GamePhase;
  winner: PlayerColor | null;
  winningPath: number[];
  moveHistory: { player: PlayerColor; row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
}

type Action =
  | { type: 'CONFIGURE'; boardSize: number; aiType: AIType; humanFirst: boolean }
  | { type: 'PLACE_STONE'; row: number; col: number }
  | { type: 'AI_THINKING' }
  | { type: 'AI_MOVE'; row: number; col: number }
  | { type: 'GAME_OVER'; winner: PlayerColor; path?: number[] }
  | { type: 'RESET' }
  | { type: 'NEW_GAME' };

function createInitialState(): State {
  return {
    boardSize: 7,
    board: [],
    availableMoves: [],
    turn: RED,
    humanPlayer: RED,
    aiType: 'montecarlo',
    gamePhase: 'setup',
    winner: null,
    winningPath: [],
    moveHistory: [],
    lastMove: null,
  };
}

function initBoard(size: number): { board: number[]; availableMoves: Cell[] } {
  const board = new Array(size * size).fill(0);
  const availableMoves: Cell[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      availableMoves.push({ x: i, y: j, heuristic_p1: 0, heuristic_p2: 0 });
    }
  }
  return { board, availableMoves };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CONFIGURE': {
      const { board, availableMoves } = initBoard(action.boardSize);
      return {
        ...state,
        boardSize: action.boardSize,
        board,
        availableMoves,
        turn: RED,
        humanPlayer: action.humanFirst ? RED : BLUE,
        aiType: action.aiType,
        gamePhase: 'playing',
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
      };
    }
    case 'PLACE_STONE': {
      const { row, col } = action;
      const idx = row * state.boardSize + col;
      if (state.board[idx] !== 0) return state;
      if (state.gamePhase !== 'playing') return state;

      const newBoard = [...state.board];
      newBoard[idx] = state.humanPlayer; // Always human's color
      const newAvail = state.availableMoves.filter((c) => !(c.x === row && c.y === col));
      const aiPlayer = (state.humanPlayer === RED ? BLUE : RED) as PlayerColor;

      return {
        ...state,
        board: newBoard,
        availableMoves: newAvail,
        turn: aiPlayer,
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { player: state.humanPlayer, row, col }],
      };
    }
    case 'AI_THINKING':
      return { ...state, gamePhase: 'thinking' };
    case 'AI_MOVE': {
      const { row, col } = action;
      const idx = row * state.boardSize + col;
      if (state.board[idx] !== 0) {
        // Cell occupied — skip this AI move (shouldn't happen)
        return { ...state, gamePhase: 'playing' };
      }

      const aiPlayer = (state.humanPlayer === RED ? BLUE : RED) as PlayerColor;
      const newBoard = [...state.board];
      newBoard[idx] = aiPlayer;
      const newAvail = state.availableMoves.filter((c) => !(c.x === row && c.y === col));

      return {
        ...state,
        board: newBoard,
        availableMoves: newAvail,
        turn: state.humanPlayer,
        gamePhase: 'playing',
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { player: aiPlayer, row, col }],
      };
    }
    case 'GAME_OVER':
      return { ...state, gamePhase: 'finished', winner: action.winner, winningPath: action.path || [] };
    case 'RESET': {
      const { board, availableMoves } = initBoard(state.boardSize);
      return {
        ...state,
        board,
        availableMoves,
        turn: RED,
        gamePhase: 'playing',
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
      };
    }
    case 'NEW_GAME':
      return createInitialState();
    default:
      return state;
  }
}

function checkWinFromBoard(board: number[], boardSize: number, player: PlayerColor): { won: boolean; path: number[] } {
  const b = new Board(boardSize);
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const v = board[r * boardSize + c];
      if (v !== 0) b.forcePlace(v as PlayerColor, r, c);
    }
  }
  if (b.checkWin(player) === player) {
    return { won: true, path: b.getWinningPath(player) };
  }
  return { won: false, path: [] };
}

function getAIMove(board: number[], boardSize: number, availableMoves: Cell[], player: PlayerColor, aiType: AIType) {
  const b = new Board(boardSize);
  // Rebuild board state
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const v = board[r * boardSize + c];
      if (v !== 0) {
        b.forcePlace(v as PlayerColor, r, c);
      }
    }
  }
  // Set available moves & turn
  b.setAvailableMoves(availableMoves);
  b.setTurn(player);

  switch (aiType) {
    case 'random': return getRandomMove(b, player);
    case 'heuristic': return getHeuristicMove(b, player);
    case 'complex': return getComplexMove(b, player);
    case 'montecarlo': return getMonteCarloMove(b, player);
    case 'minimax': return getMinimaxMove(b, player);
    default: return getRandomMove(b, player);
  }
}

export default function HexGame() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const { theme, setTheme } = useTheme();

  const isHumanTurn = state.turn === state.humanPlayer;
  const isClickable = state.gamePhase === 'playing' && isHumanTurn;
  const aiPendingRef = useRef(false);

  // Reset AI pending flag when game resets or finishes
  useEffect(() => {
    if (state.gamePhase === 'setup' || state.gamePhase === 'finished' || (state.gamePhase === 'playing' && state.lastMove === null)) {
      aiPendingRef.current = false;
    }
  }, [state.gamePhase, state.lastMove]);

  // Check for win after each move
  useEffect(() => {
    if (state.gamePhase !== 'playing' && state.gamePhase !== 'thinking') return;
    if (state.lastMove === null) return;

    const lastPlayer = (state.turn === RED ? BLUE : RED) as PlayerColor; // The player who just moved
    const result = checkWinFromBoard(state.board, state.boardSize, lastPlayer);
    if (result.won) {
      dispatch({ type: 'GAME_OVER', winner: lastPlayer, path: result.path });
      return;
    }

    // Check draw
    if (state.availableMoves.length === 0) {
      dispatch({ type: 'GAME_OVER', winner: lastPlayer }); // Hex can't draw, but fallback
      return;
    }
  }, [state.board, state.lastMove, state.boardSize, state.turn, state.gamePhase, state.availableMoves.length]);

  // Trigger AI move
  useEffect(() => {
    if (state.gamePhase === 'finished') return;
    if (state.turn === state.humanPlayer) return;
    if (state.availableMoves.length === 0) return;
    if (aiPendingRef.current) return;

    if (state.gamePhase === 'playing') {
      aiPendingRef.current = true;
      dispatch({ type: 'AI_THINKING' });
    }
  }, [state.gamePhase, state.turn, state.humanPlayer, state.availableMoves.length]);

  useEffect(() => {
    if (state.gamePhase !== 'thinking') return;

    const timeoutId = setTimeout(() => {
      const move = getAIMove(state.board, state.boardSize, state.availableMoves, state.turn, state.aiType);
      aiPendingRef.current = false;
      if (move) {
        dispatch({ type: 'AI_MOVE', row: move.x, col: move.y });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.gamePhase, state.board, state.boardSize, state.availableMoves, state.turn, state.aiType]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!isClickable) return;
      dispatch({ type: 'PLACE_STONE', row, col });
    },
    [isClickable]
  );

  const handleStart = useCallback((boardSize: number, aiType: AIType, humanFirst: boolean) => {
    dispatch({ type: 'CONFIGURE', boardSize, aiType, humanFirst });
  }, []);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/10 backdrop-blur-lg transition hover:bg-white/20 dark:border-white/20"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 dark:text-white" />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {state.gamePhase === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <HexControls onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <HexBoard
              board={state.board}
              boardSize={state.boardSize}
              currentPlayer={state.turn}
              humanPlayer={state.humanPlayer}
              lastMove={state.lastMove}
              winningPath={state.winningPath}
              isClickable={isClickable}
              onCellClick={handleCellClick}
            />
            <HexStatusBar
              currentPlayer={state.turn}
              humanPlayer={state.humanPlayer}
              gamePhase={state.gamePhase}
              winner={state.winner}
              moveCount={state.moveHistory.length}
              onReset={() => dispatch({ type: 'RESET' })}
              onNewGame={() => dispatch({ type: 'NEW_GAME' })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
