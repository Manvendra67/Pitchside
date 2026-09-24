import type { Category, CategoryId, GoalId, Level, Position, PositionId } from '@/lib/types';

export const POSITIONS: Position[] = [
  {
    id: 'goalkeeper',
    name: 'Goalkeeper',
    short: 'GK',
    blurb: 'Last line. First attacker.',
    spot: [8, 32],
    focus: ['goalkeeping', 'speed-agility', 'passing'],
  },
  {
    id: 'defender',
    name: 'Defender',
    short: 'DEF',
    blurb: 'Read the play. Win it back.',
    spot: [28, 32],
    focus: ['defending', 'passing', 'speed-agility', 'ball-control'],
  },
  {
    id: 'midfielder',
    name: 'Midfielder',
    short: 'MID',
    blurb: 'Scan, pass, run the game.',
    spot: [50, 32],
    focus: ['passing', 'ball-control', 'speed-agility', 'finishing'],
  },
  {
    id: 'winger',
    name: 'Winger',
    short: 'WNG',
    blurb: 'Beat your player. Create chances.',
    spot: [70, 12],
    focus: ['ball-control', 'speed-agility', 'passing', 'finishing'],
  },
  {
    id: 'striker',
    name: 'Striker',
    short: 'ST',
    blurb: 'Find space. Finish chances.',
    spot: [82, 32],
    focus: ['finishing', 'ball-control', 'speed-agility', 'passing'],
  },
];

export const POSITION_BY_ID = Object.fromEntries(POSITIONS.map((p) => [p.id, p])) as Record<PositionId, Position>;

export const CATEGORIES: Category[] = [
  {
    id: 'ball-control',
    name: 'Ball Control',
    short: 'Control',
    blurb: 'Keep the ball close and do what you want with it.',
    tone: '--cat-control',
  },
  {
    id: 'passing',
    name: 'Passing',
    short: 'Passing',
    blurb: 'Find a teammate, every time.',
    tone: '--cat-passing',
  },
  {
    id: 'finishing',
    name: 'Finishing',
    short: 'Finishing',
    blurb: 'Pick a corner. Hit the target.',
    tone: '--cat-finishing',
  },
  {
    id: 'speed-agility',
    name: 'Speed & Agility',
    short: 'Speed',
    blurb: 'Quick feet, quick turns, quick thinking.',
    tone: '--cat-speed',
  },
  {
    id: 'defending',
    name: 'Defending',
    short: 'Defending',
    blurb: 'Stay calm, stay on your feet, win it back.',
    tone: '--cat-defending',
  },
  {
    id: 'goalkeeping',
    name: 'Goalkeeping',
    short: 'Keeping',
    blurb: 'Safe hands, brave feet, loud voice.',
    tone: '--cat-keeping',
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export const LEVELS: { id: Level; name: string; blurb: string; bars: number }[] = [
  { id: 'beginner', name: 'Beginner', blurb: 'Just getting started', bars: 1 },
  { id: 'developing', name: 'Developing', blurb: 'I play for a team', bars: 2 },
  { id: 'advanced', name: 'Advanced', blurb: 'I want a real challenge', bars: 3 },
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l])) as Record<Level, (typeof LEVELS)[number]>;

export const GOALS: { id: GoalId; name: string }[] = [
  { id: 'first-touch', name: 'Better first touch' },
  { id: 'shooting', name: 'Score more goals' },
  { id: 'speed', name: 'Get quicker' },
  { id: 'passing', name: 'Sharper passing' },
  { id: 'defending', name: 'Win the ball back' },
  { id: 'saves', name: 'Make more saves' },
  { id: 'confidence', name: 'Feel more confident' },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
