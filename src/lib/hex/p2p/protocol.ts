import type { PlayerColor } from '@/lib/hex/types';

export const APP_TAG = 'hex-p2p' as const;
export const PROTOCOL_VERSION = 1 as const;

export type P2PRole = 'owner' | 'joiner' | 'spectator';

/**
 * Serialized game state passed across the wire (and persisted to localStorage).
 * Round-tripped by `serializer.ts`.
 */
export interface SerializedGameState {
  boardSize: number;
  board: number[];
  turn: PlayerColor;
  moveHistory: { player: PlayerColor; row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
  winner: PlayerColor | null;
  winningPath: number[];
  gameId: string;
  moveSeq: number;
  scoreboard: Record<string, number>;
  ownerClientId: string;
  ownerName: string;
  ownerColor: PlayerColor;
  joinerClientId: string | null;
  joinerName: string | null;
  surrenderedBy: string | null;
}

export type MsgKind =
  | 'hello'
  | 'hello-ack'
  | 'state-sync'
  | 'request-state'
  | 'move'
  | 'surrender'
  | 'play-again-req'
  | 'play-again-ack'
  | 'color-swap-req'
  | 'color-swap-ack'
  | 'leave'
  | 'chat'
  | 'ping'
  | 'pong';

export interface HelloPayload {
  role: P2PRole;
  name: string;
  clientId: string;
  createdAt: number;
  needsSync?: boolean;
}

export interface HelloAckPayload {
  name: string;
  clientId: string;
  acceptsSpectators: boolean;
}

export interface RequestStatePayload {
  lastSeenMoveSeq: number;
}

export interface MovePayload {
  row: number;
  col: number;
  color: PlayerColor;
  moveSeq: number;
  gameId: string;
}

export interface SurrenderPayload {
  color: PlayerColor;
  gameId: string;
}

export interface PlayAgainReqPayload {
  requestId: string;
  swapColors: boolean;
}

export interface PlayAgainAckPayload {
  requestId: string;
  accepted: boolean;
  swapColors: boolean;
}

export interface ColorSwapReqPayload {
  requestId: string;
}

export interface ColorSwapAckPayload {
  requestId: string;
  accepted: boolean;
}

export interface LeavePayload {
  reason: 'closed' | 'navigated' | 'manual';
}

export interface ChatPayload {
  /** Short free-form text, limited to 240 chars on the UI side. */
  text: string;
  /** Optional unicode emoji rendered as a prefix on the bubble. */
  emote?: string;
  /** Client-generated id so receivers can dedupe and key React lists. */
  id: string;
}

export interface Envelope<K extends MsgKind = MsgKind, P = unknown> {
  app: typeof APP_TAG;
  v: typeof PROTOCOL_VERSION;
  room: string;
  from: string;
  fromName: string;
  fromRole: P2PRole;
  to?: string;
  ts: number;
  seq: number;
  kind: K;
  payload: P;
}

type KindToPayload = {
  hello: HelloPayload;
  'hello-ack': HelloAckPayload;
  'state-sync': SerializedGameState;
  'request-state': RequestStatePayload;
  move: MovePayload;
  surrender: SurrenderPayload;
  'play-again-req': PlayAgainReqPayload;
  'play-again-ack': PlayAgainAckPayload;
  'color-swap-req': ColorSwapReqPayload;
  'color-swap-ack': ColorSwapAckPayload;
  leave: LeavePayload;
  chat: ChatPayload;
  ping: Record<string, never>;
  pong: Record<string, never>;
};

export type TypedEnvelope<K extends MsgKind = MsgKind> = Envelope<K, KindToPayload[K]>;

export function encode<K extends MsgKind>(env: Envelope<K, KindToPayload[K]>): string {
  return JSON.stringify(env);
}

/**
 * Parse and validate an inbound message. Returns null if:
 *   - the message isn't JSON
 *   - it's a server control string ("AUTH OK" / "AUTH FAILED")
 *   - it's not a hex-p2p envelope
 *   - it's for a different room
 *   - it's addressed to someone else
 *   - it's from ourselves (defence in depth)
 */
export function decode(
  raw: string,
  expectedRoom: string,
  myClientId: string,
): TypedEnvelope | null {
  if (raw === 'AUTH OK' || raw === 'AUTH FAILED') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const env = parsed as Partial<Envelope>;
  if (env.app !== APP_TAG) return null;
  if (env.v !== PROTOCOL_VERSION) return null;
  if (env.room !== expectedRoom) return null;
  if (env.from === myClientId) return null;
  if (env.to && env.to !== myClientId) return null;
  if (typeof env.kind !== 'string') return null;
  return env as TypedEnvelope;
}

/**
 * Cryptographically-random URL-safe id. Used for clientId, roomId, gameId, requestId.
 * We avoid the `nanoid` dependency since this is all we need from it.
 */
export function randomId(length = 12): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Build an envelope with the fixed header fields filled in. */
export function makeEnvelope<K extends MsgKind>(
  kind: K,
  payload: KindToPayload[K],
  ctx: {
    room: string;
    from: string;
    fromName: string;
    fromRole: P2PRole;
    seq: number;
    to?: string;
  },
): Envelope<K, KindToPayload[K]> {
  return {
    app: APP_TAG,
    v: PROTOCOL_VERSION,
    room: ctx.room,
    from: ctx.from,
    fromName: ctx.fromName,
    fromRole: ctx.fromRole,
    to: ctx.to,
    ts: Date.now(),
    seq: ctx.seq,
    kind,
    payload,
  };
}
