import type { ReactNode } from 'react';
import { DrillDiagram } from '@/components/DrillDiagram';
import { Ball } from '@/components/Glyphs';
import { DRILL_BY_ID } from '@/data/drills';
import { DEMO_PROFILE } from '@/data/seed';
import { fuelTargets, NUTRIENT_BY_ID } from '@/lib/nutrition';

/**
 * Miniature, living slices of the real product used on the home page. They
 * are built from the same data and rules as the app, so the story the home
 * page tells is the product the player gets.
 */

export const DEMO_FUEL = fuelTargets(DEMO_PROFILE.weightKg, 'training');

export function MiniWindow({ url, children, className = '' }: { url: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`mini-window ${className}`}>
      <div className="mini-window__bar">
        <span className="mini-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="mini-window__url">
          <span className="mini-window__lock" aria-hidden="true" />
          pitchside.app/<b>{url}</b>
        </span>
      </div>
      <div className="mini-window__body">{children}</div>
    </div>
  );
}

export function MiniFuelBars({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mini-fuel${compact ? ' mini-fuel--compact' : ''}`}>
      {DEMO_FUEL.map((t) => {
        const n = NUTRIENT_BY_ID[t.id];
        return (
          <div key={t.id} className="mini-fuel__row" style={{ ['--tone' as string]: `var(${n.tone})` }}>
            <span className="mini-fuel__name">{compact ? n.short : n.name}</span>
            <span className="mini-fuel__track">
              <i data-fill style={{ ['--w' as string]: `${Math.max(18, t.share * 100 + 20)}%` }} />
            </span>
            <span className="mini-fuel__val">
              {t.grams}
              <small>g</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MiniStreakDots({ days = 7, filled = 6 }: { days?: number; filled?: number }) {
  return (
    <span className="mini-dots" aria-hidden="true">
      {Array.from({ length: days }, (_, i) => (
        <i key={i} data-on={i < filled || undefined} data-today={i === filled || undefined} />
      ))}
    </span>
  );
}

export function MiniDrillRow({ id, done = false }: { id: string; done?: boolean }) {
  const d = DRILL_BY_ID[id];
  return (
    <div className="mini-drill" data-done={done || undefined}>
      <span className="mini-drill__thumb">
        <DrillDiagram diagram={d.diagram} />
      </span>
      <span className="mini-drill__text">
        <b>{d.name}</b>
        <span>
          {d.duration} min · {d.equipment.slice(0, 2).join(', ')}
        </span>
      </span>
      <span className="mini-drill__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M5 12.5l4.6 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export function MiniWeekBars({ values = [2, 3, 3, 4, 3, 4], highlight = true }: { values?: number[]; highlight?: boolean }) {
  const max = 7;
  return (
    <div className="mini-bars" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className="mini-bars__col">
          <i data-bar data-last={(highlight && i === values.length - 1) || undefined} style={{ height: `${(v / max) * 100}%` }} />
          <small>W{i + 1}</small>
        </span>
      ))}
    </div>
  );
}

export function MiniBall({ size = 64 }: { size?: number }) {
  return (
    <span className="mini-ball" style={{ width: size, height: size }}>
      <Ball size={size} />
    </span>
  );
}
