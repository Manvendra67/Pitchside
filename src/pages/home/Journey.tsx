import { Apple, CalendarDays, LayoutGrid, TrendingUp, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { Cone } from '@/components/Glyphs';
import { DEMO_PROFILE } from '@/data/seed';
import { POSITIONS } from '@/data/positions';
import { useReducedMotion } from '@/lib/hooks';
import { NUTRIENT_BY_ID } from '@/lib/nutrition';
import { EASE, gsap, useGSAP } from '@/lib/motion';
import { DEMO_FUEL, MiniDrillRow, MiniStreakDots, MiniWeekBars, MiniWindow } from './Mini';

const STEPS = [
  {
    q: 'Who am I as a player?',
    a: 'Pick your position and level, add your weight. Everything in Pitchside is built around you.',
    url: 'profile',
  },
  {
    q: 'What should I fuel with?',
    a: 'Daily carbs, protein and fats sized to your body. Clear numbers. No diets, ever.',
    url: 'nutrition',
  },
  {
    q: 'What should I train?',
    a: 'A session made for your position and level, with drills reviewed by Coach Ranvir.',
    url: 'plan',
  },
  {
    q: 'Did I complete it?',
    a: 'One tap to check in. Your ring fills and your streak grows.',
    url: 'dashboard',
  },
  {
    q: 'Am I improving?',
    a: 'See your week, your streak and your milestones — encouraging, never overwhelming.',
    url: 'progress',
  },
];

const RAIL = [UserRound, Apple, CalendarDays, LayoutGrid, TrendingUp];

function StateProfile() {
  return (
    <div className="jstate jstate--profile">
      <p className="jstate__eyebrow" data-in>
        Your position
      </p>
      <div className="jpos" data-in>
        {POSITIONS.map((p) => (
          <span key={p.id} className="jpos__chip" data-on={p.id === DEMO_PROFILE.position || undefined}>
            {p.short}
          </span>
        ))}
      </div>
      <div className="jprofile-grid">
        <div className="jmini-pitch" data-in>
          <svg viewBox="0 0 100 64" aria-hidden="true">
            <rect x="2" y="2" width="96" height="60" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 2v60" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="70" cy="12" r="4.5" fill="var(--volt-400)" stroke="var(--ink-900)" strokeWidth="1" />
          </svg>
        </div>
        <div className="jfacts" data-in>
          <span>
            <small>Level</small>Developing
          </span>
          <span>
            <small>Weight</small>34 kg
          </span>
          <span>
            <small>Trains</small>4 days
          </span>
        </div>
      </div>
    </div>
  );
}

function StateFuel() {
  return (
    <div className="jstate jstate--fuel">
      <p className="jstate__eyebrow" data-in>
        Training day · 34 kg
      </p>
      <div className="jfuel">
        {DEMO_FUEL.map((t) => (
          <div key={t.id} className={`jfuel__card jfuel__card--${t.id}`} data-in>
            <span className="jfuel__name">{NUTRIENT_BY_ID[t.id].short}</span>
            <span className="jfuel__num">
              {t.grams}
              <small>g</small>
            </span>
            <span className="jfuel__bar">
              <i data-grow style={{ width: `${30 + t.share * 110}%` }} />
            </span>
            <span className="jfuel__calc">34 × {t.perKg} g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateTrain() {
  return (
    <div className="jstate jstate--train">
      <p className="jstate__eyebrow" data-in>
        Wednesday · Ball Control + Speed
      </p>
      <div className="jtrain" data-in>
        <MiniDrillRow id="cone-weave" />
        <MiniDrillRow id="quick-feet-ladder" />
      </div>
      <span className="jbutton" data-in>
        Start drill →
      </span>
    </div>
  );
}

function StateCheck() {
  return (
    <div className="jstate jstate--check">
      <div className="jcheck" data-in>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ring-track)" strokeWidth="9" />
          <circle
            data-ring
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--volt-500)"
            strokeWidth="9"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            transform="rotate(-90 60 60)"
          />
          <path
            data-tick
            d="M40 61l13 13 27-28"
            fill="none"
            stroke="var(--ink-900)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
          />
        </svg>
      </div>
      <p className="jcheck__title" data-in>
        Session complete!
      </p>
      <p className="jcheck__sub" data-in>
        That’s 7 days in a row. <MiniStreakDots filled={7} />
      </p>
    </div>
  );
}

function StateProgress() {
  return (
    <div className="jstate jstate--progress">
      <p className="jstate__eyebrow" data-in>
        This week
      </p>
      <p className="jprog__headline" data-in>
        You trained <b>4 days</b> this week.
      </p>
      <div className="jprog__chart" data-in>
        <MiniWeekBars />
      </div>
    </div>
  );
}

const STATES = [StateProfile, StateFuel, StateTrain, StateCheck, StateProgress];

function Window({ active, streak }: { active: number; streak: number }) {
  return (
    <MiniWindow url={STEPS[active].url} className="jwindow">
      <div className="jwin">
        <nav className="jwin__rail" aria-hidden="true">
          <span className="jwin__rail-ind" style={{ transform: `translateY(${active * 48}px)` }} />
          {RAIL.map((Icon, i) => (
            <span key={i} className="jwin__rail-item" data-on={i === active || undefined}>
              {i === 2 ? <Cone size={18} /> : <Icon size={18} />}
            </span>
          ))}
        </nav>
        <div className="jwin__main">
          <header className="jwin__head">
            <span className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              S
            </span>
            <span className="jwin__who">
              <b>Sam</b>
              <small>Winger · Developing</small>
            </span>
            <span className="jwin__streak" data-bump={streak}>
              <span key={streak} className="jwin__streak-num">
                {streak}
              </span>
              <small>day streak</small>
            </span>
          </header>
          <div className="jwin__stage">
            {STATES.map((S, i) => (
              <div key={i} className="jwin__layer" data-layer={i} data-active={i === active || undefined}>
                <S />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniWindow>
  );
}

/**
 * The player's journey as a pinned, scroll-controlled sequence. One app
 * window stays on screen while its contents morph through five states;
 * the rail indicator, URL and streak are persistent UI that update in
 * place. Normal scrolling resumes after the last state.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const activeRef = useRef(0);

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const layers = q('[data-layer]');
      const texts = q('[data-step-text]');

      layers.forEach((layer, i) => {
        if (i > 0) gsap.set(layer, { autoAlpha: 0 });
        if (i > 0) gsap.set(layer.querySelectorAll('[data-in]'), { opacity: 0, y: 26, filter: 'blur(6px)' });
      });
      texts.forEach((t, i) => i > 0 && gsap.set(t, { autoAlpha: 0, y: 40 }));
      gsap.set(q('[data-grow]'), { scaleX: 0, transformOrigin: '0 50%' });
      gsap.set(q('[data-ring], [data-tick]'), { strokeDashoffset: 1 });
      gsap.set(q('[data-bar]'), { scaleY: 0, transformOrigin: '50% 100%' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (STEPS.length + 0.4)}`,
          pin: q('.journey__pin')[0],
          scrub: 0.7,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length * 0.999));
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
            }
          },
        },
      });

      // The first state rises out of the chalk curtain, then holds for a beat.
      tl.from(q('.journey__copy > *'), { opacity: 0, y: 40, stagger: 0.05, duration: 0.4, ease: EASE })
        .from(q('.journey__visual'), { opacity: 0, y: 60, scale: 0.96, duration: 0.5, ease: EASE }, 0.05)
        .to({}, { duration: 0.35 });

      for (let i = 1; i < STEPS.length; i++) {
        const prev = layers[i - 1];
        const next = layers[i];
        const at = tl.duration();
        tl.to(
          prev.querySelectorAll('[data-in]'),
          { opacity: 0, y: -22, filter: 'blur(6px)', stagger: 0.04, duration: 0.4, ease: 'power1.in' },
          at,
        )
          .to(prev, { autoAlpha: 0, duration: 0.2 }, at + 0.35)
          .to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 0.45, ease: 'power1.in' }, at)
          .set(next, { autoAlpha: 1 }, at + 0.3)
          .to(
            next.querySelectorAll('[data-in]'),
            { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.06, duration: 0.55, ease: EASE },
            at + 0.3,
          )
          .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.55, ease: EASE }, at + 0.35);

        if (i === 1) tl.to(next.querySelectorAll('[data-grow]'), { scaleX: 1, stagger: 0.08, duration: 0.6, ease: EASE }, at + 0.55);
        if (i === 3) {
          tl.to(next.querySelector('[data-ring]'), { strokeDashoffset: 0, duration: 0.7, ease: EASE }, at + 0.4).to(
            next.querySelector('[data-tick]'),
            { strokeDashoffset: 0, duration: 0.35, ease: EASE },
            at + 0.9,
          );
        }
        if (i === 4) tl.to(next.querySelectorAll('[data-bar]'), { scaleY: 1, stagger: 0.06, duration: 0.6, ease: EASE }, at + 0.45);
        tl.to({}, { duration: 0.55 });
      }
    },
    { scope: root, dependencies: [reduced] },
  );

  if (reduced) {
    return (
      <section className="journey journey--static" aria-labelledby="journey-title">
        <div className="journey__intro">
          <p className="eyebrow">The player’s journey</p>
          <h2 id="journey-title" className="display">
            Five questions. <em className="serif">One app.</em>
          </h2>
        </div>
        <ol className="journey__static-list">
          {STEPS.map((s, i) => {
            const S = STATES[i];
            return (
              <li key={s.q} className="journey__static-item">
                <div>
                  <span className="journey__num">0{i + 1}</span>
                  <h3 className="h2">{s.q}</h3>
                  <p className="lede">{s.a}</p>
                </div>
                <MiniWindow url={s.url} className="jwindow jwindow--static">
                  <S />
                </MiniWindow>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section ref={root} className="journey" aria-labelledby="journey-title">
      <div className="journey__pin">
        <div className="journey__copy">
          <p className="eyebrow">The player’s journey</p>
          <h2 id="journey-title" className="journey__title">
            Five questions. <em className="serif">One app.</em>
          </h2>
          <div className="journey__steps">
            {STEPS.map((s, i) => (
              <div key={s.q} className="journey__step" data-step-text>
                <span className="journey__num">
                  0{i + 1}
                  <span> / 05</span>
                </span>
                <h3 className="journey__q">{s.q}</h3>
                <p className="journey__a">{s.a}</p>
              </div>
            ))}
          </div>
          <ol className="journey__dots" aria-label="Journey progress">
            {STEPS.map((s, i) => (
              <li key={s.q} data-on={i <= active || undefined} data-current={i === active || undefined}>
                <span className="visually-hidden">
                  Step {i + 1}: {s.q}
                  {i === active ? ' (current)' : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="journey__visual">
          <Window active={active} streak={active >= 3 ? 7 : 6} />
        </div>
      </div>
    </section>
  );
}
