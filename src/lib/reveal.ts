import type { RefObject } from 'react';
import { DUR, EASE, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from './motion';

type RevealKind = 'up' | 'fade' | 'scale' | 'blur' | 'mask' | 'left' | 'right';

const FROM: Record<RevealKind, gsap.TweenVars> = {
  up: { opacity: 0, y: 28 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.94, y: 16 },
  blur: { opacity: 0, y: 14, filter: 'blur(12px)' },
  mask: { clipPath: 'inset(0% 0% 100% 0%)', y: 24 },
  left: { opacity: 0, x: -28 },
  right: { opacity: 0, x: 28 },
};

const TO: Record<RevealKind, gsap.TweenVars> = {
  up: { opacity: 1, y: 0 },
  fade: { opacity: 1 },
  scale: { opacity: 1, scale: 1, y: 0 },
  blur: { opacity: 1, y: 0, filter: 'blur(0px)' },
  mask: { clipPath: 'inset(0% 0% 0% 0%)', y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
};

/**
 * Element reveals — level four of the motion hierarchy. Any element inside
 * `scope` with `data-reveal="up|fade|scale|blur|mask|left|right"` fades in
 * the first time it scrolls into view. Neighbours entering together are
 * staggered. `data-reveal-delay` adds a delay in seconds.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current);
      if (!els.length) return;
      if (prefersReducedMotion()) {
        gsap.set(els, { clearProps: 'opacity,transform,filter,clipPath' });
        return;
      }
      els.forEach((el) => {
        const kind = (el.dataset.reveal as RevealKind) || 'up';
        gsap.set(el, FROM[kind] ?? FROM.up);
      });
      ScrollTrigger.batch(els, {
        start: 'top 90%',
        once: true,
        interval: 0.06,
        onEnter: (batch) => {
          (batch as HTMLElement[]).forEach((el, i) => {
            const kind = (el.dataset.reveal as RevealKind) || 'up';
            gsap.to(el, {
              ...TO[kind],
              duration: kind === 'mask' ? DUR.section + 0.1 : DUR.section,
              ease: EASE,
              delay: i * 0.07 + Number(el.dataset.revealDelay ?? 0),
              overwrite: true,
              ...(kind === 'blur' ? { clearProps: 'filter' } : null),
            });
          });
        },
      });
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  );
}
