import { useEffect } from 'react';
import { Marquee } from '@/components/Marquee';
import { POSITIONS } from '@/data/positions';
import { useDocumentTitle } from '@/lib/hooks';
import { ScrollTrigger } from '@/lib/motion';
import '@/styles/home.css';
import { CtaPortal } from './CtaPortal';
import { ForParents } from './ForParents';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Inside } from './Inside';
import { Journey } from './Journey';
import { Philosophy } from './Philosophy';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';

export default function Home() {
  useDocumentTitle('');

  // Pinned sections measure layout; re-measure once fonts have settled.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <div className="home" data-layout="home">
      <a className="skip-link" href="#home-main">
        Skip to content
      </a>
      <SiteNav />
      <main id="home-main" data-route-view>
        <Hero />
        <div className="home__marquee home__marquee--big theme-dark">
          <Marquee items={['Train', 'Play', 'Improve', 'Recover', 'Repeat']} speed={70} label="Train, play, improve, recover, repeat" />
        </div>
        <Philosophy />
        <Journey />
        <HowItWorks />
        <div className="home__marquee home__marquee--outline">
          <Marquee items={POSITIONS.map((p) => p.name)} speed={40} direction={-1} label="Built for every position" />
        </div>
        <Inside />
        <ForParents />
        <CtaPortal />
      </main>
      <SiteFooter />
    </div>
  );
}
