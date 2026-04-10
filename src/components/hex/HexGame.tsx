'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import HexBoard from './HexBoard';
import HexChat, { type ChatMessage } from './HexChat';
import HexControls from './HexControls';
import HexStatusBar from './HexStatusBar';
import HexP2PBar from './HexP2PBar';
import HexP2PLobby from './HexP2PLobby';
import {
  IncomingColorSwapDialog,
  IncomingPlayAgainDialog,
  LeaveConfirmDialog,
  PeerLeftDialog,
  SurrenderConfirmDialog,
} from './HexP2PDialogs';

import { Board } from '@/lib/hex/board';
import {
  RED,
  BLUE,
  type AIType,
  type GamePhase,
  type PlayerColor,
  type Cell,
} from '@/lib/hex/types';

// Import AI functions
import { getMove as getRandomMove } from '@/lib/hex/ai/random';
import { getMove as getHeuristicMove } from '@/lib/hex/ai/heuristic';
import { getMove as getComplexMove } from '@/lib/hex/ai/complex-heuristic';
import { getMove as getMonteCarloMove } from '@/lib/hex/ai/monte-carlo';
import { getMove as getMinimaxMove } from '@/lib/hex/ai/minimax';

import { useP2PRoom, type PeerInfo } from '@/hooks/use-p2p-room';
import {
  randomId,
  type P2PRole,
  type SerializedGameState,
} from '@/lib/hex/p2p/protocol';
import {
  clearOwnerFlag,
  gcOldRooms,
  getOrCreateClientId,
  getOwnerFlag,
  getPersistedState,
  getScoreboard,
  getStoredName,
  persistState,
  setOwnerFlag,
  setScoreboard,
  setStoredName,
} from '@/lib/hex/p2p/storage';
import { rebuildAvailableMoves, serializeForWire } from '@/lib/hex/p2p/serializer';

type GameMode = 'ai' | 'p2p-owner' | 'p2p-joiner' | 'p2p-spectator';

interface P2PState {
  roomId: string;
  gameId: string;
  myColor: PlayerColor;
  myClientId: string;
  myName: string;
  peerClientId: string | null;
  peerName: string | null;
  peerConnected: boolean;
  moveSeq: number;
  broadcastedSeq: number;
  scoreboard: Record<string, number>;
  pendingPlayAgain: { requestId: string; from: string; swapColors: boolean } | null;
  pendingColorSwap: { requestId: string; from: string } | null;
  surrenderedBy: string | null;
}

