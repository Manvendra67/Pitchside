import { Moon, Undo2 } from 'lucide-react';
import { useRef } from 'react';
import { WEEKDAYS } from '@/data/positions';
import { addDays, dateKey, startOfWeek } from '@/lib/dates';
import { EASE, gsap, prefersReducedMotion } from '@/lib/motion';
import { currentStreak, isActive, isTrained } from '@/lib/stats';
import { actions, useStore } from '@/lib/store';
import { Button } from './Button';
import { CheckDraw } from './CheckDraw';
import { Counter } from './Counter';
import { Ball } from './Glyphs';
import { ProgressRing } from './ProgressRing';

const STREAK_GOALS = [3, 7, 14, 21, 30, 50, 100];

export function nextStreakGoal(streak: number) {
  return STREAK_GOALS.find((g) => g > streak) ?? streak + 10;
}

/** Monday–Sunday strip: ball = trained, moon = rest, ring = today. */
export function WeekDots({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { activity } = useStore();
  const start = startOfWeek();
  const today = dateKey();
  return (
    <ol className={`week-dots week-dots--${size}`} aria-label="This week">
      {WEEKDAYS.map((label, i) => {
        const key = dateKey(addDays(start, i));
        const day = activity[key];
        const state = isTrained(day)
          ? 'trained'
          : day?.checkIn === 'rest'
            ? 'rest'
            : key === today
              ? 'today'
              : key > today
                ? 'future'
                : 'missed';
        return (
          <li key={label} className="week-dots__day" data-state={state} data-today={key === today || undefined}>
            <span className="week-dots__dot" data-dot={key}>
              {state === 'trained' && <Ball size={size === 'sm' ? 16 : 20} />}
              {state === 'rest' && <Moon size={size === 'sm' ? 12 : 14} />}
            </span>
            <span className="week-dots__label">{label.slice(0, 1)}</span>
            <span className="visually-hidden">
              {label}: {state === 'future' ? 'coming up' : state}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "Keep your streak alive". One big button to check in. When pressed the
 * checkmark draws, today's dot pops in, the ring fills and the number
 * counts up — satisfying, but over in under a second.
 */
export function CheckInCard({ className = '' }: { className?: string }) {
  const { activity } = useStore();
  const root = useRef<HTMLElement>(null);
  const todayKey = dateKey();
  const today = activity[todayKey];
  const done = isActive(today);
  const streak = currentStreak(activity);
  const goal = nextStreakGoal(streak);
  const prevGoal = [...STREAK_GOALS].reverse().find((g) => g <= streak) ?? 0;
  const progress = (streak - prevGoal) / (goal - prevGoal);

  const celebrate = () => {
    if (prefersReducedMotion() || !root.current) return;
    requestAnimationFrame(() => {
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(`[data-dot="${todayKey}"]`), { scale: 0.2 }, { scale: 1, duration: 0.7, ease: 'back.out(3)' });
      gsap.fromTo(q('.checkin__glow'), { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.6, duration: 1, ease: EASE });
      gsap.fromTo(q('.checkin__num'), { y: -6 }, { y: 0, duration: 0.6, ease: 'settle' });
    });
  };

  const check = (kind: 'trained' | 'rest') => {
    actions.checkIn(kind);
    celebrate();
  };

  return (
    <section ref={root} className={`card checkin ${done ? 'is-done' : ''} ${className}`} aria-labelledby="checkin-title">
      <span className="checkin__glow" aria-hidden="true" />
      <div className="card__head">
        <h2 id="checkin-title" className="card__title">
          Keep your streak alive
        </h2>
        <span className="chip">{done ? 'Checked in' : 'Not checked in yet'}</span>
      </div>
      <div className="checkin__body">
        <ProgressRing
          value={progress}
          size={148}
          stroke={12}
          color="var(--volt-500)"
          ticks={goal - prevGoal <= 14 ? goal - prevGoal : 0}
          label={`${streak} day streak`}
        >
          <span className="checkin__num">
            <Counter value={streak} className="big-num" />
          </span>
          <span className="checkin__unit">day streak</span>
        </ProgressRing>
        <div className="checkin__side">
          <p className="checkin__goal">
            {goal - streak === 1 ? (
              <>
                <b>1 more day</b> to a {goal}-day streak.
              </>
            ) : (
              <>
                <b>{goal - streak} more days</b> to a {goal}-day streak.
              </>
            )}
          </p>
          <WeekDots />
        </div>
      </div>
      <div className="checkin__actions">
        {done ? (
          <>
            <p className="checkin__status">
              <span className="checkin__tick">
                <CheckDraw done size={18} />
              </span>
              {today?.checkIn === 'rest' && !isTrained(today) ? 'Rest day logged. Recovery counts!' : 'Trained today. See you tomorrow!'}
            </p>
            {today?.drills.length === 0 && today.planSessions.length === 0 && (
              <button type="button" className="text-link checkin__undo" onClick={() => actions.undoCheckIn()}>
                <Undo2 size={14} /> Undo
              </button>
            )}
          </>
        ) : (
          <>
            <Button variant="primary" size="lg" magnetic className="checkin__main" onClick={() => check('trained')}>
              I trained today
            </Button>
            <Button variant="secondary" size="lg" iconLeft={<Moon size={18} />} onClick={() => check('rest')}>
              Rest day
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
