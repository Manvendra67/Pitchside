import { BookOpen, CalendarDays, House, LayoutGrid, MessageCircle, Salad, TrendingUp, UserRound, type LucideIcon } from 'lucide-react';
import { createContext, useContext, type ComponentType } from 'react';
import type { Location } from 'react-router';
import { Cone } from '@/components/Glyphs';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon | ComponentType<{ size?: number }>;
  /** Where the item sits in the player's journey. */
  question?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', short: 'Today', icon: LayoutGrid, question: 'What’s on today?' },
  { to: '/plan', label: 'Training Plan', short: 'Plan', icon: CalendarDays, question: 'What should I train?' },
  { to: '/drills', label: 'Drills', short: 'Drills', icon: Cone, question: 'How do I do it?' },
  { to: '/nutrition', label: 'Nutrition', short: 'Fuel', icon: Salad, question: 'What should I fuel with?' },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: TrendingUp, question: 'Am I improving?' },
];

export const SECONDARY_NAV: NavItem[] = [
  { to: '/coach', label: 'Coach & Feedback', short: 'Coach', icon: MessageCircle },
  { to: '/learn', label: 'Football Knowledge', short: 'Learn', icon: BookOpen },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: UserRound },
];

export const HOME_NAV: NavItem = { to: '/', label: 'Home', short: 'Home', icon: House };

export function isActivePath(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
}

/** The live router location — nav reads this so indicators move immediately, before the route fade finishes. */
export const RealLocationContext = createContext<Location | null>(null);
export const useRealLocation = () => useContext(RealLocationContext);
