import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AmbientPitch } from '@/components/Ambient';
import { Button } from '@/components/Button';
import { Ball } from '@/components/Glyphs';
import { Logo } from '@/components/Logo';
import { AgePicker, DayPicker, GoalPicker, LevelPicker, PositionPicker, WeightControl } from '@/components/Pickers';
import { usePortal } from '@/components/Portal';
import { DEFAULT_TRAINING_DAYS } from '@/lib/plan';
import { LEVEL_BY_ID, POSITION_BY_ID, WEEKDAYS } from '@/data/positions';
import { LevelBars } from '@/components/Glyphs';
import { MiniPitch } from '@/components/Pickers';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, EASE_IN_OUT, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { fuelTargets } from '@/lib/nutrition';
import { actions, useStore } from '@/lib/store';
import type { GoalId, Level, PositionId, Weekday } from '@/lib/types';
import '@/styles/onboarding.css';

const STEPS = ['name', 'position', 'level', 'weight', 'extras'] as const;
type Step = (typeof STEPS)[number];

const COPY: Record<Step, { q: string; hint: string }> = {
  name: { q: 'First up — what’s your name?', hint: 'Your first name or a nickname is perfect.' },
  position: { q: 'What position do you play?', hint: 'Pick the one you play most. You can change it later.' },
  level: { q: 'How would you describe your skills?', hint: 'Be honest — it helps us pick the right drills.' },
  weight: {
    q: 'What’s your body weight?',
    hint: 'We only use this to size your fuel guide. Not sure? Ask a grown-up, or make your best guess.',
  },
  extras: { q: 'Last bit. All optional!', hint: 'Skip it if you like — you can add these any time.' },
};

/**
 * Onboarding: five quick questions, completable well inside a minute. Taps
 * on position and level cards move on automatically. Questions slide in the
 * direction you're travelling and cross-fade, never hard-cut.
 */
