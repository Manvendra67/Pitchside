import { DRILLS } from '@/data/drills';
import { addDays, dateKey, startOfWeek } from './dates';
import type { CategoryId, Drill, Level, PlayerProfile, PositionId, Weekday } from './types';

/**
 * Weekly plan generator.
 *
 * Each position gets four session themes. Themes are spread across the
 * player's training days, and each session picks one main drill and one
 * support drill that match the player's position and skill level. Plans are
 * a simple, age-appropriate guide — not a performance prescription.
 */

export interface SessionTheme {
  id: string;
  name: string;
  blurb: string;
  main: CategoryId;
  support: CategoryId;
  /** Drills to try first for this theme, if the level fits. */
  prefer?: string[];
}

const THEMES: Record<PositionId, SessionTheme[]> = {
  goalkeeper: [
    {
      id: 'gk-reactions',
      name: 'Reactions',
      blurb: 'Quick hands, quick eyes.',
      main: 'goalkeeping',
      support: 'speed-agility',
      prefer: ['reaction-saves'],
    },
    {
      id: 'gk-handling',
      name: 'Handling',
      blurb: 'Safe hands, every time.',
      main: 'goalkeeping',
      support: 'passing',
      prefer: ['ready-scoop'],
    },
    {
      id: 'gk-positioning',
      name: 'Positioning',
      blurb: 'Be in the right place early.',
      main: 'goalkeeping',
      support: 'speed-agility',
      prefer: ['keeper-shuffle-dive'],
    },
    {
      id: 'gk-footwork',
      name: 'Footwork',
      blurb: 'Light feet, ready to move.',
      main: 'speed-agility',
      support: 'goalkeeping',
      prefer: ['quick-feet-ladder'],
    },
  ],
  defender: [
    { id: 'def-1v1', name: '1v1 Defending', blurb: 'Stay on your feet, stay patient.', main: 'defending', support: 'speed-agility' },
    { id: 'def-passing', name: 'Passing Out', blurb: 'Calm passes from the back.', main: 'passing', support: 'ball-control' },
    { id: 'def-recovery', name: 'Recovery Speed', blurb: 'Get back, get goal-side.', main: 'speed-agility', support: 'defending' },
    { id: 'def-control', name: 'First Touch', blurb: 'Control it under pressure.', main: 'ball-control', support: 'passing' },
  ],
  midfielder: [
    { id: 'mid-passing', name: 'Passing & Scanning', blurb: 'Look, then pass.', main: 'passing', support: 'ball-control' },
    { id: 'mid-control', name: 'Close Control', blurb: 'Keep it in tight spaces.', main: 'ball-control', support: 'speed-agility' },
    { id: 'mid-engine', name: 'Box-to-Box', blurb: 'Quick feet, quick turns.', main: 'speed-agility', support: 'passing' },
    { id: 'mid-shooting', name: 'Shooting from Midfield', blurb: 'Arrive late, shoot early.', main: 'finishing', support: 'ball-control' },
  ],
  winger: [
    { id: 'wng-control', name: 'Ball Control', blurb: 'Keep it close at speed.', main: 'ball-control', support: 'speed-agility' },
    { id: 'wng-speed', name: 'Speed', blurb: 'Win the race down the line.', main: 'speed-agility', support: 'ball-control' },
    { id: 'wng-crossing', name: 'Crossing & Passing', blurb: 'Deliver the final ball.', main: 'passing', support: 'finishing' },
    { id: 'wng-finishing', name: 'Finishing', blurb: 'Cut inside and score.', main: 'finishing', support: 'speed-agility' },
  ],
  striker: [
    { id: 'st-finishing', name: 'Finishing', blurb: 'Pick a corner and hit it.', main: 'finishing', support: 'ball-control' },
    { id: 'st-control', name: 'Hold-Up & Control', blurb: 'Control it, then turn.', main: 'ball-control', support: 'finishing' },
    { id: 'st-sharpness', name: 'Sharpness', blurb: 'First to every ball.', main: 'speed-agility', support: 'finishing' },
    { id: 'st-link', name: 'Link-Up Play', blurb: 'Pass, move, finish.', main: 'passing', support: 'finishing' },
  ],
};

