import { useRef } from 'react';
import { EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

/** A checkmark that draws itself when `done` flips to true. */
export function CheckDraw({
  done,
  size = 22,
  color = 'currentColor',
  stroke = 2.6,
}: {
  done: boolean;
  size?: number;
  color?: string;
  stroke?: number;
}) {
  const path = useRef<SVGPathElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const el = path.current;
      if (!el) return;
      const instant = first.current || prefersReducedMotion();
      first.current = false;
      if (instant) {
        gsap.set(el, { strokeDashoffset: done ? 0 : 1 });
        return;
      }
      gsap.to(el, { strokeDashoffset: done ? 0 : 1, duration: done ? 0.5 : 0.2, ease: EASE, delay: done ? 0.08 : 0 });
    },
    { dependencies: [done] },
  );

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        ref={path}
        d="M5 12.5l4.6 4.5L19 7.5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={done ? 0 : 1}
      />
    </svg>
  );
}
