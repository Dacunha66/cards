// Runner logic, independent of rendering: 3 lanes, 8 card gates, cosmetic obstacles.
import { CARDS } from './cards';
import { Rng, randInt, shuffle } from './rng';

export const LANES = 3;
export const GATE_COUNT = 8;
export const FIRST_GATE = 28;
export const GATE_SPACING = 44;
export const BASE_SPEED = 10; // units per second → ~36 s for a full run
export const FINISH_DISTANCE = FIRST_GATE + GATE_SPACING * (GATE_COUNT - 1) + 8;

export type OfferKind = 'deck' | 'discovery';

export interface Offer {
  cardId: string;
  kind: OfferKind;
}

export interface Gate {
  index: number;
  distance: number;
  /** One offer per lane (0 = left, 1 = middle, 2 = right). */
  offers: Offer[];
}

export interface Obstacle {
  distance: number;
  lane: number;
}

export interface Pick extends Offer {
  gate: number;
}

export type RunnerEvent =
  | { type: 'pick'; gate: number; lane: number; offer: Offer }
  | { type: 'bump'; lane: number }
  | { type: 'finish' };

/** Each gate: two different cards from the deck plus one discovery from the rest of the pool. */
export function generateGates(deck: string[], rng: Rng): Gate[] {
  if (deck.length < 2) throw new Error('Deck needs at least 2 cards');
  const inDeck = new Set(deck);
  const pool = CARDS.map((c) => c.id).filter((id) => !inDeck.has(id));
  const gates: Gate[] = [];
  for (let i = 0; i < GATE_COUNT; i++) {
    const [a, b] = shuffle(rng, deck).slice(0, 2);
    const offers: Offer[] = [
      { cardId: a, kind: 'deck' },
      { cardId: b, kind: 'deck' },
    ];
    if (pool.length > 0) offers.push({ cardId: pool[randInt(rng, pool.length)], kind: 'discovery' });
    else offers.push({ cardId: shuffle(rng, deck)[0], kind: 'deck' });
    gates.push({ index: i, distance: FIRST_GATE + i * GATE_SPACING, offers: shuffle(rng, offers) });
  }
  return gates;
}

/** Purely cosmetic rocks between gates – they never block a pick. */
export function generateObstacles(rng: Rng): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let i = 0; i < GATE_COUNT; i++) {
    const d = FIRST_GATE + i * GATE_SPACING - GATE_SPACING / 2;
    if (d > 8) obstacles.push({ distance: d, lane: randInt(rng, LANES) });
  }
  return obstacles;
}

export class RunnerSim {
  distance = 0;
  lane = 1;
  readonly picks: Pick[] = [];
  readonly gates: Gate[];
  readonly obstacles: Obstacle[];
  finished = false;
  private nextGate = 0;
  private nextObstacle = 0;

  constructor(deck: string[], rng: Rng) {
    this.gates = generateGates(deck, rng);
    this.obstacles = generateObstacles(rng);
  }

  moveLane(dir: -1 | 1): void {
    if (this.finished) return;
    this.lane = Math.max(0, Math.min(LANES - 1, this.lane + dir));
  }

  setLane(lane: number): void {
    if (this.finished) return;
    this.lane = Math.max(0, Math.min(LANES - 1, Math.round(lane)));
  }

  /** Advance by dt seconds. Returns the events that happened. */
  update(dt: number, speedMultiplier = 1): RunnerEvent[] {
    if (this.finished) return [];
    const events: RunnerEvent[] = [];
    this.distance += Math.max(0, dt) * BASE_SPEED * speedMultiplier;
    while (this.nextObstacle < this.obstacles.length && this.distance >= this.obstacles[this.nextObstacle].distance) {
      const o = this.obstacles[this.nextObstacle++];
      if (o.lane === this.lane) events.push({ type: 'bump', lane: o.lane });
    }
    while (this.nextGate < this.gates.length && this.distance >= this.gates[this.nextGate].distance) {
      events.push(this.takeGate(this.gates[this.nextGate++]));
    }
    if (this.nextGate >= this.gates.length && this.distance >= FINISH_DISTANCE) {
      this.finished = true;
      events.push({ type: 'finish' });
    }
    return events;
  }

  /** Test/impatience shortcut: take the current-lane card of every remaining gate. */
  skipToEnd(): RunnerEvent[] {
    const events: RunnerEvent[] = [];
    while (this.nextGate < this.gates.length) events.push(this.takeGate(this.gates[this.nextGate++]));
    this.distance = Math.max(this.distance, FINISH_DISTANCE);
    this.nextObstacle = this.obstacles.length;
    if (!this.finished) {
      this.finished = true;
      events.push({ type: 'finish' });
    }
    return events;
  }

  get gatesTaken(): number {
    return this.nextGate;
  }

  private takeGate(gate: Gate): RunnerEvent {
    const offer = gate.offers[this.lane];
    this.picks.push({ ...offer, gate: gate.index });
    return { type: 'pick', gate: gate.index, lane: this.lane, offer };
  }
}
