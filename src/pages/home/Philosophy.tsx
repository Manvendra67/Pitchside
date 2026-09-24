import { useRef } from 'react';
import { EASE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

const LINES = [
  { lead: 'Train with', word: 'purpose.', ghost: 'PURPOSE', caption: 'Every drill has a reason — and a coach who checked it.' },
  { lead: 'Fuel your', word: 'body.', ghost: 'FUEL', caption: 'Food is fuel for training, recovering and growing.' },
  { lead: 'Build your', word: 'game.', ghost: 'GAME', caption: 'Small steps, every day, add up to a better player.' },
];

/**
 * Scroll-scrubbed editorial typography. The section pins while each line
 * steps forward — brightening, tightening its tracking and scaling up — as
 * an outlined ghost word slides past behind it. Scrolling up plays it all
 * backwards. It ends with a chalk curtain rising into the next section.
 */
export function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const lines = q('[data-line]');
      const ghosts = q('[data-ghost]');
      const caps = q('[data-cap]');
      const segs = q('[data-seg] i');

      gsap.set(lines, { opacity: 0.13, scale: 0.92, letterSpacing: '0.02em', transformOrigin: '0% 50%' });
      gsap.set(ghosts, { opacity: 0, xPercent: 18 });
      gsap.set(caps, { opacity: 0, y: 16 });
      gsap.set(segs, { scaleX: 0, transformOrigin: '0 50%' });
      gsap.set(q('.philo__curtain'), { scaleY: 0, transformOrigin: '50% 100%' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: q('.philo__pin')[0],
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      LINES.forEach((_, i) => {
        const at = i * 1.4;
        tl.to(lines[i], { opacity: 1, scale: 1, letterSpacing: '-0.045em', duration: 0.8, ease: EASE }, at)
          .to(ghosts[i], { opacity: 1, xPercent: 0, duration: 0.8, ease: EASE }, at)
          .to(ghosts[i], { xPercent: -14, duration: 1.4 }, at + 0.8)
          .to(caps[i], { opacity: 1, y: 0, duration: 0.5, ease: EASE }, at + 0.2)
          .to(segs[i], { scaleX: 1, duration: 1.2 }, at);
        if (i < LINES.length - 1) {
          tl.to(lines[i], { opacity: 0.32, scale: 0.94, letterSpacing: '0em', duration: 0.6 }, at + 1.1)
            .to(ghosts[i], { opacity: 0, duration: 0.5 }, at + 1.1)
            .to(caps[i], { opacity: 0, y: -12, duration: 0.4 }, at + 1.1);
        }
      });

      const end = LINES.length * 1.4;
      tl.to(lines, { opacity: 1, scale: 1, letterSpacing: '-0.045em', duration: 0.6, ease: EASE }, end - 0.2)
        .to(q('.philo__stack'), { scale: 0.9, y: -40, duration: 1 }, end)
        .to(ghosts[LINES.length - 1], { opacity: 0, duration: 0.4 }, end)
        .to(caps, { opacity: 0, duration: 0.3 }, end)
        .to(q('.philo__curtain'), { scaleY: 1, duration: 1, ease: 'power2.in' }, end + 0.2);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="philo theme-dark" aria-label="The Pitchside way">
      <div className="philo__pin">
        <div className="philo__ghosts" aria-hidden="true">
          {LINES.map((l) => (
            <span key={l.ghost} data-ghost>
              {l.ghost}
            </span>
          ))}
        </div>
        <div className="philo__stack">
          <p className="eyebrow philo__eyebrow">The Pitchside way</p>
          <h2 className="philo__lines">
            {LINES.map((l) => (
              <span key={l.word} className="philo__line" data-line>
                {l.lead} <em className="serif">{l.word}</em>
              </span>
            ))}
          </h2>
          <div className="philo__captions">
            {LINES.map((l) => (
              <p key={l.caption} data-cap>
                {l.caption}
              </p>
            ))}
          </div>
          <div className="philo__meter" aria-hidden="true">
            {LINES.map((l) => (
              <span key={l.word} data-seg>
                <i />
              </span>
            ))}
          </div>
        </div>
        <div className="philo__curtain" aria-hidden="true" />
      </div>
    </section>
  );
}
