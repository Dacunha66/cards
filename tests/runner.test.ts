import { describe, expect, it } from 'vitest';
import { CARDS, STARTER_DECK } from '../src/game/cards';
import { createRng } from '../src/game/rng';
import { BASE_SPEED, FINISH_DISTANCE, GATE_COUNT, RunnerSim, generateGates } from '../src/game/runner';

describe('Runner', () => {
  it('erzeugt 8 Gates mit je 2 Deck-Karten und 1 Entdeckung', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const gates = generateGates(STARTER_DECK, createRng(seed));
      expect(gates).toHaveLength(8);
      for (const g of gates) {
        expect(g.offers).toHaveLength(3);
        const deck = g.offers.filter((o) => o.kind === 'deck');
        const disc = g.offers.filter((o) => o.kind === 'discovery');
        expect(deck).toHaveLength(2);
        expect(disc).toHaveLength(1);
        expect(deck[0].cardId).not.toBe(deck[1].cardId);
        for (const o of deck) expect(STARTER_DECK).toContain(o.cardId);
        expect(STARTER_DECK).not.toContain(disc[0].cardId);
      }
    }
  });

  it('sammelt bei normalem Lauf genau 8 Karten, egal wie gelenkt wird', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const rng = createRng(seed);
      const sim = new RunnerSim(STARTER_DECK, rng);
      let finishes = 0;
      let t = 0;
      while (!sim.finished && t < 120) {
        if (rng() < 0.1) sim.moveLane(rng() < 0.5 ? -1 : 1);
        for (const e of sim.update(1 / 60, seed % 3 === 0 ? 4 : 1)) if (e.type === 'finish') finishes++;
        t += 1 / 60;
      }
      expect(sim.finished).toBe(true);
      expect(finishes).toBe(1);
      expect(sim.picks).toHaveLength(GATE_COUNT);
      expect(sim.picks.map((p) => p.gate)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      // No more picks after the end.
      sim.update(10);
      expect(sim.picks).toHaveLength(GATE_COUNT);
    }
  });

  it('nimmt die Karte der aktuellen Spur', () => {
    const sim = new RunnerSim(STARTER_DECK, createRng(5));
    sim.setLane(2);
    const events = sim.update(sim.gates[0].distance / BASE_SPEED + 0.01);
    const pick = events.find((e) => e.type === 'pick');
    expect(pick).toEqual({ type: 'pick', gate: 0, lane: 2, offer: sim.gates[0].offers[2] });
  });

  it('auch ein großer Zeitsprung liefert genau 8 Karten', () => {
    const sim = new RunnerSim(STARTER_DECK, createRng(2));
    sim.update(1000);
    expect(sim.picks).toHaveLength(8);
    expect(sim.finished).toBe(true);
  });

  it('Überspringen liefert genau 8 Karten', () => {
    const sim = new RunnerSim(STARTER_DECK, createRng(4));
    sim.update(5);
    sim.skipToEnd();
    sim.skipToEnd();
    expect(sim.picks).toHaveLength(8);
  });

  it('dauert bei normaler Geschwindigkeit 30–45 Sekunden', () => {
    const seconds = FINISH_DISTANCE / BASE_SPEED;
    expect(seconds).toBeGreaterThanOrEqual(30);
    expect(seconds).toBeLessThanOrEqual(45);
  });

  it('Kartenpool hat 40 eindeutige Karten mit Werten 1–10', () => {
    expect(CARDS).toHaveLength(40);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(40);
    expect(new Set(CARDS.map((c) => c.name)).size).toBe(40);
    for (const c of CARDS) for (const v of [c.top, c.right, c.bottom, c.left]) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});
