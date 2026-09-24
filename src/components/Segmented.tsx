import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { DUR, gsap, prefersReducedMotion } from '@/lib/motion';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
  /** Accessible label when `label` is not plain text. */
  aria?: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  role?: 'radiogroup' | 'tablist';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark' | 'ghost';
  className?: string;
  /** For tabs: id prefix used to link tabs to their panels. */
  idBase?: string;
  scroll?: boolean;
}

/**
 * Pills with a sliding active indicator. The indicator glides to the new
 * option with a small settle, so the eye follows the change.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  role = 'radiogroup',
  size = 'md',
  tone = 'light',
  className = '',
  idBase,
  scroll = false,
}: Props<T>) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  const place = (animate: boolean) => {
    const el = root.current?.querySelector<HTMLElement>('[data-active="true"]');
    const ind = indicator.current;
    if (!el || !ind) return;
    const props = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, opacity: 1 };
    if (!animate || !placed.current || prefersReducedMotion()) gsap.set(ind, props);
    else gsap.to(ind, { ...props, duration: DUR.panel + 0.06, ease: 'settle', overwrite: true });
    placed.current = true;
    if (scroll) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  useLayoutEffect(() => {
    place(true);
  }, [value, options.length]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(node);
    document.fonts?.ready.then(() => place(false));
    return () => ro.disconnect();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.value === value);
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next].value);
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[next].value)}"]`)?.focus());
  };

  const isTabs = role === 'tablist';

  return (
    <div
      ref={root}
      className={`seg seg--${size} seg--${tone}${scroll ? ' seg--scroll' : ''} ${className}`}
      role={role}
      aria-label={label}
      onKeyDown={onKey}
      data-lenis-prevent={scroll || undefined}
    >
      <span ref={indicator} className="seg__indicator" aria-hidden="true" />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            className="seg__opt"
            data-value={o.value}
            data-active={active}
            role={isTabs ? 'tab' : 'radio'}
            aria-checked={isTabs ? undefined : active}
            aria-selected={isTabs ? active : undefined}
            aria-controls={isTabs && idBase ? `${idBase}-panel-${o.value}` : undefined}
            id={idBase ? `${idBase}-tab-${o.value}` : undefined}
            aria-label={o.aria}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
          >
            {o.icon && <span className="seg__icon">{o.icon}</span>}
            <span>{o.label}</span>
            {o.count !== undefined && <span className="seg__count">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
