/**
 * Daily fuel guide for young footballers.
 *
 * Targets are grams per kilogram of body weight, picked from the middle of
 * the ranges in published youth and sports nutrition guidance (see SOURCES).
 * They are a guide for fuelling training, recovery and growth — never a
 * limit. Growing players should eat to appetite.
 */

export type DayType = 'training' | 'rest';
export type NutrientId = 'carbs' | 'protein' | 'fat';

export interface NutrientRule {
  id: NutrientId;
  name: string;
  short: string;
  /** Grams per kg of body weight. */
  perKg: Record<DayType, number>;
  /** What published guidance says, in plain words. */
  range: string;
  job: string;
  detail: string;
  foods: string[];
  tone: string;
}

export const NUTRIENTS: NutrientRule[] = [
  {
    id: 'carbs',
    name: 'Carbohydrates',
    short: 'Carbs',
    perKg: { training: 7, rest: 6 },
    range: 'Young athletes: roughly 3–8 g per kg a day, more on busy training days.',
    job: 'Energy to run',
    detail: 'Your main fuel for sprinting, turning and thinking fast in a match.',
    foods: ['Pasta', 'Rice', 'Oats', 'Bread', 'Potatoes', 'Bananas'],
    tone: '--fuel-carbs',
  },
  {
    id: 'protein',
    name: 'Protein',
    short: 'Protein',
    perKg: { training: 1.5, rest: 1.5 },
    range: 'Young athletes: roughly 1.2–1.8 g per kg a day, spread across meals.',
    job: 'Build & repair',
    detail: 'Helps your muscles recover after training and supports growing.',
    foods: ['Eggs', 'Chicken', 'Beans', 'Yogurt', 'Fish', 'Lentils', 'Milk'],
    tone: '--fuel-protein',
  },
  {
    id: 'fat',
    name: 'Healthy fats',
    short: 'Fats',
    perKg: { training: 1.5, rest: 1.5 },
    range: 'Children and teens: about 25–35% of daily energy from fat.',
    job: 'Lasting energy',
    detail: 'Slow-burning energy, and it helps your body use important vitamins.',
    foods: ['Avocado', 'Olive oil', 'Nuts & seeds', 'Cheese', 'Salmon'],
    tone: '--fuel-fat',
  },
];

export const NUTRIENT_BY_ID = Object.fromEntries(NUTRIENTS.map((n) => [n.id, n])) as Record<NutrientId, NutrientRule>;

export const WEIGHT_MIN = 20;
export const WEIGHT_MAX = 90;

export function clampWeight(kg: number): number {
  if (!Number.isFinite(kg)) return 35;
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, Math.round(kg * 2) / 2));
}

export interface FuelTarget {
  id: NutrientId;
  grams: number;
  perKg: number;
  /** Share of the day's fuel energy, 0–1. */
  share: number;
}

const ENERGY_PER_GRAM: Record<NutrientId, number> = { carbs: 4, protein: 4, fat: 9 };

export function fuelTargets(weightKg: number, day: DayType = 'training'): FuelTarget[] {
  const kg = clampWeight(weightKg);
  const raw = NUTRIENTS.map((n) => ({
    id: n.id,
    perKg: n.perKg[day],
    grams: Math.round(kg * n.perKg[day]),
  }));
  const energy = raw.reduce((sum, r) => sum + r.grams * ENERGY_PER_GRAM[r.id], 0);
  return raw.map((r) => ({ ...r, share: energy ? (r.grams * ENERGY_PER_GRAM[r.id]) / energy : 0 }));
}

export const FUEL_UPS = [
  { id: 'breakfast', name: 'Breakfast', hint: 'Oats, toast or eggs' },
  { id: 'lunch', name: 'Lunch', hint: 'A proper plate' },
  { id: 'snack', name: 'Training snack', hint: 'Banana or yogurt' },
  { id: 'dinner', name: 'Dinner', hint: 'Carbs, protein, veg' },
] as const;

export const TIMING = [
  { when: '2–3 hours before', what: 'A normal meal', example: 'Pasta, rice or a sandwich with some protein.' },
  { when: '1 hour before', what: 'A small snack', example: 'A banana, a slice of toast or a few crackers.' },
  { when: 'During', what: 'Sips of water', example: 'Drink at every break, even if you are not thirsty.' },
  { when: 'Within 1 hour after', what: 'Refuel & repair', example: 'Milk, yogurt with fruit, or a chicken wrap.' },
];

export const SOURCES = [
  {
    title: 'Sports Dietitians Australia position statement: Sports nutrition for the adolescent athlete',
    who: 'Desbrow B. et al.',
    where: 'International Journal of Sport Nutrition and Exercise Metabolism, 2014',
  },
  {
    title: 'UEFA expert group statement on nutrition in elite football',
    who: 'Collins J. et al.',
    where: 'British Journal of Sports Medicine, 2021 (includes guidance for youth players)',
  },
  {
    title: 'Nutrition and Athletic Performance — joint position statement',
    who: 'Academy of Nutrition and Dietetics, Dietitians of Canada & American College of Sports Medicine',
    where: 'Thomas D.T., Erdman K.A., Burke L.M., 2016',
  },
  {
    title: 'Dietary Reference Intakes: Acceptable Macronutrient Distribution Ranges (ages 4–18)',
    who: 'Institute of Medicine (US), National Academies',
    where: '2005',
  },
];
