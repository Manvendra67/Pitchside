import { ArrowRight, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ButtonLink } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { Sheet } from '@/components/Sheet';
import { useLenis } from '@/components/SmoothScroll';
import { gsap, prefersReducedMotion, scrollState } from '@/lib/motion';
import { useStore } from '@/lib/store';

const LINKS = [
  { to: '#how', label: 'How it works' },
  { to: '/drills', label: 'Drills' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/learn', label: 'Learn' },
];

/**
 * Marketing nav. Hides while you read downwards, returns the moment you
 * scroll up, and turns to frosted glass once you leave the hero. A thin
 * scroll-progress line runs along its bottom edge.
 */
export function SiteNav() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const hover = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const { onboarded } = useStore();
  const lenis = useLenis();

  useEffect(() => {
    const el = root.current;
    const bar = progress.current;
    if (!el || !bar) return;
    let hidden = false;
    let solid = false;
    const setBar = gsap.quickSetter(bar, 'scaleX');
    const tick = () => {
      const y = scrollState.y || window.scrollY;
      setBar(scrollState.progress);
      const nextSolid = y > window.innerHeight * 0.6;
      if (nextSolid !== solid) {
        solid = nextSolid;
        el.dataset.solid = String(solid);
      }
      const nextHidden = !open && y > 240 && scrollState.direction === 1 && Math.abs(scrollState.velocity) > 0.4;
      const reveal = scrollState.direction === -1 || y < 240;
      if (nextHidden && !hidden) {
        hidden = true;
        if (!prefersReducedMotion()) gsap.to(el, { yPercent: -120, duration: 0.45, ease: 'power3.out', overwrite: true });
      } else if (reveal && hidden) {
        hidden = false;
        gsap.to(el, { yPercent: 0, duration: 0.5, ease: 'pitch', overwrite: true });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [open]);

  const moveHover = (target: HTMLElement | null) => {
    const h = hover.current;
    if (!h) return;
    if (!target) {
      gsap.to(h, { opacity: 0, duration: 0.2 });
      return;
    }
    const first = h.style.opacity === '' || h.style.opacity === '0';
    const props = { x: target.offsetLeft, width: target.offsetWidth, opacity: 1 };
    if (first) gsap.set(h, { ...props, opacity: 0 });
    gsap.to(h, { ...props, duration: 0.35, ease: 'settle', overwrite: true });
  };

  const onAnchor = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (!to.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector<HTMLElement>(to);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -16, duration: 1.4 });
    else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setOpen(false);
  };

  return (
    <header ref={root} className="site-nav theme-dark" data-solid="false" data-nav>
      <div className="site-nav__inner">
        <Link to="/" className="site-nav__brand" aria-label="Pitchside home" data-nav-item>
          <Logo size={28} />
        </Link>
        <nav aria-label="Site" className="site-nav__links" onMouseLeave={() => moveHover(null)}>
          <span ref={hover} className="site-nav__hover" aria-hidden="true" />
          {LINKS.map((l) =>
            l.to.startsWith('#') ? (
              <a key={l.to} href={l.to} onClick={(e) => onAnchor(e, l.to)} onMouseEnter={(e) => moveHover(e.currentTarget)} data-nav-item>
                {l.label}
              </a>
            ) : (
              <Link key={l.to} to={l.to} onMouseEnter={(e) => moveHover(e.currentTarget)} data-nav-item>
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="site-nav__actions" data-nav-item>
          <ButtonLink to="/dashboard" variant="ghost" size="sm" className="site-nav__secondary">
            {onboarded ? 'My dashboard' : 'See a demo'}
          </ButtonLink>
          <ButtonLink to={onboarded ? '/dashboard' : '/start'} portal variant="accent" size="sm" magnetic icon={<ArrowRight size={16} />}>
            {onboarded ? (
              'Train'
            ) : (
              <>
                Start<span className="hide-mobile"> Training</span>
              </>
            )}
          </ButtonLink>
          <button type="button" className="icon-btn icon-btn--lg site-nav__menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </div>
      <span ref={progress} className="site-nav__progress" aria-hidden="true" />
      <Sheet open={open} onClose={() => setOpen(false)} title="Menu" kind="drawer">
        <ul className="more-list">
          {[
            ...LINKS,
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/plan', label: 'Training Plan' },
            { to: '/progress', label: 'Progress' },
          ].map((l) => (
            <li key={l.to}>
              {l.to.startsWith('#') ? (
                <a href={l.to} className="more-list__link" onClick={(e) => onAnchor(e, l.to)}>
                  {l.label}
                  <ArrowRight size={18} className="more-list__arrow" />
                </a>
              ) : (
                <Link to={l.to} className="more-list__link" onClick={() => setOpen(false)}>
                  {l.label}
                  <ArrowRight size={18} className="more-list__arrow" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Sheet>
    </header>
  );
}
