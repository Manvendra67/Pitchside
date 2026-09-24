import { ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AchievementBadge } from '@/components/AchievementBadge';
import { CheckInCard } from '@/components/CheckIn';
import { Counter } from '@/components/Counter';
import { Ball } from '@/components/Glyphs';
import { PageHeader } from '@/components/PageHeader';
import { ProgressRing } from '@/components/ProgressRing';
import { Segmented } from '@/components/Segmented';
import { CategoryTag } from '@/components/Tags';
import { DRILL_BY_ID } from '@/data/drills';
import { CATEGORIES, WEEKDAYS } from '@/data/positions';
import { achievementStatus } from '@/lib/achievements';
import { addDays, dateKey, formatLongDate, formatShortDate, fromKey, relativeDay, startOfWeek, weekDates } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { buildWeekPlan } from '@/lib/plan';
import { useReveal } from '@/lib/reveal';
import { computeStats, isTrained, weeklyHistory, weekSummary } from '@/lib/stats';
import { useStore } from '@/lib/store';
import type { DayLog } from '@/lib/types';
import '@/styles/pages.css';

type Tab = 'overview' | 'calendar' | 'milestones';
const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'milestones', label: 'Milestones' },
];

function dayState(day?: DayLog) {
  if (isTrained(day)) return 'trained';
  if (day?.checkIn === 'rest') return 'rest';
  return 'none';
}

/* ── Overview ──────────────────────────────────────────── */