export const LEVEL_RANK: Record<Level, number> = { beginner: 0, developing: 1, advanced: 2 };

export const DEFAULT_TRAINING_DAYS: Weekday[] = [0, 2, 4];

export const WARM_UP_MINUTES = 5;
export const COOL_DOWN_MINUTES = 3;

export interface PlanSession {
  id: string;
  weekday: Weekday;
  date: string;
  theme: SessionTheme;
  drills: Drill[];
  minutes: number;
}

export interface WeekPlan {
  weekStart: string;
  days: { weekday: Weekday; date: string; session?: PlanSession }[];
  sessions: PlanSession[];
}

export function themesFor(position: PositionId): SessionTheme[] {
  return THEMES[position];
}

function fitsPosition(drill: Drill, position: PositionId) {
  return drill.positions.includes(position);
}

/**
 * Pick a drill for a category. Prefers the player's exact level, then easier
 * drills, and only goes harder when nothing else fits. `seed` rotates between
 * equally good drills so the plan changes from week to week.
 */
export function pickDrill(
  category: CategoryId,
  position: PositionId,
  level: Level,
  seed: number,
  exclude: Set<string>,
  prefer: string[] = [],
  pool: Drill[] = DRILLS,
): Drill | undefined {
  const rank = LEVEL_RANK[level];
  const preferred = prefer.map((id) => pool.find((d) => d.id === id)).find((d) => d && !exclude.has(d.id) && LEVEL_RANK[d.level] <= rank);
  if (preferred) return preferred;

  const score = (d: Drill) => {
    const r = LEVEL_RANK[d.level];
    return r <= rank ? rank - r : 10 + (r - rank);
  };
  const choose = (skip: Set<string>) => {
    const inCategory = pool.filter((d) => d.category === category && !skip.has(d.id));
    const forPosition = inCategory.filter((d) => fitsPosition(d, position));
    const list = forPosition.length ? forPosition : inCategory;
    if (!list.length) return undefined;
    const best = Math.min(...list.map(score));
    const top = list.filter((d) => score(d) === best);
    return { drill: top[seed % top.length], score: best };
  };

  // Repeating a drill that fits is better than jumping to one that is too hard.
  let pick = choose(exclude);
  if (!pick || pick.score >= 10) {
    const again = choose(new Set());
    if (again && (!pick || again.score < pick.score)) pick = again;
  }
  return pick?.drill;
}

export function weekIndex(weekStart: Date): number {
  return Math.floor(weekStart.getTime() / (7 * 86_400_000));
}

export function buildWeekPlan(profile: Pick<PlayerProfile, 'position' | 'level' | 'trainingDays'>, when: Date = new Date()): WeekPlan {
  const start = startOfWeek(when);
  const weekStart = dateKey(start);
  const seed = weekIndex(start);
  const trainingDays = (profile.trainingDays.length ? profile.trainingDays : DEFAULT_TRAINING_DAYS).slice().sort((a, b) => a - b);
  const themes = THEMES[profile.position];

  const used = new Set<string>();
  const sessions: PlanSession[] = trainingDays.map((wd, i) => {
    const theme = themes[(i + seed) % themes.length];
    const main = pickDrill(theme.main, profile.position, profile.level, seed + i, used, theme.prefer);
    if (main) used.add(main.id);
    const support = pickDrill(theme.support, profile.position, profile.level, seed + i + 1, used);
    if (support) used.add(support.id);
    const drills = [main, support].filter(Boolean) as Drill[];
    const date = dateKey(addDays(start, wd));
    return {
      id: `${weekStart}:${wd}`,
      weekday: wd,
      date,
      theme,
      drills,
      minutes: WARM_UP_MINUTES + COOL_DOWN_MINUTES + drills.reduce((s, d) => s + d.duration, 0),
    };
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const wd = i as Weekday;
    return { weekday: wd, date: dateKey(addDays(start, wd)), session: sessions.find((s) => s.weekday === wd) };
  });

  return { weekStart, days, sessions };
}
