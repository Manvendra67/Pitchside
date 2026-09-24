import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase, useGSAP);

/**
 * Motion language
 * ───────────────
 * One signature curve — cubic-bezier(0.22, 1, 0.36, 1) — for almost
 * everything. Heavy things move longer and settle slower; small things are
 * quick. Only transform and opacity (plus the odd clip-path) are animated.
 *
 * Hierarchy: smooth scroll → scroll-scrubbed sequences → section
 * transitions → element reveals → micro-interactions → ambient motion.
 */

CustomEase.create('pitch', '0.22, 1, 0.36, 1');
CustomEase.create('pitchInOut', '0.65, 0, 0.35, 1');
CustomEase.create('settle', '0.34, 1.4, 0.64, 1');

export const EASE = 'pitch';
export const EASE_IN_OUT = 'pitchInOut';
export const EASE_SETTLE = 'settle';

export const DUR = {
  micro: 0.16,
  hover: 0.22,
  panel: 0.34,
  enter: 0.46,
  section: 0.64,
  heavy: 0.9,
} as const;

gsap.defaults({ ease: EASE, duration: DUR.enter });
ScrollTrigger.config({ ignoreMobileResize: true });

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Small screens, few cores or data-saver: keep the heavy effects off. */
export function isLiteDevice(): boolean {
  if (typeof window === 'undefined') return true;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    !!nav.connection?.saveData
  );
}

export function canHover(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Shared, non-reactive scroll state. Updated by the smooth-scroll engine on
 * every frame so decorative components can read velocity and direction
 * without re-rendering React.
 */
export const scrollState = {
  y: 0,
  velocity: 0,
  direction: 1 as 1 | -1,
  progress: 0,
};

export { gsap, ScrollTrigger, Flip, useGSAP };
