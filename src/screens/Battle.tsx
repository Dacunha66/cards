import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { ConfirmButton } from '../components/ConfirmButton';
import { Burst } from '../components/Effects';
import {
  BOARD_SIZE, BattleState, Outcome, Side, applyMove, coinToss, cpuChoosesFirst, createBattle, isGameOver, other, outcome, score,
} from '../game/battle';
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

/** Centre of a board cell in % of the board (the board padding is small enough to ignore). */
function cellCenter(cell: number): { x: number; y: number } {
  return { x: ((cell % BOARD_SIZE) + 0.5) * (100 / BOARD_SIZE), y: (Math.floor(cell / BOARD_SIZE) + 0.5) * (100 / BOARD_SIZE) };
}

export function Battle({ picks, unlocked, reducedMotion, onEnd, onQuit }: Props) {
  const rng = useMemo(() => createRng(), []);
  const [state, setState] = useState<BattleState>(() =>
    createBattle(picks.map((p) => ({ cardId: p.cardId, mod: p.mod })), drawCpuHand(rng), 'player'),
  );
  const [phase, setPhase] = useState<'toss' | 'play'>('toss');
  const [selected, setSelected] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  /** Captured cells still showing their old colour until the flip animation starts. */
  const [pendingFlips, setPendingFlips] = useState<number[]>([]);
  const [showClashes, setShowClashes] = useState(false);
  const ended = useRef(false);
  const over = isGameOver(state);
  const sc = score(state);
  const discoveryIndexes = useMemo(() => new Set(picks.flatMap((p, i) => (p.kind === 'discovery' ? [i] : []))), [picks]);
  // Map current hand positions back to the original pick (to keep the "NEU" marker).
  const [handOrigin, setHandOrigin] = useState<number[]>(() => picks.map((_, i) => i));
  const animating = pendingFlips.length > 0;
  const fxTime = reducedMotion ? 0 : 1;

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 1300);
    return () => clearTimeout(t);
  }, [banner]);

  // After every move: show the comparisons, then flip captured cards.
  useEffect(() => {
    if (state.lastPlaced === null) return;
    setPendingFlips(state.lastFlips);
    setShowClashes(state.lastClashes.length > 0);
    const flip = setTimeout(() => setPendingFlips([]), 550 * fxTime);
    const hide = setTimeout(() => setShowClashes(false), 1300 * fxTime + 300);
    return () => {
      clearTimeout(flip);
      clearTimeout(hide);
    };
  }, [state, fxTime]);

  // Computer turn.
  useEffect(() => {
    if (phase !== 'play' || over || state.turn !== 'cpu') return;
    const delay = reducedMotion ? 450 : state.lastClashes.length > 0 ? 1250 : 800;
    const t = setTimeout(() => {
      setState((s) => (s.turn === 'cpu' && !isGameOver(s) ? applyMove(s, chooseCpuMove(s, rng)) : s));
    }, delay);
    return () => clearTimeout(t);
  }, [state, over, rng, reducedMotion, phase]);

  const start = useCallback((first: Side) => {
    setState((s) => ({ ...s, turn: first }));
    setPhase('play');
    setBanner(first === 'player' ? 'Du beginnst!' : 'Der Gegner beginnt!');
  }, []);

  function place(cell: number) {
    if (phase !== 'play' || over || animating || state.turn !== 'player' || selected === null || state.board[cell]) return;
    setState(applyMove(state, { handIndex: selected, cell }));
    setHandOrigin(handOrigin.filter((_, i) => i !== selected));
    setSelected(null);
  }

  function finish() {
    if (ended.current) return;
    ended.current = true;
    onEnd(outcome(state), sc);
  }

  const result = over && !animating ? outcome(state) : null;
  const winner: Side | null = result === 'win' ? 'player' : result === 'loss' ? 'cpu' : null;
  const hint = phase === 'toss'
    ? 'Ein Münzwurf entscheidet, wer wählen darf.'
    : over
      ? ''
      : state.turn === 'cpu'
        ? 'Der Gegner überlegt …'
        : selected === null
          ? 'Wähle eine Karte aus deiner Hand.'
          : 'Tippe auf ein freies Feld.';
  const placedAt = state.lastPlaced !== null ? cellCenter(state.lastPlaced) : null;

  return (
    <main className="screen battle">
      <header className="battle-top">
        <ConfirmButton label="✕" ariaLabel="Duell abbrechen (keine Belohnung)" confirmLabel="Aufgeben?" onConfirm={onQuit} skipConfirm={over} />
        <div className="cpu-hand" aria-label={`Gegner hat noch ${state.hands.cpu.length} Karten`}>
          {state.hands.cpu.map((_, i) => <span key={i} className="card-back" />)}
        </div>
        <div className={`turn-pill ${phase === 'play' ? state.turn : ''}`}>
          {phase === 'toss' ? 'Münzwurf' : over ? 'Ende' : state.turn === 'player' ? 'Dein Zug' : 'Gegner'}
        </div>
      </header>

      <div className="scorebar" aria-live="polite">
        <span key={`p${sc.player}`} className="score blue pop">Du {sc.player}</span>
        <span className="moves">Zug {Math.min(state.moveCount + 1, 16)}/16</span>
        <span key={`c${sc.cpu}`} className="score red pop">{sc.cpu} Gegner</span>
      </div>

      <div className={`board ${result ? `ended ${result}` : ''}`} role="grid" aria-label="Spielfeld 4 mal 4">
        {state.board.map((cell, i) => {
          const pending = pendingFlips.includes(i);
          const owner = cell ? (pending ? other(cell.owner) : cell.owner) : null;
          const flipped = !pending && state.lastFlips.includes(i);
          const placed = state.lastPlaced === i;
          const canDrop = phase === 'play' && !cell && selected !== null && state.turn === 'player' && !over && !animating;
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              className={`cell ${canDrop ? 'droppable' : ''}`}
              onClick={() => place(i)}
              disabled={!!cell || over || phase !== 'play'}
              aria-label={cell ? undefined : `Feld ${Math.floor(i / 4) + 1}-${(i % 4) + 1} frei`}
            >
              {cell && owner && (
                <Card
                  key={`${cell.cardId}-${owner}`}
                  id={cell.cardId}
                  mod={cell.mod}
                  owner={owner}
                  size="sm"
                  className={[
                    flipped ? 'anim-flip' : placed ? 'anim-drop' : '',
                    pending ? 'under-attack' : '',
                    winner && owner === winner ? 'winner-glow' : '',
                  ].join(' ')}
                />
              )}
            </button>
          );
        })}

        {showClashes && placedAt && state.lastClashes.map((c) => {
          const t = cellCenter(c.cell);
          const x = `${(placedAt.x + t.x) / 2}%`;
          const y = `${(placedAt.y + t.y) / 2}%`;
          return (
            <div key={`${state.moveCount}-${c.cell}`}>
              <div className={`clash ${c.captured ? 'won' : 'held'}`} style={{ left: x, top: y }}>
                {c.attack} {c.captured ? '>' : c.attack === c.defense ? '=' : '<'} {c.defense}
              </div>
              {c.captured && !reducedMotion && (
                <Burst x={x} y={y} colors={state.board[c.cell]?.owner === 'player' ? ['#fff', '#9cc3ff', '#ffcc33'] : ['#fff', '#ffb0b0', '#ffcc33']} count={12} spread={34} />
              )}
            </div>
          );
        })}

        {phase === 'toss' && <CoinToss reducedMotion={reducedMotion} rng={rng} onDecide={start} />}
        {banner && <div className="board-banner">{banner}</div>}
        {result && (
          <div className={`board-banner end ${result}`}>
            <p>{result === 'win' ? '🏆 Sieg!' : result === 'draw' ? '🤝 Unentschieden' : '💀 Niederlage'}</p>
            <button type="button" className="btn btn-primary" onClick={finish}>Weiter zur Belohnung</button>
          </div>
        )}
      </div>

      <p className="hint" aria-live="polite">{hint}</p>

      <div className="hand" aria-label="Deine Hand">
        {state.hands.player.map(({ cardId: id, mod }, i) => (
          <Card
            key={handOrigin[i]}
            id={id}
            mod={mod}
            owner="player"
            size="sm"
            badge={discoveryIndexes.has(handOrigin[i]) ? 'discovery' : null}
            badgeText={unlocked.includes(id) ? '★' : 'NEU'}
            selected={selected === i}
            onClick={phase === 'play' && state.turn === 'player' && !over ? () => setSelected(selected === i ? null : i) : undefined}
          />
        ))}
      </div>
    </main>
  );
}

