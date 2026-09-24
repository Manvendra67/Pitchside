export type PositionId = 'goalkeeper' | 'defender' | 'midfielder' | 'winger' | 'striker';
export type Level = 'beginner' | 'developing' | 'advanced';
export type CategoryId = 'ball-control' | 'passing' | 'finishing' | 'speed-agility' | 'defending' | 'goalkeeping';

export type GoalId = 'first-touch' | 'shooting' | 'speed' | 'passing' | 'confidence' | 'defending' | 'saves';

/** 0 = Monday … 6 = Sunday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Position {
  id: PositionId;
  name: string;
  short: string;
  blurb: string;
  /** Where the player stands on the mini pitch, in a 100 × 64 box. */
  spot: [number, number];
  /** Categories this position trains most, in priority order. */
  focus: CategoryId[];
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  blurb: string;
  /** CSS custom property that holds the category colour. */
  tone: string;
}

export interface DrillDiagram {
  cones?: [number, number][];
  /** SVG path for the ball / player movement, in the 100 × 64 box. */
  path: string;
  player: [number, number];
  partner?: [number, number];
  goal?: 'left' | 'right';
  wall?: 'top' | 'right';
}

export type DrillSource =
  | { type: 'core' }
  | {
      type: 'player-feedback';
      /** What players asked for, in their words. */
      request: string;
      /** How many players sent a similar request. */
      requests: number;
      /** ISO date the drill joined the library. */
      addedOn: string;
    };

export interface Drill {
  id: string;
  name: string;
  category: CategoryId;
  positions: PositionId[];
  level: Level;
  summary: string;
  /** Minutes */
  duration: number;
  equipment: string[];
  /** One short coaching cue players can remember. */
  cue: string;
  instructions: string;
  steps: string[];
  keyPoints: string[];
  reviewedBy: string;
  source: DrillSource;
  solo: boolean;
  diagram: DrillDiagram;
}

export interface PlayerProfile {
  name: string;
  position: PositionId;
  level: Level;
  weightKg: number;
  age?: number;
  trainingDays: Weekday[];
  goals: GoalId[];
  createdAt: string;
  /** True for the built-in sample player shown before onboarding. */
  isDemo?: boolean;
}

export interface DrillLog {
  id: string;
  at: string;
  seconds: number;
}

export interface DayLog {
  checkIn?: 'trained' | 'rest';
  drills: DrillLog[];
  planSessions: string[];
  /** Fuel-ups ticked on the nutrition screen. */
  meals?: string[];
}

export type FeedbackChoice = 'more-finishing' | 'harder' | 'easier' | 'more-goalkeeper' | 'solo' | 'shorter' | 'more-1v1' | 'more-passing';

export interface FeedbackEntry {
  id: string;
  choices: FeedbackChoice[];
  text?: string;
  at: string;
  status: 'sent' | 'reviewing' | 'added';
  /** Drill ids that came from this request, when it has shipped. */
  resultDrillIds?: string[];
}

export interface PitchsideState {
  version: 1;
  profile: PlayerProfile;
  activity: Record<string, DayLog>;
  feedback: FeedbackEntry[];
  seenAchievements: string[];
  readArticles: string[];
  openedNotes: string[];
  onboarded: boolean;
  /** True while the built-in sample training history is still in place. */
  hasSampleHistory: boolean;
}
