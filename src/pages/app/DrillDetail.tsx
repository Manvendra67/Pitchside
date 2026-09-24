import { ArrowLeft, Check, Clock, Package, Pause, Play, RotateCcw, Sparkles, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Button, ButtonLink } from '@/components/Button';
import { CheckDraw } from '@/components/CheckDraw';
import { DrillCard } from '@/components/DrillCard';
import { DrillDiagram } from '@/components/DrillDiagram';
import { ProgressRing } from '@/components/ProgressRing';
import { CategoryTag, CoachBadge, FeedbackTag, LevelTag } from '@/components/Tags';
import { COACH } from '@/data/coach';
import { DRILL_BY_ID, DRILLS } from '@/data/drills';
import { POSITION_BY_ID } from '@/data/positions';
import { formatShortDate, fromKey } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { actions, useStore } from '@/lib/store';
import type { Drill } from '@/lib/types';
import '@/styles/pages.css';

type Status = 'idle' | 'running' | 'paused' | 'finished' | 'complete';

function mmss(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Training timer. Big start button, a ring that fills as time runs, and
 * one tap to mark the drill complete — which logs it, updates progress and
 * plays a short completion moment.
 */
function DrillTimer({ drill, autoStart, onStep }: { drill: Drill; autoStart: boolean; onStep: (i: number) => void }) {
  const total = drill.duration * 60;
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const started = useRef<number | null>(null);
  const banked = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const loggedSeconds = useRef(0);

  const start = useCallback(() => {
    started.current = performance.now();
    setStatus('running');
  }, []);

  useEffect(() => {
    if (autoStart) start();
  }, [autoStart, start]);

  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => {
      const e = banked.current + (performance.now() - (started.current ?? performance.now())) / 1000;
      setElapsed(e);
      if (e >= total) {
        banked.current = total;
        setElapsed(total);
        setStatus('finished');
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [status, total]);

  useEffect(() => {
    const fraction = elapsed / total;
    onStep(status === 'idle' || status === 'complete' ? -1 : Math.min(drill.steps.length - 1, Math.floor(fraction * drill.steps.length)));
  }, [elapsed, status, total, drill.steps.length, onStep]);

  const pause = () => {
    banked.current += (performance.now() - (started.current ?? performance.now())) / 1000;
    setStatus('paused');
  };

  const complete = () => {
    const seconds = elapsed > 20 ? elapsed : total;
    loggedSeconds.current = seconds;
    actions.logDrill(drill.id, seconds);
    setStatus('complete');
  };

  const reset = () => {
    banked.current = 0;
    started.current = null;
    setElapsed(0);
    setStatus('idle');
  };

  useGSAP(
    () => {
      if (status !== 'complete' || prefersReducedMotion()) return;
      const q = gsap.utils.selector(panel);
      gsap
        .timeline()
        .fromTo(q('.timer__burst'), { scale: 0.4, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.9, ease: EASE })
        .fromTo(q('.timer__done-text > *'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: EASE }, 0.2);
    },
    { dependencies: [status], scope: panel },
  );

  const value = status === 'complete' ? 1 : elapsed / total;
  const remaining = total - elapsed;

  return (
    <div ref={panel} className={`card timer timer--${status}`} aria-live="polite">
      <div className="timer__ring">
        <span className="timer__burst" aria-hidden="true" />
        <ProgressRing
          value={value}
          size={208}
          stroke={14}
          color={status === 'complete' ? 'var(--volt-500)' : 'var(--pitch-400)'}
          ticks={drill.duration}
          animateIn={false}
          label={status === 'complete' ? 'Drill complete' : `${mmss(remaining)} remaining`}
        >
          {status === 'complete' ? (
            <span className="timer__check">
              <CheckDraw done size={64} stroke={3} color="var(--pitch-600)" />
            </span>
          ) : (
            <>
              <span className="timer__time">{mmss(status === 'idle' ? total : remaining)}</span>
              <span className="timer__label">
                {status === 'idle' ? 'minutes' : status === 'paused' ? 'paused' : status === 'finished' ? 'time!' : 'to go'}
              </span>
            </>
          )}
        </ProgressRing>
      </div>

      {status === 'complete' ? (
        <div className="timer__done-text">
          <p className="timer__title">Drill complete!</p>
          <p className="muted">Logged {Math.max(1, Math.round(loggedSeconds.current / 60))} minutes. Your progress is updated.</p>
          <div className="timer__actions">
            <ButtonLink to="/progress" variant="primary" size="lg" block>
              See my progress
            </ButtonLink>
            <Button variant="ghost" size="md" iconLeft={<RotateCcw size={16} />} onClick={reset}>
              Do it again
            </Button>
          </div>
        </div>
      ) : (
        <div className="timer__actions">
          {status === 'idle' && (
            <Button variant="accent" size="xl" block magnetic iconLeft={<Play size={20} />} onClick={start}>
              Start Drill
            </Button>
          )}
          {status === 'running' && (
            <Button variant="secondary" size="lg" block iconLeft={<Pause size={18} />} onClick={pause}>
              Pause
            </Button>
          )}
          {status === 'paused' && (
            <Button variant="secondary" size="lg" block iconLeft={<Play size={18} />} onClick={start}>
              Resume
            </Button>
          )}
          {status === 'finished' && <p className="timer__title">Time! Great effort.</p>}
          <Button
            variant={status === 'finished' ? 'accent' : 'primary'}
            size="lg"
            block
            iconLeft={<Check size={18} />}
            onClick={complete}
            className={status === 'finished' ? 'timer__pulse' : ''}
          >
            Mark complete
          </Button>
          {status !== 'idle' && (
            <button type="button" className="text-link timer__reset" onClick={reset}>
              Reset timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DrillDetail() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const drill = DRILL_BY_ID[id];
  const { activity } = useStore();
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  useDocumentTitle(drill?.name ?? 'Drill not found');
  useReveal(root, [id]);

  const history = useMemo(
    () =>
      Object.entries(activity)
        .filter(([, d]) => d.drills.some((x) => x.id === id))
        .map(([k]) => k)
        .sort()
        .reverse(),
    [activity, id],
  );

  const related = useMemo(() => {
    if (!drill) return [];
    return DRILLS.filter((d) => d.id !== drill.id)
      .map((d) => ({
        d,
        score:
          (d.category === drill.category ? 2 : 0) +
          (d.positions.some((p) => drill.positions.includes(p)) ? 1 : 0) +
          (d.level === drill.level ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.d);
  }, [drill]);

  if (!drill) {
    return (
      <div className="page">
        <h1 className="page-head__title">That drill isn’t in the library.</h1>
        <p className="page-head__sub">It may have been renamed. Have a look at all drills instead.</p>
        <ButtonLink to="/drills" variant="primary" size="lg" iconLeft={<ArrowLeft size={18} />}>
          All drills
        </ButtonLink>
      </div>
    );
  }

  const positions = drill.positions.length === 5 ? 'All positions' : drill.positions.map((p) => POSITION_BY_ID[p].name).join(', ');

  return (
    <div ref={root} className="page drill-detail" key={drill.id}>
      <Link to="/drills" className="back-link" data-reveal="fade">
        <ArrowLeft size={18} /> All drills
      </Link>

      <header className="dd-hero">
        <div className="dd-hero__text">
          <div className="dd-tags" data-reveal="fade">
            <CategoryTag id={drill.category} />
            <LevelTag level={drill.level} />
            {drill.source.type === 'player-feedback' && <FeedbackTag />}
          </div>
          <h1 className="page-head__title" data-reveal="mask">
            {drill.name}
          </h1>
          <p className="page-head__sub" data-reveal="up">
            {drill.summary}
          </p>
          <ul className="dd-facts" data-reveal="up">
            <li>
              <Clock size={18} />
              <span>
                <small>Time</small>
                {drill.duration} minutes
              </span>
            </li>
            <li>
              <Users size={18} />
              <span>
                <small>Positions</small>
                {positions}
              </span>
            </li>
            <li>
              <Package size={18} />
              <span>
                <small>You need</small>
                {drill.equipment.join(', ')}
              </span>
            </li>
          </ul>
          <div data-reveal="up">
            <CoachBadge />
          </div>
        </div>
        <div className="dd-hero__art" data-reveal="blur">
          <DrillDiagram diagram={drill.diagram} live={!prefersReducedMotion()} title={`Diagram showing how to set up ${drill.name}`} />
          <span className="dd-hero__legend" aria-hidden="true">
            <i className="dot dot--you" /> You
            {drill.diagram.partner && (
              <>
                <i className="dot dot--friend" /> Friend
              </>
            )}
            {drill.diagram.cones && (
              <>
                <i className="dot dot--cone" /> Cone
              </>
            )}
          </span>
        </div>
      </header>

      <div className="dd-layout">
        <div className="dd-main">
          {drill.source.type === 'player-feedback' && (
            <aside className="dd-feedback" data-reveal="up">
              <Sparkles size={20} />
              <p>
                <b>New from player feedback.</b> {drill.source.requests} players asked for “{drill.source.request.toLowerCase()}”.{' '}
                {COACH.name} built this drill and added it on {formatShortDate(fromKey(drill.source.addedOn))}.
              </p>
            </aside>
          )}

          <section className="dd-section" data-reveal="up">
            <h2 className="dd-section__title">How it works</h2>
            <p className="dd-instructions">{drill.instructions}</p>
          </section>

          <section className="dd-section" data-reveal="up">
            <h2 className="dd-section__title">Step by step</h2>
            <ol className="dd-steps">
              {drill.steps.map((s, i) => (
                <li key={i} className="dd-step" data-active={i === step || undefined} data-past={(step > i && step >= 0) || undefined}>
                  <span className="dd-step__n">{i + 1}</span>
                  <span className="dd-step__text">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <blockquote className="dd-cue" data-reveal="scale">
            <p className="eyebrow">Coach’s cue</p>
            <p className="dd-cue__text">“{drill.cue}”</p>
            <footer>— {COACH.name}</footer>
          </blockquote>

          <section className="dd-section" data-reveal="up">
            <h2 className="dd-section__title">Key coaching points</h2>
            <ul className="dd-points">
              {drill.keyPoints.map((k) => (
                <li key={k}>
                  <span className="dd-points__tick">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {k}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="dd-aside" aria-label="Drill timer">
          <div className="dd-sticky">
            <DrillTimer drill={drill} autoStart={params.get('start') === '1'} onStep={setStep} />
            <p className="dd-history">
              {history.length === 0
                ? 'You haven’t done this drill yet.'
                : `Done ${history.length} ${history.length === 1 ? 'time' : 'times'} · last ${formatShortDate(fromKey(history[0]))}`}
            </p>
          </div>
        </aside>
      </div>

      <section className="dd-related">
        <div className="section-title">
          <h2>Try next</h2>
          <Link to={`/drills?category=${drill.category}`} className="text-link">
            More like this
          </Link>
        </div>
        <div className="drill-grid">
          {related.map((d) => (
            <DrillCard key={d.id} drill={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
