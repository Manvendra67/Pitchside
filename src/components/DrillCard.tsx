import { Clock, Package, Play, Users } from 'lucide-react';
import { forwardRef } from 'react';
import { Link } from 'react-router';
import { POSITION_BY_ID } from '@/data/positions';
import type { Drill } from '@/lib/types';
import { ButtonLink } from './Button';
import { DrillDiagram } from './DrillDiagram';
import { CategoryTag, CoachBadge, FeedbackTag, LevelTag } from './Tags';

interface Props {
  drill: Drill;
  done?: number;
  hidden?: boolean;
}

/**
 * Library card. Clear hierarchy: diagram → what it is → how long / what
 * you need → one big Start button. Hovering lifts the card, draws the
 * movement path and reveals the equipment list.
 */
export const DrillCard = forwardRef<HTMLElement, Props>(function DrillCard({ drill, done = 0, hidden }, ref) {
  const positions = drill.positions.length === 5 ? 'All positions' : drill.positions.map((p) => POSITION_BY_ID[p].short).join(' · ');
  const requested = drill.source.type === 'player-feedback';

  return (
    <article
      ref={ref}
      className={`drill-card${requested ? ' drill-card--requested' : ''}`}
      data-flip-id={drill.id}
      hidden={hidden}
      onMouseEnter={(e) => e.currentTarget.classList.add('is-hot')}
      onMouseLeave={(e) => e.currentTarget.classList.remove('is-hot')}
      onFocus={(e) => e.currentTarget.classList.add('is-hot')}
      onBlur={(e) => e.currentTarget.classList.remove('is-hot')}
    >
      <div className="drill-card__art">
        <DrillDiagram diagram={drill.diagram} />
        <div className="drill-card__art-top">
          <LevelTag level={drill.level} />
          {done > 0 && <span className="drill-card__done">Done ×{done}</span>}
        </div>
        {requested && (
          <div className="drill-card__ribbon">
            <FeedbackTag label="Player requested" />
          </div>
        )}
      </div>
      <div className="drill-card__body">
        <CategoryTag id={drill.category} />
        <h3 className="drill-card__title">
          <Link to={`/drills/${drill.id}`} className="drill-card__link" data-cursor="Open">
            {drill.name}
          </Link>
        </h3>
        <p className="drill-card__summary">{drill.summary}</p>
        <ul className="drill-card__meta">
          <li>
            <Clock size={15} aria-hidden="true" />
            {drill.duration} min
          </li>
          <li>
            <Users size={15} aria-hidden="true" />
            {positions}
          </li>
          <li className="drill-card__equip">
            <Package size={15} aria-hidden="true" />
            <span>{drill.equipment.join(', ')}</span>
          </li>
        </ul>
        <div className="drill-card__foot">
          <CoachBadge compact />
          <ButtonLink
            to={`/drills/${drill.id}?start=1`}
            variant="primary"
            size="md"
            iconLeft={<Play size={16} />}
            aria-label={`Start drill: ${drill.name}`}
          >
            Start Drill
          </ButtonLink>
        </div>
      </div>
    </article>
  );
});
