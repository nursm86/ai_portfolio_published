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
  p2pInfo?: {
    myColor: PlayerColor;
    myName: string;
    peerName: string;
    isMyTurn: boolean;
    surrenderedBy: 'me' | 'peer' | null;
    canPlayAgain: boolean;
    playAgainLabel: string;
  };
}

export default function HexStatusBar({
  currentPlayer,
  humanPlayer,
  gamePhase,
  winner,
  moveCount,
  onReset,
  onNewGame,
  p2pInfo,
}: HexStatusBarProps) {
  const aiPlayer = humanPlayer === RED ? BLUE : RED;
  const isHumanTurn = gamePhase === 'playing' && currentPlayer === humanPlayer;
  const displayPlayer = gamePhase === 'thinking' ? aiPlayer : currentPlayer;
  const playerLabel = displayPlayer === RED ? 'Red' : 'Blue';
  const playerColor = displayPlayer === RED ? 'text-red-400' : 'text-blue-400';
  const dotColor = displayPlayer === RED ? 'bg-red-500' : 'bg-blue-500';
  const isP2P = !!p2pInfo;
  const iWon = isP2P && winner === p2pInfo.myColor;
  const winnerMessage = isP2P
    ? p2pInfo.surrenderedBy === 'peer'
      ? `${p2pInfo.peerName || 'Opponent'} surrendered`
      : p2pInfo.surrenderedBy === 'me'
        ? 'You surrendered'
        : iWon
          ? 'You win!'
          : `${p2pInfo.peerName || 'Opponent'} wins!`
    : winner === humanPlayer
      ? 'You win!'
      : 'AI wins!';

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
                {winnerMessage}
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
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className={`h-3 w-3 rounded-full ${dotColor}`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-sm font-medium text-neutral-300">AI is thinking...</span>
            </div>
            <div className="w-32 h-1 rounded-full bg-neutral-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${dotColor.replace('bg-', 'bg-')}`}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '50%' }}
              />
            </div>
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
              {isP2P
                ? p2pInfo.isMyTurn
                  ? 'Your turn'
                  : `${p2pInfo.peerName || 'Opponent'}'s turn`
                : isHumanTurn
                  ? 'Your turn'
                  : "AI's turn"}
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
              disabled={isP2P && !p2pInfo.canPlayAgain}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-sm hover:bg-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={14} />
              {isP2P ? p2pInfo.playAgainLabel : 'Play Again'}
            </button>
            {!isP2P && (
              <button
                onClick={onNewGame}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors"
              >
                New Game
              </button>
            )}
          </>
        ) : gamePhase === 'playing' && !isP2P ? (
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
