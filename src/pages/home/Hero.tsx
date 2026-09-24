import { ArrowRight, Check } from 'lucide-react';
import { useRef } from 'react';
import { Particles } from '@/components/Ambient';
import { ButtonLink } from '@/components/Button';
import { useIntroDone } from '@/components/IntroLoader';
import { CoachBadge } from '@/components/Tags';
import { DRILLS } from '@/data/drills';
import { canHover, EASE, EASE_IN_OUT, gsap, isLiteDevice, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { useStore } from '@/lib/store';
import { MiniBall, MiniDrillRow, MiniFuelBars, MiniStreakDots } from './Mini';

/** Full-size pitch, 105 × 68 m at 10 px per metre, with mowing stripes. */
function HeroPitch() {
  return (
    <svg className="hero-pitch" viewBox="0 0 1050 680" aria-hidden="true">
      <defs>
        <linearGradient id="hp-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="hp-light" cx="62%" cy="30%" r="70%">
          <stop offset="0" stopColor="#dcf55c" stopOpacity=".16" />
          <stop offset=".5" stopColor="#2f8559" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id="hp-mask">
          <rect width="1050" height="680" fill="url(#hp-fade)" />
        </mask>
      </defs>
      <g className="hero-pitch__stripes">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={i * 105} width="105" height="680" fill={i % 2 ? '#0f3322' : '#12392a'} />
        ))}
      </g>
      <rect width="1050" height="680" fill="url(#hp-light)" />
      <g className="hero-pitch__lines" mask="url(#hp-mask)" fill="none" stroke="rgba(244,243,234,.62)" strokeWidth="3">
        <rect x="10" y="10" width="1030" height="660" pathLength={1} />
        <path d="M525 10V670" pathLength={1} />
        <circle cx="525" cy="340" r="91.5" pathLength={1} />
        <rect x="10" y="138.4" width="165" height="403.2" pathLength={1} />
        <rect x="875" y="138.4" width="165" height="403.2" pathLength={1} />
        <rect x="10" y="248.4" width="55" height="183.2" pathLength={1} />
        <rect x="985" y="248.4" width="55" height="183.2" pathLength={1} />
        <path d="M175 266.9A91.5 91.5 0 0 1 175 413.1" pathLength={1} />
        <path d="M875 266.9A91.5 91.5 0 0 0 875 413.1" pathLength={1} />
        <path
          d="M10 20A10 10 0 0 0 20 10M1030 10A10 10 0 0 0 1040 20M1040 660A10 10 0 0 0 1030 670M20 670A10 10 0 0 0 10 660"
          pathLength={1}
        />
      </g>
      <g fill="rgba(244,243,234,.7)">
        <circle cx="525" cy="340" r="4" />
        <circle cx="120" cy="340" r="4" />
        <circle cx="930" cy="340" r="4" />
      </g>
      <rect x="1040" y="303" width="10" height="74" fill="rgba(244,243,234,.5)" />

      {/* Tactics: pass → run → shot */}
      <g className="hero-pitch__play" fill="none" strokeLinecap="round">
        <path data-play="pass" d="M560 330C640 250 690 170 760 132" stroke="#f4f3ea" strokeWidth="4" strokeDasharray="1" pathLength={1} />
        <path data-play="run" d="M770 128C850 140 890 200 905 262" stroke="#dcf55c" strokeWidth="4" strokeDasharray="1" pathLength={1} />
        <path data-play="shot" d="M912 276L1036 322" stroke="#ff8d5c" strokeWidth="5" strokeDasharray="1" pathLength={1} />
      </g>
      <g className="hero-pitch__players">
        {[
          [560, 330],
          [420, 190],
          [380, 470],
          [640, 520],
          [250, 330],
        ].map(([x, y], i) => (
          <g key={i} data-player transform={`translate(${x} ${y})`}>
            <circle r="15" fill="rgba(244,243,234,.14)" />
            <circle r="8" fill="#f4f3ea" />
          </g>
        ))}
        <g data-player data-you transform="translate(765 128)">
          <circle data-you-pulse r="30" fill="#dcf55c" opacity=".2" />
          <circle r="11" fill="#dcf55c" stroke="#05120c" strokeWidth="3" />
        </g>
      </g>
    </svg>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useIntroDone();
  const { onboarded } = useStore();

  // Ambient loops, scroll-linked parallax and cursor response.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const lite = isLiteDevice();

      gsap.set(q('[data-play]'), { strokeDashoffset: 1 });

      // Slow camera drift — the whole scene breathes.
      gsap.to(q('.hero__drift'), { rotationZ: 1.6, y: -10, x: 8, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // The move on the pitch: pass, run, shot, reset. Continuous micro-movement.
      const play = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 3.2 });
      play
        .to(q('[data-play="pass"]'), { strokeDashoffset: 0, duration: 0.9, ease: EASE_IN_OUT })
        .to(q('[data-you-pulse]'), { scale: 1.6, opacity: 0, duration: 0.8, ease: EASE, transformOrigin: '50% 50%' }, '-=0.1')
        .to(q('[data-play="run"]'), { strokeDashoffset: 0, duration: 1.1, ease: EASE_IN_OUT }, '-=0.5')
        .to(q('[data-play="shot"]'), { strokeDashoffset: 0, duration: 0.45, ease: 'power2.in' }, '+=0.1')
        .to(q('[data-play]'), { opacity: 0, duration: 0.6, ease: EASE }, '+=1.2')
        .set(q('[data-play]'), { strokeDashoffset: 1, opacity: 1 })
        .set(q('[data-you-pulse]'), { scale: 1, opacity: 0.2 });

      // Scroll: multi-speed parallax. Copy lifts fastest, the pitch sinks,
      // each card drifts at its own depth, the ball rolls.
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.5 };
      gsap.to(q('.hero__copy'), { y: -160, opacity: 0.1, ease: 'none', scrollTrigger: st });
      gsap.to(q('.hero__stage'), { y: 110, scale: 1.05, ease: 'none', scrollTrigger: st });
      q('.floater').forEach((el) => {
        const depth = Number((el as HTMLElement).dataset.depth ?? 1);
        gsap.to(el, { y: -90 * depth, ease: 'none', scrollTrigger: st });
      });
      gsap.to(q('.hero__ball-spin'), { rotation: 540, ease: 'none', scrollTrigger: st });
      gsap.to(q('.hero__glow'), { opacity: 0.35, scale: 1.2, ease: 'none', scrollTrigger: st });

      // Cursor: the camera leans towards the pointer; near cards move more.
      if (!canHover() || lite) return;
      const camRX = gsap.quickTo(q('.hero__camera'), 'rotationX', { duration: 1.2, ease: 'power3.out' });
      const camRY = gsap.quickTo(q('.hero__camera'), 'rotationY', { duration: 1.2, ease: 'power3.out' });
      const movers = q('.floater__mouse').map((el) => {
        const depth = Number((el.parentElement as HTMLElement).dataset.depth ?? 1);
        return {
          depth,
          x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
        };
      });
      const onMove = (e: PointerEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        camRY(nx * 5);
        camRX(-ny * 3.5);
        movers.forEach((m) => {
          m.x(nx * 16 * m.depth);
          m.y(ny * 12 * m.depth);
        });
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { scope: root },
  );

  // Entrance. While the logo reveal is on screen everything waits hidden;
  // once it hands over, each layer animates from explicit start states.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const from = {
        lines: { yPercent: 108 },
        soft: { opacity: 0, y: 14 },
        sub: { opacity: 0, y: 16, filter: 'blur(10px)' },
        ctas: { opacity: 0, y: 18, scale: 0.94 },
        underline: { strokeDashoffset: 1 },
        plane: { rotationX: 76, rotationZ: -20, scale: 0.86, opacity: 0, transformOrigin: '50% 60%' },
        pitchLines: { strokeDasharray: 1, strokeDashoffset: 1 },
        players: { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' },
        cards: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' },
        ball: { opacity: 0, y: -120 },
        particles: { opacity: 0 },
      };
      if (!introDone) {
        gsap.set(q('.hero__line > span'), from.lines);
        gsap.set(q('.hero__eyebrow, .hero__proof li'), from.soft);
        gsap.set(q('.hero__sub'), from.sub);
        gsap.set(q('.hero__ctas > *'), from.ctas);
        gsap.set(q('.hero__underline path'), from.underline);
        gsap.set(q('.hero__plane'), from.plane);
        gsap.set(q('.hero-pitch__lines > *'), from.pitchLines);
        gsap.set(q('[data-player]'), from.players);
        gsap.set(q('.floater__card'), from.cards);
        gsap.set(q('.hero__ball'), from.ball);
        gsap.set(q('.particles'), from.particles);
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      tl.fromTo(q('.hero__eyebrow'), from.soft, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(q('.hero__line > span'), from.lines, { yPercent: 0, duration: 0.9, stagger: 0.09 }, '<0.05')
        .fromTo(q('.hero__underline path'), from.underline, { strokeDashoffset: 0, duration: 0.8, ease: EASE_IN_OUT }, '-=0.35')
        .fromTo(q('.hero__sub'), from.sub, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, '-=0.7')
        .fromTo(q('.hero__ctas > *'), from.ctas, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'settle' }, '-=0.45')
        .fromTo(q('.hero__proof li'), from.soft, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, '-=0.35')
        .fromTo(
          q('.hero__plane'),
          from.plane,
          { rotationX: 58, rotationZ: -24, scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' },
          0.2,
        )
        .fromTo(q('.hero-pitch__lines > *'), from.pitchLines, { strokeDashoffset: 0, duration: 1.3, stagger: 0.05, ease: EASE_IN_OUT }, 0.5)
        .fromTo(q('[data-player]'), from.players, { scale: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(2.4)' }, 1.1)
        .fromTo(
          q('.floater__card'),
          from.cards,
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.11, ease: 'settle' },
          0.9,
        )
        .fromTo(q('.hero__ball'), from.ball, { opacity: 1, y: 0, duration: 0.9, ease: 'bounce.out' }, 1.2)
        .fromTo(q('.particles'), from.particles, { opacity: 1, duration: 1.6 }, 0.8)
        .add(() => {
          // Idle float after landing — tiny, slow, never distracting.
          q('.floater__card').forEach((el, i) =>
            gsap.to(el, { y: i % 2 ? 7 : -7, duration: 3.4 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
          );
          gsap.to(q('.hero__ball'), { y: -8, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        });
    },
    { scope: root, dependencies: [introDone] },
  );

  const start = onboarded ? '/dashboard' : '/start';

  return (
    <section ref={root} className="hero theme-dark" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" />
        <div className="hero__grid" />
        <Particles />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="hero__live" aria-hidden="true" />
            Football development for players aged 8–13
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>Train smarter.</span>
            </span>
            <span className="hero__line">
              <span>Eat better.</span>
            </span>
            <span className="hero__line">
              <span>
                Improve{' '}
                <em className="serif hero__em">
                  every day.
                  <svg className="hero__underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 14C60 6 140 4 296 10" pathLength={1} strokeDasharray={1} />
                  </svg>
                </em>
              </span>
            </span>
          </h1>
          <p className="hero__sub">
            Your own football academy. Drills checked by a real coach, a fuel guide sized for you, and an easy way to see yourself getting
            better.
          </p>
          <div className="hero__ctas">
            <ButtonLink to={start} portal variant="accent" size="xl" magnetic cursor="Go" icon={<ArrowRight size={20} />}>
              Start Training
            </ButtonLink>
            <ButtonLink to="/drills" variant="secondary" size="xl">
              Explore Drills
            </ButtonLink>
          </div>
          <ul className="hero__proof">
            <li>
              <b>{DRILLS.length}</b> coach-reviewed drills
            </li>
            <li>
              <b>&lt;60s</b> to set up
            </li>
            <li>
              <b>0</b> ads, ever
            </li>
          </ul>
        </div>

        <div className="hero__stage" aria-hidden="true">
          <div className="hero__camera">
            <div className="hero__plane">
              <div className="hero__drift">
                <HeroPitch />
              </div>
            </div>
          </div>

          <div className="hero__floaters">
            <div className="floater floater--session" data-depth="1.4">
              <div className="floater__mouse">
                <div className="floater__card hcard">
                  <div className="hcard__head">
                    <span className="eyebrow">Today’s session</span>
                    <span className="chip chip--volt">23 min</span>
                  </div>
                  <p className="hcard__title">Ball Control + Speed</p>
                  <MiniDrillRow id="cone-weave" done />
                  <MiniDrillRow id="quick-feet-ladder" />
                </div>
              </div>
            </div>

            <div className="floater floater--streak" data-depth="2">
              <div className="floater__mouse">
                <div className="floater__card hcard hcard--streak">
                  <span className="hcard__big">7</span>
                  <span className="hcard__label">
                    day streak
                    <MiniStreakDots filled={7} />
                  </span>
                </div>
              </div>
            </div>

            <div className="floater floater--fuel" data-depth="1.1">
              <div className="floater__mouse">
                <div className="floater__card hcard">
                  <div className="hcard__head">
                    <span className="eyebrow">Fuel your game</span>
                    <span className="hcard__kg">34 kg</span>
                  </div>
                  <MiniFuelBars compact />
                </div>
              </div>
            </div>

            <div className="floater floater--coach" data-depth="2.4">
              <div className="floater__mouse">
                <div className="floater__card hcard hcard--chip">
                  <CoachBadge />
                  <span className="hcard__tick">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
              </div>
            </div>

            <div className="floater floater--ball" data-depth="2.8">
              <div className="floater__mouse">
                <div className="hero__ball">
                  <div className="hero__ball-spin">
                    <MiniBall size={70} />
                  </div>
                  <span className="hero__ball-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
