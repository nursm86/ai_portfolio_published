'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PlayerColor } from '@/lib/hex/types';
import {
  decode,
  encode,
  makeEnvelope,
  randomId,
  type ChatPayload,
  type HelloPayload,
  type MsgKind,
  type P2PRole,
  type SerializedGameState,
  type TypedEnvelope,
} from '@/lib/hex/p2p/protocol';

const WS_URL = 'wss://beyondtomorrowenterprises.com/ws/';
const WS_PASSWORD =
  process.env.NEXT_PUBLIC_HEX_WS_PASSWORD ?? 'M#d1t72&7R4Y*m6P4o6ZFXS4';

const HELLO_RETRY_INTERVAL_MS = 2000;
const HELLO_MAX_RETRIES = 8;
const TIEBREAKER_DELAY_MS = 6000;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_CAP_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 20;

export type P2PStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'waiting'
  | 'searching'
  | 'live'
  | 'error';

export interface PeerInfo {
  clientId: string;
  name: string;
}

export interface UseP2PRoomOptions {
  enabled: boolean;
  roomId: string | null;
  role: P2PRole;
  myClientId: string;
  myName: string;
  createdAt: number;

  getLocalState: () => SerializedGameState | null;

  onPeerJoined: (peer: PeerInfo) => void;
  onPeerLeft: () => void;
  onRemoteMove: (
    row: number,
    col: number,
    color: PlayerColor,
    moveSeq: number,
    gameId: string,
  ) => void;
  onStateSync: (sync: SerializedGameState) => void;
  onRemoteSurrender: (by: string, gameId: string) => void;
  onPlayAgainRequest: (req: {
    requestId: string;
    swapColors: boolean;
    from: string;
  }) => void;
  onPlayAgainResolved: (accepted: boolean, swapColors: boolean) => void;
  onColorSwapRequest: (req: { requestId: string; from: string }) => void;
  onColorSwapResolved: (accepted: boolean) => void;
  onPromoteToOwner: () => void;
  onChatMessage: (msg: {
    id: string;
    from: string;
    fromName: string;
    text: string;
    emote?: string;
    ts: number;
  }) => void;
}

export interface UseP2PRoomResult {
  status: P2PStatus;
  peer: PeerInfo | null;
  sendMove: (row: number, col: number, color: PlayerColor, moveSeq: number, gameId: string) => void;
  sendSurrender: (color: PlayerColor, gameId: string) => void;
  sendPlayAgainReq: (swapColors: boolean) => string;
  sendPlayAgainAck: (requestId: string, accepted: boolean, swapColors: boolean) => void;
  sendColorSwapReq: () => string;
  sendColorSwapAck: (requestId: string, accepted: boolean) => void;
  sendLeave: () => void;
  sendChat: (text: string, emote?: string) => string;
  broadcastStateSync: () => void;
}

interface OtherJoiner {
  clientId: string;
  createdAt: number;
}

/**
 * WebSocket lifecycle hook for the P2P Hex room. Structured after the
 * proven `useLiveStreamingWebSocket` pattern:
 *   - single `unmounted` flag governs all reconnect behaviour
 *   - all callbacks are mirrored into one `callbacksRef` ref, updated on each
 *     render, so `connect` has stable identity with empty deps
 *   - `connect` / `scheduleReconnect` are useCallbacks; the main effect's
 *     only semantic dep is `enabled`
 *
 * Peer presence is event-driven only — we never time peers out. The only
 * triggers for peerConnected flipping to false are receiving an explicit
 * `leave` message from the peer or our own WS closing without reconnect.
 * The `websockets` Python library handles protocol-level keepalive.
 */
