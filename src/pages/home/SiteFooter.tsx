import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ButtonLink } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { COACH } from '@/data/coach';
import { CATEGORIES } from '@/data/positions';
import { useStore } from '@/lib/store';

const PRODUCT = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/plan', label: 'Training Plan' },
  { to: '/drills', label: 'Drills' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/progress', label: 'Progress' },
];

const LEARN = [
  { to: '/learn', label: 'Football Knowledge' },
  { to: '/coach', label: 'Coach & Feedback' },
  { to: '/profile', label: 'Profile' },
];

export function SiteFooter() {
  const { onboarded } = useStore();
  return (
    <footer className="footer theme-dark">
      <div className="container">
        <div className="footer__cta">
          <h2 className="footer__cta-title">
            Ready to <em className="serif">train?</em>
          </h2>
          <ButtonLink to={onboarded ? '/dashboard' : '/start'} portal variant="accent" size="xl" magnetic icon={<ArrowRight size={20} />}>
            {onboarded ? 'Open my dashboard' : 'Set up in 60 seconds'}
          </ButtonLink>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo size={30} />
            <p>
              Pitchside helps young footballers aged 8–13 train with purpose, fuel their bodies well and enjoy getting better — one small
              step at a time.
            </p>
          </div>
          <nav className="footer__col" aria-label="Product">
            <p className="eyebrow">Product</p>
            <ul>
              {PRODUCT.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="footer__col" aria-label="Training categories">
            <p className="eyebrow">Train</p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/drills?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="footer__col" aria-label="Learn">
            <p className="eyebrow">Learn</p>
            <ul>
              {LEARN.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__safety">
          <p>
            <strong>Safety first.</strong> Pitchside gives general training and nutrition guidance for young players. It is not medical
            advice and does not replace a parent, doctor, registered dietitian or qualified coach. Nutrition targets are based on published
            youth sports guidance. Always warm up, train on a safe surface, drink water, and stop if something hurts.
          </p>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Pitchside</span>
          <span>Every drill reviewed by {COACH.name}</span>
          <span>Made for players aged 8–13</span>
        </div>
      </div>
      <div className="footer__word" aria-hidden="true">
        Pitchside
      </div>
    </footer>
  );
}
