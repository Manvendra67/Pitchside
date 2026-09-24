import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '@/components/Button';
import { Counter } from '@/components/Counter';
import { DrillCard } from '@/components/DrillCard';
import { PageHeader } from '@/components/PageHeader';
import { Segmented } from '@/components/Segmented';
import { COACH } from '@/data/coach';
import { DRILLS, FEEDBACK_DRILLS } from '@/data/drills';
import { CATEGORIES, LEVELS, POSITIONS } from '@/data/positions';
import { activeFilterCount, EMPTY_FILTERS, filterDrills, type DrillFilters } from '@/lib/drillFilter';
import { useDocumentTitle } from '@/lib/hooks';
import { EASE, Flip, gsap, prefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { useStore } from '@/lib/store';
import type { CategoryId, Level, PositionId } from '@/lib/types';
import '@/styles/pages.css';

function readFilters(params: URLSearchParams): DrillFilters {
  const category = params.get('category') as CategoryId | null;
  const position = params.get('position') as PositionId | null;
  const level = params.get('level') as Level | null;
  return {
    category: category && CATEGORIES.some((c) => c.id === category) ? category : 'all',
    position: position && POSITIONS.some((p) => p.id === position) ? position : 'all',
    level: level && LEVELS.some((l) => l.id === level) ? level : 'all',
    query: params.get('q') ?? '',
    requested: params.get('requested') === '1',
  };
}

function writeFilters(f: DrillFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category !== 'all') p.set('category', f.category);
  if (f.position !== 'all') p.set('position', f.position);
  if (f.level !== 'all') p.set('level', f.level);
  if (f.query.trim()) p.set('q', f.query);
  if (f.requested) p.set('requested', '1');
  return p;
}

/**
 * The drill library. Filters live in the URL so any view can be linked to.
 * Every card stays in the DOM; filtering toggles them and GSAP Flip glides
 * the survivors into their new places while leavers fade out — no teleports.
 */
export default function Drills() {
  useDocumentTitle('Drills');
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const filtersKey = params.toString();
  const { activity, profile } = useStore();
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  // `filters` is derived from the query string, so keying memos on it is exact.
  const visible = useMemo(() => new Set(filterDrills(DRILLS, filters).map((d) => d.id)), [filtersKey]);
  const doneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(activity).forEach((day) => day.drills.forEach((d) => (counts[d.id] = (counts[d.id] ?? 0) + 1)));
    return counts;
  }, [activity]);

  const update = (patch: Partial<DrillFilters>) => {
    if (grid.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(grid.current.querySelectorAll('.drill-card'), { props: 'opacity' });
    }
    // Merge into the live URL, not this render's copy, so quick taps never undo each other.
    const latest = readFilters(new URLSearchParams(window.location.search));
    setParams(writeFilters({ ...latest, ...patch }), { replace: true, preventScrollReset: true });
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.62,
      ease: EASE,
      absolute: true,
      scale: true,
      stagger: 0.015,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: EASE, delay: 0.12, stagger: 0.03 },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' }),
    });
  }, [filtersKey]);

  const count = visible.size;
  const active = activeFilterCount(filters);
  const catCounts = useMemo(() => {
    const base = { ...filters, category: 'all' as const };
    const inScope = filterDrills(DRILLS, base);
    return Object.fromEntries(CATEGORIES.map((c) => [c.id, inScope.filter((d) => d.category === c.id).length]));
  }, [filtersKey]);

  return (
    <div ref={root} className="page drills">
      <PageHeader
        eyebrow="Drill library"
        title={
          <>
            Train like it <span className="serif">matters.</span>
          </>
        }
        sub={`${DRILLS.length} drills for every position, all reviewed by ${COACH.name}. Pick one and press start.`}
      />

      <Link to="/coach?tab=ideas" className="drills-feedback" data-reveal="up">
        <span className="drills-feedback__icon">
          <Sparkles size={20} />
        </span>
        <span>
          <b>{FEEDBACK_DRILLS.length} drills came from player ideas.</b> Got one? Tell {COACH.name} what you want next.
        </span>
        <ArrowRight size={18} className="drills-feedback__arrow" />
      </Link>

      <section className="drill-filters" aria-label="Filter drills" data-reveal="up">
        <div className="drill-filters__top">
          <div className="search">
            <Search size={18} />
            <label htmlFor="drill-search" className="visually-hidden">
              Search drills
            </label>
            <input
              id="drill-search"
              className="input"
              type="search"
              placeholder="Search drills, like “wall” or “shooting”"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
            />
          </div>
          <button
            type="button"
            className="choice drill-filters__requested"
            aria-pressed={filters.requested}
            onClick={() => update({ requested: !filters.requested })}
          >
            <Sparkles size={16} /> Player requested
          </button>
        </div>
        <div className="drill-filters__row">
          <span className="drill-filters__label">Category</span>
          <Segmented
            label="Category"
            scroll
            tone="ghost"
            value={filters.category}
            onChange={(v) => update({ category: v })}
            options={[
              { value: 'all', label: 'All', count: filterDrills(DRILLS, { ...filters, category: 'all' }).length },
              ...CATEGORIES.map((c) => ({ value: c.id, label: c.name, count: catCounts[c.id] })),
            ]}
          />
        </div>
        <div className="drill-filters__split">
          <div className="drill-filters__row">
            <span className="drill-filters__label">Position</span>
            <Segmented
              label="Position"
              scroll
              size="sm"
              value={filters.position}
              onChange={(v) => update({ position: v })}
              options={[{ value: 'all', label: 'All' }, ...POSITIONS.map((p) => ({ value: p.id, label: p.short, aria: p.name }))]}
            />
            {filters.position === 'all' && (
              <button type="button" className="text-link drill-filters__mine" onClick={() => update({ position: profile.position })}>
                Just my position
              </button>
            )}
          </div>
          <div className="drill-filters__row">
            <span className="drill-filters__label">Level</span>
            <Segmented
              label="Level"
              scroll
              size="sm"
              value={filters.level}
              onChange={(v) => update({ level: v })}
              options={[{ value: 'all', label: 'All' }, ...LEVELS.map((l) => ({ value: l.id, label: l.name }))]}
            />
          </div>
        </div>
      </section>

      <div className="drill-results" aria-live="polite">
        <p>
          <Counter value={count} fromZero={false} duration={0.4} className="drill-results__num" /> {count === 1 ? 'drill' : 'drills'}
          {active > 0 && ' match'}
        </p>
        {active > 0 && (
          <Button variant="ghost" size="sm" iconLeft={<X size={16} />} onClick={() => update(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>

      <h2 className="visually-hidden">Drills</h2>
      <div ref={grid} className="drill-grid">
        {DRILLS.map((d) => (
          <DrillCard key={d.id} drill={d} hidden={!visible.has(d.id)} done={doneCounts[d.id]} />
        ))}
      </div>

      {count === 0 && (
        <div className="drill-empty">
          <p className="h3">No drills match that.</p>
          <p className="muted">Try clearing a filter — or ask {COACH.name} for a new drill.</p>
          <div className="drill-empty__actions">
            <Button variant="primary" onClick={() => update(EMPTY_FILTERS)}>
              Clear filters
            </Button>
            <Link to="/coach?tab=ideas" className="text-link">
              Suggest a drill <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
