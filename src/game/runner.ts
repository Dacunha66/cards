// Runner logic, independent of rendering: 3 lanes, 8 card gates, stumbling stones.
// Gates 1–7 offer cards from the player's deck; the final gate offers 3 new cards.
import { CARDS, CardDef, pickByRarity } from './cards';
import { Rng, randInt, shuffle } from './rng';
import { SETTINGS } from './settings';

export const LANES = 3;
export const GATE_COUNT = 8;
export const FIRST_GATE = 24;
export const GATE_SPACING = 34;
export const BASE_SPEED = 9; // units per second → ~30 s for a full run
/** Value penalty for the next card after hitting a stumbling stone. */
export const STUMBLE_PENALTY = -1;
export const FINISH_DISTANCE = FIRST_GATE + GATE_SPACING * (GATE_COUNT - 1) + 8;
/** Index of the final gate, the only one with new cards. */
export const FINAL_GATE = GATE_COUNT - 1;

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
  /** Added to all four values in the duel (0 or STUMBLE_PENALTY). */
  mod: number;
}

export type RunnerEvent =
  | { type: 'pick'; gate: number; lane: number; offer: Offer; mod: number }
  | { type: 'bump'; lane: number }
  | { type: 'finish' };

/** Cards that may be offered as new cards in the runner. */
export function runnerPool(exclude: ReadonlySet<string>): CardDef[] {
  return CARDS.filter((c) => c.inRunner !== false && !exclude.has(c.id));
}

/** Three different new cards for the final gate, preferring cards the player does not own yet. */
function pickDiscoveries(deck: string[], owned: ReadonlySet<string>, rng: Rng): string[] {
  const inDeck = new Set(deck);
  const fresh = runnerPool(new Set([...inDeck, ...owned]));
  const known = runnerPool(inDeck).filter((c) => owned.has(c.id));
  const out: string[] = [];
  for (const pool of [fresh, known]) {
    const left = [...pool];
    while (out.length < LANES && left.length > 0) {
      const card = pickByRarity(rng, left, SETTINGS.discoveryShares) ?? left[randInt(rng, left.length)];
      left.splice(left.indexOf(card), 1);
      out.push(card.id);
    }
  }
  return out;
}

/**
 * Gates 1–7: three different cards from the deck. Gate 8 (final): three new cards –
 * the one you take is yours if you win the duel.
 */
export function generateGates(deck: string[], rng: Rng, owned: ReadonlySet<string> = new Set()): Gate[] {
  if (deck.length < LANES) throw new Error(`Deck needs at least ${LANES} cards`);
  const gates: Gate[] = [];
  for (let i = 0; i < GATE_COUNT; i++) {
    let offers: Offer[];
    if (i === FINAL_GATE) {
      const found = pickDiscoveries(deck, owned, rng);
      offers = found.map((cardId) => ({ cardId, kind: 'discovery' as const }));
      // Not enough cards allowed in the runner: fill up from the deck.
      for (const id of shuffle(rng, deck)) {
        if (offers.length >= LANES) break;
        offers.push({ cardId: id, kind: 'deck' });
      }
    } else {
      offers = shuffle(rng, deck).slice(0, LANES).map((cardId) => ({ cardId, kind: 'deck' as const }));
    }
    gates.push({ index: i, distance: FIRST_GATE + i * GATE_SPACING, offers: shuffle(rng, offers) });
  }
  return gates;
}

/**
 * Stumbling stones: one before the first gate, then two rows between every pair of gates –
 * the second row sometimes blocks two lanes. One lane is always free, and stones never block a pick.
 */
export function generateObstacles(rng: Rng): Obstacle[] {
  const obstacles: Obstacle[] = [{ distance: FIRST_GATE / 2, lane: randInt(rng, LANES) }];
  for (let i = 1; i < GATE_COUNT; i++) {
    const start = FIRST_GATE + (i - 1) * GATE_SPACING;
    obstacles.push({ distance: start + GATE_SPACING * 0.33, lane: randInt(rng, LANES) });
    const lanes = shuffle(rng, [0, 1, 2]).slice(0, rng() < 0.5 ? 2 : 1);
    for (const lane of lanes) obstacles.push({ distance: start + GATE_SPACING * 0.68, lane });
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
  /** True after hitting a stone until the next card is taken. */
  stumbled = false;
  private nextGate = 0;
  private nextObstacle = 0;

  constructor(deck: string[], rng: Rng, owned: ReadonlySet<string> = new Set()) {
    this.gates = generateGates(deck, rng, owned);
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
    // Handle stones and gates strictly in track order, even after a long frame.
    for (;;) {
      const o = this.obstacles[this.nextObstacle];
      const g = this.gates[this.nextGate];
      const oDue = o !== undefined && this.distance >= o.distance;
      const gDue = g !== undefined && this.distance >= g.distance;
      if (oDue && (!gDue || o.distance < g.distance)) {
        this.nextObstacle++;
        if (o.lane === this.lane) {
          this.stumbled = true;
          events.push({ type: 'bump', lane: o.lane });
        }
      } else if (gDue) {
        this.nextGate++;
        events.push(this.takeGate(g));
      } else {
        break;
      }
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
    const mod = this.stumbled ? STUMBLE_PENALTY : 0;
    this.stumbled = false;
    this.picks.push({ ...offer, gate: gate.index, mod });
    return { type: 'pick', gate: gate.index, lane: this.lane, offer, mod };
  }
}