function Overview() {
  const state = useStore();
  const stats = computeStats(state);
  const plan = buildWeekPlan(state.profile);
  const planned = Math.max(1, plan.sessions.length);
  const history = weeklyHistory(state.activity, 8);
  const chart = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !chart.current) return;
      gsap.from(chart.current.querySelectorAll('[data-bar]'), {
        scaleY: 0,
        transformOrigin: '50% 100%',
        duration: 0.9,
        stagger: 0.06,
        ease: EASE,
        scrollTrigger: { trigger: chart.current, start: 'top 85%' },
      });
    },
    { scope: chart },
  );

  const recent = useMemo(
    () =>
      Object.entries(state.activity)
        .flatMap(([key, d]) => d.drills.map((x) => ({ ...x, key })))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 8),
    [state.activity],
  );
  const catMax = Math.max(1, ...Object.values(stats.byCategory));

  return (
    <div className="prog-overview">
      <section className="card card--dark theme-dark prog-hero" data-reveal="up">
        <ProgressRing
          value={stats.thisWeek / planned}
          size={172}
          stroke={14}
          color="var(--volt-400)"
          ticks={7}
          label={`${stats.thisWeek} of ${planned} planned days`}
        >
          <span className="prog-hero__ring-num">
            <Counter value={stats.thisWeek} />
            <small>/{planned}</small>
          </span>
          <span className="prog-hero__ring-label">days this week</span>
        </ProgressRing>
        <div className="prog-hero__text">
          <p className="eyebrow">This week</p>
          <h2 className="prog-hero__headline">{weekSummary(stats.thisWeek)}</h2>
          <dl className="prog-hero__stats">
            <div>
              <dt>Current streak</dt>
              <dd>
                <Counter value={stats.streak} /> <small>days</small>
              </dd>
            </div>
            <div>
              <dt>Best streak</dt>
              <dd>
                <Counter value={stats.bestStreak} /> <small>days</small>
              </dd>
            </div>
            <div>
              <dt>Drills completed</dt>
              <dd>
                <Counter value={stats.totalDrills} />
              </dd>
            </div>
            <div>
              <dt>Minutes trained</dt>
              <dd>
                <Counter value={stats.minutes} />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="prog-row">
        <div data-reveal="up">
          <CheckInCard />
        </div>
        <section className="card prog-weeks" data-reveal="up" aria-labelledby="weeks-title">
          <div className="card__head">
            <h2 id="weeks-title" className="card__title">
              Days trained per week
            </h2>
            <span className="chip">Last 8 weeks</span>
          </div>
          <div
            ref={chart}
            className="prog-chart"
            role="img"
            aria-label={history.map((h) => `Week of ${formatShortDate(h.start)}: ${h.trained} days`).join('. ')}
          >
            <span className="prog-chart__goal" style={{ bottom: `${(planned / 7) * 100}%` }}>
              <small>Your plan: {planned} days</small>
            </span>
            {history.map((h, i) => (
              <span key={h.weekStart} className="prog-chart__col" data-current={i === history.length - 1 || undefined}>
                <span className="prog-chart__val">{h.trained}</span>
                <i data-bar style={{ height: `${Math.max(3, (h.trained / 7) * 100)}%` }} />
                <small>{i === history.length - 1 ? 'Now' : formatShortDate(h.start).replace(' ', ' ')}</small>
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="prog-row prog-row--even">
        <section className="card" data-reveal="up" aria-labelledby="cats-title">
          <div className="card__head">
            <h2 id="cats-title" className="card__title">
              What you’ve worked on
            </h2>
          </div>
          <ul className="prog-cats">
            {CATEGORIES.map((c) => ({ c, n: stats.byCategory[c.id] }))
              .sort((a, b) => b.n - a.n)
              .map(({ c, n }) => (
                <li key={c.id} style={{ ['--tone' as string]: `var(${c.tone})` }}>
                  <span className="prog-cats__name">{c.name}</span>
                  <span className="prog-cats__track">
                    <i style={{ transform: `scaleX(${n / catMax})` }} />
                  </span>
                  <span className="prog-cats__n">{n}</span>
                </li>
              ))}
          </ul>
        </section>
        <section className="card" data-reveal="up" aria-labelledby="recent-title">
          <div className="card__head">
            <h2 id="recent-title" className="card__title">
              Completed drills
            </h2>
            <Link to="/drills" className="text-link">
              Library
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted">No drills yet. Your first one is waiting in the library.</p>
          ) : (
            <ul className="prog-recent">
              {recent.map((r) => {
                const d = DRILL_BY_ID[r.id];
                if (!d) return null;
                return (
                  <li key={r.at + r.id}>
                    <Link to={`/drills/${d.id}`}>
                      <span className="prog-recent__text">
                        <b>{d.name}</b>
                        <CategoryTag id={d.category} />
                      </span>
                      <span className="prog-recent__meta">
                        {relativeDay(r.key)}
                        <small>{Math.max(1, Math.round(r.seconds / 60))} min</small>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Calendar ──────────────────────────────────────────── */

function Calendar() {
  const { activity } = useStore();
  const todayKey = dateKey();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(todayKey);
  const grid = useRef<HTMLDivElement>(null);
  const dir = useRef(0);
  const start = addDays(startOfWeek(), weekOffset * 7);
  const days = weekDates(start);

  useLayoutEffect(() => {
    if (!dir.current || !grid.current || prefersReducedMotion()) return;
    gsap.fromTo(
      grid.current.children,
      { x: 36 * dir.current, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.42, stagger: 0.03, ease: EASE },
    );
  }, [weekOffset]);

  const move = (n: number) => {
    dir.current = n;
    setWeekOffset((w) => Math.min(0, w + n));
    setSelected(dateKey(addDays(start, n * 7 + (n > 0 ? 0 : 6))));
  };

  const sel = activity[selected];
  const heat = useMemo(() => {
    const first = addDays(startOfWeek(), -7 * 5);
    return Array.from({ length: 42 }, (_, i) => {
      const d = addDays(first, i);
      const key = dateKey(d);
      return { key, d, log: activity[key], future: key > todayKey };
    });
  }, [activity, todayKey]);

  const pick = (key: string) => {
    setSelected(key);
    const diff = Math.round((startOfWeek(fromKey(key)).getTime() - startOfWeek().getTime()) / (7 * 86_400_000));
    if (diff !== weekOffset) {
      dir.current = diff > weekOffset ? 1 : -1;
      setWeekOffset(diff);
    }
  };

  return (
    <div className="prog-cal">
      <section className="card cal-week" data-reveal="up" aria-labelledby="cal-title">
        <div className="cal-week__head">
          <button type="button" className="icon-btn icon-btn--lg" aria-label="Previous week" onClick={() => move(-1)}>
            <ChevronLeft size={22} />
          </button>
          <h2 id="cal-title" className="card__title" aria-live="polite">
            {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `Week of ${formatShortDate(start)}`}
            <small>
              {formatShortDate(days[0])} – {formatShortDate(days[6])}
            </small>
          </h2>
          <button
            type="button"
            className="icon-btn icon-btn--lg"
            aria-label="Next week"
            disabled={weekOffset === 0}
            onClick={() => move(1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
        <div ref={grid} className="cal-days" role="listbox" aria-label="Days">
          {days.map((d, i) => {
            const key = dateKey(d);
            const log = activity[key];
            const st = dayState(log);
            const future = key > todayKey;
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={key === selected}
                className="cal-day"
                data-state={st}
                data-today={key === todayKey || undefined}
                disabled={future}
                onClick={() => setSelected(key)}
              >
                <span className="cal-day__wd">{WEEKDAYS[i]}</span>
                <span className="cal-day__num">{d.getDate()}</span>
                <span className="cal-day__icon" aria-hidden="true">
                  {st === 'trained' ? <Ball size={26} /> : st === 'rest' ? <Moon size={18} /> : null}
                </span>
                <span className="cal-day__count">
                  {log?.drills.length
                    ? `${log.drills.length} drill${log.drills.length > 1 ? 's' : ''}`
                    : st === 'rest'
                      ? 'Rest'
                      : future
                        ? ''
                        : '—'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="cal-detail" key={selected}>
          <p className="eyebrow">{formatLongDate(fromKey(selected))}</p>
          {!sel || dayState(sel) === 'none' ? (
            <p className="cal-detail__empty">
              {selected === todayKey ? 'Nothing logged yet today. Check in when you’ve trained!' : 'No training logged on this day.'}
            </p>
          ) : dayState(sel) === 'rest' ? (
            <p className="cal-detail__rest">
              <Moon size={18} /> Rest day. Recovery is part of training.
            </p>
          ) : (
            <>
              <p className="cal-detail__title">
                {sel.drills.length
                  ? `${sel.drills.length} drill${sel.drills.length > 1 ? 's' : ''} · ${Math.round(sel.drills.reduce((s, x) => s + x.seconds, 0) / 60)} minutes`
                  : 'Trained — checked in'}
              </p>
              <ul className="cal-detail__list">
                {sel.drills.map((x) => {
                  const d = DRILL_BY_ID[x.id];
                  return d ? (
                    <li key={x.at}>
                      <Link to={`/drills/${d.id}`}>
                        <b>{d.name}</b>
                        <CategoryTag id={d.category} />
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="card cal-heat" data-reveal="up" aria-labelledby="heat-title">
        <div className="card__head">
          <h2 id="heat-title" className="card__title">
            Last 6 weeks
          </h2>
          <span className="cal-heat__legend" aria-hidden="true">
            <i data-level="0" />
            <i data-level="1" />
            <i data-level="2" />
            <i data-level="3" /> more drills
          </span>
        </div>
        <div className="cal-heat__head" aria-hidden="true">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w.slice(0, 1)}</span>
          ))}
        </div>
        <div className="cal-heat__grid">
          {heat.map(({ key, d, log, future }) => {
            const n = log?.drills.length ?? 0;
            const level = isTrained(log) ? Math.min(3, Math.max(1, n)) : 0;
            return (
              <button
                key={key}
                type="button"
                className="cal-heat__cell"
                data-level={level}
                data-rest={log?.checkIn === 'rest' && !isTrained(log) ? true : undefined}
                data-selected={key === selected || undefined}
                data-today={key === todayKey || undefined}
                disabled={future}
                aria-label={`${formatLongDate(d)}: ${isTrained(log) ? `${n} drills` : log?.checkIn === 'rest' ? 'rest day' : 'no training'}`}
                onClick={() => pick(key)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ── Milestones ────────────────────────────────────────── */

function Milestones() {
  const state = useStore();
  const list = achievementStatus(computeStats(state));
  const root = useRef<HTMLDivElement>(null);
  const unlocked = list.filter((a) => a.unlocked).length;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current!.querySelectorAll('.mile--on .badge'), {
        scale: 0.5,
        rotate: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: 'back.out(2)',
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="miles">
      <p className="miles__summary" data-reveal="up">
        <b>{unlocked}</b> of {list.length} milestones unlocked. They celebrate good habits — not scores.
      </p>
      <div className="miles__grid">
        {list.map(({ achievement: a, unlocked: on, value, progress }) => (
          <article key={a.id} className={`card mile${on ? ' mile--on' : ''}`} data-reveal="up">
            <AchievementBadge achievement={a} unlocked={on} progress={progress} size={76} />
            <div className="mile__text">
              <h2 className="mile__name">{a.name}</h2>
              <p className="mile__desc">{a.description}</p>
              {on ? (
                <span className="chip chip--volt">Unlocked</span>
              ) : (
                <span className="mile__progress">
                  <span className="mile__bar">
                    <i style={{ transform: `scaleX(${progress})` }} />
                  </span>
                  <small>
                    {value} / {a.target}
                  </small>
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function Progress() {
  useDocumentTitle('Progress');
  const state = useStore();
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = raw === 'calendar' || raw === 'milestones' ? raw : 'overview';
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stats = computeStats(state);
  useReveal(root, [tab]);

  useLayoutEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, ease: EASE, clearProps: 'transform' });
  }, [tab]);

  return (
    <div ref={root} className="page progress">
      <PageHeader
        eyebrow="Your progress"
        title={
          <>
            Look how far <span className="serif">you’ve come.</span>
          </>
        }
        sub={`${stats.trainedDays} training days and ${stats.totalDrills} drills so far. Keep showing up — that’s what makes players better.`}
      />
      <Segmented
        role="tablist"
        idBase="progress"
        label="Progress sections"
        size="lg"
        value={tab}
        onChange={(t) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true, preventScrollReset: true })}
        options={TABS}
        className="progress__tabs"
      />
      <div ref={panel} role="tabpanel" id={`progress-panel-${tab}`} aria-labelledby={`progress-tab-${tab}`} className="progress__panel">
        {tab === 'overview' && <Overview />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'milestones' && <Milestones />}
      </div>
    </div>
  );
}
