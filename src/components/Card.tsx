import { CSSProperties } from 'react';
import { CardDef, RARITY_LABEL, getCard } from '../game/cards';
import type { Side } from '../game/battle';
import { CLASS_INFO, EFFECTS } from '../game/effects';

export type CardBadge = 'deck' | 'discovery' | null;

interface Props {
  id: string;
  owner?: Side;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  locked?: boolean;
  badge?: CardBadge;
  /** Kind of discovery marker: "NEU" (not owned yet), "★" (owned), "Neutral" (league). */
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
  /** Effective values in the duel [top, right, bottom, left]: higher than printed = green, lower = red. */
  values?: readonly number[];
  /** Magische Barriere shield is up. */
  shield?: boolean;
}


const DIRS = ['top', 'right', 'bottom', 'left'] as const;

export function Card({ id, owner, size = 'md', locked, badge, badgeText = 'NEU', selected, showName, className = '', onClick, ariaLabel, mod = 0, def, values, shield }: Props) {
  const c = def ?? getCard(id);
  const effective = (d: (typeof DIRS)[number]) => (values ? values[DIRS.indexOf(d)] : Math.min(10, Math.max(1, c[d] + mod)));
  const value = (d: (typeof DIRS)[number]) => {
    if (locked) return <span className={`v v-${d}`}>?</span>;
    const n = effective(d);
    const delta = values ? n - c[d] : 0;
    return <span className={`v v-${d} ${delta > 0 ? 'v-up' : delta < 0 ? 'v-down' : ''}`}>{n}</span>;
  };
  const cls = c.cls ? CLASS_INFO[c.cls] : null;
  const effect = c.effect ? EFFECTS[c.effect] : null;
  const style = { '--hue': c.hue } as CSSProperties;
  const classes = [
    'card', `card-${size}`, `rarity-${c.rarity}`,
    owner ? `owner-${owner}` : '', locked ? 'locked' : '', selected ? 'selected' : '',
    badge === 'discovery' ? 'discovery' : '', mod < 0 && !values ? 'weakened' : '', className,
  ].join(' ');
  const label = ariaLabel ?? (locked
    ? `Gesperrte Karte, ${RARITY_LABEL[c.rarity]}`
    : `${c.name}${mod < 0 ? ` (geschwächt ${mod})` : ''}, ${RARITY_LABEL[c.rarity]}${cls ? `, ${cls.label}` : ''}${effect ? `, Effekt ${effect.name}` : ''}, oben ${effective('top')}, rechts ${effective('right')}, unten ${effective('bottom')}, links ${effective('left')}${shield ? ', Schild aktiv' : ''}`);
  const content = (
    <>
      <span className="art" aria-hidden="true">
        {locked ? '🔒' : c.image ? <img src={c.image} alt="" draggable={false} /> : c.art}
      </span>
      {value('top')}
      {value('left')}
      {value('right')}
      {value('bottom')}
      <span className="gem" aria-hidden="true" />
      {/* Class symbol in the free bottom-right corner; a gold ring marks a special effect. */}
      {cls && !locked && <span className={`cls-icon ${effect ? 'has-effect' : ''}`} aria-hidden="true" title={effect ? `${cls.label} · ${effect.name}` : cls.label}>{cls.icon}</span>}
      {shield && <span className="shield-icon" aria-hidden="true">🛡</span>}
      {badge === 'discovery' && (
        // Small corner symbol – never on top of a value.
        <span className={`badge ${badgeText === 'Neutral' ? 'badge-neutral' : badgeText === 'NEU' ? 'badge-new' : ''}`} title={badgeText} aria-label={badgeText === 'Neutral' ? 'neutrale Entdeckung' : badgeText === 'NEU' ? 'neue Karte' : 'Entdeckung'}>
          {badgeText === 'Neutral' ? '◆' : '★'}
        </span>
      )}
      {mod < 0 && !values && <span className="mod-tag">{mod}</span>}
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
