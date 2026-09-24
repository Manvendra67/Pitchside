import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { EASE, EASE_IN_OUT, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { LogoMark } from './Logo';

const SEEN_KEY = 'pitchside:intro';

const IntroContext = createContext(true);
/** False while the first-visit logo reveal is still on screen. */
export const useIntroDone = () => useContext(IntroContext);

function shouldPlay(): boolean {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked: play once per load */
  }
  return !prefersReducedMotion();
}

/**
 * First-visit logo reveal. The pitch outline draws, the halfway line and
 * centre circle follow, the spot drops in, the wordmark rises, and a curtain
 * lifts to hand over to the page. About 1.6 seconds — never a spinner.
 */
export function IntroLoader({ children }: { children: ReactNode }) {
  const [play] = useState(shouldPlay);
  const [done, setDone] = useState(!play);
  const [gone, setGone] = useState(!play);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!play || !root.current) return;
      const q = gsap.utils.selector(root);
      const strokes = q('[data-part="pitch"], [data-part="line"], [data-part="circle"]');
      gsap.set(strokes, { attr: { pathLength: 1 }, strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q('[data-part="spot"]'), { scale: 0, transformOrigin: '50% 50%' });
      document.documentElement.style.overflow = 'hidden';

      const tl = gsap.timeline({
        delay: 0.15,
        onComplete: () => {
          document.documentElement.style.overflow = '';
          setDone(true);
          setGone(true);
        },
      });
      tl.to(q('[data-part="pitch"]'), { strokeDashoffset: 0, duration: 0.6, ease: EASE_IN_OUT })
        .to(q('[data-part="line"]'), { strokeDashoffset: 0, duration: 0.3, ease: EASE }, '-=0.2')
        .to(q('[data-part="circle"]'), { strokeDashoffset: 0, duration: 0.4, ease: EASE }, '<0.05')
        .to(q('[data-part="spot"]'), { scale: 1, duration: 0.36, ease: 'back.out(3)' }, '-=0.18')
        .from(q('.intro__char'), { yPercent: 110, duration: 0.5, stagger: 0.028, ease: EASE }, '-=0.35')
        .from(q('.intro__bar i'), { scaleX: 0, duration: 0.7, ease: EASE_IN_OUT }, '<')
        .to(q('.intro__inner'), { y: -24, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.12')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: EASE_IN_OUT }, '-=0.12');
      // Let the page start its own entrance while the curtain lifts.
      tl.add(() => setDone(true), '-=0.4');
    },
    { dependencies: [play] },
  );

  return (
    <IntroContext.Provider value={done}>
      {children}
      {!gone && (
        <div ref={root} className="intro theme-dark" aria-hidden="true" data-done={done || undefined}>
          <div className="intro__inner">
            <LogoMark size={72} className="intro__mark" />
            <div className="intro__word">
              {'Pitchside'.split('').map((c, i) => (
                <span key={i} className="intro__char">
                  {c}
                </span>
              ))}
            </div>
            <div className="intro__bar">
              <i />
            </div>
          </div>
        </div>
      )}
    </IntroContext.Provider>
  );
}
