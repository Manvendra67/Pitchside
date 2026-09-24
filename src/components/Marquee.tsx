import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, prefersReducedMotion, scrollState } from '@/lib/motion';

interface Props {
  items: ReactNode[];
  /** Pixels per second at rest. */
  speed?: number;
  /** 1 = moves left, -1 = moves right. */
  direction?: 1 | -1;
  /** React to scroll speed and direction. */
  reactive?: boolean;
  separator?: ReactNode;
  className?: string;
  label?: string;
}

/**
 * Seamless marquee. One "set" of items is measured and repeated enough times
 * to cover the screen twice; the track position is wrapped by exactly one
 * set's width, so the loop never shows a seam. Scrolling fast nudges the
 * speed up and scrolling up flips the direction.
 */
export function Marquee({
  items,
  speed = 48,
  direction = 1,
  reactive = true,
  separator = <span className="marquee__sep" aria-hidden="true" />,
  className = '',
  label,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;

    let setWidth = 0;
    const measure = () => {
      const first = tr.children[0] as HTMLElement | undefined;
      if (!first) return;
      setWidth = first.offsetWidth;
      const needed = Math.max(2, Math.ceil((el.offsetWidth * 2) / Math.max(1, setWidth)) + 1);
      setCopies((c) => (c === needed ? c : needed));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);

    if (prefersReducedMotion()) return () => ro.disconnect();

    let x = 0;
    let dir = direction;
    let boost = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    const setX = gsap.quickSetter(tr, 'x', 'px');
    const tick = (_t: number, delta: number) => {
      if (!visible || !setWidth) return;
      const dt = Math.min(delta, 64) / 1000;
      if (reactive) {
        const v = Math.min(Math.abs(scrollState.velocity), 60);
        boost += (v * 0.09 - boost) * 0.08;
        dir = (direction * scrollState.direction) as 1 | -1;
      }
      x -= speed * dt * dir * (1 + boost);
      x = gsap.utils.wrap(-setWidth, 0, x);
      setX(x);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
    };
  }, [direction, reactive, speed]);

  const set = (
    <div className="marquee__set">
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="marquee__item">{item}</span>
          {separator}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div ref={root} className={`marquee ${className}`} role={label ? 'marquee' : undefined} aria-label={label}>
      <div ref={track} className="marquee__track" aria-hidden="true">
        {Array.from({ length: copies }, (_, i) => (
          <Fragment key={i}>{set}</Fragment>
        ))}
      </div>
    </div>
  );
}
