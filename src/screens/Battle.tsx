import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { ConfirmButton } from '../components/ConfirmButton';
import { BattleState, Outcome, Side, applyMove, createBattle, isGameOver, outcome, score } from '../game/battle';
import { chooseCpuMove, drawCpuHand } from '../game/ai';
import { createRng } from '../game/rng';
import { Pick } from '../game/runner';

interface Props {
  picks: Pick[];
  unlocked: string[];
  reducedMotion: boolean;
  onEnd: (outcome: Outcome, score: { player: number; cpu: number }) => void;
  onQuit: () => void;
}

export function Battle({ picks, unlocked, reducedMotion, onEnd, onQuit }: Props) {
  const rng = useMemo(() => createRng(), []);
  const [state, setState] = useState<BattleState>(() => {
    const first: Side = rng() < 0.5 ? 'player' : 'cpu';
    return createBattle(picks.map((p) => p.cardId), drawCpuHand(rng), first);
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(state.turn === 'player' ? 'Du beginnst!' : 'Der Gegner beginnt!');
  const ended = useRef(false);
  const over = isGameOver(state);
  const sc = score(state);
  const discoveryIndexes = useMemo(() => new Set(picks.flatMap((p, i) => (p.kind === 'discovery' ? [i] : []))), [picks]);
  // Map current hand positions back to the original pick (to keep the "NEU" marker).
  const [handOrigin, setHandOrigin] = useState<number[]>(() => picks.map((_, i) => i));

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 1300);
    return () => clearTimeout(t);
  }, [banner]);

  // Computer turn.
  useEffect(() => {
    if (over || state.turn !== 'cpu') return;
    const t = setTimeout(() => {
      setState((s) => (s.turn === 'cpu' && !isGameOver(s) ? applyMove(s, chooseCpuMove(s, rng)) : s));
    }, reducedMotion ? 450 : 850);
    return () => clearTimeout(t);
  }, [state, over, rng, reducedMotion]);

  useEffect(() => {
    if (!over) return;
    setBanner(null);
  }, [over]);

  function place(cell: number) {
    if (over || state.turn !== 'player' || selected === null || state.board[cell]) return;
    setState(applyMove(state, { handIndex: selected, cell }));
    setHandOrigin(handOrigin.filter((_, i) => i !== selected));
    setSelected(null);
  }

  function finish() {
    if (ended.current) return;
    ended.current = true;
    onEnd(outcome(state), sc);
  }

  const hint = over
    ? ''
    : state.turn === 'cpu'
      ? 'Der Gegner überlegt …'
      : selected === null
        ? 'Wähle eine Karte aus deiner Hand.'
        : 'Tippe auf ein freies Feld.';

  const result = over ? outcome(state) : null;

  return (
    <main className="screen battle">
      <header className="battle-top">
        <ConfirmButton label="✕" ariaLabel="Duell abbrechen (keine Belohnung)" confirmLabel="Aufgeben?" onConfirm={onQuit} skipConfirm={over} />
        <div className="cpu-hand" aria-label={`Gegner hat noch ${state.hands.cpu.length} Karten`}>
          {state.hands.cpu.map((_, i) => <span key={i} className="card-back" />)}
        </div>
        <div className={`turn-pill ${state.turn}`}>{over ? 'Ende' : state.turn === 'player' ? 'Dein Zug' : 'Gegner'}</div>
      </header>

      <div className="scorebar" aria-live="polite">
        <span className="score blue">Du {sc.player}</span>
        <span className="moves">Zug {Math.min(state.moveCount + 1, 16)}/16</span>
        <span className="score red">{sc.cpu} Gegner</span>
      </div>

      <div className="board" role="grid" aria-label="Spielfeld 4 mal 4">
        {state.board.map((cell, i) => {
          const flipped = state.lastFlips.includes(i);
          const placed = state.lastPlaced === i;
          const canDrop = !cell && selected !== null && state.turn === 'player' && !over;
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              className={`cell ${canDrop ? 'droppable' : ''}`}
              onClick={() => place(i)}
              disabled={!!cell || over}
              aria-label={cell ? undefined : `Feld ${Math.floor(i / 4) + 1}-${(i % 4) + 1} frei`}
            >
              {cell && (
                <Card
                  key={`${cell.cardId}-${cell.owner}`}
                  id={cell.cardId}
                  owner={cell.owner}
                  size="sm"
                  className={flipped ? 'anim-flip' : placed ? 'anim-drop' : ''}
                />
              )}
            </button>
          );
        })}
        {banner && <div className="board-banner">{banner}</div>}
        {result && (
          <div className="board-banner end">
            <p>{result === 'win' ? '🏆 Sieg!' : result === 'draw' ? '🤝 Unentschieden' : '💀 Niederlage'}</p>
            <button type="button" className="btn btn-primary" onClick={finish}>Weiter zur Belohnung</button>
          </div>
        )}
      </div>

      <p className="hint" aria-live="polite">{hint}</p>

      <div className="hand" aria-label="Deine Hand">
        {state.hands.player.map((id, i) => (
          <Card
            key={handOrigin[i]}
            id={id}
            owner="player"
            size="sm"
            badge={discoveryIndexes.has(handOrigin[i]) ? 'discovery' : null}
            badgeText={unlocked.includes(id) ? '★' : 'NEU'}
            selected={selected === i}
            onClick={state.turn === 'player' && !over ? () => setSelected(selected === i ? null : i) : undefined}
          />
        ))}
      </div>
    </main>
  );
}
