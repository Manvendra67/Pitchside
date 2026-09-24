import type { ReactNode } from 'react';
import type { ArticleArt as Art } from '@/data/articles';

/**
 * Editorial illustrations for Football Knowledge — simple geometric scenes
 * drawn in the Pitchside palette, so nothing needs to be downloaded.
 */
export function ArticleArt({ art, className = '' }: { art: Art; className?: string }) {
  return (
    <svg className={`art art--${art} ${className}`} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`art-bg-${art}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BG[art][0]} />
          <stop offset="1" stopColor={BG[art][1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#art-bg-${art})`} />
      <g className="art__lines" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5">
        <circle cx="200" cy="130" r="70" />
        <path d="M200 0v260" />
      </g>
      <g className="art__main">{SCENES[art]}</g>
    </svg>
  );
}

const BG: Record<Art, [string, string]> = {
  touch: ['#133a28', '#081b12'],
  scan: ['#1a4d35', '#0b2419'],
  plate: ['#2a2a12', '#141b0c'],
  water: ['#0e3a52', '#081b24'],
  sleep: ['#1c1f3d', '#0a0c1e'],
  team: ['#3a1f14', '#1a0d08'],
  warmup: ['#3a2410', '#1a1008'],
  habit: ['#0e2d1f', '#05120c'],
};

const SCENES: Record<Art, ReactNode> = {
  touch: (
    <>
      <path d="M90 200 Q 200 60 300 170" stroke="#dcf55c" strokeWidth="3" strokeDasharray="6 8" fill="none" />
      <circle cx="300" cy="170" r="26" fill="#f7f6f0" />
      <path d="M300 160l8 6-3 9h-10l-3-9z" fill="#0b1510" />
      <circle cx="90" cy="200" r="12" fill="#dcf55c" />
      <circle cx="300" cy="170" r="44" fill="none" stroke="#dcf55c" strokeOpacity=".35" strokeWidth="2" />
    </>
  ),
  scan: (
    <>
      <path d="M200 150 L 90 60 A 140 140 0 0 1 150 30 Z" fill="#dcf55c" opacity=".22" />
      <path d="M200 150 L 310 60 A 140 140 0 0 0 250 30 Z" fill="#dcf55c" opacity=".14" />
      <circle cx="200" cy="150" r="16" fill="#dcf55c" />
      {[
        [110, 80],
        [290, 90],
        [140, 210],
        [270, 205],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="#f4f3ea" opacity=".85" />
      ))}
    </>
  ),
  plate: (
    <>
      <circle cx="200" cy="130" r="82" fill="#f4f3ea" />
      <path d="M200 130 L200 48 A82 82 0 1 1 124 162 Z" fill="#f1b52e" />
      <path d="M200 130 L124 162 A82 82 0 0 1 146 70 Z" fill="#ff7a5c" />
      <path d="M200 130 L146 70 A82 82 0 0 1 200 48 Z" fill="#3fbfae" />
      <circle cx="200" cy="130" r="30" fill="#f4f3ea" />
    </>
  ),
  water: (
    <>
      <path d="M200 50 C 240 110 260 140 260 170 A 60 60 0 0 1 140 170 C 140 140 160 110 200 50 Z" fill="#6fc5ee" />
      <path d="M175 170 A 28 28 0 0 0 200 196" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M40 225 Q 80 210 120 225 T 200 225 T 280 225 T 360 225" stroke="#6fc5ee" strokeWidth="3" fill="none" opacity=".5" />
    </>
  ),
  sleep: (
    <>
      <path d="M230 70 A 70 70 0 1 0 290 170 A 56 56 0 1 1 230 70 Z" fill="#f4f3ea" />
      {[
        [110, 70, 3],
        [140, 120, 2],
        [90, 170, 2.5],
        [320, 60, 2],
        [330, 120, 3],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#dcf55c" />
      ))}
    </>
  ),
  team: (
    <>
      <path d="M130 170 L200 90 L270 170 Z" stroke="#dcf55c" strokeWidth="3" strokeDasharray="6 8" fill="none" />
      <circle cx="130" cy="170" r="20" fill="#ff8d5c" />
      <circle cx="200" cy="90" r="20" fill="#f4f3ea" />
      <circle cx="270" cy="170" r="20" fill="#dcf55c" />
    </>
  ),
  warmup: (
    <>
      <path
        d="M40 140 H130 L150 90 L175 200 L200 110 L215 150 H360"
        stroke="#ff8d5c"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="360" cy="150" r="8" fill="#ff8d5c" />
    </>
  ),
  habit: (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const x = 110 + (i % 7) * 30;
        const y = 95 + Math.floor(i / 7) * 40;
        const on = [0, 2, 4, 5, 7, 9, 11, 12].includes(i);
        return <rect key={i} x={x} y={y} width="22" height="22" rx="6" fill={on ? '#dcf55c' : 'rgba(255,255,255,.12)'} />;
      })}
    </>
  ),
};
