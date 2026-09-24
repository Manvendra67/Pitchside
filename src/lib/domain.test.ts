import { describe, expect, it } from 'vitest';
import { DRILLS, FEEDBACK_DRILLS } from '@/data/drills';
import { CATEGORIES, POSITIONS } from '@/data/positions';
import { createDemoState } from '@/data/seed';
import { achievementStatus } from './achievements';
import { addDays, dateKey } from './dates';
import { EMPTY_FILTERS, filterDrills } from './drillFilter';
import { clampWeight, fuelTargets } from './nutrition';
import { buildWeekPlan, LEVEL_RANK } from './plan';
import { bestStreak, computeStats, currentStreak } from './stats';
import type { DayLog } from './types';

const day = (checkIn?: DayLog['checkIn']): DayLog => ({ checkIn, drills: [], planSessions: [] });

describe('drill library', () => {
  it('has enough drills and categories, all reviewed', () => {
    expect(DRILLS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(DRILLS.map((d) => d.category)).size).toBeGreaterThanOrEqual(4);
    expect(DRILLS.every((d) => d.reviewedBy === 'Coach Ranvir')).toBe(true);
    expect(new Set(DRILLS.map((d) => d.id)).size).toBe(DRILLS.length);
  });

  it('labels feedback drills', () => {
    expect(FEEDBACK_DRILLS.length).toBeGreaterThan(0);
    expect(FEEDBACK_DRILLS.every((d) => d.source.type === 'player-feedback')).toBe(true);
  });

  it('every category has at least one drill and every position has drills', () => {
    for (const c of CATEGORIES) expect(DRILLS.some((d) => d.category === c.id)).toBe(true);
    for (const p of POSITIONS) expect(DRILLS.filter((d) => d.positions.includes(p.id)).length).toBeGreaterThan(2);
  });
});

describe('filterDrills', () => {
  it('returns everything with no filters', () => {
    expect(filterDrills(DRILLS, EMPTY_FILTERS)).toHaveLength(DRILLS.length);
  });

  it('combines category, position and level', () => {
    const out = filterDrills(DRILLS, { ...EMPTY_FILTERS, category: 'goalkeeping', position: 'goalkeeper', level: 'beginner' });
    expect(out.map((d) => d.id)).toEqual(['ready-scoop']);
  });

  it('filters by position relevance', () => {
    const out = filterDrills(DRILLS, { ...EMPTY_FILTERS, position: 'goalkeeper' });
    expect(out.every((d) => d.positions.includes('goalkeeper'))).toBe(true);
    expect(out.some((d) => d.category === 'finishing')).toBe(false);
  });

  it('searches names, equipment and cues', () => {
    expect(filterDrills(DRILLS, { ...EMPTY_FILTERS, query: 'wall' }).length).toBeGreaterThan(2);
    expect(filterDrills(DRILLS, { ...EMPTY_FILTERS, query: 'zzzz' })).toHaveLength(0);
  });

  it('shows only player-requested drills', () => {
    expect(filterDrills(DRILLS, { ...EMPTY_FILTERS, requested: true })).toHaveLength(FEEDBACK_DRILLS.length);
  });
});

describe('fuelTargets', () => {
  it('scales with body weight', () => {
    const light = fuelTargets(30, 'training');
    const heavy = fuelTargets(45, 'training');
    expect(light.find((t) => t.id === 'carbs')!.grams).toBe(210);
    expect(light.find((t) => t.id === 'protein')!.grams).toBe(45);
    expect(light.find((t) => t.id === 'fat')!.grams).toBe(45);
    for (const id of ['carbs', 'protein', 'fat'] as const) {
      expect(heavy.find((t) => t.id === id)!.grams).toBeGreaterThan(light.find((t) => t.id === id)!.grams);
    }
  });

  it('eases carbs on rest days only', () => {
    const t = fuelTargets(40, 'training');
    const r = fuelTargets(40, 'rest');
    expect(r[0].grams).toBeLessThan(t[0].grams);
    expect(r[1].grams).toBe(t[1].grams);
  });

  it('keeps fat inside 25–35% of energy', () => {
    for (const kg of [22, 35, 60, 90]) {
      for (const dayType of ['training', 'rest'] as const) {
        const fat = fuelTargets(kg, dayType).find((t) => t.id === 'fat')!;
        expect(fat.share).toBeGreaterThanOrEqual(0.25);
        expect(fat.share).toBeLessThanOrEqual(0.35);
      }
    }
  });

  it('clamps silly weights', () => {
    expect(clampWeight(5)).toBe(20);
    expect(clampWeight(300)).toBe(90);
    expect(clampWeight(NaN)).toBe(35);
  });
});

describe('streaks', () => {
  const today = '2026-09-24';
  it('counts back from today, or from yesterday before check-in', () => {
    const a = { '2026-09-23': day('trained'), '2026-09-22': day('rest'), '2026-09-20': day('trained') };
    expect(currentStreak(a, today)).toBe(2);
    expect(currentStreak({ ...a, [today]: day('trained') }, today)).toBe(3);
    expect(currentStreak({ '2026-09-21': day('trained') }, today)).toBe(0);
  });

  it('finds the best streak', () => {
    const a = {
      '2026-09-01': day('trained'),
      '2026-09-02': day('trained'),
      '2026-09-03': day('rest'),
      '2026-09-05': day('trained'),
    };
    expect(bestStreak(a)).toBe(3);
  });
});

describe('weekly plan', () => {
  it('schedules a session on each training day', () => {
    const plan = buildWeekPlan({ position: 'winger', level: 'developing', trainingDays: [0, 2, 4, 5] }, new Date(2026, 8, 24));
    expect(plan.sessions.map((s) => s.weekday)).toEqual([0, 2, 4, 5]);
    expect(plan.days).toHaveLength(7);
    for (const s of plan.sessions) {
      expect(s.drills.length).toBeGreaterThan(0);
      expect(s.drills.every((d) => d.positions.includes('winger'))).toBe(true);
    }
  });

  it('gives goalkeepers goalkeeper work and keeps beginners off advanced drills', () => {
    const plan = buildWeekPlan({ position: 'goalkeeper', level: 'beginner', trainingDays: [1, 3, 5] }, new Date(2026, 8, 24));
    const all = plan.sessions.flatMap((s) => s.drills);
    expect(all.some((d) => d.category === 'goalkeeping')).toBe(true);
    expect(all.every((d) => LEVEL_RANK[d.level] <= LEVEL_RANK.beginner)).toBe(true);
    expect(plan.sessions.map((s) => s.theme.name)).toContain('Handling');
  });

  it('falls back to three days when none are chosen', () => {
    expect(buildWeekPlan({ position: 'striker', level: 'advanced', trainingDays: [] }).sessions).toHaveLength(3);
  });
});

describe('demo state', () => {
  it('seeds a live six-day streak and unlocked achievements', () => {
    const now = new Date(2026, 8, 24, 10);
    const s = createDemoState(now);
    const stats = computeStats(s, now);
    expect(stats.streak).toBe(6);
    expect(stats.totalDrills).toBeGreaterThanOrEqual(20);
    const unlocked = achievementStatus(stats)
      .filter((a) => a.unlocked)
      .map((a) => a.achievement.id);
    expect(unlocked).toContain('first-session');
    expect(unlocked).toContain('ten-drills');
    expect(unlocked).not.toContain('seven-day-streak');
    expect(s.activity[dateKey(addDays(now, -7))]).toBeUndefined();
  });
});
