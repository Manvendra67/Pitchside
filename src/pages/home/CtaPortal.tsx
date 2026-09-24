import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { ButtonLink } from '@/components/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { useReducedMotion } from '@/lib/hooks';
import { EASE, gsap, useGSAP } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { MiniDrillRow, MiniFuelBars, MiniStreakDots } from './Mini';

/**
 * Portal moment. A centre circle sits in the middle of the pitch; as you
 * scroll it opens until it fills the screen, revealing the player's
 * headquarters inside. The headline shrinks back to make room.
 */
export function CtaPortal() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { onboarded } = useStore();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap.set(q('.cta__window'), { clipPath: 'circle(7% at 50% 50%)' });
      gsap.set(q('.cta__preview'), { scale: 1.25, opacity: 0.3 });
      gsap.set(q('.cta__actions'), { opacity: 0, y: 24 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          pin: q('.cta__pin')[0],
          scrub: 0.6,
          anticipatePin: 1,
        },
      });
      tl.to(q('.cta__ring'), { scale: 1.6, opacity: 0, duration: 0.6 }, 0)
        .to(q('.cta__window'), { clipPath: 'circle(75% at 50% 50%)', duration: 1, ease: 'power2.inOut' }, 0)
        .to(q('.cta__preview'), { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
        .to(q('.cta__title'), { scale: 0.6, y: () => -window.innerHeight * 0.32, duration: 1, ease: 'power2.inOut' }, 0)
        .to(q('.cta__actions'), { opacity: 1, y: 0, duration: 0.3, ease: EASE }, 0.75)
        .to({}, { duration: 0.3 });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className={`cta theme-dark${reduced ? ' cta--static' : ''}`} aria-labelledby="cta-title">
      <div className="cta__pin">
        <div className="cta__window">
          <div className="cta__preview" aria-hidden="true">
            <div className="cta__dash">
              <div className="cta__card cta__card--session">
                <span className="eyebrow">Today’s session</span>
                <b>Ball Control + Speed</b>
                <MiniDrillRow id="cone-weave" done />
                <MiniDrillRow id="quick-feet-ladder" />
              </div>
              <div className="cta__card cta__card--streak">
                <ProgressRing value={6 / 7} size={120} stroke={10} color="var(--volt-400)" track="rgba(255,255,255,.1)" animateIn={false}>
                  <span className="cta__streak">6</span>
                </ProgressRing>
                <span>day streak</span>
                <MiniStreakDots filled={6} />
              </div>
              <div className="cta__card cta__card--fuel">
                <span className="eyebrow">Fuel your game</span>
                <MiniFuelBars compact />
              </div>
            </div>
          </div>
        </div>
        <span className="cta__ring" aria-hidden="true" />
        <h2 id="cta-title" className="cta__title">
          Your academy <em className="serif">is ready.</em>
        </h2>
        <div className="cta__actions">
          <ButtonLink to={onboarded ? '/dashboard' : '/start'} portal variant="accent" size="xl" magnetic icon={<ArrowRight size={20} />}>
            {onboarded ? 'Go to my dashboard' : 'Start Training'}
          </ButtonLink>
          <ButtonLink to="/dashboard" variant="secondary" size="xl">
            Look around first
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
