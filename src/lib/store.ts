import { useSyncExternalStore } from 'react';
import { createDemoState } from '@/data/seed';
import { achievementStatus } from './achievements';
import { dateKey } from './dates';
import { clampWeight } from './nutrition';
import { computeStats } from './stats';
import type { DayLog, FeedbackChoice, FeedbackEntry, PitchsideState, PlayerProfile } from './types';

/**
 * Tiny persisted store. Everything lives in localStorage on the player's own
 * device — Pitchside never sends a child's data anywhere.
 */

const STORAGE_KEY = 'pitchside:v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function unlockedIds(s: PitchsideState): string[] {
  return achievementStatus(computeStats(s))
    .filter((a) => a.unlocked)
    .map((a) => a.achievement.id);
}

function freshState(): PitchsideState {
  const s = createDemoState();
  return { ...s, seenAchievements: unlockedIds(s) };
}

function isState(value: unknown): value is PitchsideState {
  const v = value as PitchsideState | null;
  return !!v && v.version === 1 && !!v.profile && typeof v.activity === 'object';
}

function load(): PitchsideState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isState(parsed)) return { ...freshDefaults(), ...parsed };
    }
  } catch {
    /* storage blocked or corrupt — fall back to the sample player */
  }
  return freshState();
}

function freshDefaults(): Partial<PitchsideState> {
  return { feedback: [], seenAchievements: [], readArticles: [], openedNotes: [], hasSampleHistory: true };
}

let state: PitchsideState = load();

function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

function set(updater: (s: PitchsideState) => PitchsideState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getState() {
  return state;
}

export function useStore(): PitchsideState {
  return useSyncExternalStore(subscribe, getState, getState);
}

const emptyDay = (): DayLog => ({ drills: [], planSessions: [] });

function updateDay(key: string, fn: (d: DayLog) => DayLog) {
  set((s) => ({ ...s, activity: { ...s.activity, [key]: fn(s.activity[key] ?? emptyDay()) } }));
}

export type OnboardingInput = Omit<PlayerProfile, 'createdAt' | 'isDemo'>;

export const actions = {
  completeOnboarding(input: OnboardingInput) {
    set((s) => ({
      ...s,
      onboarded: true,
      profile: {
        ...input,
        name: input.name.trim() || 'Player',
        weightKg: clampWeight(input.weightKg),
        createdAt: dateKey(),
        isDemo: false,
      },
    }));
  },

  updateProfile(patch: Partial<PlayerProfile>) {
    set((s) => ({
      ...s,
      // Editing the sample player's profile makes it yours.
      onboarded: patch.isDemo === false ? true : s.onboarded,
      profile: {
        ...s.profile,
        ...patch,
        ...(patch.weightKg !== undefined ? { weightKg: clampWeight(patch.weightKg) } : null),
      },
    }));
  },

  checkIn(kind: 'trained' | 'rest', key = dateKey()) {
    updateDay(key, (d) => ({ ...d, checkIn: kind }));
  },

  undoCheckIn(key = dateKey()) {
    updateDay(key, (d) => ({ ...d, checkIn: undefined }));
  },

  logDrill(id: string, seconds: number) {
    const now = new Date();
    updateDay(dateKey(now), (d) => ({
      ...d,
      checkIn: d.checkIn ?? 'trained',
      drills: [...d.drills, { id, seconds: Math.max(0, Math.round(seconds)), at: now.toISOString() }],
    }));
  },

  togglePlanSession(sessionId: string, key: string) {
    updateDay(key, (d) => {
      const done = d.planSessions.includes(sessionId);
      return {
        ...d,
        checkIn: done ? d.checkIn : 'trained',
        planSessions: done ? d.planSessions.filter((x) => x !== sessionId) : [...d.planSessions, sessionId],
      };
    });
  },

  toggleMeal(mealId: string, key = dateKey()) {
    updateDay(key, (d) => {
      const meals = d.meals ?? [];
      return { ...d, meals: meals.includes(mealId) ? meals.filter((m) => m !== mealId) : [...meals, mealId] };
    });
  },

  submitFeedback(choices: FeedbackChoice[], text?: string): FeedbackEntry {
    const entry: FeedbackEntry = {
      id: `fb-${Date.now().toString(36)}`,
      choices,
      text: text?.trim() || undefined,
      at: new Date().toISOString(),
      status: 'sent',
    };
    set((s) => ({ ...s, feedback: [entry, ...s.feedback] }));
    return entry;
  },

  markAchievementsSeen(ids: string[]) {
    set((s) => ({ ...s, seenAchievements: [...new Set([...s.seenAchievements, ...ids])] }));
  },

  markArticleRead(slug: string) {
    if (state.readArticles.includes(slug)) return;
    set((s) => ({ ...s, readArticles: [...s.readArticles, slug] }));
  },

  markNoteOpened(id: string) {
    if (state.openedNotes.includes(id)) return;
    set((s) => ({ ...s, openedNotes: [...s.openedNotes, id] }));
  },

  clearSampleHistory() {
    set((s) => ({
      ...s,
      activity: {},
      feedback: [],
      readArticles: [],
      seenAchievements: [],
      hasSampleHistory: false,
    }));
  },

  resetAll() {
    set(() => freshState());
  },
};
