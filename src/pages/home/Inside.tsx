import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AchievementBadge } from '@/components/AchievementBadge';
import { CheckDraw } from '@/components/CheckDraw';
import { DrillDiagram } from '@/components/DrillDiagram';
import { Ball } from '@/components/Glyphs';
import { Segmented } from '@/components/Segmented';
import { CategoryTag, FeedbackTag } from '@/components/Tags';
import { ARTICLES } from '@/data/articles';
import { COACH } from '@/data/coach';
import { DRILL_BY_ID } from '@/data/drills';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useIsMobile, useReducedMotion } from '@/lib/hooks';
import { EASE, Flip, gsap, scrollState, ScrollTrigger, useGSAP } from '@/lib/motion';
import type { CategoryId } from '@/lib/types';

/* ── Panel 1: drill library with animated filtering ───────── */

const LIB_FILTERS: { value: 'all' | CategoryId; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'passing', label: 'Passing' },
  { value: 'ball-control', label: 'Control' },
];
const LIB_DRILLS = ['cone-weave', 'target-corners', 'gate-passing', 'rebound-rush', 'wall-one-two', 'cone-gate-1v1'].map(
  (id) => DRILL_BY_ID[id],
);

function LibraryPanel({ active, still }: { active: boolean; still: boolean }) {
  const [filter, setFilter] = useState<(typeof LIB_FILTERS)[number]['value']>('all');
  const grid = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);

  const change = (v: typeof filter) => {
    if (grid.current && !still) flip.current = Flip.getState(grid.current.children);
    setFilter(v);
  };

  useEffect(() => {
    if (!active || still) return;
    const id = window.setInterval(() => {
      const i = LIB_FILTERS.findIndex((f) => f.value === filter);
      change(LIB_FILTERS[(i + 1) % LIB_FILTERS.length].value);
    }, 2000);
    return () => window.clearInterval(id);
  });

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, { duration: 0.65, ease: EASE, scale: true, nested: true });
    flip.current = null;
  }, [filter]);

  const ranked = LIB_DRILLS.map((d, i) => ({ d, match: filter === 'all' || d.category === filter, i })).sort(
    (a, b) => Number(b.match) - Number(a.match) || a.i - b.i,
  );

  return (
    <div className="ipanel__ui ilib">
      <Segmented options={LIB_FILTERS} value={filter} onChange={change} label="Drill category" size="sm" />
      <div ref={grid} className="ilib__grid">
        {LIB_DRILLS.map((d) => {
          const r = ranked.findIndex((x) => x.d.id === d.id);
          const match = ranked[r].match;
          return (
            <div key={d.id} className="ilib__card" data-flip-id={d.id} data-dim={!match || undefined} style={{ order: r }}>
              <div className="ilib__thumb">
                <DrillDiagram diagram={d.diagram} />
              </div>
              <div className="ilib__text">
                <CategoryTag id={d.category} />
                <b>{d.name}</b>
                {d.source.type === 'player-feedback' && <FeedbackTag label="Player requested" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Panel 2: weekly plan ticking off ──────────────────────── */

const PLAN = [
  { day: 'Mon', theme: 'Ball Control', min: 21 },
  { day: 'Wed', theme: 'Speed', min: 22 },
  { day: 'Fri', theme: 'Crossing', min: 26 },
  { day: 'Sat', theme: 'Finishing', min: 30 },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function PlanPanel({ active, still }: { active: boolean; still: boolean }) {
  const [done, setDone] = useState(still ? 3 : 0);
  useEffect(() => {
    if (!active || still) return;
    const id = window.setInterval(() => setDone((d) => (d >= PLAN.length + 2 ? 0 : d + 1)), 900);
    return () => window.clearInterval(id);
  }, [active, still]);
  const count = Math.min(done, PLAN.length);

  return (
    <div className="ipanel__ui iplan">
      <div className="iplan__week">
        {DAYS.map((day) => {
          const idx = PLAN.findIndex((p) => p.day === day);
          const s = PLAN[idx];
          if (!s)
            return (
              <div key={day} className="iplan__day iplan__day--rest">
                <span className="iplan__dname">{day}</span>
                <span className="iplan__rest">Rest</span>
              </div>
            );
          const isDone = idx < count;
          return (
            <div key={day} className="iplan__day" data-done={isDone || undefined}>
              <span className="iplan__dname">{day}</span>
              <span className="iplan__theme">{s.theme}</span>
              <span className="iplan__min">{s.min} min</span>
              <span className="iplan__check">
                <CheckDraw done={isDone} size={16} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="iplan__foot">
        <span className="iplan__bar">
          <i style={{ transform: `scaleX(${count / PLAN.length})` }} />
        </span>
        <span className="iplan__count">
          {count} of {PLAN.length} sessions
        </span>
      </div>
    </div>
  );
}

/* ── Panel 3: coach feedback with typing reveal ─────────────── */

const CHAT = [
  { from: 'coach', text: 'Great improvement this week, Sam.' },
  { from: 'coach', text: 'Keep your first touch close — one step in front of you.' },
  { from: 'player', text: 'Can I get more finishing drills?' },
  { from: 'coach', text: 'Good idea. Try Rebound Rush — players asked for it too.' },
];

function Words({ text }: { text: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    gsap.from(el.current!.children, { opacity: 0, y: 6, filter: 'blur(4px)', duration: 0.4, stagger: 0.035, ease: EASE });
  });
  return (
    <span ref={el}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="iword">
          {w}{' '}
        </span>
      ))}
    </span>
  );
}

function CoachPanel({ active, still }: { active: boolean; still: boolean }) {
  const [shown, setShown] = useState(still ? CHAT.length : 0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!active || still) return;
    let cancelled = false;
    let t: number;
    const step = (n: number) => {
      if (cancelled) return;
      if (n >= CHAT.length) {
        t = window.setTimeout(() => {
          setShown(0);
          step(0);
        }, 3200);
        return;
      }
      setTyping(true);
      t = window.setTimeout(
        () => {
          setTyping(false);
          setShown(n + 1);
          t = window.setTimeout(() => step(n + 1), 900);
        },
        CHAT[n].from === 'coach' ? 1000 : 600,
      );
    };
    step(shown >= CHAT.length ? 0 : shown);
    if (shown >= CHAT.length) setShown(0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      setTyping(false);
    };
    // Restarts only when the panel becomes active; `shown` is read once at start.
  }, [active, still]);

  const next = CHAT[shown];
  return (
    <div className="ipanel__ui ichat">
      <div className="ichat__head">
        <span className="coach-badge__avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
          {COACH.initials}
        </span>
        <span>
          <b>{COACH.name}</b>
          <small>Coach-approved notes</small>
        </span>
      </div>
      <div className="ichat__list">
        {CHAT.slice(0, shown).map((m, i) => (
          <p key={i} className={`ibubble ibubble--${m.from}`}>
            {still ? m.text : <Words text={m.text} />}
          </p>
        ))}
        {typing && next && (
          <p className={`ibubble ibubble--${next.from} ibubble--typing`} aria-hidden="true">
            <i />
            <i />
            <i />
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Panel 4: milestones unlocking ──────────────────────────── */

const SHOWN_BADGES = ACHIEVEMENTS.slice(0, 6);

function MilestonesPanel({ active, still }: { active: boolean; still: boolean }) {
  const [unlocked, setUnlocked] = useState(still ? 5 : 3);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || still) return;
    setUnlocked(3);
    const a = window.setTimeout(() => setUnlocked(4), 700);
    const b = window.setTimeout(() => setUnlocked(5), 1500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [active, still]);

  useEffect(() => {
    if (still || unlocked <= 3) return;
    const badge = root.current?.querySelectorAll('.imile__item')[unlocked - 1];
    if (badge)
      gsap.fromTo(
        badge.querySelector('.badge'),
        { scale: 0.5, rotate: -20 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.4)' },
      );
  }, [unlocked, still]);

  return (
    <div ref={root} className="ipanel__ui imile">
      {SHOWN_BADGES.map((a, i) => (
        <div key={a.id} className="imile__item" data-on={i < unlocked || undefined}>
          <AchievementBadge achievement={a} unlocked={i < unlocked} size={64} progress={i < unlocked ? 1 : 0.4} />
          <b>{a.name}</b>
        </div>
      ))}
    </div>
  );
}

/* ── Panel 5: football knowledge ────────────────────────────── */

function KnowledgePanel({ active, still }: { active: boolean; still: boolean }) {
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!bar.current) return;
    if (still) {
      gsap.set(bar.current, { scaleX: 0.62 });
      return;
    }
    if (!active) return;
    const t = gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 3.6, ease: 'none', repeat: -1, repeatDelay: 0.6 });
    return () => {
      t.kill();
    };
  }, [active, still]);
  const [lead, ...rest] = ARTICLES;
  return (
    <div className="ipanel__ui iknow">
      <article className="iknow__lead">
        <span className="iknow__progress">
          <i ref={bar} />
        </span>
        <span className="eyebrow">
          {lead.topic} · {lead.minutes} min read
        </span>
        <b>{lead.title}</b>
        <p>{lead.excerpt}</p>
      </article>
      {rest.slice(0, 3).map((a) => (
        <article key={a.slug} className="iknow__row">
          <BookOpen size={16} />
          <b>{a.title}</b>
          <span>{a.minutes} min</span>
        </article>
      ))}
    </div>
  );
}

const PANELS = [
  {
    key: 'drills',
    title: 'A drill library that listens',
    body: 'Filter by category, position and level. New drills arrive from player ideas.',
    Comp: LibraryPanel,
  },
  {
    key: 'plan',
    title: 'A weekly plan made for you',
    body: 'Sessions picked for your position and level, spread across your training days.',
    Comp: PlanPanel,
  },
  {
    key: 'coach',
    title: 'Notes from a real coach',
    body: 'Short, encouraging, coach-approved feedback. Tell the coach what you want next.',
    Comp: CoachPanel,
  },
  {
    key: 'milestones',
    title: 'Milestones, not medals',
    body: 'Tasteful badges that celebrate habits: first session, streaks, trying new skills.',
    Comp: MilestonesPanel,
  },
  {
    key: 'learn',
    title: 'Football knowledge',
    body: 'Two-minute reads on first touch, warm-ups, fuel, sleep and teamwork.',
    Comp: KnowledgePanel,
  },
];

/**
 * Pinned horizontal sequence. You scroll down; the academy slides sideways.
 * A ball rolls along the progress track underneath — its spin is tied to
 * the distance travelled — and each panel's interface comes alive as it
 * reaches the centre. On phones it becomes a native swipe carousel.
 */
export function Inside() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const horizontal = !mobile && !reduced;

  useGSAP(
    () => {
      if (!horizontal) return;
      const q = gsap.utils.selector(root);
      const track = q('.inside__track')[0] as HTMLElement;
      const ball = q('.inside__ball')[0] as HTMLElement;
      const rail = q('.inside__rail')[0] as HTMLElement;
      const distance = () => track.scrollWidth - window.innerWidth;

      const move = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: q('.inside__pin')[0],
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const w = rail.offsetWidth - 28;
            const x = self.progress * w;
            // Rolling without slipping: angle = distance / radius.
            gsap.set(ball, { x, rotation: (x / 14) * (180 / Math.PI) });
          },
        },
      });

      q('.ipanel').forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: move,
          start: 'left 62%',
          end: 'right 38%',
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
        gsap.from(panel.querySelector('.ipanel__card'), {
          y: 60,
          rotate: 2,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 100%', end: 'left 45%', scrub: true },
        });
      });

      // Velocity-reactive lean — the one place we let speed bend things.
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const tick = () => {
        skew(gsap.utils.clamp(-2.5, 2.5, -scrollState.velocity * 0.12));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [horizontal], revertOnUpdate: true },
  );

  // Phones: play each panel when it scrolls into view inside the carousel.
  useEffect(() => {
    if (horizontal || reduced) return;
    const panels = root.current?.querySelectorAll('.ipanel');
    if (!panels) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.index))),
      { threshold: 0.6 },
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, [horizontal, reduced]);

  return (
    <section ref={root} className={`inside theme-dark${horizontal ? '' : ' inside--swipe'}`} aria-labelledby="inside-title">
      <div className="inside__pin">
        <div className="inside__track" data-lenis-prevent={!horizontal || undefined}>
          <div className="inside__intro">
            <p className="eyebrow">Inside Pitchside</p>
            <h2 id="inside-title" className="display">
              The whole academy, <em className="serif">in your pocket.</em>
            </h2>
            <p className="lede">Everything a young player needs, in one calm place — and nothing they don’t.</p>
            <span className="inside__hint" aria-hidden="true">
              {horizontal ? 'Keep scrolling' : 'Swipe'} <ArrowRight size={16} />
            </span>
          </div>
          {PANELS.map((p, i) => (
            <div key={p.key} className="ipanel" data-index={i} data-active={active === i || undefined}>
              <div className="ipanel__card">
                <div className="ipanel__text">
                  <span className="ipanel__num">0{i + 1}</span>
                  <h3 className="h2">{p.title}</h3>
                  <p>{p.body}</p>
                </div>
                <p.Comp active={active === i} still={reduced} />
              </div>
            </div>
          ))}
        </div>

        {horizontal && (
          <div className="inside__bar" aria-hidden="true">
            <span className="inside__count">
              <b>{String(Math.max(active, 0) + 1).padStart(2, '0')}</b> / {String(PANELS.length).padStart(2, '0')}
            </span>
            <div className="inside__rail">
              <span className="inside__ball">
                <Ball size={28} />
              </span>
            </div>
            <span className="inside__label">{PANELS[Math.max(active, 0)].title}</span>
          </div>
        )}
      </div>
    </section>
  );
}
