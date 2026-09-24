import type { Weekday } from './types';

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function addDaysKey(key: string, n: number): string {
  return dateKey(addDays(fromKey(key), n));
}

/** Monday = 0 … Sunday = 6 */
export function weekday(d: Date): Weekday {
  return ((d.getDay() + 6) % 7) as Weekday;
}

export function startOfWeek(d: Date = new Date()): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() - weekday(out));
  return out;
}

export function weekKey(d: Date = new Date()): string {
  return dateKey(startOfWeek(d));
}

export function weekDates(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);
}

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

export const formatLongDate = (d: Date) => dayFmt.format(d);
export const formatShortDate = (d: Date) => shortFmt.format(d);
export const formatMonth = (d: Date) => monthFmt.format(d);

export function relativeDay(key: string, today = dateKey()): string {
  const diff = daysBetween(key, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return formatShortDate(fromKey(key));
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
