import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { EASE, EASE_IN_OUT, gsap, prefersReducedMotion } from '@/lib/motion';
import { LogoMark } from './Logo';

type Origin = HTMLElement | { x: number; y: number } | null | undefined;
type PortalFn = (to: string, origin?: Origin) => void;

const PortalContext = createContext<PortalFn>(() => {});
export const usePortal = () => useContext(PortalContext);

/** Set while a portal transition owns the screen, so route fades can skip. */
export const portalState = { active: false };

/**
 * Match-cut transition for big moments. A circle — the centre circle of a
 * pitch — grows from the element you pressed until it fills the screen,
 * the route changes underneath, and the new screen is revealed.
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const overlay = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const open = useCallback<PortalFn>(
    (to, origin) => {
      const el = overlay.current;
      if (!el || busy.current || prefersReducedMotion()) {
        navigate(to);
        return;
      }
      busy.current = true;
      portalState.active = true;

      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (origin instanceof HTMLElement) {
        const r = origin.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      } else if (origin) {
        ({ x, y } = origin);
      }
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
      const rings = el.querySelectorAll('[data-ring]');
      const mark = el.querySelector('[data-mark]');

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, { visibility: 'hidden' });
          busy.current = false;
          portalState.active = false;
        },
      });
      tl.set(el, { visibility: 'visible', opacity: 1, clipPath: `circle(0px at ${x}px ${y}px)` })
        .set(rings, { scale: 0.2, opacity: 0, xPercent: -50, yPercent: -50, left: x, top: y })
        .set(mark, { scale: 0.6, opacity: 0 })
        .to(el, { clipPath: `circle(${radius}px at ${x}px ${y}px)`, duration: 0.72, ease: EASE_IN_OUT })
        .to(rings, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.06, ease: EASE }, '<0.1')
        .to(mark, { scale: 1, opacity: 1, duration: 0.4, ease: EASE }, '<0.25')
        .add(() => navigate(to))
        .to({}, { duration: 0.18 })
        .to(mark, { scale: 1.2, opacity: 0, duration: 0.35, ease: EASE })
        .to(rings, { scale: 2.4, opacity: 0, duration: 0.6, ease: EASE }, '<')
        .to(el, { opacity: 0, duration: 0.5, ease: EASE }, '<0.08');
    },
    [navigate],
  );

  return (
    <PortalContext.Provider value={open}>
      {children}
      <div ref={overlay} className="portal theme-dark" aria-hidden="true">
        <span className="portal__ring" data-ring style={{ width: '28vmax', height: '28vmax' }} />
        <span className="portal__ring" data-ring style={{ width: '56vmax', height: '56vmax' }} />
        <span className="portal__ring portal__ring--faint" data-ring style={{ width: '96vmax', height: '96vmax' }} />
        <span className="portal__mark" data-mark>
          <LogoMark size={56} />
        </span>
      </div>
    </PortalContext.Provider>
  );
}
