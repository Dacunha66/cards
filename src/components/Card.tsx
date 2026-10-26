import { CSSProperties } from 'react';
import { RARITY_LABEL, getCard } from '../game/cards';
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
}


export function Card({ id, owner, size = 'md', locked, badge, badgeText = 'NEU', selected, showName, className = '', onClick, ariaLabel }: Props) {
  const c = getCard(id);
  const style = { '--hue': c.hue } as CSSProperties;
  const classes = [
    'card', `card-${size}`, `rarity-${c.rarity}`,
    owner ? `owner-${owner}` : '', locked ? 'locked' : '', selected ? 'selected' : '',
    badge === 'discovery' ? 'discovery' : '', className,
  ].join(' ');
  const label = ariaLabel ?? (locked
    ? `Gesperrte Karte, ${RARITY_LABEL[c.rarity]}`
    : `${c.name}, ${RARITY_LABEL[c.rarity]}, oben ${c.top}, rechts ${c.right}, unten ${c.bottom}, links ${c.left}`);
  const content = (
    <>
      <span className="v v-top">{locked ? '?' : c.top}</span>
      <span className="v v-left">{locked ? '?' : c.left}</span>
      <span className="art" aria-hidden="true">{locked ? '🔒' : c.art}</span>
      <span className="v v-right">{locked ? '?' : c.right}</span>
      <span className="v v-bottom">{locked ? '?' : c.bottom}</span>
      <span className="gem" aria-hidden="true" />
      {badge === 'discovery' && <span className="badge">{badgeText}</span>}
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
