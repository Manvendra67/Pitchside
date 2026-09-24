import { useId } from 'react';
import type { DrillDiagram as Diagram } from '@/lib/types';

interface Props {
  diagram: Diagram;
  /** Loop a ball along the movement path (detail view). */
  live?: boolean;
  className?: string;
  title?: string;
}

/**
 * A tiny coaching-board diagram: mowed grass, cones, players and the
 * movement path. The path draws itself when the parent card is hovered
 * (`.is-hot`) or when `live` is on.
 */
export function DrillDiagram({ diagram, live = false, className = '', title }: Props) {
  const id = useId().replace(/:/g, '');
  const { cones = [], path, player, partner, goal, wall } = diagram;

  return (
    <svg
      className={`diagram${live ? ' diagram--live' : ''} ${className}`}
      viewBox="0 0 100 64"
      preserveAspectRatio="xMidYMid slice"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={`mow-${id}`} width="16" height="64" patternUnits="userSpaceOnUse">
          <rect width="8" height="64" fill="var(--dg-grass-a)" />
          <rect x="8" width="8" height="64" fill="var(--dg-grass-b)" />
        </pattern>
        <radialGradient id={`glow-${id}`} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".12" />
          <stop offset="100%" stopColor="#000" stopOpacity=".18" />
        </radialGradient>
        <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M1 1l7 4-7 4" fill="none" stroke="var(--dg-path)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <rect width="100" height="64" fill={`url(#mow-${id})`} />
      <rect width="100" height="64" fill={`url(#glow-${id})`} />
      <rect x="3" y="3" width="94" height="58" rx="2" fill="none" stroke="var(--dg-line)" strokeWidth=".5" />
      <path d="M50 3v58" stroke="var(--dg-line)" strokeWidth=".4" opacity=".6" />
      <circle cx="50" cy="32" r="8" fill="none" stroke="var(--dg-line)" strokeWidth=".4" opacity=".6" />

      {goal && (
        <g className="diagram__goal" stroke="var(--dg-line-strong)" strokeWidth=".8" fill="none">
          {goal === 'right' ? (
            <>
              <rect x="84" y="20" width="13" height="24" />
              <path d="M97 22v20" strokeWidth="2.2" stroke="#fff" />
            </>
          ) : (
            <>
              <rect x="3" y="20" width="13" height="24" />
              <path d="M3 22v20" strokeWidth="2.2" stroke="#fff" />
            </>
          )}
        </g>
      )}
      {wall === 'right' && <rect x="92" y="6" width="4" height="52" rx="1" fill="var(--dg-wall)" />}
      {wall === 'top' && <rect x="6" y="4" width="88" height="4" rx="1" fill="var(--dg-wall)" />}

      <path
        className="diagram__trail"
        d={path}
        fill="none"
        stroke="var(--dg-path)"
        strokeWidth=".9"
        strokeDasharray="1.6 1.8"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        className="diagram__path"
        d={path}
        fill="none"
        stroke="var(--dg-path)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        markerEnd={`url(#arrow-${id})`}
      />

      {cones.map(([x, y], i) => (
        <g key={i} className="diagram__cone" style={{ ['--i' as string]: i }} transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="1.6" rx="2.6" ry="1" fill="rgba(0,0,0,.25)" />
          <path d="M-1 -2.6h2l1.6 4.2h-5.2z" fill="var(--dg-cone)" />
        </g>
      ))}

      {partner && (
        <g transform={`translate(${partner[0]} ${partner[1]})`}>
          <circle r="3.2" fill="var(--dg-partner)" stroke="rgba(0,0,0,.25)" strokeWidth=".5" />
        </g>
      )}
      <g transform={`translate(${player[0]} ${player[1]})`}>
        <circle r="5.2" fill="var(--dg-player)" opacity=".22" className="diagram__halo" />
        <circle r="3.4" fill="var(--dg-player)" stroke="rgba(0,0,0,.3)" strokeWidth=".5" />
      </g>

      {live && (
        <circle r="1.9" fill="#fff" stroke="#0b1510" strokeWidth=".5" className="diagram__ball">
          <animateMotion
            dur="3.4s"
            repeatCount="indefinite"
            path={path}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.45 0 0.35 1"
          />
        </circle>
      )}
    </svg>
  );
}
