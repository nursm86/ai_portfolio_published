'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';
import { RED, BLUE, type PlayerColor, type GamePhase } from '@/lib/hex/types';

interface HexStatusBarProps {
  currentPlayer: PlayerColor;
  humanPlayer: PlayerColor;
  gamePhase: GamePhase;
  winner: PlayerColor | null;
  moveCount: number;
  onReset: () => void;
  onNewGame: () => void;
}

export default function HexStatusBar({
  currentPlayer,
  humanPlayer,
  gamePhase,
  winner,
  moveCount,
  onReset,
  onNewGame,
}: HexStatusBarProps) {
  const aiPlayer = humanPlayer === RED ? BLUE : RED;
  const isHumanTurn = gamePhase === 'playing' && currentPlayer === humanPlayer;
  const displayPlayer = gamePhase === 'thinking' ? aiPlayer : currentPlayer;
  const playerLabel = displayPlayer === RED ? 'Red' : 'Blue';
  const playerColor = displayPlayer === RED ? 'text-red-400' : 'text-blue-400';
  const dotColor = displayPlayer === RED ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence mode="wait">
        {gamePhase === 'finished' && winner ? (
          <motion.div
            key="winner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className={`text-lg font-bold ${winner === RED ? 'text-red-400' : 'text-blue-400'}`}>
                {winner === humanPlayer ? 'You win!' : 'AI wins!'}
              </span>
              <Trophy className="text-yellow-400" size={20} />
            </div>
            <span className="text-xs text-neutral-500">
              {winner === RED ? 'Red' : 'Blue'} connected {winner === RED ? 'top to bottom' : 'left to right'} in {moveCount} moves
            </span>
          </motion.div>
        ) : gamePhase === 'thinking' ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`h-2 w-2 rounded-full ${dotColor}`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-400">AI is thinking...</span>
          </motion.div>
        ) : (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm text-neutral-300">
              <span className={playerColor}>{playerLabel}</span>
              {' — '}
              {isHumanTurn ? 'Your turn' : "AI's turn"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2">
        {gamePhase === 'finished' ? (
          <>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-sm hover:bg-neutral-700 transition-colors"
            >
              <RotateCcw size={14} />
              Play Again
            </button>
            <button
              onClick={onNewGame}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors"
            >
              New Game
            </button>
          </>
        ) : gamePhase === 'playing' ? (
          <button
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-neutral-500 text-xs hover:text-neutral-300 transition-colors"
          >
            <RotateCcw size={12} />
            Restart
          </button>
        ) : null}
      </div>
    </div>
  );
}
