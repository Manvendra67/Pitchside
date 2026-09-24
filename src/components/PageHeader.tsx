import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        {eyebrow && (
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
        )}
        <h1 className="page-head__title" data-reveal="mask">
          {title}
        </h1>
        {sub && (
          <p className="page-head__sub" data-reveal="up">
            {sub}
          </p>
        )}
      </div>
      {actions && (
        <div className="page-head__actions" data-reveal="up">
          {actions}
        </div>
      )}
    </header>
  );
}
