import { CATEGORY_BY_ID } from '@/data/positions';
import type { CategoryId, Drill, Level, PositionId } from './types';

export interface DrillFilters {
  category: CategoryId | 'all';
  position: PositionId | 'all';
  level: Level | 'all';
  query: string;
  /** Only drills that came from player feedback. */
  requested: boolean;
}

export const EMPTY_FILTERS: DrillFilters = {
  category: 'all',
  position: 'all',
  level: 'all',
  query: '',
  requested: false,
};

function haystack(d: Drill): string {
  return [d.name, d.summary, d.cue, CATEGORY_BY_ID[d.category].name, ...d.equipment, d.level].join(' ').toLowerCase();
}

export function filterDrills(drills: Drill[], f: DrillFilters): Drill[] {
  const terms = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  return drills.filter(
    (d) =>
      (f.category === 'all' || d.category === f.category) &&
      (f.position === 'all' || d.positions.includes(f.position)) &&
      (f.level === 'all' || d.level === f.level) &&
      (!f.requested || d.source.type === 'player-feedback') &&
      terms.every((t) => haystack(d).includes(t)),
  );
}

export function activeFilterCount(f: DrillFilters): number {
  return (
    Number(f.category !== 'all') + Number(f.position !== 'all') + Number(f.level !== 'all') + Number(!!f.query.trim()) + Number(f.requested)
  );
}
