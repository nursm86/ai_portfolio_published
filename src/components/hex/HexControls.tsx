'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, ChevronDown, ChevronUp, Cpu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BOARD_SIZES } from '@/lib/hex/constants';
import type { AIType } from '@/lib/hex/types';

interface HexControlsProps {
  onStart: (boardSize: number, aiType: AIType, humanFirst: boolean) => void;
}

const aiOptions: { type: AIType; label: string; desc: string; icon: typeof Bot }[] = [
  { type: 'complex', label: 'Noob', desc: 'Heuristic player with average human intuition', icon: Sparkles },
  { type: 'montecarlo', label: 'Smart', desc: 'Monte Carlo simulation — medium difficulty', icon: Brain },
  { type: 'minimax', label: 'Genius', desc: 'My smartest AI — MiniMax with alpha-beta pruning', icon: Cpu },
];

export default function HexControls({ onStart }: HexControlsProps) {
  const [boardSize, setBoardSize] = useState(7);
  const [aiType, setAiType] = useState<AIType>('complex');
  const [humanFirst, setHumanFirst] = useState(true);
  const [showRules, setShowRules] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-200">Hex Game</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Challenge my AI — built with Monte Carlo, MiniMax & heuristic algorithms
        </p>
      </div>

      {/* How to Play */}
      <div className="w-full">
        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1.5 mx-auto text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showRules ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showRules ? 'Hide rules' : 'How to play'}
        </button>
        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 text-xs text-neutral-400 space-y-2">
                <p className="font-medium text-neutral-300">Game Rules:</p>
                <ul className="space-y-1.5 pl-3">
                  <li>- Hex is played on a diamond-shaped board of hexagonal cells</li>
                  <li>- Two players take turns placing stones on empty cells</li>
                  <li>- <span className="text-red-400 font-medium">Red</span> wins by connecting the <span className="text-red-400">top edge to the bottom edge</span></li>
                  <li>- <span className="text-blue-400 font-medium">Blue</span> wins by connecting the <span className="text-blue-400">left edge to the right edge</span></li>
                  <li>- The connection can follow any path through adjacent hexagons</li>
                  <li>- There are no draws in Hex — someone always wins!</li>
                </ul>
                <p className="font-medium text-neutral-300 pt-1">Strategy Tips:</p>
                <ul className="space-y-1.5 pl-3">
                  <li>- Control the center — it connects to more cells</li>
                  <li>- Try to build two separate paths — your opponent can only block one</li>
                  <li>- Watch for "bridges" — two stones with two shared empty neighbors</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Board Size */}
      <div className="w-full">
        <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-2 block">Board Size</label>
        <div className="flex gap-2 justify-center">
          {BOARD_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBoardSize(size)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                boardSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {/* AI Type */}
      <div className="w-full">
        <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-2 block">AI Opponent</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {aiOptions.map(({ type, label, desc, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setAiType(type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all ${
                aiType === type
                  ? 'bg-blue-600/20 border-blue-500 border text-blue-400'
                  : 'bg-neutral-800/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-700/50'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] text-neutral-500">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Who Goes First */}
      <div className="w-full">
        <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-2 block">Who Goes First?</label>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setHumanFirst(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              humanFirst
                ? 'bg-red-500/20 border border-red-500 text-red-400'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            You (Red)
          </button>
          <button
            onClick={() => setHumanFirst(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              !humanFirst
                ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            AI First (Red)
          </button>
        </div>
      </div>

      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart(boardSize, aiType, humanFirst)}
        className="w-full max-w-xs py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors"
      >
        Start Game
      </motion.button>
    </motion.div>
  );
}