function CoinToss({ reducedMotion, rng, onDecide }: { reducedMotion: boolean; rng: () => number; onDecide: (first: Side) => void }) {
  const [stage, setStage] = useState<'ready' | 'spinning' | 'result'>('ready');
  const [winner, setWinner] = useState<Side | null>(null);

  function toss() {
    const w = coinToss(rng);
    setWinner(w);
    setStage('spinning');
    setTimeout(() => setStage('result'), reducedMotion ? 150 : 1700);
  }

  // The computer decides on its own after a short pause.
  useEffect(() => {
    if (stage !== 'result' || winner !== 'cpu') return;
    const t = setTimeout(() => onDecide(cpuChoosesFirst()), reducedMotion ? 900 : 2000);
    return () => clearTimeout(t);
  }, [stage, winner, onDecide, reducedMotion]);

  return (
    <div className="toss" role="dialog" aria-label="Münzwurf">
      <div className={`coin-wrap ${stage === 'spinning' ? 'tossing' : ''}`}>
        <div className={`coin ${stage === 'ready' ? 'idle' : `flip-${winner}`}`}>
          <div className="coin-face front"><span>DU</span></div>
          <div className="coin-face back"><span>GEGNER</span></div>
        </div>
      </div>
      {stage === 'ready' && (
        <>
          <p className="toss-title">Wer beginnt?</p>
          <button type="button" className="btn btn-primary" onClick={toss}>🪙 Münze werfen</button>
        </>
      )}
      {stage === 'spinning' && <p className="toss-title">…</p>}
      {stage === 'result' && winner === 'player' && (
        <>
          <p className="toss-title">Du gewinnst den Münzwurf!</p>
          <div className="toss-actions">
            <button type="button" className="btn btn-primary" onClick={() => onDecide('player')}>Ich beginne</button>
            <button type="button" className="btn" onClick={() => onDecide('cpu')}>Gegner beginnt</button>
          </div>
        </>
      )}
      {stage === 'result' && winner === 'cpu' && (
        <p className="toss-title">Der Gegner gewinnt den Münzwurf<br /><small>und lässt dich beginnen.</small></p>
      )}
    </div>
  );
}
