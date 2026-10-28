import { CSSProperties } from 'react';
import { CardDef, RARITY_LABEL, RARITY_ORDER, getCard } from '../game/cards';
import type { Side } from '../game/battle';
import { CLASS_INFO, EFFECTS } from '../game/effects';
import { CLASS_ICON, EFFECT_ICON, Icon, SHIELD_PATH } from './cardIcons';

export type CardBadge = 'deck' | 'discovery' | null;

interface Props {
  id: string;
  /** Only on the board: blue/red ring and blue/red value diamonds. Elsewhere the diamonds are silver. */
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
  /** Added to all four values (e.g. -1 after a stumble); values stay within 1–10. */
  mod?: number;
  /** Show this card data instead of looking up `id` (live preview of unsaved cards). */
  def?: CardDef;
  /** Effective values in the duel [top, right, bottom, left]; higher than printed = green, lower = dark. */
  values?: readonly number[];
  /** Magische Barriere shield is up. */
  shield?: boolean;
  /** A terrain bonus is active right now (soft green glow inside the picture). */
  terrainGlow?: boolean;
  /** Large view: name plate, full effect text and rarity stars instead of the small symbols. */
  detail?: boolean;
}

const DIRS = ['top', 'right', 'bottom', 'left'] as const;

const SPARKLE = 'M12 1.5l2.2 8.3 8.3 2.2-8.3 2.2-2.2 8.3-2.2-8.3L1.5 12l8.3-2.2z';

/** A value on its metal relief diamond. The rim shows the owner, the centre shows a bonus (green) or malus (dark). */
function Value({ dir, value, delta, locked }: { dir: (typeof DIRS)[number]; value: number; delta: number; locked?: boolean }) {
  return (
    <span className={`val val-${dir} ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
      <svg className="dia" viewBox="0 0 100 100" aria-hidden="true">
        <polygon className="f-light" points="50,2 2,50 20,50 50,20" />
        <polygon className="f-mid" points="50,2 98,50 80,50 50,20" />
        <polygon className="f-dark" points="98,50 50,98 50,80 80,50" />
        <polygon className="f-middark" points="2,50 50,98 50,80 20,50" />
        <polygon className="face" points="50,20 80,50 50,80 20,50" />
        <polygon className="rim" points="50,2 98,50 50,98 2,50" />
      </svg>
      <span className="v">{locked ? '?' : value}</span>
    </span>
  );
}

export function Card({
  id, owner, size = 'md', locked, badge, badgeText = 'NEU', selected, showName, className = '', onClick, ariaLabel, mod = 0, def, values, shield,
  terrainGlow, detail,
}: Props) {
  const c = def ?? getCard(id);
  const effective = (i: number) => (values ? values[i] : Math.min(10, Math.max(1, c[DIRS[i]] + mod)));
  const cls = c.cls ? CLASS_ICON[c.cls] : null;
  const effect = c.effect ? EFFECTS[c.effect] : null;
  const tier = RARITY_ORDER[c.rarity] + 1;
  const style = { '--hue': c.hue } as CSSProperties;
  const classes = [
    'card', `card-${size}`, `rarity-${c.rarity}`,
    owner ? `owner-${owner}` : '', locked ? 'locked' : '', selected ? 'selected' : '',
    badge === 'discovery' ? 'discovery' : '', detail ? 'card-detail' : '', terrainGlow ? 'terrain-glow' : '', className,
  ].join(' ');
  const label = ariaLabel ?? (locked
    ? `Gesperrte Karte, ${RARITY_LABEL[c.rarity]}`
    : `${c.name}${mod < 0 ? ` (geschwächt ${mod})` : ''}, ${RARITY_LABEL[c.rarity]}${c.cls ? `, ${CLASS_INFO[c.cls].label}` : ''}${effect ? `, Effekt ${effect.name}` : ''}, oben ${effective(0)}, rechts ${effective(1)}, unten ${effective(2)}, links ${effective(3)}${shield ? ', Schild aktiv' : ''}`);
  const content = (
    <>
      <span className="card-edge" aria-hidden="true" />
      <span className="art" aria-hidden="true">
        {locked ? <span className="art-emoji">🔒</span> : c.image ? <img src={c.image} alt="" draggable={false} /> : <span className="art-emoji">{c.art}</span>}
        <span className="art-shade" />
      </span>
      {tier >= 4 && !locked && (
        <>
          <span className="jewel jewel-l" aria-hidden="true" />
          <span className="jewel jewel-r" aria-hidden="true" />
        </>
      )}
      {DIRS.map((d, i) => <Value key={d} dir={d} value={effective(i)} delta={values ? effective(i) - c[d] : mod} locked={locked} />)}
      {detail && !locked ? (
        <span className="detail-text">
          <span className="name-plate">
            {cls && <Icon className="np-icon" path={cls.path} color={cls.color} fill={`${cls.color}40`} />}
            <span className="np-name">{c.name}</span>
          </span>
          <span className="fx-text">{effect ? <><b>{effect.name}:</b> {effect.short}</> : 'Kein Spezialeffekt'}</span>
        </span>
      ) : !locked && (
        <>
          {cls && <Icon className="cls-icon" path={cls.path} color={cls.color} fill={`${cls.color}40`} />}
          <span className="corner-icons">
            {effect && c.effect && <Icon className="fx-icon" path={EFFECT_ICON[c.effect]} color="#ffd34d" fill="rgba(255,211,77,.3)" />}
          </span>
        </>
      )}
      {detail && !locked && <span className="stars" aria-hidden="true">{'★'.repeat(tier)}</span>}
      {/* Shield in the free top-left corner, so it never touches a value even on the smallest board cards. */}
      {shield && !locked && <Icon className="shield-icon shield-corner" path={SHIELD_PATH} color="#e0f2fe" fill="rgba(125,211,252,.55)" />}
      {tier >= 5 && !locked && (
        <>
          <svg className="sparkle sp1" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARKLE} /></svg>
          <svg className="sparkle sp2" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARKLE} /></svg>
          {tier === 6 && <svg className="sparkle sp3" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARKLE} /></svg>}
        </>
      )}
      {badge === 'discovery' && (
        // Small corner symbol – never on top of a value.
        <span className={`badge ${badgeText === 'Neutral' ? 'badge-neutral' : badgeText === 'NEU' ? 'badge-new' : ''}`} title={badgeText} aria-label={badgeText === 'Neutral' ? 'neutrale Entdeckung' : badgeText === 'NEU' ? 'neue Karte' : 'Entdeckung'}>
          {badgeText === 'Neutral' ? '◆' : '★'}
        </span>
      )}
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
