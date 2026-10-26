// Progress is stored only in this browser (localStorage) – no account, no cloud backup.
import { DECK_SIZE, STARTER_DECK, STARTING_UNLOCKED, isCardId } from './cards';
import { DEFAULT_SKINS, getSkin, isSkinId } from './skins';

export interface SaveData {
  version: 1;
  unlocked: string[];
  deck: string[];
  coins: number;
  stats: { wins: number; draws: number; losses: number; runs: number };
  settings: { reducedMotion: boolean };
  /** Owned and equipped skins (one per kind). */
  skins: { owned: string[]; card: string; runner: string };
}

export const SAVE_KEY = 'project-card-rush/save-v1';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function defaultSave(): SaveData {
  return {
    version: 1,
    unlocked: [...STARTING_UNLOCKED],
    deck: [...STARTER_DECK],
    coins: 0,
    stats: { wins: 0, draws: 0, losses: 0, runs: 0 },
    settings: { reducedMotion: false },
    skins: { owned: [DEFAULT_SKINS.card, DEFAULT_SKINS.runner], card: DEFAULT_SKINS.card, runner: DEFAULT_SKINS.runner },
  };
}

export function isValidDeck(deck: string[], unlocked: string[]): boolean {
  const owned = new Set(unlocked);
  return deck.length === DECK_SIZE && new Set(deck).size === DECK_SIZE && deck.every((id) => owned.has(id));
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

/** Turns anything (including corrupted JSON) into a valid save. */
export function sanitize(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, any>;
  const unlocked = Array.isArray(r.unlocked)
    ? [...new Set([...STARTING_UNLOCKED, ...r.unlocked.filter(isCardId)])]
    : base.unlocked;
  const deck = Array.isArray(r.deck) && isValidDeck(r.deck, unlocked) ? [...r.deck] : [...STARTER_DECK];
  const s = r.stats && typeof r.stats === 'object' ? r.stats : {};
  const owned = [...new Set([...base.skins.owned, ...(Array.isArray(r.skins?.owned) ? r.skins.owned.filter(isSkinId) : [])])];
  const equipped = (kind: 'card' | 'runner') => {
    const id = r.skins?.[kind];
    return isSkinId(id) && owned.includes(id) && getSkin(id).kind === kind ? id : DEFAULT_SKINS[kind];
  };
  return {
    version: 1,
    unlocked,
    deck,
    coins: num(r.coins),
    stats: { wins: num(s.wins), draws: num(s.draws), losses: num(s.losses), runs: num(s.runs) },
    settings: { reducedMotion: Boolean(r.settings?.reducedMotion) },
    skins: { owned, card: equipped('card'), runner: equipped('runner') },
  };
}

function browserStore(): KeyValueStore | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadSave(store: KeyValueStore | null = browserStore()): SaveData {
  try {
    const text = store?.getItem(SAVE_KEY);
    return text ? sanitize(JSON.parse(text)) : defaultSave();
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData, store: KeyValueStore | null = browserStore()): boolean {
  try {
    if (!store) return false;
    store.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
