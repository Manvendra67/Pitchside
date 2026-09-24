import { ArrowRight, Menu } from 'lucide-react';
import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router';
import { POSITION_BY_ID, LEVEL_BY_ID } from '@/data/positions';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { HOME_NAV, isActivePath, PRIMARY_NAV, SECONDARY_NAV, useRealLocation, type NavItem } from '@/lib/nav';
import { currentStreak } from '@/lib/stats';
import { useStore } from '@/lib/store';
import { AmbientPitch } from './Ambient';
import { Logo, LogoMark } from './Logo';
import { Sheet } from './Sheet';
import { PageSkeleton } from './Skeleton';

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials || 'P'}
    </span>
  );
}

/**
 * Nav list with one indicator that glides between destinations. It reads
 * the live location so it moves the instant you tap, while the page fades.
 */
function NavList({ items, label, compact = false }: { items: NavItem[]; label: string; compact?: boolean }) {
  const location = useRealLocation();
  const list = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const activeIndex = items.findIndex((i) => location && isActivePath(location.pathname, i.to));

  useLayoutEffect(() => {
    const ind = indicator.current;
    const link = list.current?.querySelectorAll<HTMLElement>('.nav__link')[activeIndex];
    if (!ind) return;
    if (!link) {
      gsap.to(ind, { opacity: 0, duration: 0.2 });
      placed.current = false;
      return;
    }
    const props = { y: link.offsetTop, height: link.offsetHeight, opacity: 1 };
    if (!placed.current || prefersReducedMotion()) gsap.set(ind, props);
    else gsap.to(ind, { ...props, duration: 0.42, ease: 'settle', overwrite: true });
    placed.current = true;
  }, [activeIndex]);

  return (
    <nav aria-label={label} className={`nav${compact ? ' nav--compact' : ''}`}>
      <span ref={indicator} className="nav__indicator" aria-hidden="true" />
      <ul ref={list}>
        {items.map((item, i) => {
          const Icon = item.icon;
          const active = i === activeIndex;
          return (
            <li key={item.to}>
              <Link to={item.to} className="nav__link" aria-current={active ? 'page' : undefined} data-active={active}>
                <Icon size={20} />
                <span className="nav__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Sidebar() {
  const { profile, activity } = useStore();
  const pos = POSITION_BY_ID[profile.position];
  const streak = currentStreak(activity);
  return (
    <aside className="sidebar theme-dark" aria-label="Pitchside navigation">
      <Link to="/" className="sidebar__brand" aria-label="Pitchside home">
        <Logo size={26} />
        <LogoMark size={28} className="sidebar__mark" />
      </Link>
      <Link to="/profile" className="player-chip" aria-label={`${profile.name}, ${pos.name}. Open profile`}>
        <Avatar name={profile.name} />
        <span className="player-chip__text">
          <strong>{profile.name}</strong>
          <span>
            {pos.name} · {LEVEL_BY_ID[profile.level].name}
          </span>
        </span>
        <span className="player-chip__streak" title={`${streak}-day streak`}>
          {streak}
        </span>
      </Link>
      <div className="sidebar__group">
        <p className="sidebar__heading">Train</p>
        <NavList items={PRIMARY_NAV} label="Main" />
      </div>
      <div className="sidebar__group">
        <p className="sidebar__heading">More</p>
        <NavList items={SECONDARY_NAV} label="More" />
      </div>
      <div className="sidebar__foot">
        <NavList items={[HOME_NAV]} label="Site" compact />
      </div>
    </aside>
  );
}

function TabBar() {
  const location = useRealLocation();
  const bar = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const activeIndex = PRIMARY_NAV.findIndex((i) => location && isActivePath(location.pathname, i.to));

  useLayoutEffect(() => {
    const ind = indicator.current;
    const link = bar.current?.querySelectorAll<HTMLElement>('.tabbar__link')[activeIndex];
    if (!ind) return;
    if (!link) {
      gsap.set(ind, { opacity: 0 });
      placed.current = false;
      return;
    }
    const props = { x: link.offsetLeft + link.offsetWidth / 2 - 22, opacity: 1 };
    if (!placed.current || prefersReducedMotion()) gsap.set(ind, props);
    else gsap.to(ind, { ...props, duration: 0.42, ease: 'settle', overwrite: true });
    placed.current = true;
  }, [activeIndex]);

  return (
    <nav className="tabbar theme-dark" aria-label="Main">
      <span ref={indicator} className="tabbar__indicator" aria-hidden="true" />
      <ul ref={bar}>
        {PRIMARY_NAV.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="tabbar__link"
                aria-current={i === activeIndex ? 'page' : undefined}
                data-active={i === activeIndex}
              >
                <Icon size={22} />
                <span>{item.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileHeader() {
  const { profile } = useStore();
  const [open, setOpen] = useState(false);
  const location = useRealLocation();
  return (
    <header className="mobile-header">
      <Link to="/" aria-label="Pitchside home">
        <Logo size={24} />
      </Link>
      <div className="mobile-header__actions">
        <Link to="/profile" aria-label="Your profile">
          <Avatar name={profile.name} size={38} />
        </Link>
        <button type="button" className="icon-btn icon-btn--lg" aria-label="More pages" onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="More" kind="drawer">
        <ul className="more-list">
          {[...SECONDARY_NAV, HOME_NAV].map((item) => {
            const Icon = item.icon;
            const active = location ? isActivePath(location.pathname, item.to) : false;
            return (
              <li key={item.to}>
                <Link to={item.to} className="more-list__link" data-active={active} onClick={() => setOpen(false)}>
                  <span className="more-list__icon">
                    <Icon size={22} />
                  </span>
                  {item.label}
                  <ArrowRight size={18} className="more-list__arrow" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </header>
  );
}

function DemoBanner() {
  const { profile } = useStore();
  if (!profile.isDemo) return null;
  return (
    <div className="demo-banner" role="note">
      <span className="demo-banner__dot" aria-hidden="true" />
      <p>
        <span className="hide-mobile">You’re looking around with </span>
        <strong>{profile.name}’s</strong> sample profile<span className="hide-mobile">.</span>
      </p>
      <Link to="/start" className="demo-banner__cta">
        Make it yours <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="app" data-layout="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AmbientPitch />
      <Sidebar />
      <div className="app__main">
        <MobileHeader />
        <DemoBanner />
        <main id="main" className="app__view" data-route-view tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <TabBar />
    </div>
  );
}

export { Avatar };
