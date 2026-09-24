import { useRef, type ReactNode } from 'react';
import { DUR, EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

interface Props {
  /** 0–1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  /** Draw centre-circle style tick marks around the ring. */
  ticks?: number;
  children?: ReactNode;
  className?: string;
  label?: string;
  /** Animate from 0 when first shown. */
  animateIn?: boolean;
  duration?: number;
}

/** SVG progress ring. The arc eases between values with a little overshoot. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = 'var(--volt-400)',
  track = 'var(--ring-track, rgba(11, 21, 16, 0.08))',
  ticks = 0,
  children,
  className = '',
  label,
  animateIn = true,
  duration = 1.1,
}: Props) {
  const arc = useRef<SVGCircleElement>(null);
  const first = useRef(true);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));

  useGSAP(
    () => {
      const el = arc.current;
      if (!el) return;
      const target = c * (1 - v);
      if (prefersReducedMotion()) {
        gsap.set(el, { strokeDashoffset: target });
      } else if (first.current && animateIn) {
        gsap.fromTo(el, { strokeDashoffset: c }, { strokeDashoffset: target, duration, ease: EASE, delay: 0.15 });
      } else {
        gsap.to(el, { strokeDashoffset: target, duration: DUR.section + 0.2, ease: 'settle' });
      }
      first.current = false;
    },
    { dependencies: [v, c] },
  );

  return (
    <div className={`ring ${className}`} style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {ticks > 0 &&
          Array.from({ length: ticks }, (_, i) => {
            const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
            const r1 = r + stroke / 2 + 4;
            const r2 = r1 + 4;
            return (
              <line
                key={i}
                x1={size / 2 + Math.cos(a) * r1}
                y1={size / 2 + Math.sin(a) * r1}
                x2={size / 2 + Math.cos(a) * r2}
                y2={size / 2 + Math.sin(a) * r2}
                stroke={i / ticks < v ? color : track}
                strokeWidth={1.5}
                strokeLinecap="round"
                style={{ transition: 'stroke 400ms var(--ease)' }}
              />
            );
          })}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={animateIn ? c : c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <div className="ring__center">{children}</div>}
    </div>
  );
}
