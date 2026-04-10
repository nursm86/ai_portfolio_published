'use client';

import { motion } from 'framer-motion';
import { Check, Copy, Eye, Loader2, Users } from 'lucide-react';
import { useState } from 'react';

import type { P2PStatus } from '@/hooks/use-p2p-room';
import type { P2PRole } from '@/lib/hex/p2p/protocol';

interface HexP2PLobbyProps {
  role: P2PRole;
  status: P2PStatus;
  roomId: string;
  myName: string;
  joinerReady: boolean;
  onNameChange: (name: string) => void;
  onJoinerReady: () => void;
  onBecomeOwner: () => void;
  onCancel: () => void;
}

export default function HexP2PLobby({
  role,
  status,
  roomId,
  myName,
  joinerReady,
  onNameChange,
  onJoinerReady,
  onBecomeOwner,
  onCancel,
}: HexP2PLobbyProps) {
  const [copied, setCopied] = useState<'player' | 'spectator' | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const playerLink = `${origin}/hex?room=${roomId}`;
  const spectatorLink = `${origin}/hex?room=${roomId}&spectate=1`;

  const copy = async (text: string, which: 'player' | 'spectator') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard access denied — ignore */
    }
  };

  const title =
    role === 'owner'
      ? status === 'waiting'
        ? 'Waiting for your friend…'
        : status === 'live'
          ? 'Friend connected!'
          : 'Connecting…'
      : role === 'spectator'
        ? 'Joining as spectator…'
        : !joinerReady
          ? 'Join this Hex room'
          : status === 'error'
            ? 'Opponent not online'
            : 'Connecting to the room…';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-6"
    >
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          {role === 'joiner' && !joinerReady ? (
            <Users className="text-blue-400" size={20} />
          ) : status === 'waiting' || status === 'searching' || status === 'connecting' ? (
            <Loader2 className="animate-spin text-blue-400" size={20} />
          ) : role === 'spectator' ? (
            <Eye className="text-neutral-400" size={20} />
          ) : (
            <Users className="text-blue-400" size={20} />
          )}
          <h1 className="text-xl font-semibold text-neutral-200">{title}</h1>
        </div>
        <p className="text-sm text-neutral-500">
          Room <span className="font-mono text-neutral-300">{roomId}</span>
        </p>
      </div>

      <div className="w-full">
        <label className="mb-2 block text-xs font-medium tracking-wide text-neutral-400 uppercase">
          Your name
        </label>
        <input
          type="text"
          value={myName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter a display name"
          maxLength={24}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {role === 'owner' && (
        <div className="flex w-full flex-col items-center gap-3">
          <button
            onClick={() => copy(playerLink, 'player')}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            {copied === 'player' ? <Check size={16} /> : <Copy size={16} />}
            {copied === 'player' ? 'Invite link copied!' : 'Copy invite link'}
          </button>
          <button
            onClick={() => copy(spectatorLink, 'spectator')}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/50 py-2.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
          >
            {copied === 'spectator' ? <Check size={14} /> : <Eye size={14} />}
            {copied === 'spectator' ? 'Spectator link copied!' : 'Copy spectator link'}
          </button>
          <p className="mt-1 max-w-xs text-center text-[11px] text-neutral-500">
            Share the invite link with your friend. Spectator link is optional — anyone with
            it can watch the game.
          </p>
        </div>
      )}

      {role === 'joiner' && !joinerReady && (
        <button
          onClick={onJoinerReady}
          disabled={!myName.trim()}
          className="w-full max-w-xs rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Join Game
        </button>
      )}

      {role === 'joiner' && joinerReady && status === 'error' && (
        <div className="w-full rounded-lg border border-amber-700/40 bg-amber-950/30 p-3 text-xs text-amber-300">
          <p className="mb-2">The room&apos;s owner isn&apos;t online right now.</p>
          <button
            onClick={onBecomeOwner}
            className="rounded bg-amber-600 px-3 py-1.5 text-white transition-colors hover:bg-amber-500"
          >
            Become owner & wait for them
          </button>
        </div>
      )}

      <button
        onClick={onCancel}
        className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
      >
        Cancel
      </button>
    </motion.div>
  );
}