interface State {
  boardSize: number;
  board: number[];
  availableMoves: Cell[];
  turn: PlayerColor;
  humanPlayer: PlayerColor;
  aiType: AIType;
  gamePhase: GamePhase;
  winner: PlayerColor | null;
  winningPath: number[];
  moveHistory: { player: PlayerColor; row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
  mode: GameMode;
  p2p: P2PState | null;
}

type Action =
  | { type: 'CONFIGURE'; boardSize: number; aiType: AIType; humanFirst: boolean }
  | { type: 'PLACE_STONE'; row: number; col: number }
  | { type: 'AI_THINKING' }
  | { type: 'AI_MOVE'; row: number; col: number }
  | { type: 'GAME_OVER'; winner: PlayerColor; path?: number[] }
  | { type: 'RESET' }
  | { type: 'NEW_GAME' }
  | {
      type: 'START_P2P';
      role: 'p2p-owner' | 'p2p-joiner' | 'p2p-spectator';
      roomId: string;
      gameId: string;
      myClientId: string;
      myName: string;
      myColor: PlayerColor;
      peerClientId?: string | null;
      peerName?: string | null;
      scoreboard: Record<string, number>;
      boardSize: number;
    }
  | { type: 'REMOTE_MOVE'; row: number; col: number; color: PlayerColor; moveSeq: number; gameId: string }
  | { type: 'REMOTE_STATE_SYNC'; sync: SerializedGameState; myClientId: string }
  | { type: 'PEER_JOINED'; peer: PeerInfo }
  | { type: 'PEER_LEFT' }
  | { type: 'MARK_BROADCASTED'; seq: number }
  | { type: 'LOCAL_SURRENDER' }
  | { type: 'REMOTE_SURRENDER'; by: string; gameId: string }
  | { type: 'SCOREBOARD_BUMP'; clientId: string }
  | { type: 'P2P_NEW_GAME'; swapColors: boolean }
  | {
      type: 'SET_PENDING_REQUEST';
      kind: 'playAgain' | 'colorSwap';
      req:
        | { requestId: string; from: string; swapColors: boolean }
        | { requestId: string; from: string }
        | null;
    }
  | { type: 'PROMOTE_TO_OWNER' }
  | { type: 'UPDATE_MY_NAME'; name: string };

function createInitialState(): State {
  return {
    boardSize: 7,
    board: [],
    availableMoves: [],
    turn: RED,
    humanPlayer: RED,
    aiType: 'montecarlo',
    gamePhase: 'setup',
    winner: null,
    winningPath: [],
    moveHistory: [],
    lastMove: null,
    mode: 'ai',
    p2p: null,
  };
}

function initBoard(size: number): { board: number[]; availableMoves: Cell[] } {
  const board = new Array(size * size).fill(0);
  const availableMoves: Cell[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      availableMoves.push({ x: i, y: j, heuristic_p1: 0, heuristic_p2: 0 });
    }
  }
  return { board, availableMoves };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CONFIGURE': {
      const { board, availableMoves } = initBoard(action.boardSize);
      return {
        ...state,
        boardSize: action.boardSize,
        board,
        availableMoves,
        turn: RED,
        humanPlayer: action.humanFirst ? RED : BLUE,
        aiType: action.aiType,
        gamePhase: 'playing',
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
        mode: 'ai',
        p2p: null,
      };
    }
    case 'PLACE_STONE': {
      const { row, col } = action;
      const idx = row * state.boardSize + col;
      if (state.board[idx] !== 0) return state;
      if (state.gamePhase !== 'playing') return state;

      const mover: PlayerColor =
        state.mode === 'ai' ? state.humanPlayer : (state.p2p!.myColor as PlayerColor);
      // Guard: in P2P, only allow placing when it's actually my turn.
      if (state.mode !== 'ai' && state.turn !== mover) return state;

      const newBoard = [...state.board];
      newBoard[idx] = mover;
      const newAvail = state.availableMoves.filter((c) => !(c.x === row && c.y === col));
      const nextTurn: PlayerColor = mover === RED ? BLUE : RED;

      const nextP2P =
        state.mode === 'ai'
          ? state.p2p
          : { ...state.p2p!, moveSeq: state.p2p!.moveSeq + 1 };

      return {
        ...state,
        board: newBoard,
        availableMoves: newAvail,
        turn: nextTurn,
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { player: mover, row, col }],
        p2p: nextP2P,
      };
    }
    case 'AI_THINKING':
      return { ...state, gamePhase: 'thinking' };
    case 'AI_MOVE': {
      const { row, col } = action;
      const idx = row * state.boardSize + col;
      if (state.board[idx] !== 0) {
        return { ...state, gamePhase: 'playing' };
      }

      const aiPlayer = (state.humanPlayer === RED ? BLUE : RED) as PlayerColor;
      const newBoard = [...state.board];
      newBoard[idx] = aiPlayer;
      const newAvail = state.availableMoves.filter((c) => !(c.x === row && c.y === col));

      return {
        ...state,
        board: newBoard,
        availableMoves: newAvail,
        turn: state.humanPlayer,
        gamePhase: 'playing',
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { player: aiPlayer, row, col }],
      };
    }
    case 'GAME_OVER':
      return {
        ...state,
        gamePhase: 'finished',
        winner: action.winner,
        winningPath: action.path || [],
      };
    case 'RESET': {
      const { board, availableMoves } = initBoard(state.boardSize);
      return {
        ...state,
        board,
        availableMoves,
        turn: RED,
        gamePhase: 'playing',
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
      };
    }
    case 'NEW_GAME':
      return createInitialState();

    case 'START_P2P': {
      const { board, availableMoves } = initBoard(action.boardSize);
      const p2p: P2PState = {
        roomId: action.roomId,
        gameId: action.gameId,
        myColor: action.myColor,
        myClientId: action.myClientId,
        myName: action.myName,
        peerClientId: action.peerClientId ?? null,
        peerName: action.peerName ?? null,
        peerConnected: !!action.peerClientId,
        moveSeq: 0,
        broadcastedSeq: 0,
        scoreboard: { ...action.scoreboard },
        pendingPlayAgain: null,
        pendingColorSwap: null,
        surrenderedBy: null,
      };
      return {
        ...state,
        boardSize: action.boardSize,
        board,
        availableMoves,
        turn: RED,
        humanPlayer: action.myColor, // unused in p2p, but kept consistent
        gamePhase: 'playing',
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
        mode: action.role,
        p2p,
      };
    }

    case 'REMOTE_MOVE': {
      if (state.mode === 'ai' || !state.p2p) return state;
      const { row, col, color, moveSeq, gameId } = action;
      if (gameId !== state.p2p.gameId) return state;
      if (moveSeq !== state.p2p.moveSeq + 1) return state;
      const idx = row * state.boardSize + col;
      if (state.board[idx] !== 0) return state;
      if (state.gamePhase !== 'playing') return state;
      if (color !== state.turn) return state;

      const newBoard = [...state.board];
      newBoard[idx] = color;
      const newAvail = state.availableMoves.filter((c) => !(c.x === row && c.y === col));
      const nextTurn: PlayerColor = color === RED ? BLUE : RED;
      return {
        ...state,
        board: newBoard,
        availableMoves: newAvail,
        turn: nextTurn,
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { player: color, row, col }],
        p2p: { ...state.p2p, moveSeq },
      };
    }

    case 'REMOTE_STATE_SYNC': {
      if (state.mode === 'ai' || !state.p2p) return state;
      const s = action.sync;
      const myClientId = action.myClientId;
      // Figure out my color from the sync's owner/joiner clientIds.
      let myColor: PlayerColor = state.p2p.myColor;
      let peerClientId: string | null = state.p2p.peerClientId;
      let peerName: string | null = state.p2p.peerName;
      if (s.ownerClientId === myClientId) {
        myColor = s.ownerColor;
        peerClientId = s.joinerClientId;
        peerName = s.joinerName;
      } else if (s.joinerClientId === myClientId) {
        myColor = s.ownerColor === RED ? BLUE : RED;
        peerClientId = s.ownerClientId;
        peerName = s.ownerName;
      } else {
        // Spectator or unknown — keep existing color.
        peerClientId = s.ownerClientId;
        peerName = s.ownerName;
      }
      return {
        ...state,
        boardSize: s.boardSize,
        board: [...s.board],
        availableMoves: rebuildAvailableMoves(s.board, s.boardSize),
        turn: s.turn,
        winner: s.winner,
        winningPath: [...s.winningPath],
        moveHistory: [...s.moveHistory],
        lastMove: s.lastMove,
        gamePhase: s.winner ? 'finished' : 'playing',
        p2p: {
          ...state.p2p,
          gameId: s.gameId,
          moveSeq: s.moveSeq,
          broadcastedSeq: s.moveSeq,
          myColor,
          peerClientId,
          peerName,
          peerConnected: peerClientId !== null,
          scoreboard: { ...s.scoreboard },
          surrenderedBy: s.surrenderedBy,
        },
      };
    }

    case 'PEER_JOINED': {
      if (state.mode === 'ai' || !state.p2p) return state;
      return {
        ...state,
        p2p: {
          ...state.p2p,
          peerClientId: action.peer.clientId,
          peerName: action.peer.name || state.p2p.peerName,
          peerConnected: true,
        },
      };
    }

    case 'PEER_LEFT': {
      if (state.mode === 'ai' || !state.p2p) return state;
      return {
        ...state,
        p2p: {
          ...state.p2p,
          peerConnected: false,
        },
      };
    }

    case 'MARK_BROADCASTED': {
      if (state.mode === 'ai' || !state.p2p) return state;
      return {
        ...state,
        p2p: { ...state.p2p, broadcastedSeq: action.seq },
      };
    }

    case 'LOCAL_SURRENDER': {
      if (state.mode === 'ai' || !state.p2p) return state;
      const opponentColor: PlayerColor = state.p2p.myColor === RED ? BLUE : RED;
      return {
        ...state,
        gamePhase: 'finished',
        winner: opponentColor,
        p2p: {
          ...state.p2p,
          surrenderedBy: state.p2p.myClientId,
        },
      };
    }

    case 'REMOTE_SURRENDER': {
      if (state.mode === 'ai' || !state.p2p) return state;
      if (action.gameId !== state.p2p.gameId) return state;
      return {
        ...state,
        gamePhase: 'finished',
        winner: state.p2p.myColor,
        p2p: {
          ...state.p2p,
          surrenderedBy: action.by,
        },
      };
    }

    case 'SCOREBOARD_BUMP': {
      if (state.mode === 'ai' || !state.p2p) return state;
      const current = state.p2p.scoreboard[action.clientId] ?? 0;
      return {
        ...state,
        p2p: {
          ...state.p2p,
          scoreboard: {
            ...state.p2p.scoreboard,
            [action.clientId]: current + 1,
          },
        },
      };
    }

    case 'P2P_NEW_GAME': {
      if (state.mode === 'ai' || !state.p2p) return state;
      const { board, availableMoves } = initBoard(state.boardSize);
      const nextColor: PlayerColor = action.swapColors
        ? state.p2p.myColor === RED
          ? BLUE
          : RED
        : state.p2p.myColor;
      return {
        ...state,
        board,
        availableMoves,
        turn: RED,
        winner: null,
        winningPath: [],
        moveHistory: [],
        lastMove: null,
        gamePhase: 'playing',
        p2p: {
          ...state.p2p,
          gameId: randomId(6),
          moveSeq: 0,
          broadcastedSeq: 0,
          myColor: nextColor,
          pendingPlayAgain: null,
          pendingColorSwap: null,
          surrenderedBy: null,
        },
      };
    }

    case 'SET_PENDING_REQUEST': {
      if (state.mode === 'ai' || !state.p2p) return state;
      if (action.kind === 'playAgain') {
        return {
          ...state,
          p2p: {
            ...state.p2p,
            pendingPlayAgain: action.req as P2PState['pendingPlayAgain'],
          },
        };
      } else {
        return {
          ...state,
          p2p: {
            ...state.p2p,
            pendingColorSwap: action.req as P2PState['pendingColorSwap'],
          },
        };
      }
    }

    case 'PROMOTE_TO_OWNER': {
      if (state.mode !== 'p2p-joiner' || !state.p2p) return state;
      return {
        ...state,
        mode: 'p2p-owner',
        p2p: { ...state.p2p, myColor: RED },
      };
    }

    case 'UPDATE_MY_NAME': {
      if (state.mode === 'ai' || !state.p2p) return state;
      if (state.p2p.myName === action.name) return state;
      return {
        ...state,
        p2p: { ...state.p2p, myName: action.name },
      };
    }

    default:
      return state;
  }
}

