import { useEffect, useRef } from 'react';
import { gsap, isLiteDevice, prefersReducedMotion, scrollState } from '@/lib/motion';

/**
 * Ambient layer — the last level of the motion hierarchy. Faint pitch
 * markings and soft light that drift very slowly, with deeper layers moving
 * less than nearer ones as you scroll. Contrast is kept low so content
 * always wins.
 */
export function AmbientPitch({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el);
    const setters = layers.map((l) => gsap.quickTo(l, 'y', { duration: 0.8, ease: 'power3.out' }));
    const depths = layers.map((l) => Number(l.dataset.depth));
    const drift = gsap.to(el.querySelector('.ambient__glow'), {
      xPercent: 8,
      yPercent: -6,
      rotate: 8,
      duration: 18,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    const tick = () => {
      const y = scrollState.y;
      setters.forEach((set, i) => set(-y * depths[i]));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      drift.kill();
    };
  }, []);

  return (
    <div ref={root} className={`ambient ambient--${tone}`} aria-hidden="true">
      <div className="ambient__glow" />
      <svg className="ambient__lines" data-depth="0.04" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="40" y="40" width="1120" height="720" rx="6" />
          <path d="M600 40v720" />
          <circle cx="600" cy="400" r="92" />
          <rect x="40" y="220" width="170" height="360" />
          <rect x="990" y="220" width="170" height="360" />
          <path d="M210 330a80 80 0 0 1 0 140M990 330a80 80 0 0 0 0 140" />
        </g>
      </svg>
      {!isLiteDevice() && (
        <div className="ambient__dots" data-depth="0.1">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${-i * 1.7}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Restrained particle field for the hero: a few dozen specks drifting like
 * dust in floodlights. Pauses offscreen and when the tab is hidden.
 */
export function Particles({ count = 46 }: { count?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c || prefersReducedMotion()) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const n = isLiteDevice() ? Math.round(count * 0.4) : count;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = c.offsetWidth;
      h = c.offsetHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const dots = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      z: 0.3 + Math.random() * 0.7,
      a: 0.12 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    let t = 0;
    const tick = (_time: number, delta: number) => {
      if (!visible || document.hidden) return;
      t += delta / 1000;
      const boost = 1 + Math.min(Math.abs(scrollState.velocity), 40) * 0.04;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= 0.0022 * d.z * boost * (delta / 16);
        if (d.y < -0.02) {
          d.y = 1.02;
          d.x = Math.random();
        }
        const x = (d.x + Math.sin(t * 0.3 + d.phase) * 0.01) * w;
        const y = d.y * h;
        ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(t * 0.8 + d.phase));
        ctx.fillStyle = d.z > 0.8 ? '#dcf55c' : '#f4f3ea';
        ctx.beginPath();
        ctx.arc(x, y, d.r * d.z, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  return <canvas ref={canvas} className="particles" aria-hidden="true" />;
}
