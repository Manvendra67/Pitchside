import { ArrowUpRight } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { DrillDiagram } from '@/components/DrillDiagram';
import { ProgressRing } from '@/components/ProgressRing';
import { DRILL_BY_ID, DRILLS } from '@/data/drills';
import { CATEGORIES, POSITIONS } from '@/data/positions';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { MiniFuelBars, MiniStreakDots } from './Mini';

interface Feature {
  key: string;
  label: string;
  title: string;
  body: string;
  meta: string[];
  to: string;
  art: ReactNode;
}

const FEATURES: Feature[] = [
  {
    key: 'profile',
    label: 'Profile',
    title: 'Tell us about your game',
    body: 'Your position, your level, your weight. It takes less than a minute.',
    meta: ['5 positions', '3 skill levels', 'Saved on your device'],
    to: '/start',
    art: (
      <div className="how-art how-art--profile">
        {POSITIONS.map((p, i) => (
          <span key={p.id} data-on={i === 3 || undefined}>
            {p.name}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: 'fuel',
    label: 'Fuel',
    title: 'Know what to eat',
    body: 'Daily carbs, protein and fats, sized to your body weight. Fuel for training — not a diet.',
    meta: ['Scales with you', 'Training & rest days', 'Based on published guidance'],
    to: '/nutrition',
    art: (
      <div className="how-art how-art--fuel">
        <MiniFuelBars />
      </div>
    ),
  },
  {
    key: 'drills',
    label: 'Drills',
    title: 'Train with a plan',
    body: 'Coach-reviewed drills for your position, grouped into a simple weekly plan.',
    meta: [`${DRILLS.length} drills`, `${CATEGORIES.length} categories`, 'New ones from player ideas'],
    to: '/drills',
    art: (
      <div className="how-art how-art--drill">
        <DrillDiagram diagram={DRILL_BY_ID['dribble-finish'].diagram} />
      </div>
    ),
  },
  {
    key: 'progress',
    label: 'Progress',
    title: 'See yourself improve',
    body: 'Check in each day, keep your streak, and unlock milestones as you go.',
    meta: ['Daily check-in', 'Training calendar', 'Milestones'],
    to: '/progress',
    art: (
      <div className="how-art how-art--progress">
        <ProgressRing value={0.8} size={112} stroke={11} color="var(--volt-500)" ticks={20}>
          <span className="how-art__ring-num">4/5</span>
        </ProgressRing>
        <MiniStreakDots filled={6} />
      </div>
    ),
  },
];

/**
 * Four large cards, one per stage of the journey. They reveal with a
 * stagger, drift at slightly different speeds, and a single indicator in
 * the index above follows whichever card you're exploring.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  useReveal(root);

  const focus = (i: number) => {
    setActive(i);
    const tab = root.current?.querySelectorAll<HTMLElement>('.how__index-item')[i];
    const ind = indicator.current;
    if (!tab || !ind) return;
    const props = { x: tab.offsetLeft, width: tab.offsetWidth };
    if (prefersReducedMotion()) gsap.set(ind, props);
    else gsap.to(ind, { ...props, duration: 0.4, ease: 'settle', overwrite: true });
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const first = q('.how__index-item')[0] as HTMLElement | undefined;
      if (first && indicator.current) gsap.set(indicator.current, { x: first.offsetLeft, width: first.offsetWidth });
      if (prefersReducedMotion()) return;
      // Subtle multi-speed parallax between the two columns.
      q('.how-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: i % 2 ? 60 : 20 },
          {
            y: i % 2 ? -30 : -10,
            ease: 'none',
            scrollTrigger: { trigger: q('.how__grid')[0], start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how" className="how" aria-labelledby="how-title">
      <div className="container">
        <div className="how__head">
          <p className="eyebrow" data-reveal="fade">
            How Pitchside works
          </p>
          <h2 id="how-title" className="display" data-reveal="mask">
            Four steps. <em className="serif">Every day.</em>
          </h2>
          <div className="how__index" data-reveal="up" role="presentation">
            <span ref={indicator} className="how__index-ind" aria-hidden="true" />
            {FEATURES.map((f, i) => (
              <span key={f.key} className="how__index-item" data-on={i === active || undefined}>
                <small>0{i + 1}</small> {f.label}
              </span>
            ))}
          </div>
        </div>

        <div className="how__grid">
          {FEATURES.map((f, i) => (
            <div key={f.key} className="how-cell" data-reveal="up">
              <Link
                to={f.to}
                className={`how-card${i === active ? ' is-active' : ''}`}
                data-cursor="Open"
                onMouseEnter={(e) => {
                  focus(i);
                  e.currentTarget.classList.add('is-hot');
                }}
                onMouseLeave={(e) => e.currentTarget.classList.remove('is-hot')}
                onFocus={() => focus(i)}
              >
                <div className="how-card__top">
                  <span className="how-card__num">0{i + 1}</span>
                  <span className="how-card__label">{f.label}</span>
                  <ArrowUpRight className="how-card__arrow" size={22} />
                </div>
                <div className="how-card__art">{f.art}</div>
                <div className="how-card__text">
                  <h3 className="h2">{f.title}</h3>
                  <p>{f.body}</p>
                  <ul className="how-card__meta">
                    {f.meta.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
