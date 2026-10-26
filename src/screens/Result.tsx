import { Card } from '../components/Card';
import { Outcome } from '../game/battle';
import { getCard } from '../game/cards';
import { Reward } from '../game/rewards';

interface Props {
  outcome: Outcome;
  reward: Reward;
  score: { player: number; cpu: number };
  coins: number;
  onAgain: () => void;
  onMenu: () => void;
}

const TITLES: Record<Outcome, string> = { win: 'Sieg!', draw: 'Unentschieden', loss: 'Niederlage' };
const ICONS: Record<Outcome, string> = { win: '🏆', draw: '🤝', loss: '💀' };

export function Result({ outcome, reward, score, coins, onAgain, onMenu }: Props) {
  return (
    <main className={`screen result result-${outcome}`}>
      <div className="result-icon" aria-hidden="true">{ICONS[outcome]}</div>
      <h1>{TITLES[outcome]}</h1>
      <p className="result-score"><span className="blue">{score.player}</span> : <span className="red">{score.cpu}</span></p>

      <div className="reward-box">
        <p className="reward-coins">+ 🪙 {reward.coins}</p>
        {reward.newCard && (
          <div className="new-card">
            <p>Neue Karte freigeschaltet!</p>
            <Card id={reward.newCard} size="lg" className="reveal" />
            <p className="new-card-name">{getCard(reward.newCard).name}</p>
          </div>
        )}
        {reward.duplicateCard && (
          <p className="muted">{getCard(reward.duplicateCard).name} hattest du schon – dafür gibt es 🪙 50 extra.</p>
        )}
        {outcome === 'win' && !reward.newCard && !reward.duplicateCard && (
          <p className="muted">Tipp: Nimm im Lauf goldene „NEU“-Karten, um nach einem Sieg neue Karten zu bekommen.</p>
        )}
        {outcome !== 'win' && <p className="muted">Nur ein Sieg schaltet neue Karten frei.</p>}
        <p className="muted">Münzen gesamt: 🪙 {coins} – ausgeben im 🛒 Shop</p>
      </div>

      <div className="menu-buttons">
        <button type="button" className="btn btn-primary btn-big" onClick={onAgain}>▶ Neuer Lauf</button>
        <button type="button" className="btn" onClick={onMenu}>Hauptmenü</button>
      </div>
    </main>
  );
}
