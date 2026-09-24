import { DRILL_BY_ID } from '@/data/drills';
import { addDays, addDaysKey, dateKey, fromKey, startOfWeek } from './dates';
import type { CategoryId, DayLog, PitchsideState } from './types';

export function isActive(day?: DayLog): boolean {
  return !!day && (!!day.checkIn || day.drills.length > 0 || day.planSessions.length > 0);
}

export function isTrained(day?: DayLog): boolean {
  return !!day && (day.checkIn === 'trained' || day.drills.length > 0 || day.planSessions.length > 0);
}

/**
 * Consecutive active days. Rest-day check-ins count, because rest is part
 * of training. If today has no check-in yet, the streak is still alive from
 * yesterday.
 */
export function currentStreak(activity: Record<string, DayLog>, today = dateKey()): number {
  let key = isActive(activity[today]) ? today : addDaysKey(today, -1);
  let n = 0;
  while (isActive(activity[key])) {
    n += 1;
    key = addDaysKey(key, -1);
  }
  return n;
}

export function bestStreak(activity: Record<string, DayLog>): number {
  const keys = Object.keys(activity)
    .filter((k) => isActive(activity[k]))
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    run = prev && addDaysKey(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

export function trainedDaysInWeek(activity: Record<string, DayLog>, weekStart: Date): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (isTrained(activity[dateKey(addDays(weekStart, i))])) n++;
  return n;
}

export function weeklyHistory(activity: Record<string, DayLog>, weeks = 6, today = new Date()) {
  const thisWeek = startOfWeek(today);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i));
    return { weekStart: dateKey(start), start, trained: trainedDaysInWeek(activity, start) };
  });
}

export interface PlayerStats {
  streak: number;
  bestStreak: number;
  trainedDays: number;
  totalDrills: number;
  minutes: number;
  byCategory: Record<CategoryId, number>;
  categoriesTried: number;
  thisWeek: number;
  weeksWithThree: number;
  feedbackSent: number;
  articlesRead: number;
}

export function computeStats(state: PitchsideState, today = new Date()): PlayerStats {
  const byCategory: Record<CategoryId, number> = {
    'ball-control': 0,
    passing: 0,
    finishing: 0,
    'speed-agility': 0,
    defending: 0,
    goalkeeping: 0,
  };
  let totalDrills = 0;
  let seconds = 0;
  let trainedDays = 0;
  const weekCounts = new Map<string, number>();

  for (const [key, day] of Object.entries(state.activity)) {
    if (isTrained(day)) {
      trainedDays++;
      const wk = dateKey(startOfWeek(fromKey(key)));
      weekCounts.set(wk, (weekCounts.get(wk) ?? 0) + 1);
    }
    for (const log of day.drills) {
      totalDrills++;
      seconds += log.seconds;
      const drill = DRILL_BY_ID[log.id];
      if (drill) byCategory[drill.category]++;
    }
  }

  return {
    streak: currentStreak(state.activity, dateKey(today)),
    bestStreak: bestStreak(state.activity),
    trainedDays,
    totalDrills,
    minutes: Math.round(seconds / 60),
    byCategory,
    categoriesTried: Object.values(byCategory).filter((n) => n > 0).length,
    thisWeek: trainedDaysInWeek(state.activity, startOfWeek(today)),
    weeksWithThree: [...weekCounts.values()].filter((n) => n >= 3).length,
    feedbackSent: state.feedback.length,
    articlesRead: state.readArticles.length,
  };
}

export function weekSummary(days: number): string {
  if (days === 0) return 'A fresh week. Your first session is waiting.';
  if (days === 1) return 'You trained 1 day this week. Great start.';
  if (days <= 3) return `You trained ${days} days this week. Nice rhythm.`;
  if (days <= 5) return `You trained ${days} days this week. That's a proper footballer's week.`;
  return `You trained ${days} days this week. Remember to rest too.`;
}
