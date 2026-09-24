import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { useDocumentTitle } from '@/lib/hooks';
import '@/styles/pages.css';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="page not-found">
      <svg className="not-found__flag" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M30 110V14" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M33 16h54l-12 18 12 18H33z" fill="var(--volt-400)" />
        <path d="M33 16h27v18H33zM60 34h27l-12 18H60z" fill="var(--flare-500)" opacity=".85" />
      </svg>
      <p className="eyebrow">Error 404</p>
      <h1 className="page-head__title">
        Offside! <span className="serif">This page isn’t in play.</span>
      </h1>
      <p className="page-head__sub">The page you were looking for doesn’t exist. Let’s get you back on the pitch.</p>
      <div className="not-found__actions">
        <ButtonLink to="/dashboard" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
          Go to my dashboard
        </ButtonLink>
        <ButtonLink to="/" variant="secondary" size="lg">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
