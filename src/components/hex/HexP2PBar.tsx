'use client';

import { Flag, RefreshCcw } from 'lucide-react';

import type { P2PStatus } from '@/hooks/use-p2p-room';
import { RED, type PlayerColor } from '@/lib/hex/types';

interface HexP2PBarProps {
  status: P2PStatus;
  myName: string;
  myClientId: string;
  myColor: PlayerColor;
  peerName: string | null;
  peerClientId: string | null;
  peerConnected: boolean;
  scoreboard: Record<string, number>;
  canSurrender: boolean;
  canSwapColors: boolean;
  onSurrender: () => void;
  onSwapColorsRequest: () => void;
  isSpectator: boolean;
}

export default function HexP2PBar({
  status,
  myName,
  myClientId,
  myColor,
  peerName,
  peerClientId,
  peerConnected,
  scoreboard,
  canSurrender,
  canSwapColors,
  onSurrender,
  onSwapColorsRequest,
  isSpectator,
}: HexP2PBarProps) {
  const myScore = scoreboard[myClientId] ?? 0;
  const peerScore = peerClientId ? (scoreboard[peerClientId] ?? 0) : 0;
  const myColorLabel = myColor === RED ? 'Red' : 'Blue';
  const myColorClass = myColor === RED ? 'text-red-400' : 'text-blue-400';
  const peerColorClass = myColor === RED ? 'text-blue-400' : 'text-red-400';
  const peerColorLabel = myColor === RED ? 'Blue' : 'Red';

  const statusDot =
    status === 'live' && peerConnected
      ? 'bg-emerald-500'
      : status === 'connecting'
        ? 'bg-amber-500'
        : 'bg-red-500';

  const statusLabel =
    status === 'live' && peerConnected
      ? 'Connected'
      : status === 'live' && !peerConnected
        ? 'Opponent offline'
        : status === 'connecting'
          ? 'Connecting…'
          : status === 'waiting' || status === 'searching'
            ? 'Waiting…'
            : status === 'error'
              ? 'Connection error'
              : 'Idle';

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-2.5">
        <div
          className="flex items-center gap-2 text-sm"
          title={`clientId: ${myClientId.slice(-4)}`}
        >
          <div className={`h-2 w-2 rounded-full ${myColor === RED ? 'bg-red-500' : 'bg-blue-500'}`} />
          <span className={`font-medium ${myColorClass}`}>{myName || 'You'}</span>
          <span className="text-neutral-500">({myColorLabel})</span>
          <span className="ml-1 text-base font-semibold text-neutral-200">{myScore}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </div>

        <div
          className="flex items-center gap-2 text-sm"
          title={peerClientId ? `clientId: ${peerClientId.slice(-4)}` : undefined}
        >
          <span className="text-base font-semibold text-neutral-200">{peerScore}</span>
          <span className="text-neutral-500">({peerColorLabel})</span>
          <span className={`font-medium ${peerColorClass}`}>{peerName || 'Waiting…'}</span>
          <div className={`h-2 w-2 rounded-full ${myColor === RED ? 'bg-blue-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {!isSpectator && (
        <div className="flex items-center gap-2">
          <button
            onClick={onSurrender}
            disabled={!canSurrender}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-red-900/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Flag size={12} />
            Surrender
          </button>
          <button
            onClick={onSwapColorsRequest}
            disabled={!canSwapColors}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            title={canSwapColors ? 'Swap colors for the next game' : 'Only available between games'}
          >
            <RefreshCcw size={12} />
            Swap colors
          </button>
        </div>
      )}
    </div>
  );
}
