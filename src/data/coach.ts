import type { FeedbackChoice, PositionId } from '@/lib/types';

export const COACH = {
  name: 'Coach Ranvir',
  role: 'Head of Youth Coaching',
  initials: 'CR',
  bio: 'UEFA-licensed youth coach. Reviews every drill, plan and note on Pitchside before it reaches you.',
};

export interface CoachNote {
  id: string;
  /** Days before today. */
  daysAgo: number;
  topic: string;
  kind: 'tip' | 'praise' | 'focus' | 'reminder';
  /** Shown for every position when omitted. */
  positions?: PositionId[];
  messages: string[];
  drillId?: string;
}

export const COACH_NOTES: CoachNote[] = [
  {
    id: 'week-praise',
    daysAgo: 0,
    topic: 'Great week',
    kind: 'praise',
    messages: [
      'Great improvement this week, {name}.',
      'You kept checking in, even on rest days. That is how good habits are built.',
      'Keep it simple tomorrow: one ball-control drill, then have fun.',
    ],
  },
  {
    id: 'first-touch',
    daysAgo: 2,
    topic: 'First touch',
    kind: 'focus',
    positions: ['defender', 'midfielder', 'winger', 'striker'],
    messages: [
      'Keep your first touch close.',
      'Try to have the ball land one step in front of you — not three.',
      'The Wall Rebound drill is perfect for this. Ten minutes, three times this week.',
    ],
    drillId: 'first-touch-wall',
  },
  {
    id: 'keeper-set',
    daysAgo: 2,
    topic: 'Set position',
    kind: 'focus',
    positions: ['goalkeeper'],
    messages: [
      'Be set before the shot is taken.',
      'Small steps as the attacker gets close, then feet still and knees bent.',
      'Ready Position & Scoop will build this habit.',
    ],
    drillId: 'ready-scoop',
  },
  {
    id: 'look-up',
    daysAgo: 4,
    topic: 'Head up',
    kind: 'tip',
    positions: ['midfielder', 'winger', 'striker', 'defender'],
    messages: [
      'Before the ball comes to you, take a quick look over your shoulder.',
      'Knowing where your teammates are makes your next pass easy.',
    ],
    drillId: 'triangle-scan',
  },
  {
    id: 'warm-up',
    daysAgo: 6,
    topic: 'Warm up first',
    kind: 'reminder',
    messages: [
      'Always warm up for five minutes before you train.',
      'Jog, skip, side-steps and a few gentle stretches. Your body will thank you.',
    ],
  },
  {
    id: 'water',
    daysAgo: 9,
    topic: 'Water breaks',
    kind: 'reminder',
    messages: ['Drink water before you feel thirsty.', 'Take a sip at every break in training — even short ones.'],
  },
  {
    id: 'weak-foot',
    daysAgo: 12,
    topic: 'Your other foot',
    kind: 'tip',
    messages: ['Give your weaker foot a job in every session.', 'Players who can use both feet always have one more option.'],
  },
];

export function notesFor(position: PositionId): CoachNote[] {
  return COACH_NOTES.filter((n) => !n.positions || n.positions.includes(position));
}

export const FEEDBACK_CHOICES: { id: FeedbackChoice; label: string; hint: string }[] = [
  { id: 'more-finishing', label: 'More finishing drills', hint: 'Shooting and scoring' },
  { id: 'harder', label: 'Harder drills', hint: 'I want a challenge' },
  { id: 'easier', label: 'Easier drills', hint: 'Build my basics' },
  { id: 'more-goalkeeper', label: 'More goalkeeper drills', hint: 'Saves and handling' },
  { id: 'solo', label: 'Drills I can do alone', hint: 'At home or in the garden' },
  { id: 'shorter', label: 'Shorter drills', hint: 'Under 10 minutes' },
  { id: 'more-1v1', label: 'More 1v1 skills', hint: 'Beat defenders' },
  { id: 'more-passing', label: 'More passing games', hint: 'With friends' },
];

/** How past requests from players became drills. Newest first. */
export const FEEDBACK_TIMELINE = [
  { drillId: 'keeper-shuffle-dive', request: 'More goalkeeper drills', players: 11 },
  { drillId: 'rebound-rush', request: 'Harder finishing drills', players: 9 },
  { drillId: 'cone-gate-1v1', request: 'More 1v1 moves to beat defenders', players: 14 },
  { drillId: 'solo-passing-square', request: 'Drills I can do on my own', players: 17 },
];
