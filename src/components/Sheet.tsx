import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { EASE, gsap, prefersReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/hooks';
import { useLenis } from './SmoothScroll';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** 'drawer' slides from the side on desktop; 'modal' scales in centred. Both become bottom sheets on phones. */
  kind?: 'drawer' | 'modal';
  footer?: ReactNode;
}

/**
 * Modal and drawer surface. Traps focus, closes on Escape or backdrop press,
 * pauses smooth scrolling underneath, and returns focus where it came from.
 */
export function Sheet({ open, onClose, title, description, children, kind = 'modal', footer }: Props) {
  const [mounted, setMounted] = useState(open);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const mobile = useIsMobile();
  const lenis = useLenis();
  const variant = mobile ? 'bottom' : kind;

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const p = panel.current;
    const b = backdrop.current;
    if (!p || !b) return;
    const reduced = prefersReducedMotion();
    const from = variant === 'bottom' ? { yPercent: 100 } : variant === 'drawer' ? { xPercent: 100 } : { scale: 0.94, y: 16, opacity: 0 };
    const to = variant === 'bottom' ? { yPercent: 0 } : variant === 'drawer' ? { xPercent: 0 } : { scale: 1, y: 0, opacity: 1 };

    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      lenis?.stop();
      if (reduced) gsap.set([p, b], { clearProps: 'all', opacity: 1 });
      else {
        gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE });
        gsap.fromTo(p, from, { ...to, duration: variant === 'modal' ? 0.4 : 0.5, ease: variant === 'modal' ? 'settle' : EASE });
      }
      requestAnimationFrame(() => p.querySelector<HTMLElement>('[data-autofocus], button, input, [href]')?.focus());
    } else {
      const done = () => {
        setMounted(false);
        lenis?.start();
        lastFocus.current?.focus?.();
      };
      if (reduced) done();
      else {
        gsap.to(b, { opacity: 0, duration: 0.24, ease: 'power2.in' });
        gsap.to(p, { ...from, duration: 0.28, ease: 'power2.in', onComplete: done });
      }
    }
  }, [open, mounted, variant, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => () => lenis?.start(), [lenis]);

  if (!mounted) return null;
  return createPortal(
    <div className={`sheet sheet--${variant}`}>
      <div ref={backdrop} className="sheet__backdrop" onClick={onClose} />
      <div
        ref={panel}
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        data-lenis-prevent
      >
        {variant === 'bottom' && <span className="sheet__grip" aria-hidden="true" />}
        <header className="sheet__head">
          <div>
            <h2 id={titleId} className="h3">
              {title}
            </h2>
            {description && (
              <p id={descId} className="muted sheet__desc">
                {description}
              </p>
            )}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        <div className="sheet__body">{children}</div>
        {footer && <footer className="sheet__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
