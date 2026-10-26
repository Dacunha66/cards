import { useCallback, useEffect, useState } from 'react';
import { Outcome } from './game/battle';
import { Reward, applyReward, computeReward } from './game/rewards';
import { Pick } from './game/runner';
import { SaveData, loadSave, writeSave } from './game/storage';
import { Menu } from './screens/Menu';
import { Collection } from './screens/Collection';
import { DeckEditor } from './screens/DeckEditor';
import { Rules } from './screens/Rules';
import { Runner } from './screens/Runner';
import { Battle } from './screens/Battle';
import { Result } from './screens/Result';
import { Shop, skinStyle } from './screens/Shop';
import { getSkin } from './game/skins';

export type Screen =
  | { name: 'menu' | 'collection' | 'deck' | 'rules' | 'shop' }
  | { name: 'runner'; runId: number }
  | { name: 'battle'; picks: Pick[] }
  | { name: 'result'; outcome: Outcome; reward: Reward; score: { player: number; cpu: number } };

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [saveOk, setSaveOk] = useState(true);
  const reducedMotion = save.settings.reducedMotion || prefersReducedMotion();

  useEffect(() => {
    setSaveOk(writeSave(save));
  }, [save]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  const startRun = useCallback(() => setScreen({ name: 'runner', runId: Date.now() }), []);
  const toMenu = useCallback(() => setScreen({ name: 'menu' }), []);

  const finishBattle = (picks: Pick[], outcome: Outcome, score: { player: number; cpu: number }) => {
    const reward = computeReward(outcome, picks, save.unlocked);
    setSave((prev) => applyReward(prev, outcome, reward));
    setScreen({ name: 'result', outcome, reward, score });
  };

  return (
    <div className="app" style={skinStyle(getSkin(save.skins.card).colors)}>
      {screen.name === 'menu' && (
        <Menu
          save={save}
          saveOk={saveOk}
          onPlay={startRun}
          onNavigate={(name) => setScreen({ name })}
          onToggleReducedMotion={() =>
            setSave((s) => ({ ...s, settings: { ...s.settings, reducedMotion: !s.settings.reducedMotion } }))
          }
        />
      )}
      {screen.name === 'collection' && <Collection save={save} onBack={toMenu} />}
      {screen.name === 'deck' && (
        <DeckEditor save={save} onSave={(deck) => setSave((s) => ({ ...s, deck }))} onBack={toMenu} />
      )}
      {screen.name === 'rules' && <Rules onBack={toMenu} />}
      {screen.name === 'shop' && <Shop save={save} onChange={setSave} onBack={toMenu} />}
      {screen.name === 'runner' && (
        <Runner
          key={screen.runId}
          deck={save.deck}
          unlocked={save.unlocked}
          reducedMotion={reducedMotion}
          skin={getSkin(save.skins.runner).colors}
          onFinish={(picks) => setScreen({ name: 'battle', picks })}
          onQuit={toMenu}
        />
      )}
      {screen.name === 'battle' && (
        <Battle
          picks={screen.picks}
          unlocked={save.unlocked}
          reducedMotion={reducedMotion}
          onEnd={(outcome, score) => finishBattle(screen.picks, outcome, score)}
          onQuit={toMenu}
        />
      )}
      {screen.name === 'result' && (
        <Result outcome={screen.outcome} reward={screen.reward} score={screen.score} coins={save.coins} onAgain={startRun} onMenu={toMenu} />
      )}
    </div>
  );
}
