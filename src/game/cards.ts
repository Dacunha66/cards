// All 40 cards of Project Card Rush. Names and art are original placeholders.

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CardDef {
  id: string;
  name: string;
  rarity: Rarity;
  /** Directional values 1–10. */
  top: number;
  right: number;
  bottom: number;
  left: number;
  /** Placeholder illustration (emoji) and background hue. */
  art: string;
  hue: number;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Gewöhnlich',
  rare: 'Selten',
  epic: 'Episch',
  legendary: 'Legendär',
};

export const RARITY_ORDER: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

type Row = [id: string, name: string, rarity: Rarity, t: number, r: number, b: number, l: number, art: string, hue: number];

// [top, right, bottom, left]
const ROWS: Row[] = [
  // Gewöhnlich (16)
  ['c01', 'Moosling', 'common', 5, 3, 4, 6, '🌿', 110],
  ['c02', 'Funkenwicht', 'common', 6, 5, 2, 4, '✨', 50],
  ['c03', 'Kieselkrabbe', 'common', 3, 6, 5, 3, '🦀', 15],
  ['c04', 'Nebelmotte', 'common', 4, 2, 6, 5, '🦋', 260],
  ['c05', 'Dornenigel', 'common', 2, 5, 5, 6, '🦔', 30],
  ['c06', 'Sumpfunke', 'common', 5, 4, 3, 5, '🐸', 130],
  ['c07', 'Glutkäfer', 'common', 6, 3, 5, 3, '🐞', 0],
  ['c08', 'Windhase', 'common', 3, 7, 2, 5, '🐇', 190],
  ['c09', 'Pilzwächter', 'common', 4, 4, 6, 3, '🍄', 340],
  ['c10', 'Eisspatz', 'common', 7, 2, 3, 5, '🐦', 200],
  ['c11', 'Rindenwurm', 'common', 2, 4, 7, 4, '🪱', 25],
  ['c12', 'Schlammschnecke', 'common', 5, 5, 5, 2, '🐌', 70],
  ['c13', 'Dämmerfledermaus', 'common', 6, 2, 4, 6, '🦇', 280],
  ['c14', 'Bernsteinfuchs', 'common', 4, 6, 3, 5, '🦊', 35],
  ['c15', 'Flussotter', 'common', 3, 5, 6, 4, '🦦', 180],
  ['c16', 'Felsbock', 'common', 7, 4, 2, 4, '🐐', 45],
  // Selten (12)
  ['r01', 'Klingenfalke', 'rare', 7, 6, 3, 6, '🦅', 40],
  ['r02', 'Runenwolf', 'rare', 6, 7, 5, 4, '🐺', 220],
  ['r03', 'Kristallskorpion', 'rare', 4, 5, 7, 6, '🦂', 300],
  ['r04', 'Sturmross', 'rare', 5, 8, 4, 5, '🐎', 210],
  ['r05', 'Irrlichthexe', 'rare', 7, 3, 6, 6, '🧙', 270],
  ['r06', 'Eichenhüter', 'rare', 6, 5, 6, 5, '🌳', 120],
  ['r07', 'Lavaechse', 'rare', 8, 4, 5, 4, '🦎', 10],
  ['r08', 'Gezeitenschlange', 'rare', 3, 6, 6, 7, '🐍', 170],
  ['r09', 'Schattenluchs', 'rare', 5, 4, 8, 5, '🐆', 250],
  ['r10', 'Mondeule', 'rare', 6, 6, 4, 6, '🦉', 230],
  ['r11', 'Frostbär', 'rare', 7, 5, 5, 5, '🐻', 195],
  ['r12', 'Knochenritter', 'rare', 4, 7, 6, 5, '💀', 0],
  // Episch (8)
  ['e01', 'Aschenphönix', 'epic', 8, 6, 5, 7, '🔥', 20],
  ['e02', 'Tiefseekraken', 'epic', 5, 8, 7, 6, '🐙', 285],
  ['e03', 'Donnertitan', 'epic', 9, 5, 6, 6, '⚡', 55],
  ['e04', 'Sternenweberin', 'epic', 6, 7, 6, 7, '🌌', 245],
  ['e05', 'Smaragddrache', 'epic', 7, 7, 4, 8, '🐉', 140],
  ['e06', 'Grabkönig', 'epic', 6, 5, 9, 6, '👑', 300],
  ['e07', 'Spiegelgolem', 'epic', 7, 6, 7, 6, '🪞', 190],
  ['e08', 'Wüstensphinx', 'epic', 5, 9, 6, 6, '🦁', 40],
  // Legendär (4)
  ['l01', 'Himmelswal', 'legendary', 9, 7, 6, 8, '🐋', 205],
  ['l02', 'Chronomagier', 'legendary', 7, 9, 8, 6, '⏳', 45],
  ['l03', 'Weltenbaum-Avatar', 'legendary', 8, 6, 9, 7, '🌲', 125],
  ['l04', 'Nachtdrachin Vyrax', 'legendary', 10, 7, 5, 8, '🌑', 265],
];

export const CARDS: CardDef[] = ROWS.map(([id, name, rarity, top, right, bottom, left, art, hue]) => ({
  id, name, rarity, top, right, bottom, left, art, hue,
}));

const BY_ID = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): CardDef {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function isCardId(id: unknown): id is string {
  return typeof id === 'string' && BY_ID.has(id);
}

/** Cards unlocked for a brand-new player: all commons and the first 6 rares (22). */
export const STARTING_UNLOCKED: string[] = [
  ...CARDS.filter((c) => c.rarity === 'common').map((c) => c.id),
  'r01', 'r02', 'r03', 'r04', 'r05', 'r06',
];

/** Predefined starter deck: 20 distinct cards from the starting collection. */
export const STARTER_DECK: string[] = [
  'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10',
  'c13', 'c14', 'c15', 'c16',
  'r01', 'r02', 'r03', 'r04', 'r05', 'r06',
];

export const DECK_SIZE = 20;

export function cardPower(c: CardDef): number {
  return c.top + c.right + c.bottom + c.left;
}
