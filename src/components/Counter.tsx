import { useEffect, useRef } from 'react';
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  /** Count up from zero the first time the number scrolls into view. */
  fromZero?: boolean;
  className?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Animated number. Changes tween smoothly from the old value to the new one
 * instead of snapping, and the digits are tabular so nothing jiggles.
 */
export function Counter({ value, decimals = 0, duration = 0.9, fromZero = true, className, suffix = '', prefix = '' }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);
  const format = (n: number) =>
    prefix + n.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const render = (n: number) => {
      node.textContent = format(n);
    };

    if (prefersReducedMotion()) {
      shown.current = value;
      render(value);
      return;
    }

    const obj = { n: shown.current ?? (fromZero ? 0 : value) };
    render(obj.n);
    const run = () =>
      gsap.to(obj, {
        n: value,
        duration: shown.current === null ? duration + 0.3 : duration,
        ease: EASE,
        onUpdate: () => {
          shown.current = obj.n;
          render(obj.n);
        },
        onComplete: () => {
          shown.current = value;
          render(value);
        },
      });

    if (shown.current === null && fromZero) {
      let tween: gsap.core.Tween | undefined;
      const st = ScrollTrigger.create({
        trigger: node,
        start: 'top 95%',
        once: true,
        onEnter: () => {
          tween = run();
        },
      });
      return () => {
        st.kill();
        tween?.kill();
      };
    }
    const tween = run();
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span className={className}>
      <span ref={el} aria-hidden="true">
        {format(fromZero && !prefersReducedMotion() ? 0 : value)}
      </span>
      <span className="visually-hidden">{format(value)}</span>
    </span>
  );
}
