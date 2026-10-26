import { Header } from './Header';

export function Rules({ onBack }: { onBack: () => void }) {
  return (
    <main className="screen rules">
      <Header title="Regeln" onBack={onBack} />
      <div className="scroll prose">
        <h2>1 · Der Lauf</h2>
        <p>Deine Figur rennt von allein. Wische nach links/rechts oder tippe auf ◀ ▶, um die Spur zu wechseln.</p>
        <p>Du kommst durch <b>8 Tore</b> mit je 3 Karten. Du nimmst die Karte auf deiner Spur:</p>
        <ul>
          <li><b>Silberner Rahmen</b> – Karte aus deinem Deck</li>
          <li><b>Goldener Rahmen „NEU“</b> – Entdeckung aus dem restlichen Kartenpool</li>
        </ul>
        <p><b>Stolpersteine</b> halten dich nicht auf, aber die <b>nächste Karte</b>, die du danach nimmst, ist im Duell um <b>1 schwächer</b> (alle vier Werte, mindestens 1). Weiche ihnen aus! Mit ⏩ läufst du schneller.</p>

        <h2>2 · Das Duell</h2>
        <p>Ein 4×4-Feld, du und der Computer habt je 8 Karten und legt abwechselnd eine Karte auf ein freies Feld.</p>
        <p>Jede Karte hat 4 Werte (oben, rechts, unten, links). Liegt daneben eine gegnerische Karte, wird verglichen: <b>deine Seite gegen die zugewandte Seite</b> der Nachbarkarte.</p>
        <p>Ist dein Wert <b>höher</b>, gehört die Karte jetzt dir. Gleichstand übernimmt nicht. Diagonal zählt nicht, und es gibt keine Kettenreaktionen.</p>
        <p>Nach 16 Zügen gewinnt, wer mehr Felder besitzt. 8:8 ist unentschieden.</p>

        <h2>3 · Belohnung</h2>
        <p>Sieg: 🪙 100 und die seltenste neue <b>Entdeckung</b> aus deinem Lauf wird dauerhaft freigeschaltet. Hattest du sie schon, gibt es 🪙 50 extra.</p>
        <p>Unentschieden: 🪙 40 · Niederlage: 🪙 15</p>

        <h2>Shop</h2>
        <p>Im Shop kaufst du mit Münzen <b>Booster-Packs</b> (3 Karten, neue Karten werden sofort freigeschaltet, doppelte in Münzen umgetauscht) und <b>Skins</b>, die nur das Aussehen ändern.</p>

        <h2>Deck</h2>
        <p>Dein Deck besteht aus genau 20 verschiedenen Karten aus deiner Sammlung.</p>
        <p>Der kleine Edelstein oben rechts zeigt die Seltenheit: <b>grau</b> gewöhnlich, <b style={{ color: 'var(--rare)' }}>grün</b> selten, <b style={{ color: 'var(--epic)' }}>lila</b> episch, <b style={{ color: 'var(--legendary)' }}>gold</b> legendär.</p>
      </div>
    </main>
  );
}
