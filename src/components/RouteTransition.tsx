import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, type Location } from 'react-router';
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';
import { RealLocationContext } from '@/lib/nav';
import { portalState } from './Portal';
import { scrollToTop, useLenis } from './SmoothScroll';

const layoutOf = (path: string) => (path === '/' ? 'home' : path.startsWith('/start') ? 'focus' : 'app');

/**
 * Route transitions. The outgoing screen fades and lifts slightly, then the
 * new screen rises in. Inside the app only the content area moves — the
 * sidebar and tab bar stay put. Query-string changes (filters) never animate.
 */
export function RouteTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation();
  const [shown, setShown] = useState<Location>(location);
  const lenis = useLenis();
  const entering = useRef(false);

  useEffect(() => {
    if (location.pathname === shown.pathname) {
      if (location.search !== shown.search || location.hash !== shown.hash) setShown(location);
      return;
    }
    const sameLayout = layoutOf(location.pathname) === layoutOf(shown.pathname);
    const target = document.querySelector<HTMLElement>(sameLayout ? '[data-route-view]' : '[data-layout]');
    if (!target || prefersReducedMotion() || portalState.active) {
      setShown(location);
      return;
    }
    const tween = gsap.to(target, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        entering.current = true;
        setShown(location);
      },
    });
    return () => {
      tween.kill();
    };
  }, [location, shown]);

  useLayoutEffect(() => {
    scrollToTop(lenis);
    const view = document.querySelector<HTMLElement>('[data-route-view]');
    const layout = document.querySelector<HTMLElement>('[data-layout]');
    if (layout) gsap.set(layout, { clearProps: 'opacity,transform' });
    if (entering.current && view && !prefersReducedMotion()) {
      gsap.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.42, ease: EASE, clearProps: 'transform' });
    } else if (view) {
      gsap.set(view, { clearProps: 'opacity,transform' });
    }
    entering.current = false;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
    // Keyed on the pathname only: filter (query-string) changes must not scroll or fade.
  }, [shown.pathname]);

  return <RealLocationContext.Provider value={location}>{children(shown)}</RealLocationContext.Provider>;
}
