import { Info, Moon, Pencil } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/Button';
import { CheckDraw } from '@/components/CheckDraw';
import { DrillDiagram } from '@/components/DrillDiagram';
import { PageHeader } from '@/components/PageHeader';
import { DayPicker } from '@/components/Pickers';
import { ProgressRing } from '@/components/ProgressRing';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toasts';
import { CATEGORY_BY_ID, LEVEL_BY_ID, POSITION_BY_ID, WEEKDAYS_LONG } from '@/data/positions';
import { dateKey, formatShortDate, fromKey } from '@/lib/dates';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, Flip, gsap, prefersReducedMotion } from '@/lib/motion';
import { buildWeekPlan, COOL_DOWN_MINUTES, DEFAULT_TRAINING_DAYS, WARM_UP_MINUTES } from '@/lib/plan';
import { useReveal } from '@/lib/reveal';
import { actions, useStore } from '@/lib/store';
import type { Weekday } from '@/lib/types';
import '@/styles/pages.css';

/**
 * Weekly plan. Built from position, level and training days. Sessions can
 * be ticked off on the day (or afterwards) — which also counts as a
 * check-in. Changing training days re-flows the week with Flip.
 */
export default function Plan() {
  useDocumentTitle('Training Plan');
  const { profile, activity } = useStore();
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const week = useRef<HTMLOListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Weekday[]>(profile.trainingDays);
  useReveal(root);

  const plan = useMemo(() => buildWeekPlan(profile), [profile]);
  const todayKey = dateKey();
  const pos = POSITION_BY_ID[profile.position];
  const doneIds = new Set(Object.values(activity).flatMap((d) => d.planSessions));
  const done = plan.sessions.filter((s) => doneIds.has(s.id)).length;
  const minutes = plan.sessions.reduce((sum, s) => sum + s.minutes, 0);

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, { duration: 0.6, ease: EASE, absolute: false, nested: true, scale: false, stagger: 0.02 });
    flip.current = null;
  }, [plan]);

  const saveDays = () => {
    if (week.current && !prefersReducedMotion()) flip.current = Flip.getState(week.current.querySelectorAll('.plan-day'));
    actions.updateProfile({ trainingDays: draft.length ? draft : DEFAULT_TRAINING_DAYS });
    setEditing(false);
    toast({ title: 'Plan updated', body: `${draft.length || DEFAULT_TRAINING_DAYS.length} training days this week.` });
  };

  const toggle = (id: string, date: string, el: HTMLElement) => {
    const wasDone = doneIds.has(id);
    actions.togglePlanSession(id, date);
    if (!wasDone && !prefersReducedMotion()) {
      gsap.fromTo(el.closest('.plan-day'), { scale: 0.98 }, { scale: 1, duration: 0.6, ease: 'settle' });
    }
  };

  return (
    <div ref={root} className="page plan">
      <PageHeader
        eyebrow={`Week of ${formatShortDate(fromKey(plan.weekStart))}`}
        title={
          <>
            Your week, <span className="serif">planned.</span>
          </>
        }
        sub={`Built for a ${pos.name.toLowerCase()} at ${LEVEL_BY_ID[profile.level].name.toLowerCase()} level. ${plan.sessions.length} sessions, about ${minutes} minutes in total.`}
        actions={
          <Button
            variant="secondary"
            size="lg"
            iconLeft={<Pencil size={16} />}
            onClick={() => {
              setDraft(profile.trainingDays.length ? profile.trainingDays : DEFAULT_TRAINING_DAYS);
              setEditing(true);
            }}
          >
            Change training days
          </Button>
        }
      />

      <section className="card plan-summary" data-reveal="up">
        <ProgressRing
          value={done / Math.max(1, plan.sessions.length)}
          size={96}
          stroke={10}
          color="var(--pitch-400)"
          label={`${done} of ${plan.sessions.length} sessions done`}
        >
          <span className="plan-summary__num">
            {done}/{plan.sessions.length}
          </span>
        </ProgressRing>
        <div>
          <p className="plan-summary__title">
            {done === plan.sessions.length
              ? 'Week complete! Brilliant.'
              : done === 0
                ? 'A fresh week. Let’s get going.'
                : `${done} of ${plan.sessions.length} sessions done. Keep it rolling.`}
          </p>
          <p className="muted">
            Every session: {WARM_UP_MINUTES}-minute warm-up, two drills, {COOL_DOWN_MINUTES}-minute cool-down.
          </p>
        </div>
      </section>

      <ol ref={week} className="plan-week">
        {plan.days.map(({ weekday, date, session }) => {
          const isToday = date === todayKey;
          const future = date > todayKey;
          const isDone = session ? doneIds.has(session.id) : false;
          return (
            <li
              key={weekday}
              className={`plan-day${session ? ' plan-day--session' : ' plan-day--rest'}`}
              data-flip-id={`day-${weekday}`}
              data-today={isToday || undefined}
              data-done={isDone || undefined}
              data-reveal="up"
            >
              <div className="plan-day__head">
                <span className="plan-day__name">{WEEKDAYS_LONG[weekday]}</span>
                <span className="plan-day__date">{formatShortDate(fromKey(date))}</span>
                {isToday && <span className="chip chip--volt">Today</span>}
              </div>
              {session ? (
                <>
                  <h2 className="plan-day__theme">{session.theme.name}</h2>
                  <p className="plan-day__blurb">{session.theme.blurb}</p>
                  <ul className="plan-day__drills">
                    {session.drills.map((d) => (
                      <li key={d.id}>
                        <Link to={`/drills/${d.id}`} className="plan-drill" data-cursor="Open">
                          <span className="plan-drill__thumb">
                            <DrillDiagram diagram={d.diagram} />
                          </span>
                          <span className="plan-drill__text">
                            <b>{d.name}</b>
                            <small>
                              {CATEGORY_BY_ID[d.category].short} · {d.duration} min
                            </small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="plan-day__foot">
                    <span className="plan-day__min">{session.minutes} min</span>
                    <button
                      type="button"
                      className="plan-check"
                      aria-pressed={isDone}
                      disabled={future}
                      onClick={(e) => toggle(session.id, date, e.currentTarget)}
                    >
                      <span className="plan-check__box">
                        <CheckDraw done={isDone} size={16} />
                      </span>
                      {future ? 'Coming up' : isDone ? 'Done!' : 'Mark done'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="plan-day__rest">
                  <Moon size={20} />
                  <p>
                    <b>Rest & play</b>
                    Kick about for fun, stretch, sleep well.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <section className="card plan-why" data-reveal="up" aria-labelledby="why-title">
        <h2 id="why-title" className="card__title">
          Why this plan?
        </h2>
        <p>
          {pos.name}s get the most from{' '}
          {pos.focus
            .slice(0, 3)
            .map((c) => CATEGORY_BY_ID[c].name.toLowerCase())
            .join(', ')
            .replace(/, ([^,]*)$/, ' and $1')}
          . Your sessions rotate through these each week, with drills picked for your level.
        </p>
        <p className="note">
          <Info size={18} />
          <span>
            This is a simple guide, not a strict programme. Listen to your body, rest when you’re tired, and always follow your club coach
            and your parents first.
          </span>
        </p>
      </section>

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Your training days"
        description="Pick the days you can train. Your plan re-shuffles to fit."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveDays}>
              Save days
            </Button>
          </>
        }
      >
        <DayPicker value={draft} onChange={setDraft} />
        <p className="muted plan-sheet-hint">
          {draft.length > 5
            ? 'That’s a lot! Make sure you keep at least one rest day.'
            : draft.length === 0
              ? 'Pick at least one day — or we’ll use Mon, Wed and Fri.'
              : `${draft.length} training days a week.`}
        </p>
      </Sheet>
    </div>
  );
}
