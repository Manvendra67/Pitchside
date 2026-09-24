import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/motion';
import { useMediaQuery, useReducedMotion } from '@/lib/hooks';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="radio"], [role="checkbox"], label, summary, select, [data-cursor]';
const TEXT = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/**
 * Desktop-only cursor: a small dot plus a soft ring that grows over things
 * you can press, shows a short label where one helps, and gently pulls
 * `[data-magnetic]` buttons towards the pointer. Touch devices, keyboard
 * users and reduced-motion users keep the normal cursor.
 */
export function Cursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const enabled = fine && !reduced;

  useEffect(() => {
    const el = root.current;
    if (!enabled || !el) return;
    const html = document.documentElement;
    const dot = el.querySelector<HTMLElement>('.cursor__dot')!;
    const ring = el.querySelector<HTMLElement>('.cursor__ring')!;

    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

    let magnet: HTMLElement | null = null;
    let shown = false;
    let state = '';

    const setState = (next: string, text = '') => {
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      if (next === state) return;
      state = next;
      el.dataset.state = next;
    };

    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.setProperty('--mx', '0px');
      magnet.style.setProperty('--my', '0px');
      magnet.classList.remove('is-magnet');
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) {
        shown = true;
        html.classList.add('has-cursor');
        el.dataset.visible = 'true';
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = e.target as Element | null;
      if (!target?.closest) return;

      if (target.closest(TEXT)) {
        setState('text');
      } else {
        const hit = target.closest<HTMLElement>(INTERACTIVE);
        const text = hit?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
        if (hit && (hit as HTMLButtonElement).disabled) setState('disabled');
        else setState(text ? 'label' : hit ? 'hover' : 'default', text);
      }

      const m = target.closest<HTMLElement>('[data-magnetic]');
      if (m !== magnet) {
        releaseMagnet();
        if (m) {
          magnet = m;
          m.classList.add('is-magnet');
        }
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const ox = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const oy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        magnet.style.setProperty('--mx', `${ox.toFixed(1)}px`);
        magnet.style.setProperty('--my', `${oy.toFixed(1)}px`);
      }
    };

    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');
    const onLeave = () => {
      el.dataset.visible = 'false';
      shown = false;
      releaseMagnet();
    };
    const onKey = () => {
      // Keyboard users get the normal focus ring and cursor back.
      html.classList.remove('has-cursor');
      el.dataset.visible = 'false';
      shown = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('keydown', onKey);
      releaseMagnet();
      html.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={root} className="cursor" aria-hidden="true" data-state="default" data-visible="false">
      <div className="cursor__ring">
        <span ref={label} className="cursor__label" />
      </div>
      <div className="cursor__dot" />
    </div>
  );
}
