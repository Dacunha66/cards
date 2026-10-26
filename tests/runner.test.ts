import { describe, expect, it } from 'vitest';
import { CARDS, RARITIES, RARITY_POWER, STARTER_DECK, cardPower, getCard } from '../src/game/cards';
import { createRng } from '../src/game/rng';
import { BASE_SPEED, FINISH_DISTANCE, GATE_COUNT, RunnerSim, STUMBLE_PENALTY, generateGates } from '../src/game/runner';

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
    expect(pick).toEqual({ type: 'pick', gate: 0, lane: 2, offer: sim.gates[0].offers[2], mod: 0 });
  });

  it('Stolperstein schwächt genau die nächste Karte um 1', () => {
    const sim = new RunnerSim(STARTER_DECK, createRng(7));
    const stone = sim.obstacles[0];
    sim.setLane(stone.lane);
    const hit = sim.update((stone.distance + 0.1) / BASE_SPEED);
    expect(hit.some((e) => e.type === 'bump')).toBe(true);
    // Run through the next gate without another stone in between.
    sim.update((sim.gates[1].distance - sim.distance + 0.1) / BASE_SPEED);
    expect(sim.picks).toHaveLength(2);
    expect(sim.picks[0].mod).toBe(0); // gate 0 lies before the first stone
    expect(sim.picks[1].mod).toBe(STUMBLE_PENALTY);
  });

  it('wer dem Stein ausweicht, bekommt keine Schwächung', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const sim = new RunnerSim(STARTER_DECK, createRng(seed));
      let t = 0;
      while (!sim.finished && t < 120) {
        const next = sim.obstacles.find((o) => o.distance > sim.distance);
        if (next) sim.setLane((next.lane + 1) % 3);
        sim.update(1 / 30);
        t += 1 / 30;
      }
      expect(sim.picks).toHaveLength(8);
      expect(sim.picks.every((p) => p.mod === 0)).toBe(true);
    }
  });

  it('immer in den Stein laufen: trotzdem 8 Karten, höchstens −1 pro Karte', () => {
    const sim = new RunnerSim(STARTER_DECK, createRng(3));
    let t = 0;
    while (!sim.finished && t < 120) {
      const next = sim.obstacles.find((o) => o.distance > sim.distance);
      if (next) sim.setLane(next.lane);
      sim.update(1 / 30);
      t += 1 / 30;
    }
    expect(sim.picks).toHaveLength(8);
    expect(sim.picks.filter((p) => p.mod === STUMBLE_PENALTY).length).toBe(sim.obstacles.length);
    expect(sim.picks.every((p) => p.mod >= STUMBLE_PENALTY)).toBe(true);
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

  it('Kartenpool: 100 eindeutige Karten, Werte 1–10, Stärke passt zur Seltenheit', () => {
    expect(CARDS).toHaveLength(100);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(100);
    expect(new Set(CARDS.map((c) => c.name)).size).toBe(100);
    for (const c of CARDS) {
      for (const v of [c.top, c.right, c.bottom, c.left]) {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(10);
      }
      const [min, max] = RARITY_POWER[c.rarity];
      expect(cardPower(c), c.name).toBeGreaterThanOrEqual(min);
      expect(cardPower(c), c.name).toBeLessThanOrEqual(max);
    }
    const count = (r: string) => CARDS.filter((c) => c.rarity === r).length;
    expect([count('common'), count('uncommon'), count('rare'), count('epic'), count('legendary'), count('mythic')]).toEqual([30, 24, 20, 14, 8, 4]);
  });

  it('jede höhere Seltenheit ist im Schnitt stärker', () => {
    const avg = (r: string) => {
      const cs = CARDS.filter((c) => c.rarity === r);
      return cs.reduce((s, c) => s + cardPower(c), 0) / cs.length;
    };
    const order = RARITIES.map(avg);
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
  });

  it('mystische Entdeckungen sind sehr selten (etwa 1 % pro Tor)', () => {
    let mythic = 0;
    let total = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      for (const g of generateGates(STARTER_DECK, createRng(seed))) {
        const d = g.offers.find((o) => o.kind === 'discovery')!;
        total++;
        if (getCard(d.cardId).rarity === 'mythic') mythic++;
      }
    }
    expect(mythic / total).toBeGreaterThan(0.004);
    expect(mythic / total).toBeLessThan(0.02);
  });
});
