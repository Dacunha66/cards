import { describe, expect, it } from 'vitest';
import {
  BattleState, BoardCell, CELL_COUNT, applyMove, cardValue, computeFlips, createBattle, isGameOver, legalMoves, outcome, score, toHand,
} from '../src/game/battle';
import { chooseCpuMove, drawCpuHand } from '../src/game/ai';
import { CARDS, getCard } from '../src/game/cards';
import { createRng } from '../src/game/rng';

const H = toHand(['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08']);
const hc = (cardId: string, mod = 0) => ({ cardId, mod });

function emptyBoard(): (BoardCell | null)[] {
  return Array(CELL_COUNT).fill(null);
}
function cpu(cardId: string, mod = 0): BoardCell {
  return { cardId, mod, owner: 'cpu', placedBy: 'cpu' };
}
/** State where it is the player's turn and the board is preset. */
function stateWith(board: (BoardCell | null)[], playerHand: (string | { cardId: string; mod: number })[]): BattleState {
  const s = createBattle(H, H, 'player');
  const hand = playerHand.map((c) => (typeof c === 'string' ? hc(c) : c));
  return { ...s, board, hands: { player: hand, cpu: s.hands.cpu } };
}

describe('Kampf-Regeln', () => {
  // Center cell 5 has neighbours: top 1, right 6, bottom 9, left 4.
  const directions = [
    { name: 'oben', cell: 1, mine: 'top', theirs: 'bottom' },
    { name: 'rechts', cell: 6, mine: 'right', theirs: 'left' },
    { name: 'unten', cell: 9, mine: 'bottom', theirs: 'top' },
    { name: 'links', cell: 4, mine: 'left', theirs: 'right' },
  ] as const;

  for (const d of directions) {
    it(`vergleicht Richtung ${d.name} korrekt für alle Kartenpaare (nur strikt größer übernimmt)`, () => {
      for (const a of CARDS) {
        for (const b of CARDS) {
          const board = emptyBoard();
          board[d.cell] = cpu(b.id);
          const flips = computeFlips(board, 5, hc(a.id), 'player');
          expect(flips.includes(d.cell)).toBe(a[d.mine] > b[d.theirs]);
        }
      }
    });
  }

  it('Gleichstand übernimmt nicht', () => {
    // c01 top = 5, c12 bottom = 5
    expect(getCard('c01').top).toBe(getCard('c12').bottom);
    const board = emptyBoard();
    board[1] = cpu('c12');
    const next = applyMove(stateWith(board, ['c01']), { handIndex: 0, cell: 5 });
    expect(next.board[1]!.owner).toBe('cpu');
    expect(next.lastFlips).toEqual([]);
  });

  it('übernimmt keine diagonalen Karten', () => {
    const board = emptyBoard();
    for (const c of [0, 2, 8, 10]) board[c] = cpu('c11');
    const next = applyMove(stateWith(board, ['l04']), { handIndex: 0, cell: 5 });
    for (const c of [0, 2, 8, 10]) expect(next.board[c]!.owner).toBe('cpu');
  });

  it('löst keine Kettenreaktion aus', () => {
    // l02 right 9 beats c08 left 5; c08 right 7 would beat c12 left 2 in a chain.
    const board = emptyBoard();
    board[6] = cpu('c08');
    board[7] = cpu('c12');
    const next = applyMove(stateWith(board, ['l02']), { handIndex: 0, cell: 5 });
    expect(next.board[6]!.owner).toBe('player');
    expect(next.board[7]!.owner).toBe('cpu');
  });

  it('übernommene Karten wechseln nur den Besitzer, nicht den Platz', () => {
    const board = emptyBoard();
    board[6] = cpu('c08');
    const next = applyMove(stateWith(board, ['l02']), { handIndex: 0, cell: 5 });
    expect(next.board[6]).toEqual({ cardId: 'c08', mod: 0, owner: 'player', placedBy: 'cpu' });
  });

  it('übernimmt nie eigene Karten und verweigert belegte Felder', () => {
    const board = emptyBoard();
    board[6] = { cardId: 'c12', mod: 0, owner: 'player', placedBy: 'player' };
    expect(computeFlips(board, 5, hc('l04'), 'player')).toEqual([]);
    expect(() => applyMove(stateWith(board, ['l04']), { handIndex: 0, cell: 6 })).toThrow();
  });

  it('spielt ein vollständiges Spiel mit 16 Zügen', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const rng = createRng(seed);
      let s = createBattle(drawCpuHand(rng), drawCpuHand(rng), seed % 2 ? 'player' : 'cpu');
      let moves = 0;
      while (!isGameOver(s)) {
        const before = s.turn;
        s = applyMove(s, chooseCpuMove(s, rng));
        expect(s.turn).not.toBe(before);
        moves++;
      }
      expect(moves).toBe(16);
      expect(s.board.every((c) => c !== null)).toBe(true);
      expect(s.hands.player).toHaveLength(0);
      expect(s.hands.cpu).toHaveLength(0);
      const sc = score(s);
      expect(sc.player + sc.cpu).toBe(16);
      expect(outcome(s)).toBe(sc.player > sc.cpu ? 'win' : sc.player < sc.cpu ? 'loss' : 'draw');
      expect(legalMoves(s)).toEqual([]);
    }
  });

  it('geschwächte Karten (−1) haben alle vier Werte um 1 verringert, aber nie unter 1', () => {
    const c = getCard('c08'); // 3, 7, 2, 5
    expect(cardValue(hc('c08', -1), 'top')).toBe(c.top - 1);
    expect(cardValue(hc('c08', -1), 'right')).toBe(c.right - 1);
    expect(cardValue(hc('c08', -1), 'bottom')).toBe(c.bottom - 1);
    expect(cardValue(hc('c08', -1), 'left')).toBe(c.left - 1);
    expect(cardValue(hc('c11', -5), 'top')).toBe(1);
  });

  it('die Schwächung zählt beim Vergleich – für Angreifer und Verteidiger', () => {
    // c01 top 5 vs. c11 bottom 7 … use c16 top 7 vs. c12 bottom 5: normally flips.
    const board = emptyBoard();
    board[1] = cpu('c12');
    expect(applyMove(stateWith(board, ['c16']), { handIndex: 0, cell: 5 }).lastFlips).toEqual([1]);
    // c01 (top 5) beats nothing against c09 bottom 6, but a weakened defender (6-1=5) is a tie → still no flip.
    board[1] = cpu('c09', -1);
    expect(applyMove(stateWith(board, ['c01']), { handIndex: 0, cell: 5 }).lastFlips).toEqual([]);
    // Weakened attacker: c06 top 5 vs. c11 bottom 7 → no; c10 top 7 −1 = 6 vs. c09 bottom 6 → tie, no flip.
    board[1] = cpu('c09');
    expect(applyMove(stateWith(board, [hc('c10', -1)]), { handIndex: 0, cell: 5 }).lastFlips).toEqual([]);
    expect(applyMove(stateWith(board, ['c10']), { handIndex: 0, cell: 5 }).lastFlips).toEqual([1]);
  });

  it('8:8 ist unentschieden', () => {
    const s = createBattle(H, H);
    const board = Array.from({ length: 16 }, (_, i): BoardCell => ({
      cardId: 'c01', mod: 0, owner: i < 8 ? 'player' : 'cpu', placedBy: 'player',
    }));
    expect(outcome({ ...s, board, moveCount: 16 })).toBe('draw');
  });

  it('Computer bevorzugt eine unmittelbare Übernahme', () => {
    const board = emptyBoard();
    board[0] = { cardId: 'c11', mod: 0, owner: 'player', placedBy: 'player' }; // c11 right = 4
    const s: BattleState = { ...createBattle(H, H, 'cpu'), board, hands: { player: H, cpu: toHand(['c02', 'l02']) } };
    const move = chooseCpuMove(s, createRng(3));
    const next = applyMove(s, move);
    expect(next.lastFlips.length).toBeGreaterThan(0);
  });

  it('Computerhand hat 8 unterschiedliche Karten', () => {
    const hand = drawCpuHand(createRng(9));
    expect(new Set(hand.map((c) => c.cardId)).size).toBe(8);
  });
});
