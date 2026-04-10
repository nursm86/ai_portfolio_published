import { randomId, type SerializedGameState } from './protocol';

const PREFIX = 'hexP2P:';
const CLIENT_ID_KEY = `${PREFIX}clientId`;
const NAME_KEY = `${PREFIX}name`;
const OWNER_PREFIX = `${PREFIX}owner:`;
const STATE_PREFIX = `${PREFIX}state:`;
const SCORE_PREFIX = `${PREFIX}scoreboard:`;
const MAX_ROOMS = 5;

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or storage disabled — ignore */
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function safeKeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) out.push(k);
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * clientId is per-tab (sessionStorage), not per-browser. Two tabs in the same
 * browser profile get distinct ids — otherwise the WS relay's self-echo filter
 * would drop every message between them because they'd share a clientId.
 */
export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return randomId(12);
  try {
    const existing = window.sessionStorage.getItem(CLIENT_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const fresh = randomId(12);
    window.sessionStorage.setItem(CLIENT_ID_KEY, fresh);
    return fresh;
  } catch {
    return randomId(12);
  }
}

export function getStoredName(): string | null {
  return safeGet(NAME_KEY);
}

export function setStoredName(name: string): void {
  safeSet(NAME_KEY, name.slice(0, 24));
}

export interface OwnerFlag {
  clientId: string;
  createdAt: number;
  name: string;
}

export function getOwnerFlag(roomId: string): OwnerFlag | null {
  const raw = safeGet(OWNER_PREFIX + roomId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.clientId === 'string' &&
      typeof parsed.createdAt === 'number' &&
      typeof parsed.name === 'string'
    ) {
      return parsed as OwnerFlag;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setOwnerFlag(roomId: string, flag: OwnerFlag): void {
  safeSet(OWNER_PREFIX + roomId, JSON.stringify(flag));
}

export function clearOwnerFlag(roomId: string): void {
  safeRemove(OWNER_PREFIX + roomId);
}

export function getPersistedState(roomId: string): SerializedGameState | null {
  const raw = safeGet(STATE_PREFIX + roomId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'board' in parsed && 'gameId' in parsed) {
      return parsed as SerializedGameState;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function persistState(roomId: string, state: SerializedGameState): void {
  safeSet(STATE_PREFIX + roomId, JSON.stringify(state));
}

export function getScoreboard(roomId: string): Record<string, number> {
  const raw = safeGet(SCORE_PREFIX + roomId);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number') out[k] = v;
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function setScoreboard(roomId: string, board: Record<string, number>): void {
  safeSet(SCORE_PREFIX + roomId, JSON.stringify(board));
}

/**
 * Prune old per-room entries on mount. Keeps the N most recently updated rooms
 * (by state blob modification time, inferred from file order since we can't
 * reliably read mtime from localStorage). Owner flags are kept for the same rooms.
 */
export function gcOldRooms(max = MAX_ROOMS): void {
  if (typeof window === 'undefined') return;
  const keys = safeKeys();
  const stateKeys = keys.filter((k) => k.startsWith(STATE_PREFIX));
  if (stateKeys.length <= max) return;
  // Read each state, sort by lastModified (we store `lastWriteAt` below).
  const entries: { key: string; roomId: string; lastWriteAt: number }[] = [];
  for (const key of stateKeys) {
    const raw = safeGet(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      entries.push({
        key,
        roomId: key.slice(STATE_PREFIX.length),
        lastWriteAt: typeof parsed?.lastWriteAt === 'number' ? parsed.lastWriteAt : 0,
      });
    } catch {
      entries.push({ key, roomId: key.slice(STATE_PREFIX.length), lastWriteAt: 0 });
    }
  }
  entries.sort((a, b) => b.lastWriteAt - a.lastWriteAt);
  const toDelete = entries.slice(max);
  for (const e of toDelete) {
    safeRemove(STATE_PREFIX + e.roomId);
    safeRemove(SCORE_PREFIX + e.roomId);
    safeRemove(OWNER_PREFIX + e.roomId);
  }
}