export default function Onboarding() {
  useDocumentTitle('Set up your player');
  const { profile, onboarded } = useStore();
  const portal = usePortal();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const busy = useRef(false);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState(onboarded ? profile.name : '');
  const [position, setPosition] = useState<PositionId | undefined>(onboarded ? profile.position : undefined);
  const [level, setLevel] = useState<Level | undefined>(onboarded ? profile.level : undefined);
  const [weight, setWeight] = useState(onboarded ? profile.weightKg : 35);
  const [age, setAge] = useState<number | undefined>(onboarded ? profile.age : undefined);
  const [days, setDays] = useState<Weekday[]>(onboarded ? profile.trainingDays : DEFAULT_TRAINING_DAYS);
  const [goals, setGoals] = useState<GoalId[]>(onboarded ? profile.goals : []);

  const current = STEPS[step];
  const canNext =
    (current === 'name' && name.trim().length > 0) ||
    (current === 'position' && !!position) ||
    (current === 'level' && !!level) ||
    current === 'weight' ||
    current === 'extras';

  const go = (next: number) => {
    if (busy.current || next === step || next < 0) return;
    dir.current = next > step ? 1 : -1;
    const el = panel.current;
    if (!el || prefersReducedMotion()) {
      setStep(next);
      return;
    }
    busy.current = true;
    gsap.to(el, {
      x: -48 * dir.current,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        busy.current = false;
        setStep(next);
      },
    });
  };

  // Each new question enters from the side you're heading towards.
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { clearProps: 'all' });
    } else {
      gsap.fromTo(
        el,
        { x: 56 * dir.current, opacity: 0, filter: 'blur(6px)' },
        { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.46, ease: EASE, clearProps: 'filter,transform' },
      );
      gsap.fromTo(
        el.querySelectorAll('[data-stagger]'),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: EASE, delay: 0.08 },
      );
    }
    const focusable = el.querySelector<HTMLElement>('input, [aria-checked="true"], [role="radio"]');
    focusable?.focus({ preventScroll: true });
  }, [step]);

  // Progress segments fill as you go.
  useGSAP(
    () => {
      const fills = gsap.utils.toArray<HTMLElement>('.ob-progress__seg i', root.current);
      fills.forEach((f, i) => {
        const v = done ? 1 : i < step ? 1 : i === step ? 0.35 : 0;
        if (prefersReducedMotion()) gsap.set(f, { scaleX: v });
        else gsap.to(f, { scaleX: v, duration: 0.5, ease: EASE });
      });
    },
    { dependencies: [step, done], scope: root },
  );

  const pickAndAdvance = <T,>(setter: (v: T) => void, v: T) => {
    setter(v);
    window.setTimeout(() => go(step + 1), prefersReducedMotion() ? 0 : 280);
  };

  const finish = (skipExtras = false) => {
    if (!position || !level) return;
    actions.completeOnboarding({
      name,
      position,
      level,
      weightKg: weight,
      age: skipExtras ? undefined : age,
      trainingDays: skipExtras ? DEFAULT_TRAINING_DAYS : days,
      goals: skipExtras ? [] : goals,
    });
    setDone(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canNext) return;
    if (current === 'extras') finish();
    else go(step + 1);
  };

  const carbs = fuelTargets(weight)[0].grams;
  const secondsLeft = Math.max(5, (STEPS.length - step) * 8);

  return (
    <div ref={root} className="onboarding theme-dark" data-layout="focus">
      <AmbientPitch tone="dark" />
      <header className="ob-top">
        <Link to="/" className="ob-top__brand" aria-label="Pitchside home">
          <Logo size={26} />
        </Link>
        <div
          className="ob-progress"
          aria-label={done ? 'All steps complete' : `Step ${step + 1} of ${STEPS.length}`}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={done ? STEPS.length : step + 1}
        >
          {STEPS.map((s) => (
            <span key={s} className="ob-progress__seg">
              <i />
            </span>
          ))}
        </div>
        <span className="ob-top__count mono" aria-hidden="true">
          {done ? 'Done' : `${step + 1} / ${STEPS.length} · ~${secondsLeft}s left`}
        </span>
        <Link to={onboarded ? '/dashboard' : '/'} className="icon-btn icon-btn--lg" aria-label="Close set-up">
          <X size={22} />
        </Link>
      </header>

      <main id="main" className="ob-main" data-route-view>
        {done ? (
          <Complete name={name.trim() || 'Player'} position={position!} onGo={(el) => portal('/dashboard', el)} />
        ) : (
          <form className="ob-form" onSubmit={submit} noValidate>
            <PlayerCard name={name} position={position} level={level} weight={weight} days={days} step={step} />
            <div ref={panel} className="ob-panel" key={current}>
              <p className="eyebrow" data-stagger>
                Question {step + 1}
              </p>
              <h1 className="ob-q" data-stagger id={`q-${current}`}>
                {COPY[current].q}
              </h1>
              <p className="ob-hint" data-stagger>
                {COPY[current].hint}
              </p>

              <div className="ob-field" data-stagger>
                {current === 'name' && (
                  <div className="field">
                    <label className="visually-hidden" htmlFor="ob-name">
                      Your name
                    </label>
                    <input
                      id="ob-name"
                      className="input ob-name"
                      value={name}
                      maxLength={24}
                      autoComplete="given-name"
                      placeholder="Type your name"
                      onChange={(e) => setName(e.target.value)}
                    />
                    <p className="field__hint">Saved only on this device.</p>
                  </div>
                )}
                {current === 'position' && (
                  <PositionPicker value={position} onChange={setPosition} onCommit={(p) => pickAndAdvance(setPosition, p)} />
                )}
                {current === 'level' && <LevelPicker value={level} onChange={setLevel} onCommit={(l) => pickAndAdvance(setLevel, l)} />}
                {current === 'weight' && (
                  <div className="ob-weight">
                    <WeightControl value={weight} onChange={setWeight} id="ob-weight" />
                    <p className="ob-weight__preview">
                      That gives you about <b>{carbs} g</b> of carbs on a training day. <span>More on your Fuel page.</span>
                    </p>
                  </div>
                )}
                {current === 'extras' && (
                  <div className="ob-extras">
                    <fieldset>
                      <legend>How old are you?</legend>
                      <AgePicker value={age} onChange={setAge} />
                    </fieldset>
                    <fieldset>
                      <legend>Which days can you train?</legend>
                      <DayPicker value={days} onChange={setDays} />
                    </fieldset>
                    <fieldset>
                      <legend>What do you want to get better at?</legend>
                      <GoalPicker value={goals} onChange={setGoals} />
                    </fieldset>
                  </div>
                )}
              </div>
            </div>

            <div className="ob-actions">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                iconLeft={<ArrowLeft size={20} />}
                className="ob-back"
              >
                Back
              </Button>
              {current === 'extras' && (
                <Button variant="secondary" size="lg" onClick={() => finish(true)}>
                  Skip
                </Button>
              )}
              {(current === 'name' ||
                current === 'weight' ||
                current === 'extras' ||
                (current === 'position' && position) ||
                (current === 'level' && level)) && (
                <Button type="submit" variant="accent" size="lg" magnetic disabled={!canNext} icon={<ArrowRight size={20} />}>
                  {current === 'extras' ? 'Finish' : 'Continue'}
                </Button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

/**
 * A player card that fills itself in as questions are answered — the same
 * card, morphing, so each answer visibly builds "who am I as a player?".
 */
function PlayerCard({
  name,
  position,
  level,
  weight,
  days,
  step,
}: {
  name: string;
  position?: PositionId;
  level?: Level;
  weight: number;
  days: Weekday[];
  step: number;
}) {
  const card = useRef<HTMLDivElement>(null);
  const pos = position ? POSITION_BY_ID[position] : undefined;
  const lvl = level ? LEVEL_BY_ID[level] : undefined;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const hot = card.current?.querySelector(`[data-slot="${STEPS[Math.max(0, step - 1)]}"]`);
      if (hot && step > 0) gsap.fromTo(hot, { scale: 0.92, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'settle' });
      gsap.to(card.current, { rotateY: step % 2 ? -4 : 4, duration: 0.8, ease: EASE });
    },
    { dependencies: [step] },
  );

  return (
    <aside className="ob-card" aria-hidden="true">
      <div ref={card} className="ob-card__inner">
        <div className="ob-card__top">
          <span className="ob-card__num">{pos?.short ?? '—'}</span>
          <span className="eyebrow">Pitchside player</span>
        </div>
        <div className="ob-card__pitch" data-slot="position">
          <MiniPitch spot={pos?.spot ?? [50, 32]} active={!!pos} />
        </div>
        <p className="ob-card__name" data-slot="name">
          {name.trim() || 'Your name'}
        </p>
        <p className="ob-card__pos">{pos?.name ?? 'Position'}</p>
        <dl className="ob-card__stats">
          <div data-slot="level">
            <dt>Level</dt>
            <dd>
              {lvl ? (
                <>
                  <LevelBars level={lvl.bars as 1 | 2 | 3} /> {lvl.name}
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div data-slot="weight">
            <dt>Weight</dt>
            <dd>{step >= 3 ? `${weight} kg` : '—'}</dd>
          </div>
          <div data-slot="extras">
            <dt>Trains</dt>
            <dd>{step >= 4 ? days.map((d) => WEEKDAYS[d].slice(0, 2)).join(' ') || '—' : '—'}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function Complete({ name, position, onGo }: { name: string; position: PositionId; onGo: (el: HTMLElement) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(prefersReducedMotion());

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ onComplete: () => setReady(true) });
      tl.from(q('.ob-done__ring'), { scale: 0.7, opacity: 0, duration: 0.45, ease: 'settle' })
        .fromTo(q('[data-arc]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: EASE_IN_OUT }, '-=0.25')
        .from(q('.ob-done__ball'), { scale: 0, rotate: -180, duration: 0.45, ease: 'back.out(2)' }, '<')
        .to(q('.ob-done__ball'), { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
        .fromTo(q('[data-tick]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: EASE })
        .from(q('[data-done-text]'), { y: 20, opacity: 0, duration: 0.45, stagger: 0.07, ease: EASE }, '<');
    },
    { scope: root },
  );

  // Hand over to the dashboard with the ring as the portal's origin.
  useEffect(() => {
    if (!ready) return;
    button.current?.focus();
    const ring = root.current?.querySelector<HTMLElement>('.ob-done__ring');
    const id = window.setTimeout(() => ring && onGo(ring), prefersReducedMotion() ? 2500 : 1200);
    return () => window.clearTimeout(id);
  }, [ready, onGo]);

  return (
    <div ref={root} className="ob-done" role="status">
      <div className="ob-done__ring">
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={80 + Math.cos(a) * 78}
                y1={80 + Math.sin(a) * 78}
                x2={80 + Math.cos(a) * 83}
                y2={80 + Math.sin(a) * 83}
                stroke="rgba(255,255,255,.2)"
                strokeWidth="1.5"
              />
            );
          })}
          <circle
            data-arc
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="var(--volt-400)"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            transform="rotate(-90 80 80)"
          />
          <path
            data-tick
            d="M54 82l17 17 36-38"
            fill="none"
            stroke="var(--volt-400)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
          />
        </svg>
        <span className="ob-done__ball" aria-hidden="true">
          <Ball size={54} />
        </span>
      </div>
      <h1 className="ob-q" data-done-text>
        You’re all set, {name}!
      </h1>
      <p className="ob-hint" data-done-text>
        Your {POSITION_BY_ID[position].name.toLowerCase()} academy is ready. Let’s go.
      </p>
      <div data-done-text>
        <Button ref={button} variant="accent" size="lg" icon={<ArrowRight size={20} />} onClick={(e) => onGo(e.currentTarget)}>
          Go to my dashboard
        </Button>
      </div>
    </div>
  );
}
