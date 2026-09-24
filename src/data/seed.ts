import { DRILL_BY_ID } from './drills';
import { addDays, dateKey } from '@/lib/dates';
import { buildWeekPlan } from '@/lib/plan';
import { isTrained } from '@/lib/stats';
import type { DayLog, FeedbackEntry, PitchsideState, PlayerProfile } from '@/lib/types';

/**
 * Sample player so every screen looks complete before onboarding. History is
 * generated relative to today so the demo always feels current: a six-day
 * streak that the player can extend today.
 */

export const DEMO_PROFILE: PlayerProfile = {
  name: 'Sam',
  position: 'winger',
  level: 'developing',
  weightKg: 34,
  age: 11,
  trainingDays: [0, 2, 4, 5],
  goals: ['first-touch', 'speed'],
  createdAt: '2026-08-01',
  isDemo: true,
};

type SeedDay = [offset: number, kind: 'trained' | 'rest', drills: string[]];

const HISTORY: SeedDay[] = [
  [-1, 'trained', ['cone-weave', 'quick-feet-ladder']],
  [-2, 'rest', []],
  [-3, 'trained', ['first-touch-wall', 'target-corners']],
  [-4, 'trained', ['gate-passing']],
  [-5, 'rest', []],
  [-6, 'trained', ['dribble-finish', 'reaction-sprints']],
  [-8, 'trained', ['toe-tap-rhythm', 'cone-weave']],
  [-9, 'rest', []],
  [-10, 'trained', ['wall-one-two', 'quick-feet-ladder']],
  [-11, 'trained', ['target-corners']],
  [-13, 'trained', ['juggling-ladder', 'reaction-sprints']],
  [-14, 'rest', []],
  [-15, 'trained', ['gate-passing', 'first-touch-wall']],
  [-17, 'trained', ['cone-weave', 'dribble-finish']],
  [-18, 'trained', []],
  [-20, 'trained', ['quick-feet-ladder', 'toe-tap-rhythm']],
  [-22, 'trained', ['target-corners']],
  [-24, 'trained', ['cone-weave']],
  // Earlier weeks: club training nights, checked in without app drills.
  [-27, 'trained', []],
  [-29, 'trained', []],
  [-31, 'rest', []],
  [-32, 'trained', []],
  [-35, 'trained', []],
  [-38, 'trained', []],
  [-40, 'trained', []],
  [-43, 'trained', []],
  [-45, 'trained', []],
  [-48, 'trained', []],
];

export function seedActivity(profile: PlayerProfile, today = new Date()): Record<string, DayLog> {
  const activity: Record<string, DayLog> = {};
  HISTORY.forEach(([offset, kind, drills], i) => {
    const day = addDays(today, offset);
    day.setHours(17, 10 + (i % 4) * 7, 0, 0);
    const key = dateKey(day);
    activity[key] = {
      checkIn: kind,
      drills: drills.map((id, j) => ({
        id,
        at: new Date(day.getTime() + j * 11 * 60_000).toISOString(),
        seconds: (DRILL_BY_ID[id]?.duration ?? 8) * 60 + ((i + j) % 3) * 30,
      })),
      planSessions: [],
    };
  });

  // Mark this week's past plan sessions as done where the player trained.
  const plan = buildWeekPlan(profile, today);
  const todayKey = dateKey(today);
  for (const s of plan.sessions) {
    if (s.date < todayKey && isTrained(activity[s.date])) activity[s.date].planSessions.push(s.id);
  }
  return activity;
}

export function seedFeedback(today = new Date()): FeedbackEntry[] {
  return [
    {
      id: 'fb-seed-1',
      choices: ['solo'],
      text: 'Something I can do in my garden after school',
      at: addDays(today, -58).toISOString(),
      status: 'added',
      resultDrillIds: ['solo-passing-square'],
    },
  ];
}

export function createDemoState(today = new Date()): PitchsideState {
  return {
    version: 1,
    profile: DEMO_PROFILE,
    activity: seedActivity(DEMO_PROFILE, today),
    feedback: seedFeedback(today),
    seenAchievements: [],
    readArticles: ['why-warm-ups-matter'],
    openedNotes: ['warm-up', 'water', 'weak-foot'],
    onboarded: false,
    hasSampleHistory: true,
  };
}
