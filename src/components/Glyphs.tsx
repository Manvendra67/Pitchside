import type { SVGProps } from 'react';

/** Football-specific glyphs that icon sets don't cover well. */

export function Ball({ size = 24, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" {...rest}>
      <circle cx="24" cy="24" r="21" fill="var(--ball-fill, #f7f6f0)" stroke="var(--ball-line, #0b1510)" strokeWidth="2" />
      <path
        d="M24 15.5l7.6 5.5-2.9 8.9h-9.4l-2.9-8.9z"
        fill="var(--ball-patch, #0b1510)"
        stroke="var(--ball-line, #0b1510)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M24 15.5V5.8M31.6 21l9.1-3.6M28.7 29.9l5.8 8M19.3 29.9l-5.8 8M16.4 21l-9.1-3.6"
        stroke="var(--ball-line, #0b1510)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.5 6.9l6.5-1.1 6.5 1.1M40.7 17.4l2 6.2-1.5 6.5M34.5 37.9l-5 4.2-5.5.9M13.5 37.9l5 4.2M7.3 17.4l-2 6.2 1.5 6.5"
        stroke="var(--ball-line, #0b1510)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".55"
      />
    </svg>
  );
}

export function Cone({ size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <path d="M9.6 4.5h4.8L19 19H5z" fill="currentColor" opacity=".9" />
      <path d="M7.4 12.2h9.2" stroke="var(--cone-band, #fff)" strokeWidth="1.6" opacity=".85" />
      <rect x="3" y="18.5" width="18" height="2.5" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function Whistle({ size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M4 13.5a5.5 5.5 0 0 0 10.6 2.1l1.1-2.6H21V9H9.5A5.5 5.5 0 0 0 4 13.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="13.5" r="1.6" fill="currentColor" />
      <path d="M12 9V6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Boot({ size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M5 5h6l1 5 6.4 2.2A3 3 0 0 1 20.5 15v1.5H4.2A1.2 1.2 0 0 1 3 15.3V7a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M6 19.5h1.5M11 19.5h1.5M16 19.5h1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Level indicator: 1–3 rising bars. */
export function LevelBars({ level, className = '' }: { level: 1 | 2 | 3; className?: string }) {
  return (
    <span className={`level-bars ${className}`} aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <i key={i} data-on={i <= level || undefined} style={{ height: 4 + i * 3 }} />
      ))}
    </span>
  );
}