export function useP2PRoom(opts: UseP2PRoomOptions): UseP2PRoomResult {
  const [status, setStatus] = useState<P2PStatus>('idle');
  const [peer, setPeer] = useState<PeerInfo | null>(null);

  // Stable ref to all option values — read in all long-lived callbacks so
  // callback-identity churn never triggers a reconnect.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  // Stateful refs that persist across reconnects.
  const wsRef = useRef<WebSocket | null>(null);
  const unmounted = useRef(false);
  const seqRef = useRef(0);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const helloTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const helloRetryCount = useRef(0);
  const tiebreakerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peerRef = useRef<PeerInfo | null>(null);
  const otherJoinerRef = useRef<OtherJoiner | null>(null);
  const spectatorsRef = useRef<Set<string>>(new Set());

  const clearHelloTimer = useCallback(() => {
    if (helloTimer.current) {
      clearInterval(helloTimer.current);
      helloTimer.current = null;
    }
  }, []);

  const clearTiebreakerTimer = useCallback(() => {
    if (tiebreakerTimer.current) {
      clearTimeout(tiebreakerTimer.current);
      tiebreakerTimer.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const rawSend = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const sendEnvelope = useCallback(
    <K extends MsgKind>(kind: K, payload: unknown, to?: string) => {
      const o = optsRef.current;
      if (!o.roomId) return;
      seqRef.current += 1;
      const env = makeEnvelope(kind, payload as never, {
        room: o.roomId,
        from: o.myClientId,
        fromName: o.myName,
        fromRole: o.role,
        seq: seqRef.current,
        to,
      });
      rawSend(encode(env));
    },
    [rawSend],
  );

  const sendHello = useCallback(
    (needsSync = false) => {
      const o = optsRef.current;
      const payload: HelloPayload = {
        role: o.role,
        name: o.myName,
        clientId: o.myClientId,
        createdAt: o.createdAt,
        needsSync,
      };
      sendEnvelope('hello', payload);
    },
    [sendEnvelope],
  );

  const sendHelloAck = useCallback(
    (to: string) => {
      const o = optsRef.current;
      sendEnvelope(
        'hello-ack',
        { name: o.myName, clientId: o.myClientId, acceptsSpectators: true },
        to,
      );
    },
    [sendEnvelope],
  );

  const sendStateSyncTo = useCallback(
    (to?: string) => {
      const sync = optsRef.current.getLocalState();
      if (!sync) return;
      sendEnvelope('state-sync', sync, to);
    },
    [sendEnvelope],
  );

  const broadcastStateSync = useCallback(() => {
    const p = peerRef.current;
    if (p) sendStateSyncTo(p.clientId);
    for (const sid of spectatorsRef.current) sendStateSyncTo(sid);
  }, [sendStateSyncTo]);

  const startHelloLoop = useCallback(() => {
    clearHelloTimer();
    helloRetryCount.current = 0;
    sendHello(true);
    helloRetryCount.current += 1;
    helloTimer.current = setInterval(() => {
      const o = optsRef.current;
      helloRetryCount.current += 1;
      if (o.role === 'joiner' && helloRetryCount.current > HELLO_MAX_RETRIES) {
        clearHelloTimer();
        setStatus('error');
        return;
      }
      sendHello(true);
    }, HELLO_RETRY_INTERVAL_MS);
  }, [clearHelloTimer, sendHello]);

  const maybeArmTiebreaker = useCallback(() => {
    if (optsRef.current.role !== 'joiner') return;
    if (tiebreakerTimer.current) return;
    tiebreakerTimer.current = setTimeout(() => {
      tiebreakerTimer.current = null;
      const o = optsRef.current;
      const other = otherJoinerRef.current;
      if (o.role !== 'joiner' || !other) return;
      const iWin =
        o.createdAt < other.createdAt ||
        (o.createdAt === other.createdAt && o.myClientId < other.clientId);
      if (!iWin) return;
      o.onPromoteToOwner();
      sendHelloAck(other.clientId);
      sendStateSyncTo(other.clientId);
      const pInfo = { clientId: other.clientId, name: '' };
      peerRef.current = pInfo;
      setPeer(pInfo);
      setStatus('live');
      clearHelloTimer();
    }, TIEBREAKER_DELAY_MS);
  }, [clearHelloTimer, sendHelloAck, sendStateSyncTo]);

  const handleEnvelope = useCallback(
    (env: TypedEnvelope) => {
      const o = optsRef.current;
      const from = env.from;
      const fromName = env.fromName;
      const fromRole = env.fromRole;
      switch (env.kind) {
        case 'hello': {
          const payload = env.payload as HelloPayload;
          if (o.role === 'owner') {
            if (payload.role === 'joiner') {
              if (!peerRef.current) {
                const info = { clientId: from, name: fromName };
                peerRef.current = info;
                setPeer(info);
                o.onPeerJoined(info);
                setStatus('live');
              }
              sendHelloAck(from);
              sendStateSyncTo(from);
            } else if (payload.role === 'spectator') {
              spectatorsRef.current.add(from);
              sendHelloAck(from);
              sendStateSyncTo(from);
            }
          } else if (o.role === 'joiner') {
            if (payload.role === 'joiner') {
              otherJoinerRef.current = {
                clientId: from,
                createdAt: payload.createdAt,
              };
              maybeArmTiebreaker();
            }
          }
          break;
        }
        case 'hello-ack': {
          if (o.role === 'joiner' || o.role === 'spectator') {
            const info = { clientId: from, name: fromName };
            peerRef.current = info;
            setPeer(info);
            o.onPeerJoined(info);
            setStatus('live');
            clearHelloTimer();
            clearTiebreakerTimer();
          }
          break;
        }
        case 'state-sync': {
          const sync = env.payload as SerializedGameState;
          o.onStateSync(sync);
          if (!peerRef.current && (fromRole === 'owner' || fromRole === 'joiner')) {
            const info = { clientId: from, name: fromName };
            peerRef.current = info;
            setPeer(info);
            o.onPeerJoined(info);
          }
          setStatus('live');
          break;
        }
        case 'request-state': {
          sendStateSyncTo(from);
          break;
        }
        case 'move': {
          const p = env.payload as {
            row: number;
            col: number;
            color: PlayerColor;
            moveSeq: number;
            gameId: string;
          };
          o.onRemoteMove(p.row, p.col, p.color, p.moveSeq, p.gameId);
          break;
        }
        case 'surrender': {
          const p = env.payload as { color: PlayerColor; gameId: string };
          o.onRemoteSurrender(from, p.gameId);
          break;
        }
        case 'play-again-req': {
          const p = env.payload as { requestId: string; swapColors: boolean };
          o.onPlayAgainRequest({
            requestId: p.requestId,
            swapColors: p.swapColors,
            from,
          });
          break;
        }
        case 'play-again-ack': {
          const p = env.payload as {
            requestId: string;
            accepted: boolean;
            swapColors: boolean;
          };
          o.onPlayAgainResolved(p.accepted, p.swapColors);
          break;
        }
        case 'color-swap-req': {
          const p = env.payload as { requestId: string };
          o.onColorSwapRequest({ requestId: p.requestId, from });
          break;
        }
        case 'color-swap-ack': {
          const p = env.payload as { requestId: string; accepted: boolean };
          o.onColorSwapResolved(p.accepted);
          break;
        }
        case 'leave': {
          if (peerRef.current && peerRef.current.clientId === from) {
            o.onPeerLeft();
            peerRef.current = null;
            setPeer(null);
          }
          spectatorsRef.current.delete(from);
          break;
        }
        case 'chat': {
          const p = env.payload as ChatPayload;
          if (!p || typeof p.text !== 'string') break;
          o.onChatMessage({
            id: p.id,
            from,
            fromName,
            text: p.text.slice(0, 240),
            emote: p.emote,
            ts: env.ts,
          });
          break;
        }
        // No-ops kept for forward compatibility; we don't use application-
        // level keepalive because the Python `websockets` server handles
        // RFC 6455 control frames at the protocol level.
        case 'ping':
        case 'pong':
          break;
      }
    },
    [clearHelloTimer, clearTiebreakerTimer, maybeArmTiebreaker, sendHelloAck, sendStateSyncTo],
  );

  const scheduleReconnect = useCallback(() => {
    if (unmounted.current) return;
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus('error');
      return;
    }
    clearReconnectTimer();
    const attempt = reconnectAttempts.current;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** attempt + Math.random() * 500,
      RECONNECT_CAP_MS,
    );
    reconnectAttempts.current += 1;
    reconnectTimer.current = setTimeout(() => {
      if (!unmounted.current) connect();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    const o = optsRef.current;
    if (!o.enabled || !o.roomId) return;
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted.current) {
          try {
            ws.close();
          } catch {
            /* ignore */
          }
          return;
        }
        try {
          ws.send(WS_PASSWORD);
        } catch {
          /* onclose will fire and trigger reconnect */
        }
      };

      ws.onmessage = (event) => {
        if (unmounted.current) return;
        const raw = typeof event.data === 'string' ? event.data : '';
        if (!raw) return;

        if (raw === 'AUTH OK') {
          reconnectAttempts.current = 0;
          const o2 = optsRef.current;
          if (o2.role === 'owner') {
            setStatus(peerRef.current ? 'live' : 'waiting');
          } else {
            setStatus('searching');
            startHelloLoop();
          }
          return;
        }
        if (raw === 'AUTH FAILED') {
          setStatus('error');
          try {
            ws.close();
          } catch {
            /* ignore */
          }
          return;
        }

        const env = decode(raw, optsRef.current.roomId!, optsRef.current.myClientId);
        if (!env) return;
        handleEnvelope(env);
      };

      ws.onerror = () => {
        /* onclose fires next; reconnect handled there */
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        wsRef.current = null;
        clearHelloTimer();
        setStatus('connecting');
        scheduleReconnect();
      };
    } catch {
      setStatus('error');
      scheduleReconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearHelloTimer, handleEnvelope, scheduleReconnect, startHelloLoop]);

  useEffect(() => {
    unmounted.current = false;
    if (opts.enabled && opts.roomId) {
      connect();
    } else {
      setStatus('idle');
    }
    return () => {
      unmounted.current = true;
      clearHelloTimer();
      clearTiebreakerTimer();
      clearReconnectTimer();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        try {
          const o = optsRef.current;
          if (o.roomId && ws.readyState === WebSocket.OPEN) {
            seqRef.current += 1;
            const env = makeEnvelope(
              'leave',
              { reason: 'navigated' },
              {
                room: o.roomId,
                from: o.myClientId,
                fromName: o.myName,
                fromRole: o.role,
                seq: seqRef.current,
              },
            );
            ws.send(encode(env));
          }
          ws.close();
        } catch {
          /* ignore */
        }
      }
      peerRef.current = null;
      setPeer(null);
      otherJoinerRef.current = null;
      spectatorsRef.current = new Set();
      setStatus('idle');
    };
  }, [
    opts.enabled,
    opts.roomId,
    connect,
    clearHelloTimer,
    clearTiebreakerTimer,
    clearReconnectTimer,
  ]);

  // ---- Public senders ----
  const sendMove = useCallback(
    (row: number, col: number, color: PlayerColor, moveSeq: number, gameId: string) => {
      sendEnvelope('move', { row, col, color, moveSeq, gameId });
    },
    [sendEnvelope],
  );

  const sendSurrender = useCallback(
    (color: PlayerColor, gameId: string) => {
      sendEnvelope('surrender', { color, gameId });
    },
    [sendEnvelope],
  );

  const sendPlayAgainReq = useCallback(
    (swapColors: boolean) => {
      const requestId = randomId(8);
      sendEnvelope('play-again-req', { requestId, swapColors });
      return requestId;
    },
    [sendEnvelope],
  );

  const sendPlayAgainAck = useCallback(
    (requestId: string, accepted: boolean, swapColors: boolean) => {
      sendEnvelope('play-again-ack', { requestId, accepted, swapColors });
    },
    [sendEnvelope],
  );

  const sendColorSwapReq = useCallback(() => {
    const requestId = randomId(8);
    sendEnvelope('color-swap-req', { requestId });
    return requestId;
  }, [sendEnvelope]);

  const sendColorSwapAck = useCallback(
    (requestId: string, accepted: boolean) => {
      sendEnvelope('color-swap-ack', { requestId, accepted });
    },
    [sendEnvelope],
  );

  const sendLeave = useCallback(() => {
    sendEnvelope('leave', { reason: 'manual' });
  }, [sendEnvelope]);

  const sendChat = useCallback(
    (text: string, emote?: string) => {
      const id = randomId(8);
      const trimmed = text.slice(0, 240);
      sendEnvelope('chat', { id, text: trimmed, emote });
      return id;
    },
    [sendEnvelope],
  );

  return {
    status,
    peer,
    sendMove,
    sendSurrender,
    sendPlayAgainReq,
    sendPlayAgainAck,
    sendColorSwapReq,
    sendColorSwapAck,
    sendLeave,
    sendChat,
    broadcastStateSync,
  };
}
