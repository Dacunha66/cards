import { CSSProperties, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { CARDS, getCard } from '../game/cards';
import { createRng } from '../game/rng';
import { PACKS, PackCard, PackDef, buyPack, buySkin, equipSkin } from '../game/shop';
import { SKINS, SkinDef } from '../game/skins';
import { SaveData } from '../game/storage';
import { Header } from './Header';

interface Props {
  save: SaveData;
  onChange: (save: SaveData) => void;
  onBack: () => void;
}

export function skinStyle(colors: [string, string, string]): CSSProperties {
  return { '--player': colors[0], '--player-dark': colors[1], '--player-light': colors[2] } as CSSProperties;
}

const PACK_ART: Record<string, string> = { abenteurer: '🎴', helden: '👑' };

function odds(pack: PackDef): string {
  const total = Object.values(pack.weights).reduce((a, b) => a + b, 0);
  const pct = (n: number) => `${Math.round((n / total) * 100)} %`;
  return `Gewöhnlich ${pct(pack.weights.common)} · Selten ${pct(pack.weights.rare)} · Episch ${pct(pack.weights.epic)} · Legendär ${pct(pack.weights.legendary)}`;
}

export function Shop({ save, onChange, onBack }: Props) {
  const [tab, setTab] = useState<'packs' | 'skins'>('packs');
  const [opened, setOpened] = useState<{ pack: PackDef; cards: PackCard[] } | null>(null);
  const [message, setMessage] = useState('');
  const rng = useMemo(() => createRng(), []);
  const complete = save.unlocked.length >= CARDS.length;

  function openPack(pack: PackDef) {
    const r = buyPack(save, pack.id, rng);
    if (!r.ok) return setMessage(r.reason);
    setMessage('');
    onChange(r.save);
    setOpened({ pack, cards: r.cards });
  }

  function skinAction(skin: SkinDef) {
    if (save.skins.owned.includes(skin.id)) {
      onChange(equipSkin(save, skin.id));
      setMessage(`${skin.name} ausgerüstet ✓`);
      return;
    }
    const r = buySkin(save, skin.id);
    if (!r.ok) return setMessage(r.reason);
    onChange(r.save);
    setMessage(`${skin.name} gekauft und ausgerüstet ✓`);
  }

  return (
    <main className="screen shop">
      <Header title="Shop" onBack={onBack} right={<span className="pill">🪙 {save.coins}</span>} />
      <div className="chips" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'packs'} className={`chip ${tab === 'packs' ? 'active' : ''}`} onClick={() => { setTab('packs'); setMessage(''); }}>Booster-Packs</button>
        <button type="button" role="tab" aria-selected={tab === 'skins'} className={`chip ${tab === 'skins' ? 'active' : ''}`} onClick={() => { setTab('skins'); setMessage(''); }}>Skins</button>
      </div>
      <p className="hint" aria-live="polite">{message || (tab === 'packs' ? 'Münzen bekommst du für jedes Duell – am meisten für Siege.' : 'Skins ändern nur das Aussehen, nicht die Kartenwerte.')}</p>

      <div className="scroll">
        {tab === 'packs' && (
          <div className="shop-list">
            {complete && <p className="muted center">Du hast alle 40 Karten! Doppelte Karten werden in Münzen umgetauscht.</p>}
            {PACKS.map((pack) => (
              <article key={pack.id} className={`shop-item pack-${pack.id}`}>
                <div className="pack-art" aria-hidden="true">{PACK_ART[pack.id] ?? '🎴'}</div>
                <div className="shop-info">
                  <h2>{pack.name}</h2>
                  <p>{pack.description}</p>
                  <p className="odds">{odds(pack)}</p>
                </div>
                <button type="button" className="btn btn-primary" disabled={save.coins < pack.price} onClick={() => openPack(pack)}>
                  🪙 {pack.price}
                </button>
              </article>
            ))}
            <p className="muted small">Doppelte Karten werden in Münzen umgetauscht: gewöhnlich 🪙 10, selten 🪙 25, episch 🪙 60, legendär 🪙 150.</p>
          </div>
        )}

        {tab === 'skins' && (
          <div className="shop-list">
            {(['card', 'runner'] as const).map((kind) => (
              <section key={kind}>
                <h2 className="section-title">{kind === 'card' ? 'Kartenfarbe im Duell' : 'Figur im Lauf'}</h2>
                <div className="skin-grid">
                  {SKINS.filter((s) => s.kind === kind).map((skin) => {
                    const owned = save.skins.owned.includes(skin.id);
                    const equipped = save.skins[kind] === skin.id;
                    return (
                      <article key={skin.id} className={`skin-item ${equipped ? 'equipped' : ''}`} style={skinStyle(skin.colors)}>
                        <div className="skin-preview">
                          {kind === 'card' ? <Card id="r02" owner="player" size="md" /> : <div className="cloak-preview" aria-hidden="true"><span className="head" /><span className="cloak" /></div>}
                        </div>
                        <h3>{skin.name}</h3>
                        <p className="small muted">{skin.description}</p>
                        <button
                          type="button"
                          className={`btn btn-small ${owned ? '' : 'btn-primary'}`}
                          disabled={equipped || (!owned && save.coins < skin.price)}
                          onClick={() => skinAction(skin)}
                        >
                          {equipped ? 'Ausgerüstet ✓' : owned ? 'Ausrüsten' : `🪙 ${skin.price}`}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {opened && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${opened.pack.name} geöffnet`}>
          <div className="modal pack-reveal">
            <h2>{opened.pack.name}</h2>
            <div className="reveal-row">
              {opened.cards.map((c, i) => (
                <div key={c.cardId} className="reveal-slot" style={{ animationDelay: `${i * 0.25}s` }}>
                  <Card id={c.cardId} size="md" showName />
                  <span className={`reveal-tag ${c.isNew ? 'new' : ''}`}>{c.isNew ? 'NEU!' : `Doppelt +🪙 ${c.refund}`}</span>
                </div>
              ))}
            </div>
            <p className="muted small">{opened.cards.filter((c) => c.isNew).map((c) => getCard(c.cardId).name).join(', ') || 'Keine neuen Karten – dafür Münzen.'}</p>
            <div className="modal-actions">
              {save.coins >= opened.pack.price && (
                <button type="button" className="btn" onClick={() => openPack(opened.pack)}>Noch eins (🪙 {opened.pack.price})</button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setOpened(null)}>Super!</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
