// Simple computer opponent: prefers immediate captures, then safe placements.
import { BattleState, HAND_SIZE, HandCard, Move, cardValue, computeFlips, legalMoves, neighbours, toHand } from './battle';
import { CARDS, Rarity } from './cards';
import { Rng, pickWeighted } from './rng';

export function chooseCpuMove(state: BattleState, rng: Rng): Move {
  const moves = legalMoves(state);
  if (moves.length === 0) throw new Error('No legal moves');
  const side = state.turn;
  let best: Move = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const card = state.hands[side][move.handIndex];
    const flips = computeFlips(state.board, move.cell, card, side).length;
    // Defensive bonus: strong values facing empty cells, small penalty for weak exposed sides.
    let defense = 0;
    for (const n of neighbours(move.cell)) {
      if (state.board[n.cell] === null) defense += cardValue(card, n.mine) - 5;
    }
    // Keep strong cards for later when nothing can be captured.
    const power = cardValue(card, 'top') + cardValue(card, 'right') + cardValue(card, 'bottom') + cardValue(card, 'left');
    const s = flips * 100 + defense * 2 - (flips === 0 ? power * 0.5 : 0) + rng() * 3;
    if (s > bestScore) {
      bestScore = s;
      best = move;
    }
  }
  return best;
}

const CPU_WEIGHT: Record<Rarity, number> = { common: 5, rare: 4, epic: 1.5, legendary: 0.4 };

/** Draws 8 distinct cards for the computer, mostly commons and rares. */
export function drawCpuHand(rng: Rng): HandCard[] {
  const pool = [...CARDS];
  const hand: string[] = [];
  while (hand.length < HAND_SIZE) {
    const card = pickWeighted(rng, pool, (c) => CPU_WEIGHT[c.rarity]);
    pool.splice(pool.indexOf(card), 1);
    hand.push(card.id);
  }
  return toHand(hand);
}
