import { Check, Minus, Plus } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { GOALS, LEVELS, POSITIONS, WEEKDAYS, WEEKDAYS_LONG } from '@/data/positions';
import { clampWeight, WEIGHT_MAX, WEIGHT_MIN } from '@/lib/nutrition';
import type { GoalId, Level, PositionId, Weekday } from '@/lib/types';
import { Counter } from './Counter';
import { LevelBars } from './Glyphs';

/** Roving-focus helper for radio-style card groups. */
function onArrow(e: KeyboardEvent<HTMLElement>, count: number, index: number, pick: (i: number) => void) {
  const cols = e.currentTarget.parentElement ? getComputedStyle(e.currentTarget.parentElement).gridTemplateColumns.split(' ').length : 1;
  let next = index;
  if (e.key === 'ArrowRight') next = index + 1;
  else if (e.key === 'ArrowLeft') next = index - 1;
  else if (e.key === 'ArrowDown') next = index + cols;
  else if (e.key === 'ArrowUp') next = index - cols;
  else return;
  e.preventDefault();
  next = (next + count) % count;
  pick(next);
  const sibling = e.currentTarget.parentElement?.children[next] as HTMLElement | undefined;
  sibling?.focus();
}

export function MiniPitch({ spot, active }: { spot: [number, number]; active?: boolean }) {
  return (
    <svg className="mini-pitch" viewBox="0 0 100 64" aria-hidden="true">
      <rect x="2" y="2" width="96" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M50 2v60" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="18" width="12" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="86" y="18" width="12" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle className="mini-pitch__halo" cx={spot[0]} cy={spot[1]} r="9" fill="var(--volt-400)" opacity={active ? 0.3 : 0} />
      <circle
        cx={spot[0]}
        cy={spot[1]}
        r="5"
        fill={active ? 'var(--volt-400)' : 'currentColor'}
        stroke="var(--pick-bg, #05120c)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

interface PickerProps<T> {
  value?: T;
  /** Selection changed (click or arrow keys). */
  onChange: (v: T) => void;
  /** A deliberate click or tap — used by onboarding to move on automatically. */
  onCommit?: (v: T) => void;
}

export function PositionPicker({ value, onChange, onCommit }: PickerProps<PositionId>) {
  return (
    <div className="pick-grid pick-grid--positions" role="radiogroup" aria-label="Position">
      {POSITIONS.map((p, i) => {
        const on = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || (!value && i === 0) ? 0 : -1}
            className="pick-card pick-card--position"
            onClick={() => (onCommit ?? onChange)(p.id)}
            onKeyDown={(e) => onArrow(e, POSITIONS.length, i, (n) => onChange(POSITIONS[n].id))}
          >
            <MiniPitch spot={p.spot} active={on} />
            <span className="pick-card__name">{p.name}</span>
            <span className="pick-card__blurb">{p.blurb}</span>
            <span className="pick-card__tick" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function LevelPicker({ value, onChange, onCommit }: PickerProps<Level>) {
  return (
    <div className="pick-grid pick-grid--levels" role="radiogroup" aria-label="Skill level">
      {LEVELS.map((l, i) => {
        const on = value === l.id;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || (!value && i === 0) ? 0 : -1}
            className="pick-card pick-card--level"
            onClick={() => (onCommit ?? onChange)(l.id)}
            onKeyDown={(e) => onArrow(e, LEVELS.length, i, (n) => onChange(LEVELS[n].id))}
          >
            <LevelBars level={l.bars as 1 | 2 | 3} className="pick-card__bars" />
            <span className="pick-card__name">{l.name}</span>
            <span className="pick-card__blurb">{l.blurb}</span>
            <span className="pick-card__tick" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Big −/+ stepper plus a slider. Pointer presses repeat while held;
 * keyboard and assistive-tech clicks (detail === 0) step once.
 */
export function WeightControl({ value, onChange, id = 'weight' }: { value: number; onChange: (kg: number) => void; id?: string }) {
  const hold = useRef<number | undefined>(undefined);
  const set = (kg: number) => onChange(clampWeight(kg));
  const startHold = (delta: number) => {
    let current = value;
    const step = () => {
      current = clampWeight(current + delta);
      onChange(current);
    };
    step();
    hold.current = window.setTimeout(function repeat() {
      step();
      hold.current = window.setTimeout(repeat, 90);
    }, 420);
  };
  const stopHold = () => window.clearTimeout(hold.current);
  const pct = ((value - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100;

  return (
    <div className="weight">
      <div className="stepper">
        <button
          type="button"
          className="stepper__btn"
          aria-label="Decrease weight by 1 kilogram"
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onClick={(e) => e.detail === 0 && set(value - 1)}
        >
          <Minus size={26} />
        </button>
        <output className="stepper__value" htmlFor={id} aria-live="polite">
          <Counter value={value} decimals={Number.isInteger(value) ? 0 : 1} fromZero={false} duration={0.35} className="num" />
          <span className="stepper__unit">kg</span>
        </output>
        <button
          type="button"
          className="stepper__btn"
          aria-label="Increase weight by 1 kilogram"
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onClick={(e) => e.detail === 0 && set(value + 1)}
        >
          <Plus size={26} />
        </button>
      </div>
      <label className="visually-hidden" htmlFor={id}>
        Body weight in kilograms
      </label>
      <input
        id={id}
        className="range"
        type="range"
        min={WEIGHT_MIN}
        max={WEIGHT_MAX}
        step={0.5}
        value={value}
        style={{ ['--p' as string]: `${pct}%` }}
        onChange={(e) => set(Number(e.target.value))}
      />
      <div className="weight__scale" aria-hidden="true">
        <span>{WEIGHT_MIN} kg</span>
        <span>{WEIGHT_MAX} kg</span>
      </div>
    </div>
  );
}

export function DayPicker({ value, onChange }: { value: Weekday[]; onChange: (d: Weekday[]) => void }) {
  const toggle = (d: Weekday) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b));
  return (
    <div className="day-picker" role="group" aria-label="Training days">
      {WEEKDAYS.map((label, i) => {
        const d = i as Weekday;
        const on = value.includes(d);
        return (
          <button
            key={label}
            type="button"
            className="day-picker__day"
            aria-pressed={on}
            aria-label={WEEKDAYS_LONG[i]}
            onClick={() => toggle(d)}
          >
            {label.slice(0, 1)}
            <small>{label}</small>
          </button>
        );
      })}
    </div>
  );
}

export function GoalPicker({ value, onChange }: { value: GoalId[]; onChange: (g: GoalId[]) => void }) {
  return (
    <div className="chip-row" role="group" aria-label="Training goals">
      {GOALS.map((g) => {
        const on = value.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            className="choice"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== g.id) : [...value, g.id])}
          >
            <span className="choice__check" aria-hidden="true">
              <Check size={16} strokeWidth={3} />
            </span>
            {g.name}
          </button>
        );
      })}
    </div>
  );
}

export function AgePicker({ value, onChange }: { value?: number; onChange: (a?: number) => void }) {
  return (
    <div className="chip-row" role="radiogroup" aria-label="Age">
      {[8, 9, 10, 11, 12, 13].map((age) => (
        <button
          key={age}
          type="button"
          role="radio"
          aria-checked={value === age}
          className="choice choice--num"
          onClick={() => onChange(value === age ? undefined : age)}
        >
          {age}
        </button>
      ))}
    </div>
  );
}
