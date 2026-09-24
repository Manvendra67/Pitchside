import { Sparkles } from 'lucide-react';
import { COACH } from '@/data/coach';
import { CATEGORY_BY_ID, LEVEL_BY_ID } from '@/data/positions';
import type { CategoryId, Level } from '@/lib/types';
import { LevelBars } from './Glyphs';

/** "Reviewed by Coach Ranvir" — on every drill. */
export function CoachBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="coach-badge" title={`Reviewed by ${COACH.name}`}>
      <span className="coach-badge__avatar" aria-hidden="true">
        {COACH.initials}
        <span className="coach-badge__tick">
          <svg viewBox="0 0 12 12" width="8" height="8">
            <path
              d="M2.5 6.2l2.3 2.3 4.7-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span>{compact ? 'Coach reviewed' : `Reviewed by ${COACH.name}`}</span>
    </span>
  );
}

export function FeedbackTag({ label = 'New from player feedback' }: { label?: string }) {
  return (
    <span className="feedback-tag">
      <Sparkles size={13} aria-hidden="true" />
      {label}
    </span>
  );
}

export function CategoryTag({ id }: { id: CategoryId }) {
  const c = CATEGORY_BY_ID[id];
  return (
    <span className="cat-tag" style={{ ['--tone' as string]: `var(${c.tone})` }}>
      <i aria-hidden="true" />
      {c.name}
    </span>
  );
}

export function LevelTag({ level }: { level: Level }) {
  const l = LEVEL_BY_ID[level];
  return (
    <span className="level-tag">
      <LevelBars level={l.bars as 1 | 2 | 3} />
      {l.name}
    </span>
  );
}
