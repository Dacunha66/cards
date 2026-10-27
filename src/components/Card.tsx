import { CSSProperties } from 'react';
import { CardDef, RARITY_LABEL, getCard } from '../game/cards';
import type { Side } from '../game/battle';

export type CardBadge = 'deck' | 'discovery' | null;

interface Props {
  id: string;
  owner?: Side;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  locked?: boolean;
  badge?: CardBadge;
  /** Text on the discovery badge (default "NEU"). */
  badgeText?: string;
  selected?: boolean;
  showName?: boolean;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  /** Added to all four values (e.g. -1 after a stumble); values never drop below 1. */
  mod?: number;
  /** Show this card data instead of looking up `id` (live preview of unsaved cards). */
  def?: CardDef;
}


export function Card({ id, owner, size = 'md', locked, badge, badgeText = 'NEU', selected, showName, className = '', onClick, ariaLabel, mod = 0, def }: Props) {
  const c = def ?? getCard(id);
  const v = (n: number) => Math.max(1, n + mod);
  const style = { '--hue': c.hue } as CSSProperties;
  const classes = [
    'card', `card-${size}`, `rarity-${c.rarity}`,
    owner ? `owner-${owner}` : '', locked ? 'locked' : '', selected ? 'selected' : '',
    badge === 'discovery' ? 'discovery' : '', mod < 0 ? 'weakened' : '', className,
  ].join(' ');
  const label = ariaLabel ?? (locked
    ? `Gesperrte Karte, ${RARITY_LABEL[c.rarity]}`
    : `${c.name}${mod < 0 ? ` (geschwächt ${mod})` : ''}, ${RARITY_LABEL[c.rarity]}, oben ${v(c.top)}, rechts ${v(c.right)}, unten ${v(c.bottom)}, links ${v(c.left)}`);
  const content = (
    <>
      <span className="art" aria-hidden="true">
        {locked ? '🔒' : c.image ? <img src={c.image} alt="" draggable={false} /> : c.art}
      </span>
      <span className="v v-top">{locked ? '?' : v(c.top)}</span>
      <span className="v v-left">{locked ? '?' : v(c.left)}</span>
      <span className="v v-right">{locked ? '?' : v(c.right)}</span>
      <span className="v v-bottom">{locked ? '?' : v(c.bottom)}</span>
      <span className="gem" aria-hidden="true" />
      {badge === 'discovery' && <span className="badge">{badgeText}</span>}
      {mod < 0 && <span className="mod-tag">{mod}</span>}
      {showName && <span className="name">{locked ? '???' : c.name}</span>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={classes} style={style} onClick={onClick} aria-label={label} aria-pressed={selected}>
        {content}
      </button>
    );
  }
  return (
    <div className={classes} style={style} role="img" aria-label={label}>
      {content}
    </div>
  );
}
