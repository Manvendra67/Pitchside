interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
}

/** A pitch seen from above: touchline, halfway line, centre circle and spot. */
export function LogoMark({ size = 30, className, title }: LogoMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect data-part="pitch" x="2.5" y="5" width="27" height="22" rx="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path data-part="line" d="M16 5v22" stroke="currentColor" strokeWidth="2.2" />
      <circle data-part="circle" cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2.2" />
      <circle data-part="spot" cx="16" cy="16" r="1.6" fill="var(--logo-spot, var(--volt-400))" />
    </svg>
  );
}

export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`logo ${className}`} role="img" aria-label="Pitchside">
      <LogoMark size={size} />
      <span className="logo__word" aria-hidden="true">
        Pitchside
      </span>
    </span>
  );
}
