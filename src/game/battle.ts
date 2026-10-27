// Pure duel rules: 4×4 board, 8 cards per side, orthogonal captures, no chains.
import { getCard } from './cards';

export type Side = 'player' | 'cpu';

export const BOARD_SIZE = 4;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const HAND_SIZE = 8;

export type Dir = 'top' | 'right' | 'bottom' | 'left';

/** A card instance in a hand or on the board. `mod` is added to all four values (e.g. -1 after a stumble). */
export interface HandCard {
  cardId: string;
  mod: number;
}

export const MIN_VALUE = 1;

/** Effective directional value, never below 1. */
export function cardValue(card: HandCard, dir: Dir): number {
  return Math.max(MIN_VALUE, getCard(card.cardId)[dir] + card.mod);
}

export function toHand(ids: string[]): HandCard[] {
  return ids.map((cardId) => ({ cardId, mod: 0 }));
}

export interface BoardCell extends HandCard {
  owner: Side;
  /** Who originally played the card. */
  placedBy: Side;
}

export interface BattleState {
  board: (BoardCell | null)[];
  hands: Record<Side, HandCard[]>;
  turn: Side;
  moveCount: number;
  /** Cells flipped by the most recent move (for animations). */
  lastFlips: number[];
  /** Every comparison of the most recent move, captured or not (for the fight animation). */
  lastClashes: Clash[];
  lastPlaced: number | null;
}

/** One comparison between the placed card and an opposing neighbour. */
export interface Clash {
  cell: number;
  /** Side of the placed card facing the neighbour. */
  dir: Dir;
  attack: number;
  defense: number;
  captured: boolean;
}

export interface Move {
  handIndex: number;
  cell: number;
}

export function other(side: Side): Side {
  return side === 'player' ? 'cpu' : 'player';
}

export function createBattle(playerHand: HandCard[], cpuHand: HandCard[], first: Side = 'player'): BattleState {
  if (playerHand.length !== HAND_SIZE || cpuHand.length !== HAND_SIZE) {
    throw new Error(`Each side needs exactly ${HAND_SIZE} cards`);
  }
  return {
    board: Array<BoardCell | null>(CELL_COUNT).fill(null),
    hands: { player: playerHand.map((c) => ({ ...c })), cpu: cpuHand.map((c) => ({ ...c })) },
    turn: first,
    moveCount: 0,
    lastFlips: [],
    lastClashes: [],
    lastPlaced: null,
  };
}

/** Neighbour directions: own side vs. the neighbour's opposite side. */
const DIRS = [
  { dr: -1, dc: 0, mine: 'top', theirs: 'bottom' },
  { dr: 0, dc: 1, mine: 'right', theirs: 'left' },
  { dr: 1, dc: 0, mine: 'bottom', theirs: 'top' },
  { dr: 0, dc: -1, mine: 'left', theirs: 'right' },
] as const;

export function neighbours(cell: number): { cell: number; mine: Dir; theirs: Dir }[] {
  const r = Math.floor(cell / BOARD_SIZE);
  const c = cell % BOARD_SIZE;
  const out = [];
  for (const d of DIRS) {
    const nr = r + d.dr;
    const nc = c + d.dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      out.push({ cell: nr * BOARD_SIZE + nc, mine: d.mine, theirs: d.theirs });
    }
  }
  return out;
}

/** All comparisons against opposing neighbours if `card` owned by `side` were placed on `cell`. */
export function computeClashes(board: (BoardCell | null)[], cell: number, card: HandCard, side: Side): Clash[] {
  const clashes: Clash[] = [];
  for (const n of neighbours(cell)) {
    const target = board[n.cell];
    if (!target || target.owner === side) continue;
    const attack = cardValue(card, n.mine);
    const defense = cardValue(target, n.theirs);
    clashes.push({ cell: n.cell, dir: n.mine, attack, defense, captured: attack > defense });
  }
  return clashes;
}

/** Cells that would be captured if `card` owned by `side` were placed on `cell`. */
export function computeFlips(board: (BoardCell | null)[], cell: number, card: HandCard, side: Side): number[] {
  return computeClashes(board, cell, card, side).filter((c) => c.captured).map((c) => c.cell);
}

/** Coin toss before the duel. */
export function coinToss(rng: () => number): Side {
  return rng() < 0.5 ? 'player' : 'cpu';
}

/**
 * The computer's choice after winning the toss. Placing the last card is a clear advantage
 * (simulated: second mover wins about 4× as often), so it lets the player start.
 */
export function cpuChoosesFirst(): Side {
  return 'player';
}

export function isLegalMove(state: BattleState, move: Move): boolean {
  return (
    !isGameOver(state) &&
    Number.isInteger(move.cell) && move.cell >= 0 && move.cell < CELL_COUNT &&
    state.board[move.cell] === null &&
    Number.isInteger(move.handIndex) && move.handIndex >= 0 && move.handIndex < state.hands[state.turn].length
  );
}

export function legalMoves(state: BattleState): Move[] {
  if (isGameOver(state)) return [];
  const moves: Move[] = [];
  state.board.forEach((cell, i) => {
    if (cell) return;
    state.hands[state.turn].forEach((_, h) => moves.push({ handIndex: h, cell: i }));
  });
  return moves;
}

/** Applies a move for the side whose turn it is and returns the new state. */
export function applyMove(state: BattleState, move: Move): BattleState {
  if (!isLegalMove(state, move)) throw new Error('Illegal move');
  const side = state.turn;
  const hand = [...state.hands[side]];
  const [card] = hand.splice(move.handIndex, 1);
  const clashes = computeClashes(state.board, move.cell, card, side);
  const flips = clashes.filter((c) => c.captured).map((c) => c.cell);
  const board = [...state.board];
  board[move.cell] = { ...card, owner: side, placedBy: side };
  for (const f of flips) board[f] = { ...board[f]!, owner: side };
  return {
    board,
    hands: { ...state.hands, [side]: hand },
    turn: other(side),
    moveCount: state.moveCount + 1,
    lastFlips: flips,
    lastClashes: clashes,
    lastPlaced: move.cell,
  };
}

export function isGameOver(state: BattleState): boolean {
  return state.moveCount >= CELL_COUNT;
}

export function score(state: BattleState): Record<Side, number> {
  const s = { player: 0, cpu: 0 };
  for (const cell of state.board) if (cell) s[cell.owner]++;
  return s;
}

export type Outcome = 'win' | 'draw' | 'loss';

export function outcome(state: BattleState): Outcome {
  const s = score(state);
  if (s.player > s.cpu) return 'win';
  if (s.player < s.cpu) return 'loss';
  return 'draw';
}
