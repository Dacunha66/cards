// Card records as stored in the card database (admin dashboard) and how they turn into game cards.
import { BUILTIN_CARDS, CARD_ID_RE, CardDef, DECK_SIZE, RARITIES, RARITY_ORDER, RARITY_POWER, Rarity, STARTER_DECK, cardPower } from './cards';

export type CardStatus = 'draft' | 'active' | 'disabled';

export const STATUS_LABEL: Record<CardStatus, string> = { draft: 'Entwurf', active: 'Aktiv', disabled: 'Deaktiviert' };
export const STATUSES: CardStatus[] = ['draft', 'active', 'disabled'];

/** The game needs enough active cards for decks, gates, packs and the opponent. */
export const MIN_ACTIVE_CARDS = 30;
export const NAME_MAX = 40;
export const DESCRIPTION_MAX = 300;

/** One card document in the database (`cards/<id>`). */
export interface CardRecord {
  id: string;
  name: string;
  rarity: Rarity;
  top: number;
  right: number;
  bottom: number;
  left: number;
  /** Emoji shown when there is no picture. */
  art: string;
  /** Background colour (0–360). */
  hue: number;
  description: string;
  status: CardStatus;
  /** Asset id of the uploaded picture, or null. */
  imageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ValueKey = 'top' | 'right' | 'bottom' | 'left';
export const VALUE_KEYS: ValueKey[] = ['top', 'right', 'bottom', 'left'];

const ID_RE = CARD_ID_RE;
const ASSET_RE = /^[A-Za-z0-9_-]{8,64}$/;

function clampValue(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}

/** Turns an untrusted database document into a valid record, or null if it is unusable. */
export function parseCardRecord(id: string, raw: unknown): CardRecord | null {
  if (!ID_RE.test(id) || !raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim().slice(0, NAME_MAX) : '';
  if (!name) return null;
  const rarity = RARITIES.includes(r.rarity as Rarity) ? (r.rarity as Rarity) : null;
  if (!rarity) return null;
  const values = VALUE_KEYS.map((k) => clampValue(r[k]));
  if (values.some((v) => v === null)) return null;
  const [top, right, bottom, left] = values as number[];
  const hue = typeof r.hue === 'number' && Number.isFinite(r.hue) ? ((Math.round(r.hue) % 360) + 360) % 360 : 260;
  return {
    id,
    name,
    rarity,
    top, right, bottom, left,
    art: typeof r.art === 'string' && r.art.trim() ? [...r.art.trim()].slice(0, 4).join('') : '🃏',
    hue,
    description: typeof r.description === 'string' ? r.description.trim().slice(0, DESCRIPTION_MAX) : '',
    status: STATUSES.includes(r.status as CardStatus) ? (r.status as CardStatus) : 'draft',
    imageId: typeof r.imageId === 'string' && ASSET_RE.test(r.imageId) ? r.imageId : null,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : '',
  };
}

/** The fields written to the database (the id is the document id). */
export function recordToDoc(rec: CardRecord): Record<string, unknown> {
  const { id: _id, ...doc } = rec;
  void _id;
  return doc;
}

export function imageUrl(imageId: string | null): string | undefined {
  return imageId ? `/_blob/${imageId}` : undefined;
}

export function recordToCard(rec: CardRecord): CardDef {
  return {
    id: rec.id,
    name: rec.name,
    rarity: rec.rarity,
    top: rec.top,
    right: rec.right,
    bottom: rec.bottom,
    left: rec.left,
    art: rec.art,
    hue: rec.hue,
    image: imageUrl(rec.imageId),
    description: rec.description || undefined,
  };
}

/** Records for the 100 built-in cards – used once to fill an empty database. */
export function builtinRecords(now = new Date().toISOString()): CardRecord[] {
  return BUILTIN_CARDS.map((c) => ({
    id: c.id, name: c.name, rarity: c.rarity, top: c.top, right: c.right, bottom: c.bottom, left: c.left,
    art: c.art, hue: c.hue, description: c.description ?? '', status: 'active', imageId: null, createdAt: now, updatedAt: now,
  }));
}

/** Next free automatic id: k001, k002, … (ids of the built-in cards are never reused). */
export function nextCardId(existing: Iterable<string>): string {
  let max = 0;
  for (const id of existing) {
    const m = /^k(\d+)$/.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `k${String(max + 1).padStart(3, '0')}`;
}

export function newRecord(id: string, now = new Date().toISOString()): CardRecord {
  return {
    id, name: '', rarity: 'common', top: 4, right: 4, bottom: 4, left: 4,
    art: '🃏', hue: 260, description: '', status: 'draft', imageId: null, createdAt: now, updatedAt: now,
  };
}

export function duplicateRecord(rec: CardRecord, id: string, now = new Date().toISOString()): CardRecord {
  return { ...rec, id, name: `${rec.name} (Kopie)`.slice(0, NAME_MAX), status: 'draft', createdAt: now, updatedAt: now };
}

export interface CatalogResult {
  /** Cards in play. */
  active: CardDef[];
  /** All cards, including drafts and disabled ones. */
  known: CardDef[];
  /** False if the database has too few active cards – the built-in cards are used instead. */
  usable: boolean;
}

/** Builds the game catalog from database records. */
export function buildCatalog(records: CardRecord[]): CatalogResult {
  const sorted = [...records].sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.id.localeCompare(b.id));
  const known = sorted.map(recordToCard);
  const active = sorted.filter((r) => r.status === 'active').map(recordToCard);
  if (active.length < MIN_ACTIVE_CARDS) return { active: [...BUILTIN_CARDS], known: [...BUILTIN_CARDS, ...known], usable: false };
  return { active, known, usable: true };
}

/**
 * Makes sure a deck only holds active cards the player owns. Missing slots are filled with the
 * player's strongest other active cards; if the player owns too few, the weakest active cards
 * are unlocked for them so the game always stays playable.
 */
export function repairDeck(deck: string[], unlocked: string[], activeCards: readonly CardDef[]): { deck: string[]; unlocked: string[] } {
  const active = new Map(activeCards.map((c) => [c.id, c]));
  const owned = new Set(unlocked);
  const kept = [...new Set(deck)].filter((id) => active.has(id) && owned.has(id));
  if (kept.length === DECK_SIZE && deck.length === DECK_SIZE) return { deck, unlocked };
  const byStrength = (a: CardDef, b: CardDef) => cardPower(b) - cardPower(a) || a.id.localeCompare(b.id);
  const ownedActive = [...owned].filter((id) => active.has(id) && !kept.includes(id)).map((id) => active.get(id)!).sort(byStrength);
  const result = [...kept];
  for (const c of ownedActive) {
    if (result.length >= DECK_SIZE) break;
    result.push(c.id);
  }
  const newUnlocked = [...unlocked];
  if (result.length < DECK_SIZE) {
    const starterFirst = [...STARTER_DECK.filter((id) => active.has(id)).map((id) => active.get(id)!), ...[...activeCards].sort((a, b) => -byStrength(a, b))];
    for (const c of starterFirst) {
      if (result.length >= DECK_SIZE) break;
      if (result.includes(c.id)) continue;
      result.push(c.id);
      if (!owned.has(c.id)) {
        owned.add(c.id);
        newUnlocked.push(c.id);
      }
    }
  }
  return { deck: result, unlocked: newUnlocked };
}

/** Recommended sum of the four values for a rarity (a hint in the editor, not a rule). */
export function powerHint(rec: Pick<CardRecord, ValueKey | 'rarity'>): { sum: number; min: number; max: number; ok: boolean } {
  const sum = rec.top + rec.right + rec.bottom + rec.left;
  const [min, max] = RARITY_POWER[rec.rarity];
  return { sum, min, max, ok: sum >= min && sum <= max };
}
