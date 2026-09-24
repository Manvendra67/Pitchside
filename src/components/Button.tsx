import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { usePortal } from './Portal';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'dark' | 'light';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  magnetic?: boolean;
  block?: boolean;
  className?: string;
  children?: ReactNode;
  /** Label shown by the custom cursor. */
  cursor?: string;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type LinkProps = CommonProps & {
  to: string;
  /** Use the circular portal transition for this navigation. */
  portal?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
};

/** Pill-fill hover: the fill grows from where the pointer entered. */
function trackEntry(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--hx', `${e.clientX - r.left}px`);
  el.style.setProperty('--hy', `${e.clientY - r.top}px`);
}

function classes({ variant = 'primary', size = 'md', block, className = '' }: CommonProps) {
  return `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim();
}

function Inner({ icon, iconLeft, children }: CommonProps) {
  return (
    <>
      <span className="btn__fill" aria-hidden="true" />
      {iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
      {children && <span className="btn__label">{children}</span>}
      {icon && <span className="btn__icon">{icon}</span>}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, icon, iconLeft, magnetic, block, className, children, cursor, type, ...rest } = props;
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes({ variant, size, block, className })}
      data-magnetic={magnetic || undefined}
      data-cursor={cursor}
      onPointerEnter={trackEntry}
      {...rest}
    >
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </button>
  );
});

export function ButtonLink(props: LinkProps) {
  const { to, portal, variant, size, icon, iconLeft, magnetic, block, className, children, cursor, onClick } = props;
  const openPortal = usePortal();
  return (
    <Link
      to={to}
      className={classes({ variant, size, block, className })}
      data-magnetic={magnetic || undefined}
      data-cursor={cursor}
      aria-label={props['aria-label']}
      onPointerEnter={trackEntry}
      onClick={(e) => {
        onClick?.(e);
        if (portal && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          openPortal(to, e.currentTarget);
        }
      }}
    >
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </Link>
  );
}
