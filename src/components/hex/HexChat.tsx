'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  fromClientId: string;
  fromName: string;
  text: string;
  emote?: string;
  ts: number;
}

interface HexChatProps {
  myClientId: string;
  messages: ChatMessage[];
  disabled?: boolean;
  onSend: (text: string, emote?: string) => void;
}

const EMOTES = ['😂', '😠', '🔥', '🤔', '👏', '😎'] as const;
const QUICK_MESSAGES = [
  'You first!',
  'Hurry up…',
  "You're losing 😏",
  'Nice move!',
  'GG',
] as const;

export default function HexChat({ myClientId, messages, disabled, onSend }: HexChatProps) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest on new message.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, open]);

  // Track unread count when collapsed.
  useEffect(() => {
    if (open) {
      const latest = messages[messages.length - 1];
      lastSeenIdRef.current = latest?.id ?? null;
      setUnreadCount(0);
      return;
    }
    const lastSeen = lastSeenIdRef.current;
    if (!lastSeen) {
      setUnreadCount(messages.filter((m) => m.fromClientId !== myClientId).length);
      return;
    }
    const idx = messages.findIndex((m) => m.id === lastSeen);
    const tail = idx === -1 ? messages : messages.slice(idx + 1);
    setUnreadCount(tail.filter((m) => m.fromClientId !== myClientId).length);
  }, [messages, open, myClientId]);

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleEmote = (emote: string) => {
    if (disabled) return;
    onSend('', emote);
  };

  const handleQuick = (text: string) => {
    if (disabled) return;
    onSend(text);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 sm:justify-end sm:px-4 sm:pb-4">
      <motion.div
        layout
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900/90 shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800/60"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-blue-400" />
            <span className="font-medium">Chat</span>
            {!open && unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          {open ? (
            <ChevronDown size={14} className="text-neutral-400" />
          ) : (
            <ChevronUp size={14} className="text-neutral-400" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="chat-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-t border-neutral-800"
            >
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex max-h-52 min-h-[80px] flex-col gap-1.5 overflow-y-auto px-3 py-2"
              >
                {messages.length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-neutral-500">
                    Say hi to your opponent…
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.fromClientId === myClientId;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-1.5 text-[13px] leading-snug ${
                            mine
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-800 text-neutral-200'
                          }`}
                        >
                          {!mine && (
                            <div className="mb-0.5 text-[10px] font-medium text-neutral-400">
                              {m.fromName || 'Opponent'}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            {m.emote && <span className="text-base">{m.emote}</span>}
                            {m.text && <span className="break-words">{m.text}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick messages */}
              <div className="flex flex-wrap gap-1 border-t border-neutral-800 px-3 py-2">
                {QUICK_MESSAGES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuick(q)}
                    disabled={disabled}
                    className="rounded-full border border-neutral-700 bg-neutral-800/60 px-2.5 py-1 text-[11px] text-neutral-300 transition-colors hover:border-blue-500/60 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Emote row + input */}
              <div className="flex items-center gap-1 border-t border-neutral-800 px-3 py-2">
                {EMOTES.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleEmote(e)}
                    disabled={disabled}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Send ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-neutral-800 px-3 py-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={disabled ? 'Chat disabled' : 'Type a message…'}
                  maxLength={240}
                  disabled={disabled}
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                />
                <button
                  onClick={submit}
                  disabled={disabled || !draft.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
