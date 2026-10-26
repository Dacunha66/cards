import { Card } from '../components/Card';
import { RARITY_LABEL, getCard } from '../game/cards';

export function CardDetail({ id, locked, status, onClose }: { id: string; locked: boolean; status: string; onClose: () => void }) {
  const c = getCard(id);
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Kartendetails">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <Card id={id} size="lg" locked={locked} />
        <h2>{locked ? '???' : c.name}</h2>
        <p className={`rarity-text rarity-${c.rarity}`}>{RARITY_LABEL[c.rarity]}</p>
        {!locked && (
          <p className="values-line">⬆ {c.top} · ➡ {c.right} · ⬇ {c.bottom} · ⬅ {c.left}</p>
        )}
        <p className="muted">{status}</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>Schließen</button>
      </div>
    </div>
  );
}
