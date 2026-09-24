import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger, scrollState } from '@/lib/motion';
import { useReducedMotion } from '@/lib/hooks';

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/**
 * Lenis drives the page's scroll with light inertia, and GSAP's ticker drives
 * Lenis — so every ScrollTrigger reads exactly the same scroll position on
 * the same frame. With reduced motion we keep native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (reduced) {
      let last = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        scrollState.direction = y >= last ? 1 : -1;
        scrollState.velocity = 0;
        scrollState.y = y;
        scrollState.progress = y / max();
        last = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const instance = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });

    instance.on('scroll', (l: Lenis) => {
      scrollState.y = l.scroll;
      scrollState.velocity = l.velocity;
      if (l.direction) scrollState.direction = l.direction as 1 | -1;
      scrollState.progress = l.progress;
      ScrollTrigger.update();
    });

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function scrollToTop(lenis: Lenis | null) {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}
