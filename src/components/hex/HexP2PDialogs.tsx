'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Flag, RefreshCcw, Users, X } from 'lucide-react';
import { type ReactNode } from 'react';

interface ModalShellProps {
  open: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}

function ModalShell({ open, onClose, icon, title, children, actions }: ModalShellProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl"
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-500 transition-colors hover:text-neutral-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
            <div className="mb-3 flex items-center gap-2 text-neutral-200">
              {icon}
              <h3 className="text-base font-semibold">{title}</h3>
            </div>
            <div className="mb-4 text-sm text-neutral-400">{children}</div>
            <div className="flex justify-end gap-2">{actions}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SurrenderConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      icon={<Flag className="text-red-400" size={18} />}
      title="Surrender this game?"
      actions={
        <>
          <button
            onClick={onCancel}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-500"
          >
            Yes, surrender
          </button>
        </>
      }
    >
      Your opponent will win the current game. The match score updates and you can still
      play again.
    </ModalShell>
  );
}

export function IncomingPlayAgainDialog({
  open,
  fromName,
  swapColors,
  onAccept,
  onDecline,
}: {
  open: boolean;
  fromName: string;
  swapColors: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <ModalShell
      open={open}
      icon={<RefreshCcw className="text-blue-400" size={18} />}
      title={`${fromName || 'Opponent'} wants a rematch`}
      actions={
        <>
          <button
            onClick={onDecline}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500"
          >
            Accept
          </button>
        </>
      }
    >
      {swapColors
        ? 'They want to swap colors for the next game.'
        : 'Same colors as this game. Ready?'}
    </ModalShell>
  );
}

export function IncomingColorSwapDialog({
  open,
  fromName,
  onAccept,
  onDecline,
}: {
  open: boolean;
  fromName: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <ModalShell
      open={open}
      icon={<RefreshCcw className="text-amber-400" size={18} />}
      title={`${fromName || 'Opponent'} wants to swap colors`}
      actions={
        <>
          <button
            onClick={onDecline}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500"
          >
            Accept
          </button>
        </>
      }
    >
      The next game will start with the colors swapped.
    </ModalShell>
  );
}

export function LeaveConfirmDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onStay}
      icon={<AlertTriangle className="text-amber-400" size={18} />}
      title="Leave this game?"
      actions={
        <>
          <button
            onClick={onStay}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500"
          >
            Keep playing
          </button>
          <button
            onClick={onLeave}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
          >
            Leave anyway
          </button>
        </>
      }
    >
      Your game is still in progress. If you leave, your opponent will have to wait — or you
      can just finish the game first.
    </ModalShell>
  );
}

export function PeerLeftDialog({
  open,
  peerName,
  onDismiss,
}: {
  open: boolean;
  peerName: string;
  onDismiss: () => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onDismiss}
      icon={<Users className="text-neutral-400" size={18} />}
      title={`${peerName || 'Opponent'} disconnected`}
      actions={
        <button
          onClick={onDismiss}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          Got it
        </button>
      }
    >
      Waiting for them to come back. The game state is preserved — they&apos;ll rejoin where
      you left off.
    </ModalShell>
  );
}