function checkWinFromBoard(
  board: number[],
  boardSize: number,
  player: PlayerColor,
): { won: boolean; path: number[] } {
  const b = new Board(boardSize);
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const v = board[r * boardSize + c];
      if (v !== 0) b.forcePlace(v as PlayerColor, r, c);
    }
  }
  if (b.checkWin(player) === player) {
    return { won: true, path: b.getWinningPath(player) };
  }
  return { won: false, path: [] };
}

function getAIMove(
  board: number[],
  boardSize: number,
  availableMoves: Cell[],
  player: PlayerColor,
  aiType: AIType,
) {
  const b = new Board(boardSize);
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const v = board[r * boardSize + c];
      if (v !== 0) {
        b.forcePlace(v as PlayerColor, r, c);
      }
    }
  }
  b.setAvailableMoves(availableMoves);
  b.setTurn(player);

  switch (aiType) {
    case 'random':
      return getRandomMove(b, player);
    case 'heuristic':
      return getHeuristicMove(b, player);
    case 'complex':
      return getComplexMove(b, player);
    case 'montecarlo':
      return getMonteCarloMove(b, player);
    case 'minimax':
      return getMinimaxMove(b, player);
    default:
      return getRandomMove(b, player);
  }
}

export default function HexGame() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- P2P session bootstrap ----------------------------------------------------
  const roomParam = searchParams?.get('room') ?? null;
  const isSpectator = searchParams?.get('spectate') === '1';

  const [clientId, setClientId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [initialRole, setInitialRole] = useState<P2PRole | null>(null);
  const [createdAt] = useState<number>(() => Date.now());
  const [joinerReady, setJoinerReady] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
  const [peerLeftDismissed, setPeerLeftDismissed] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // On mount: initialize clientId, name, GC old rooms, decide role if URL has ?room.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gcOldRooms(5);
    const cid = getOrCreateClientId();
    setClientId(cid);
    const storedName = getStoredName();
    setDisplayName(storedName ?? `Player-${cid.slice(-4)}`);

    if (roomParam) {
      if (isSpectator) {
        setInitialRole('spectator');
      } else {
        const owner = getOwnerFlag(roomParam);
        if (owner && owner.clientId === cid) {
          setInitialRole('owner');
        } else {
          setInitialRole('joiner');
        }
      }
    } else {
      setInitialRole(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomParam, isSpectator]);

  // When we know the role and have a roomId, dispatch START_P2P (unless already in).
  useEffect(() => {
    if (state.mode !== 'ai') return;
    if (!clientId || !roomParam || !initialRole) return;

    const persisted = getPersistedState(roomParam);
    const scoreboard = getScoreboard(roomParam);

    if (persisted) {
      // Restore from localStorage and apply as state-sync.
      const reducerRole: 'p2p-owner' | 'p2p-joiner' | 'p2p-spectator' =
        initialRole === 'owner'
          ? 'p2p-owner'
          : initialRole === 'joiner'
            ? 'p2p-joiner'
            : 'p2p-spectator';
      const myColor: PlayerColor =
        persisted.ownerClientId === clientId
          ? persisted.ownerColor
          : persisted.ownerColor === RED
            ? BLUE
            : RED;
      dispatch({
        type: 'START_P2P',
        role: reducerRole,
        roomId: roomParam,
        gameId: persisted.gameId,
        myClientId: clientId,
        myName: displayName,
        myColor,
        peerClientId:
          persisted.ownerClientId === clientId
            ? persisted.joinerClientId
            : persisted.ownerClientId,
        peerName:
          persisted.ownerClientId === clientId ? persisted.joinerName : persisted.ownerName,
        scoreboard,
        boardSize: persisted.boardSize,
      });
      dispatch({
        type: 'REMOTE_STATE_SYNC',
        sync: { ...persisted, scoreboard },
        myClientId: clientId,
      });
    } else if (initialRole === 'owner') {
      const owner = getOwnerFlag(roomParam);
      dispatch({
        type: 'START_P2P',
        role: 'p2p-owner',
        roomId: roomParam,
        gameId: randomId(6),
        myClientId: clientId,
        myName: owner?.name ?? displayName,
        myColor: RED,
        scoreboard,
        boardSize: state.boardSize,
      });
    } else if (initialRole === 'joiner') {
      dispatch({
        type: 'START_P2P',
        role: 'p2p-joiner',
        roomId: roomParam,
        gameId: '', // will be filled by state-sync
        myClientId: clientId,
        myName: displayName,
        myColor: BLUE,
        scoreboard,
        boardSize: state.boardSize,
      });
    } else if (initialRole === 'spectator') {
      dispatch({
        type: 'START_P2P',
        role: 'p2p-spectator',
        roomId: roomParam,
        gameId: '',
        myClientId: clientId,
        myName: displayName,
        myColor: RED,
        scoreboard,
        boardSize: state.boardSize,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, roomParam, initialRole]);

  // --- Derived flags ------------------------------------------------------------
  const isP2P = state.mode !== 'ai';
  const isP2POwner = state.mode === 'p2p-owner';
  const isP2PSpectator = state.mode === 'p2p-spectator';
  const hookRole: P2PRole =
    state.mode === 'p2p-owner'
      ? 'owner'
      : state.mode === 'p2p-spectator'
        ? 'spectator'
        : 'joiner';

  const isMyTurn = isP2P
    ? !isP2PSpectator && state.turn === state.p2p?.myColor
    : state.turn === state.humanPlayer;
  const isClickable =
    state.gamePhase === 'playing' &&
    isMyTurn &&
    (state.mode === 'ai' || state.p2p?.peerConnected === true);

  // --- P2P hook -----------------------------------------------------------------
  // Stable callback refs via latest-ref pattern.
  const stateRef = useRef(state);
  stateRef.current = state;

  const getLocalState = useCallback((): SerializedGameState | null => {
    const s = stateRef.current;
    if (!s.p2p) return null;
    // Derive ownerClientId / joinerClientId: owner holds RED by convention.
    const iAmOwner = s.mode === 'p2p-owner';
    const ownerClientId = iAmOwner ? s.p2p.myClientId : (s.p2p.peerClientId ?? '');
    const ownerName = iAmOwner ? s.p2p.myName : (s.p2p.peerName ?? '');
    const ownerColor: PlayerColor = iAmOwner ? s.p2p.myColor : s.p2p.myColor === RED ? BLUE : RED;
    const joinerClientId = iAmOwner ? s.p2p.peerClientId : s.p2p.myClientId;
    const joinerName = iAmOwner ? (s.p2p.peerName ?? '') : s.p2p.myName;
    return serializeForWire({
      boardSize: s.boardSize,
      board: s.board,
      turn: s.turn,
      moveHistory: s.moveHistory,
      lastMove: s.lastMove,
      winner: s.winner,
      winningPath: s.winningPath,
      gameId: s.p2p.gameId,
      moveSeq: s.p2p.moveSeq,
      scoreboard: s.p2p.scoreboard,
      ownerClientId,
      ownerName,
      ownerColor,
      joinerClientId: joinerClientId || null,
      joinerName: joinerName || null,
      surrenderedBy: s.p2p.surrenderedBy,
    });
  }, []);

  // Gate the hook: joiners must click "Join Game" first so they can edit their
  // name before connecting. Owners auto-enable (they already clicked "Invite a
  // Friend"), spectators auto-enable (they explicitly opened the spectate link).
  const hookReady =
    state.mode === 'p2p-owner' || state.mode === 'p2p-spectator' || joinerReady;

  const p2p = useP2PRoom({
    enabled: isP2P && !!state.p2p && !!clientId && hookReady,
    roomId: state.p2p?.roomId ?? null,
    role: hookRole,
    myClientId: clientId,
    myName: displayName,
    createdAt,
    getLocalState,
    onPeerJoined: useCallback((peer) => dispatch({ type: 'PEER_JOINED', peer }), []),
    onPeerLeft: useCallback(() => {
      dispatch({ type: 'PEER_LEFT' });
      setPeerLeftDismissed(false);
    }, []),
    onRemoteMove: useCallback((row, col, color, moveSeq, gameId) => {
      dispatch({ type: 'REMOTE_MOVE', row, col, color, moveSeq, gameId });
    }, []),
    onStateSync: useCallback(
      (sync) => {
        if (!clientId) return;
        dispatch({ type: 'REMOTE_STATE_SYNC', sync, myClientId: clientId });
      },
      [clientId],
    ),
    onRemoteSurrender: useCallback((by, gameId) => {
      dispatch({ type: 'REMOTE_SURRENDER', by, gameId });
    }, []),
    onPlayAgainRequest: useCallback((req) => {
      dispatch({ type: 'SET_PENDING_REQUEST', kind: 'playAgain', req });
    }, []),
    onPlayAgainResolved: useCallback((accepted, swapColors) => {
      if (accepted) dispatch({ type: 'P2P_NEW_GAME', swapColors });
    }, []),
    onColorSwapRequest: useCallback((req) => {
      dispatch({ type: 'SET_PENDING_REQUEST', kind: 'colorSwap', req });
    }, []),
    onColorSwapResolved: useCallback((accepted) => {
      if (accepted) dispatch({ type: 'P2P_NEW_GAME', swapColors: true });
    }, []),
    onPromoteToOwner: useCallback(() => {
      const s = stateRef.current;
      if (!s.p2p) return;
      setOwnerFlag(s.p2p.roomId, {
        clientId: s.p2p.myClientId,
        createdAt,
        name: s.p2p.myName,
      });
      dispatch({ type: 'PROMOTE_TO_OWNER' });
    }, [createdAt]),
    onChatMessage: useCallback((msg) => {
      setChatMessages((prev) => {
        // Dedupe by id in case of double-delivery.
        if (prev.some((p) => p.id === msg.id)) return prev;
        const next: ChatMessage = {
          id: msg.id,
          fromClientId: msg.from,
          fromName: msg.fromName,
          text: msg.text,
          emote: msg.emote,
          ts: msg.ts,
        };
        // Keep only the most recent 50 messages to bound memory.
        const merged = [...prev, next];
        return merged.length > 50 ? merged.slice(merged.length - 50) : merged;
      });
    }, []),
  });

  // --- Persist state to localStorage on every change ----------------------------
  useEffect(() => {
    if (!state.p2p) return;
    const sync = getLocalState();
    if (!sync) return;
    persistState(state.p2p.roomId, { ...sync, lastWriteAt: Date.now() } as SerializedGameState & {
      lastWriteAt: number;
    });
    setScoreboard(state.p2p.roomId, state.p2p.scoreboard);
  }, [state.p2p, state.board, state.turn, state.winner, state.moveHistory.length, getLocalState]);

  // --- Propagate displayName edits into the game state --------------------------
  useEffect(() => {
    if (!state.p2p) return;
    if (!displayName) return;
    if (state.p2p.myName === displayName) return;
    dispatch({ type: 'UPDATE_MY_NAME', name: displayName });
  }, [displayName, state.p2p]);

  // --- Broadcast local moves ----------------------------------------------------
  useEffect(() => {
    if (!isP2P || !state.p2p || !state.lastMove) return;
    if (state.p2p.broadcastedSeq >= state.p2p.moveSeq) return;
    // Only broadcast if the last move was made by my color.
    const last = state.moveHistory[state.moveHistory.length - 1];
    if (!last || last.player !== state.p2p.myColor) return;
    p2p.sendMove(last.row, last.col, last.player, state.p2p.moveSeq, state.p2p.gameId);
    dispatch({ type: 'MARK_BROADCASTED', seq: state.p2p.moveSeq });
  }, [
    isP2P,
    state.p2p,
    state.lastMove,
    state.moveHistory,
    p2p,
  ]);

  // --- Owner re-broadcasts state-sync whenever state changes --------------------
  useEffect(() => {
    if (!isP2POwner) return;
    p2p.broadcastStateSync();
  }, [isP2POwner, state.board, state.turn, state.winner, state.p2p?.moveSeq, state.p2p?.gameId, p2p]);

  // --- Reset AI pending flag when game resets or finishes -----------------------
  const aiPendingRef = useRef(false);
  useEffect(() => {
    if (
      state.gamePhase === 'setup' ||
      state.gamePhase === 'finished' ||
      (state.gamePhase === 'playing' && state.lastMove === null)
    ) {
      aiPendingRef.current = false;
    }
  }, [state.gamePhase, state.lastMove]);

  // --- Win check ----------------------------------------------------------------
  useEffect(() => {
    if (state.gamePhase !== 'playing' && state.gamePhase !== 'thinking') return;
    if (state.lastMove === null) return;

    const lastPlayer = (state.turn === RED ? BLUE : RED) as PlayerColor;
    const result = checkWinFromBoard(state.board, state.boardSize, lastPlayer);
    if (result.won) {
      dispatch({ type: 'GAME_OVER', winner: lastPlayer, path: result.path });
      return;
    }
    if (state.availableMoves.length === 0) {
      dispatch({ type: 'GAME_OVER', winner: lastPlayer });
      return;
    }
  }, [state.board, state.lastMove, state.boardSize, state.turn, state.gamePhase, state.availableMoves.length]);

  // --- Scoreboard bump on game end (idempotent via gameId) ----------------------
  const lastScoredGameIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isP2P || !state.p2p) return;
    if (state.gamePhase !== 'finished' || !state.winner) return;
    if (lastScoredGameIdRef.current === state.p2p.gameId) return;
    lastScoredGameIdRef.current = state.p2p.gameId;
    // Identify winner's clientId: whichever side holds the winning color.
    const winnerIsMe = state.winner === state.p2p.myColor;
    const winnerClientId = winnerIsMe
      ? state.p2p.myClientId
      : state.p2p.peerClientId ?? '';
    if (winnerClientId) {
      dispatch({ type: 'SCOREBOARD_BUMP', clientId: winnerClientId });
    }
  }, [isP2P, state.p2p, state.gamePhase, state.winner]);

  // --- AI trigger (skipped in P2P) ----------------------------------------------
  useEffect(() => {
    if (state.mode !== 'ai') return;
    if (state.gamePhase === 'finished') return;
    if (state.turn === state.humanPlayer) return;
    if (state.availableMoves.length === 0) return;
    if (aiPendingRef.current) return;

    if (state.gamePhase === 'playing') {
      aiPendingRef.current = true;
      dispatch({ type: 'AI_THINKING' });
    }
  }, [state.mode, state.gamePhase, state.turn, state.humanPlayer, state.availableMoves.length]);

  useEffect(() => {
    if (state.mode !== 'ai') return;
    if (state.gamePhase !== 'thinking') return;

    const timeoutId = setTimeout(() => {
      const move = getAIMove(state.board, state.boardSize, state.availableMoves, state.turn, state.aiType);
      aiPendingRef.current = false;
      if (move) {
        dispatch({ type: 'AI_MOVE', row: move.x, col: move.y });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.mode, state.gamePhase, state.board, state.boardSize, state.availableMoves, state.turn, state.aiType]);

  // --- beforeunload warning -----------------------------------------------------
  // NOTE: we intentionally do NOT send a `leave` message on visibilitychange.
  // That event fires for tab-switching / window-blur / screen-lock, which are
  // not the user actually leaving. The only reliable "gone" signal is the
  // WebSocket's own onclose (handled by the hook) or the unmount cleanup.
  useEffect(() => {
    if (!isP2P || state.gamePhase !== 'playing') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [isP2P, state.gamePhase]);

  // --- Click handlers -----------------------------------------------------------
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!isClickable) return;
      dispatch({ type: 'PLACE_STONE', row, col });
    },
    [isClickable],
  );

  const handleStart = useCallback((boardSize: number, aiType: AIType, humanFirst: boolean) => {
    dispatch({ type: 'CONFIGURE', boardSize, aiType, humanFirst });
  }, []);

  const handleStartP2P = useCallback(
    (boardSize: number) => {
      if (!clientId) return;
      const newRoomId = randomId(8);
      const name = displayName || `Player-${clientId.slice(-4)}`;
      setStoredName(name);
      setOwnerFlag(newRoomId, {
        clientId,
        createdAt: Date.now(),
        name,
      });
      dispatch({
        type: 'START_P2P',
        role: 'p2p-owner',
        roomId: newRoomId,
        gameId: randomId(6),
        myClientId: clientId,
        myName: name,
        myColor: RED,
        scoreboard: {},
        boardSize,
      });
      router.replace(`/hex?room=${newRoomId}`);
    },
    [clientId, displayName, router],
  );

  const handleNameChange = useCallback((name: string) => {
    setDisplayName(name);
    setStoredName(name);
  }, []);

  const handleBecomeOwner = useCallback(() => {
    if (!state.p2p || !clientId) return;
    setOwnerFlag(state.p2p.roomId, {
      clientId,
      createdAt,
      name: displayName,
    });
    dispatch({ type: 'PROMOTE_TO_OWNER' });
  }, [state.p2p, clientId, createdAt, displayName]);

  const handleLobbyCancel = useCallback(() => {
    if (state.p2p) clearOwnerFlag(state.p2p.roomId);
    setJoinerReady(false);
    setInitialRole(null);
    setChatMessages([]);
    router.replace('/hex');
    dispatch({ type: 'NEW_GAME' });
  }, [state.p2p, router]);

  const handleSurrenderConfirm = useCallback(() => {
    if (!state.p2p) return;
    p2p.sendSurrender(state.p2p.myColor, state.p2p.gameId);
    dispatch({ type: 'LOCAL_SURRENDER' });
    setShowSurrenderDialog(false);
  }, [state.p2p, p2p]);

  // Send a chat message + optimistically append to local state. The server
  // relay doesn't echo messages back to the sender, so our own messages
  // would never arrive via onChatMessage — we append them directly here.
  const handleSendChat = useCallback(
    (text: string, emote?: string) => {
      if (!state.p2p) return;
      if (!text.trim() && !emote) return;
      const id = p2p.sendChat(text.trim(), emote);
      const mine: ChatMessage = {
        id,
        fromClientId: state.p2p.myClientId,
        fromName: state.p2p.myName || 'You',
        text: text.trim(),
        emote,
        ts: Date.now(),
      };
      setChatMessages((prev) => {
        const merged = [...prev, mine];
        return merged.length > 50 ? merged.slice(merged.length - 50) : merged;
      });
    },
    [state.p2p, p2p],
  );

  const handlePlayAgainClick = useCallback(() => {
    if (!state.p2p) return;
    if (state.p2p.pendingPlayAgain) {
      // Accept the incoming request.
      p2p.sendPlayAgainAck(
        state.p2p.pendingPlayAgain.requestId,
        true,
        state.p2p.pendingPlayAgain.swapColors,
      );
      dispatch({ type: 'P2P_NEW_GAME', swapColors: state.p2p.pendingPlayAgain.swapColors });
      dispatch({ type: 'SET_PENDING_REQUEST', kind: 'playAgain', req: null });
    } else {
      p2p.sendPlayAgainReq(false);
    }
  }, [state.p2p, p2p]);

  const handleSwapColorsRequest = useCallback(() => {
    p2p.sendColorSwapReq();
  }, [p2p]);

  const handlePlayAgainAccept = useCallback(() => {
    if (!state.p2p?.pendingPlayAgain) return;
    p2p.sendPlayAgainAck(
      state.p2p.pendingPlayAgain.requestId,
      true,
      state.p2p.pendingPlayAgain.swapColors,
    );
    dispatch({ type: 'P2P_NEW_GAME', swapColors: state.p2p.pendingPlayAgain.swapColors });
    dispatch({ type: 'SET_PENDING_REQUEST', kind: 'playAgain', req: null });
  }, [state.p2p, p2p]);

  const handlePlayAgainDecline = useCallback(() => {
    if (!state.p2p?.pendingPlayAgain) return;
    p2p.sendPlayAgainAck(
      state.p2p.pendingPlayAgain.requestId,
      false,
      state.p2p.pendingPlayAgain.swapColors,
    );
    dispatch({ type: 'SET_PENDING_REQUEST', kind: 'playAgain', req: null });
  }, [state.p2p, p2p]);

  const handleColorSwapAccept = useCallback(() => {
    if (!state.p2p?.pendingColorSwap) return;
    p2p.sendColorSwapAck(state.p2p.pendingColorSwap.requestId, true);
    dispatch({ type: 'P2P_NEW_GAME', swapColors: true });
    dispatch({ type: 'SET_PENDING_REQUEST', kind: 'colorSwap', req: null });
  }, [state.p2p, p2p]);

  const handleColorSwapDecline = useCallback(() => {
    if (!state.p2p?.pendingColorSwap) return;
    p2p.sendColorSwapAck(state.p2p.pendingColorSwap.requestId, false);
    dispatch({ type: 'SET_PENDING_REQUEST', kind: 'colorSwap', req: null });
  }, [state.p2p, p2p]);

  const handleBackClick = useCallback(
    (e: React.MouseEvent) => {
      if (isP2P && state.gamePhase === 'playing') {
        e.preventDefault();
        setLeaveTarget('/');
        setShowLeaveDialog(true);
      }
    },
    [isP2P, state.gamePhase],
  );

  const confirmLeave = useCallback(() => {
    if (state.p2p) p2p.sendLeave();
    setShowLeaveDialog(false);
    if (leaveTarget) router.push(leaveTarget);
  }, [state.p2p, p2p, leaveTarget, router]);

  // --- p2pInfo for HexStatusBar -------------------------------------------------
  const statusBarP2PInfo = useMemo(() => {
    if (!isP2P || !state.p2p) return undefined;
    const myId = state.p2p.myClientId;
    const surrenderedBy =
      state.p2p.surrenderedBy === null
        ? null
        : state.p2p.surrenderedBy === myId
          ? 'me'
          : 'peer';
    return {
      myColor: state.p2p.myColor,
      myName: state.p2p.myName,
      peerName: state.p2p.peerName ?? '',
      isMyTurn: !!isMyTurn,
      surrenderedBy: surrenderedBy as 'me' | 'peer' | null,
      canPlayAgain: state.p2p.peerConnected && p2p.status === 'live' && !isP2PSpectator,
      playAgainLabel: state.p2p.pendingPlayAgain ? 'Accept Rematch' : 'Request Rematch',
    };
  }, [isP2P, state.p2p, isMyTurn, p2p.status, isP2PSpectator]);

  // --- Render -------------------------------------------------------------------
  // Lobby shows when:
  //  - Joiner hasn't clicked "Join Game" yet (so they can pick their name)
  //  - Owner is still waiting for a peer to connect
  //  - Either side is mid-connection with no peer yet
  // Spectators skip the lobby entirely.
  const showLobby =
    isP2P &&
    !!state.p2p &&
    !isP2PSpectator &&
    ((state.mode === 'p2p-joiner' && !joinerReady) ||
      (!state.p2p.peerConnected &&
        (p2p.status === 'waiting' ||
          p2p.status === 'searching' ||
          p2p.status === 'connecting' ||
          p2p.status === 'error' ||
          p2p.status === 'idle')));

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          onClick={handleBackClick}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/10 backdrop-blur-lg transition hover:bg-white/20 dark:border-white/20"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 dark:text-white" />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {showLobby ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <HexP2PLobby
              role={hookRole}
              status={p2p.status}
              roomId={state.p2p!.roomId}
              myName={displayName}
              joinerReady={joinerReady}
              onNameChange={handleNameChange}
              onJoinerReady={() => setJoinerReady(true)}
              onBecomeOwner={handleBecomeOwner}
              onCancel={handleLobbyCancel}
            />
          </motion.div>
        ) : state.gamePhase === 'setup' && !isP2P ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <HexControls onStart={handleStart} onStartP2P={handleStartP2P} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            {isP2P && state.p2p ? (
              <HexP2PBar
                status={p2p.status}
                myName={state.p2p.myName}
                myClientId={state.p2p.myClientId}
                myColor={state.p2p.myColor}
                peerName={state.p2p.peerName}
                peerClientId={state.p2p.peerClientId}
                peerConnected={state.p2p.peerConnected}
                scoreboard={state.p2p.scoreboard}
                canSurrender={
                  state.gamePhase === 'playing' && state.p2p.peerConnected && !isP2PSpectator
                }
                canSwapColors={state.gamePhase === 'finished' && !isP2PSpectator}
                onSurrender={() => setShowSurrenderDialog(true)}
                onSwapColorsRequest={handleSwapColorsRequest}
                isSpectator={isP2PSpectator}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400 font-medium">You (Red)</span>
                <span className="text-neutral-500">vs</span>
                <span className="text-blue-400 font-medium">
                  {
                    {
                      complex: 'Noob AI',
                      montecarlo: 'Smart AI',
                      minimax: 'Genius AI',
                      random: 'Random AI',
                      heuristic: 'Heuristic AI',
                    }[state.aiType]
                  }{' '}
                  (Blue)
                </span>
                <span className="text-neutral-600 text-xs ml-1">
                  {state.boardSize}×{state.boardSize}
                </span>
              </div>
            )}
            <HexBoard
              board={state.board}
              boardSize={state.boardSize}
              currentPlayer={state.turn}
              humanPlayer={isP2P && state.p2p ? state.p2p.myColor : state.humanPlayer}
              lastMove={state.lastMove}
              winningPath={state.winningPath}
              isClickable={isClickable}
              onCellClick={handleCellClick}
            />
            <HexStatusBar
              currentPlayer={state.turn}
              humanPlayer={isP2P && state.p2p ? state.p2p.myColor : state.humanPlayer}
              gamePhase={state.gamePhase}
              winner={state.winner}
              moveCount={state.moveHistory.length}
              onReset={isP2P ? handlePlayAgainClick : () => dispatch({ type: 'RESET' })}
              onNewGame={() => dispatch({ type: 'NEW_GAME' })}
              p2pInfo={statusBarP2PInfo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* P2P dialogs */}
      {isP2P && state.p2p && (
        <>
          <SurrenderConfirmDialog
            open={showSurrenderDialog}
            onConfirm={handleSurrenderConfirm}
            onCancel={() => setShowSurrenderDialog(false)}
          />
          <IncomingPlayAgainDialog
            open={!!state.p2p.pendingPlayAgain}
            fromName={state.p2p.peerName ?? ''}
            swapColors={state.p2p.pendingPlayAgain?.swapColors ?? false}
            onAccept={handlePlayAgainAccept}
            onDecline={handlePlayAgainDecline}
          />
          <IncomingColorSwapDialog
            open={!!state.p2p.pendingColorSwap}
            fromName={state.p2p.peerName ?? ''}
            onAccept={handleColorSwapAccept}
            onDecline={handleColorSwapDecline}
          />
          <LeaveConfirmDialog
            open={showLeaveDialog}
            onStay={() => setShowLeaveDialog(false)}
            onLeave={confirmLeave}
          />
          <PeerLeftDialog
            open={!state.p2p.peerConnected && !peerLeftDismissed && p2p.status === 'live'}
            peerName={state.p2p.peerName ?? ''}
            onDismiss={() => setPeerLeftDismissed(true)}
          />
        </>
      )}

      {/* Floating chat — only visible once we're actually in a room, not in lobby */}
      {isP2P && state.p2p && !showLobby && (
        <HexChat
          myClientId={state.p2p.myClientId}
          messages={chatMessages}
          disabled={isP2PSpectator || !state.p2p.peerConnected}
          onSend={handleSendChat}
        />
      )}
    </div>
  );
}
