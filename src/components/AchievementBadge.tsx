import type { Achievement } from '@/lib/achievements';

const SHAPES = {
  circle: 'M24 3a21 21 0 1 1 0 42 21 21 0 0 1 0-42z',
  hex: 'M24 2.5l18.6 10.75v21.5L24 45.5 5.4 34.75v-21.5z',
  shield: 'M24 3l18 6v14c0 11-7.6 18.6-18 22-10.4-3.4-18-11-18-22V9z',
};

/** Tasteful milestone badge: a crest shape with a stitched inner line. */
export function AchievementBadge({
  achievement,
  unlocked,
  size = 64,
  progress = 1,
}: {
  achievement: Achievement;
  unlocked: boolean;
  size?: number;
  progress?: number;
}) {
  const d = SHAPES[achievement.shape];
  return (
    <span className={`badge${unlocked ? ' badge--on' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={`bg-${achievement.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={unlocked ? 'var(--badge-a)' : 'var(--badge-off-a)'} />
            <stop offset="1" stopColor={unlocked ? 'var(--badge-b)' : 'var(--badge-off-b)'} />
          </linearGradient>
        </defs>
        <path d={d} fill={`url(#bg-${achievement.id})`} />
        <path
          d={d}
          fill="none"
          stroke={unlocked ? 'var(--volt-400)' : 'var(--badge-off-line)'}
          strokeWidth="1.2"
          strokeDasharray="2 2.2"
          transform="translate(24 24) scale(.84) translate(-24 -24)"
        />
        {!unlocked && progress > 0 && (
          <path
            d={d}
            fill="none"
            stroke="var(--pitch-400)"
            strokeWidth="2.2"
            pathLength={1}
            strokeDasharray={`${progress} 1`}
            strokeLinecap="round"
          />
        )}
        <text
          x="24"
          y="25"
          textAnchor="middle"
          dominantBaseline="central"
          className="badge__mark"
          fill={unlocked ? 'var(--volt-400)' : 'var(--badge-off-text)'}
        >
          {achievement.mark}
        </text>
      </svg>
    </span>
  );
}
