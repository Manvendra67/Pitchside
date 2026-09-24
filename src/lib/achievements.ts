import type { PlayerStats } from './stats';

export type BadgeShape = 'shield' | 'circle' | 'hex';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  /** Short word on the badge. */
  mark: string;
  shape: BadgeShape;
  target: number;
  value: (s: PlayerStats) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    name: 'First Session',
    description: 'Complete your first training session.',
    mark: '1',
    shape: 'circle',
    target: 1,
    value: (s) => s.trainedDays,
  },
  {
    id: 'hat-trick',
    name: 'Hat-Trick',
    description: 'Check in 3 days in a row.',
    mark: '3',
    shape: 'hex',
    target: 3,
    value: (s) => s.bestStreak,
  },
  {
    id: 'seven-day-streak',
    name: '7-Day Streak',
    description: 'Keep your streak going for a whole week.',
    mark: '7',
    shape: 'shield',
    target: 7,
    value: (s) => s.bestStreak,
  },
  {
    id: 'ten-drills',
    name: '10 Drills Completed',
    description: 'Finish 10 drills from the library.',
    mark: '10',
    shape: 'circle',
    target: 10,
    value: (s) => s.totalDrills,
  },
  {
    id: 'passing-pro',
    name: 'Passing Pro',
    description: 'Complete 5 passing drills.',
    mark: 'P',
    shape: 'hex',
    target: 5,
    value: (s) => s.byCategory.passing,
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Try drills from 4 different categories.',
    mark: '4',
    shape: 'shield',
    target: 4,
    value: (s) => s.categoriesTried,
  },
  {
    id: 'training-regular',
    name: 'Training Regular',
    description: 'Train at least 3 days a week, for 3 weeks.',
    mark: 'R',
    shape: 'circle',
    target: 3,
    value: (s) => s.weeksWithThree,
  },
  {
    id: 'team-voice',
    name: 'Team Voice',
    description: 'Send Coach Ranvir your first idea.',
    mark: 'V',
    shape: 'hex',
    target: 1,
    value: (s) => s.feedbackSent,
  },
  {
    id: 'twenty-five-drills',
    name: '25 Drills Completed',
    description: 'Finish 25 drills. Real dedication.',
    mark: '25',
    shape: 'shield',
    target: 25,
    value: (s) => s.totalDrills,
  },
];

export interface AchievementStatus {
  achievement: Achievement;
  value: number;
  unlocked: boolean;
  progress: number;
}

export function achievementStatus(stats: PlayerStats): AchievementStatus[] {
  return ACHIEVEMENTS.map((a) => {
    const value = a.value(stats);
    return {
      achievement: a,
      value: Math.min(value, a.target),
      unlocked: value >= a.target,
      progress: Math.min(1, value / a.target),
    };
  });
}

/** The locked achievement the player is closest to. */
export function nextAchievement(stats: PlayerStats): AchievementStatus | undefined {
  return achievementStatus(stats)
    .filter((s) => !s.unlocked)
    .sort((a, b) => b.progress - a.progress)[0];
}
